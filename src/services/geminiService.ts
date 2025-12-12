/**
 * Gemini Service
 *
 * Frontend-tjänst för AI-interaktioner.
 * Alla API-anrop går via Cloud Functions för säkerhet.
 */

import { KNOWLEDGE_ARTICLES, CRITICAL_WARNINGS } from '@/constants/constants';
import { ACTIVE_PROMPTS } from '@/config/prompts';
import { getAIModelVersion } from './featureFlagService';
import { buildPersonalizedPrompt, type DialectId } from './promptBuilder';
import { Task, TaskStatus, ProjectType, PROJECT_PHASES, CostType, Priority, ShoppingItem, VehicleData } from '@/types/types';
import {
  sendChatMessage,
  parseInput,
  sendToolResponse,
  type ChatMessage,
  type ChatResponse
} from './aiProxyService';
import { performDeepResearch } from './firebaseAIService';

// Flatten all phases for context
const ALL_PHASES = [
  ...PROJECT_PHASES.renovation,
  ...PROJECT_PHASES.conversion,
  ...PROJECT_PHASES.maintenance
];

/**
 * Get the active AI model version from feature flags
 */
const getModelName = (): string => {
  return getAIModelVersion();
};

// --- CONTEXT BUILDERS ---

const createTaskContext = (tasks: Task[], shoppingList: ShoppingItem[]): string => {
  let context = "\n\n=== 3. AKTUELL PROJEKTSTATUS (DATA) ===\n";

  const phases = Array.from(new Set(tasks.map(t => t.phase)));
  phases.forEach(phase => {
    const phaseTasks = tasks.filter(t => t.phase === phase);
    if (phaseTasks.length > 0) {
      context += `\n--- ${phase.toUpperCase()} ---\n`;
      phaseTasks.forEach(task => {
        const statusIcon = task.status === TaskStatus.DONE ? '✅' : task.status === TaskStatus.IN_PROGRESS ? '🚧' : '⬜️';
        context += `${statusIcon} UPPGIFT: ${task.title} (ID: ${task.id})\n`;
        context += `   Status: ${task.status} | Prio: ${task.priority || 'Normal'}\n`;
        context += `   Beskrivning: ${task.description}\n`;
        context += `   Ekonomi: Estimat ${task.estimatedCostMin}-${task.estimatedCostMax} kr | Spenderat ${task.actualCost} kr\n`;
        context += '\n';
      });
    }
  });
  return context;
};

const createKnowledgeContext = (vehicleData?: VehicleData): string => {
  let context = "\n\n=== 2. KUNSKAPSBANK & RAPPORTER (FAKTA) ===\n";

  // Inject dynamic warnings based on vehicle data
  if (vehicleData) {
    CRITICAL_WARNINGS.forEach(warning => {
      if (warning.condition(vehicleData)) {
        context += `>>> KRITISK VARNING (BASERAT PÅ DIN BIL): ${warning.title} <<<\n`;
        context += `${warning.content}\n`;
        context += `--------------------------------------------------\n`;
      }
    });
  }

  KNOWLEDGE_ARTICLES.forEach(article => {
    context += `>>> ARTIKEL: ${article.title} (ID: ${article.id}) <<<\n`;
    context += `Sammanfattning: ${article.summary}\n`;
    context += `INNEHÅLL:\n${article.content}\n`;
    context += `--------------------------------------------------\n`;
  });
  return context;
};

// --- MAIN CHAT FUNCTION ---

/**
 * Send message to AI and process response with tool calling
 *
 * Note: Cloud Functions don't support true streaming, so we simulate
 * it by calling onChunk with the full response after completion.
 */
export const streamGeminiResponse = async (
  history: { role: 'user' | 'model'; content: string; image?: string }[],
  newMessage: string,
  vehicleData: VehicleData,
  currentTasks: Task[],
  currentShoppingList: ShoppingItem[],
  onChunk: (text: string) => void,
  onToolCall: (toolCalls: any[]) => Promise<any[]>,
  imageBase64?: string,
  projectName?: string,
  userSkillLevel?: string,
  projectType?: ProjectType
) => {
  const model = getModelName();

  // Build personalized persona
  const dialectId: DialectId = 'standard';
  const personalizedPersona = buildPersonalizedPrompt(vehicleData, dialectId, projectName);

  // Build skill level context
  const skillLevelContext = userSkillLevel
    ? `\n\n=== ANVÄNDARENS KUNSKAPSNIVÅ ===\n${userSkillLevel === 'beginner'
      ? 'NYBÖRJARE: Förklara allt tydligt, ge detaljerade steg-för-steg instruktioner.'
      : userSkillLevel === 'intermediate'
        ? 'HEMMAMECK: Balansera mellan DIY och verkstad. Ge praktiska tips.'
        : 'CERTIFIERAD: Teknisk och koncis. Fokusera på specs och momentvärden.'
    }`
    : '';

  // Build project type context
  const projectTypeContext = projectType
    ? `\n\n=== PROJEKTTYP ===\n${projectType === 'renovation'
      ? 'RENOVERING: Fokus på att återställa till ursprungligt skick.'
      : projectType === 'conversion'
        ? 'OMBYGGNAD (CAMPER): Fokus på camper-ombyggnad.'
        : 'FÖRVALTNING: Fokus på löpande underhåll och service.'
    }`
    : '';

  const fullSystemInstruction =
    `SYSTEM: ${personalizedPersona}

    ${ACTIVE_PROMPTS.baseSystemPrompt}

    ${skillLevelContext}
    ${projectTypeContext}

    \n\n=== 1. FORDONSDATA (SPECIFIKATIONER) ===
    ${JSON.stringify(vehicleData, null, 2)}` +
    createKnowledgeContext(vehicleData) +
    createTaskContext(currentTasks, currentShoppingList) +
    `\n\n=== INSTRUKTIONER ===
    Använd verktygen för att ändra i databasen.
    Om användaren skickar en bild på en inköpslista, använd 'addToShoppingList' för varje rad.
    Sök på Google för priser om det saknas.`;

  try {
    // Convert history to ChatMessage format
    const chatHistory: ChatMessage[] = history.map(h => ({
      role: h.role,
      content: h.content,
      image: h.image
    }));

    // Send message via Cloud Function
    let response: ChatResponse = await sendChatMessage(
      chatHistory,
      newMessage,
      fullSystemInstruction,
      imageBase64,
      model
    );

    // Output text response
    if (response.text) {
      onChunk(response.text);
    }

    // Handle function calls
    if (response.functionCalls && response.functionCalls.length > 0) {
      const toolResults = await onToolCall(response.functionCalls);

      // Send tool responses back to AI
      const updatedHistory: ChatMessage[] = [
        ...chatHistory,
        { role: 'user', content: newMessage },
        { role: 'model', content: response.text || '' }
      ];

      const toolResponse = await sendToolResponse(
        updatedHistory,
        toolResults.map(r => ({ name: r.name, result: r.result })),
        fullSystemInstruction,
        model
      );

      // Output the follow-up response
      if (toolResponse.text) {
        onChunk(toolResponse.text);
      }
    }

  } catch (error) {
    console.error("Gemini Error:", error);
    onChunk("\n⚠️ Kunde inte nå AI-mekanikern just nu.");
  }
};

// --- PARSE FUNCTION ---

/**
 * Parse text or image into structured tasks and shopping items
 */
export const parseTasksFromInput = async (
  input: string,
  imageBase64?: string,
  vehicleData?: VehicleData
): Promise<{ tasks: Partial<Task>[], shoppingItems: Partial<ShoppingItem>[] }> => {
  try {
    const result = await parseInput(
      input,
      imageBase64,
      'Du är en expert på att strukturera projektdata för fordonsrenovering.'
    );

    return {
      tasks: (result.tasks || []) as Partial<Task>[],
      shoppingItems: (result.shoppingItems || []) as Partial<ShoppingItem>[]
    };
  } catch (error) {
    console.error("Gemini Parse Error:", error);
    return { tasks: [], shoppingItems: [] };
  }
};

// --- ICON GENERATION (DISABLED) ---

/**
 * Generate vehicle icon - Currently disabled
 */
export const generateVehicleIcon = async (
  vehicleData: { make?: string; model?: string; year?: number; color?: string; imageBase64?: string },
  retryCount: number = 2
): Promise<string | null> => {
  console.warn('⚠️ AI Icon Generation is currently disabled - waiting for SDK support');
  console.warn('   Users can upload custom icons manually instead');
  return null;
};

// --- DEEP RESEARCH ---

/**
 * Perform deep research on a vehicle using multi-agent system
 */
export const generateProjectProfile = async (
  vehicleDescription: string,
  imageBase64?: string,
  projectType?: ProjectType,
  userSkillLevel?: string
): Promise<any> => {
  const finalProjectType = projectType || 'renovation';
  const finalSkillLevel = userSkillLevel || 'intermediate';

  try {
    // Get prompts for the agents
    const detectivePrompt = ACTIVE_PROMPTS.agents.detective.text(vehicleDescription, !!imageBase64);
    const plannerPrompt = ACTIVE_PROMPTS.agents.planner.text(
      '{}', // Vehicle data placeholder - detective will fill this
      finalProjectType,
      finalSkillLevel
    );

    // Call Cloud Function for deep research
    const result = await performDeepResearch(
      vehicleDescription,
      imageBase64,
      finalProjectType,
      finalSkillLevel,
      detectivePrompt,
      plannerPrompt
    );

    return result;

  } catch (error) {
    console.error("Deep Research Error:", error);

    // Return minimal fallback
    return {
      projectName: vehicleDescription.substring(0, 30) || 'Nytt Projekt',
      projectType: finalProjectType,
      vehicleData: {
        make: vehicleDescription.split(' ')[0] || 'Okänd',
        model: vehicleDescription.split(' ').slice(1).join(' ') || 'Modell',
        year: new Date().getFullYear() - 10
      },
      initialTasks: [],
      analysisReport: null,
      error: 'AI-tjänster otillgängliga'
    };
  }
};

// Re-export tools definition for backwards compatibility
export const tools = [
  { googleSearch: {} },
  {
    functionDeclarations: [
      { name: 'addTask', description: 'Add task to project' },
      { name: 'updateTask', description: 'Update existing task' },
      { name: 'deleteTask', description: 'Delete task' },
      { name: 'addToShoppingList', description: 'Add shopping item' },
      { name: 'registerPurchase', description: 'Mark item as purchased' },
      { name: 'updateShoppingItem', description: 'Update shopping item' },
      { name: 'deleteShoppingItem', description: 'Delete shopping item' },
      { name: 'createKnowledgeArticle', description: 'Save to knowledge base' }
    ]
  }
];

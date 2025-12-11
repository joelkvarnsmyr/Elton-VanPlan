
import { GoogleGenAI, GenerateContentResponse, Type, Schema, FunctionDeclaration, Tool } from "@google/genai";
import { KNOWLEDGE_ARTICLES, CRITICAL_WARNINGS } from '@/constants/constants';
import { ACTIVE_PROMPTS } from '@/config/prompts';
import { getAIModelVersion } from './featureFlagService';
import { buildPersonalizedPrompt, buildSoundDoctorPrompt, type DialectId } from './promptBuilder';
import { Task, TaskStatus, ProjectType, PROJECT_PHASES, CostType, Priority, ShoppingItem, VehicleData, Project, ServiceItem, FuelLogItem } from '@/types/types';
import { generateJSON, type AIResponse } from './aiService';
import { getLoadedApiKeys } from './secretService'; // Importerar den nya funktionen

let client: GoogleGenAI | null = null;

// Funktionen görs om till async för att kunna invänta API-nyckeln
const getClient = async (): Promise<GoogleGenAI | null> => {
  if (client) {
    return client;
  }

  const { geminiApiKey } = await getLoadedApiKeys();

  if (!geminiApiKey) {
    console.warn("API Key missing for Gemini. Please set VITE_GEMINI_API_KEY.");
    return null;
  }
  
  client = new GoogleGenAI(geminiApiKey);
  return client;
};

/**
 * Get the active AI model version from feature flags
 * Allows dynamic model switching without code changes
 */
const getModelName = (): string => {
  return getAIModelVersion();
};

// --- TOOL DEFINITIONS ---

// Flatten all phases for the AI to choose from
const ALL_PHASES = [
    ...PROJECT_PHASES.renovation,
    ...PROJECT_PHASES.conversion, // Updated from build to conversion
    ...PROJECT_PHASES.maintenance
];

const functionDeclarations: FunctionDeclaration[] = [
    {
      name: 'addTask',
      description: 'Add a new task to the project plan. Use this when the user wants to do something new. Can include a checklist of steps.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'Short title of the task' },
          description: { type: Type.STRING, description: 'Detailed description of what needs to be done' },
          estimatedCostMax: { type: Type.NUMBER, description: 'Estimated maximum cost in SEK' },
          phase: { type: Type.STRING, enum: ALL_PHASES, description: 'Which project phase this belongs to' },
          priority: { type: Type.STRING, enum: Object.values(Priority), description: 'Priority: Hög (Safety/Legal), Medel (Function), Låg (Cosmetic)' },
          sprint: { type: Type.STRING, description: 'Sprint Name (e.g., "Sprint 1: Besiktning" or "Helgjobb")' },
          subtasks: { 
            type: Type.ARRAY, 
            description: 'List of steps/checklist items',
            items: { type: Type.STRING }
          }
        },
        required: ['title', 'description', 'phase']
      }
    },
    {
      name: 'updateTask',
      description: 'Update an existing task. Can change status, priority, sprint, title, description, or cost.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          taskTitleKeywords: { type: Type.STRING, description: 'Keywords to find the task (e.g., "kamrem")' },
          newStatus: { type: Type.STRING, enum: Object.values(TaskStatus), description: 'The new status (optional)' },
          newPriority: { type: Type.STRING, enum: Object.values(Priority), description: 'The new priority (optional)' },
          newSprint: { type: Type.STRING, description: 'Assign to a sprint (e.g., "Sprint 1") (optional)' },
          newTitle: { type: Type.STRING, description: 'Rename the task (optional)' },
          newDescription: { type: Type.STRING, description: 'New description (optional)' },
          newCost: { type: Type.NUMBER, description: 'New estimated cost (optional)' }
        },
        required: ['taskTitleKeywords']
      }
    },
    {
      name: 'deleteTask',
      description: 'Permanently delete a task from the project.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          taskTitleKeywords: { type: Type.STRING, description: 'Keywords to find the task to delete' }
        },
        required: ['taskTitleKeywords']
      }
    },
    {
      name: 'addToShoppingList',
      description: 'Add an item to the separate shopping list (inköpslista).',
      parameters: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'Name of the item (e.g. "Motorolja 10W-40")' },
          category: { type: Type.STRING, description: 'Category: Reservdelar, Kemi & Färg, Verktyg, Inredning, Övrigt' },
          estimatedCost: { type: Type.NUMBER, description: 'Estimated cost in SEK' },
          quantity: { type: Type.STRING, description: 'Quantity (e.g. "4 liter", "1 st")' }
        },
        required: ['name']
      }
    },
    {
      name: 'registerPurchase',
      description: 'Mark a shopping item as purchased and record the actual cost. Finds item by name.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          itemNameKeywords: { type: Type.STRING, description: 'Keywords to find the shopping item (e.g. "motorolja")' },
          actualCost: { type: Type.NUMBER, description: 'The actual price paid in SEK' },
          store: { type: Type.STRING, description: 'Where it was bought (e.g. "Biltema")' },
          date: { type: Type.STRING, description: 'Date of purchase (YYYY-MM-DD)' }
        },
        required: ['itemNameKeywords', 'actualCost']
      }
    },
    {
      name: 'updateShoppingItem',
      description: 'Update details of a shopping item (rename, change quantity, change category, change cost).',
      parameters: {
        type: Type.OBJECT,
        properties: {
          itemNameKeywords: { type: Type.STRING, description: 'Keywords to find the item' },
          newName: { type: Type.STRING, description: 'New name (optional)' },
          newQuantity: { type: Type.STRING, description: 'New quantity (optional)' },
          newCategory: { type: Type.STRING, description: 'New category (optional)' },
          newCost: { type: Type.NUMBER, description: 'New estimated cost (optional)' }
        },
        required: ['itemNameKeywords']
      }
    },
    {
      name: 'deleteShoppingItem',
      description: 'Permanently remove an item from the shopping list.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          itemNameKeywords: { type: Type.STRING, description: 'Keywords to find the item to delete' }
        },
        required: ['itemNameKeywords']
      }
    },
    {
        name: 'createKnowledgeArticle',
        description: 'Save important information, guides, or report summaries into the Knowledge Base (Kunskapsbank).',
        parameters: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: 'Title of the article' },
                summary: { type: Type.STRING, description: 'Short summary' },
                content: { type: Type.STRING, description: 'Full content in Markdown format' },
                tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Tags like Motor, El, Guide' }
            },
            required: ['title', 'content']
        }
    }
];

export const tools: Tool[] = [
  { googleSearch: {} }, 
  { functionDeclarations: functionDeclarations }
];

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

export const streamGeminiResponse = async (
  history: { role: 'user' | 'model'; content: string; image?: string }[],
  newMessage: string,
  vehicleData: VehicleData,
  currentTasks: Task[],
  currentShoppingList: ShoppingItem[],
  onChunk: (text: string) => void,
  onToolCall: (toolCalls: any[]) => Promise<any[]>,
  imageBase64?: string,
  projectName?: string,  // Optional project name (vehicle nickname)
  userSkillLevel?: string,  // Optional user skill level
  projectType?: ProjectType  // Optional project type
) => {
  const ai = await getClient();
    if (!ai) {
        onChunk("\n⚠️ Kunde inte nå AI-mekanikern just nu. API-nyckel saknas eller är ogiltig.");
        return;
    }
  const model = getModelName();

  // DYNAMIC VEHICLE-SPECIFIC PERSONA
  // Get dialect from user settings (default to 'standard' if not provided)
  const dialectId: DialectId = 'standard'; // TODO: Get from user settings in future
  const personalizedPersona = buildPersonalizedPrompt(vehicleData, dialectId, projectName);

  // Build skill level context
  const skillLevelContext = userSkillLevel
    ? `\n\n=== ANVÄNDARENS KUNSKAPSNIVÅ ===\n${userSkillLevel === 'beginner'
        ? 'NYBÖRJARE: Förklara allt tydligt, ge detaljerade steg-för-steg instruktioner. Länka guider och videor. Förklara alla tekniska termer. Fråga om användaren vill göra själv eller lämna på verkstad.'
        : userSkillLevel === 'intermediate'
        ? 'HEMMAMECK: Balansera mellan DIY och verkstad. Ge praktiska tips och varningar. Anta viss grundläggande kunskap men förklara fordonspecifika detaljer.'
        : 'CERTIFIERAD: Teknisk och koncis. Användaren är expert - fokusera på specs, momentvärden och fordonspecifik data. Inga grundläggande förklaringar.'
      }`
    : '';

  // Build project type context
  const projectTypeContext = projectType
    ? `\n\n=== PROJEKTTYP ===\n${projectType === 'renovation'
        ? 'RENOVERING: Fokus på att återställa till ursprungligt skick. Prioritera säkerhet och funktion.'
        : projectType === 'conversion'
        ? 'OMBYGGNAD (CAMPER): Fokus på att bygga om till camper. Tänk på isolering, inredning, el-system, vatten och viktökningar.'
        : 'FÖRVALTNING: Fokus på löpande underhåll och service. Förebyggande åtgärder och serviceplan.'
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
    const chat = ai.getGenerativeModel({ 
        model,
        generationConfig: {},
        safetySettings: [],
        tools: tools,
        systemInstruction: fullSystemInstruction
    }).startChat({
        history: history.map(h => {
            const parts: any[] = [{ text: h.content }];
            if (h.image) {
                parts.push({ inlineData: { mimeType: 'image/jpeg', data: h.image.split(',')[1] } }); // Assuming stored as dataURI
            }
            return {
              role: h.role,
              parts: parts,
            };
        }),
    });

    const parts: any[] = [{ text: newMessage }];
    if (imageBase64) {
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } });
    }

    const result = await chat.sendMessageStream(parts); // Send parts array
    
    for await (const chunk of result.stream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
            onChunk(c.text());
        }

        // @ts-ignore
        const functionCalls = c.candidates?.[0]?.content?.parts?.filter((p: any) => p.functionCall)?.map((p: any) => p.functionCall);

        if (functionCalls && functionCalls.length > 0) {
            const responses = await onToolCall(functionCalls);
            const toolResponseResult = await chat.sendMessageStream(
                responses.map(r => ({
                    toolResponse: {
                        name: r.name,
                        response: { result: r.result }
                    }
                }))
            );

            for await (const toolChunk of toolResponseResult.stream) {
                const tc = toolChunk as GenerateContentResponse;
                if (tc.text) {
                    onChunk(tc.text());
                }
            }
        }
    }
  } catch (error) {
    console.error("Gemini Error:", error);
    onChunk("\n⚠️ Kunde inte nå AI-mekanikern just nu.");
  }
};

export const parseTasksFromInput = async (input: string, imageBase64?: string, vehicleData?: VehicleData): Promise<{ tasks: Partial<Task>[], shoppingItems: Partial<ShoppingItem>[] }> => {
  const ai = await getClient();
    if (!ai) {
        // Return empty arrays as a fallback if the client is not available
        return { tasks: [], shoppingItems: [] };
    }
  const model = getModelName();
  const parts: any[] = [];
  
  if (imageBase64) {
    parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } });
    parts.push({ text: "Analysera denna bild. Identifiera uppgifter och inköpsbehov." });
  } else {
    parts.push({ text: `Analysera följande:\n\n${input}` });
  }

  // Schema definition using dynamic phases
  const outputSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        tasks: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    estimatedCostMin: { type: Type.NUMBER },
                    estimatedCostMax: { type: Type.NUMBER },
                    weightKg: { type: Type.NUMBER },
                    costType: { type: Type.STRING, enum: [CostType.INVESTMENT, CostType.OPERATION] },
                    phase: { type: Type.STRING, enum: ALL_PHASES }, // UPDATED
                    priority: { type: Type.STRING, enum: Object.values(Priority) },
                    subtasks: { 
                        type: Type.ARRAY, 
                        items: { 
                            type: Type.OBJECT, 
                            properties: { title: { type: Type.STRING } }
                        }
                    },
                    tags: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["title", "description", "estimatedCostMin", "phase"]
            }
        },
        shoppingItems: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    category: { type: Type.STRING, enum: ['Reservdelar', 'Kemi & Färg', 'Verktyg', 'Inredning', 'Övrigt'] },
                    estimatedCost: { type: Type.NUMBER },
                    quantity: { type: Type.STRING }
                },
                required: ["name", "estimatedCost"]
            }
        }
    }
  };

  try {
    const modelInstance = ai.getGenerativeModel({
        model: model,
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: outputSchema
        },
        systemInstruction: 'Du är en expert på att strukturera projektdata.',
    });
    const result = await modelInstance.generateContent({ contents: [{ parts }] });

    const jsonText = result.response.text();
    if (!jsonText) return { tasks: [], shoppingItems: [] };
    
    const resultData = JSON.parse(jsonText);
    return { tasks: resultData.tasks || [], shoppingItems: resultData.shoppingItems || [] };

  } catch (error) {
    console.error("Gemini Parse Error:", error);
    return { tasks: [], shoppingItems: [] };
  }
};

// --- NANO BANANA (ICON GENERATION) ---

/**
 * Validate and preprocess image data
 */
const validateAndPrepareImage = (imageBase64: string): { valid: boolean; data?: string; error?: string } => {
    try {
        // Check if base64 string is not empty
        if (!imageBase64 || imageBase64.length === 0) {
            return { valid: false, error: 'Empty image data' };
        }

        // Check size (rough estimate: 4MB limit for API)
        const sizeInBytes = (imageBase64.length * 3) / 4;
        const maxSizeInBytes = 4 * 1024 * 1024; // 4MB

        if (sizeInBytes > maxSizeInBytes) {
            return { valid: false, error: 'Image too large (max 4MB)' };
        }

        return { valid: true, data: imageBase64 };
    } catch (error) {
        return { valid: false, error: 'Invalid image format' };
    }
};

/**
 * Generate a flat design icon from vehicle data or photo using Gemini Image Generation
 *
 * NOTE: CURRENTLY DISABLED - Waiting for Gemini 3 Pro Image Preview or Gemini 2.5 Flash Image
 * to become fully available via @google/genai Node.js SDK.
 *
 * The SDK currently has compatibility issues with image generation models when used in Node.js.
 * Users can upload their own icons until this is resolved.
 *
 * @param vehicleData - Vehicle information (make, model, year, color) OR base64 image
 * @param retryCount - Number of retry attempts (default: 2)
 * @returns Base64 encoded PNG image or null (currently always returns null)
 */
export const generateVehicleIcon = async (
    vehicleData: { make?: string; model?: string; year?: number; color?: string; imageBase64?: string },
    retryCount: number = 2
): Promise<string | null> => {
    // DISABLED: Gemini image generation models are not yet compatible with Node.js SDK
    // Return null to indicate feature is unavailable
    console.warn('⚠️ AI Icon Generation is currently disabled - waiting for SDK support');
    console.warn('   Users can upload custom icons manually instead');
    return null;
}

// --- DEEP RESEARCH 2.0 (MULTI-AGENT) WITH FALLBACK ---

export const generateProjectProfile = async (
    vehicleDescription: string,
    imageBase64?: string,
    projectType?: ProjectType,
    userSkillLevel?: string
): Promise<any> => {

    // Use provided values or defaults
    const finalProjectType = projectType || 'renovation';
    const finalSkillLevel = userSkillLevel || 'intermediate';

    try {
        // --- STEP 1: THE DETECTIVE (SEARCH & FACTS) ---
        console.log("🕵️‍♂️ Agent 1: Detective started...");

        // NOTE: Gemini has vision + search, Grok does not (yet)
        // So we try Gemini first for detective phase
        const ai = await getClient();

        if (!ai) {
            throw new Error("Gemini client could not be initialized.");
        }

        const model = getModelName();
        const detectivePrompt = ACTIVE_PROMPTS.agents.detective.text(vehicleDescription, !!imageBase64);

        const detectiveParts: any[] = [{ text: detectivePrompt }];
        if (imageBase64) detectiveParts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } });

        let detectiveData: any = {};

        try {
            const modelInstance = ai.getGenerativeModel({ 
                model: model,
                tools: [{ googleSearch: {} }]
            });
            const detectiveResponse = await modelInstance.generateContent({ contents: [{ parts: detectiveParts }]});
            
            let detectiveJson = detectiveResponse.response.text() || "{}";
            if (detectiveJson.includes("```json")) detectiveJson = detectiveJson.split("```json")[1].split("```")[0].trim();

            detectiveData = JSON.parse(detectiveJson);
            console.log("🕵️‍♂️ Detective found:", detectiveData.projectName);
        } catch (error) {
            console.warn("⚠️ Gemini Detective failed, using fallback data:", error);
            // Fallback: Extract basic info from description
            detectiveData = {
                projectName: vehicleDescription.substring(0, 30),
                vehicleData: {
                    make: vehicleDescription.split(' ')[0] || 'Okänd',
                    model: vehicleDescription.split(' ').slice(1).join(' ') || 'Modell',
                    year: new Date().getFullYear() - 20 // Guess
                }
            };
        }

        // --- STEP 2: THE PLANNER (STRATEGY) WITH UNIFIED AI SERVICE ---
        console.log("🔧 Agent 2: Planner started...");
        const plannerPrompt = ACTIVE_PROMPTS.agents.planner.text(
            JSON.stringify(detectiveData.vehicleData),
            finalProjectType,
            finalSkillLevel
        );

        // Use unified AI service with automatic Grok fallback
        const plannerResponse = await generateJSON<any>(
            'Du är en expert projektplanerare för fordon.',
            plannerPrompt,
            { temperature: 0.7, maxTokens: 6000 }
        );

        const plannerData = plannerResponse.data;
        console.log(`🔧 Planner created tasks: ${plannerData.initialTasks?.length || 0} (via ${plannerResponse.provider})`);

        if (plannerResponse.warning) {
            console.warn(`⚠️ ${plannerResponse.warning}`);
        }

        // --- MERGE RESULTS ---
        return {
            projectName: detectiveData.projectName,
            projectType: plannerData.projectType || finalProjectType,
            vehicleData: {
                ...detectiveData.vehicleData,
                expertAnalysis: plannerData.expertAnalysis
            },
            initialTasks: plannerData.initialTasks || [],
            analysisReport: plannerData.analysisReport,
            aiProvider: plannerResponse.provider // Track which AI was used
        };

    } catch (error) {
        console.error("Deep Research Agent Error:", error);

        // Return minimal valid structure
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
}

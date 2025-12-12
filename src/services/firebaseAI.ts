/**
 * Firebase AI Logic Service
 *
 * Client-side AI service using Firebase AI Logic SDK.
 * Provides secure access to Gemini API via Firebase proxy service.
 *
 * Benefits:
 * - API key stays on server (protected by Firebase)
 * - App Check integration for security
 * - Per-user rate limiting
 * - Lower cost (no Cloud Functions execution fees)
 * - True streaming support
 *
 * Note: Function calling (tool use) still requires tool declaration
 * and handling on client-side, but prompts can be protected with
 * Prompt Templates in Firebase Console.
 */

import { app } from './firebase';
import { getAI, getGenerativeModel, GoogleAIBackend, Schema } from 'firebase/ai';
import type { Task, ShoppingItem, VehicleData, ProjectType } from '@/types/types';

// Initialize Firebase AI Logic with Google AI backend
const ai = getAI(app, { backend: new GoogleAIBackend() });

// Define tool declarations for Gemini function calling
const tools = [{
  functionDeclarations: [
    {
      name: 'addTask',
      description: 'Add a new task to the project plan',
      parameters: Schema.object({
        properties: {
          title: Schema.string({ description: 'Short title of the task' }),
          description: Schema.string({ description: 'Detailed description' }),
          estimatedCostMax: Schema.number({ description: 'Estimated max cost in SEK' }),
          phase: Schema.string({ description: 'Project phase' }),
          priority: Schema.enumString({ enum: ['Hög', 'Medel', 'Låg'], description: 'Priority level' }),
          sprint: Schema.string({ description: 'Sprint name' }),
        },
        optionalProperties: ['estimatedCostMax', 'priority', 'sprint']
      })
    },
    {
      name: 'updateTask',
      description: 'Update an existing task',
      parameters: Schema.object({
        properties: {
          taskTitleKeywords: Schema.string({ description: 'Keywords to find the task' }),
          newStatus: Schema.enumString({ enum: ['todo', 'in-progress', 'done'] }),
          newPriority: Schema.enumString({ enum: ['Hög', 'Medel', 'Låg'] }),
        },
        optionalProperties: ['newStatus', 'newPriority']
      })
    },
    {
      name: 'deleteTask',
      description: 'Delete a task from the project',
      parameters: Schema.object({
        properties: {
          taskTitleKeywords: Schema.string({ description: 'Keywords to find task to delete' }),
        }
      })
    },
    {
      name: 'addToShoppingList',
      description: 'Add item to shopping list',
      parameters: Schema.object({
        properties: {
          name: Schema.string({ description: 'Item name' }),
          category: Schema.string({ description: 'Category' }),
          estimatedCost: Schema.number({ description: 'Estimated cost in SEK' }),
          quantity: Schema.string({ description: 'Quantity' }),
        },
        optionalProperties: ['category', 'estimatedCost', 'quantity']
      })
    },
    {
      name: 'updateVehicleData',
      description: 'Update vehicle specifications and technical data when learning new information about the vehicle',
      parameters: Schema.object({
        properties: {
          field: Schema.string({ description: 'The field to update (e.g., "make", "model", "year", "engine.power", "maintenance.oilType")' }),
          value: Schema.string({ description: 'The new value for the field' }),
          reason: Schema.string({ description: 'Why this update is being made' }),
        }
      })
    },
  ]
}];

/**
 * Get a Gemini model instance configured for chat with tools
 */
export const getChatModel = () => {
  return getGenerativeModel(ai, {
    model: 'gemini-2.5-flash',
    tools,
    generationConfig: {
      temperature: 0.9,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    }
  });
};

/**
 * Build system instruction with project context
 */
const buildSystemInstruction = (
  vehicleData: VehicleData,
  currentTasks: Task[],
  currentShoppingList: ShoppingItem[],
  projectName?: string,
  userSkillLevel?: string,
  projectType?: ProjectType
) => {
  const skillLevelContext = userSkillLevel
    ? `\n\n=== ANVÄNDARENS KUNSKAPSNIVÅ ===\n${userSkillLevel === 'beginner'
      ? 'NYBÖRJARE: Förklara allt tydligt, ge detaljerade steg-för-steg instruktioner.'
      : userSkillLevel === 'intermediate'
        ? 'HEMMAMECK: Balansera mellan DIY och verkstad. Ge praktiska tips.'
        : 'CERTIFIERAD: Teknisk och koncis. Fokusera på specs och momentvärden.'
    }`
    : '';

  const projectTypeContext = projectType
    ? `\n\n=== PROJEKTTYP ===\n${projectType === 'renovation'
      ? 'RENOVERING: Fokus på att återställa till ursprungligt skick.'
      : projectType === 'conversion'
        ? 'OMBYGGNAD (CAMPER): Fokus på camper-ombyggnad.'
        : 'FÖRVALTNING: Fokus på löpande underhåll och service.'
    }`
    : '';

  const instructionText = `Du är Elton, en AI-mekaniker för ${projectName || 'fordonet'}.

${skillLevelContext}
${projectTypeContext}

=== FORDONSDATA ===
${JSON.stringify(vehicleData, null, 2)}

=== AKTUELLA UPPGIFTER ===
${currentTasks.map(t => `- ${t.title} (${t.status})`).join('\n')}

=== INKÖPSLISTA ===
${currentShoppingList.map(i => `- ${i.name} (${i.checked ? 'köpt' : 'att köpa'})`).join('\n')}

Svara hjälpsamt och personligt. Du kan använda verktyg för att uppdatera projektet.`;

  // Return as Content object (Firebase AI SDK format)
  // systemInstruction should be a Content object with parts
  return {
    parts: [{ text: instructionText }]
  } as any;
};

/**
 * Stream a chat response using Firebase AI Logic SDK
 *
 * This version uses Firebase's proxy service and supports true streaming.
 * Function calls are handled via the response.functionCalls() method.
 */
export const streamChatMessage = async (
  history: Array<{ role: 'user' | 'model'; content: string; image?: string }>,
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
  const model = getChatModel();

  // Build system instruction
  const systemInstruction = buildSystemInstruction(
    vehicleData,
    currentTasks,
    currentShoppingList,
    projectName,
    userSkillLevel,
    projectType
  );

  // Convert history to Gemini format
  let chatHistory = history.map(msg => ({
    role: msg.role,
    parts: msg.image
      ? [{ text: msg.content }, { inlineData: { mimeType: 'image/jpeg', data: msg.image } }]
      : [{ text: msg.content }]
  }));

  // Firebase AI requires first message to be from 'user', not 'model'
  // Remove any leading 'model' messages
  while (chatHistory.length > 0 && chatHistory[0].role === 'model') {
    console.warn('⚠️ Removing leading model message from history (Firebase AI requires first message to be user)');
    chatHistory.shift();
  }

  // Prepare message parts
  const messageParts: any[] = [{ text: newMessage }];
  if (imageBase64) {
    messageParts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64
      }
    });
  }

  // Start chat with system instruction
  const chat = model.startChat({
    history: chatHistory,
    systemInstruction
  });

  // Stream response
  const result = await chat.sendMessageStream(messageParts);

  // Process stream
  let fullText = '';
  let functionCalls: any[] = [];

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    if (chunkText) {
      fullText += chunkText;
      onChunk(fullText);
    }

    // Check for function calls
    const calls = chunk.functionCalls?.();
    if (calls && calls.length > 0) {
      functionCalls = calls;
    }
  }

  // If there are function calls, execute them and continue conversation
  if (functionCalls.length > 0) {
    const toolResults = await onToolCall(functionCalls);

    // Convert tool results to Firebase AI format
    // Firebase expects { name, response: {...} } not { name, result }
    const functionResponses = toolResults.map(tr => ({
      functionResponse: {
        name: tr.name,
        response: {
          content: tr.result  // Wrap the result string in an object
        }
      }
    }));

    // Send tool responses back
    const followUpResult = await chat.sendMessageStream(functionResponses);

    // Stream follow-up response
    for await (const chunk of followUpResult.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        fullText += chunkText;
        onChunk(fullText);
      }
    }
  }

  return {
    text: fullText,
    functionCalls
  };
};

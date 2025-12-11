/**
 * AI Proxy Cloud Function
 *
 * Hanterar alla AI-anrop serverns sida och skyddar API-nycklar.
 * Exponerar endpoints for Gemini streaming chat och strukturerad parsing.
 */

import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { GoogleGenAI, Type, Schema, FunctionDeclaration, Tool } from '@google/genai';

// Definiera secrets som hämtas från Secret Manager vid deploy
const geminiApiKey = defineSecret('GEMINI_API_KEY');

// Model configuration
// Using Gemini 3 Pro Preview for critical tasks (best reasoning model)
const DEFAULT_MODEL = 'gemini-3-pro-preview';
const FAST_MODEL = 'gemini-2.5-flash'; // For quick, less critical tasks

// Tool declarations for the AI assistant
const functionDeclarations: FunctionDeclaration[] = [
  {
    name: 'addTask',
    description: 'Add a new task to the project plan.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'Short title of the task' },
        description: { type: Type.STRING, description: 'Detailed description' },
        estimatedCostMax: { type: Type.NUMBER, description: 'Estimated max cost in SEK' },
        phase: { type: Type.STRING, description: 'Project phase' },
        priority: { type: Type.STRING, enum: ['Hög', 'Medel', 'Låg'], description: 'Priority level' },
        sprint: { type: Type.STRING, description: 'Sprint name' },
        subtasks: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Checklist items' }
      },
      required: ['title', 'description', 'phase']
    }
  },
  {
    name: 'updateTask',
    description: 'Update an existing task.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        taskTitleKeywords: { type: Type.STRING, description: 'Keywords to find the task' },
        newStatus: { type: Type.STRING, enum: ['todo', 'in-progress', 'done'], description: 'New status' },
        newPriority: { type: Type.STRING, enum: ['Hög', 'Medel', 'Låg'], description: 'New priority' },
        newSprint: { type: Type.STRING, description: 'Assign to sprint' },
        newTitle: { type: Type.STRING, description: 'New title' },
        newDescription: { type: Type.STRING, description: 'New description' },
        newCost: { type: Type.NUMBER, description: 'New estimated cost' }
      },
      required: ['taskTitleKeywords']
    }
  },
  {
    name: 'deleteTask',
    description: 'Delete a task from the project.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        taskTitleKeywords: { type: Type.STRING, description: 'Keywords to find task to delete' }
      },
      required: ['taskTitleKeywords']
    }
  },
  {
    name: 'addToShoppingList',
    description: 'Add item to shopping list.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: 'Item name' },
        category: { type: Type.STRING, description: 'Category' },
        estimatedCost: { type: Type.NUMBER, description: 'Estimated cost in SEK' },
        quantity: { type: Type.STRING, description: 'Quantity' }
      },
      required: ['name']
    }
  },
  {
    name: 'registerPurchase',
    description: 'Mark shopping item as purchased.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        itemNameKeywords: { type: Type.STRING, description: 'Keywords to find item' },
        actualCost: { type: Type.NUMBER, description: 'Actual price paid' },
        store: { type: Type.STRING, description: 'Where purchased' },
        date: { type: Type.STRING, description: 'Purchase date (YYYY-MM-DD)' }
      },
      required: ['itemNameKeywords', 'actualCost']
    }
  },
  {
    name: 'updateShoppingItem',
    description: 'Update shopping item details.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        itemNameKeywords: { type: Type.STRING, description: 'Keywords to find item' },
        newName: { type: Type.STRING, description: 'New name' },
        newQuantity: { type: Type.STRING, description: 'New quantity' },
        newCategory: { type: Type.STRING, description: 'New category' },
        newCost: { type: Type.NUMBER, description: 'New estimated cost' }
      },
      required: ['itemNameKeywords']
    }
  },
  {
    name: 'deleteShoppingItem',
    description: 'Remove item from shopping list.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        itemNameKeywords: { type: Type.STRING, description: 'Keywords to find item to delete' }
      },
      required: ['itemNameKeywords']
    }
  },
  {
    name: 'createKnowledgeArticle',
    description: 'Save information to Knowledge Base.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'Article title' },
        summary: { type: Type.STRING, description: 'Short summary' },
        content: { type: Type.STRING, description: 'Full content in Markdown' },
        tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Tags' }
      },
      required: ['title', 'content']
    }
  }
];

const tools: Tool[] = [
  { googleSearch: {} },
  { functionDeclarations }
];

// --- TYPES ---

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  image?: string;
}

interface ChatRequest {
  history: ChatMessage[];
  newMessage: string;
  systemInstruction: string;
  imageBase64?: string;
  model?: string;
}

interface ParseRequest {
  input: string;
  imageBase64?: string;
  systemInstruction?: string;
  model?: string;
}

interface DeepResearchRequest {
  vehicleDescription: string;
  imageBase64?: string;
  projectType?: string;
  userSkillLevel?: string;
  detectivePrompt: string;
  plannerPrompt: string;
}

// --- CLOUD FUNCTIONS ---

/**
 * AI Chat - Handles streaming chat with tool calling
 *
 * Note: Firebase Callable functions don't support true streaming,
 * so we return the full response. For true streaming, use HTTP functions
 * with SSE or consider Firebase Realtime Database for updates.
 */
export const aiChat = onCall(
  {
    secrets: [geminiApiKey],
    region: 'europe-west1',
    maxInstances: 10,
    timeoutSeconds: 120,
    memory: '512MiB'
  },
  async (request: CallableRequest<ChatRequest>) => {
    // Verify authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { history, newMessage, systemInstruction, imageBase64, model } = request.data;

    if (!newMessage) {
      throw new HttpsError('invalid-argument', 'Message is required');
    }

    const apiKey = geminiApiKey.value();
    if (!apiKey) {
      throw new HttpsError('failed-precondition', 'API key not configured');
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const modelName = model || DEFAULT_MODEL;

      // Map history to new API format
      const historyContents = history.map(h => {
        const parts: any[] = [{ text: h.content }];
        if (h.image) {
          parts.push({
            inlineData: {
              mimeType: 'image/jpeg',
              data: h.image.split(',')[1] || h.image
            }
          });
        }
        return { role: h.role, parts };
      });

      // Create chat with new API
      const chat = ai.chats.create({
        model: modelName,
        config: {
          tools,
          systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined
        },
        history: historyContents
      });

      // Prepare message parts
      const parts: any[] = [{ text: newMessage }];
      if (imageBase64) {
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64
          }
        });
      }

      const result = await chat.sendMessage({ message: parts });
      const response = result;

      // Extract text and function calls
      const textParts = response.candidates?.[0]?.content?.parts?.filter((p: any) => p.text) || [];
      const functionCalls = response.candidates?.[0]?.content?.parts?.filter((p: any) => p.functionCall)?.map((p: any) => p.functionCall) || [];

      return {
        text: textParts.map((p: any) => p.text).join(''),
        functionCalls,
        finishReason: response.candidates?.[0]?.finishReason
      };

    } catch (error: any) {
      console.error('AI Chat Error:', error);
      throw new HttpsError('internal', `AI request failed: ${error.message}`);
    }
  }
);

/**
 * AI Parse - Structured JSON output for tasks/shopping items
 */
export const aiParse = onCall(
  {
    secrets: [geminiApiKey],
    region: 'europe-west1',
    maxInstances: 10,
    timeoutSeconds: 60,
    memory: '256MiB'
  },
  async (request: CallableRequest<ParseRequest>) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { input, imageBase64, systemInstruction, model } = request.data;

    if (!input && !imageBase64) {
      throw new HttpsError('invalid-argument', 'Input text or image required');
    }

    const apiKey = geminiApiKey.value();
    if (!apiKey) {
      throw new HttpsError('failed-precondition', 'API key not configured');
    }

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
              phase: { type: Type.STRING },
              priority: { type: Type.STRING, enum: ['Hög', 'Medel', 'Låg'] },
              subtasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: { title: { type: Type.STRING } }
                }
              },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['title', 'description', 'phase']
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
            required: ['name', 'estimatedCost']
          }
        }
      }
    };

    try {
      const ai = new GoogleGenAI({ apiKey });
      const modelName = model || DEFAULT_MODEL;

      const parts: any[] = [];
      if (imageBase64) {
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } });
        parts.push({ text: 'Analysera denna bild. Identifiera uppgifter och inköpsbehov.' });
      } else {
        parts.push({ text: `Analysera följande:\n\n${input}` });
      }

      const result = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts }],
        config: {
          responseMimeType: 'application/json',
          responseSchema: outputSchema,
          systemInstruction: { parts: [{ text: systemInstruction || 'Du är en expert på att strukturera projektdata för fordonsrenovering.' }] }
        }
      });

      const jsonText = result.text;

      if (!jsonText) {
        return { tasks: [], shoppingItems: [] };
      }

      return JSON.parse(jsonText);

    } catch (error: any) {
      console.error('AI Parse Error:', error);
      throw new HttpsError('internal', `Parse request failed: ${error.message}`);
    }
  }
);

/**
 * Deep Research - Multi-agent vehicle analysis
 */
export const aiDeepResearch = onCall(
  {
    secrets: [geminiApiKey],
    region: 'europe-west1',
    maxInstances: 5,
    timeoutSeconds: 180,
    memory: '1GiB'
  },
  async (request: CallableRequest<DeepResearchRequest>) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const {
      vehicleDescription,
      imageBase64,
      projectType,
      // userSkillLevel, // TODO: Use this in prompts
      detectivePrompt,
      plannerPrompt
    } = request.data;

    if (!vehicleDescription) {
      throw new HttpsError('invalid-argument', 'Vehicle description required');
    }

    const apiKey = geminiApiKey.value();
    if (!apiKey) {
      throw new HttpsError('failed-precondition', 'API key not configured');
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const modelName = DEFAULT_MODEL;

      // --- AGENT 1: DETECTIVE ---
      console.log('Agent 1: Detective started...');

      const detectiveParts: any[] = [{ text: detectivePrompt }];
      if (imageBase64) {
        detectiveParts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } });
      }

      let detectiveData: any = {};

      try {
        const detectiveResponse = await ai.models.generateContent({
          model: modelName,
          contents: [{ role: 'user', parts: detectiveParts }],
          config: {
            tools: [{ googleSearch: {} }]
          }
        });

        let detectiveJson = detectiveResponse.text || '{}';
        if (detectiveJson.includes('```json')) {
          detectiveJson = detectiveJson.split('```json')[1].split('```')[0].trim();
        }
        detectiveData = JSON.parse(detectiveJson);
        console.log('Detective found:', detectiveData.projectName);

      } catch (detectiveError: any) {
        console.warn('Detective fallback:', detectiveError.message);
        detectiveData = {
          projectName: vehicleDescription.substring(0, 30),
          vehicleData: {
            make: vehicleDescription.split(' ')[0] || 'Okänd',
            model: vehicleDescription.split(' ').slice(1).join(' ') || 'Modell',
            year: new Date().getFullYear() - 20
          }
        };
      }

      // --- AGENT 2: PLANNER ---
      console.log('Agent 2: Planner started...');

      const plannerResponse = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: [{ text: plannerPrompt }] }],
        config: {
          responseMimeType: 'application/json'
        }
      });

      let plannerJson = plannerResponse.text || '{}';
      if (plannerJson.includes('```json')) {
        plannerJson = plannerJson.split('```json')[1].split('```')[0].trim();
      }
      const plannerData = JSON.parse(plannerJson);
      console.log('Planner created tasks:', plannerData.initialTasks?.length || 0);

      // --- MERGE RESULTS ---
      return {
        projectName: detectiveData.projectName,
        projectType: plannerData.projectType || projectType || 'renovation',
        vehicleData: {
          ...detectiveData.vehicleData,
          expertAnalysis: plannerData.expertAnalysis
        },
        initialTasks: plannerData.initialTasks || [],
        analysisReport: plannerData.analysisReport,
        provider: 'gemini'
      };

    } catch (error: any) {
      console.error('Deep Research Error:', error);

      // Return minimal fallback
      return {
        projectName: vehicleDescription.substring(0, 30) || 'Nytt Projekt',
        projectType: projectType || 'renovation',
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
);

/**
 * Send tool responses back to the AI for continued conversation
 */
export const aiToolResponse = onCall(
  {
    secrets: [geminiApiKey],
    region: 'europe-west1',
    maxInstances: 10,
    timeoutSeconds: 60,
    memory: '256MiB'
  },
  async (request: CallableRequest<{
    history: ChatMessage[];
    toolResponses: Array<{ name: string; result: any }>;
    systemInstruction: string;
    model?: string;
  }>) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { history, toolResponses, systemInstruction, model } = request.data;

    const apiKey = geminiApiKey.value();
    if (!apiKey) {
      throw new HttpsError('failed-precondition', 'API key not configured');
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const modelName = model || FAST_MODEL; // Tool responses use fast model

      const historyContents = history.map(h => ({
        role: h.role,
        parts: [{ text: h.content }]
      }));

      const chat = ai.chats.create({
        model: modelName,
        config: {
          tools,
          systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined
        },
        history: historyContents
      });

      const result = await chat.sendMessage({
        message: toolResponses.map(r => ({
          functionResponse: {
            name: r.name,
            response: { result: r.result }
          }
        }))
      });

      const response = result;
      const textParts = response.candidates?.[0]?.content?.parts?.filter((p: any) => p.text) || [];
      const functionCalls = response.candidates?.[0]?.content?.parts?.filter((p: any) => p.functionCall)?.map((p: any) => p.functionCall) || [];

      return {
        text: textParts.map((p: any) => p.text).join(''),
        functionCalls,
        finishReason: response.candidates?.[0]?.finishReason
      };

    } catch (error: any) {
      console.error('Tool Response Error:', error);
      throw new HttpsError('internal', `Tool response failed: ${error.message}`);
    }
  }
);

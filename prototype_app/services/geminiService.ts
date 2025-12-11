
import { GoogleGenAI, GenerateContentResponse, Type, Schema, FunctionDeclaration, Tool } from "@google/genai";
import { KNOWLEDGE_ARTICLES } from '../constants';
import { PROJECT_CREATION_PROMPT, MAGIC_IMPORT_PROMPT, DATA_ENRICHMENT_PROMPT } from '../prompts'; // Import Prompts
import { configService } from './configService'; // Import ConfigService
import { Task, TaskStatus, CostType, Priority, ShoppingItem, VehicleData } from '../types';

let client: GoogleGenAI | null = null;

const getClient = (): GoogleGenAI => {
  if (!client) {
    const apiKey = process.env.API_KEY || '';
    if (!apiKey) {
      console.warn("API Key missing for Gemini");
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
};

// --- TOOL DEFINITIONS ---

const functionDeclarations: FunctionDeclaration[] = [
    {
      name: 'addTask',
      description: 'Add a new task. If it is just a rough idea, use "Idé & Research" status. Otherwise default to "Att göra".',
      parameters: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'Short title of the task' },
          description: { type: Type.STRING, description: 'Detailed description' },
          estimatedCostMax: { type: Type.NUMBER, description: 'Estimated maximum cost in SEK' },
          phase: { type: Type.STRING, description: 'Which project phase this belongs to' },
          status: { type: Type.STRING, enum: Object.values(TaskStatus), description: 'Set to "Idé & Research" for unconfirmed ideas.' },
          priority: { type: Type.STRING, enum: Object.values(Priority), description: 'Priority level' },
          sprint: { type: Type.STRING, description: 'Sprint Name' },
          subtasks: { 
            type: Type.ARRAY, 
            description: 'Checklist steps',
            items: { type: Type.STRING }
          }
        },
        required: ['title', 'description', 'phase']
      }
    },
    // ... other tools (updateTask, deleteTask, etc) remain similar ...
    {
      name: 'updateTask',
      description: 'Update an existing task.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          taskTitleKeywords: { type: Type.STRING, description: 'Keywords to find the task' },
          newStatus: { type: Type.STRING, enum: Object.values(TaskStatus) },
          newPriority: { type: Type.STRING, enum: Object.values(Priority) },
          newSprint: { type: Type.STRING },
          newTitle: { type: Type.STRING },
          newDescription: { type: Type.STRING },
          newCost: { type: Type.NUMBER }
        },
        required: ['taskTitleKeywords']
      }
    },
    {
      name: 'deleteTask',
      description: 'Permanently delete a task.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          taskTitleKeywords: { type: Type.STRING }
        },
        required: ['taskTitleKeywords']
      }
    },
    {
      name: 'addToShoppingList',
      description: 'Add an item to the shopping list.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING },
          estimatedCost: { type: Type.NUMBER },
          quantity: { type: Type.STRING }
        },
        required: ['name']
      }
    },
    {
      name: 'registerPurchase',
      description: 'Mark item as bought.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          itemNameKeywords: { type: Type.STRING },
          actualCost: { type: Type.NUMBER },
          store: { type: Type.STRING },
          date: { type: Type.STRING }
        },
        required: ['itemNameKeywords', 'actualCost']
      }
    },
    {
      name: 'updateShoppingItem',
      description: 'Update shopping item.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          itemNameKeywords: { type: Type.STRING },
          newName: { type: Type.STRING },
          newQuantity: { type: Type.STRING },
          newCategory: { type: Type.STRING },
          newCost: { type: Type.NUMBER }
        },
        required: ['itemNameKeywords']
      }
    },
    {
      name: 'deleteShoppingItem',
      description: 'Delete shopping item.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          itemNameKeywords: { type: Type.STRING }
        },
        required: ['itemNameKeywords']
      }
    },
    {
        name: 'createKnowledgeArticle',
        description: 'Save info to Knowledge Base.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                summary: { type: Type.STRING },
                content: { type: Type.STRING },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['title', 'content']
        }
    }
];

export const tools: Tool[] = [
  { googleSearch: {} }, 
  { functionDeclarations: functionDeclarations }
];

// --- CONTEXT BUILDERS ---

const createTaskContext = (tasks: Task[], shoppingList: ShoppingItem[]): string => {
  let context = "\n\n=== 3. AKTUELL PROJEKTSTATUS ===\n";
  
  // Group by Status for clearer context
  const ideas = tasks.filter(t => t.status === TaskStatus.IDEA);
  const active = tasks.filter(t => t.status !== TaskStatus.IDEA);

  if (ideas.length > 0) {
      context += "\n--- IDÉBANKEN (Ej påbörjat) ---\n";
      ideas.forEach(t => context += `💡 ${t.title}: ${t.description}\n`);
  }

  const phases = Array.from(new Set(active.map(t => t.phase)));
  phases.forEach(phase => {
      const phaseTasks = active.filter(t => t.phase === phase);
      if (phaseTasks.length > 0) {
          context += `\n--- ${phase.toUpperCase()} ---\n`;
          phaseTasks.forEach(task => {
            const statusIcon = task.status === TaskStatus.DONE ? '✅' : task.status === TaskStatus.IN_PROGRESS ? '🚧' : '⬜';
            context += `${statusIcon} ${task.title} [${task.status}]\n`;
          });
      }
  });

  // ... shopping list context remains same ...
  return context;
};

const createKnowledgeContext = (vehicleData?: VehicleData): string => {
    let context = "\n\n=== 2. KUNSKAPSBANK ===\n";
    KNOWLEDGE_ARTICLES.forEach(article => {
        context += `>>> ${article.title}: ${article.summary}\n`;
    });
    return context;
};

export const streamGeminiResponse = async (
  history: { role: 'user' | 'model'; content: string }[],
  newMessage: string,
  vehicleData: VehicleData,
  currentTasks: Task[],
  currentShoppingList: ShoppingItem[],
  onChunk: (text: string) => void,
  onToolCall: (toolCalls: any[]) => Promise<any[]>
) => {
  const ai = getClient();
  // Check flags for experimental model
  const flags = configService.getFlags();
  const model = flags.USE_EXPERIMENTAL_MODEL ? 'gemini-3-pro-preview' : 'gemini-2.5-flash';

  // Get Dynamic System Prompt based on version
  const systemPrompt = configService.getSystemPrompt();

  const fullSystemInstruction = 
    `SYSTEM: You are "Elton", an AI assistant for a vehicle project.
    
    ${systemPrompt}

    \n\n=== 1. FORDONSDATA ===
    ${JSON.stringify(vehicleData, null, 2)}` +
    createKnowledgeContext(vehicleData) + 
    createTaskContext(currentTasks, currentShoppingList) +
    
    `\n\n=== INSTRUKTIONER ===
    1. PROJEKTTYP: Anpassa dina svar beroende på om det är en Renovering, Nybygge eller Förvaltning.
    2. IDÉER: Om användaren spånar löst, använd 'addTask' med status "Idé & Research".
    3. FASER: Använd projektets befintliga faser när du lägger till uppgifter.`;

  try {
    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction: fullSystemInstruction,
        tools: tools,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.content }],
      })),
    });

    const result = await chat.sendMessageStream({ message: newMessage });
    
    let fullResponseText = "";
    for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        if (c.text) { onChunk(c.text); fullResponseText += c.text; }
        // @ts-ignore
        const functionCalls = c.candidates?.[0]?.content?.parts?.filter((p: any) => p.functionCall)?.map((p: any) => p.functionCall);
        if (functionCalls && functionCalls.length > 0) {
            const responses = await onToolCall(functionCalls);
            const toolResponseResult = await chat.sendMessageStream({
                message: responses.map(r => ({
                    functionResponse: { name: r.name, response: { result: r.result } }
                }))
            });
            for await (const toolChunk of toolResponseResult) {
                const tc = toolChunk as GenerateContentResponse;
                if (tc.text) onChunk(tc.text);
            }
        }
    }

  } catch (error) {
    console.error("Gemini Error:", error);
    onChunk("\n⚠️ Kunde inte nå AI-mekanikern.");
  }
};

export const parseTasksFromInput = async (input: string, imageBase64?: string, vehicleData?: VehicleData): Promise<{ tasks: Partial<Task>[], shoppingItems: Partial<ShoppingItem>[] }> => {
    const ai = getClient();
    const model = 'gemini-2.5-flash';

    try {
        const parts: any[] = [{ text: MAGIC_IMPORT_PROMPT + `\n\nINPUT:\n${input}` }];
        
        if (imageBase64) {
            parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } });
        }

        const response = await ai.models.generateContent({
            model,
            contents: { parts },
            config: { responseMimeType: 'application/json' }
        });

        const jsonStr = response.text || "{}";
        const result = JSON.parse(jsonStr);

        return {
            tasks: result.tasks || [],
            shoppingItems: result.shoppingItems || []
        };

    } catch (error) {
        console.error("Magic Import failed:", error);
        return { tasks: [], shoppingItems: [] };
    }
};

export const generateVehicleIcon = async (imageBase64: string): Promise<string | null> => {
    // This requires an Imagen model, keeping it simple/mocked for now or use gemini-vision to describe then standard gen
    return null;
}

export const generateProjectProfile = async (vehicleDescription: string, imageBase64?: string): Promise<any> => {
    const ai = getClient();
    const model = 'gemini-2.5-flash';

    const promptText = PROJECT_CREATION_PROMPT + `\n\nUSER INPUT: "${vehicleDescription}"`;

    try {
        const parts: any[] = [{ text: promptText }];
        if (imageBase64) parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } });

        const response = await ai.models.generateContent({
            model,
            contents: { parts },
            config: { tools: [{ googleSearch: {} }] }
        });

        let jsonText = response.text || "{}";
        if (jsonText.includes("```json")) jsonText = jsonText.split("```json")[1].split("```")[0].trim();
        else if (jsonText.includes("```")) jsonText = jsonText.split("```")[1].split("```")[0].trim();

        return JSON.parse(jsonText);
    } catch (error) {
        return {};
    }
}

export const enrichVehicleData = async (regNo: string): Promise<Partial<VehicleData>> => {
    const ai = getClient();
    const model = 'gemini-2.5-flash';
    
    // Replace placeholder
    const promptText = DATA_ENRICHMENT_PROMPT.replace('{{REGNO}}', regNo);

    try {
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [{ text: promptText }] },
            config: { 
                tools: [{ googleSearch: {} }],
                responseMimeType: 'application/json' 
            }
        });

        let jsonText = response.text || "{}";
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Data Enrichment Failed:", error);
        return {};
    }
};

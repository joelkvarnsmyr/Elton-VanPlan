
import { GoogleGenAI, GenerateContentResponse, Type, Schema, FunctionDeclaration, Tool } from "@google/genai";
import { KNOWLEDGE_ARTICLES } from '../constants';
import { ACTIVE_PROMPTS } from '../config/prompts'; 
import { Task, TaskStatus, ProjectType, PROJECT_PHASES, CostType, Priority, ShoppingItem, VehicleData, Project, ServiceItem, FuelLogItem } from '../types';

let client: GoogleGenAI | null = null;

const getClient = (): GoogleGenAI => {
  if (!client) {
    // @ts-ignore - Handle Vite env vs process env
    const apiKey = import.meta.env?.VITE_GEMINI_API_KEY || ''; 
    if (!apiKey) {
      console.warn("API Key missing for Gemini. Please set VITE_GEMINI_API_KEY.");
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
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
            const statusIcon = task.status === TaskStatus.DONE ? '✅' : task.status === TaskStatus.IN_PROGRESS ? '🚧' : '⬜';
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
  imageBase64?: string
) => {
  const ai = getClient();
  const model = 'gemini-2.0-flash'; 

  // USE THE ACTIVE PERSONA FROM CONFIG
  const fullSystemInstruction = 
    `SYSTEM: ${ACTIVE_PROMPTS.chatPersona}
    
    ${ACTIVE_PROMPTS.baseSystemPrompt}

    \n\n=== 1. FORDONSDATA (SPECIFIKATIONER) ===
    ${JSON.stringify(vehicleData, null, 2)}` +
    createKnowledgeContext(vehicleData) + 
    createTaskContext(currentTasks, currentShoppingList) +
    `\n\n=== INSTRUKTIONER ===
    Använd verktygen för att ändra i databasen. 
    Om användaren skickar en bild på en inköpslista, använd 'addToShoppingList' för varje rad.
    Sök på Google för priser om det saknas.`;

  try {
    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction: fullSystemInstruction,
        tools: tools,
      },
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

    const result = await chat.sendMessageStream({ message: parts }); // Send parts array
    
    for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
            onChunk(c.text);
        }

        // @ts-ignore
        const functionCalls = c.candidates?.[0]?.content?.parts?.filter((p: any) => p.functionCall)?.map((p: any) => p.functionCall);

        if (functionCalls && functionCalls.length > 0) {
            const responses = await onToolCall(functionCalls);
            const toolResponseResult = await chat.sendMessageStream({
                message: responses.map(r => ({
                    functionResponse: {
                        name: r.name,
                        response: { result: r.result }
                    }
                }))
            });

            for await (const toolChunk of toolResponseResult) {
                const tc = toolChunk as GenerateContentResponse;
                if (tc.text) {
                    onChunk(tc.text);
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
  const ai = getClient();
  const model = 'gemini-2.0-flash';
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
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: outputSchema,
        systemInstruction: `Du är en expert på att strukturera projektdata.`,
      }
    });

    const jsonText = response.text;
    if (!jsonText) return { tasks: [], shoppingItems: [] };
    
    const result = JSON.parse(jsonText);
    return { tasks: result.tasks || [], shoppingItems: result.shoppingItems || [] };

  } catch (error) {
    console.error("Gemini Parse Error:", error);
    return { tasks: [], shoppingItems: [] };
  }
};

// --- NANO BANANA (ICON GENERATION) ---
export const generateVehicleIcon = async (imageBase64: string): Promise<string | null> => {
    const ai = getClient();
    const model = 'gemini-2.0-flash'; 

    try {
        const response = await ai.models.generateContent({
            model,
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
                    { text: ACTIVE_PROMPTS.iconGeneration.v1 }
                ]
            }
        });

        let svgCode = response.text || "";
        // Cleanup SVG code
        if (svgCode.includes("<svg")) {
            svgCode = svgCode.substring(svgCode.indexOf("<svg"));
            if (svgCode.includes("</svg>")) {
                svgCode = svgCode.substring(0, svgCode.indexOf("</svg>") + 6);
            }
            return btoa(svgCode); // Convert to Base64
        }
        return null;

    } catch (error) {
        console.error("Icon Generation Error:", error);
        return null;
    }
}

// --- DEEP RESEARCH 2.0 (MULTI-AGENT) ---

export const generateProjectProfile = async (vehicleDescription: string, imageBase64?: string): Promise<any> => {
    const ai = getClient();
    const model = 'gemini-2.0-flash'; 

    try {
        // --- STEP 1: THE DETECTIVE (SEARCH & FACTS) ---
        console.log("🕵️‍♂️ Agent 1: Detective started...");
        const detectivePrompt = ACTIVE_PROMPTS.agents.detective.text(vehicleDescription, !!imageBase64);
        
        const detectiveParts: any[] = [{ text: detectivePrompt }];
        if (imageBase64) detectiveParts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } });

        const detectiveResponse = await ai.models.generateContent({
            model,
            contents: { parts: detectiveParts },
            config: { tools: [{ googleSearch: {} }] }
        });

        let detectiveJson = detectiveResponse.text || "{}";
        if (detectiveJson.includes("```json")) detectiveJson = detectiveJson.split("```json")[1].split("```")[0].trim();
        
        const detectiveData = JSON.parse(detectiveJson);
        console.log("🕵️‍♂️ Detective found:", detectiveData.projectName);

        // --- STEP 2: THE PLANNER (STRATEGY) ---
        console.log("🔧 Agent 2: Planner started...");
        const plannerPrompt = ACTIVE_PROMPTS.agents.planner.text(JSON.stringify(detectiveData.vehicleData));
        
        const plannerResponse = await ai.models.generateContent({
            model,
            contents: { parts: [{ text: plannerPrompt }] },
            // Planner relies on internal logic + common sense search if needed
            config: { tools: [{ googleSearch: {} }] } 
        });

        let plannerJson = plannerResponse.text || "{}";
        if (plannerJson.includes("```json")) plannerJson = plannerJson.split("```json")[1].split("```")[0].trim();

        const plannerData = JSON.parse(plannerJson);
        console.log("🔧 Planner created tasks:", plannerData.initialTasks?.length);

        // --- MERGE RESULTS ---
        return {
            projectName: detectiveData.projectName,
            projectType: plannerData.projectType, // Capture AI suggested type
            vehicleData: {
                ...detectiveData.vehicleData,
                expertAnalysis: plannerData.expertAnalysis // MERGE EXPERT ANALYSIS INTO VEHICLE DATA
            },
            initialTasks: plannerData.initialTasks,
            analysisReport: plannerData.analysisReport
        };

    } catch (error) {
        console.error("Deep Research Agent Error:", error);
        return {};
    }
}

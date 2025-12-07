
import { GoogleGenAI, GenerateContentResponse, Type, Schema, FunctionDeclaration, Tool } from "@google/genai";
import { BASE_SYSTEM_PROMPT, KNOWLEDGE_ARTICLES } from '../constants';
import { Task, TaskStatus, Phase, CostType, Priority, ShoppingItem, VehicleData } from '../types';

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
      description: 'Add a new task to the project plan. Use this when the user wants to do something new. Can include a checklist of steps.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'Short title of the task' },
          description: { type: Type.STRING, description: 'Detailed description of what needs to be done' },
          estimatedCostMax: { type: Type.NUMBER, description: 'Estimated maximum cost in SEK' },
          phase: { type: Type.STRING, enum: Object.values(Phase), description: 'Which project phase this belongs to' },
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

// Combine Google Search with Function Calling
export const tools: Tool[] = [
  { googleSearch: {} }, 
  { functionDeclarations: functionDeclarations }
];

// --- CONTEXT BUILDERS ---

const createTaskContext = (tasks: Task[], shoppingList: ShoppingItem[]): string => {
  let context = "\n\n=== 3. AKTUELL PROJEKTSTATUS (DATA) ===\n";
  context += "Här är sanningen om projektet. Om användaren frågar vad som är gjort, läs här.\n";
  
  const phases = Array.from(new Set(tasks.map(t => t.phase)));
  
  phases.forEach(phase => {
      const phaseTasks = tasks.filter(t => t.phase === phase);
      if (phaseTasks.length > 0) {
          context += `\n--- ${phase.toUpperCase()} ---\n`;
          phaseTasks.forEach(task => {
            const statusIcon = task.status === TaskStatus.DONE ? '✅' : task.status === TaskStatus.IN_PROGRESS ? '🚧' : '⬜';
            context += `${statusIcon} UPPGIFT: ${task.title} (ID: ${task.id})\n`;
            context += `   Status: ${task.status} | Prio: ${task.priority || 'Normal'} | Sprint: ${task.sprint || 'Ingen'}\n`;
            context += `   Beskrivning: ${task.description}\n`;
            context += `   Ekonomi: Estimat ${task.estimatedCostMin}-${task.estimatedCostMax} kr | Spenderat ${task.actualCost} kr\n`;

            if (task.subtasks && task.subtasks.length > 0) {
                const doneCount = task.subtasks.filter(s => s.completed).length;
                context += `   Checklista (${doneCount}/${task.subtasks.length}):\n`;
                task.subtasks.forEach(st => {
                    context += `     [${st.completed ? 'X' : ' '}] ${st.title}\n`;
                });
            }
            
            if (task.comments && task.comments.length > 0) {
                context += `   Senaste noteringar: "${task.comments[task.comments.length - 1].text}"\n`;
            }
            context += '\n';
          });
      }
  });

  context += "\n=== 4. INKÖPSLISTA (LAGERSTATUS) ===\n";
  if (shoppingList.length === 0) {
      context += "Listan är tom.\n";
  } else {
      const bought = shoppingList.filter(i => i.checked);
      const needed = shoppingList.filter(i => !i.checked);
      
      if (needed.length > 0) {
          context += "ATT KÖPA:\n";
          needed.forEach(i => context += ` - [ ] ${i.name} (${i.quantity}) - Est: ${i.estimatedCost}kr\n`);
      }
      if (bought.length > 0) {
          context += "INKÖPT (Finns i garaget):\n";
          bought.forEach(i => context += ` - [X] ${i.name} (Köpt på ${i.store || '?'} för ${i.actualCost}kr)\n`);
      }
  }

  context += "\n============================================\n";
  return context;
};

const createKnowledgeContext = (): string => {
    let context = "\n\n=== 2. KUNSKAPSBANK & RAPPORTER (FAKTA) ===\n";
    context += "Du har tillgång till följande tekniska rapporter. DU SKA LITA PÅ DESSA över din generella träning.\n";
    
    KNOWLEDGE_ARTICLES.forEach(article => {
        context += `>>> ARTIKEL: ${article.title} (ID: ${article.id}) <<<\n`;
        context += `Sammanfattning: ${article.summary}\n`;
        context += `INNEHÅLL:\n${article.content}\n`;
        context += `--------------------------------------------------\n`;
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
  const model = 'gemini-2.5-flash';

  const fullSystemInstruction = 
    `SYSTEM: You are "Elton", an AI assistant and Project Manager for a van renovation project.
    
    ${BASE_SYSTEM_PROMPT}

    \n\n=== 1. FORDONSDATA (SPECIFIKATIONER) ===
    Detta är hårda fakta om den aktuella bilen.
    ${JSON.stringify(vehicleData, null, 2)}` +
    
    createKnowledgeContext() + 
    
    createTaskContext(currentTasks, currentShoppingList) +
    
    `\n\n=== INSTRUKTIONER FÖR LOGIK ===
    1. LÄS FÖRST: Innan du svarar, sök igenom avsnitt 1 (Fordon), 2 (Rapporter) och 3 (Projektstatus).
    2. VAR SPECIFIK: Om användaren frågar om delar, kolla rapporterna först.
    3. HÄMTA DATA: Använd aktuell projektstatus för att svara på vad som är gjort.
    4. SÖK PÅ WEBBEN (GOOGLE): Använd googleSearch för priser och produkter. Prioritera svenska butiker.
    5. HANTERA PROJEKTET: Använd verktygen (addTask, updateTask, addToShoppingList) proaktivt.
    
    Dina verktyg är till för att ändra i databasen. Använd dem!`;

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
        if (c.text) {
            onChunk(c.text);
            fullResponseText += c.text;
        }

        // @ts-ignore
        const functionCalls = c.candidates?.[0]?.content?.parts?.filter((p: any) => p.functionCall)?.map((p: any) => p.functionCall);

        if (functionCalls && functionCalls.length > 0) {
            const responses = await onToolCall(functionCalls);
            
            const toolResponseResult = await chat.sendMessageStream({
                parts: responses.map(r => ({
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
    onChunk("\n⚠️ Kunde inte nå AI-mekanikern just nu. Kontrollera din API-nyckel.");
  }
};

export const parseTasksFromInput = async (input: string, imageBase64?: string, vehicleData?: VehicleData): Promise<{ tasks: Partial<Task>[], shoppingItems: Partial<ShoppingItem>[] }> => {
  const ai = getClient();
  const model = 'gemini-2.5-flash';

  const parts: any[] = [];
  
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64
      }
    });
    parts.push({ text: "Analysera denna bild (kvitto, anteckning eller skärmdump). Identifiera både uppgifter (Tasks) och inköpsbehov (ShoppingItems)." });
  } else {
    parts.push({ text: `Analysera följande och skapa strukturerade uppgifter (med checklistor/subtasks) och inköpsvaror:\n\n${input}` });
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
                    weightKg: { type: Type.NUMBER },
                    costType: { type: Type.STRING, enum: [CostType.INVESTMENT, CostType.OPERATION] },
                    phase: { type: Type.STRING, enum: Object.values(Phase) },
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
        systemInstruction: `Du är en expert på att strukturera projektdata för en van-renovering.
        Fordonsinfo: ${vehicleData ? JSON.stringify(vehicleData) : 'Okänd'}. 
        Bryt ner stora uppgifter i 'subtasks'. Identifiera materialbehov separat i 'shoppingItems'.`,
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

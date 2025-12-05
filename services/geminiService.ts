import { GoogleGenAI, GenerateContentResponse, Type, Schema } from "@google/genai";
import { BASE_SYSTEM_PROMPT, VEHICLE_DATA } from '../constants';
import { Task, TaskStatus, Phase, CostType } from '../types';

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

// Helper to turn tasks into a readable string context
const createTaskContext = (tasks: Task[]): string => {
  let context = "\n\n=== AKTUELL PROJEKTSTATUS & ANTECKNINGAR ===\n";
  
  tasks.forEach(task => {
    context += `\nUPPGIFT: ${task.title} (${task.status})`;
    context += `\n - Beskrivning: ${task.description}`;
    context += `\n - Kostnad: ${task.estimatedCostMin}-${task.estimatedCostMax} kr (Utfall: ${task.actualCost} kr)`;
    
    if (task.comments.length > 0) {
      context += `\n - Kommentarer/Logg:`;
      task.comments.forEach(c => context += `\n   * "${c.text}" (${c.createdAt})`);
    }
    
    if (task.links.length > 0) {
      context += `\n - Sparade länkar: ${task.links.map(l => l.title + ' (' + l.url + ')').join(', ')}`;
    }

    if (task.attachments.length > 0) {
      context += `\n - Uppladdade filer/kvitton: ${task.attachments.map(a => a.name).join(', ')}`;
    }
  });

  context += "\n============================================\n";
  return context;
};

export const streamGeminiResponse = async (
  history: { role: 'user' | 'model'; content: string }[],
  newMessage: string,
  currentTasks: Task[],
  onChunk: (text: string) => void
) => {
  const ai = getClient();
  const model = 'gemini-2.5-flash';

  const fullSystemInstruction = BASE_SYSTEM_PROMPT + createTaskContext(currentTasks);

  try {
    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction: fullSystemInstruction,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.content }],
      })),
    });

    const result = await chat.sendMessageStream({ message: newMessage });
    
    for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
            onChunk(c.text);
        }
    }
  } catch (error) {
    console.error("Gemini Error:", error);
    onChunk("\n⚠️ Kunde inte nå AI-mekanikern just nu. Kontrollera din API-nyckel.");
  }
};

export const parseTasksFromInput = async (input: string, imageBase64?: string): Promise<Partial<Task>[]> => {
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
    parts.push({ text: "Analysera denna bild (kvitto, anteckning eller skärmdump) och skapa uppgifter till projektet." });
  } else {
    parts.push({ text: `Analysera följande anteckningar och skapa strukturerade uppgifter:\n\n${input}` });
  }

  // Schema definition for structured output
  const taskSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "Kort rubrik på uppgiften" },
        description: { type: Type.STRING, description: "Detaljerad beskrivning" },
        estimatedCostMin: { type: Type.NUMBER, description: "Lägsta uppskattade kostnad" },
        estimatedCostMax: { type: Type.NUMBER, description: "Högsta uppskattade kostnad" },
        weightKg: { type: Type.NUMBER, description: "Uppskattad vikt i kg (0 om ej relevant)" },
        costType: { type: Type.STRING, enum: [CostType.INVESTMENT, CostType.OPERATION] },
        phase: { type: Type.STRING, enum: Object.values(Phase) },
        tags: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["title", "description", "estimatedCostMin", "estimatedCostMax", "phase", "costType"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: taskSchema,
        systemInstruction: `Du är en assistent som konverterar ostrukturerade anteckningar om en van-renovering till strukturerad data. 
        Fordonsinfo att ta hänsyn till: ${JSON.stringify(VEHICLE_DATA)}. 
        Var generös med estimat (lägg på 15% buffer). Kategorisera noga.`,
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    
    const tasks = JSON.parse(jsonText);
    
    // Add IDs and default status
    return tasks.map((t: any) => ({
      ...t,
      id: Math.random().toString(36).substr(2, 9),
      status: TaskStatus.TODO,
      actualCost: 0,
      links: [],
      comments: [],
      attachments: []
    }));

  } catch (error) {
    console.error("Gemini Parse Error:", error);
    return [];
  }
};
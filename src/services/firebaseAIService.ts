/**
 * Firebase AI Logic Service
 *
 * Direkt integration med Gemini via Firebase AI Logic.
 * Ingen API-nyckel behövs - hanteras av Firebase.
 *
 * @see https://firebase.google.com/docs/ai-logic
 */

import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import type { GenerativeModel, ChatSession, Content, Part } from 'firebase/ai';
import { app } from './firebase';

// Initialize Firebase AI with Gemini Developer API backend
const ai = getAI(app, { backend: new GoogleAIBackend() });

// Model configurations
const MODELS = {
  // Fast model for chat and quick responses
  flash: 'gemini-2.5-flash',
  // Pro model for complex reasoning (Deep Research)
  pro: 'gemini-2.5-pro',
} as const;

// --- TYPES ---

export interface AIMessage {
  role: 'user' | 'model';
  content: string;
  image?: string; // Base64 encoded image
}

export interface AIStreamCallback {
  onChunk: (text: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

export interface GenerateOptions {
  model?: keyof typeof MODELS;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface ChatOptions extends GenerateOptions {
  history?: AIMessage[];
}

// --- MODEL CREATION ---

/**
 * Create a GenerativeModel instance with optional configuration
 */
export const createModel = (options: GenerateOptions = {}): GenerativeModel => {
  const modelName = MODELS[options.model || 'flash'];

  return getGenerativeModel(ai, {
    model: modelName,
    systemInstruction: options.systemInstruction,
    generationConfig: {
      temperature: options.temperature,
      maxOutputTokens: options.maxOutputTokens,
    },
  });
};

/**
 * Create a chat session with history and system instructions
 */
export const createChat = (options: ChatOptions = {}): ChatSession => {
  const model = createModel(options);

  // Convert our AIMessage format to Firebase AI format
  const history: Content[] = (options.history || []).map((msg) => ({
    role: msg.role as 'user' | 'model',
    parts: msg.image
      ? [
          { text: msg.content } as Part,
          { inlineData: { mimeType: 'image/jpeg', data: msg.image } } as Part,
        ]
      : [{ text: msg.content } as Part],
  }));

  return model.startChat({ history });
};

// --- SIMPLE GENERATION ---

/**
 * Generate text from a prompt (non-streaming)
 */
export const generateText = async (
  prompt: string,
  options: GenerateOptions = {}
): Promise<string> => {
  const model = createModel(options);
  const result = await model.generateContent(prompt);
  return result.response.text();
};

/**
 * Generate text with streaming
 */
export const generateTextStream = async (
  prompt: string,
  callbacks: AIStreamCallback,
  options: GenerateOptions = {}
): Promise<void> => {
  const model = createModel(options);

  try {
    const result = await model.generateContentStream(prompt);
    let fullText = '';

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      callbacks.onChunk(chunkText);
    }

    callbacks.onComplete?.(fullText);
  } catch (error) {
    callbacks.onError?.(error as Error);
    throw error;
  }
};

// --- CHAT ---

/**
 * Send a message in a chat session (non-streaming)
 */
export const sendChatMessageAI = async (
  chat: ChatSession,
  message: string,
  imageBase64?: string
): Promise<string> => {
  const parts: string | Part[] = imageBase64
    ? [
        { text: message } as Part,
        { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } } as Part,
      ]
    : message;

  const result = await chat.sendMessage(parts);
  return result.response.text();
};

/**
 * Send a message in a chat session with streaming
 */
export const sendChatMessageStreamAI = async (
  chat: ChatSession,
  message: string,
  callbacks: AIStreamCallback,
  imageBase64?: string
): Promise<void> => {
  const parts: string | Part[] = imageBase64
    ? [
        { text: message } as Part,
        { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } } as Part,
      ]
    : message;

  try {
    const result = await chat.sendMessageStream(parts);
    let fullText = '';

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      callbacks.onChunk(chunkText);
    }

    callbacks.onComplete?.(fullText);
  } catch (error) {
    callbacks.onError?.(error as Error);
    throw error;
  }
};

// --- MULTIMODAL ---

/**
 * Analyze an image with a prompt
 */
export const analyzeImage = async (
  imageBase64: string,
  prompt: string,
  options: GenerateOptions = {}
): Promise<string> => {
  const model = createModel(options);

  const result = await model.generateContent([
    { text: prompt },
    { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
  ]);

  return result.response.text();
};

// --- STRUCTURED OUTPUT ---

/**
 * Generate JSON output from a prompt
 */
export const generateJSON = async <T = unknown>(
  prompt: string,
  options: GenerateOptions = {}
): Promise<T> => {
  const model = createModel(options);

  // Add JSON instruction to prompt
  const jsonPrompt = `${prompt}\n\nRespond with valid JSON only, no markdown formatting.`;

  const result = await model.generateContent(jsonPrompt);
  const text = result.response.text();

  // Clean up potential markdown code blocks
  const cleanedText = text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  return JSON.parse(cleanedText) as T;
};

// --- DEEP RESEARCH (Multi-agent pattern) ---

export interface DeepResearchResult {
  projectName: string;
  projectType: string;
  vehicleData: Record<string, unknown>;
  initialTasks: Array<{
    title: string;
    description: string;
    phase: string;
    priority?: string;
    estimatedCostMin?: number;
    estimatedCostMax?: number;
  }>;
  analysisReport?: string;
  provider: 'firebase-ai';
}

/**
 * Perform deep research using multi-agent pattern
 *
 * Agent 1 (Detective): Researches vehicle data
 * Agent 2 (Planner): Creates project plan based on findings
 */
export const performDeepResearch = async (
  vehicleDescription: string,
  imageBase64?: string,
  projectType: string = 'renovation',
  userSkillLevel: string = 'intermediate',
  detectivePrompt?: string,
  plannerPrompt?: string
): Promise<DeepResearchResult> => {
  console.log('🚀 [Firebase AI] Deep Research starting:', {
    vehicle: vehicleDescription,
    projectType,
    userSkillLevel,
    hasImage: !!imageBase64,
  });

  const startTime = Date.now();

  try {
    // Use Pro model for better reasoning in research
    const model = createModel({ model: 'pro' });

    // --- AGENT 1: DETECTIVE ---
    console.log('🕵️ Agent 1: Detective started...');
    const detectiveStartTime = Date.now();

    const detectiveFullPrompt =
      detectivePrompt ||
      `Du är en fordonsexpert. Analysera följande fordonsbeskrivning och hitta så mycket information som möjligt:

Fordon: ${vehicleDescription}

Returnera JSON med:
{
  "projectName": "Projektnamn baserat på fordonet",
  "vehicleData": {
    "make": "Tillverkare",
    "model": "Modell",
    "year": Årtal (nummer),
    "registrationNumber": "RegNr om det finns",
    "engineType": "Motortyp",
    "fuelType": "Bränsletyp",
    "transmission": "Växellåda"
  }
}`;

    let detectiveResult: { projectName?: string; vehicleData?: Record<string, unknown> };

    if (imageBase64) {
      const response = await model.generateContent([
        { text: detectiveFullPrompt },
        { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
      ]);
      const text = response.response.text();
      detectiveResult = JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    } else {
      const response = await model.generateContent(detectiveFullPrompt);
      const text = response.response.text();
      detectiveResult = JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
    }

    console.log(`⏱️ Detective completed in ${Date.now() - detectiveStartTime}ms`);

    // --- AGENT 2: PLANNER ---
    console.log('📝 Agent 2: Planner started...');
    const plannerStartTime = Date.now();

    const plannerFullPrompt =
      plannerPrompt ||
      `Du är en projektplanerare för fordonsrenovering. Baserat på följande fordonsdata, skapa en projektplan.

Fordonsdata: ${JSON.stringify(detectiveResult.vehicleData)}
Projekttyp: ${projectType}
Användarnivå: ${userSkillLevel}

Skapa uppgifter anpassade för en ${userSkillLevel === 'beginner' ? 'nybörjare' : userSkillLevel === 'expert' ? 'expert' : 'hemmamekaniker'}.

Returnera JSON med:
{
  "projectType": "${projectType}",
  "initialTasks": [
    {
      "title": "Uppgiftstitel",
      "description": "Beskrivning",
      "phase": "Fas 0: Inköp & Analys",
      "priority": "Hög/Medel/Låg",
      "estimatedCostMin": 0,
      "estimatedCostMax": 1000
    }
  ],
  "analysisReport": "Kort sammanfattning av projektet"
}`;

    const plannerResponse = await model.generateContent(plannerFullPrompt);
    const plannerText = plannerResponse.response.text();
    const plannerResult = JSON.parse(
      plannerText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    );

    console.log(`⏱️ Planner completed in ${Date.now() - plannerStartTime}ms`);

    // --- MERGE RESULTS ---
    const result: DeepResearchResult = {
      projectName: detectiveResult.projectName || vehicleDescription.substring(0, 30),
      projectType: plannerResult.projectType || projectType,
      vehicleData: detectiveResult.vehicleData || {},
      initialTasks: plannerResult.initialTasks || [],
      analysisReport: plannerResult.analysisReport,
      provider: 'firebase-ai',
    };

    const totalTime = Date.now() - startTime;
    console.log('🎉 [Firebase AI] Deep Research completed:', {
      totalTimeMs: totalTime,
      totalTimeSec: (totalTime / 1000).toFixed(1) + 's',
      tasksCreated: result.initialTasks.length,
    });

    return result;
  } catch (error) {
    console.error('❌ [Firebase AI] Deep Research failed:', error);

    // Return fallback
    return {
      projectName: vehicleDescription.substring(0, 30) || 'Nytt Projekt',
      projectType,
      vehicleData: {
        make: vehicleDescription.split(' ')[0] || 'Okänd',
        model: vehicleDescription.split(' ').slice(1).join(' ') || 'Modell',
      },
      initialTasks: [],
      provider: 'firebase-ai',
    };
  }
};

// --- HEALTH CHECK ---

/**
 * Check if Firebase AI Logic is available
 */
export const checkHealth = async (): Promise<boolean> => {
  try {
    const model = createModel();
    await model.generateContent('ping');
    return true;
  } catch {
    return false;
  }
};

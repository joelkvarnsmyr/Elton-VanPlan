/**
 * AI Service
 *
 * Unified AI service that uses Firebase Vertex AI SDK directly (Client-side).
 * This replaces the Cloud Functions proxy to improve stability and performance.
 * Access control is handled via Firebase App Check and Security Rules.
 */

import { app } from './firebase';
import { getAI, getGenerativeModel, GoogleAIBackend, SchemaType } from 'firebase/ai';

// Initialize Firebase AI with Google AI backend
// mirroring the working setup in firebaseAI.ts
const ai = getAI(app, { backend: new GoogleAIBackend() });

// ===========================
// TYPES
// ===========================

export type AIProvider = 'gemini' | 'grok' | 'fallback';

export interface AIResponse<T = string> {
  data: T;
  provider: AIProvider;
  success: boolean;
  warning?: string;
  errors?: Array<{ provider: string; message: string }>;
  functionCalls?: Array<{ name: string; args: any }>;
}

export interface AIConfig {
  temperature?: number;
  maxTokens?: number;
  retryCount?: number;
  timeout?: number;
  preferredProvider?: AIProvider;
  disableTools?: boolean;
}

// Global Tools Definition
const TOOLS_DEFINITION = [
  // @ts-ignore - googleSearchRetrieval is supported in Vertex AI SDK
  {
    googleSearchRetrieval: {}
  },
  // Project Tools
  {
    functionDeclarations: [
      {
        name: 'addVehicleHistoryEvent',
        description: 'Add a significant event to the vehicle history (e.g., service, repair, inspection).',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            date: { type: SchemaType.STRING, description: 'Date of event (ISO format YYYY-MM-DD)' },
            type: { type: SchemaType.STRING, enum: ['service', 'repair', 'inspection', 'other'], description: 'Type of event' },
            title: { type: SchemaType.STRING, description: 'Short title of the event' },
            description: { type: SchemaType.STRING, description: 'Details about the event' },
            mileage: { type: SchemaType.NUMBER, description: 'Mileage at the time of event (in Swedish mil)' },
            cost: { type: SchemaType.NUMBER, description: 'Cost of the event in SEK' }
          },
          required: ['date', 'type', 'title']
        }
      },
      {
        name: 'addMileageReading',
        description: 'Log a new mileage reading.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            date: { type: SchemaType.STRING, description: 'Date of reading (ISO format YYYY-MM-DD)' },
            mileage: { type: SchemaType.NUMBER, description: 'Current mileage (in Swedish mil)' },
            source: { type: SchemaType.STRING, enum: ['user', 'inspection', 'other'], description: 'Source of the reading' }
          },
          required: ['date', 'mileage']
        }
      },
      {
        name: 'updateInspectionFinding',
        description: 'Update an inspection finding provided in the context.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            findingId: { type: SchemaType.STRING, description: 'ID of the finding' },
            newStatus: { type: SchemaType.STRING, enum: ['open', 'fixed', 'ignored'], description: 'New status' },
            feedback: { type: SchemaType.STRING, description: 'Notes about the update' }
          },
          required: ['findingId']
        }
      },
      {
        name: 'addTask',
        description: 'Add a new task to the project.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING, description: 'Title of the task' },
            description: { type: SchemaType.STRING, description: 'Description of what needs to be done' },
            phase: { type: SchemaType.STRING, description: 'Project phase (e.g., "Fas 1: Akut", "Fas 2: Kaross", "Fas 3: System")' },
            priority: { type: SchemaType.STRING, enum: ['Låg', 'Medel', 'Hög', 'Kritisk'], description: 'Priority level' },
            estimatedCostMin: { type: SchemaType.NUMBER, description: 'Minimum estimated cost' },
            estimatedCostMax: { type: SchemaType.NUMBER, description: 'Maximum estimated cost' }
          },
          required: ['title', 'phase']
        }
      },
      {
        name: 'createPhase',
        description: 'Create a new project phase.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING, description: 'Name of the phase' },
            description: { type: SchemaType.STRING, description: 'Description of the phase' },
            order: { type: SchemaType.NUMBER, description: 'Order index of the phase' }
          },
          required: ['name', 'order']
        }
      },
      {
        name: 'setProjectType',
        description: 'Set the type of the project (e.g., renovation, conversion).',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            type: { type: SchemaType.STRING, enum: ['renovation', 'conversion', 'maintenance', 'mixed'], description: 'Project type' }
          },
          required: ['type']
        }
      },
      {
        name: 'completeSetup',
        description: 'Mark the project setup as complete.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {},
        }
      }
    ]
  }
];

// ===========================
// HELPER: GET MODEL
// ===========================

const getModel = (config?: AIConfig) => {
  return getGenerativeModel(ai, {
    model: 'gemini-2.5-flash',
    tools: config?.disableTools ? [] : TOOLS_DEFINITION,
    generationConfig: {
      temperature: config?.temperature ?? 0.7,
      maxOutputTokens: config?.maxTokens ?? 8192,
      topK: 40,
      topP: 0.95,
    }
  });
};

// ===========================
// AI SERVICE FUNCTIONS
// ===========================

/**
 * Generate text using Vertex AI SDK
 */
export const generateText = async (
  systemPrompt: string,
  userPrompt: string,
  config?: AIConfig
): Promise<AIResponse<string>> => {
  try {
    const model = getModel(config);

    // Combine system and user prompt since SDK doesn't always support system instructions purely in all builds,
    // but newer SDKs do. To be safe and consistent with simple usage:
    // We can pass systemInstruction to getGenerativeModel if we want, but here we instantiate per call often.
    // Actually, getGenerativeModel supports systemInstruction.

    const modelWithSystem = getGenerativeModel(ai, {
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
      // Fix: tools were previously missing here
      tools: config?.disableTools ? [] : TOOLS_DEFINITION,
      generationConfig: {
        temperature: config?.temperature ?? 0.7
      }
    });

    const result = await modelWithSystem.generateContent(userPrompt);
    const responseText = result.response.text();
    const functionCalls = result.response.functionCalls()?.map(call => ({
      name: call.name,
      args: call.args
    }));

    return {
      data: responseText,
      functionCalls,
      provider: 'gemini',
      success: true
    };
  } catch (error: any) {
    console.error('AI generateText error:', error);
    throw new Error(error.message || 'AI-tjänster otillgängliga (Client SDK)');
  }
};

/**
 * Generate structured JSON using Vertex AI SDK
 */
export const generateJSON = async <T = any>(
  systemPrompt: string,
  userPrompt: string,
  config?: AIConfig
): Promise<AIResponse<T>> => {
  try {
    // Force JSON response via prompt engineering + generation config
    const model = getGenerativeModel(ai, {
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt + '\n\nIMPORTANT: Respond with valid JSON only. No markdown formatting.',
      generationConfig: {
        responseMimeType: 'application/json', // Force JSON mode
        temperature: config?.temperature ?? 0.2
      }
    });

    const result = await model.generateContent(userPrompt);
    const responseText = result.response.text();

    let data: T;
    try {
      data = JSON.parse(responseText) as T;
    } catch {
      // Fallback cleanup if strict JSON mode fails
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      data = JSON.parse(cleaned) as T;
    }

    return {
      data,
      provider: 'gemini',
      success: true
    };
  } catch (error: any) {
    console.error('AI generateJSON error:', error);
    throw new Error(error.message || 'Kunde inte generera JSON');
  }
};

/**
 * Generate text from image and prompt (Multimodal)
 */
export const generateWithImage = async (
  prompt: string,
  base64Image: string,
  mimeType: string = 'image/jpeg'
): Promise<string> => {
  try {
    const model = getGenerativeModel(ai, {
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1024
      }
    });

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    return result.response.text();

  } catch (error: any) {
    console.error('AI Vision error:', error);
    throw new Error('Kunde inte analysera bild: ' + error.message);
  }
};

/**
 * Check AI service availability -> Simple ping
 */
export const checkAIAvailability = async (): Promise<{
  gemini: boolean;
  grok: boolean;
}> => {
  try {
    const model = getModel();
    await model.generateContent('ping');
    return { gemini: true, grok: false };
  } catch (e) {
    console.warn('AI Service Check Failed:', e);
    return { gemini: false, grok: false };
  }
};

/**
 * Legacy interface for compatibility
 */
export const getAIService = async () => {
  return {
    generateText,
    generateJSON,
    checkAvailability: checkAIAvailability
  };
};

export default {
  getAIService,
  generateText,
  generateJSON,
  checkAIAvailability
};

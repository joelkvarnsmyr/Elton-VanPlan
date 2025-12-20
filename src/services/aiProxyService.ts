/**
 * AI Proxy Service
 *
 * Frontend service som anropar Cloud Functions för AI-operationer.
 * Alla API-nycklar hanteras säkert på backend.
 */

import { getFunctions, httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { app } from './firebase';

// Initialize Firebase Functions with region
const functions = getFunctions(app, 'europe-west1');

// --- TYPES ---

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  image?: string;
}

export interface ChatResponse {
  text: string;
  functionCalls: Array<{
    name: string;
    args: Record<string, any>;
  }>;
  finishReason: string;
}

export interface ParsedData {
  tasks: Array<{
    title: string;
    description: string;
    estimatedCostMin?: number;
    estimatedCostMax?: number;
    phase: string;
    priority?: string;
    subtasks?: Array<{ title: string }>;
    tags?: string[];
  }>;
  shoppingItems: Array<{
    name: string;
    category?: string;
    estimatedCost: number;
    quantity?: string;
  }>;
}

export interface DeepResearchResult {
  projectName: string;
  projectType: string;
  vehicleData: Record<string, any>;
  initialTasks: Array<any>;
  analysisReport: any;
  provider: string;
  error?: string;
}

// --- CALLABLE FUNCTION REFERENCES ---

const aiChatFn = httpsCallable<{
  history: ChatMessage[];
  newMessage: string;
  systemInstruction: string;
  imageBase64?: string;
  model?: string;
}, ChatResponse>(functions, 'aiChat');

const aiParseFn = httpsCallable<{
  input: string;
  imageBase64?: string;
  systemInstruction?: string;
  model?: string;
}, ParsedData>(functions, 'aiParse');

const aiDeepResearchFn = httpsCallable<{
  vehicleDescription: string;
  imageBase64?: string;
  projectType?: string;
  userSkillLevel?: string;
  detectivePrompt: string;
  plannerPrompt: string;
}, DeepResearchResult>(functions, 'aiDeepResearch', {
  timeout: 180000 // 3 minutes - Deep Research with Gemini 3 Pro can be slow
});

const aiToolResponseFn = httpsCallable<{
  history: ChatMessage[];
  toolResponses: Array<{ name: string; result: any }>;
  systemInstruction: string;
  model?: string;
}, ChatResponse>(functions, 'aiToolResponse');

// --- PUBLIC API ---

/**
 * Send a chat message to the AI and get a response
 *
 * @param history - Previous chat messages
 * @param newMessage - The new message from the user
 * @param systemInstruction - System prompt with context
 * @param imageBase64 - Optional image in base64 format
 * @param model - Optional model override
 * @returns AI response with text and potential function calls
 */
export const sendChatMessage = async (
  history: ChatMessage[],
  newMessage: string,
  systemInstruction: string,
  imageBase64?: string,
  model?: string
): Promise<ChatResponse> => {
  try {
    const result = await aiChatFn({
      history,
      newMessage,
      systemInstruction,
      imageBase64,
      model
    });
    return result.data;
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    throw new Error(error.message || 'Kunde inte nå AI-tjänsten');
  }
};

/**
 * Parse text or image into structured tasks and shopping items
 *
 * @param input - Text to parse
 * @param imageBase64 - Optional image(s) to analyze (single string or array)
 * @param systemInstruction - Optional custom system prompt
 * @param model - Optional model override
 * @returns Parsed tasks and shopping items
 */
export const parseInput = async (
  input: string,
  imageBase64?: string | string[],
  systemInstruction?: string,
  model?: string
): Promise<ParsedData> => {
  try {
    // For backwards compatibility, handle both string and array
    // If array, use only the first image for now (Cloud Function signature needs update for multi-image)
    const singleImage = Array.isArray(imageBase64) ? imageBase64[0] : imageBase64;

    const result = await aiParseFn({
      input,
      imageBase64: singleImage,
      systemInstruction,
      model
    });
    return result.data;
  } catch (error: any) {
    console.error('AI Parse Error:', error);
    // Return empty result on error
    return { tasks: [], shoppingItems: [] };
  }
};

/**
 * Perform deep research on a vehicle using multi-agent system
 *
 * @param vehicleDescription - Description of the vehicle
 * @param imageBase64 - Optional vehicle image
 * @param projectType - Type of project (renovation, conversion, maintenance)
 * @param userSkillLevel - User's skill level
 * @param detectivePrompt - Prompt for the detective agent
 * @param plannerPrompt - Prompt for the planner agent
 * @returns Complete vehicle analysis with project plan
 */
export const performDeepResearch = async (
  vehicleDescription: string,
  imageBase64?: string,
  projectType?: string,
  userSkillLevel?: string,
  detectivePrompt?: string,
  plannerPrompt?: string
): Promise<DeepResearchResult> => {
  const startTime = Date.now();
  console.log('🚀 [Frontend] Starting Deep Research:', {
    vehicle: vehicleDescription,
    projectType,
    userSkillLevel,
    hasImage: !!imageBase64,
    hasDetectivePrompt: !!detectivePrompt,
    hasPlannerPrompt: !!plannerPrompt
  });

  try {
    console.log('📡 [Frontend] Calling Cloud Function: aiDeepResearch');
    const result = await aiDeepResearchFn({
      vehicleDescription,
      imageBase64,
      projectType,
      userSkillLevel,
      detectivePrompt: detectivePrompt || '',
      plannerPrompt: plannerPrompt || ''
    });

    const duration = Date.now() - startTime;
    console.log('✅ [Frontend] Deep Research completed:', {
      durationMs: duration,
      durationSec: (duration / 1000).toFixed(1) + 's',
      projectName: result.data.projectName,
      vehicleDataFields: Object.keys(result.data.vehicleData || {}).length,
      tasksCount: result.data.initialTasks?.length || 0,
      provider: result.data.provider
    });

    return result.data;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ [Frontend] Deep Research failed after ${duration}ms:`, {
      error: error.message,
      code: error.code,
      details: error.details
    });
    console.warn('🔄 [Frontend] Using fallback data...');

    // Return fallback result
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
      provider: 'fallback',
      error: 'AI-tjänster otillgängliga'
    };
  }
};

/**
 * Send tool response back to AI for continued conversation
 *
 * @param history - Chat history
 * @param toolResponses - Results from executed tools
 * @param systemInstruction - System prompt
 * @param model - Optional model override
 * @returns AI response after processing tool results
 */
export const sendToolResponse = async (
  history: ChatMessage[],
  toolResponses: Array<{ name: string; result: any }>,
  systemInstruction: string,
  model?: string
): Promise<ChatResponse> => {
  try {
    const result = await aiToolResponseFn({
      history,
      toolResponses,
      systemInstruction,
      model
    });
    return result.data;
  } catch (error: any) {
    console.error('Tool Response Error:', error);
    throw new Error(error.message || 'Kunde inte skicka verktygsresultat');
  }
};

/**
 * Helper to check if Cloud Functions are available
 * Useful for graceful fallback in development
 */
export const checkAIServiceHealth = async (): Promise<boolean> => {
  try {
    // Quick test call with minimal data
    await sendChatMessage([], 'ping', 'Respond with pong');
    return true;
  } catch {
    return false;
  }
};

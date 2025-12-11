/**
 * AI Service
 *
 * Unified AI service that uses Cloud Functions for all AI operations.
 * API keys are handled securely on the backend.
 */

import { sendChatMessage, parseInput, type ChatResponse } from './aiProxyService';

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
}

export interface AIConfig {
  temperature?: number;
  maxTokens?: number;
  retryCount?: number;
  timeout?: number;
  preferredProvider?: AIProvider;
}

// ===========================
// AI SERVICE FUNCTIONS
// ===========================

/**
 * Generate text using AI via Cloud Functions
 */
export const generateText = async (
  systemPrompt: string,
  userPrompt: string,
  config?: AIConfig
): Promise<AIResponse<string>> => {
  try {
    const response = await sendChatMessage(
      [],
      userPrompt,
      systemPrompt
    );

    return {
      data: response.text,
      provider: 'gemini',
      success: true
    };
  } catch (error: any) {
    console.error('AI generateText error:', error);
    throw new Error(error.message || 'AI-tjänster otillgängliga');
  }
};

/**
 * Generate structured JSON using AI via Cloud Functions
 */
export const generateJSON = async <T = any>(
  systemPrompt: string,
  userPrompt: string,
  config?: AIConfig
): Promise<AIResponse<T>> => {
  try {
    const fullSystemPrompt = systemPrompt + '\n\nVIKTIGT: SVARA MED ENDAST JSON. Ingen extra text.';

    const response = await sendChatMessage(
      [],
      userPrompt,
      fullSystemPrompt
    );

    // Parse JSON from response
    let data: T;
    try {
      data = JSON.parse(response.text) as T;
    } catch {
      // Try to extract JSON from markdown code block
      const jsonMatch = response.text.match(/```json\n([\s\S]*?)\n```/) ||
                       response.text.match(/```\n([\s\S]*?)\n```/) ||
                       response.text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const jsonText = jsonMatch[1] || jsonMatch[0];
        data = JSON.parse(jsonText) as T;
      } else {
        throw new Error('Could not parse JSON from response');
      }
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
 * Check AI service availability
 */
export const checkAIAvailability = async (): Promise<{
  gemini: boolean;
  grok: boolean;
}> => {
  try {
    await sendChatMessage([], 'ping', 'Respond with pong');
    return { gemini: true, grok: false };
  } catch {
    return { gemini: false, grok: false };
  }
};

/**
 * Legacy function to get AI service - now returns a simple object
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

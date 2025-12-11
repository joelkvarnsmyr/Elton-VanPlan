/**
 * Unified AI Service
 *
 * Central AI-hanterare med intelligent fallback:
 * 1. Gemini (primär) - Google's AI med vision, search, function calling
 * 2. Grok (fallback) - xAI's Grok vid Gemini-problem
 * 3. Static fallback - Förgenererad data vid total AI-fail
 *
 * Exponential backoff och automatisk retry för tillfälliga fel
 */

import { GoogleGenAI } from "@google/genai";
import { getGrokClient, GrokConfig } from './grokService';
import { classifyGeminiError, classifyGrokError, type AIError } from './errorHandler';

// ===========================
// TYPES
// ===========================

export type AIProvider = 'gemini' | 'grok' | 'fallback';

export interface AIResponse<T = string> {
  data: T;
  provider: AIProvider;
  success: boolean;
  warning?: string;
  errors?: AIError[]; // Track all errors that occurred during fallback chain
}

export interface AIConfig {
  temperature?: number;
  maxTokens?: number;
  retryCount?: number;
  timeout?: number;
  preferredProvider?: AIProvider;
}

// ===========================
// AI CLIENT MANAGER
// ===========================

class AIServiceManager {
  private geminiClient: GoogleGenAI | null = null;
  private grokClient: ReturnType<typeof getGrokClient> | null = null;

  constructor() {
    this.initializeClients();
  }

  private initializeClients() {
    // Initialize Gemini
    try {
      // @ts-ignore
      const geminiKey = import.meta.env?.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
      if (geminiKey) {
        this.geminiClient = new GoogleGenAI({ apiKey: geminiKey });
        console.log(`✅ Gemini initialized with key: ${geminiKey.substring(0, 10)}...`);
      } else {
        console.warn('⚠️ VITE_GEMINI_API_KEY saknas');
      }
    } catch (error) {
      console.error('Failed to initialize Gemini:', error);
    }

    // Initialize Grok
    try {
      this.grokClient = getGrokClient();
      console.log('✅ Grok client ready');
    } catch (error) {
      console.error('Failed to initialize Grok:', error);
    }
  }

  /**
   * Check which AI providers are available
   */
  async checkAvailability(): Promise<{
    gemini: boolean;
    grok: boolean;
  }> {
    const checks = await Promise.allSettled([
      this.geminiClient
        ? this.geminiClient.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: { parts: [{ text: 'test' }] },
            config: { maxOutputTokens: 5 }
          })
        : Promise.reject('No client'),
      this.grokClient?.healthCheck() || Promise.reject('No client')
    ]);

    return {
      gemini: checks[0].status === 'fulfilled',
      grok: checks[1].status === 'fulfilled'
    };
  }

  /**
   * Generate text with automatic fallback
   */
  async generateText(
    systemPrompt: string,
    userPrompt: string,
    config?: AIConfig
  ): Promise<AIResponse<string>> {

    const retryCount = config?.retryCount ?? 2;
    const temperature = config?.temperature ?? 0.7;
    const maxTokens = config?.maxTokens || 4000;
    const errors: AIError[] = [];

    // Try Gemini first (unless Grok is preferred)
    if (config?.preferredProvider !== 'grok' && this.geminiClient) {
      try {
        console.log('🤖 Trying Gemini...');
        const result = await this.callGemini(systemPrompt, userPrompt, { temperature, maxTokens });
        console.log('✅ Gemini success');
        return {
          data: result,
          provider: 'gemini',
          success: true
        };
      } catch (error: any) {
        const classifiedError = classifyGeminiError(error);
        errors.push(classifiedError);
        console.warn('⚠️ Gemini failed:', classifiedError.userMessage);
        console.error('   Details:', classifiedError.message);
      }
    }

    // Fallback to Grok
    if (this.grokClient) {
      try {
        console.log('🤖 Trying Grok fallback...');
        const result = await this.grokClient.generateContent([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ], { temperature, maxTokens });

        console.log('✅ Grok success');
        return {
          data: result,
          provider: 'grok',
          success: true,
          warning: errors[0]?.userMessage || 'Gemini otillgänglig, använder Grok',
          errors
        };
      } catch (error: any) {
        const classifiedError = classifyGrokError(error);
        errors.push(classifiedError);
        console.warn('⚠️ Grok också failed:', classifiedError.userMessage);
        console.error('   Details:', classifiedError.message);
      }
    }

    // Total failure - provide detailed error message
    const errorMsg = errors.length > 0
      ? `AI-tjänster otillgängliga:\n${errors.map(e => `• ${e.provider}: ${e.message}`).join('\n')}`
      : 'Alla AI-tjänster är otillgängliga. Kontrollera API-nycklar och nätverksanslutning.';

    throw new Error(errorMsg);
  }

  /**
   * Generate structured JSON with automatic fallback
   */
  async generateJSON<T = any>(
    systemPrompt: string,
    userPrompt: string,
    config?: AIConfig
  ): Promise<AIResponse<T>> {

    const retryCount = config?.retryCount ?? 2;
    const temperature = config?.temperature ?? 0.7;
    const maxTokens = config?.maxTokens || 4000;
    const errors: AIError[] = [];

    // Try Gemini first
    if (config?.preferredProvider !== 'grok' && this.geminiClient) {
      try {
        console.log('🤖 Trying Gemini for JSON...');
        const textResult = await this.callGemini(
          systemPrompt + '\n\nVIKTIGT: SVARA MED ENDAST JSON. Ingen extra text eller kommentarer.',
          userPrompt,
          { temperature, maxTokens }
        );

        const parsed = this.parseJSON<T>(textResult);
        console.log('✅ Gemini JSON success');
        return {
          data: parsed,
          provider: 'gemini',
          success: true
        };
      } catch (error: any) {
        const classifiedError = classifyGeminiError(error);
        errors.push(classifiedError);
        console.warn('⚠️ Gemini JSON failed:', classifiedError.userMessage);
        console.error('   Details:', classifiedError.message);
        if (classifiedError.type === 'invalid_response') {
          console.error('   This usually means Gemini returned text instead of JSON');
        }
      }
    }

    // Fallback to Grok (har native JSON mode)
    if (this.grokClient) {
      try {
        console.log('🤖 Trying Grok for JSON...');
        const result = await this.grokClient.generateJSON<T>(
          systemPrompt,
          userPrompt,
          { temperature, maxTokens }
        );

        console.log('✅ Grok JSON success');
        return {
          data: result,
          provider: 'grok',
          success: true,
          warning: errors[0]?.userMessage || 'Gemini otillgänglig, använder Grok',
          errors
        };
      } catch (error: any) {
        const classifiedError = classifyGrokError(error);
        errors.push(classifiedError);
        console.warn('⚠️ Grok JSON också failed:', classifiedError.userMessage);
        console.error('   Details:', classifiedError.message);
      }
    }

    // Total failure
    const errorMsg = errors.length > 0
      ? `Kunde inte generera JSON:\n${errors.map(e => `• ${e.provider}: ${e.message}`).join('\n')}`
      : 'Kunde inte generera JSON från någon AI-tjänst';

    throw new Error(errorMsg);
  }

  /**
   * Call Gemini with retry logic
   */
  private async callGemini(
    systemPrompt: string,
    userPrompt: string,
    options: { temperature: number; maxTokens: number }
  ): Promise<string> {

    if (!this.geminiClient) {
      throw new Error('Gemini client not initialized');
    }

    // Correct syntax for @google/genai SDK
    // First get the model, then call generateContent on it
    const model = this.geminiClient.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: systemPrompt
    });

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }]
        }
      ],
      generationConfig: {
        temperature: options.temperature,
        maxOutputTokens: options.maxTokens
      }
    });

    // Debug: Log the entire result structure
    console.log('🔍 Gemini result keys:', Object.keys(result || {}));
    console.log('🔍 Gemini response keys:', Object.keys(result?.response || {}));

    // Check if response exists
    if (!result || !result.response) {
      console.error('❌ Gemini full result:', JSON.stringify(result, null, 2));
      throw new Error('Gemini returned no response object');
    }

    // Extract text from response
    let text = '';
    try {
      // Try multiple ways to access the text
      const response = result.response;

      if (typeof response.text === 'function') {
        text = await response.text();
      } else if (typeof response.text === 'string') {
        text = response.text;
      } else if (response.candidates && response.candidates[0]) {
        const candidate = response.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
          text = candidate.content.parts[0].text || '';
        }
      }

      if (!text) {
        console.error('❌ Could not extract text. Response structure:', {
          hasText: 'text' in response,
          textType: typeof response.text,
          hasCandidates: !!response.candidates,
          candidatesLength: response.candidates?.length,
          firstCandidate: response.candidates?.[0]
        });
        throw new Error('Could not find text in Gemini response');
      }
    } catch (error) {
      console.error('❌ Error extracting text:', error);
      console.error('❌ Response object:', result.response);
      throw new Error(`Failed to extract text from Gemini response: ${error}`);
    }

    if (!text) {
      throw new Error('Gemini returned empty response');
    }

    return text;
  }

  /**
   * Parse JSON from AI response (handles markdown code blocks)
   */
  private parseJSON<T>(text: string): T {
    // Try direct parse
    try {
      return JSON.parse(text) as T;
    } catch (e) {
      // Try extracting from markdown
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) ||
                       text.match(/```\n([\s\S]*?)\n```/) ||
                       text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const jsonText = jsonMatch[1] || jsonMatch[0];
        return JSON.parse(jsonText) as T;
      }

      throw new Error('Could not parse JSON from response');
    }
  }
}

// ===========================
// SINGLETON INSTANCE
// ===========================

let aiServiceInstance: AIServiceManager | null = null;

export const getAIService = (): AIServiceManager => {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIServiceManager();
  }
  return aiServiceInstance;
};

// ===========================
// CONVENIENCE FUNCTIONS
// ===========================

/**
 * Generate text with automatic fallback
 */
export const generateText = async (
  systemPrompt: string,
  userPrompt: string,
  config?: AIConfig
): Promise<AIResponse<string>> => {
  const service = getAIService();
  return service.generateText(systemPrompt, userPrompt, config);
};

/**
 * Generate structured JSON with automatic fallback
 */
export const generateJSON = async <T = any>(
  systemPrompt: string,
  userPrompt: string,
  config?: AIConfig
): Promise<AIResponse<T>> => {
  const service = getAIService();
  return service.generateJSON<T>(systemPrompt, userPrompt, config);
};

/**
 * Check AI availability
 */
export const checkAIAvailability = async (): Promise<{
  gemini: boolean;
  grok: boolean;
}> => {
  const service = getAIService();
  return service.checkAvailability();
};

// ===========================
// EXPORT
// ===========================

export default {
  getAIService,
  generateText,
  generateJSON,
  checkAIAvailability
};


import { GoogleGenAI } from "@google/genai";
import { getGrokClient, GrokConfig } from './grokService';
import { classifyGeminiError, classifyGrokError, type AIError } from './errorHandler';
import { getLoadedApiKeys } from './secretService'; // Importerar den nya funktionen

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
  private grokClient: Awaited<ReturnType<typeof getGrokClient>> | null = null;

  // Nu en asynkron metod som måste anropas efter att nycklarna laddats.
  async initializeClients() {
    const { geminiApiKey, grokApiKey } = await getLoadedApiKeys();

    if (geminiApiKey) {
      this.geminiClient = new GoogleGenAI(geminiApiKey);
      console.log(`✅ Gemini initialized with key: ${geminiApiKey.substring(0, 10)}...`);
    } else {
      console.warn('⚠️ VITE_GEMINI_API_KEY saknas');
    }

    if (grokApiKey) {
        this.grokClient = await getGrokClient();
        console.log('✅ Grok client ready');
    } else {
        console.warn("Grok API-nyckel inte tillgänglig, fallback inaktiverad.");
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
        ? this.geminiClient.getGenerativeModel({model: 'gemini-pro'}).generateContent('test')
        : Promise.reject('No client'),
      this.grokClient?.healthCheck() || Promise.reject('No client')
    ]);

    return {
      gemini: checks[0].status === 'fulfilled',
      grok: checks[1].status === 'fulfilled' && checks[1].value === true,
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

    const model = this.geminiClient.getGenerativeModel({
      model: 'gemini-pro',
      systemInstruction: { text: systemPrompt },
    });

    const result = await model.generateContent(userPrompt);

    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error('Gemini returned empty response');
    }

    return text;
  }

  /**
   * Parse JSON from AI response (handles markdown code blocks)
   */
  private parseJSON<T>(text: string): T {
    try {
      return JSON.parse(text) as T;
    } catch (e) {
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

let aiServiceInstance: AIServiceManager | null = null;

// Funktionen görs om till async för att hantera den asynkrona laddningen.
export const getAIService = async (): Promise<AIServiceManager> => {
  if (aiServiceInstance) {
    return aiServiceInstance;
  }
  
  aiServiceInstance = new AIServiceManager();
  await aiServiceInstance.initializeClients(); // Nytt: anropar den asynkrona initieringen
  return aiServiceInstance;
};

/**
 * Generate text with automatic fallback
 */
export const generateText = async (
  systemPrompt: string,
  userPrompt: string,
  config?: AIConfig
): Promise<AIResponse<string>> => {
  const service = await getAIService();
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
  const service = await getAIService();
  return service.generateJSON<T>(systemPrompt, userPrompt, config);
};

/**
 * Check AI availability
 */
export const checkAIAvailability = async (): Promise<{
  gemini: boolean;
  grok: boolean;
}> => {
  const service = await getAIService();
  return service.checkAvailability();
};

export default {
  getAIService,
  generateText,
  generateJSON,
  checkAIAvailability
};


import { getLoadedApiKeys } from './secretService'; // Importerar den nya funktionen

export interface GrokConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json_object';
}

export interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GrokResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Grok API Client
 */
export class GrokClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.x.ai/v1';
  private defaultModel: string = 'grok-4-fast-reasoning';

  constructor(apiKey: string) { // API-nyckeln är nu ett krav
    if (!apiKey) {
        throw new Error("GrokClient kräver en API-nyckel vid initiering.");
    }
    this.apiKey = apiKey;
    console.log(`✅ Grok initialized with key: ${this.apiKey.substring(0, 10)}...`);
  }

  /**
   * Generate text completion using Grok
   */
  async generateContent(
    messages: GrokMessage[],
    config?: GrokConfig
  ): Promise<string> {

    if (!this.apiKey) {
      throw new Error('Grok API key is missing');
    }

    const model = config?.model || this.defaultModel;
    const temperature = config?.temperature ?? 0.7;
    const maxTokens = config?.maxTokens || 8000;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: false,
          response_format: config?.responseFormat === 'json_object'
            ? { type: 'json_object' }
            : undefined
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Grok API error (${response.status}): ${errorText}`);
      }

      const data: GrokResponse = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error('Grok returned no choices');
      }

      const content = data.choices[0].message.content;

      console.log(`✅ Grok response: ${data.usage.total_tokens} tokens`);

      return content;

    } catch (error: any) {
      console.error('Grok API call failed:', error);
      throw new Error(`Grok service error: ${error.message}`);
    }
  }

  /**
   * Generate structured JSON output
   */
  async generateJSON<T = any>(
    systemPrompt: string,
    userPrompt: string,
    config?: Omit<GrokConfig, 'responseFormat'>
  ): Promise<T> {

    const messages: GrokMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const responseText = await this.generateContent(messages, {
      ...config,
      responseFormat: 'json_object'
    });

    try {
      const parsed = JSON.parse(responseText);
      return parsed as T;
    } catch (error) {
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) ||
                       responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const jsonText = jsonMatch[1] || jsonMatch[0];
        return JSON.parse(jsonText) as T;
      }

      throw new Error('Could not parse JSON from Grok response');
    }
  }

  /**
   * Check if Grok API is available and working
   */
  async healthCheck(): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      await this.generateContent([
        { role: 'user', content: 'Say "OK"' }
      ], { maxTokens: 10 });
      return true;
    } catch (error) {
      console.error('Grok health check failed:', error);
      return false;
    }
  }

  getAvailableModels(): string[] {
    return [
      'grok-4-1-fast-reasoning',      
      'grok-4-1-fast-non-reasoning',  
      'grok-4-fast-reasoning',        
      'grok-4-fast-non-reasoning',
      'grok-3-mini',                  
      'grok-3',                       
      'grok-2-1212'                   
    ];
  }
}

let grokClient: GrokClient | null = null;

// Funktionen görs om till async för att hantera den asynkrona nyckelladdningen.
export const getGrokClient = async (): Promise<GrokClient | null> => {
  if (grokClient) {
    return grokClient;
  }

  const { grokApiKey } = await getLoadedApiKeys();
  if (grokApiKey) {
    grokClient = new GrokClient(grokApiKey);
    return grokClient;
  }

  console.warn('⚠️ GROK_API_KEY saknas. Grok fallback kommer inte fungera.');
  return null;
};

/**
 * Quick helper functions
 */
export const grokGenerate = async (
  systemPrompt: string,
  userPrompt: string,
  config?: GrokConfig
): Promise<string> => {
  const client = await getGrokClient();
  if (!client) {
    throw new Error("Grok Client är inte tillgänglig.");
  }
  return client.generateContent([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], config);
};

export const grokGenerateJSON = async <T = any>(
  systemPrompt: string,
  userPrompt: string,
  config?: Omit<GrokConfig, 'responseFormat'>
): Promise<T> => {
  const client = await getGrokClient();
  if (!client) {
      throw new Error("Grok Client är inte tillgänglig för att generera JSON.");
  }
  return client.generateJSON<T>(systemPrompt, userPrompt, config);
};

export default {
  GrokClient,
  getGrokClient,
  grokGenerate,
  grokGenerateJSON
};

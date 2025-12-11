/**
 * AI Error Handler & Classifier
 *
 * Identifies specific error types from AI providers and provides
 * user-friendly messages
 */

export type AIErrorType =
  | 'quota_exceeded'
  | 'rate_limit'
  | 'invalid_api_key'
  | 'network_error'
  | 'timeout'
  | 'invalid_response'
  | 'service_unavailable'
  | 'unknown';

export interface AIError {
  type: AIErrorType;
  provider: 'gemini' | 'grok';
  originalError: any;
  message: string;
  userMessage: string;
  isRetryable: boolean;
  suggestedAction?: string;
}

/**
 * Parse and classify error from Gemini API
 */
export function classifyGeminiError(error: any): AIError {
  const errorStr = error?.message || error?.toString() || '';
  const statusCode = error?.status || error?.statusCode;

  console.error('🔴 Gemini Error Details:', {
    message: error?.message,
    status: statusCode,
    type: error?.constructor?.name,
    stack: error?.stack?.split('\n').slice(0, 3)
  });

  // Quota exceeded (429)
  if (statusCode === 429 || errorStr.includes('quota') || errorStr.includes('RESOURCE_EXHAUSTED')) {
    return {
      type: 'quota_exceeded',
      provider: 'gemini',
      originalError: error,
      message: 'Gemini API quota har överskridits',
      userMessage: '⚠️ Gemini har nått sin dagliga gräns. Försöker med Grok istället...',
      isRetryable: false,
      suggestedAction: 'Använd Grok som fallback eller vänta till imorgon'
    };
  }

  // Rate limit (429)
  if (statusCode === 429 || errorStr.includes('rate limit') || errorStr.includes('too many requests')) {
    return {
      type: 'rate_limit',
      provider: 'gemini',
      originalError: error,
      message: 'För många requests till Gemini',
      userMessage: '⏱️ För många förfrågningar. Väntar några sekunder...',
      isRetryable: true,
      suggestedAction: 'Retry med exponential backoff'
    };
  }

  // Invalid API key (401, 403)
  if (statusCode === 401 || statusCode === 403 || errorStr.includes('API key') || errorStr.includes('authentication')) {
    return {
      type: 'invalid_api_key',
      provider: 'gemini',
      originalError: error,
      message: 'Gemini API-nyckel ogiltig eller saknas',
      userMessage: '🔑 Gemini API-nyckel fungerar inte. Använder Grok istället...',
      isRetryable: false,
      suggestedAction: 'Kontrollera att Cloud Functions är konfigurerade korrekt'
    };
  }

  // Network errors
  if (errorStr.includes('fetch') || errorStr.includes('network') || errorStr.includes('ECONNREFUSED')) {
    return {
      type: 'network_error',
      provider: 'gemini',
      originalError: error,
      message: 'Nätverksfel vid anslutning till Gemini',
      userMessage: '🌐 Kan inte nå Gemini. Försöker med Grok...',
      isRetryable: true,
      suggestedAction: 'Kontrollera internetanslutning'
    };
  }

  // Timeout
  if (errorStr.includes('timeout') || errorStr.includes('ETIMEDOUT')) {
    return {
      type: 'timeout',
      provider: 'gemini',
      originalError: error,
      message: 'Gemini svarade inte i tid',
      userMessage: '⏰ Gemini tog för lång tid. Försöker med Grok...',
      isRetryable: true,
      suggestedAction: 'Retry med längre timeout'
    };
  }

  // Invalid response (JSON parse errors, etc)
  if (errorStr.includes('JSON') || errorStr.includes('parse') || errorStr.includes('unexpected token')) {
    return {
      type: 'invalid_response',
      provider: 'gemini',
      originalError: error,
      message: 'Gemini returnerade ogiltigt svar',
      userMessage: '📄 Gemini gav felaktigt svar. Försöker med Grok...',
      isRetryable: true,
      suggestedAction: 'Prompt kan behöva justeras'
    };
  }

  // Service unavailable (500, 503)
  if (statusCode >= 500 || errorStr.includes('service unavailable') || errorStr.includes('internal error')) {
    return {
      type: 'service_unavailable',
      provider: 'gemini',
      originalError: error,
      message: 'Gemini-tjänsten är tillfälligt nere',
      userMessage: '🚧 Gemini har tekniska problem. Använder Grok...',
      isRetryable: true,
      suggestedAction: 'Retry efter några minuter'
    };
  }

  // Unknown error
  return {
    type: 'unknown',
    provider: 'gemini',
    originalError: error,
    message: errorStr || 'Okänt fel från Gemini',
    userMessage: '❌ Ett oväntat fel uppstod. Försöker alternativ AI...',
    isRetryable: false,
    suggestedAction: 'Kontrollera console för detaljer'
  };
}

/**
 * Parse and classify error from Grok API
 */
export function classifyGrokError(error: any): AIError {
  const errorStr = error?.message || error?.toString() || '';
  const statusCode = error?.status || error?.statusCode;

  console.error('🔴 Grok Error Details:', {
    message: error?.message,
    status: statusCode,
    type: error?.constructor?.name
  });

  if (statusCode === 429) {
    return {
      type: 'quota_exceeded',
      provider: 'grok',
      originalError: error,
      message: 'Grok API quota överskreds',
      userMessage: '⚠️ Grok har nått sin gräns. Använder standarddata...',
      isRetryable: false
    };
  }

  if (statusCode === 401 || statusCode === 403 || errorStr.includes('API key')) {
    return {
      type: 'invalid_api_key',
      provider: 'grok',
      originalError: error,
      message: 'Grok API-nyckel ogiltig',
      userMessage: '🔑 Grok API-nyckel fungerar inte. Använder standarddata...',
      isRetryable: false,
      suggestedAction: 'Kontrollera att Cloud Functions är konfigurerade korrekt'
    };
  }

  if (errorStr.includes('API key is missing')) {
    return {
      type: 'invalid_api_key',
      provider: 'grok',
      originalError: error,
      message: 'Grok API-nyckel saknas',
      userMessage: '🔑 Grok API-nyckel saknas. Använder standarddata...',
      isRetryable: false,
      suggestedAction: 'Kontrollera att Cloud Functions är konfigurerade med Grok API-nyckel'
    };
  }

  return {
    type: 'unknown',
    provider: 'grok',
    originalError: error,
    message: errorStr || 'Okänt fel från Grok',
    userMessage: '❌ Grok fungerar inte. Använder standarddata...',
    isRetryable: false
  };
}

/**
 * Get user-friendly error summary
 */
export function getErrorSummary(errors: AIError[]): string {
  if (errors.length === 0) return 'Inget fel';

  if (errors.length === 1) {
    return errors[0].userMessage;
  }

  // Multiple errors
  const geminiError = errors.find(e => e.provider === 'gemini');
  const grokError = errors.find(e => e.provider === 'grok');

  if (geminiError && grokError) {
    return `❌ Både Gemini och Grok fungerar inte just nu. Använder standarddata.\n\nGemini: ${geminiError.message}\nGrok: ${grokError.message}`;
  }

  return errors.map(e => e.userMessage).join('\n');
}

export default {
  classifyGeminiError,
  classifyGrokError,
  getErrorSummary
};

/**
 * Secret Service (DEPRECATED)
 *
 * API keys are now managed securely in Cloud Functions.
 * This service is kept for backward compatibility but no longer loads secrets.
 *
 * All AI calls should go through aiProxyService.ts which uses Cloud Functions.
 */

interface ApiKeys {
  geminiApiKey: string | null;
  grokApiKey: string | null;
}

/**
 * @deprecated API keys are now managed in Cloud Functions
 * This function returns null values for backward compatibility
 */
export const loadApiKeys = async (): Promise<ApiKeys> => {
  console.info('ℹ️ API keys are now managed securely in Cloud Functions.');
  console.info('   Use aiProxyService.ts for all AI operations.');
  return {
    geminiApiKey: null,
    grokApiKey: null
  };
};

/**
 * @deprecated API keys are now managed in Cloud Functions
 * This function returns null values for backward compatibility
 */
export const getLoadedApiKeys = async (): Promise<ApiKeys> => {
  return loadApiKeys();
};

/**
 * @deprecated Secrets are now managed in Cloud Functions
 */
export const getSecret = async (secretName: string): Promise<string | null> => {
  console.warn(`⚠️ getSecret('${secretName}') is deprecated. Secrets are managed in Cloud Functions.`);
  return null;
};

export default {
  loadApiKeys,
  getLoadedApiKeys,
  getSecret
};

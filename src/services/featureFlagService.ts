/**
 * FEATURE FLAG SERVICE
 * Hanterar logik för feature flags, A/B-testning och gradvis utrullning.
 */

import { FEATURES, AdvancedFeature, getCurrentEnvironment, isDevelopment } from '@/config/features';

/**
 * Simple hash function for consistent A/B bucketing
 * Returns a number between 0-99
 */
const hashUserId = (userId: string, featureName: string): number => {
  const str = `${userId}_${featureName}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % 100;
};

/**
 * Check if a feature is enabled for a specific user
 * Takes rollout percentage, whitelist/blacklist, and environment into account
 */
export const isFeatureEnabledForUser = (
  featureName: keyof typeof FEATURES,
  userId?: string
): boolean => {
  const feature = FEATURES[featureName];

  // Simple boolean features
  if (typeof feature === 'boolean') {
    return feature;
  }

  // String features (versions) are always "enabled"
  if (typeof feature === 'string') {
    return true;
  }

  // Advanced feature config
  if (typeof feature === 'object' && 'enabled' in feature) {
    const advFeature = feature as AdvancedFeature;

    // Base check: Is feature globally enabled?
    if (!advFeature.enabled) {
      return false;
    }

    // Environment check
    if (advFeature.environments && advFeature.environments.length > 0) {
      const currentEnv = getCurrentEnvironment();
      if (!advFeature.environments.includes(currentEnv)) {
        return false;
      }
    }

    // If no userId provided, return base enabled status
    if (!userId) {
      return advFeature.enabled;
    }

    // Blacklist check (takes precedence)
    if (advFeature.userBlacklist && advFeature.userBlacklist.includes(userId)) {
      return false;
    }

    // Whitelist check (overrides rollout percentage)
    if (advFeature.userWhitelist && advFeature.userWhitelist.includes(userId)) {
      return true;
    }

    // Rollout percentage check (A/B testing)
    if (advFeature.rolloutPercentage !== undefined) {
      const userBucket = hashUserId(userId, String(featureName));
      return userBucket < advFeature.rolloutPercentage;
    }

    // Default: enabled
    return true;
  }

  return false;
};

/**
 * Get the active version of a feature (for prompt versioning)
 */
export const getFeatureVersion = <T extends string>(
  featureName: keyof typeof FEATURES,
  userId?: string
): T => {
  const feature = FEATURES[featureName];

  // If it's a string, return it directly
  if (typeof feature === 'string') {
    return feature as T;
  }

  // Default fallback (should not happen in normal use)
  return 'v1' as T;
};

/**
 * Get AI model version with feature flag override
 */
export const getAIModelVersion = (): string => {
  return FEATURES.AI_MODEL_VERSION;
};

/**
 * Get AI persona version for a specific user
 * Supports A/B testing between different personalities
 */
export const getAIPersonaVersion = (userId?: string): string => {
  // Future: Could add A/B logic here
  // For now, just return configured version
  return FEATURES.AI_PERSONA_VERSION;
};

/**
 * Get base prompt version for a specific user
 */
export const getBasePromptVersion = (userId?: string): string => {
  return FEATURES.BASE_PROMPT_VERSION;
};

/**
 * Developer override system (localStorage-based for dev/testing)
 */
const DEV_OVERRIDE_KEY = 'elton_feature_overrides';

export const setDevOverride = (featureName: string, enabled: boolean): void => {
  if (!isDevelopment()) {
    console.warn('Dev overrides only work in development environment');
    return;
  }

  try {
    const overrides = getDevOverrides();
    overrides[featureName] = enabled;
    localStorage.setItem(DEV_OVERRIDE_KEY, JSON.stringify(overrides));
  } catch (e) {
    console.error('Failed to set dev override:', e);
  }
};

export const getDevOverrides = (): Record<string, boolean> => {
  if (!isDevelopment()) {
    return {};
  }

  try {
    const stored = localStorage.getItem(DEV_OVERRIDE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    return {};
  }
};

export const clearDevOverrides = (): void => {
  try {
    localStorage.removeItem(DEV_OVERRIDE_KEY);
  } catch (e) {
    console.error('Failed to clear dev overrides:', e);
  }
};

/**
 * Check if feature is enabled with dev override support
 */
export const isFeatureEnabled = (
  featureName: keyof typeof FEATURES,
  userId?: string
): boolean => {
  // Check dev overrides first
  if (isDevelopment()) {
    const overrides = getDevOverrides();
    if (featureName in overrides) {
      return overrides[featureName];
    }
  }

  return isFeatureEnabledForUser(featureName, userId);
};

/**
 * Get all enabled features for a user (useful for debugging/analytics)
 */
export const getEnabledFeatures = (userId?: string): string[] => {
  const enabled: string[] = [];

  for (const featureName in FEATURES) {
    if (isFeatureEnabled(featureName as keyof typeof FEATURES, userId)) {
      enabled.push(featureName);
    }
  }

  return enabled;
};

/**
 * Get feature metadata (for admin UI)
 */
export const getFeatureMetadata = (featureName: keyof typeof FEATURES) => {
  const feature = FEATURES[featureName];

  if (typeof feature === 'object' && 'enabled' in feature) {
    const advFeature = feature as AdvancedFeature;
    return {
      enabled: advFeature.enabled,
      description: advFeature.description,
      releaseDate: advFeature.releaseDate,
      rolloutPercentage: advFeature.rolloutPercentage,
      environments: advFeature.environments,
      hasWhitelist: !!advFeature.userWhitelist?.length,
      hasBlacklist: !!advFeature.userBlacklist?.length
    };
  }

  return {
    enabled: typeof feature === 'boolean' ? feature : true,
    description: undefined,
    releaseDate: undefined
  };
};

/**
 * Calculate which rollout bucket a user is in (0-99)
 * Useful for debugging A/B tests
 */
export const getUserRolloutBucket = (userId: string, featureName: string): number => {
  return hashUserId(userId, featureName);
};

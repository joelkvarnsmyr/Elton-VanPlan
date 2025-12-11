/**
 * FEATURE FLAGS & CONFIGURATION
 * Centraliserad konfiguration för alla features i applikationen.
 * Möjliggör A/B-testning, gradvis utrullning och miljöspecifika inställningar.
 */

export type Environment = 'dev' | 'staging' | 'prod';

export interface FeatureConfig {
  enabled: boolean;
  rolloutPercentage?: number; // 0-100, för gradvis utrullning
  userWhitelist?: string[];    // UIDs som alltid får tillgång
  userBlacklist?: string[];    // UIDs som aldrig får tillgång
  environments?: Environment[]; // Vilka miljöer featuren är aktiv i
  description?: string;
  releaseDate?: string; // ISO date
}

// Simple feature flags (bara boolean)
export type SimpleFeature = boolean;

// Feature flag config (avancerat med rollout etc)
export type AdvancedFeature = FeatureConfig;

/**
 * MAIN FEATURE FLAGS CONFIGURATION
 */
export const FEATURES = {
  // ============================================
  // AI & MODELS
  // ============================================
  AI_MODEL_VERSION: 'gemini-2.0-flash-exp' as const, // Centraliserad modellval

  ENABLE_LIVE_ELTON: {
    enabled: true,
    description: 'Live röst och video-chat med Elton (WebRTC)',
    releaseDate: '2025-01-15'
  } as AdvancedFeature,

  ENABLE_SOUND_DOCTOR: {
    enabled: true,
    rolloutPercentage: 100, // Släppt till alla
    description: 'AI lyssnar på motorljud och diagnostiserar',
    releaseDate: '2025-01-10'
  } as AdvancedFeature,

  ENABLE_MULTIMODAL_VISION: {
    enabled: true,
    description: 'Bildanalys för regplåtar, kvitton, och bilder',
    releaseDate: '2024-12-01'
  } as AdvancedFeature,

  // ============================================
  // PROMPT VERSIONING (A/B TESTING)
  // ============================================
  AI_PERSONA_VERSION: 'v1_standard' as 'v1_standard' | 'v2_funny',
  BASE_PROMPT_VERSION: 'v1' as 'v1' | 'v2_strict',
  DETECTIVE_AGENT_VERSION: 'v1' as 'v1', // Future: v2 med mer advanced search
  PLANNER_AGENT_VERSION: 'v1' as 'v1',   // Future: v2 med risk analysis

  // ============================================
  // BACKEND & INFRASTRUCTURE
  // ============================================
  USE_CLOUD_FUNCTIONS: {
    enabled: false,
    description: 'Använd Firebase Cloud Functions istället för client-side API-anrop',
    environments: ['prod']
  } as AdvancedFeature,

  ENABLE_WEBRTC: {
    enabled: true,
    description: 'WebRTC-stöd för Live Elton',
    releaseDate: '2025-01-15'
  } as AdvancedFeature,

  OFFLINE_MODE: {
    enabled: false,
    description: 'PWA offline-stöd (kommer i v1.5)',
    environments: []
  } as AdvancedFeature,

  // ============================================
  // CORE FEATURES
  // ============================================
  ENABLE_CO_WORKING: {
    enabled: true,
    description: 'Bjud in medmekaniker och jobba tillsammans',
    releaseDate: '2025-01-01'
  } as AdvancedFeature,

  ENABLE_MAGIC_IMPORT: {
    enabled: true,
    description: 'Importera uppgifter från text/bilder och full projektdata',
    releaseDate: '2024-12-15'
  } as AdvancedFeature,

  ENABLE_RECEIPT_OCR: {
    enabled: true,
    description: 'OCR av kvitton för automatisk inköpsregistrering',
    releaseDate: '2024-12-01'
  } as AdvancedFeature,

  ENABLE_PROJECT_EXPORT: {
    enabled: true,
    description: 'Exportera och importera kompletta projekt (JSON)',
    releaseDate: '2025-01-05'
  } as AdvancedFeature,

  ENABLE_KNOWLEDGE_BASE: {
    enabled: true,
    description: 'Kunskapsbas med tekniska artiklar och rapporter',
    releaseDate: '2024-12-20'
  } as AdvancedFeature,

  // ============================================
  // UI FEATURES
  // ============================================
  SHOW_ROADMAP_TAB: true as SimpleFeature,
  ENABLE_DARK_MODE: true as SimpleFeature,
  SHOW_TIMELINE_VIEW: true as SimpleFeature,

  ENABLE_DIALECTS: {
    enabled: true,
    description: 'Elton kan prata dialekter (Dalmål, Gotländska, Rikssvenska)',
    releaseDate: '2024-12-10'
  } as AdvancedFeature,

  // ============================================
  // BETA FEATURES (Gradvis utrullning)
  // ============================================
  ENABLE_AUTO_CART: {
    enabled: false,
    rolloutPercentage: 0, // Inte släppt än
    description: 'Lägg varor i varukorgen hos partners (Autodoc) direkt från appen',
    environments: ['dev']
  } as AdvancedFeature,

  ENABLE_SMART_CONTEXT: {
    enabled: false,
    rolloutPercentage: 25, // Beta-test med 25% av användare
    description: 'Visar automatiskt relevant data (däckdimensioner etc) på uppgifter',
    releaseDate: '2025-01-20'
  } as AdvancedFeature,

  ENABLE_FUEL_LOG_GRAPHS: {
    enabled: false,
    rolloutPercentage: 50,
    description: 'Visualisering av bränsleförbrukning med grafer',
    releaseDate: '2025-01-10'
  } as AdvancedFeature,

  // ============================================
  // EXPERIMENTAL (Dev only)
  // ============================================
  ENABLE_ICON_GENERATION: {
    enabled: false,
    description: 'AI-genererade projektikoner (Nano Banana / Imagen)',
    environments: ['dev'],
    userWhitelist: [] // Lägg till test-UIDs här
  } as AdvancedFeature,

  ENABLE_DEEP_RESEARCH_V3: {
    enabled: false,
    description: 'Ny version av Deep Research med förbättrad search',
    environments: ['dev']
  } as AdvancedFeature
};

/**
 * ENVIRONMENT DETECTION
 */
export const getCurrentEnvironment = (): Environment => {
  // Check hostname
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'dev';
  } else if (hostname.includes('staging') || hostname.includes('preview')) {
    return 'staging';
  } else {
    return 'prod';
  }
};

/**
 * HELPER: Check if we're in development mode
 */
export const isDevelopment = (): boolean => {
  return getCurrentEnvironment() === 'dev';
};

/**
 * QUICK ACCESS HELPERS
 */
export const isFeatureEnabled = (featureName: keyof typeof FEATURES): boolean => {
  const feature = FEATURES[featureName];

  // Simple boolean feature
  if (typeof feature === 'boolean') {
    return feature;
  }

  // String values (versions) always "enabled"
  if (typeof feature === 'string') {
    return true;
  }

  // Advanced feature config
  if (typeof feature === 'object' && 'enabled' in feature) {
    return feature.enabled;
  }

  return false;
};

// Export for easy access
export default FEATURES;

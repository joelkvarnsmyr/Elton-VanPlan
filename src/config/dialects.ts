/**
 * Centralized Dialect Configuration
 *
 * Maps dialect IDs to their metadata, including:
 * - UI labels and descriptions
 * - Voice names for LiveElton (Gemini Live API)
 * - Integration with promptBuilder DialectId type
 */

import { DialectId } from '@/services/promptBuilder';

export interface DialectConfig {
  id: DialectId;
  label: string;
  description: string;
  voiceName: 'Fenrir' | 'Charon' | 'Puck' | 'Kore'; // Gemini Live voice options
  examples?: string[];
}

/**
 * All available dialects for the application
 */
export const DIALECTS: Record<DialectId, DialectConfig> = {
  standard: {
    id: 'standard',
    label: 'Standard',
    description: 'Neutral svensk fordon-personlighet',
    voiceName: 'Puck',
    examples: ['Jag är din pålitliga följeslagare', 'Låt oss kolla på motorn']
  },

  dalmal: {
    id: 'dalmal',
    label: 'Dala-Elton',
    description: 'Trygg, gubbig & bred Dalmål',
    voiceName: 'Fenrir',
    examples: ['Hörru du', 'Dä ordner sä', 'Int ska du väl...', 'Kaffe?']
  },

  gotlandska: {
    id: 'gotlandska',
    label: 'Gotlands-Elton',
    description: 'Släpig, melodiös & "Raukar-lugn"',
    voiceName: 'Charon',
    examples: ['Raukt!', 'Bäut', 'Håll i håle', 'Lagom bra']
  },

  rikssvenska: {
    id: 'rikssvenska',
    label: 'Riks-Elton',
    description: 'Tydlig, modern & neutral',
    voiceName: 'Kore',
    examples: ['Välkommen', 'Låt oss analysera situationen', 'Tack för informationen']
  }
};

/**
 * Get dialect configuration by ID
 */
export function getDialectConfig(dialectId?: DialectId): DialectConfig {
  return DIALECTS[dialectId || 'standard'];
}

/**
 * Get all available dialects as array (for UI rendering)
 */
export function getAllDialects(): DialectConfig[] {
  return Object.values(DIALECTS);
}

/**
 * Get voice name for a specific dialect (for Gemini Live API)
 */
export function getVoiceName(dialectId?: DialectId): string {
  return getDialectConfig(dialectId).voiceName;
}

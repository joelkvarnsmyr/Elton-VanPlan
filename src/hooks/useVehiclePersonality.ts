/**
 * useVehiclePersonality Hook
 *
 * Shared hook for building vehicle-specific AI personalities
 * Used by both AIAssistant (text chat) and LiveElton (voice chat)
 *
 * Provides consistent personality across all interaction modes
 */

import { useMemo } from 'react';
import { VehicleData } from '@/types/types';
import {
  buildPersonalizedPrompt,
  buildSoundDoctorPrompt,
  DialectId
} from '@/services/promptBuilder';
import { getDialectConfig } from '@/config/dialects';

export interface PersonalityOptions {
  vehicleData: VehicleData;
  projectName?: string;
  dialectId?: DialectId;
  diagnosticMode?: boolean;
}

export interface PersonalityResult {
  systemPrompt: string;
  aiName: string;
  dialectLabel: string;
  voiceName: string;
}

/**
 * Build AI personality prompt with vehicle-specific context
 *
 * @param options - Configuration for personality generation
 * @returns Formatted system prompt and metadata
 *
 * @example
 * ```tsx
 * const { systemPrompt, aiName } = useVehiclePersonality({
 *   vehicleData: project.vehicleData,
 *   projectName: project.name,
 *   dialectId: 'dalmal',
 *   diagnosticMode: false
 * });
 * ```
 */
export function useVehiclePersonality(options: PersonalityOptions): PersonalityResult {
  const { vehicleData, projectName, dialectId = 'standard', diagnosticMode = false } = options;

  // Get dialect configuration
  const dialectConfig = useMemo(() => getDialectConfig(dialectId), [dialectId]);

  // Determine AI name (project nickname or "AI Assistant")
  const aiName = useMemo(() => {
    return projectName?.trim() || 'AI Assistant';
  }, [projectName]);

  // Build system prompt
  const systemPrompt = useMemo(() => {
    if (diagnosticMode) {
      // Sound Doctor mode - specialized for audio diagnostics
      return buildSoundDoctorPrompt(vehicleData);
    } else {
      // Standard mode - personalized vehicle personality
      return buildPersonalizedPrompt(vehicleData, dialectId, aiName);
    }
  }, [vehicleData, dialectId, aiName, diagnosticMode]);

  return {
    systemPrompt,
    aiName,
    dialectLabel: dialectConfig.label,
    voiceName: dialectConfig.voiceName
  };
}

/**
 * Build greeting message for initial chat
 *
 * @param aiName - Name of the AI (project nickname or "AI Assistant")
 * @param vehicleData - Vehicle information
 * @returns Friendly greeting message
 */
export function buildGreeting(aiName: string, vehicleData: VehicleData): string {
  const { make, model, year } = vehicleData;

  if (aiName === 'AI Assistant') {
    // Generic greeting when no nickname
    return `Hallå där! 🚐💨 Jag är din ${make} ${model} från ${year}. Vad ska vi hitta på?`;
  } else {
    // Personal greeting with nickname
    return `Hallå där! 🚐💨 Det är jag som är ${aiName}. Vad ska vi hitta på?`;
  }
}

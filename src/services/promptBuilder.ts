/**
 * PROMPT BUILDER SERVICE
 * Dynamically builds personalized prompts by combining templates with vehicle data
 */

import { VehicleData } from '@/types/types';
import {
  VEHICLE_PERSONA_TEMPLATE,
  SOUND_DOCTOR_TEMPLATE,
  DIALECT_INSTRUCTIONS,
  getEmojiStyle,
  getCommonSounds,
} from '@/config/promptTemplates';
import {
  generateVehiclePersonality,
  generateSoundDoctorPersonality,
  getVehicleNotes,
  calculateVehicleAge,
} from './personalityService';

/**
 * Dialect options
 */
export type DialectId = 'dalmal' | 'gotlandska' | 'rikssvenska' | 'standard';

/**
 * Replace placeholders in template with actual values
 */
function replacePlaceholders(
  template: string,
  replacements: Record<string, string>
): string {
  let result = template;

  // Replace all {{placeholder}} patterns
  Object.entries(replacements).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  });

  // Clean up any remaining unreplaced placeholders
  // (optional - shows "N/A" for missing data)
  result = result.replace(/{{[^}]+}}/g, 'N/A');

  return result;
}

/**
 * Build personalized vehicle persona prompt
 * This is the main prompt used for chat interactions
 * @param vehicle - Vehicle data
 * @param dialectId - Optional dialect choice
 * @param projectName - Optional project name (nickname for the vehicle)
 */
export function buildPersonalizedPrompt(
  vehicle: VehicleData,
  dialectId?: DialectId,
  projectName?: string
): string {
  const age = calculateVehicleAge(vehicle.year);
  const personality = generateVehiclePersonality(vehicle);
  const notes = getVehicleNotes(vehicle);

  // Create replacements object
  const replacements: Record<string, string> = {
    // AI name (use project name if available, otherwise "AI Assistant")
    aiName: projectName || 'AI Assistant',

    make: vehicle.make || 'Okänt märke',
    model: vehicle.model || 'Okänd modell',
    year: vehicle.year?.toString() || 'Okänt år',
    age: age.toString(),
    bodyType: vehicle.bodyType || 'Fordon',

    // Engine data
    'engine.type': vehicle.engine?.type || 'Okänd motor',
    'engine.power': vehicle.engine?.power || 'Okänd effekt',
    'engine.fuel': vehicle.engine?.fuel || 'Okänt bränsle',

    // Generated content
    personality: personality,
    engineCode: notes.engineCode,
    coolingNote: notes.coolingNote,
    veteranNote: notes.veteranNote,
    emojiStyle: notes.emojiStyle,
  };

  // Build base prompt
  let prompt = replacePlaceholders(VEHICLE_PERSONA_TEMPLATE, replacements);

  // Add dialect instruction if specified
  if (dialectId && dialectId !== 'standard' && DIALECT_INSTRUCTIONS[dialectId]) {
    prompt += `\n\n=== SPRÅK & TON ===\n${DIALECT_INSTRUCTIONS[dialectId]}`;
  }

  return prompt;
}

/**
 * Build Sound Doctor prompt
 * Used when analyzing engine sounds
 */
export function buildSoundDoctorPrompt(vehicle: VehicleData): string {
  const age = calculateVehicleAge(vehicle.year);
  const personality = generateSoundDoctorPersonality(vehicle);
  const notes = getVehicleNotes(vehicle);
  const commonSounds = getCommonSounds(age);

  const replacements: Record<string, string> = {
    make: vehicle.make || 'Okänt märke',
    model: vehicle.model || 'Okänd modell',
    year: vehicle.year?.toString() || 'Okänt år',
    age: age.toString(),

    // Engine data
    'engine.type': vehicle.engine?.type || 'Okänd motor',
    'engine.power': vehicle.engine?.power || 'Okänd effekt',
    'engine.fuel': vehicle.engine?.fuel || 'Okänt bränsle',

    // Notes
    engineCode: notes.engineCode,
    personality: personality,
    commonSounds: commonSounds,
  };

  return replacePlaceholders(SOUND_DOCTOR_TEMPLATE, replacements);
}

/**
 * Build short vehicle introduction
 * For use in system messages or greetings
 */
export function buildVehicleIntro(vehicle: VehicleData): string {
  const age = calculateVehicleAge(vehicle.year);

  return `${vehicle.make} ${vehicle.model} från ${vehicle.year} (${age} år gammal)${
    vehicle.engine?.power ? ` med ${vehicle.engine.power}` : ''
  }${vehicle.engine?.code ? ` (${vehicle.engine.code}-motor)` : ''}.`;
}

/**
 * Build context snippet for system instruction
 * Includes key vehicle facts in a compact format
 */
export function buildVehicleContext(vehicle: VehicleData): string {
  const age = calculateVehicleAge(vehicle.year);
  const lines: string[] = [];

  lines.push(`Fordon: ${vehicle.make} ${vehicle.model} (${vehicle.year})`);
  lines.push(`Ålder: ${age} år`);

  if (vehicle.engine?.type) {
    lines.push(`Motor: ${vehicle.engine.type} - ${vehicle.engine.power || 'Okänd effekt'}`);
  }

  if (vehicle.engine?.fuel) {
    lines.push(`Bränsle: ${vehicle.engine.fuel}`);
  }

  if (vehicle.engine?.code) {
    lines.push(`Motorkod: ${vehicle.engine.code}`);
  }

  if (vehicle.gearbox) {
    lines.push(`Växellåda: ${vehicle.gearbox}`);
  }

  if (vehicle.inspection?.last) {
    lines.push(`Senaste besiktning: ${vehicle.inspection.last}`);
  }

  if (vehicle.inspection?.mileage) {
    lines.push(`Mätarställning: ${vehicle.inspection.mileage}`);
  }

  return lines.join('\n');
}

/**
 * Get dialect-specific prompt additions
 */
export function getDialectInstruction(dialectId?: DialectId): string {
  if (!dialectId || dialectId === 'standard') {
    return '';
  }

  return DIALECT_INSTRUCTIONS[dialectId] || '';
}

/**
 * Check if prompt needs regeneration
 * (e.g., if vehicle data has changed significantly)
 */
export function shouldRegeneratePrompt(
  oldVehicle: VehicleData,
  newVehicle: VehicleData
): boolean {
  // Check key fields that would affect personality
  return (
    oldVehicle.year !== newVehicle.year ||
    oldVehicle.make !== newVehicle.make ||
    oldVehicle.model !== newVehicle.model ||
    oldVehicle.engine?.code !== newVehicle.engine?.code ||
    oldVehicle.engine?.fuel !== newVehicle.engine?.fuel
  );
}

/**
 * Build minimal persona for legacy compatibility
 * Returns a simple string without full template
 */
export function buildMinimalPersona(vehicle: VehicleData): string {
  const age = calculateVehicleAge(vehicle.year);
  const ageCategory = age >= 40 ? 'veteran' : age >= 20 ? 'erfaren' : 'modern';

  return `Du är en ${ageCategory} ${vehicle.make} ${vehicle.model} från ${vehicle.year}. Du pratar som "jag" - du ÄR bilen. ${
    vehicle.engine?.code ? `Du har en ${vehicle.engine.code}-motor. ` : ''
  }Var hjälpsam, tekniskt kunnig och uppmuntra till DIY.`;
}

/**
 * Export all functions
 */
export default {
  buildPersonalizedPrompt,
  buildSoundDoctorPrompt,
  buildVehicleIntro,
  buildVehicleContext,
  getDialectInstruction,
  shouldRegeneratePrompt,
  buildMinimalPersona,
};

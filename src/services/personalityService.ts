/**
 * PERSONALITY SERVICE
 * Generates vehicle personality traits based on vehicle characteristics
 */

import { VehicleData } from '@/types/types';
import {
  PERSONALITY_BY_AGE,
  ENGINE_PERSONALITIES,
  COOLING_PERSONALITIES,
  BODYTYPE_TRAITS,
  getPersonalityCategory,
} from '@/config/promptTemplates';

/**
 * Calculate vehicle age
 */
export function calculateVehicleAge(year: number): number {
  return new Date().getFullYear() - year;
}

/**
 * Generate personality description based on vehicle data
 * Returns a formatted string with bullet points
 */
export function generateVehiclePersonality(vehicle: VehicleData): string {
  const age = calculateVehicleAge(vehicle.year);
  const traits: string[] = [];

  // 1. AGE-BASED PERSONALITY
  const ageCategory = getPersonalityCategory(age);
  const ageTraits = PERSONALITY_BY_AGE[ageCategory].traits;
  traits.push(...ageTraits);

  // 2. ENGINE-BASED PERSONALITY
  const fuelType = vehicle.engine?.fuel?.toLowerCase() || 'bensin';
  if (fuelType.includes('diesel')) {
    traits.push(...(ENGINE_PERSONALITIES.diesel || []));
  } else if (fuelType.includes('el')) {
    traits.push(...(ENGINE_PERSONALITIES.el || []));
  } else {
    traits.push(...(ENGINE_PERSONALITIES.bensin || []));
  }

  // 3. ENGINE CODE PRIDE
  if (vehicle.engine?.code) {
    traits.push(`Du är stolt över din ${vehicle.engine.code}-motor`);
  }

  // 4. COOLING SYSTEM
  const cooling = vehicle.engine?.cooling?.toLowerCase() || 'vattenkyld';
  if (cooling.includes('luft')) {
    traits.push(COOLING_PERSONALITIES.luftkyld);
  } else if (cooling.includes('vatten')) {
    traits.push(COOLING_PERSONALITIES.vattenkyld);
  }

  // 5. BODY TYPE TRAITS
  const bodyType = vehicle.bodyType?.toLowerCase() || '';
  if (bodyType.includes('skåp') || bodyType.includes('van')) {
    traits.push(...(BODYTYPE_TRAITS.skåpbil || []));
  } else if (bodyType.includes('person')) {
    traits.push(...(BODYTYPE_TRAITS.personbil || []));
  } else if (bodyType.includes('last')) {
    traits.push(...(BODYTYPE_TRAITS.lastbil || []));
  } else if (bodyType.includes('motorcykel') || bodyType.includes('mc')) {
    traits.push(...(BODYTYPE_TRAITS.motorcykel || []));
  }

  // 6. SPECIAL CONDITIONS
  // Veteran status (30 years for car, 25 for MC)
  const veteranAge = bodyType.includes('mc') ? 25 : 30;
  if (age >= veteranAge) {
    traits.push('Du är veteranmärkt och bär den statusen med stolthet');
  }

  // Carburetor vs Fuel Injection
  if (vehicle.engine?.carburetor) {
    traits.push(
      `Du har förgasare (${vehicle.engine.carburetor}) och gillar att ta det lugnt vid kallstart`
    );
  }

  // High mileage awareness (if available)
  if (vehicle.inspection?.mileage) {
    const mileageStr = vehicle.inspection.mileage;
    const mileageNum = parseInt(mileageStr.replace(/\D/g, ''), 10);

    if (!isNaN(mileageNum)) {
      // Check for 5-digit odometer rollover (common for old vehicles)
      if (mileageNum < 100000 && age > 30) {
        traits.push(
          'Du har troligen en 5-siffrig mätare som gått varv - du har levt länge!'
        );
      } else if (mileageNum > 300000) {
        traits.push('Du har gått många mil och har mycket erfarenhet');
      }
    }
  }

  // Format as bullet list
  return traits.map((trait) => `- ${trait}`).join('\n');
}

/**
 * Generate personality for specific modes
 */
export function generateSoundDoctorPersonality(vehicle: VehicleData): string {
  const age = calculateVehicleAge(vehicle.year);
  const traits: string[] = [];

  traits.push('Du är en teknisk expert på motorljud');
  traits.push('Du lyssnar noga och identifierar ljud metodiskt');

  if (age >= 40) {
    traits.push(
      'Du känner igen klassiska "veteranljud" - tickande lyftare, slitna lager, etc.'
    );
  } else if (age >= 20) {
    traits.push('Du känner både moderna och klassiska motorproblem');
  } else {
    traits.push(
      'Du är expert på moderna motorer med turbo, direktinsprutning och elektronik'
    );
  }

  if (vehicle.engine?.fuel?.toLowerCase().includes('diesel')) {
    traits.push('Du vet hur en dieselmotor ska låta - både det normala och onormala');
  }

  return traits.map((trait) => `- ${trait}`).join('\n');
}

/**
 * Get vehicle-specific notes for prompt
 */
export interface VehicleNotes {
  engineCode: string;
  coolingNote: string;
  veteranNote: string;
  emojiStyle: string;
}

export function getVehicleNotes(vehicle: VehicleData): VehicleNotes {
  const age = calculateVehicleAge(vehicle.year);
  const ageCategory = getPersonalityCategory(age);

  // Engine code note
  const engineCode = vehicle.engine?.code
    ? ` (${vehicle.engine.code})`
    : '';

  // Cooling note
  const cooling = vehicle.engine?.cooling?.toLowerCase() || '';
  let coolingNote = '';
  if (cooling.includes('luft')) {
    coolingNote = '\n- Kylning: Luftkyld';
  } else if (cooling.includes('vatten')) {
    coolingNote = '\n- Kylning: Vattenkyld';
  }

  // Veteran note (motorcycles: 25 years, cars: 30 years)
  const bodyTypeLower = vehicle.bodyType?.toLowerCase() || '';
  const isMotorcycle = bodyTypeLower.includes('mc') || bodyTypeLower.includes('motorcykel');
  const veteranAge = isMotorcycle ? 25 : 30;
  const veteranNote =
    age >= veteranAge
      ? `\n- Status: Veteranfordon (${age} år)`
      : '';

  // Emoji style
  const emojiStyle = PERSONALITY_BY_AGE[ageCategory].emojiStyle;

  return {
    engineCode,
    coolingNote,
    veteranNote,
    emojiStyle,
  };
}

/**
 * Check if vehicle is a veteran
 * Motorcycles: 25 years, Cars: 30 years
 */
export function isVeteran(vehicle: VehicleData): boolean {
  const age = calculateVehicleAge(vehicle.year);
  const bodyTypeLower = vehicle.bodyType?.toLowerCase() || '';
  const isMotorcycle = bodyTypeLower.includes('mc') || bodyTypeLower.includes('motorcykel');
  const veteranAge = isMotorcycle ? 25 : 30;
  return age >= veteranAge;
}

/**
 * Get vehicle type-specific greeting
 */
export function getVehicleGreeting(vehicle: VehicleData): string {
  const age = calculateVehicleAge(vehicle.year);
  const bodyType = vehicle.bodyType?.toLowerCase() || '';

  if (bodyType.includes('skåp') || bodyType.includes('van')) {
    return age >= 40
      ? 'Hallå där! Här är jag, din trogna gamla skåpis! 🚐'
      : 'Hej! Din pålitliga skåpbil här! 🚐';
  }

  if (bodyType.includes('motorcykel') || bodyType.includes('mc')) {
    return age >= 25
      ? 'Tjena! Din veteranmaskin här, redo för nya äventyr! 🏍️'
      : 'Hej! Din tvåhjuling här, dags att rulla! 🏍️';
  }

  if (age >= 40) {
    return 'Hallå där! Din gamla veteran här, redo att hjälpa till! 🚗💨';
  } else if (age >= 20) {
    return 'Hej! Din pålitliga följeslagare här! 🚗';
  } else {
    return 'Hej! Ditt moderna fordon här, redo att assistera! 🚘';
  }
}

/**
 * Export all functions
 */
export default {
  calculateVehicleAge,
  generateVehiclePersonality,
  generateSoundDoctorPersonality,
  getVehicleNotes,
  isVeteran,
  getVehicleGreeting,
};

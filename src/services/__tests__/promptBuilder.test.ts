/**
 * Prompt Builder Unit Tests
 * Tests for dynamic prompt generation with placeholder replacement
 */

import { describe, test, expect } from 'vitest';
import {
  buildPersonalizedPrompt,
  buildSoundDoctorPrompt,
  buildVehicleIntro,
  buildVehicleContext,
  getDialectInstruction,
  shouldRegeneratePrompt,
  buildMinimalPersona,
} from '@/services/promptBuilder';
import type { DialectId } from '@/services/promptBuilder';
import { VehicleData } from '@/types/types';

describe('promptBuilder', () => {
  const mockVehicle: VehicleData = {
    make: 'Volkswagen',
    model: 'LT31',
    year: 1976,
    prodYear: 1976,
    regNo: 'ABC123',
    regDate: '1976-01-01',
    status: 'I trafik',
    bodyType: 'Skåpbil',
    passengers: 3,
    inspection: { last: '2024-01-01', mileage: '150000', next: '2025-01-01' },
    engine: {
      fuel: 'Bensin',
      power: '75 HK',
      volume: '2.0L',
      type: '2.0L Bensin',
      code: 'CH',
      cooling: 'Vattenkyld',
    },
    gearbox: 'Manuell',
    wheels: {
      drive: '2WD',
      tiresFront: '195/70R15',
      tiresRear: '195/70R15',
      boltPattern: '5x112',
    },
    dimensions: { length: 5200, width: 2000, height: '2400', wheelbase: 3000 },
    weights: { curb: 1800, total: 2800, load: 1000, trailer: 2000, trailerB: 750 },
    vin: 'VIN123',
    color: 'Vit',
    history: { owners: 5, events: 20, lastOwnerChange: '2020-01-01' },
  };

  describe('buildPersonalizedPrompt', () => {
    test('replaces all placeholders correctly', () => {
      const prompt = buildPersonalizedPrompt(mockVehicle, 'standard');

      // Check key replacements
      expect(prompt).toContain('Volkswagen');
      expect(prompt).toContain('LT31');
      expect(prompt).toContain('1976');
      expect(prompt).toContain('Bensin');
      expect(prompt).toContain('CH');
    });

    test('uses projectName as aiName when provided', () => {
      const prompt = buildPersonalizedPrompt(
        mockVehicle,
        'standard',
        'Gamla Busen'
      );

      expect(prompt).toContain('Du är "Gamla Busen"');
      expect(prompt).not.toContain('Du är "AI Assistant"');
    });

    test('falls back to "AI Assistant" when no projectName', () => {
      const prompt = buildPersonalizedPrompt(mockVehicle, 'standard');

      expect(prompt).toContain('Du är "AI Assistant"');
    });

    test('falls back to "AI Assistant" when projectName is empty string', () => {
      const prompt = buildPersonalizedPrompt(mockVehicle, 'standard', '');

      expect(prompt).toContain('Du är "AI Assistant"');
    });

    test('includes dialect instructions for "dalmal"', () => {
      const prompt = buildPersonalizedPrompt(mockVehicle, 'dalmal');

      expect(prompt).toContain('DALDIALEKT');
      expect(prompt).toContain('int');
      expect(prompt).toContain('Hörru');
    });

    test('includes dialect instructions for "gotlandska"', () => {
      const prompt = buildPersonalizedPrompt(mockVehicle, 'gotlandska');

      expect(prompt).toContain('GOTLÄNDSKA');
      expect(prompt).toContain('släpigt');
      expect(prompt).toContain('melodiöst');
    });

    test('includes dialect instructions for "rikssvenska"', () => {
      const prompt = buildPersonalizedPrompt(mockVehicle, 'rikssvenska');

      expect(prompt).toContain('RIKSSVENSKA');
      expect(prompt).toContain('saklig');
      expect(prompt).toContain('korrekt');
    });

    test('does not add dialect section for "standard"', () => {
      const prompt = buildPersonalizedPrompt(mockVehicle, 'standard');

      expect(prompt).not.toContain('=== SPRÅK & TON ===');
      expect(prompt).not.toContain('DALDIALEKT');
    });

    test('handles veteran vehicle (40+ years)', () => {
      const prompt = buildPersonalizedPrompt(mockVehicle, 'standard');

      expect(prompt).toContain('gammal');
      expect(prompt).toContain('veteran');
    });

    test('handles modern vehicle (<20 years)', () => {
      const modernVehicle: VehicleData = {
        ...mockVehicle,
        year: new Date().getFullYear() - 5,
      };

      const prompt = buildPersonalizedPrompt(modernVehicle, 'standard');

      expect(prompt).toContain('modern');
      expect(prompt).toContain('teknisk');
    });

    test('includes engine code when available', () => {
      const prompt = buildPersonalizedPrompt(mockVehicle, 'standard');

      expect(prompt).toContain('(CH)');
    });

    test('handles missing engine code gracefully', () => {
      const vehicleNoCode: VehicleData = {
        ...mockVehicle,
        engine: { ...mockVehicle.engine, code: undefined },
      };

      const prompt = buildPersonalizedPrompt(vehicleNoCode, 'standard');

      // Should not crash or have "(undefined)"
      expect(prompt).not.toContain('undefined');
      expect(prompt).toContain('Volkswagen');
    });

    test('handles missing engine data gracefully', () => {
      const vehicleNoEngine: VehicleData = {
        ...mockVehicle,
        engine: { fuel: '', power: '', volume: '' },
      };

      const prompt = buildPersonalizedPrompt(vehicleNoEngine, 'standard');

      expect(prompt).toContain('Okänd motor');
      expect(prompt).toContain('Okänd effekt');
      expect(prompt).toContain('Okänt bränsle');
    });

    test('includes air-cooled note when applicable', () => {
      const airCooledVehicle: VehicleData = {
        ...mockVehicle,
        engine: { ...mockVehicle.engine, cooling: 'Luftkyld' },
      };

      const prompt = buildPersonalizedPrompt(airCooledVehicle, 'standard');

      expect(prompt).toContain('Luftkyld');
    });

    test('includes veteran note for 30+ year old vehicle', () => {
      const prompt = buildPersonalizedPrompt(mockVehicle, 'standard');
      const age = new Date().getFullYear() - mockVehicle.year;

      if (age >= 30) {
        expect(prompt).toContain('Veteranfordon');
      }
    });

    test('handles special characters in projectName', () => {
      const prompt = buildPersonalizedPrompt(
        mockVehicle,
        'standard',
        'Blå-Bärspaj 2.0'
      );

      expect(prompt).toContain('Du är "Blå-Bärspaj 2.0"');
    });

    test('handles Swedish characters (åäö) in projectName', () => {
      const prompt = buildPersonalizedPrompt(
        mockVehicle,
        'standard',
        'Sjöhästen'
      );

      expect(prompt).toContain('Du är "Sjöhästen"');
    });
  });

  describe('buildSoundDoctorPrompt', () => {
    test('includes vehicle make and model', () => {
      const prompt = buildSoundDoctorPrompt(mockVehicle);

      expect(prompt).toContain('Volkswagen');
      expect(prompt).toContain('LT31');
    });

    test('includes engine specs', () => {
      const prompt = buildSoundDoctorPrompt(mockVehicle);

      // Template uses engine.type and engine.power separately
      expect(prompt).toContain('75 HK');
      expect(prompt).toContain('Bensin');
      expect(prompt).toContain('Motor:');
    });

    test('includes engine code when available', () => {
      const prompt = buildSoundDoctorPrompt(mockVehicle);

      expect(prompt).toContain('(CH)');
    });

    test('includes age', () => {
      const prompt = buildSoundDoctorPrompt(mockVehicle);
      const age = new Date().getFullYear() - mockVehicle.year;

      expect(prompt).toContain(`${age} år`);
    });

    test('includes common sounds for veteran vehicles', () => {
      const prompt = buildSoundDoctorPrompt(mockVehicle);

      expect(prompt).toContain('ventiljusterare');
      expect(prompt).toContain('vevlager');
    });

    test('includes different sounds for modern vehicles', () => {
      const modernVehicle: VehicleData = {
        ...mockVehicle,
        year: new Date().getFullYear() - 5,
      };

      const prompt = buildSoundDoctorPrompt(modernVehicle);

      expect(prompt).toContain('turbo');
      expect(prompt).toContain('elpumpar');
    });
  });

  describe('buildVehicleIntro', () => {
    test('formats intro with make, model, year', () => {
      const intro = buildVehicleIntro(mockVehicle);

      expect(intro).toContain('Volkswagen');
      expect(intro).toContain('LT31');
      expect(intro).toContain('1976');
    });

    test('includes age', () => {
      const intro = buildVehicleIntro(mockVehicle);
      const age = new Date().getFullYear() - mockVehicle.year;

      expect(intro).toContain(`${age} år gammal`);
    });

    test('includes power when available', () => {
      const intro = buildVehicleIntro(mockVehicle);

      expect(intro).toContain('75 HK');
    });

    test('includes engine code when available', () => {
      const intro = buildVehicleIntro(mockVehicle);

      expect(intro).toContain('(CH-motor)');
    });

    test('handles missing power gracefully', () => {
      const vehicleNoPower: VehicleData = {
        ...mockVehicle,
        engine: { ...mockVehicle.engine, power: '' },
      };

      const intro = buildVehicleIntro(vehicleNoPower);

      expect(intro).not.toContain('med ');
      expect(intro).toContain('Volkswagen');
    });
  });

  describe('buildVehicleContext', () => {
    test('includes all key vehicle data', () => {
      const context = buildVehicleContext(mockVehicle);

      expect(context).toContain('Fordon: Volkswagen LT31');
      expect(context).toContain('Ålder:');
      expect(context).toContain('Bränsle: Bensin');
      expect(context).toContain('Motorkod: CH');
      // Engine type line includes both type and power
      expect(context).toMatch(/Motor:.*2\.0L Bensin.*75 HK/);
    });

    test('includes inspection data when available', () => {
      const context = buildVehicleContext(mockVehicle);

      expect(context).toContain('Senaste besiktning: 2024-01-01');
      expect(context).toContain('Mätarställning: 150000');
    });

    test('includes gearbox when available', () => {
      const context = buildVehicleContext(mockVehicle);

      expect(context).toContain('Växellåda: Manuell');
    });

    test('handles missing data gracefully', () => {
      const minimalVehicle: VehicleData = {
        make: 'Tesla',
        model: 'Model 3',
        year: 2020,
        engine: { fuel: 'El', power: '300 HK', volume: 'N/A' },
      } as VehicleData;

      const context = buildVehicleContext(minimalVehicle);

      expect(context).toContain('Tesla Model 3');
      expect(context).not.toContain('undefined');
    });
  });

  describe('getDialectInstruction', () => {
    test('returns dalmal instruction', () => {
      const instruction = getDialectInstruction('dalmal');

      expect(instruction).toContain('DALDIALEKT');
      expect(instruction).toContain('int');
    });

    test('returns gotlandska instruction', () => {
      const instruction = getDialectInstruction('gotlandska');

      expect(instruction).toContain('GOTLÄNDSKA');
    });

    test('returns rikssvenska instruction', () => {
      const instruction = getDialectInstruction('rikssvenska');

      expect(instruction).toContain('RIKSSVENSKA');
    });

    test('returns empty string for standard', () => {
      const instruction = getDialectInstruction('standard');

      expect(instruction).toBe('');
    });

    test('returns empty string for undefined', () => {
      const instruction = getDialectInstruction(undefined);

      expect(instruction).toBe('');
    });
  });

  describe('shouldRegeneratePrompt', () => {
    test('returns true when year changes', () => {
      const oldVehicle = mockVehicle;
      const newVehicle = { ...mockVehicle, year: 1980 };

      const result = shouldRegeneratePrompt(oldVehicle, newVehicle);

      expect(result).toBe(true);
    });

    test('returns true when make changes', () => {
      const oldVehicle = mockVehicle;
      const newVehicle = { ...mockVehicle, make: 'Volvo' };

      const result = shouldRegeneratePrompt(oldVehicle, newVehicle);

      expect(result).toBe(true);
    });

    test('returns true when model changes', () => {
      const oldVehicle = mockVehicle;
      const newVehicle = { ...mockVehicle, model: 'T3' };

      const result = shouldRegeneratePrompt(oldVehicle, newVehicle);

      expect(result).toBe(true);
    });

    test('returns true when engine code changes', () => {
      const oldVehicle = mockVehicle;
      const newVehicle = {
        ...mockVehicle,
        engine: { ...mockVehicle.engine, code: 'CZ' },
      };

      const result = shouldRegeneratePrompt(oldVehicle, newVehicle);

      expect(result).toBe(true);
    });

    test('returns true when fuel type changes', () => {
      const oldVehicle = mockVehicle;
      const newVehicle = {
        ...mockVehicle,
        engine: { ...mockVehicle.engine, fuel: 'Diesel' },
      };

      const result = shouldRegeneratePrompt(oldVehicle, newVehicle);

      expect(result).toBe(true);
    });

    test('returns false when only color changes', () => {
      const oldVehicle = mockVehicle;
      const newVehicle = { ...mockVehicle, color: 'Röd' };

      const result = shouldRegeneratePrompt(oldVehicle, newVehicle);

      expect(result).toBe(false);
    });

    test('returns false when only mileage changes', () => {
      const oldVehicle = mockVehicle;
      const newVehicle = {
        ...mockVehicle,
        inspection: { ...mockVehicle.inspection, mileage: '160000' },
      };

      const result = shouldRegeneratePrompt(oldVehicle, newVehicle);

      expect(result).toBe(false);
    });

    test('returns false when no changes', () => {
      const oldVehicle = mockVehicle;
      const newVehicle = { ...mockVehicle };

      const result = shouldRegeneratePrompt(oldVehicle, newVehicle);

      expect(result).toBe(false);
    });
  });

  describe('buildMinimalPersona', () => {
    test('creates minimal persona for veteran vehicle', () => {
      const persona = buildMinimalPersona(mockVehicle);

      expect(persona).toContain('veteran');
      expect(persona).toContain('Volkswagen LT31');
      expect(persona).toContain('1976');
    });

    test('creates minimal persona for modern vehicle', () => {
      const modernVehicle: VehicleData = {
        ...mockVehicle,
        year: new Date().getFullYear() - 5,
      };

      const persona = buildMinimalPersona(modernVehicle);

      expect(persona).toContain('modern');
      expect(persona).not.toContain('veteran');
    });

    test('includes engine code when available', () => {
      const persona = buildMinimalPersona(mockVehicle);

      expect(persona).toContain('CH-motor');
    });

    test('mentions "jag" perspective', () => {
      const persona = buildMinimalPersona(mockVehicle);

      expect(persona).toContain('jag');
      expect(persona).toContain('bilen');
    });

    test('mentions DIY encouragement', () => {
      const persona = buildMinimalPersona(mockVehicle);

      expect(persona).toContain('DIY');
    });
  });

  describe('Edge Cases & Error Handling', () => {
    test('handles undefined vehicle properties gracefully', () => {
      const partialVehicle: Partial<VehicleData> = {
        make: 'Unknown',
        model: 'Unknown',
        year: 2000,
      };

      const prompt = buildPersonalizedPrompt(
        partialVehicle as VehicleData,
        'standard'
      );

      expect(prompt).toContain('Unknown');
      expect(prompt).not.toContain('undefined');
    });

    test('handles null engine data', () => {
      const vehicleNullEngine: VehicleData = {
        ...mockVehicle,
        engine: null as any,
      };

      const prompt = buildPersonalizedPrompt(vehicleNullEngine, 'standard');

      expect(prompt).toContain('Okänd motor');
    });

    test('handles very long projectName', () => {
      const longName = 'A'.repeat(200);
      const prompt = buildPersonalizedPrompt(mockVehicle, 'standard', longName);

      expect(prompt).toContain(longName);
    });

    test('handles projectName with quotes', () => {
      const prompt = buildPersonalizedPrompt(
        mockVehicle,
        'standard',
        'The "Beast"'
      );

      expect(prompt).toContain('The "Beast"');
    });
  });
});

/**
 * Prompt Templates Unit Tests
 * Tests for template structure and placeholder validation
 */

import { describe, test, expect } from 'vitest';
import {
  VEHICLE_PERSONA_TEMPLATE,
  SOUND_DOCTOR_TEMPLATE,
  PERSONALITY_BY_AGE,
  ENGINE_PERSONALITIES,
  COOLING_PERSONALITIES,
  DIALECT_INSTRUCTIONS,
} from '@/config/promptTemplates';

describe('promptTemplates', () => {
  describe('VEHICLE_PERSONA_TEMPLATE', () => {
    test('contains all required placeholders', () => {
      const requiredPlaceholders = [
        '{{aiName}}',
        '{{make}}',
        '{{model}}',
        '{{year}}',
        '{{age}}',
        '{{personality}}',
        '{{bodyType}}',
        '{{engine.type}}',
        '{{engine.power}}',
        '{{engine.fuel}}',
        '{{engineCode}}',
        '{{coolingNote}}',
        '{{veteranNote}}',
        '{{emojiStyle}}',
      ];

      requiredPlaceholders.forEach((placeholder) => {
        expect(VEHICLE_PERSONA_TEMPLATE).toContain(placeholder);
      });
    });

    test('includes first-person perspective instructions', () => {
      expect(VEHICLE_PERSONA_TEMPLATE).toContain('JAGET i konversationen');
      expect(VEHICLE_PERSONA_TEMPLATE).toContain('första person');
      expect(VEHICLE_PERSONA_TEMPLATE).toContain('Mina däck');
      expect(VEHICLE_PERSONA_TEMPLATE).toContain('Min motor');
    });

    test('includes personality section', () => {
      expect(VEHICLE_PERSONA_TEMPLATE).toContain('=== DIN PERSONLIGHET ===');
    });

    test('includes technical identity section', () => {
      expect(VEHICLE_PERSONA_TEMPLATE).toContain('=== DIN TEKNISKA IDENTITET ===');
    });

    test('includes rules section with DIY encouragement', () => {
      expect(VEHICLE_PERSONA_TEMPLATE).toContain('=== DINA REGLER ===');
      // Check for economic/DIY encouragement in rules
      expect(VEHICLE_PERSONA_TEMPLATE).toMatch(/verkstäder|dyra|skruvar själva/i);
    });
  });

  describe('SOUND_DOCTOR_TEMPLATE', () => {
    test('contains all required placeholders', () => {
      const requiredPlaceholders = [
        '{{make}}',
        '{{model}}',
        '{{year}}',
        '{{age}}',
        '{{engine.type}}',
        '{{engine.power}}',
        '{{engineCode}}',
        '{{commonSounds}}',
      ];

      requiredPlaceholders.forEach((placeholder) => {
        expect(SOUND_DOCTOR_TEMPLATE).toContain(placeholder);
      });
    });

    test('includes sound analysis focus', () => {
      expect(SOUND_DOCTOR_TEMPLATE).toContain('LJUD-DOKTOR');
      expect(SOUND_DOCTOR_TEMPLATE).toContain('ljud');
    });

    test('mentions diagnostic method', () => {
      expect(SOUND_DOCTOR_TEMPLATE).toContain('ANALYS-METOD');
      expect(SOUND_DOCTOR_TEMPLATE).toContain('Lyssna');
    });
  });

  describe('PERSONALITY_BY_AGE', () => {
    test('has all age categories', () => {
      expect(PERSONALITY_BY_AGE).toHaveProperty('veteran');
      expect(PERSONALITY_BY_AGE).toHaveProperty('experienced');
      expect(PERSONALITY_BY_AGE).toHaveProperty('modern');
    });

    test('veteran personality includes nostalgia', () => {
      const veteranTraits = PERSONALITY_BY_AGE.veteran.traits;
      const combinedText = veteranTraits.join(' ').toLowerCase();

      expect(combinedText).toContain('gammal');
      expect(combinedText).toMatch(/veteran|klassisk/);
    });

    test('experienced personality includes reliability', () => {
      const experiencedTraits = PERSONALITY_BY_AGE.experienced.traits;
      const combinedText = experiencedTraits.join(' ').toLowerCase();

      expect(combinedText).toMatch(/erfaren|pålitlig/);
    });

    test('modern personality includes technology', () => {
      const modernTraits = PERSONALITY_BY_AGE.modern.traits;
      const combinedText = modernTraits.join(' ').toLowerCase();

      expect(combinedText).toMatch(/modern|teknisk|pigg/);
    });

    test('all categories have emoji styles', () => {
      expect(PERSONALITY_BY_AGE.veteran.emojiStyle).toBeTruthy();
      expect(PERSONALITY_BY_AGE.experienced.emojiStyle).toBeTruthy();
      expect(PERSONALITY_BY_AGE.modern.emojiStyle).toBeTruthy();
    });
  });

  describe('ENGINE_PERSONALITIES', () => {
    test('has diesel personality', () => {
      expect(ENGINE_PERSONALITIES.diesel).toBeDefined();
      expect(Array.isArray(ENGINE_PERSONALITIES.diesel)).toBe(true);

      const dieselText = ENGINE_PERSONALITIES.diesel.join(' ').toLowerCase();
      expect(dieselText).toContain('diesel');
    });

    test('has bensin personality', () => {
      expect(ENGINE_PERSONALITIES.bensin).toBeDefined();
      expect(Array.isArray(ENGINE_PERSONALITIES.bensin)).toBe(true);

      const bensinText = ENGINE_PERSONALITIES.bensin.join(' ').toLowerCase();
      expect(bensinText).toMatch(/smidig|responsiv/);
    });

    test('has electric personality', () => {
      expect(ENGINE_PERSONALITIES.el).toBeDefined();
      expect(Array.isArray(ENGINE_PERSONALITIES.el)).toBe(true);

      const elText = ENGINE_PERSONALITIES.el.join(' ').toLowerCase();
      expect(elText).toMatch(/el|elektrisk|tyst/);
    });
  });

  describe('COOLING_PERSONALITIES', () => {
    test('has air-cooled personality', () => {
      expect(COOLING_PERSONALITIES.luftkyld).toBeDefined();
      expect(typeof COOLING_PERSONALITIES.luftkyld).toBe('string');

      const aircooledText = COOLING_PERSONALITIES.luftkyld.toLowerCase();
      expect(aircooledText).toMatch(/luft|röra/);
    });

    test('has water-cooled personality', () => {
      expect(COOLING_PERSONALITIES.vattenkyld).toBeDefined();
      expect(typeof COOLING_PERSONALITIES.vattenkyld).toBe('string');

      const watercooledText = COOLING_PERSONALITIES.vattenkyld.toLowerCase();
      expect(watercooledText).toContain('vatten');
    });
  });

  describe('DIALECT_INSTRUCTIONS', () => {
    test('has all dialect options', () => {
      expect(DIALECT_INSTRUCTIONS).toHaveProperty('dalmal');
      expect(DIALECT_INSTRUCTIONS).toHaveProperty('gotlandska');
      expect(DIALECT_INSTRUCTIONS).toHaveProperty('rikssvenska');
    });

    test('dalmal includes characteristic expressions', () => {
      const dalmal = DIALECT_INSTRUCTIONS.dalmal;

      expect(dalmal).toContain('DALDIALEKT');
      expect(dalmal).toContain('int');
      expect(dalmal).toContain('Hörru');
    });

    test('gotlandska includes characteristic expressions', () => {
      const gotlandska = DIALECT_INSTRUCTIONS.gotlandska;

      expect(gotlandska).toContain('GOTLÄNDSKA');
      expect(gotlandska).toContain('släpigt');
      expect(gotlandska).toContain('melodiöst');
    });

    test('rikssvenska includes formal tone', () => {
      const rikssvenska = DIALECT_INSTRUCTIONS.rikssvenska;

      expect(rikssvenska).toContain('RIKSSVENSKA');
      expect(rikssvenska).toContain('saklig');
      expect(rikssvenska).toContain('korrekt');
    });

    test('all dialects are substantial texts', () => {
      expect(DIALECT_INSTRUCTIONS.dalmal.length).toBeGreaterThan(50);
      expect(DIALECT_INSTRUCTIONS.gotlandska.length).toBeGreaterThan(50);
      expect(DIALECT_INSTRUCTIONS.rikssvenska.length).toBeGreaterThan(50);
    });
  });

  describe('Template Structure Validation', () => {
    test('VEHICLE_PERSONA_TEMPLATE has consistent formatting', () => {
      // Should have section headers with ===
      const sections = VEHICLE_PERSONA_TEMPLATE.match(/=== .+ ===/g);
      expect(sections).toBeTruthy();
      expect(sections!.length).toBeGreaterThan(2);
    });

    test('SOUND_DOCTOR_TEMPLATE has structured sections', () => {
      expect(SOUND_DOCTOR_TEMPLATE).toContain('TEKNISKA FAKTA OM MOTORN:');
      expect(SOUND_DOCTOR_TEMPLATE).toContain('ANALYS-METOD:');
      expect(SOUND_DOCTOR_TEMPLATE).toContain('VANLIGA LJUD FÖR');
    });

    test('all personality traits are non-empty', () => {
      const allTraits = [
        ...PERSONALITY_BY_AGE.veteran.traits,
        ...PERSONALITY_BY_AGE.experienced.traits,
        ...PERSONALITY_BY_AGE.modern.traits,
      ];

      allTraits.forEach((trait) => {
        expect(trait.length).toBeGreaterThan(0);
        expect(trait.trim()).toBe(trait); // No leading/trailing whitespace
      });
    });

    test('all engine personalities are non-empty', () => {
      const allEngineTraits = [
        ...ENGINE_PERSONALITIES.diesel,
        ...ENGINE_PERSONALITIES.bensin,
        ...ENGINE_PERSONALITIES.el,
      ];

      allEngineTraits.forEach((trait) => {
        expect(trait.length).toBeGreaterThan(0);
        expect(trait.trim()).toBe(trait);
      });
    });

    test('all dialect instructions are substantial', () => {
      expect(DIALECT_INSTRUCTIONS.dalmal.length).toBeGreaterThan(100);
      expect(DIALECT_INSTRUCTIONS.gotlandska.length).toBeGreaterThan(100);
      expect(DIALECT_INSTRUCTIONS.rikssvenska.length).toBeGreaterThan(100);
    });
  });
});

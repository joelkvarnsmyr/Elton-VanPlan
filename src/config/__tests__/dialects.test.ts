/**
 * Dialects Configuration Tests
 *
 * Unit tests for centralized dialect configuration used by
 * both text chat and voice chat (LiveElton)
 */

import { describe, test, expect } from 'vitest';
import {
  DIALECTS,
  getDialectConfig,
  getAllDialects,
  getVoiceName,
  type DialectConfig
} from '@/config/dialects';

describe('DIALECTS constant', () => {
  test('should have all required dialects', () => {
    expect(DIALECTS).toHaveProperty('standard');
    expect(DIALECTS).toHaveProperty('dalmal');
    expect(DIALECTS).toHaveProperty('gotlandska');
    expect(DIALECTS).toHaveProperty('rikssvenska');
  });

  test('should have exactly 4 dialects', () => {
    const dialectKeys = Object.keys(DIALECTS);
    expect(dialectKeys).toHaveLength(4);
  });

  describe('standard dialect', () => {
    test('should have correct properties', () => {
      const standard = DIALECTS.standard;

      expect(standard.id).toBe('standard');
      expect(standard.label).toBe('Standard');
      expect(standard.description).toContain('Neutral');
      expect(standard.voiceName).toBe('Puck');
    });

    test('should have examples', () => {
      const standard = DIALECTS.standard;

      expect(standard.examples).toBeDefined();
      expect(Array.isArray(standard.examples)).toBe(true);
      expect(standard.examples!.length).toBeGreaterThan(0);
    });
  });

  describe('dalmal dialect', () => {
    test('should have correct properties', () => {
      const dalmal = DIALECTS.dalmal;

      expect(dalmal.id).toBe('dalmal');
      expect(dalmal.label).toBe('Dala-Elton');
      expect(dalmal.description).toContain('Dalmål');
      expect(dalmal.voiceName).toBe('Fenrir');
    });

    test('should have characteristic examples', () => {
      const dalmal = DIALECTS.dalmal;

      expect(dalmal.examples).toBeDefined();
      expect(dalmal.examples).toContain('Hörru du');
      expect(dalmal.examples).toContain('Dä ordner sä');
    });
  });

  describe('gotlandska dialect', () => {
    test('should have correct properties', () => {
      const gotlandska = DIALECTS.gotlandska;

      expect(gotlandska.id).toBe('gotlandska');
      expect(gotlandska.label).toBe('Gotlands-Elton');
      expect(gotlandska.description).toContain('Gotlands');
      expect(gotlandska.voiceName).toBe('Charon');
    });

    test('should have characteristic examples', () => {
      const gotlandska = DIALECTS.gotlandska;

      expect(gotlandska.examples).toBeDefined();
      expect(gotlandska.examples).toContain('Raukt!');
      expect(gotlandska.examples).toContain('Bäut');
    });
  });

  describe('rikssvenska dialect', () => {
    test('should have correct properties', () => {
      const rikssvenska = DIALECTS.rikssvenska;

      expect(rikssvenska.id).toBe('rikssvenska');
      expect(rikssvenska.label).toBe('Riks-Elton');
      expect(rikssvenska.description).toContain('Tydlig');
      expect(rikssvenska.voiceName).toBe('Kore');
    });

    test('should have characteristic examples', () => {
      const rikssvenska = DIALECTS.rikssvenska;

      expect(rikssvenska.examples).toBeDefined();
      expect(rikssvenska.examples).toContain('Välkommen');
    });
  });

  test('all dialects should have required fields', () => {
    Object.values(DIALECTS).forEach((dialect: DialectConfig) => {
      expect(dialect.id).toBeDefined();
      expect(dialect.label).toBeDefined();
      expect(dialect.description).toBeDefined();
      expect(dialect.voiceName).toBeDefined();

      expect(typeof dialect.id).toBe('string');
      expect(typeof dialect.label).toBe('string');
      expect(typeof dialect.description).toBe('string');
      expect(typeof dialect.voiceName).toBe('string');

      expect(dialect.id.length).toBeGreaterThan(0);
      expect(dialect.label.length).toBeGreaterThan(0);
      expect(dialect.description.length).toBeGreaterThan(0);
    });
  });

  test('all dialects should have unique IDs', () => {
    const ids = Object.values(DIALECTS).map(d => d.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  test('all dialects should have unique labels', () => {
    const labels = Object.values(DIALECTS).map(d => d.label);
    const uniqueLabels = new Set(labels);
    expect(uniqueLabels.size).toBe(labels.length);
  });

  test('all dialects should have unique voice names', () => {
    const voiceNames = Object.values(DIALECTS).map(d => d.voiceName);
    const uniqueVoiceNames = new Set(voiceNames);
    expect(uniqueVoiceNames.size).toBe(voiceNames.length);
  });
});

describe('getDialectConfig', () => {
  test('should return config for "standard"', () => {
    const config = getDialectConfig('standard');

    expect(config.id).toBe('standard');
    expect(config.label).toBe('Standard');
  });

  test('should return config for "dalmal"', () => {
    const config = getDialectConfig('dalmal');

    expect(config.id).toBe('dalmal');
    expect(config.label).toBe('Dala-Elton');
  });

  test('should return config for "gotlandska"', () => {
    const config = getDialectConfig('gotlandska');

    expect(config.id).toBe('gotlandska');
    expect(config.label).toBe('Gotlands-Elton');
  });

  test('should return config for "rikssvenska"', () => {
    const config = getDialectConfig('rikssvenska');

    expect(config.id).toBe('rikssvenska');
    expect(config.label).toBe('Riks-Elton');
  });

  test('should return "standard" config when undefined', () => {
    const config = getDialectConfig(undefined);

    expect(config.id).toBe('standard');
    expect(config.label).toBe('Standard');
  });

  test('should return "standard" config when no argument', () => {
    const config = getDialectConfig();

    expect(config.id).toBe('standard');
  });
});

describe('getAllDialects', () => {
  test('should return an array', () => {
    const dialects = getAllDialects();

    expect(Array.isArray(dialects)).toBe(true);
  });

  test('should return all 4 dialects', () => {
    const dialects = getAllDialects();

    expect(dialects).toHaveLength(4);
  });

  test('should return dialects with all properties', () => {
    const dialects = getAllDialects();

    dialects.forEach(dialect => {
      expect(dialect).toHaveProperty('id');
      expect(dialect).toHaveProperty('label');
      expect(dialect).toHaveProperty('description');
      expect(dialect).toHaveProperty('voiceName');
    });
  });

  test('should include standard dialect', () => {
    const dialects = getAllDialects();
    const standard = dialects.find(d => d.id === 'standard');

    expect(standard).toBeDefined();
    expect(standard!.label).toBe('Standard');
  });

  test('should include dalmal dialect', () => {
    const dialects = getAllDialects();
    const dalmal = dialects.find(d => d.id === 'dalmal');

    expect(dalmal).toBeDefined();
    expect(dalmal!.label).toBe('Dala-Elton');
  });

  test('should include gotlandska dialect', () => {
    const dialects = getAllDialects();
    const gotlandska = dialects.find(d => d.id === 'gotlandska');

    expect(gotlandska).toBeDefined();
    expect(gotlandska!.label).toBe('Gotlands-Elton');
  });

  test('should include rikssvenska dialect', () => {
    const dialects = getAllDialects();
    const rikssvenska = dialects.find(d => d.id === 'rikssvenska');

    expect(rikssvenska).toBeDefined();
    expect(rikssvenska!.label).toBe('Riks-Elton');
  });
});

describe('getVoiceName', () => {
  test('should return voice name for "standard"', () => {
    const voiceName = getVoiceName('standard');
    expect(voiceName).toBe('Puck');
  });

  test('should return voice name for "dalmal"', () => {
    const voiceName = getVoiceName('dalmal');
    expect(voiceName).toBe('Fenrir');
  });

  test('should return voice name for "gotlandska"', () => {
    const voiceName = getVoiceName('gotlandska');
    expect(voiceName).toBe('Charon');
  });

  test('should return voice name for "rikssvenska"', () => {
    const voiceName = getVoiceName('rikssvenska');
    expect(voiceName).toBe('Kore');
  });

  test('should return "standard" voice when undefined', () => {
    const voiceName = getVoiceName(undefined);
    expect(voiceName).toBe('Puck');
  });

  test('should return "standard" voice when no argument', () => {
    const voiceName = getVoiceName();
    expect(voiceName).toBe('Puck');
  });

  test('all voice names should be valid Gemini Live voices', () => {
    const validVoices = ['Fenrir', 'Charon', 'Puck', 'Kore'];
    const dialects = getAllDialects();

    dialects.forEach(dialect => {
      expect(validVoices).toContain(dialect.voiceName);
    });
  });
});

/**
 * useVehiclePersonality Hook Tests
 *
 * Unit tests for the shared personality hook used by both
 * AIAssistant (text chat) and LiveElton (voice chat)
 */

import { describe, test, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useVehiclePersonality, buildGreeting } from '@/hooks/useVehiclePersonality';
import { VehicleData } from '@/types/types';

// Mock vehicle data
const mockVeteranVehicle: VehicleData = {
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

const mockModernVehicle: VehicleData = {
  ...mockVeteranVehicle,
  make: 'Tesla',
  model: 'Model 3',
  year: 2023,
  prodYear: 2023,
  engine: {
    fuel: 'El',
    power: '300 HK',
    volume: 'N/A',
    type: 'Elektrisk motor',
  },
};

describe('useVehiclePersonality', () => {
  describe('Basic Functionality', () => {
    test('should return systemPrompt, aiName, dialectLabel, and voiceName', () => {
      const { result } = renderHook(() =>
        useVehiclePersonality({
          vehicleData: mockVeteranVehicle,
          projectName: 'Elton',
          dialectId: 'standard',
        })
      );

      expect(result.current).toHaveProperty('systemPrompt');
      expect(result.current).toHaveProperty('aiName');
      expect(result.current).toHaveProperty('dialectLabel');
      expect(result.current).toHaveProperty('voiceName');

      expect(typeof result.current.systemPrompt).toBe('string');
      expect(result.current.systemPrompt.length).toBeGreaterThan(100);
    });

    test('should use projectName as aiName when provided', () => {
      const { result } = renderHook(() =>
        useVehiclePersonality({
          vehicleData: mockVeteranVehicle,
          projectName: 'Pärlan',
          dialectId: 'standard',
        })
      );

      expect(result.current.aiName).toBe('Pärlan');
      expect(result.current.systemPrompt).toContain('Pärlan');
    });

    test('should fallback to "AI Assistant" when no projectName provided', () => {
      const { result } = renderHook(() =>
        useVehiclePersonality({
          vehicleData: mockVeteranVehicle,
          dialectId: 'standard',
        })
      );

      expect(result.current.aiName).toBe('AI Assistant');
    });

    test('should fallback to "AI Assistant" when projectName is empty string', () => {
      const { result } = renderHook(() =>
        useVehiclePersonality({
          vehicleData: mockVeteranVehicle,
          projectName: '',
          dialectId: 'standard',
        })
      );

      expect(result.current.aiName).toBe('AI Assistant');
    });

    test('should fallback to "AI Assistant" when projectName is only whitespace', () => {
      const { result } = renderHook(() =>
        useVehiclePersonality({
          vehicleData: mockVeteranVehicle,
          projectName: '   ',
          dialectId: 'standard',
        })
      );

      expect(result.current.aiName).toBe('AI Assistant');
    });
  });

  describe('Dialect Integration', () => {
    test('should use "standard" dialect by default', () => {
      const { result } = renderHook(() =>
        useVehiclePersonality({
          vehicleData: mockVeteranVehicle,
        })
      );

      expect(result.current.dialectLabel).toBe('Standard');
      expect(result.current.voiceName).toBe('Puck');
    });

    test('should use "dalmal" dialect when specified', () => {
      const { result } = renderHook(() =>
        useVehiclePersonality({
          vehicleData: mockVeteranVehicle,
          dialectId: 'dalmal',
        })
      );

      expect(result.current.dialectLabel).toBe('Dala-Elton');
      expect(result.current.voiceName).toBe('Fenrir');
      expect(result.current.systemPrompt).toContain('DALDIALEKT');
    });

    test('should use "gotlandska" dialect when specified', () => {
      const { result } = renderHook(() =>
        useVehiclePersonality({
          vehicleData: mockVeteranVehicle,
          dialectId: 'gotlandska',
        })
      );

      expect(result.current.dialectLabel).toBe('Gotlands-Elton');
      expect(result.current.voiceName).toBe('Charon');
      expect(result.current.systemPrompt).toContain('GOTLÄNDSKA');
    });

    test('should use "rikssvenska" dialect when specified', () => {
      const { result } = renderHook(() =>
        useVehiclePersonality({
          vehicleData: mockVeteranVehicle,
          dialectId: 'rikssvenska',
        })
      );

      expect(result.current.dialectLabel).toBe('Riks-Elton');
      expect(result.current.voiceName).toBe('Kore');
      expect(result.current.systemPrompt).toContain('RIKSSVENSKA');
    });
  });

  describe('Diagnostic Mode', () => {
    test('should use Sound Doctor prompt when diagnosticMode is true', () => {
      const { result } = renderHook(() =>
        useVehiclePersonality({
          vehicleData: mockVeteranVehicle,
          diagnosticMode: true,
        })
      );

      expect(result.current.systemPrompt).toContain('LJUD-DOKTOR');
      expect(result.current.systemPrompt).toContain('LYSSNA');
    });

    test('should use standard prompt when diagnosticMode is false', () => {
      const { result } = renderHook(() =>
        useVehiclePersonality({
          vehicleData: mockVeteranVehicle,
          diagnosticMode: false,
        })
      );

      expect(result.current.systemPrompt).not.toContain('LJUD-DOKTOR');
      expect(result.current.systemPrompt).toContain('DIN PERSONLIGHET');
    });

    test('should include vehicle-specific context in diagnostic mode', () => {
      const { result } = renderHook(() =>
        useVehiclePersonality({
          vehicleData: mockVeteranVehicle,
          diagnosticMode: true,
        })
      );

      expect(result.current.systemPrompt).toContain('Volkswagen');
      expect(result.current.systemPrompt).toContain('LT31');
      expect(result.current.systemPrompt).toContain('1976');
    });
  });

  describe('Vehicle-Specific Context', () => {
    test('should include veteran vehicle traits', () => {
      const { result } = renderHook(() =>
        useVehiclePersonality({
          vehicleData: mockVeteranVehicle,
          dialectId: 'standard',
        })
      );

      const prompt = result.current.systemPrompt.toLowerCase();
      expect(prompt).toMatch(/veteran|gammal|klassisk/);
    });

    test('should include modern vehicle traits', () => {
      const { result } = renderHook(() =>
        useVehiclePersonality({
          vehicleData: mockModernVehicle,
          dialectId: 'standard',
        })
      );

      const prompt = result.current.systemPrompt.toLowerCase();
      expect(prompt).toMatch(/modern|pigg|teknisk/);
    });

    test('should include engine type information', () => {
      const { result } = renderHook(() =>
        useVehiclePersonality({
          vehicleData: mockVeteranVehicle,
          dialectId: 'standard',
        })
      );

      expect(result.current.systemPrompt).toContain('Bensin');
    });

    test('should include engine code when available', () => {
      const { result } = renderHook(() =>
        useVehiclePersonality({
          vehicleData: mockVeteranVehicle,
          dialectId: 'standard',
        })
      );

      expect(result.current.systemPrompt).toContain('CH');
    });
  });

  describe('Edge Cases', () => {
    test('should handle projectName with special characters', () => {
      const { result } = renderHook(() =>
        useVehiclePersonality({
          vehicleData: mockVeteranVehicle,
          projectName: 'Blå-Bärspaj 2.0',
          dialectId: 'standard',
        })
      );

      expect(result.current.aiName).toBe('Blå-Bärspaj 2.0');
      expect(result.current.systemPrompt).toContain('Blå-Bärspaj 2.0');
    });

    test('should handle projectName with Swedish characters (åäö)', () => {
      const { result } = renderHook(() =>
        useVehiclePersonality({
          vehicleData: mockVeteranVehicle,
          projectName: 'Sjöhästen',
          dialectId: 'standard',
        })
      );

      expect(result.current.aiName).toBe('Sjöhästen');
      expect(result.current.systemPrompt).toContain('Sjöhästen');
    });

    test('should handle very long projectName', () => {
      const longName = 'A'.repeat(200);
      const { result } = renderHook(() =>
        useVehiclePersonality({
          vehicleData: mockVeteranVehicle,
          projectName: longName,
          dialectId: 'standard',
        })
      );

      expect(result.current.aiName).toBe(longName);
    });

    test('should handle undefined dialectId', () => {
      const { result } = renderHook(() =>
        useVehiclePersonality({
          vehicleData: mockVeteranVehicle,
          dialectId: undefined,
        })
      );

      expect(result.current.dialectLabel).toBe('Standard');
    });
  });
});

describe('buildGreeting', () => {
  test('should build generic greeting when aiName is "AI Assistant"', () => {
    const greeting = buildGreeting('AI Assistant', mockVeteranVehicle);

    expect(greeting).toContain('Hallå där!');
    expect(greeting).toContain('Volkswagen');
    expect(greeting).toContain('LT31');
    expect(greeting).toContain('1976');
    expect(greeting).not.toContain('AI Assistant');
  });

  test('should build personalized greeting with nickname', () => {
    const greeting = buildGreeting('Pärlan', mockVeteranVehicle);

    expect(greeting).toContain('Hallå där!');
    expect(greeting).toContain('Pärlan');
    expect(greeting).not.toContain('Volkswagen');
  });

  test('should include emoji in greeting', () => {
    const greeting = buildGreeting('Elton', mockVeteranVehicle);

    expect(greeting).toMatch(/🚐|💨/);
  });

  test('should work with different vehicle types', () => {
    const greeting = buildGreeting('Tesla Bot', mockModernVehicle);

    expect(greeting).toContain('Tesla Bot');
    expect(greeting).toContain('Hallå där!');
  });
});

/**
 * Personality Service Unit Tests
 * Tests for vehicle personality generation based on characteristics
 */

import { describe, test, expect, beforeEach } from 'vitest';
import {
  calculateVehicleAge,
  generateVehiclePersonality,
  generateSoundDoctorPersonality,
  getVehicleNotes,
  isVeteran,
  getVehicleGreeting,
} from '@/services/personalityService';
import { VehicleData } from '@/types/types';

describe('personalityService', () => {
  describe('calculateVehicleAge', () => {
    test('should calculate age correctly for 1976 vehicle', () => {
      const currentYear = new Date().getFullYear();
      const age = calculateVehicleAge(1976);
      expect(age).toBe(currentYear - 1976);
    });

    test('should calculate age correctly for current year vehicle', () => {
      const currentYear = new Date().getFullYear();
      const age = calculateVehicleAge(currentYear);
      expect(age).toBe(0);
    });

    test('should calculate age correctly for 2020 vehicle', () => {
      const currentYear = new Date().getFullYear();
      const age = calculateVehicleAge(2020);
      expect(age).toBe(currentYear - 2020);
    });

    test('should handle year in the past correctly', () => {
      const age = calculateVehicleAge(1950);
      expect(age).toBeGreaterThan(70);
    });
  });

  describe('generateVehiclePersonality', () => {
    test('veteran vehicle (40+ years) has correct age-based traits', () => {
      const vehicle: VehicleData = {
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
        engine: { fuel: 'Bensin', power: '75 HK', volume: '2.0L' },
        gearbox: 'Manuell',
        wheels: { drive: '2WD', tiresFront: '195/70R15', tiresRear: '195/70R15', boltPattern: '5x112' },
        dimensions: { length: 5200, width: 2000, height: '2400', wheelbase: 3000 },
        weights: { curb: 1800, total: 2800, load: 1000, trailer: 2000, trailerB: 750 },
        vin: 'VIN123',
        color: 'Vit',
        history: { owners: 5, events: 20, lastOwnerChange: '2020-01-01' },
      };

      const personality = generateVehiclePersonality(vehicle);

      expect(personality).toContain('gammal');
      expect(personality).toContain('veteran');
      expect(personality).toContain('den gamla goda tiden');
    });

    test('experienced vehicle (20-39 years) has correct traits', () => {
      const vehicle: VehicleData = {
        make: 'Volvo',
        model: '240',
        year: 1988,
        prodYear: 1988,
        regNo: 'XYZ789',
        regDate: '1988-05-15',
        status: 'I trafik',
        bodyType: 'Personbil',
        passengers: 5,
        inspection: { last: '2024-01-01', mileage: '250000', next: '2025-01-01' },
        engine: { fuel: 'Bensin', power: '114 HK', volume: '2.3L', code: 'B230F' },
        gearbox: 'Manuell',
        wheels: { drive: '2WD', tiresFront: '185/65R15', tiresRear: '185/65R15', boltPattern: '5x108' },
        dimensions: { length: 4790, width: 1730, height: '1430', wheelbase: 2640 },
        weights: { curb: 1270, total: 1720, load: 450, trailer: 1200, trailerB: 600 },
        vin: 'VIN456',
        color: 'Blå',
        history: { owners: 3, events: 15, lastOwnerChange: '2018-01-01' },
      };

      const personality = generateVehiclePersonality(vehicle);

      expect(personality).toContain('erfaren');
      expect(personality).toContain('pålitlig');
      expect(personality).toContain('underhåll');
    });

    test('modern vehicle (<20 years) has correct traits', () => {
      const currentYear = new Date().getFullYear();
      const vehicle: VehicleData = {
        make: 'BMW',
        model: 'R1150GS',
        year: currentYear - 10,
        prodYear: currentYear - 10,
        regNo: 'MOD123',
        regDate: `${currentYear - 10}-01-01`,
        status: 'I trafik',
        bodyType: 'Motorcykel',
        passengers: 2,
        inspection: { last: '2024-01-01', mileage: '50000', next: '2025-01-01' },
        engine: { fuel: 'Bensin', power: '85 HK', volume: '1.2L' },
        gearbox: 'Manuell',
        wheels: { drive: '2WD', tiresFront: '120/70R19', tiresRear: '150/70R17', boltPattern: 'N/A' },
        dimensions: { length: 2210, width: 930, height: '1405', wheelbase: 1495 },
        weights: { curb: 244, total: 450, load: 206, trailer: 0, trailerB: 0 },
        vin: 'VIN789',
        color: 'Svart',
        history: { owners: 1, events: 5, lastOwnerChange: `${currentYear - 2}-01-01` },
      };

      const personality = generateVehiclePersonality(vehicle);

      expect(personality).toContain('modern');
      expect(personality).toContain('teknisk');
      expect(personality).toContain('pigg');
    });

    test('diesel engine adds diesel-specific traits', () => {
      const vehicle: VehicleData = {
        make: 'Mercedes-Benz',
        model: 'Sprinter',
        year: 2005,
        prodYear: 2005,
        regNo: 'DIE123',
        regDate: '2005-01-01',
        status: 'I trafik',
        bodyType: 'Skåpbil',
        passengers: 3,
        inspection: { last: '2024-01-01', mileage: '300000', next: '2025-01-01' },
        engine: { fuel: 'Diesel', power: '109 HK', volume: '2.2L', code: 'OM611' },
        gearbox: 'Manuell',
        wheels: { drive: '2WD', tiresFront: '205/70R15', tiresRear: '205/70R15', boltPattern: '5x130' },
        dimensions: { length: 5700, width: 2020, height: '2700', wheelbase: 3250 },
        weights: { curb: 2100, total: 3500, load: 1400, trailer: 2000, trailerB: 750 },
        vin: 'VIN111',
        color: 'Vit',
        history: { owners: 2, events: 10, lastOwnerChange: '2020-01-01' },
      };

      const personality = generateVehiclePersonality(vehicle);

      expect(personality).toContain('diesel');
      expect(personality).toContain('arbetshäst');
    });

    test('air-cooled engine adds cooling trait', () => {
      const vehicle: VehicleData = {
        make: 'Porsche',
        model: '911',
        year: 1973,
        prodYear: 1973,
        regNo: 'AIR123',
        regDate: '1973-01-01',
        status: 'I trafik',
        bodyType: 'Personbil',
        passengers: 4,
        inspection: { last: '2024-01-01', mileage: '100000', next: '2025-01-01' },
        engine: { fuel: 'Bensin', power: '150 HK', volume: '2.4L', cooling: 'Luftkyld' },
        gearbox: 'Manuell',
        wheels: { drive: '2WD', tiresFront: '185/70R15', tiresRear: '215/60R15', boltPattern: '5x130' },
        dimensions: { length: 4147, width: 1610, height: '1320', wheelbase: 2271 },
        weights: { curb: 1020, total: 1420, load: 400, trailer: 0, trailerB: 0 },
        vin: 'VIN222',
        color: 'Röd',
        history: { owners: 4, events: 25, lastOwnerChange: '2015-01-01' },
      };

      const personality = generateVehiclePersonality(vehicle);

      expect(personality).toContain('luftkyld');
      expect(personality).toContain('röra på dig');
    });

    test('vehicle with engine code includes pride statement', () => {
      const vehicle: VehicleData = {
        make: 'Volvo',
        model: '240',
        year: 1988,
        prodYear: 1988,
        regNo: 'CODE123',
        regDate: '1988-01-01',
        status: 'I trafik',
        bodyType: 'Personbil',
        passengers: 5,
        inspection: { last: '2024-01-01', mileage: '200000', next: '2025-01-01' },
        engine: { fuel: 'Bensin', power: '114 HK', volume: '2.3L', code: 'B230F' },
        gearbox: 'Manuell',
        wheels: { drive: '2WD', tiresFront: '185/65R15', tiresRear: '185/65R15', boltPattern: '5x108' },
        dimensions: { length: 4790, width: 1730, height: '1430', wheelbase: 2640 },
        weights: { curb: 1270, total: 1720, load: 450, trailer: 1200, trailerB: 600 },
        vin: 'VIN333',
        color: 'Blå',
        history: { owners: 2, events: 12, lastOwnerChange: '2019-01-01' },
      };

      const personality = generateVehiclePersonality(vehicle);

      expect(personality).toContain('B230F');
      expect(personality).toContain('stolt');
    });

    test('veteran status adds veteran trait for car (30 years)', () => {
      const vehicle: VehicleData = {
        make: 'Saab',
        model: '900',
        year: 1985,
        prodYear: 1985,
        regNo: 'VET123',
        regDate: '1985-01-01',
        status: 'I trafik',
        bodyType: 'Personbil',
        passengers: 5,
        inspection: { last: '2024-01-01', mileage: '180000', next: '2025-01-01' },
        engine: { fuel: 'Bensin', power: '108 HK', volume: '2.0L' },
        gearbox: 'Manuell',
        wheels: { drive: '2WD', tiresFront: '185/65R15', tiresRear: '185/65R15', boltPattern: '4x108' },
        dimensions: { length: 4690, width: 1730, height: '1415', wheelbase: 2570 },
        weights: { curb: 1190, total: 1590, load: 400, trailer: 1000, trailerB: 500 },
        vin: 'VIN444',
        color: 'Grön',
        history: { owners: 3, events: 18, lastOwnerChange: '2010-01-01' },
      };

      const personality = generateVehiclePersonality(vehicle);

      expect(personality).toContain('veteran');
    });

    test('carburetor adds specific trait', () => {
      const vehicle: VehicleData = {
        make: 'Volkswagen',
        model: 'Beetle',
        year: 1970,
        prodYear: 1970,
        regNo: 'CARB123',
        regDate: '1970-01-01',
        status: 'I trafik',
        bodyType: 'Personbil',
        passengers: 4,
        inspection: { last: '2024-01-01', mileage: '120000', next: '2025-01-01' },
        engine: { fuel: 'Bensin', power: '50 HK', volume: '1.6L', carburetor: 'Solex 34 PICT-3' },
        gearbox: 'Manuell',
        wheels: { drive: '2WD', tiresFront: '155R15', tiresRear: '155R15', boltPattern: '5x205' },
        dimensions: { length: 4079, width: 1585, height: '1500', wheelbase: 2400 },
        weights: { curb: 820, total: 1220, load: 400, trailer: 500, trailerB: 0 },
        vin: 'VIN555',
        color: 'Gul',
        history: { owners: 6, events: 30, lastOwnerChange: '2015-01-01' },
      };

      const personality = generateVehiclePersonality(vehicle);

      expect(personality).toContain('förgasare');
      expect(personality).toContain('Solex');
    });

    test('high mileage with 5-digit odometer detection', () => {
      const vehicle: VehicleData = {
        make: 'Volvo',
        model: '240',
        year: 1985,
        prodYear: 1985,
        regNo: 'MILE123',
        regDate: '1985-01-01',
        status: 'I trafik',
        bodyType: 'Personbil',
        passengers: 5,
        inspection: { last: '2024-01-01', mileage: '45000', next: '2025-01-01' },
        engine: { fuel: 'Bensin', power: '114 HK', volume: '2.3L' },
        gearbox: 'Manuell',
        wheels: { drive: '2WD', tiresFront: '185/65R15', tiresRear: '185/65R15', boltPattern: '5x108' },
        dimensions: { length: 4790, width: 1730, height: '1430', wheelbase: 2640 },
        weights: { curb: 1270, total: 1720, load: 450, trailer: 1200, trailerB: 600 },
        vin: 'VIN666',
        color: 'Röd',
        history: { owners: 4, events: 20, lastOwnerChange: '2012-01-01' },
      };

      const personality = generateVehiclePersonality(vehicle);

      // Should detect 5-digit odometer rollover for old car with low reading
      expect(personality).toContain('5-siffrig');
    });
  });

  describe('getVehicleNotes', () => {
    test('returns engine code note when available', () => {
      const vehicle: VehicleData = {
        make: 'Volvo',
        model: '240',
        year: 1988,
        engine: { fuel: 'Bensin', power: '114 HK', volume: '2.3L', code: 'B230F' },
      } as VehicleData;

      const notes = getVehicleNotes(vehicle);

      expect(notes.engineCode).toBe(' (B230F)');
    });

    test('returns empty engine code when not available', () => {
      const vehicle: VehicleData = {
        make: 'Toyota',
        model: 'Corolla',
        year: 2010,
        engine: { fuel: 'Bensin', power: '100 HK', volume: '1.6L' },
      } as VehicleData;

      const notes = getVehicleNotes(vehicle);

      expect(notes.engineCode).toBe('');
    });

    test('adds cooling note for air-cooled engines', () => {
      const vehicle: VehicleData = {
        make: 'Porsche',
        model: '911',
        year: 1973,
        engine: { fuel: 'Bensin', power: '150 HK', volume: '2.4L', cooling: 'Luftkyld' },
      } as VehicleData;

      const notes = getVehicleNotes(vehicle);

      expect(notes.coolingNote).toContain('Luftkyld');
    });

    test('adds veteran note for 30+ year old car', () => {
      const vehicle: VehicleData = {
        make: 'Volvo',
        model: '240',
        year: 1985,
        bodyType: 'Personbil',
        engine: { fuel: 'Bensin', power: '114 HK', volume: '2.3L' },
      } as VehicleData;

      const notes = getVehicleNotes(vehicle);

      expect(notes.veteranNote).toContain('Veteranfordon');
    });

    test('no veteran note for 29-year old car', () => {
      const currentYear = new Date().getFullYear();
      const vehicle: VehicleData = {
        make: 'Volvo',
        model: '240',
        year: currentYear - 29,
        bodyType: 'Personbil',
        engine: { fuel: 'Bensin', power: '114 HK', volume: '2.3L' },
      } as VehicleData;

      const notes = getVehicleNotes(vehicle);

      expect(notes.veteranNote).toBe('');
    });

    test('veteran age is 25 years for motorcycle', () => {
      const currentYear = new Date().getFullYear();
      const vehicle: VehicleData = {
        make: 'Honda',
        model: 'CB750',
        year: currentYear - 26,
        bodyType: 'Motorcykel',
        engine: { fuel: 'Bensin', power: '67 HK', volume: '0.75L' },
      } as VehicleData;

      const notes = getVehicleNotes(vehicle);

      expect(notes.veteranNote).toContain('Veteranfordon');
    });
  });

  describe('isVeteran', () => {
    test('car is veteran at 30 years', () => {
      const currentYear = new Date().getFullYear();
      const vehicle: VehicleData = {
        year: currentYear - 30,
        bodyType: 'Personbil',
      } as VehicleData;

      expect(isVeteran(vehicle)).toBe(true);
    });

    test('car is not veteran at 29 years', () => {
      const currentYear = new Date().getFullYear();
      const vehicle: VehicleData = {
        year: currentYear - 29,
        bodyType: 'Personbil',
      } as VehicleData;

      expect(isVeteran(vehicle)).toBe(false);
    });

    test('motorcycle is veteran at 25 years', () => {
      const currentYear = new Date().getFullYear();
      const vehicle: VehicleData = {
        year: currentYear - 25,
        bodyType: 'Motorcykel',
      } as VehicleData;

      expect(isVeteran(vehicle)).toBe(true);
    });

    test('motorcycle is not veteran at 24 years', () => {
      const currentYear = new Date().getFullYear();
      const vehicle: VehicleData = {
        year: currentYear - 24,
        bodyType: 'Motorcykel',
      } as VehicleData;

      expect(isVeteran(vehicle)).toBe(false);
    });

    test('MC in lowercase is recognized', () => {
      const currentYear = new Date().getFullYear();
      const vehicle: VehicleData = {
        year: currentYear - 26,
        bodyType: 'mc',
      } as VehicleData;

      expect(isVeteran(vehicle)).toBe(true);
    });
  });

  describe('getVehicleGreeting', () => {
    test('veteran skåpbil gets appropriate greeting', () => {
      const vehicle: VehicleData = {
        year: 1976,
        bodyType: 'Skåpbil',
      } as VehicleData;

      const greeting = getVehicleGreeting(vehicle);

      expect(greeting).toContain('skåp');
      expect(greeting).toContain('🚐');
    });

    test('modern personbil gets appropriate greeting', () => {
      const currentYear = new Date().getFullYear();
      const vehicle: VehicleData = {
        year: currentYear - 5,
        bodyType: 'Personbil',
      } as VehicleData;

      const greeting = getVehicleGreeting(vehicle);

      expect(greeting).toContain('modern');
      expect(greeting).toContain('🚘');
    });

    test('veteran motorcycle gets appropriate greeting', () => {
      const vehicle: VehicleData = {
        year: 1980,
        bodyType: 'Motorcykel',
      } as VehicleData;

      const greeting = getVehicleGreeting(vehicle);

      expect(greeting).toContain('veteran');
      expect(greeting).toContain('🏍️');
    });

    test('experienced vehicle gets appropriate greeting', () => {
      const currentYear = new Date().getFullYear();
      const vehicle: VehicleData = {
        year: currentYear - 25,
        bodyType: 'Personbil',
      } as VehicleData;

      const greeting = getVehicleGreeting(vehicle);

      expect(greeting).toContain('pålitlig');
    });
  });

  describe('generateSoundDoctorPersonality', () => {
    test('veteran vehicle has classic sound knowledge', () => {
      const vehicle: VehicleData = {
        year: 1976,
        engine: { fuel: 'Bensin', power: '75 HK', volume: '2.0L' },
      } as VehicleData;

      const personality = generateSoundDoctorPersonality(vehicle);

      expect(personality).toContain('klassiska');
      expect(personality).toContain('lyftare');
    });

    test('modern vehicle has turbo knowledge', () => {
      const currentYear = new Date().getFullYear();
      const vehicle: VehicleData = {
        year: currentYear - 5,
        engine: { fuel: 'Bensin', power: '200 HK', volume: '2.0L' },
      } as VehicleData;

      const personality = generateSoundDoctorPersonality(vehicle);

      expect(personality).toContain('moderna');
      expect(personality).toContain('turbo');
    });

    test('diesel vehicle mentions diesel sound expertise', () => {
      const vehicle: VehicleData = {
        year: 2010,
        engine: { fuel: 'Diesel', power: '150 HK', volume: '2.0L' },
      } as VehicleData;

      const personality = generateSoundDoctorPersonality(vehicle);

      expect(personality).toContain('diesel');
    });
  });
});

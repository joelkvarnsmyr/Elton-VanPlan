/**
 * Vehicle Data Service
 *
 * Automatically fetches vehicle data from Swedish registries and APIs
 * Supports: Registration Number, VIN, Image OCR, Blocket URLs
 */

import { VehicleData } from '@/types/types';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebase';

// ===========================
// TYPES & INTERFACES
// ===========================

export interface VehicleAPIResponse {
  success: boolean;
  data?: Partial<VehicleData>;
  error?: string;
  source: 'transportstyrelsen' | 'biluppgifter' | 'manual' | 'cache';
}

export interface RegNoSearchResult {
  regNo: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  color?: string;
  fuelType?: string;
}

// ===========================
// CACHE MANAGEMENT
// ===========================

interface CachedVehicle {
  data: Partial<VehicleData>;
  timestamp: number;
  source: string;
}

const CACHE_DURATION = 1000 * 60 * 60 * 24 * 7; // 7 days
const vehicleCache = new Map<string, CachedVehicle>();

function getCachedVehicle(key: string): Partial<VehicleData> | null {
  const cached = vehicleCache.get(key);
  if (!cached) return null;

  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    vehicleCache.delete(key);
    return null;
  }

  return cached.data;
}

function setCachedVehicle(key: string, data: Partial<VehicleData>, source: string) {
  vehicleCache.set(key, {
    data,
    timestamp: Date.now(),
    source
  });
}

// ===========================
// SWEDISH TRANSPORT AGENCY (Transportstyrelsen)
// ===========================

/**
 * Fetch vehicle data from Transportstyrelsen (Fordonuppgifter API)
 * NOTE: This is a placeholder - requires API key and proper authentication
 * Real implementation: https://www.transportstyrelsen.se/oppnadata
 */
async function fetchFromTransportstyrelsen(regNo: string): Promise<VehicleAPIResponse> {
  try {
    // TODO: Implement actual API call when credentials are available
    // const response = await fetch('https://api.transportstyrelsen.se/v1/vehicles', {
    //   headers: { 'Authorization': `Bearer ${API_KEY}` },
    //   body: JSON.stringify({ regNo })
    // });

    console.warn('Transportstyrelsen API not yet configured. Using mock data for development.');

    // Mock response for development
    return {
      success: false,
      error: 'Transportstyrelsen API requires authentication setup',
      source: 'transportstyrelsen'
    };

  } catch (error) {
    console.error('Transportstyrelsen API error:', error);
    return {
      success: false,
      error: 'Failed to fetch from Transportstyrelsen',
      source: 'transportstyrelsen'
    };
  }
}

// ===========================
// BILUPPGIFTER.SE INTEGRATION
// ===========================

// ===========================
// CLOUD FUNCTION INTEGRATION
// ===========================

/**
 * Call the vehicle scraping Cloud Function
 */
async function callScraperFunction(regNo: string): Promise<VehicleAPIResponse> {
  try {
    const functions = getFunctions(app, 'europe-west1');
    const scrapeVehicleData = httpsCallable(functions, 'scrapeVehicleData');

    // Call the function
    const result = await scrapeVehicleData({ regNo });
    const data = result.data as any; // Type safe casting would be better

    if (data.success && data.vehicleData) {
      return {
        success: true,
        data: data.vehicleData,
        source: data.source || 'scraper'
      };
    }

    return {
      success: false,
      error: data.error || 'Ingen data hittades',
      source: 'manual'
    };

  } catch (error) {
    console.error('Cloud Function error:', error);
    return {
      success: false,
      error: 'Kunde inte nå fordonstjänsten',
      source: 'manual'
    };
  }
}

// ===========================
// REG NUMBER LOOKUP (Main Entry Point)
// ===========================

/**
 * Fetch comprehensive vehicle data by registration number
 * Tries multiple sources and returns enriched data
 */
export async function fetchVehicleByRegNo(regNo: string): Promise<VehicleAPIResponse> {
  const cleanRegNo = regNo.toUpperCase().replace(/\s/g, '');

  // Check cache first
  const cached = getCachedVehicle(cleanRegNo);
  if (cached) {
    console.log(`Vehicle data loaded from cache: ${cleanRegNo}`);
    return {
      success: true,
      data: cached,
      source: 'cache'
    };
  }

  // Try Cloud Scraper (Car.info / Biluppgifter backup)
  console.log(`Fetching data for ${cleanRegNo} via Cloud Scraper...`);
  const result = await callScraperFunction(cleanRegNo);

  if (result.success && result.data) {
    console.log('Vehicle data found via scraper:', result.source);
    setCachedVehicle(cleanRegNo, result.data, result.source);
    return result;
  }


  // Return manual entry mode if all sources fail
  return {
    success: false,
    error: 'Kunde inte hämta fordonsdata automatiskt. Vänligen fyll i manuellt.',
    data: {
      regNo: cleanRegNo,
      make: '',
      model: '',
      year: new Date().getFullYear(),
      prodYear: new Date().getFullYear(),
      regDate: '',
      status: 'I trafik',
      bodyType: '',
      passengers: 0,
      inspection: { last: '', mileage: '', next: '' },
      engine: { fuel: '', power: '', volume: '' },
      gearbox: '',
      wheels: { drive: '', tiresFront: '', tiresRear: '', boltPattern: '' },
      dimensions: { length: 0, width: 0, height: '', wheelbase: 0 },
      weights: { curb: 0, total: 0, load: 0, trailer: 0, trailerB: 0 },
      vin: '',
      color: '',
      history: { owners: 0, events: 0, lastOwnerChange: '' }
    },
    source: 'manual'
  };
}

// ===========================
// BLOCKET AD PARSING
// ===========================

/**
 * Parse a Blocket vehicle ad and extract vehicle data
 * Uses AI (Gemini) to understand unstructured ad text
 */
export async function parseBlocketAd(url: string): Promise<VehicleAPIResponse> {
  try {
    // Validate Blocket URL
    if (!url.includes('blocket.se')) {
      return {
        success: false,
        error: 'Inte en giltig Blocket-länk',
        source: 'manual'
      };
    }

    // TODO: Implement actual scraping/parsing
    // Options:
    // 1. Use Puppeteer/Playwright to scrape the page
    // 2. Use Gemini AI to parse the HTML/text
    // 3. Use Blocket API if available

    console.warn('Blocket parsing not yet implemented');

    return {
      success: false,
      error: 'Blocket-parsing kommer snart! För tillfället, kopiera texten manuellt.',
      source: 'manual'
    };

  } catch (error) {
    console.error('Blocket parsing error:', error);
    return {
      success: false,
      error: 'Kunde inte läsa Blocket-annons',
      source: 'manual'
    };
  }
}

// ===========================
// IMAGE OCR (Extract Reg Number from Image)
// ===========================

/**
 * Extract registration number from vehicle image using OCR
 * Supports: License plate photos, registration documents
 */
export async function extractRegNoFromImage(imageBase64: string): Promise<string | null> {
  try {
    // TODO: Implement Google Vision API OCR
    // const visionClient = new ImageAnnotatorClient();
    // const [result] = await visionClient.textDetection(imageBase64);
    // const text = result.textAnnotations?.[0]?.description;
    // const regNoMatch = text.match(/[A-Z]{3}\s?\d{2}[A-Z0-9]/); // Swedish pattern

    console.warn('OCR not yet implemented. Requires Google Vision API setup.');

    return null;

  } catch (error) {
    console.error('OCR error:', error);
    return null;
  }
}

// ===========================
// DATA ENRICHMENT
// ===========================

/**
 * Enrich partial vehicle data with additional information
 * Useful when user provides minimal info (e.g., just make/model/year)
 */
export async function enrichVehicleData(partialData: Partial<VehicleData>): Promise<Partial<VehicleData>> {
  // If we have a reg number, try to fetch full data
  if (partialData.regNo) {
    const result = await fetchVehicleByRegNo(partialData.regNo);
    if (result.success && result.data) {
      return { ...partialData, ...result.data };
    }
  }

  // TODO: Add make/model-based enrichment
  // - Fetch typical specs for this model
  // - Get common dimensions/weights
  // - Add expert tips

  return partialData;
}

// ===========================
// VALIDATION
// ===========================

/**
 * Validate Swedish registration number format
 */
export function validateSwedishRegNo(regNo: string): boolean {
  const cleaned = regNo.toUpperCase().replace(/\s/g, '');

  // Old format: ABC123 (3 letters + 3 digits)
  const oldFormat = /^[A-Z]{3}\d{3}$/;

  // New format: ABC12D (3 letters + 2 digits + 1 letter/digit)
  const newFormat = /^[A-Z]{3}\d{2}[A-Z0-9]$/;

  return oldFormat.test(cleaned) || newFormat.test(cleaned);
}

/**
 * Format registration number for display
 */
export function formatRegNo(regNo: string): string {
  const cleaned = regNo.toUpperCase().replace(/\s/g, '');

  // Add space: ABC 123 or ABC 12D
  if (cleaned.length === 6) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  }

  return cleaned;
}

// ===========================
// MOCK DATA (For Development)
// ===========================

/**
 * Generate mock vehicle data for testing
 * This should be removed in production
 */
export function getMockVehicleData(regNo: string): Partial<VehicleData> {
  // Only return full demo data for the specific demo reg number
  if (regNo.toUpperCase().replace(/\s/g, '') === 'JSN398') {
    return {
      regNo: 'JSN 398',
      make: 'Volkswagen',
      model: 'LT 31',
      year: 1976,
      prodYear: 1976,
      regDate: '1978-02-14',
      status: 'I trafik',
      bodyType: 'Skåp',
      passengers: 3,
      inspection: {
        last: '2025-08-13',
        mileage: '10 000 mil',
        next: '2026-08-13'
      },
      engine: {
        fuel: 'Bensin',
        power: '75 HK',
        volume: '2.0L',
        code: 'CH'
      },
      gearbox: 'Manuell 4-växlad',
      wheels: {
        drive: 'Bakhjulsdrift (RWD)',
        tiresFront: '185R14C',
        tiresRear: '185R14C',
        boltPattern: '5x160'
      },
      dimensions: {
        length: 5400,
        width: 1980,
        height: '2600',
        wheelbase: 2500
      },
      weights: {
        curb: 2280,
        total: 3160,
        load: 880,
        trailer: 1400,
        trailerB: 750
      },
      vin: 'WVWZZZ2KZXW123456',
      color: 'Vit',
      history: {
        owners: 3,
        events: 12,
        lastOwnerChange: '2023-06-28'
      }
    };
  }

  // Generic fallback for other numbers (prevents "LT31 hallucination")
  return {
    regNo: formatRegNo(regNo),
    make: '',
    model: '',
    year: new Date().getFullYear(),
    status: 'Okänd',
    vin: '',
    engine: { fuel: 'Okänd', power: '', volume: '' }
  };
}

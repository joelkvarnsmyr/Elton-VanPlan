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

import { generateJSON, generateWithImage } from './aiService';

// ===========================
// BLOCKET AD PARSING
// ===========================

/**
 * Parse a Blocket vehicle ad and extract vehicle data
 * Uses AI (Gemini) to understand unstructured ad text and context
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

    console.log('Parsing Blocket ad via Gemini:', url);

    const systemPrompt = `You are an expert vehicle data extractor. 
Your task is to extract vehicle technical details from a given advertisement URL/Text.
You have access to Google Search to retrieve the content of the URL.
Return the data in a cleaner JSON format matching this structure:
{
 "regNo": "ABC 123", (if found)
 "make": "Volvo",
 "model": "V70",
 "year": 2010,
 "price": 120000,
 "description": "Short summary"
}`;

    const response = await generateJSON<Partial<VehicleData> & { price?: number }>(
      systemPrompt,
      `Extract vehicle data from this ad: ${url}`,
      { temperature: 0.1 }
    );

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data,
        source: 'manual' // AI extracted behaves like manual entry for safety
      };
    }

    return {
      success: false,
      error: 'Kunde inte tolka annonsen',
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
* Extract registration number from vehicle image using OCR (Gemini Vision)
*/
export async function extractRegNoFromImage(imageBase64: string): Promise<string | null> {
  try {
    const prompt = "Extract the Swedish vehicle registration number from this image. Return ONLY the number (e.g. ABC 123) without any extra text. If no registration number is visible, return 'NOT_FOUND'.";

    // Clean base64 string (remove data:image/jpeg;base64, prefix if present)
    const cleanBase64 = imageBase64.split(',')[1] || imageBase64;

    const text = await generateWithImage(prompt, cleanBase64);

    if (text.includes('NOT_FOUND')) return null;

    // Clean up result
    const regNo = text.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Validate format (Simple check)
    if (regNo.length >= 6) {
      // Format as ABC 123
      return regNo.slice(0, 3) + ' ' + regNo.slice(3);
    }

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
*/
export async function enrichVehicleData(partialData: Partial<VehicleData>): Promise<Partial<VehicleData>> {
  if (partialData.regNo) {
    const result = await fetchVehicleByRegNo(partialData.regNo);
    if (result.success && result.data) {
      return { ...partialData, ...result.data };
    }
  }
  return partialData;
}

// ===========================
// VALIDATION
// ===========================

export function validateSwedishRegNo(regNo: string): boolean {
  const cleaned = regNo.toUpperCase().replace(/\s/g, '');
  const oldFormat = /^[A-Z]{3}\d{3}$/;
  const newFormat = /^[A-Z]{3}\d{2}[A-Z0-9]$/;
  return oldFormat.test(cleaned) || newFormat.test(cleaned);
}

export function formatRegNo(regNo: string): string {
  const cleaned = regNo.toUpperCase().replace(/\s/g, '');
  if (cleaned.length === 6) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  }
  return cleaned;
}

// ===========================
// MOCK DATA (Legacy/Fallback)
// ===========================

export function getMockVehicleData(regNo: string): Partial<VehicleData> {
  // Simplified generic fallback
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

/**
 * OCR Service
 *
 * Handles Optical Character Recognition for:
 * 1. License plates / Registration numbers
 * 2. Receipts / Invoices (extract items, prices, totals)
 * 3. Service documents
 * 4. VIN numbers
 *
 * Uses: Google Cloud Vision API + Gemini AI for parsing
 */

import { GoogleGenAI } from "@google/genai";
import { ShoppingItem } from '@/types/types';

// ===========================
// GEMINI CLIENT
// ===========================

let client: GoogleGenAI | null = null;

const getClient = (): GoogleGenAI => {
  if (!client) {
    // @ts-ignore
    const apiKey = import.meta.env?.VITE_GEMINI_API_KEY || '';
    if (!apiKey) {
      console.warn("API Key missing for Gemini. OCR features will be limited.");
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
};

// ===========================
// LICENSE PLATE OCR
// ===========================

export interface LicensePlateResult {
  regNo: string | null;
  confidence: number;
  country?: string;
}

/**
 * Extract registration number from license plate image
 */
export async function extractRegNoFromImage(imageBase64: string): Promise<LicensePlateResult> {
  try {
    const client = getClient();
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `Analysera denna bild och hitta registreringsnumret (bilskylt).

Regler:
- Svenska registreringsnummer: ABC123 (3 bokstäver + 3 siffror) eller ABC12D (3 bokstäver + 2 siffror + 1 bokstav/siffra)
- Svara ENDAST med JSON i detta format:
{
  "regNo": "ABC123",
  "confidence": 0.95,
  "country": "SE"
}

Om du inte kan hitta ett registreringsnummer, returnera:
{
  "regNo": null,
  "confidence": 0,
  "country": null
}`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64
        }
      },
      { text: prompt }
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return { regNo: null, confidence: 0 };
    }

    const parsed = JSON.parse(jsonMatch[0]) as LicensePlateResult;
    return parsed;

  } catch (error) {
    console.error('License plate OCR failed:', error);
    return { regNo: null, confidence: 0 };
  }
}

// ===========================
// RECEIPT / INVOICE OCR
// ===========================

export interface ReceiptResult {
  success: boolean;
  store?: string;
  date?: string;
  total?: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  rawText?: string;
}

/**
 * Extract shopping items from receipt image
 */
export async function extractReceiptData(imageBase64: string): Promise<ReceiptResult> {
  try {
    const client = getClient();
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `Analysera detta kvitto och extrahera all information.

Returnera JSON i detta format:

{
  "success": true,
  "store": "Butikens namn",
  "date": "2025-12-08",
  "total": 1234.50,
  "items": [
    {
      "name": "Produktnamn",
      "quantity": 1,
      "price": 299.00
    }
  ]
}

VIKTIGT:
- Extrahera ALLA produkter från kvittot
- Tolka artikelnummer till läsbara produktnamn (t.ex. "SKF 1234" -> "Kullager SKF 1234")
- Priser i SEK (svenska kronor)
- Om du inte kan läsa något, sätt null

SVARA ENDAST MED JSON, inget annat.`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64
        }
      },
      { text: prompt }
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Could not parse receipt JSON');
    }

    const parsed = JSON.parse(jsonMatch[0]) as ReceiptResult;
    return parsed;

  } catch (error) {
    console.error('Receipt OCR failed:', error);
    return {
      success: false,
      items: []
    };
  }
}

/**
 * Convert receipt items to ShoppingItem format
 */
export function receiptItemsToShoppingItems(receiptItems: ReceiptResult['items']): Partial<ShoppingItem>[] {
  return receiptItems.map(item => ({
    name: item.name,
    category: 'Övrigt' as const, // User can change this
    estimatedCost: item.price,
    actualCost: item.price,
    quantity: `${item.quantity} st`,
    checked: true, // Already purchased
    purchaseDate: new Date().toISOString().split('T')[0]
  }));
}

// ===========================
// VIN NUMBER OCR
// ===========================

export interface VINResult {
  vin: string | null;
  confidence: number;
}

/**
 * Extract VIN (Vehicle Identification Number) from image
 */
export async function extractVIN(imageBase64: string): Promise<VINResult> {
  try {
    const client = getClient();
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `Hitta VIN-numret (Vehicle Identification Number) i denna bild.

VIN format: 17 tecken (0-9, A-Z, utan I, O, Q)
Exempel: WVWZZZ2KZXW123456

Returnera JSON:
{
  "vin": "VIN-NUMMER-HÄR",
  "confidence": 0.95
}

Om du inte hittar något VIN:
{
  "vin": null,
  "confidence": 0
}`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64
        }
      },
      { text: prompt }
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return { vin: null, confidence: 0 };
    }

    const parsed = JSON.parse(jsonMatch[0]) as VINResult;

    // Validate VIN format
    if (parsed.vin && !/^[A-HJ-NPR-Z0-9]{17}$/.test(parsed.vin)) {
      console.warn('Invalid VIN format detected:', parsed.vin);
      return { vin: null, confidence: 0 };
    }

    return parsed;

  } catch (error) {
    console.error('VIN OCR failed:', error);
    return { vin: null, confidence: 0 };
  }
}

// ===========================
// SERVICE DOCUMENT OCR
// ===========================

export interface ServiceDocumentResult {
  success: boolean;
  date?: string;
  mileage?: string;
  workshop?: string;
  description?: string;
  cost?: number;
  parts?: string[];
}

/**
 * Extract service log info from document/photo
 */
export async function extractServiceDocument(imageBase64: string): Promise<ServiceDocumentResult> {
  try {
    const client = getClient();
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `Läs detta servicedokument och extrahera information.

Returnera JSON:
{
  "success": true,
  "date": "2025-08-13",
  "mileage": "10 000 mil",
  "workshop": "Mekonomen Sundsvall",
  "description": "Oljebyte, bromsservice",
  "cost": 2500,
  "parts": ["Motorolja 10W-40", "Oljefilter", "Bromsbelägg fram"]
}

SVARA MED ENDAST JSON.`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64
        }
      },
      { text: prompt }
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Could not parse service document JSON');
    }

    const parsed = JSON.parse(jsonMatch[0]) as ServiceDocumentResult;
    return parsed;

  } catch (error) {
    console.error('Service document OCR failed:', error);
    return {
      success: false
    };
  }
}

// ===========================
// GENERIC TEXT EXTRACTION
// ===========================

/**
 * Extract all readable text from image (fallback/debug tool)
 */
export async function extractAllText(imageBase64: string): Promise<string> {
  try {
    const client = getClient();
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `Extrahera all läsbar text från denna bild. Returnera texten i vanligt textformat, inte JSON.`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64
        }
      },
      { text: prompt }
    ]);

    return result.response.text();

  } catch (error) {
    console.error('Text extraction failed:', error);
    return '';
  }
}

// ===========================
// VALIDATION HELPERS
// ===========================

/**
 * Validate Swedish registration number format
 */
export function isValidSwedishRegNo(regNo: string): boolean {
  const cleaned = regNo.toUpperCase().replace(/\s/g, '');
  return /^[A-Z]{3}\d{3}$/.test(cleaned) || /^[A-Z]{3}\d{2}[A-Z0-9]$/.test(cleaned);
}

/**
 * Validate VIN format
 */
export function isValidVIN(vin: string): boolean {
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(vin);
}

// ===========================
// EXPORT
// ===========================

export default {
  extractRegNoFromImage,
  extractReceiptData,
  receiptItemsToShoppingItems,
  extractVIN,
  extractServiceDocument,
  extractAllText,
  isValidSwedishRegNo,
  isValidVIN
};

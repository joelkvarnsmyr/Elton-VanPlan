/**
 * OCR Cloud Functions
 *
 * Handles image-based AI operations securely on the backend:
 * - License plate recognition
 * - Receipt parsing
 * - VIN extraction
 * - Service document parsing
 */

import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { GoogleGenAI } from '@google/genai';
import {
  validateBase64Image,
  sanitizeErrorMessage,
  LIMITS
} from '../utils/validation';

const geminiApiKey = defineSecret('GEMINI_API_KEY');

// Using Gemini 2.5 Flash for vision tasks (best for image understanding)
const DEFAULT_MODEL = 'gemini-2.5-flash';

// --- TYPES ---

interface LicensePlateResult {
  regNo: string | null;
  confidence: number;
  country?: string;
}

interface ReceiptResult {
  success: boolean;
  store?: string;
  date?: string;
  total?: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface VINResult {
  vin: string | null;
  confidence: number;
}

interface ServiceDocumentResult {
  success: boolean;
  date?: string;
  mileage?: string;
  workshop?: string;
  description?: string;
  cost?: number;
  parts?: string[];
}

// --- HELPER FUNCTIONS ---

/**
 * Safely parse JSON from AI response
 */
function parseJsonResponse<T>(text: string, fallback: T): T {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return fallback;
    }
    return JSON.parse(jsonMatch[0]) as T;
  } catch (error) {
    console.warn('Failed to parse JSON response:', error);
    return fallback;
  }
}

/**
 * Initialize Gemini AI client
 */
function getAIClient(apiKey: string): GoogleGenAI {
  if (!apiKey) {
    throw new HttpsError('failed-precondition', 'API key not configured');
  }
  return new GoogleGenAI({ apiKey });
}

// --- CLOUD FUNCTIONS ---

/**
 * Extract registration number from license plate image
 */
export const ocrLicensePlate = onCall(
  {
    secrets: [geminiApiKey],
    region: 'europe-west1',
    maxInstances: 10,
    timeoutSeconds: 30,
    memory: '256MiB'
  },
  async (request: CallableRequest<{ imageBase64: string }>) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Validate and sanitize input
    const imageData = validateBase64Image(request.data?.imageBase64, 'imageBase64');

    try {
      const ai = getAIClient(geminiApiKey.value());

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

      const result = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: [{ role: 'user', parts: [
          { inlineData: { mimeType: 'image/jpeg', data: imageData } },
          { text: prompt }
        ]}]
      });

      return parseJsonResponse<LicensePlateResult>(
        result.text || '',
        { regNo: null, confidence: 0 }
      );

    } catch (error) {
      console.error('License plate OCR failed:', error);
      throw new HttpsError('internal', `OCR failed: ${sanitizeErrorMessage(error)}`);
    }
  }
);

/**
 * Extract items and totals from receipt image
 */
export const ocrReceipt = onCall(
  {
    secrets: [geminiApiKey],
    region: 'europe-west1',
    maxInstances: 10,
    timeoutSeconds: 60,
    memory: '256MiB'
  },
  async (request: CallableRequest<{ imageBase64: string }>) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Validate and sanitize input
    const imageData = validateBase64Image(request.data?.imageBase64, 'imageBase64');

    try {
      const ai = getAIClient(geminiApiKey.value());

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
- Tolka artikelnummer till läsbara produktnamn
- Priser i SEK (svenska kronor)
- Om du inte kan läsa något, sätt null

SVARA ENDAST MED JSON, inget annat.`;

      const result = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: [{ role: 'user', parts: [
          { inlineData: { mimeType: 'image/jpeg', data: imageData } },
          { text: prompt }
        ]}]
      });

      return parseJsonResponse<ReceiptResult>(
        result.text || '',
        { success: false, items: [] }
      );

    } catch (error) {
      console.error('Receipt OCR failed:', error);
      throw new HttpsError('internal', `OCR failed: ${sanitizeErrorMessage(error)}`);
    }
  }
);

/**
 * Extract VIN from image
 */
export const ocrVIN = onCall(
  {
    secrets: [geminiApiKey],
    region: 'europe-west1',
    maxInstances: 10,
    timeoutSeconds: 30,
    memory: '256MiB'
  },
  async (request: CallableRequest<{ imageBase64: string }>) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Validate and sanitize input
    const imageData = validateBase64Image(request.data?.imageBase64, 'imageBase64');

    try {
      const ai = getAIClient(geminiApiKey.value());

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

      const result = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: [{ role: 'user', parts: [
          { inlineData: { mimeType: 'image/jpeg', data: imageData } },
          { text: prompt }
        ]}]
      });

      const parsed = parseJsonResponse<VINResult>(
        result.text || '',
        { vin: null, confidence: 0 }
      );

      // Validate VIN format
      if (parsed.vin && !/^[A-HJ-NPR-Z0-9]{17}$/.test(parsed.vin)) {
        console.warn('Invalid VIN format:', parsed.vin);
        return { vin: null, confidence: 0 };
      }

      return parsed;

    } catch (error) {
      console.error('VIN OCR failed:', error);
      throw new HttpsError('internal', `OCR failed: ${sanitizeErrorMessage(error)}`);
    }
  }
);

/**
 * Extract service document information
 */
export const ocrServiceDocument = onCall(
  {
    secrets: [geminiApiKey],
    region: 'europe-west1',
    maxInstances: 10,
    timeoutSeconds: 60,
    memory: '256MiB'
  },
  async (request: CallableRequest<{ imageBase64: string }>) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Validate and sanitize input (allow larger documents)
    const imageData = validateBase64Image(
      request.data?.imageBase64,
      'imageBase64',
      LIMITS.MAX_DOCUMENT_SIZE_BASE64
    );

    try {
      const ai = getAIClient(geminiApiKey.value());

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

      const result = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: [{ role: 'user', parts: [
          { inlineData: { mimeType: 'image/jpeg', data: imageData } },
          { text: prompt }
        ]}]
      });

      return parseJsonResponse<ServiceDocumentResult>(
        result.text || '',
        { success: false }
      );

    } catch (error) {
      console.error('Service document OCR failed:', error);
      throw new HttpsError('internal', `OCR failed: ${sanitizeErrorMessage(error)}`);
    }
  }
);

/**
 * Generic text extraction from image
 */
export const ocrExtractText = onCall(
  {
    secrets: [geminiApiKey],
    region: 'europe-west1',
    maxInstances: 10,
    timeoutSeconds: 30,
    memory: '256MiB'
  },
  async (request: CallableRequest<{ imageBase64: string }>) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Validate and sanitize input
    const imageData = validateBase64Image(request.data?.imageBase64, 'imageBase64');

    try {
      const ai = getAIClient(geminiApiKey.value());

      const result = await ai.models.generateContent({
        model: DEFAULT_MODEL,
        contents: [{ role: 'user', parts: [
          { inlineData: { mimeType: 'image/jpeg', data: imageData } },
          { text: 'Extrahera all läsbar text från denna bild. Returnera texten i vanligt textformat.' }
        ]}]
      });

      return { text: result.text || '' };

    } catch (error) {
      console.error('Text extraction failed:', error);
      throw new HttpsError('internal', `OCR failed: ${sanitizeErrorMessage(error)}`);
    }
  }
);

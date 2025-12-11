"use strict";
/**
 * OCR Cloud Functions
 *
 * Handles image-based AI operations securely on the backend:
 * - License plate recognition
 * - Receipt parsing
 * - VIN extraction
 * - Service document parsing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ocrExtractText = exports.ocrServiceDocument = exports.ocrVIN = exports.ocrReceipt = exports.ocrLicensePlate = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const genai_1 = require("@google/genai");
const geminiApiKey = (0, params_1.defineSecret)('GEMINI_API_KEY');
const DEFAULT_MODEL = 'gemini-2.0-flash-exp';
// --- CLOUD FUNCTIONS ---
/**
 * Extract registration number from license plate image
 */
exports.ocrLicensePlate = (0, https_1.onCall)({
    secrets: [geminiApiKey],
    region: 'europe-west1',
    maxInstances: 10,
    timeoutSeconds: 30,
    memory: '256MiB'
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { imageBase64 } = request.data;
    if (!imageBase64) {
        throw new https_1.HttpsError('invalid-argument', 'Image is required');
    }
    const apiKey = geminiApiKey.value();
    if (!apiKey) {
        throw new https_1.HttpsError('failed-precondition', 'API key not configured');
    }
    try {
        const ai = new genai_1.GoogleGenAI({ apiKey });
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
                        { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
                        { text: prompt }
                    ] }]
        });
        const text = result.text || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return { regNo: null, confidence: 0 };
        }
        return JSON.parse(jsonMatch[0]);
    }
    catch (error) {
        console.error('License plate OCR failed:', error);
        throw new https_1.HttpsError('internal', `OCR failed: ${error.message}`);
    }
});
/**
 * Extract items and totals from receipt image
 */
exports.ocrReceipt = (0, https_1.onCall)({
    secrets: [geminiApiKey],
    region: 'europe-west1',
    maxInstances: 10,
    timeoutSeconds: 60,
    memory: '256MiB'
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { imageBase64 } = request.data;
    if (!imageBase64) {
        throw new https_1.HttpsError('invalid-argument', 'Image is required');
    }
    const apiKey = geminiApiKey.value();
    if (!apiKey) {
        throw new https_1.HttpsError('failed-precondition', 'API key not configured');
    }
    try {
        const ai = new genai_1.GoogleGenAI({ apiKey });
        // Model will be used directly via ai.models.generateContent
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
        const result = await ai.models.generateContent({ model: DEFAULT_MODEL, contents: [{ role: 'user', parts: [
                        { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
                        { text: prompt }
                    ] }] });
        const text = result.text || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return { success: false, items: [] };
        }
        return JSON.parse(jsonMatch[0]);
    }
    catch (error) {
        console.error('Receipt OCR failed:', error);
        throw new https_1.HttpsError('internal', `OCR failed: ${error.message}`);
    }
});
/**
 * Extract VIN from image
 */
exports.ocrVIN = (0, https_1.onCall)({
    secrets: [geminiApiKey],
    region: 'europe-west1',
    maxInstances: 10,
    timeoutSeconds: 30,
    memory: '256MiB'
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { imageBase64 } = request.data;
    if (!imageBase64) {
        throw new https_1.HttpsError('invalid-argument', 'Image is required');
    }
    const apiKey = geminiApiKey.value();
    if (!apiKey) {
        throw new https_1.HttpsError('failed-precondition', 'API key not configured');
    }
    try {
        const ai = new genai_1.GoogleGenAI({ apiKey });
        // Model will be used directly via ai.models.generateContent
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
        const result = await ai.models.generateContent({ model: DEFAULT_MODEL, contents: [{ role: 'user', parts: [
                        { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
                        { text: prompt }
                    ] }] });
        const text = result.text || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return { vin: null, confidence: 0 };
        }
        const parsed = JSON.parse(jsonMatch[0]);
        // Validate VIN format
        if (parsed.vin && !/^[A-HJ-NPR-Z0-9]{17}$/.test(parsed.vin)) {
            console.warn('Invalid VIN format:', parsed.vin);
            return { vin: null, confidence: 0 };
        }
        return parsed;
    }
    catch (error) {
        console.error('VIN OCR failed:', error);
        throw new https_1.HttpsError('internal', `OCR failed: ${error.message}`);
    }
});
/**
 * Extract service document information
 */
exports.ocrServiceDocument = (0, https_1.onCall)({
    secrets: [geminiApiKey],
    region: 'europe-west1',
    maxInstances: 10,
    timeoutSeconds: 60,
    memory: '256MiB'
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { imageBase64 } = request.data;
    if (!imageBase64) {
        throw new https_1.HttpsError('invalid-argument', 'Image is required');
    }
    const apiKey = geminiApiKey.value();
    if (!apiKey) {
        throw new https_1.HttpsError('failed-precondition', 'API key not configured');
    }
    try {
        const ai = new genai_1.GoogleGenAI({ apiKey });
        // Model will be used directly via ai.models.generateContent
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
        const result = await ai.models.generateContent({ model: DEFAULT_MODEL, contents: [{ role: 'user', parts: [
                        { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
                        { text: prompt }
                    ] }] });
        const text = result.text || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return { success: false };
        }
        return JSON.parse(jsonMatch[0]);
    }
    catch (error) {
        console.error('Service document OCR failed:', error);
        throw new https_1.HttpsError('internal', `OCR failed: ${error.message}`);
    }
});
/**
 * Generic text extraction from image
 */
exports.ocrExtractText = (0, https_1.onCall)({
    secrets: [geminiApiKey],
    region: 'europe-west1',
    maxInstances: 10,
    timeoutSeconds: 30,
    memory: '256MiB'
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { imageBase64 } = request.data;
    if (!imageBase64) {
        throw new https_1.HttpsError('invalid-argument', 'Image is required');
    }
    const apiKey = geminiApiKey.value();
    if (!apiKey) {
        throw new https_1.HttpsError('failed-precondition', 'API key not configured');
    }
    try {
        const ai = new genai_1.GoogleGenAI({ apiKey });
        // Model will be used directly via ai.models.generateContent
        const result = await ai.models.generateContent({ model: DEFAULT_MODEL, contents: [{ role: 'user', parts: [
                        { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
                        { text: 'Extrahera all läsbar text från denna bild. Returnera texten i vanligt textformat.' }
                    ] }] });
        return { text: result.text };
    }
    catch (error) {
        console.error('Text extraction failed:', error);
        throw new https_1.HttpsError('internal', `OCR failed: ${error.message}`);
    }
});
//# sourceMappingURL=ocr.js.map
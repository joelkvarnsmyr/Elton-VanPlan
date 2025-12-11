/**
 * OCR Service
 *
 * Handles Optical Character Recognition via Cloud Functions:
 * 1. License plates / Registration numbers
 * 2. Receipts / Invoices (extract items, prices, totals)
 * 3. Service documents
 * 4. VIN numbers
 *
 * All API calls are handled securely on the backend.
 */

import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebase';
import { ShoppingItem } from '@/types/types';

// Initialize Firebase Functions
const functions = getFunctions(app, 'europe-west1');

// --- CALLABLE FUNCTION REFERENCES ---

const ocrLicensePlateFn = httpsCallable<{ imageBase64: string }, LicensePlateResult>(
  functions, 'ocrLicensePlate'
);

const ocrReceiptFn = httpsCallable<{ imageBase64: string }, ReceiptResult>(
  functions, 'ocrReceipt'
);

const ocrVINFn = httpsCallable<{ imageBase64: string }, VINResult>(
  functions, 'ocrVIN'
);

const ocrServiceDocumentFn = httpsCallable<{ imageBase64: string }, ServiceDocumentResult>(
  functions, 'ocrServiceDocument'
);

const ocrExtractTextFn = httpsCallable<{ imageBase64: string }, { text: string }>(
  functions, 'ocrExtractText'
);

// ===========================
// TYPES
// ===========================

export interface LicensePlateResult {
  regNo: string | null;
  confidence: number;
  country?: string;
}

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

export interface VINResult {
  vin: string | null;
  confidence: number;
}

export interface ServiceDocumentResult {
  success: boolean;
  date?: string;
  mileage?: string;
  workshop?: string;
  description?: string;
  cost?: number;
  parts?: string[];
}

// ===========================
// LICENSE PLATE OCR
// ===========================

/**
 * Extract registration number from license plate image
 */
export async function extractRegNoFromImage(imageBase64: string): Promise<LicensePlateResult> {
  try {
    const result = await ocrLicensePlateFn({ imageBase64 });
    return result.data;
  } catch (error) {
    console.error('License plate OCR failed:', error);
    return { regNo: null, confidence: 0 };
  }
}

// ===========================
// RECEIPT / INVOICE OCR
// ===========================

/**
 * Extract shopping items from receipt image
 */
export async function extractReceiptData(imageBase64: string): Promise<ReceiptResult> {
  try {
    const result = await ocrReceiptFn({ imageBase64 });
    return result.data;
  } catch (error) {
    console.error('Receipt OCR failed:', error);
    return { success: false, items: [] };
  }
}

/**
 * Convert receipt items to ShoppingItem format
 */
export function receiptItemsToShoppingItems(receiptItems: ReceiptResult['items']): Partial<ShoppingItem>[] {
  return receiptItems.map(item => ({
    name: item.name,
    category: 'Övrigt' as const,
    estimatedCost: item.price,
    actualCost: item.price,
    quantity: `${item.quantity} st`,
    checked: true,
    purchaseDate: new Date().toISOString().split('T')[0]
  }));
}

// ===========================
// VIN NUMBER OCR
// ===========================

/**
 * Extract VIN (Vehicle Identification Number) from image
 */
export async function extractVIN(imageBase64: string): Promise<VINResult> {
  try {
    const result = await ocrVINFn({ imageBase64 });
    return result.data;
  } catch (error) {
    console.error('VIN OCR failed:', error);
    return { vin: null, confidence: 0 };
  }
}

// ===========================
// SERVICE DOCUMENT OCR
// ===========================

/**
 * Extract service log info from document/photo
 */
export async function extractServiceDocument(imageBase64: string): Promise<ServiceDocumentResult> {
  try {
    const result = await ocrServiceDocumentFn({ imageBase64 });
    return result.data;
  } catch (error) {
    console.error('Service document OCR failed:', error);
    return { success: false };
  }
}

// ===========================
// GENERIC TEXT EXTRACTION
// ===========================

/**
 * Extract all readable text from image
 */
export async function extractAllText(imageBase64: string): Promise<string> {
  try {
    const result = await ocrExtractTextFn({ imageBase64 });
    return result.data.text;
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

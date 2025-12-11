/**
 * Firebase Cloud Functions - Main Entry Point
 *
 * Exporterar alla Cloud Functions för Elton VanPlan.
 * Alla AI-relaterade funktioner hanteras säkert på backend.
 */

// AI Proxy Functions
export { aiChat, aiParse, aiDeepResearch, aiToolResponse } from './ai/proxy';

// OCR Functions
export { ocrLicensePlate, ocrReceipt, ocrVIN, ocrServiceDocument, ocrExtractText } from './ai/ocr';

// Project Management Functions
export { transferProjectOwnership } from './project/management';

// Future: Add more function exports here
// export { userCleanup } from './admin/cleanup';
// export { webhooks } from './integrations/webhooks';

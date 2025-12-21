/**
 * Firebase Cloud Functions - Main Entry Point
 *
 * Exporterar alla Cloud Functions för Elton VanPlan.
 * Alla AI-relaterade funktioner hanteras säkert på backend.
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin globally once
if (admin.apps.length === 0) {
    admin.initializeApp();
}


// AI Proxy Functions
export { aiChat, aiParse, aiDeepResearch, aiToolResponse } from './ai/proxy';

// OCR Functions
export { ocrLicensePlate, ocrReceipt, ocrVIN, ocrServiceDocument, ocrExtractText } from './ai/ocr';

// Project Management Functions
export { transferProjectOwnership } from './project/management';

// Firestore Triggers
// TODO: Re-enable after fixing deployment issue
// export { onTaskComplete, onTaskDelete, onProjectDelete } from './project/triggers';

// Vehicle Scraper
export * from './scraper/vehicleScraper';

// Future: Add more function exports here
// export { userCleanup } from './admin/cleanup';
// MCP Server (Public AI Interface)
export { eltonMcp } from './mcp';
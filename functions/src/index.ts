/**
 * Elton VanPlan Cloud Functions
 *
 * Secure backend for AI API calls
 * All API keys are stored in Google Secret Manager
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export all function modules
// export * from './ai/proxy'; // TODO: Fix Google AI SDK version mismatch
// export * from './ai/ocr'; // TODO: Re-enable when OCR is implemented
export * from './scraper/vehicleScraper';

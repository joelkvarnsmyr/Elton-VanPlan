"use strict";
/**
 * Firebase Cloud Functions - Main Entry Point
 *
 * Exporterar alla Cloud Functions för Elton VanPlan.
 * Alla AI-relaterade funktioner hanteras säkert på backend.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferProjectOwnership = exports.ocrExtractText = exports.ocrServiceDocument = exports.ocrVIN = exports.ocrReceipt = exports.ocrLicensePlate = exports.aiToolResponse = exports.aiDeepResearch = exports.aiParse = exports.aiChat = void 0;
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin globally once
if (admin.apps.length === 0) {
    admin.initializeApp();
}
// AI Proxy Functions
var proxy_1 = require("./ai/proxy");
Object.defineProperty(exports, "aiChat", { enumerable: true, get: function () { return proxy_1.aiChat; } });
Object.defineProperty(exports, "aiParse", { enumerable: true, get: function () { return proxy_1.aiParse; } });
Object.defineProperty(exports, "aiDeepResearch", { enumerable: true, get: function () { return proxy_1.aiDeepResearch; } });
Object.defineProperty(exports, "aiToolResponse", { enumerable: true, get: function () { return proxy_1.aiToolResponse; } });
// OCR Functions
var ocr_1 = require("./ai/ocr");
Object.defineProperty(exports, "ocrLicensePlate", { enumerable: true, get: function () { return ocr_1.ocrLicensePlate; } });
Object.defineProperty(exports, "ocrReceipt", { enumerable: true, get: function () { return ocr_1.ocrReceipt; } });
Object.defineProperty(exports, "ocrVIN", { enumerable: true, get: function () { return ocr_1.ocrVIN; } });
Object.defineProperty(exports, "ocrServiceDocument", { enumerable: true, get: function () { return ocr_1.ocrServiceDocument; } });
Object.defineProperty(exports, "ocrExtractText", { enumerable: true, get: function () { return ocr_1.ocrExtractText; } });
// Project Management Functions
var management_1 = require("./project/management");
Object.defineProperty(exports, "transferProjectOwnership", { enumerable: true, get: function () { return management_1.transferProjectOwnership; } });
// Firestore Triggers
// TODO: Re-enable after fixing deployment issue
// export { onTaskComplete, onTaskDelete, onProjectDelete } from './project/triggers';
// Vehicle Scraper
__exportStar(require("./scraper/vehicleScraper"), exports);
// Future: Add more function exports here
// export { userCleanup } from './admin/cleanup';
// export { webhooks } from './integrations/webhooks';
//# sourceMappingURL=index.js.map
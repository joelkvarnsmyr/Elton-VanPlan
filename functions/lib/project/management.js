"use strict";
/**
 * Project Management Cloud Functions
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferProjectOwnership = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();
exports.transferProjectOwnership = (0, https_1.onCall)({
    region: 'europe-west1',
    timeoutSeconds: 60,
    memory: '256MiB',
    // Inget behov av 'node' här eftersom det hanteras i firebase.json
}, async (request) => {
    // 1. Authentication Check
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const { projectId, newOwnerId } = request.data;
    const oldOwnerId = request.auth.uid;
    // 2. Input Validation
    if (!projectId || !newOwnerId) {
        throw new https_1.HttpsError('invalid-argument', 'The function must be called with "projectId" and "newOwnerId" arguments.');
    }
    if (oldOwnerId === newOwnerId) {
        throw new https_1.HttpsError('invalid-argument', 'The new owner cannot be the same as the current owner.');
    }
    const projectRef = db.collection('projects').doc(projectId);
    try {
        await db.runTransaction(async (transaction) => {
            const projectDoc = await transaction.get(projectRef);
            if (!projectDoc.exists) {
                throw new https_1.HttpsError('not-found', 'Project not found.');
            }
            const projectData = projectDoc.data();
            if (!projectData) {
                throw new https_1.HttpsError('internal', 'Project data is corrupt or missing.');
            }
            // 3. Authorization Check
            if (projectData.ownerId !== oldOwnerId) {
                throw new https_1.HttpsError('permission-denied', 'Only the project owner can transfer ownership.');
            }
            // 4. New Owner Validation
            const newOwnerIsMember = projectData.members?.some((member) => member.uid === newOwnerId);
            if (!newOwnerIsMember) {
                throw new https_1.HttpsError('permission-denied', 'The new owner must be a member of the project.');
            }
            // 5. Update member roles
            const updatedMembers = projectData.members?.map((member) => {
                if (member.uid === oldOwnerId) {
                    return { ...member, role: 'member' };
                }
                if (member.uid === newOwnerId) {
                    return { ...member, role: 'owner' };
                }
                return member;
            }) || [];
            // 6. Perform the transfer
            transaction.update(projectRef, {
                ownerId: newOwnerId,
                members: updatedMembers
            });
        });
        console.log(`Successfully transferred ownership of project ${projectId} from ${oldOwnerId} to ${newOwnerId}`);
        return { success: true, message: 'Project ownership transferred successfully.' };
    }
    catch (error) {
        console.error('Error transferring project ownership:', error);
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        else {
            // Log the original error for debugging
            console.error('Unexpected error details:', error);
            throw new https_1.HttpsError('internal', 'An unexpected error occurred during the transaction.');
        }
    }
});
//# sourceMappingURL=management.js.map
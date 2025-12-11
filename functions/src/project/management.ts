/**
 * Project Management Cloud Functions
 */

import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

interface TransferOwnershipRequest {
    projectId: string;
    newOwnerId: string;
}

export const transferProjectOwnership = onCall(
    {
        region: 'europe-west1',
        timeoutSeconds: 60,
        memory: '256MiB',
        // Inget behov av 'node' här eftersom det hanteras i firebase.json
    },
    async (request: CallableRequest<TransferOwnershipRequest>) => {
        
        // 1. Authentication Check
        if (!request.auth) {
            throw new HttpsError(
                'unauthenticated', 
                'The function must be called while authenticated.'
            );
        }

        const { projectId, newOwnerId } = request.data;
        const oldOwnerId = request.auth.uid;

        // 2. Input Validation
        if (!projectId || !newOwnerId) {
            throw new HttpsError(
                'invalid-argument', 
                'The function must be called with "projectId" and "newOwnerId" arguments.'
            );
        }

        if (oldOwnerId === newOwnerId) {
            throw new HttpsError(
                'invalid-argument',
                'The new owner cannot be the same as the current owner.'
            );
        }

        const projectRef = db.collection('projects').doc(projectId);

        try {
            await db.runTransaction(async (transaction) => {
                const projectDoc = await transaction.get(projectRef);

                if (!projectDoc.exists) {
                    throw new HttpsError('not-found', 'Project not found.');
                }

                const projectData = projectDoc.data();
                if (!projectData) {
                    throw new HttpsError('internal', 'Project data is corrupt or missing.');
                }

                // 3. Authorization Check
                if (projectData.ownerId !== oldOwnerId) {
                    throw new HttpsError(
                        'permission-denied', 
                        'Only the project owner can transfer ownership.'
                    );
                }

                // 4. New Owner Validation
                const newOwnerIsMember = projectData.members?.some((member: any) => member.uid === newOwnerId);
                if (!newOwnerIsMember) {
                    throw new HttpsError(
                        'permission-denied',
                        'The new owner must be a member of the project.'
                    );
                }

                // 5. Update member roles
                const updatedMembers = projectData.members?.map((member: any) => {
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

        } catch (error) {
            console.error('Error transferring project ownership:', error);
            if (error instanceof HttpsError) {
                throw error;
            } else {
                // Log the original error for debugging
                console.error('Unexpected error details:', error);
                throw new HttpsError('internal', 'An unexpected error occurred during the transaction.');
            }
        }
    }
);

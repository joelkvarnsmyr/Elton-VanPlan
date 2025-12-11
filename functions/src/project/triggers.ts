/**
 * Firestore Triggers for Project Management
 *
 * Handles automatic updates when tasks or projects change:
 * - onTaskComplete: Unblocks dependent tasks when a task is completed
 * - onTaskDelete: Removes task from blockers arrays when deleted
 * - onProjectDelete: Cleans up all sub-collections when project is deleted
 */

import { onDocumentUpdated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}

const db = admin.firestore();

// Task status constants (matching src/types/types.ts)
const TASK_STATUS = {
    IDEA: 'Idé & Research',
    TODO: 'Att göra',
    IN_PROGRESS: 'Pågående',
    DONE: 'Klart',
    BLOCKED: 'Blockerad'
};

/**
 * onTaskComplete
 *
 * When a task's status changes to DONE, this function:
 * 1. Finds all tasks in the same project that have this task as a blocker
 * 2. Removes this task from their blockers array
 * 3. If the blockers array becomes empty and status is BLOCKED, changes status to TODO
 */
export const onTaskComplete = onDocumentUpdated(
    {
        document: 'projects/{projectId}/tasks/{taskId}',
        region: 'europe-west1',
        timeoutSeconds: 60,
        memory: '256MiB'
    },
    async (event) => {
        const beforeData = event.data?.before.data();
        const afterData = event.data?.after.data();

        if (!beforeData || !afterData) {
            console.log('No data in event, skipping.');
            return null;
        }

        // Only trigger when status changes to DONE
        if (beforeData.status === afterData.status) {
            return null;
        }

        if (afterData.status !== TASK_STATUS.DONE) {
            return null;
        }

        const projectId = event.params.projectId;
        const completedTaskId = event.params.taskId;

        console.log(`Task ${completedTaskId} completed in project ${projectId}. Unblocking dependent tasks...`);

        // Find all tasks in this project that have this task as a blocker
        const tasksRef = db.collection('projects').doc(projectId).collection('tasks');
        const allTasksSnapshot = await tasksRef.get();

        const batch = db.batch();
        let updatedCount = 0;

        for (const taskDoc of allTasksSnapshot.docs) {
            const taskData = taskDoc.data();
            const blockers = taskData.blockers || [];

            // Check if this task has the completed task as a blocker
            const blockerIndex = blockers.findIndex((b: any) =>
                b.taskId === completedTaskId || b === completedTaskId
            );

            if (blockerIndex === -1) {
                continue; // This task doesn't depend on the completed task
            }

            // Remove the completed task from blockers
            const newBlockers = blockers.filter((_: any, i: number) => i !== blockerIndex);

            const updates: Record<string, any> = {
                blockers: newBlockers,
                lastModified: new Date().toISOString()
            };

            // If no more blockers and task is BLOCKED, change to TODO
            if (newBlockers.length === 0 && taskData.status === TASK_STATUS.BLOCKED) {
                updates.status = TASK_STATUS.TODO;
                console.log(`  Task ${taskDoc.id} is no longer blocked, changing status to TODO.`);
            }

            batch.update(taskDoc.ref, updates);
            updatedCount++;
        }

        if (updatedCount > 0) {
            await batch.commit();
            console.log(`Unblocked ${updatedCount} task(s) that depended on ${completedTaskId}.`);
        } else {
            console.log(`No tasks were blocked by ${completedTaskId}.`);
        }

        return null;
    }
);

/**
 * onTaskDelete
 *
 * When a task is deleted, this function:
 * 1. Finds all tasks in the same project that have this task as a blocker
 * 2. Removes this task from their blockers array
 * 3. If the blockers array becomes empty and status is BLOCKED, changes status to TODO
 */
export const onTaskDelete = onDocumentDeleted(
    {
        document: 'projects/{projectId}/tasks/{taskId}',
        region: 'europe-west1',
        timeoutSeconds: 60,
        memory: '256MiB'
    },
    async (event) => {
        const projectId = event.params.projectId;
        const deletedTaskId = event.params.taskId;

        console.log(`Task ${deletedTaskId} deleted from project ${projectId}. Cleaning up blockers...`);

        // Find all tasks in this project that have this task as a blocker
        const tasksRef = db.collection('projects').doc(projectId).collection('tasks');
        const allTasksSnapshot = await tasksRef.get();

        const batch = db.batch();
        let updatedCount = 0;

        for (const taskDoc of allTasksSnapshot.docs) {
            const taskData = taskDoc.data();
            const blockers = taskData.blockers || [];

            // Check if this task has the deleted task as a blocker
            const blockerIndex = blockers.findIndex((b: any) =>
                b.taskId === deletedTaskId || b === deletedTaskId
            );

            if (blockerIndex === -1) {
                continue;
            }

            // Remove the deleted task from blockers
            const newBlockers = blockers.filter((_: any, i: number) => i !== blockerIndex);

            const updates: Record<string, any> = {
                blockers: newBlockers,
                lastModified: new Date().toISOString()
            };

            // If no more blockers and task is BLOCKED, change to TODO
            if (newBlockers.length === 0 && taskData.status === TASK_STATUS.BLOCKED) {
                updates.status = TASK_STATUS.TODO;
                console.log(`  Task ${taskDoc.id} is no longer blocked, changing status to TODO.`);
            }

            batch.update(taskDoc.ref, updates);
            updatedCount++;
        }

        if (updatedCount > 0) {
            await batch.commit();
            console.log(`Cleaned up ${updatedCount} blocker reference(s) for deleted task ${deletedTaskId}.`);
        } else {
            console.log(`No tasks were blocked by ${deletedTaskId}.`);
        }

        return null;
    }
);

/**
 * onProjectDelete
 *
 * When a project is deleted, this function:
 * 1. Recursively deletes all sub-collections (tasks, shoppingList, serviceLog, etc.)
 * 2. Cleans up any orphaned data
 *
 * Note: Firestore doesn't automatically delete sub-collections when a parent document is deleted.
 */
export const onProjectDelete = onDocumentDeleted(
    {
        document: 'projects/{projectId}',
        region: 'europe-west1',
        timeoutSeconds: 120,
        memory: '512MiB'
    },
    async (event) => {
        const projectId = event.params.projectId;

        console.log(`Project ${projectId} deleted. Cleaning up sub-collections...`);

        // List of all sub-collections to delete
        const subCollections = [
            'tasks',
            'shoppingList',
            'serviceLog',
            'fuelLog',
            'knowledgeBase',
            'inspections',
            'chat'
        ];

        const projectRef = db.collection('projects').doc(projectId);
        let totalDeleted = 0;

        for (const collectionName of subCollections) {
            const collectionRef = projectRef.collection(collectionName);
            const snapshot = await collectionRef.get();

            if (snapshot.empty) {
                continue;
            }

            // Delete in batches (Firestore limit is 500 operations per batch)
            const batchSize = 500;
            const docs = snapshot.docs;

            for (let i = 0; i < docs.length; i += batchSize) {
                const batch = db.batch();
                const chunk = docs.slice(i, i + batchSize);

                for (const doc of chunk) {
                    batch.delete(doc.ref);
                }

                await batch.commit();
                totalDeleted += chunk.length;
            }

            console.log(`  Deleted ${snapshot.size} document(s) from ${collectionName}.`);
        }

        console.log(`Total: Deleted ${totalDeleted} document(s) from sub-collections for project ${projectId}.`);

        return null;
    }
);

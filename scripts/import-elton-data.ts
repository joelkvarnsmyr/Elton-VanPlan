/**
 * Import Elton Project Data to Firestore
 * 
 * Usage: npx ts-node scripts/import-elton-data.ts
 * 
 * This script imports all Elton project data (vehicle, tasks, shopping items, service log)
 * to Firestore. It can be run multiple times (uses set/merge for updates).
 */

import * as admin from 'firebase-admin';
import * as path from 'path';

// Import the data
import {
    ELTON_VEHICLE_DATA,
    ELTON_TASKS,
    ELTON_SHOPPING_ITEMS,
    ELTON_SERVICE_LOG
} from '../src/data/elton-project-data';
import { ELTON_DETAILED_INSPECTION } from '../src/data/elton-inspection-data';
import { ELTON_PROJECT_METADATA } from '../src/data/elton-project-metadata';
import {
    ELTON_MILEAGE_HISTORY,
    ELTON_HISTORY_EVENTS,
    ELTON_PRICE_HISTORY,
    ELTON_STATISTICS,
    ELTON_ESTIMATED_CURRENT_MILEAGE,
    ELTON_ANNUAL_DRIVING,
    ELTON_DATA_LAST_UPDATED,
    ELTON_NEXT_DATA_UPDATE
} from '../src/data/elton-vehicle-history';
import { ELTON_PHASE0_TASKS } from '../src/data/elton-phase0-tasks';
import {
    ELTON_RESOURCE_LINKS,
    ELTON_WORKSHOPS,
    ELTON_KNOWLEDGE_ARTICLES
} from '../src/data/elton-knowledge-base';

// Initialize Firebase Admin
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT ||
    path.join(__dirname, '../firebase-service-account.json');

try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} catch (error) {
    console.error('❌ Could not load service account. Make sure firebase-service-account.json exists.');
    console.log('   Download from Firebase Console > Project Settings > Service Accounts');
    process.exit(1);
}

const db = admin.firestore();

// Configuration
const PROJECT_ID = 'elton-jsn398';
const OWNER_ID = 'hanna-eriksson'; // Replace with actual user ID if known

interface ImportStats {
    tasks: number;
    shoppingItems: number;
    serviceLog: number;
    errors: string[];
}

async function importEltonData(): Promise<ImportStats> {
    const stats: ImportStats = {
        tasks: 0,
        shoppingItems: 0,
        serviceLog: 0,
        errors: []
    };

    console.log('🚐 Starting Elton Project Import...\n');

    try {
        // 1. Create/Update Project Document
        console.log('📋 Creating project document...');
        const projectRef = db.collection('projects').doc(PROJECT_ID);

        await projectRef.set({
            id: PROJECT_ID,
            name: 'Elton (VW LT31 1976)',
            type: 'conversion',
            brand: 'vanplan',
            ownerIds: [OWNER_ID],
            primaryOwnerId: OWNER_ID,
            memberIds: ['joel-kvarnsmyr'],
            invitedEmails: [],
            vehicleData: {
                ...ELTON_VEHICLE_DATA,
                // Add vehicle history inline
                mileageHistory: ELTON_MILEAGE_HISTORY,
                historyEvents: ELTON_HISTORY_EVENTS,
                priceHistory: ELTON_PRICE_HISTORY,
                statistics: ELTON_STATISTICS,
                estimatedCurrentMileage: ELTON_ESTIMATED_CURRENT_MILEAGE,
                annualDriving: ELTON_ANNUAL_DRIVING,
                dataLastUpdated: ELTON_DATA_LAST_UPDATED,
                nextDataUpdate: ELTON_NEXT_DATA_UPDATE
            },
            detailedInspections: [ELTON_DETAILED_INSPECTION], // Structured inspection
            projectMetadata: ELTON_PROJECT_METADATA, // Context, decisions, etc
            contacts: ELTON_WORKSHOPS, // Workshop contacts
            knowledgeArticles: ELTON_KNOWLEDGE_ARTICLES, // Guides
            resourceLinks: ELTON_RESOURCE_LINKS, // External links
            // Don't include tasks/shopping here - they go in subcollections
            tasks: [],
            shoppingItems: [],
            serviceLog: [],
            fuelLog: [],
            created: '2025-12-05',
            lastModified: new Date().toISOString(),
            isDemo: false,
            nickname: 'Elton'
        }, { merge: true });
        console.log('   ✅ Project document created/updated');

        // 2. Import Tasks
        console.log('\n📝 Importing tasks...');
        const tasksRef = projectRef.collection('tasks');

        for (const task of ELTON_TASKS) {
            try {
                await tasksRef.doc(task.id).set(task, { merge: true });
                stats.tasks++;
                console.log(`   ✅ ${task.title}`);
            } catch (err) {
                const errorMsg = `Failed to import task ${task.id}: ${err}`;
                stats.errors.push(errorMsg);
                console.log(`   ❌ ${task.title}`);
            }
        }

        // 3. Import Shopping Items
        console.log('\n🛒 Importing shopping items...');
        const shoppingRef = projectRef.collection('shoppingItems');

        for (const item of ELTON_SHOPPING_ITEMS) {
            try {
                await shoppingRef.doc(item.id).set(item, { merge: true });
                stats.shoppingItems++;
                console.log(`   ✅ ${item.name}`);
            } catch (err) {
                const errorMsg = `Failed to import shopping item ${item.id}: ${err}`;
                stats.errors.push(errorMsg);
                console.log(`   ❌ ${item.name}`);
            }
        }

        // 4. Import Service Log
        console.log('\n🔧 Importing service log...');
        const serviceLogRef = projectRef.collection('serviceLog');

        for (const entry of ELTON_SERVICE_LOG) {
            try {
                await serviceLogRef.doc(entry.id).set(entry, { merge: true });
                stats.serviceLog++;
                console.log(`   ✅ ${entry.date}: ${entry.description.substring(0, 40)}...`);
            } catch (err) {
                const errorMsg = `Failed to import service log ${entry.id}: ${err}`;
                stats.errors.push(errorMsg);
                console.log(`   ❌ ${entry.date}`);
            }
        }

    } catch (error) {
        console.error('❌ Fatal error during import:', error);
        stats.errors.push(`Fatal error: ${error}`);
    }

    return stats;
}

async function main() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('         ELTON PROJECT DATA IMPORT                              ');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const stats = await importEltonData();

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('                      IMPORT SUMMARY                            ');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`  Tasks imported:          ${stats.tasks}/${ELTON_TASKS.length}`);
    console.log(`  Shopping items imported: ${stats.shoppingItems}/${ELTON_SHOPPING_ITEMS.length}`);
    console.log(`  Service log imported:    ${stats.serviceLog}/${ELTON_SERVICE_LOG.length}`);

    if (stats.errors.length > 0) {
        console.log(`\n  ⚠️  Errors: ${stats.errors.length}`);
        stats.errors.forEach(e => console.log(`      - ${e}`));
    } else {
        console.log('\n  ✅ All data imported successfully!');
    }

    console.log('═══════════════════════════════════════════════════════════════\n');

    // Cleanup
    await admin.app().delete();
    process.exit(stats.errors.length > 0 ? 1 : 0);
}

main().catch(console.error);

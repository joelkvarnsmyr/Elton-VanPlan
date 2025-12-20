/**
 * Import Elton Project Data to Firestore
 * Pure JavaScript version (no TypeScript complications)
 * 
 * Usage: node scripts/import-elton-data.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT ||
    path.join(__dirname, '../firebase-service-account.json');

try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized');
} catch (error) {
    console.error('❌ Could not load service account. Make sure firebase-service-account.json exists.');
    console.log('   Download from Firebase Console > Project Settings > Service Accounts');
    process.exit(1);
}

const db = admin.firestore();

// Configuration
const PROJECT_ID = 'elton-jsn398';
const OWNER_ID = 'Js9QpLbTLpUHbFsWRxeH5UvlWBp1'; // Hanna's UID
const OWNER_EMAIL = 'hanna.erixon@hotmail.com';

console.log(`\n📦 Importing Elton project for: ${OWNER_EMAIL}`);
console.log(`   User ID: ${OWNER_ID}`);
console.log(`   Project ID: ${PROJECT_ID}\n`);

// Import data (we'll manually define minimal data here to avoid TypeScript issues)
const ELTON_VEHICLE_DATA = require('../src/data/elton-project-data').ELTON_VEHICLE_DATA;
const ELTON_TASKS = require('../src/data/elton-project-data').ELTON_TASKS;
const ELTON_SHOPPING_ITEMS = require('../src/data/elton-project-data').ELTON_SHOPPING_ITEMS;
const ELTON_SERVICE_LOG = require('../src/data/elton-project-data').ELTON_SERVICE_LOG;
const ELTON_DETAILED_INSPECTION = require('../src/data/elton-inspection-data').ELTON_DETAILED_INSPECTION;
const ELTON_PROJECT_METADATA = require('../src/data/elton-project-metadata').ELTON_PROJECT_METADATA;

// Vehicle history data
const {
    ELTON_MILEAGE_HISTORY,
    ELTON_HISTORY_EVENTS,
    ELTON_PRICE_HISTORY,
    ELTON_STATISTICS,
    ELTON_ESTIMATED_CURRENT_MILEAGE,
    ELTON_ANNUAL_DRIVING,
    ELTON_DATA_LAST_UPDATED,
    ELTON_NEXT_DATA_UPDATE
} = require('../src/data/elton-vehicle-history');

// Phase 0 tasks
const { ELTON_PHASE0_TASKS } = require('../src/data/elton-phase0-tasks');

// Knowledge base
const {
    ELTON_RESOURCE_LINKS,
    ELTON_WORKSHOPS,
    ELTON_KNOWLEDGE_ARTICLES
} = require('../src/data/elton-knowledge-base');

async function importEltonData() {
    const stats = {
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
            memberIds: [],
            invitedEmails: [],
            ownerId: OWNER_ID,
            ownerEmail: OWNER_EMAIL,
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
            detailedInspections: [ELTON_DETAILED_INSPECTION],
            projectMetadata: ELTON_PROJECT_METADATA,
            contacts: ELTON_WORKSHOPS,
            knowledgeArticles: ELTON_KNOWLEDGE_ARTICLES,
            resourceLinks: ELTON_RESOURCE_LINKS,
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

        // 2. Import Tasks (Phase 0 + regular tasks)
        console.log('\n📝 Importing tasks...');
        const tasksRef = projectRef.collection('tasks');

        const allTasks = [...ELTON_PHASE0_TASKS, ...ELTON_TASKS];

        for (const task of allTasks) {
            try {
                await tasksRef.doc(task.id).set(task, { merge: true });
                stats.tasks++;
                process.stdout.write(`\r   Progress: ${stats.tasks}/${allTasks.length} tasks`);
            } catch (err) {
                stats.errors.push(`Task ${task.id}: ${err.message}`);
            }
        }
        console.log(`\n   ✅ Imported ${stats.tasks} tasks`);

        // 3. Import Shopping Items
        console.log('\n🛒 Importing shopping items...');
        const shoppingRef = projectRef.collection('shoppingItems');

        for (const item of ELTON_SHOPPING_ITEMS) {
            try {
                await shoppingRef.doc(item.id).set(item, { merge: true });
                stats.shoppingItems++;
                process.stdout.write(`\r   Progress: ${stats.shoppingItems}/${ELTON_SHOPPING_ITEMS.length} items`);
            } catch (err) {
                stats.errors.push(`Shopping item ${item.id}: ${err.message}`);
            }
        }
        console.log(`\n   ✅ Imported ${stats.shoppingItems} shopping items`);

        // 4. Import Service Log
        console.log('\n🔧 Importing service log...');
        const serviceRef = projectRef.collection('serviceLog');

        for (const entry of ELTON_SERVICE_LOG) {
            try {
                await serviceRef.doc(entry.id).set(entry, { merge: true });
                stats.serviceLog++;
                process.stdout.write(`\r   Progress: ${stats.serviceLog}/${ELTON_SERVICE_LOG.length} entries`);
            } catch (err) {
                stats.errors.push(`Service log ${entry.id}: ${err.message}`);
            }
        }
        console.log(`\n   ✅ Imported ${stats.serviceLog} service log entries`);

    } catch (error) {
        console.error('\n❌ Critical error during import:', error);
        stats.errors.push(`Critical: ${error.message}`);
    }

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Tasks imported: ${stats.tasks}`);
    console.log(`✅ Shopping items imported: ${stats.shoppingItems}`);
    console.log(`✅ Service log entries: ${stats.serviceLog}`);
    console.log(`✅ Vehicle history: ${ELTON_MILEAGE_HISTORY.length} mileage readings, ${ELTON_HISTORY_EVENTS.length} events`);
    console.log(`✅ Knowledge base: ${ELTON_KNOWLEDGE_ARTICLES.length} articles, ${ELTON_WORKSHOPS.length} workshops`);

    if (stats.errors.length > 0) {
        console.log(`\n⚠️  Errors: ${stats.errors.length}`);
        stats.errors.forEach(err => console.log(`   - ${err}`));
    } else {
        console.log('\n🎉 All data imported successfully!');
    }
    console.log('='.repeat(50) + '\n');

    return stats;
}

// Run the import
importEltonData()
    .then(() => {
        console.log('✅ Import complete');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Import failed:', error);
        process.exit(1);
    });

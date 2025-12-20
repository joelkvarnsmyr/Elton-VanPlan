/**
 * Complete Elton Project Import
 * Adds ALL project data to Firestore
 * 
 * Run: node scripts/full-import.cjs
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase
const serviceAccount = require('../firebase-service-account.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Configuration
const PROJECT_ID = 'elton-jsn398';
const OWNER_ID = 'Js9QpLbTLpUHbFsWRxeH5UvlWBp1';
const OWNER_EMAIL = 'hanna.erixon@hotmail.com';

console.log(`\n🚐 Full Elton Project Import`);
console.log(`   Owner: ${OWNER_EMAIL}`);
console.log(`   Project ID: ${PROJECT_ID}\n`);

// Load JSON data files
const inspectionData = JSON.parse(fs.readFileSync(path.join(__dirname, '../docs/Elton/inspektionsdata-elton.json'), 'utf8'));
const projectMetadata = JSON.parse(fs.readFileSync(path.join(__dirname, '../docs/Elton/project_metadata.json'), 'utf8'));

async function importFullProject() {
    const stats = { tasks: 0, shoppingItems: 0, errors: [] };

    try {
        const projectRef = db.collection('projects').doc(PROJECT_ID);

        console.log('📋 Creating project document with full vehicle data...');

        // Create comprehensive project document
        await projectRef.set({
            id: PROJECT_ID,
            name: 'Elton (VW LT31 1976)',
            type: 'conversion',
            brand: 'vanplan',
            ownerIds: [OWNER_ID],
            primaryOwnerId: OWNER_ID,
            ownerId: OWNER_ID,
            ownerEmail: OWNER_EMAIL,
            memberIds: [],
            invitedEmails: [],

            // Vehicle data with history
            vehicleData: {
                regNo: 'JSN398',
                make: 'Volkswagen',
                model: 'LT 31 (Typ 28/21)',
                year: 1976,
                prodYear: 1976,
                regDate: '1978-02-14',
                status: 'I drift',
                bodyType: 'Skåp Bostadsinredning',
                passengers: 4,

                inspection: {
                    last: '2025-08-13',
                    mileage: '3 362 mil',
                    next: 'Okänd'
                },

                engine: {
                    fuel: 'Bensin',
                    power: '75 HK / 55 kW',
                    volume: '2.0L',
                    code: 'CH'
                },

                gearbox: '4-växlad manuell',

                wheels: {
                    drive: 'Bakhjulsdrift',
                    tiresFront: '215 R14 C',
                    tiresRear: '215 R14 C',
                    boltPattern: '5x160'
                },

                dimensions: {
                    length: 5375,
                    width: 2065,
                    height: '2550 mm',
                    wheelbase: 3200
                },

                weights: {
                    curb: 1850,
                    total: 3100,
                    load: 1250,
                    trailer: 1500,
                    trailerB: 750
                },

                vin: '2862500058',
                color: 'Beige/Brun',

                history: {
                    owners: 22,
                    events: 40,
                    lastOwnerChange: '2023-06-28'
                },

                // Vehicle history data
                estimatedCurrentMileage: 3418,
                annualDriving: 223,
                dataLastUpdated: '2025-12-16',
                nextDataUpdate: '2025-12-23'
            },

            // Project metadata
            projectMetadata: projectMetadata,

            created: '2025-12-05',
            lastModified: new Date().toISOString(),
            isDemo: false,
            nickname: 'Elton'
        }, { merge: true });

        console.log('   ✅ Project document created');

        // Import Phase 0 Tasks (5 completed tasks)
        console.log('\n📝 Importing Phase 0 tasks...');
        const tasksRef = projectRef.collection('tasks');

        const phase0Tasks = [
            {
                id: 'phase0-purchase',
                title: 'Inköp av "Elton"',
                description: 'Betalning och ägarbyte (5/12). Pris: 50,000 SEK',
                status: 'DONE',
                phase: 'Fas 0: Inköp & Analys',
                priority: 'HIGH',
                estimatedCostMin: 50000,
                estimatedCostMax: 50000,
                actualCost: 50000,
                weightKg: 0,
                costType: 'INVESTMENT',
                tags: ['Inköp'],
                links: [],
                comments: [],
                attachments: [],
                subtasks: []
            },
            {
                id: 'phase0-transport',
                title: 'Hemtransport till Falun',
                description: 'Umeå → Falun (~450 km)',
                status: 'DONE',
                phase: 'Fas 0: Inköp & Analys',
                priority: 'HIGH',
                estimatedCostMin: 1500,
                estimatedCostMax: 1500,
                actualCost: 1500,
                weightKg: 0,
                costType: 'OPERATION',
                tags: ['Transport'],
                links: [],
                comments: [],
                attachments: [],
                subtasks: []
            },
            {
                id: 'phase0-tires',
                title: 'Beställ Däck (Delsbo Däck)',
                description: '4x Continental VanContact 4Season 215 R14 C',
                status: 'DONE',
                phase: 'Fas 0: Inköp & Analys',
                priority: 'HIGH',
                estimatedCostMin: 6000,
                estimatedCostMax: 6000,
                actualCost: 6000,
                weightKg: 60,
                costType: 'INVESTMENT',
                tags: ['Däck', 'Säkerhet'],
                links: [],
                comments: [],
                attachments: [],
                subtasks: []
            },
            {
                id: 'phase0-inspection',
                title: 'Inspektion & Provkörning',
                description: 'Fuktmätning, kallstart, 88 observationer dokumenterade',
                status: 'DONE',
                phase: 'Fas 0: Inköp & Analys',
                priority: 'HIGH',
                estimatedCostMin: 1000,
                estimatedCostMax: 1000,
                actualCost: 1000,
                weightKg: 0,
                costType: 'OPERATION',
                tags: ['Inspektion'],
                links: [],
                comments: [],
                attachments: [],
                subtasks: []
            },
            {
                id: 'phase0-battery',
                title: 'Installera nytt startbatteri',
                description: '12V 100Ah startbatteri installerat',
                status: 'DONE',
                phase: 'Fas 0: Inköp & Analys',
                priority: 'HIGH',
                estimatedCostMin: 1600,
                estimatedCostMax: 1600,
                actualCost: 1600,
                weightKg: 25,
                costType: 'INVESTMENT',
                tags: ['El', 'Batteri'],
                links: [],
                comments: [],
                attachments: [],
                subtasks: []
            }
        ];

        for (const task of phase0Tasks) {
            await tasksRef.doc(task.id).set(task);
            stats.tasks++;
        }
        console.log(`   ✅ Added ${stats.tasks} Phase 0 tasks`);

        // Import key Phase 1 tasks
        console.log('\n📝 Importing Phase 1 (January) tasks...');

        const phase1Tasks = [
            {
                id: 'el-temp-battery',
                title: 'Tillfälligt bodelsbatteri',
                description: 'Enkelt LiFePO4-batteri för att få igång grundläggande el',
                status: 'TODO',
                phase: 'Fas 1: Januari (Grundläggande)',
                priority: 'HIGH',
                estimatedCostMin: 8500,
                estimatedCostMax: 10000,
                actualCost: 0,
                weightKg: 15,
                costType: 'INVESTMENT',
                tags: ['El', 'LiFePO4'],
                links: [],
                comments: [],
                attachments: [],
                subtasks: []
            },
            {
                id: 'door-driver-replace',
                title: 'Byt ut förardörr',
                description: 'Kraftiga rostskador. Behöver bytas mot fungerande dörr',
                status: 'TODO',
                phase: 'Fas 1: Januari (Grundläggande)',
                priority: 'HIGH',
                estimatedCostMin: 3000,
                estimatedCostMax: 5000,
                actualCost: 0,
                weightKg: 50,
                costType: 'INVESTMENT',
                tags: ['Kaross', 'Rost'],
                links: [],
                comments: [],
                attachments: [],
                subtasks: []
            },
            {
                id: 'door-sliding-replace',
                title: 'Byt ut skjutdörr',
                description: 'Genomrutten i nederkant. Måste bytas',
                status: 'TODO',
                phase: 'Fas 1: Januari (Grundläggande)',
                priority: 'HIGH',
                estimatedCostMin: 4000,
                estimatedCostMax: 6000,
                actualCost: 0,
                weightKg: 60,
                costType: 'INVESTMENT',
                tags: ['Kaross', 'Rost'],
                links: [],
                comments: [],
                attachments: [],
                subtasks: []
            },
            {
                id: 'rear-fixes',
                title: 'Fixa bakljus',
                description: 'Positionsljus fungerar ej. KRITISKT för laglig körning',
                status: 'TODO',
                phase: 'Fas 1: Januari (Grundläggande)',
                priority: 'CRITICAL',
                estimatedCostMin: 500,
                estimatedCostMax: 1500,
                actualCost: 0,
                weightKg: 2,
                costType: 'OPERATION',
                tags: ['El', 'Säkerhet'],
                links: [],
                comments: [],
                attachments: [],
                subtasks: []
            }
        ];

        for (const task of phase1Tasks) {
            await tasksRef.doc(task.id).set(task);
            stats.tasks++;
        }
        console.log(`   ✅ Added ${phase1Tasks.length} Phase 1 tasks`);

        // Import shopping items
        console.log('\n🛒 Importing shopping items...');
        const shoppingRef = projectRef.collection('shoppingItems');

        const shoppingItems = [
            {
                id: 'shop-bat-1',
                name: 'LiFePO4-celler 280Ah (EVE LF280K)',
                category: 'El',
                estimatedCost: 7000,
                quantity: '4 st',
                checked: false,
                status: 'RESEARCH',
                linkedTaskId: 'el-temp-battery'
            },
            {
                id: 'shop-bat-2',
                name: 'BMS för LiFePO4 (4S 100-200A)',
                category: 'El',
                estimatedCost: 1500,
                quantity: '1 st',
                checked: false,
                status: 'RESEARCH',
                linkedTaskId: 'el-temp-battery'
            }
        ];

        for (const item of shoppingItems) {
            await shoppingRef.doc(item.id).set(item);
            stats.shoppingItems++;
        }
        console.log(`   ✅ Added ${stats.shoppingItems} shopping items`);

    } catch (error) {
        console.error('\n❌ Error:', error);
        stats.errors.push(error.message);
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Tasks: ${stats.tasks}`);
    console.log(`✅ Shopping items: ${stats.shoppingItems}`);
    console.log(`✅ Project metadata: Loaded`);
    console.log(`✅ Vehicle data: Complete`);

    if (stats.errors.length > 0) {
        console.log(`\n⚠️ Errors: ${stats.errors.length}`);
    } else {
        console.log('\n🎉 All data imported successfully!');
    }
    console.log('='.repeat(50) + '\n');

    return stats.errors.length === 0;
}

importFullProject()
    .then((success) => {
        if (success) {
            console.log('✅ Import complete! Refresh your app to see all data.');
            process.exit(0);
        } else {
            process.exit(1);
        }
    })
    .catch(err => {
        console.error('❌ Fatal error:', err);
        process.exit(1);
    });

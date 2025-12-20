/**
 * FINAL COMPLETE ELTON IMPORT - ALL 23 TASKS
 * With full data fields, subtasks, linked items
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase
const serviceAccount = require('../firebase-service-account.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const PROJECT_ID = 'elton-jsn398';
const OWNER_ID = 'Js9QpLbTLpUHbFsWRxeH5UvlWBp1';
const OWNER_EMAIL = 'hanna.erixon@hotmail.com';

console.log(`\n🚐 FINAL COMPLETE IMPORT - ALL 23 TASKS\n`);

async function importAll() {
    const projectRef = db.collection('projects').doc(PROJECT_ID);
    const tasksRef = projectRef.collection('tasks');
    const shoppingRef = projectRef.collection('shoppingList');  // FIXED: was 'shoppingItems'
    const serviceRef = projectRef.collection('serviceLog');

    // ===== ALL 23 TASKS =====
    const allTasks = [
        // ========== FAS 0: INKÖP & ANALYS (5 KLARA) ==========
        {
            id: 'phase0-purchase',
            type: 'PURCHASE',
            title: 'Inköp av "Elton"',
            description: 'Betalning och ägarbyte via Transportstyrelsen-appen (5/12). Pris: 50,000 SEK. Registreringsbevis mottaget, försäkring aktiverad.',
            status: 'DONE',
            priority: 'HIGH',
            phase: 'Fas 0: Inköp & Analys',
            estimatedCostMin: 50000,
            estimatedCostMax: 50000,
            actualCost: 50000,
            weightKg: 0,
            costType: 'INVESTMENT',
            difficultyLevel: 'Easy',
            tags: ['Inköp', 'Ägarbyte'],
            subtasks: [
                { id: 'st-p1', title: 'Besiktningsprotokoll granskat', completed: true },
                { id: 'st-p2', title: 'Provkörning genomförd', completed: true },
                { id: 'st-p3', title: 'Ägarbyte via app', completed: true },
                { id: 'st-p4', title: 'Betalning klar', completed: true }
            ],
            links: [], comments: [], attachments: [],
            created: '2025-11-01T10:00:00Z',
            lastModified: '2025-12-05T14:30:00Z'
        },
        {
            id: 'phase0-transport',
            type: 'ADMIN',
            title: 'Hemtransport till Falun',
            description: 'Umeå → Falun (~450 km). Maxhastighet ~80 km/h. Bilen kom fram utan problem!',
            status: 'DONE',
            priority: 'HIGH',
            phase: 'Fas 0: Inköp & Analys',
            estimatedCostMin: 1500,
            estimatedCostMax: 1500,
            actualCost: 1500,
            weightKg: 0,
            costType: 'OPERATION',
            difficultyLevel: 'Medium',
            tags: ['Transport', 'Körning'],
            subtasks: [
                { id: 'st-t1', title: 'Rutt planerad', completed: true },
                { id: 'st-t2', title: 'Bilen förberedd', completed: true },
                { id: 'st-t3', title: 'Hemkörning genomförd', completed: true }
            ],
            links: [], comments: [], attachments: [],
            created: '2025-11-20T08:00:00Z',
            lastModified: '2025-12-06T18:00:00Z'
        },
        {
            id: 'phase0-tires',
            type: 'PURCHASE',
            title: 'Beställ Däck (Delsbo Däck)',
            description: '4x Continental VanContact 4Season 215 R14 C. 3PMSF-godkända för vinterkörning.',
            status: 'DONE',
            priority: 'HIGH',
            phase: 'Fas 0: Inköp & Analys',
            estimatedCostMin: 6000,
            estimatedCostMax: 6000,
            actualCost: 6000,
            weightKg: 60,
            costType: 'INVESTMENT',
            difficultyLevel: 'Easy',
            tags: ['Däck', 'Säkerhet', 'Vinter'],
            subtasks: [
                { id: 'st-d1', title: 'Ring verkstad', completed: true },
                { id: 'st-d2', title: 'Boka tid', completed: true },
                { id: 'st-d3', title: 'Montering klar', completed: true }
            ],
            links: [{ id: 'l-tire', title: 'Däckab Delsbo', url: 'https://www.dackab.se' }],
            comments: [], attachments: [],
            created: '2025-11-25T10:00:00Z',
            lastModified: '2025-12-08T15:00:00Z'
        },
        {
            id: 'phase0-inspection',
            type: 'MAINTENANCE',
            title: 'Inspektion & Provkörning',
            description: '88 observationer dokumenterade. Fuktmätning, kallstart, fotodokumentation, ljudinspelning motor.',
            status: 'DONE',
            priority: 'HIGH',
            phase: 'Fas 0: Inköp & Analys',
            estimatedCostMin: 1000,
            estimatedCostMax: 1000,
            actualCost: 1000,
            weightKg: 0,
            costType: 'OPERATION',
            difficultyLevel: 'Medium',
            tags: ['Inspektion', 'Dokumentation'],
            subtasks: [
                { id: 'st-i1', title: 'Fuktmätning', completed: true },
                { id: 'st-i2', title: 'Provkörning', completed: true },
                { id: 'st-i3', title: 'Fotodokumentation', completed: true },
                { id: 'st-i4', title: 'Rapport skriven', completed: true }
            ],
            links: [], comments: [], attachments: [],
            created: '2025-12-01T08:00:00Z',
            lastModified: '2025-12-01T17:00:00Z'
        },
        {
            id: 'phase0-battery',
            type: 'MAINTENANCE',
            title: 'Installera nytt startbatteri',
            description: '12V 100Ah startbatteri. CCA: 800A. Bilen startar perfekt!',
            status: 'DONE',
            priority: 'HIGH',
            phase: 'Fas 0: Inköp & Analys',
            estimatedCostMin: 1600,
            estimatedCostMax: 1600,
            actualCost: 1600,
            weightKg: 25,
            costType: 'INVESTMENT',
            difficultyLevel: 'Easy',
            requiredTools: ['Skiftnyckel 10mm', 'Handskar'],
            tags: ['El', 'Batteri', 'Start'],
            subtasks: [
                { id: 'st-b1', title: 'Köp batteri', completed: true },
                { id: 'st-b2', title: 'Byt batteri', completed: true },
                { id: 'st-b3', title: 'Testa start', completed: true }
            ],
            links: [], comments: [], attachments: [],
            created: '2025-12-03T10:00:00Z',
            lastModified: '2025-12-03T12:00:00Z'
        },

        // ========== FAS 1: JANUARI - GRUNDLÄGGANDE ==========
        {
            id: 'el-temp-battery',
            type: 'BUILD',
            title: 'Bygg tillfälligt LiFePO4-bodelsbatteri',
            description: 'Fristående 12V-system för bodelen. 4x LiFePO4 280Ah celler, JK BMS, huvudsäkring 150-200A.',
            status: 'TODO',
            priority: 'HIGH',
            phase: 'Fas 1: Januari',
            buildPhase: 'B2_SYSTEMS',
            estimatedCostMin: 8000,
            estimatedCostMax: 14000,
            actualCost: 0,
            weightKg: 35,
            costType: 'INVESTMENT',
            difficultyLevel: 'Expert',
            requiredTools: ['Momentnyckel', 'Krympslang', 'Kabelsax', 'Multimeter'],
            tags: ['El', 'LiFePO4', 'Prioritet'],
            subtasks: [
                { id: 'st-bat-1', title: 'Beställ LiFePO4-celler', completed: false },
                { id: 'st-bat-2', title: 'Beställ BMS', completed: false },
                { id: 'st-bat-3', title: 'Bygg batterilåda', completed: false },
                { id: 'st-bat-4', title: 'Koppla celler + BMS', completed: false },
                { id: 'st-bat-5', title: 'Installera huvudsäkring', completed: false },
                { id: 'st-bat-6', title: 'Testa system', completed: false }
            ],
            links: [{ id: 'l-bat', title: 'Will Prowse LiFePO4 guide', url: 'https://www.youtube.com/willprowse' }],
            comments: [], attachments: [],
            created: '2025-12-20T10:00:00Z',
            lastModified: '2025-12-20T10:00:00Z'
        },
        {
            id: 'heating-diesel-heater',
            type: 'BUILD',
            title: 'Installera dieselvärmare 5kW',
            description: 'Vevor 5kW dieselvärmare med SEPARAT dieseltank (bilen är bensin!). Avgaser ledas ut säkert.',
            status: 'TODO',
            priority: 'HIGH',
            phase: 'Fas 1: Januari',
            buildPhase: 'B2_SYSTEMS',
            estimatedCostMin: 1500,
            estimatedCostMax: 3000,
            actualCost: 0,
            weightKg: 10,
            costType: 'INVESTMENT',
            difficultyLevel: 'Expert',
            requiredTools: ['Borrmaskin', 'Skruvdragare', 'Såg för avgasrör', 'Tätningsmedel'],
            tags: ['Värme', 'Diesel', 'Komfort', 'Prioritet'],
            subtasks: [
                { id: 'st-heat-1', title: 'Beställ Vevor 5kW värmare', completed: false },
                { id: 'st-heat-2', title: 'Köp separat dieseltank (10-20L)', completed: false },
                { id: 'st-heat-3', title: 'Planera montering', completed: false },
                { id: 'st-heat-4', title: 'Montera dieseltank', completed: false },
                { id: 'st-heat-5', title: 'Montera värmare', completed: false },
                { id: 'st-heat-6', title: 'Dra bränsleledningar', completed: false },
                { id: 'st-heat-7', title: 'Installera avgasrör', completed: false },
                { id: 'st-heat-8', title: 'Testa system', completed: false }
            ],
            links: [], comments: [], attachments: [],
            created: '2025-12-20T19:00:00Z',
            lastModified: '2025-12-20T19:00:00Z'
        },

        // ========== FAS 1: VÅR - QUICK FIXES ==========
        {
            id: 'rust-roof-seal',
            type: 'MAINTENANCE',
            title: 'Täta takskarv och läckagepunkter (QUICK FIX)',
            description: 'TEMPORÄR FIX! Stoppa aktivt vattenläckage vid förardörren. Sikaflex + rostomvandlare.',
            status: 'TODO',
            priority: 'HIGH',
            phase: 'Fas 1: Vår',
            mechanicalPhase: 'P2_RUST',
            estimatedCostMin: 400,
            estimatedCostMax: 800,
            actualCost: 0,
            weightKg: 0,
            costType: 'OPERATION',
            difficultyLevel: 'Easy',
            requiredTools: ['Stålborste', 'Fogpistol', 'Skrapa', 'Trasor'],
            tags: ['Rost', 'Tak', 'Läckage', 'Akut', 'Quick Fix'],
            subtasks: [
                { id: 'st-seal-1', title: 'Köp material (Sikaflex, rostomvandlare)', completed: false },
                { id: 'st-seal-2', title: 'Rengör takskarv vid förardörren', completed: false },
                { id: 'st-seal-3', title: 'Applicera rostomvandlare', completed: false },
                { id: 'st-seal-4', title: 'Sikaflex i skarven', completed: false }
            ],
            links: [], comments: [], attachments: [],
            created: '2025-12-20T10:00:00Z',
            lastModified: '2025-12-20T21:00:00Z'
        },
        {
            id: 'rust-spot-treatment',
            type: 'MAINTENANCE',
            title: 'Punktbehandla synliga rostgenomslag',
            description: 'Bromsa rostspridning. Vattenränna, vid solpanelfäste, framkant glasfibertak.',
            status: 'TODO',
            priority: 'MEDIUM',
            phase: 'Fas 1: Vår',
            mechanicalPhase: 'P2_RUST',
            estimatedCostMin: 300,
            estimatedCostMax: 600,
            actualCost: 0,
            weightKg: 0,
            costType: 'OPERATION',
            difficultyLevel: 'Easy',
            requiredTools: ['Stålborste', 'Vinkelslip med stålborste', 'Pensel'],
            tags: ['Rost', 'Kaross'],
            subtasks: [
                { id: 'st-spot-1', title: 'Kartlägg alla rostpunkter', completed: false },
                { id: 'st-spot-2', title: 'Borsta rent', completed: false },
                { id: 'st-spot-3', title: 'Rostomvandlare på alla punkter', completed: false },
                { id: 'st-spot-4', title: 'Primer/bättringsfärg', completed: false }
            ],
            links: [], comments: [], attachments: [],
            created: '2025-12-20T10:00:00Z',
            lastModified: '2025-12-20T10:00:00Z'
        },
        {
            id: 'motor-oil-change',
            type: 'MAINTENANCE',
            title: 'Motor minimal service (QUICK FIX)',
            description: 'Hålla motorn vid liv! Oljebyte 10W-40 Mineral (6L), oljefilter, kontrollera luftfilter. VI investerar INTE i kamrem nu.',
            status: 'TODO',
            priority: 'MEDIUM',
            phase: 'Fas 1: Vår',
            mechanicalPhase: 'P1_ENGINE',
            estimatedCostMin: 500,
            estimatedCostMax: 800,
            actualCost: 0,
            weightKg: 0,
            costType: 'OPERATION',
            difficultyLevel: 'Easy',
            requiredTools: ['Oljefilteravdragare', 'Uppsamlingskärl', '17mm nyckel'],
            tags: ['Motor', 'Service', 'DIY', 'Quick Fix'],
            subtasks: [
                { id: 'st-oil-1', title: 'Köp olja och filter', completed: false },
                { id: 'st-oil-2', title: 'Byt motorolja', completed: false },
                { id: 'st-oil-3', title: 'Byt oljefilter', completed: false }
            ],
            links: [], comments: [], attachments: [],
            created: '2025-12-20T10:00:00Z',
            lastModified: '2025-12-20T21:00:00Z'
        },
        {
            id: 'awning-remove',
            type: 'MAINTENANCE',
            title: 'Demontera markis för inspektion',
            description: 'Ta bort markisen för att inspektera glasfibertaket under fästena.',
            status: 'TODO',
            priority: 'MEDIUM',
            phase: 'Fas 1: Vår',
            mechanicalPhase: 'P2_RUST',
            estimatedCostMin: 0,
            estimatedCostMax: 200,
            actualCost: 0,
            weightKg: -15,
            costType: 'OPERATION',
            difficultyLevel: 'Easy',
            requiredTools: ['Skruvdragare', 'Insexnycklar', 'Stege'],
            tags: ['Tak', 'Markis', 'Inspektion'],
            subtasks: [
                { id: 'st-awn-1', title: 'Fotografera montering', completed: false },
                { id: 'st-awn-2', title: 'Demontera markis', completed: false },
                { id: 'st-awn-3', title: 'Inspektera glasfiber under fästen', completed: false }
            ],
            links: [], comments: [], attachments: [],
            created: '2025-12-20T10:00:00Z',
            lastModified: '2025-12-20T10:00:00Z'
        },

        // ========== FAS 2: SOMMAR ==========
        {
            id: 'rear-fixes',
            type: 'MAINTENANCE',
            title: 'Fixa baksida (baklyktor KRITISKT)',
            description: 'BESIKTNINGSKRAV! Positionsljus bak fungerar EJ. Plus rost vid bakfönster, profilstål, lacksläpp.',
            status: 'TODO',
            priority: 'CRITICAL',
            phase: 'Fas 2: Sommar',
            mechanicalPhase: 'P2_RUST',
            estimatedCostMin: 500,
            estimatedCostMax: 1500,
            actualCost: 0,
            weightKg: 0,
            costType: 'OPERATION',
            difficultyLevel: 'Medium',
            requiredTools: ['Multimeter', 'Lödkolv', 'Stålborste', 'Rostomvandlare'],
            tags: ['Rost', 'El', 'Baksida', 'Besiktning'],
            subtasks: [
                { id: 'st-rear-1', title: '⚡ Fixa positionsljus bak', completed: false },
                { id: 'st-rear-2', title: 'Montera saknade skruvar baklykta', completed: false },
                { id: 'st-rear-3', title: 'Behandla rost vid bakfönster', completed: false },
                { id: 'st-rear-4', title: 'Behandla profilstål boxfäste', completed: false },
                { id: 'st-rear-5', title: 'Inspektera under gummitejp', completed: false }
            ],
            links: [], comments: [], attachments: [],
            created: '2025-12-20T19:00:00Z',
            lastModified: '2025-12-20T19:00:00Z'
        },
        {
            id: 'roof-hatch-replace',
            type: 'BUILD',
            title: 'Byt taklucka till modern',
            description: 'Ersätt gammal läckande taklucka. Rekommenderat: Fiamma Vent 40 (~1200 kr).',
            status: 'TODO',
            priority: 'MEDIUM',
            phase: 'Fas 2: Sommar',
            buildPhase: 'B1_SHELL',
            estimatedCostMin: 900,
            estimatedCostMax: 2500,
            actualCost: 0,
            weightKg: 3,
            costType: 'INVESTMENT',
            difficultyLevel: 'Medium',
            requiredTools: ['Sticksåg', 'Skruvdragare', 'Fogpistol', 'Måttband'],
            tags: ['Tak', 'Uppgradering', 'Tätning'],
            subtasks: [
                { id: 'st-hatch-1', title: 'Mät befintligt hål', completed: false },
                { id: 'st-hatch-2', title: 'Välj och beställ lucka', completed: false },
                { id: 'st-hatch-3', title: 'Demontera gammal lucka', completed: false },
                { id: 'st-hatch-4', title: 'Montera ny lucka med Sikaflex', completed: false }
            ],
            decisionOptions: [
                { id: 'hatch-1', title: 'Budget: MPK VisionVent', costRange: '900 kr', pros: ['Billigast'], cons: ['Ingen fläkt'] },
                { id: 'hatch-2', title: 'Standard: Fiamma Vent 40', costRange: '1200 kr', pros: ['Pålitlig'], cons: ['Ingen fläkt'], recommended: true }
            ],
            links: [], comments: [], attachments: [],
            created: '2025-12-20T10:00:00Z',
            lastModified: '2025-12-20T10:00:00Z'
        },
        {
            id: 'door-search',
            type: 'PURCHASE',
            title: 'Leta begagnade dörrar (skjut + förare)',
            description: 'Hitta begagnade dörrar. Blocket, eBay Kleinanzeigen, LT-forum. Budget: 2000-3000 kr/dörr.',
            status: 'TODO',
            priority: 'HIGH',
            phase: 'Fas 2: Sommar',
            estimatedCostMin: 4000,
            estimatedCostMax: 8000,
            actualCost: 0,
            weightKg: 0,
            costType: 'INVESTMENT',
            difficultyLevel: 'Easy',
            tags: ['Dörrar', 'Begagnat', 'Inköp'],
            subtasks: [
                { id: 'st-door-1', title: 'Sätt upp Blocket-bevakning', completed: false },
                { id: 'st-door-2', title: 'Kolla tyska annonser', completed: false },
                { id: 'st-door-3', title: 'Hitta skjutdörr', completed: false },
                { id: 'st-door-4', title: 'Hitta förardörr', completed: false }
            ],
            links: [
                { id: 'l-door-1', title: 'Blocket VW LT', url: 'https://www.blocket.se' },
                { id: 'l-door-2', title: 'eBay Kleinanzeigen', url: 'https://www.kleinanzeigen.de' }
            ],
            comments: [], attachments: [],
            created: '2025-12-20T10:00:00Z',
            lastModified: '2025-12-20T10:00:00Z'
        },
        {
            id: 'passenger-door-fixes',
            type: 'MAINTENANCE',
            title: 'Fixa passagerardörr (hål + justering)',
            description: 'Passagerardörren är BÄST skick. Svetsa hål i insteg, justera gångjärn.',
            status: 'TODO',
            priority: 'MEDIUM',
            phase: 'Fas 2: Sommar',
            mechanicalPhase: 'P2_RUST',
            estimatedCostMin: 300,
            estimatedCostMax: 1000,
            actualCost: 0,
            weightKg: 0,
            costType: 'OPERATION',
            difficultyLevel: 'Medium',
            requiredTools: ['MIG-svets', 'Skiftnyckel', 'Gummitätning'],
            tags: ['Dörrar', 'Svets', 'Läckage'],
            subtasks: [
                { id: 'st-pass-1', title: 'Svetsa/lappa hål i insteg', completed: false },
                { id: 'st-pass-2', title: 'Justera gångjärn', completed: false },
                { id: 'st-pass-3', title: 'Kontrollera tätningar', completed: false }
            ],
            links: [], comments: [], attachments: [],
            created: '2025-12-20T19:00:00Z',
            lastModified: '2025-12-20T19:00:00Z'
        },

        // ========== FAS 3: HÖST/VINTER ==========
        {
            id: 'door-sliding-replace',
            type: 'MAINTENANCE',
            title: 'Byt skjutdörr',
            description: 'Genomrostad i nederkant - MÅSTE bytas. Blockerad tills dörr hittad.',
            status: 'BLOCKED',
            priority: 'HIGH',
            phase: 'Fas 3: Höst/Vinter',
            mechanicalPhase: 'P2_RUST',
            blockers: [{ taskId: 'door-search', reason: 'Måste hitta begagnad dörr först' }],
            estimatedCostMin: 3000,
            estimatedCostMax: 5000,
            actualCost: 0,
            weightKg: 0,
            costType: 'INVESTMENT',
            difficultyLevel: 'Medium',
            requiredTools: ['Hylsnycklar', 'Skruvdragare', 'Domkraft'],
            tags: ['Dörrar', 'Kaross', 'Stort jobb'],
            subtasks: [
                { id: 'st-sdoor-1', title: 'Dokumentera kablar', completed: false },
                { id: 'st-sdoor-2', title: 'Demontera gammal dörr', completed: false },
                { id: 'st-sdoor-3', title: 'Montera ny dörr', completed: false }
            ],
            links: [], comments: [], attachments: [],
            created: '2025-12-20T10:00:00Z',
            lastModified: '2025-12-20T10:00:00Z'
        },
        {
            id: 'door-driver-replace',
            type: 'MAINTENANCE',
            title: 'Byt förardörr',
            description: 'Nederkant helt genomrostad. Blockerad tills dörr hittad.',
            status: 'BLOCKED',
            priority: 'HIGH',
            phase: 'Fas 3: Höst/Vinter',
            mechanicalPhase: 'P2_RUST',
            blockers: [{ taskId: 'door-search', reason: 'Måste hitta begagnad dörr först' }],
            estimatedCostMin: 2000,
            estimatedCostMax: 3500,
            actualCost: 0,
            weightKg: 0,
            costType: 'INVESTMENT',
            difficultyLevel: 'Medium',
            requiredTools: ['Hylsnycklar', 'Skruvdragare'],
            tags: ['Dörrar', 'Kaross'],
            subtasks: [],
            links: [], comments: [], attachments: [],
            created: '2025-12-20T10:00:00Z',
            lastModified: '2025-12-20T10:00:00Z'
        },
        {
            id: 'rust-beam-weld',
            type: 'MAINTENANCE',
            title: 'Svetsa underredsbalk',
            description: 'Rostskadad tvärbalk under chassi. Lokaliserat, "bättre än befarat".',
            status: 'TODO',
            priority: 'MEDIUM',
            phase: 'Fas 3: Höst/Vinter',
            mechanicalPhase: 'P2_RUST',
            estimatedCostMin: 500,
            estimatedCostMax: 2000,
            actualCost: 0,
            weightKg: 1,
            costType: 'INVESTMENT',
            difficultyLevel: 'Expert',
            requiredTools: ['MIG-svets', 'Vinkelslip', 'Plåtsax', 'Rostskydd'],
            tags: ['Rost', 'Svets', 'Underrede', 'Struktur'],
            subtasks: [
                { id: 'st-beam-1', title: 'Rengör och bedöm', completed: false },
                { id: 'st-beam-2', title: 'Skär bort dålig plåt', completed: false },
                { id: 'st-beam-3', title: 'Svetsa ny plåt', completed: false },
                { id: 'st-beam-4', title: 'Rostskydda', completed: false }
            ],
            links: [], comments: [], attachments: [],
            created: '2025-12-20T10:00:00Z',
            lastModified: '2025-12-20T10:00:00Z'
        },
        {
            id: 'el-victron-system',
            type: 'BUILD',
            title: 'Installera komplett Victron-elsystem',
            description: 'SmartShunt, MPPT 100/50, Orion-Tr DC-DC, 2x200W solpaneler.',
            status: 'TODO',
            priority: 'MEDIUM',
            phase: 'Fas 3: Höst/Vinter',
            buildPhase: 'B2_SYSTEMS',
            estimatedCostMin: 12000,
            estimatedCostMax: 20000,
            actualCost: 0,
            weightKg: 30,
            costType: 'INVESTMENT',
            difficultyLevel: 'Expert',
            requiredTools: ['Krympverktyg', 'Multimeter', 'Kabelsax', 'Skruvdragare'],
            tags: ['El', 'Victron', 'Sol', 'Uppgradering'],
            subtasks: [
                { id: 'st-vic-1', title: 'Rita komplett elschema', completed: false },
                { id: 'st-vic-2', title: 'Beställ Victron-komponenter', completed: false },
                { id: 'st-vic-3', title: 'Montera solpaneler', completed: false },
                { id: 'st-vic-4', title: 'Installera MPPT', completed: false },
                { id: 'st-vic-5', title: 'Testa och dokumentera', completed: false }
            ],
            links: [{ id: 'l-vic', title: 'Victron docs', url: 'https://www.victronenergy.com' }],
            comments: [], attachments: [],
            created: '2025-12-20T10:00:00Z',
            lastModified: '2025-12-20T10:00:00Z'
        },
        {
            id: 'front-fixes',
            type: 'MAINTENANCE',
            title: 'Fixa framsida & hjulhus',
            description: 'Rost vid luftintag, framfönster, under vindruta. Antennfäste löst.',
            status: 'TODO',
            priority: 'LOW',
            phase: 'Fas 3: Höst/Vinter',
            mechanicalPhase: 'P2_RUST',
            estimatedCostMin: 400,
            estimatedCostMax: 1000,
            actualCost: 0,
            weightKg: 0,
            costType: 'OPERATION',
            difficultyLevel: 'Easy',
            requiredTools: ['Stålborste', 'Rostomvandlare', 'Spackel', 'Skruvdragare'],
            tags: ['Rost', 'Framsida', 'Kosmetik'],
            subtasks: [
                { id: 'st-front-1', title: 'Rensa gammal plåt hjulhus', completed: false },
                { id: 'st-front-2', title: 'Behandla rost framfönster', completed: false },
                { id: 'st-front-3', title: 'Behandla rost luftintag', completed: false },
                { id: 'st-front-4', title: 'Fixa antenn', completed: false }
            ],
            links: [], comments: [], attachments: [],
            created: '2025-12-20T19:00:00Z',
            lastModified: '2025-12-20T19:00:00Z'
        },
        {
            id: 'interior-fixes',
            type: 'MAINTENANCE',
            title: 'Fixa interiör (instrument + fläkt + mattor)',
            description: 'Ta bort trasiga eftermonterade instrument, fixa kupéfläkt, byt mattor.',
            status: 'TODO',
            priority: 'LOW',
            phase: 'Fas 3: Höst/Vinter',
            buildPhase: 'B3_INTERIOR',
            estimatedCostMin: 200,
            estimatedCostMax: 800,
            actualCost: 0,
            weightKg: 0,
            costType: 'OPERATION',
            difficultyLevel: 'Easy',
            requiredTools: ['Skruvdragare', 'Plastverktyg', 'Multimeter'],
            tags: ['Interiör', 'Komfort', 'DIY'],
            subtasks: [
                { id: 'st-int-1', title: 'Ta bort eftermonterade instrument', completed: false },
                { id: 'st-int-2', title: 'Fixa kupéfläkt', completed: false },
                { id: 'st-int-3', title: 'Byt golvmattor', completed: false },
                { id: 'st-int-4', title: 'Montera om lister', completed: false }
            ],
            links: [], comments: [], attachments: [],
            created: '2025-12-20T19:00:00Z',
            lastModified: '2025-12-20T19:00:00Z'
        },

        // ========== BACKLOG ==========
        {
            id: 'cosmetic-rust-fixes',
            type: 'MAINTENANCE',
            title: 'Kosmetiska rostfixar (hela bilen)',
            description: 'Alla mindre rostpunkter. LÅGPRIORITERAT - gör när tid finns.',
            status: 'TODO',
            priority: 'LOW',
            phase: 'Backlog',
            mechanicalPhase: 'P2_RUST',
            estimatedCostMin: 1000,
            estimatedCostMax: 3000,
            actualCost: 0,
            weightKg: 0,
            costType: 'OPERATION',
            difficultyLevel: 'Easy',
            requiredTools: ['Stålborste', 'Rostomvandlare', 'Bättringsfärg', 'Sikaflex'],
            tags: ['Rost', 'Kosmetik', 'Backlog'],
            subtasks: [
                { id: 'st-cosm-1', title: 'Behandla rostpunkter vänster sida', completed: false },
                { id: 'st-cosm-2', title: 'Behandla rostpunkter höger sida', completed: false },
                { id: 'st-cosm-3', title: 'Fixa löst sittande fönster', completed: false },
                { id: 'st-cosm-4', title: 'Byt list runt skjutdörr', completed: false }
            ],
            links: [], comments: [], attachments: [],
            created: '2025-12-20T19:00:00Z',
            lastModified: '2025-12-20T19:00:00Z'
        },
        {
            id: 'motor-evaluation',
            type: 'IDEA',
            title: 'Utvärdera motor efter sommarkörning',
            description: 'Beslut efter sommaren: behåll och serva, eller dieselkonvertering (Volvo D24)?',
            status: 'IDEA',
            priority: 'LOW',
            phase: 'Backlog',
            estimatedCostMin: 0,
            estimatedCostMax: 30000,
            actualCost: 0,
            weightKg: 0,
            costType: 'INVESTMENT',
            difficultyLevel: 'Expert',
            tags: ['Motor', 'Beslut', 'Framtid'],
            subtasks: [],
            decisionOptions: [
                { id: 'mot-1', title: 'Behåll och serva', costRange: '10-15k kr', pros: ['Känd motor'], cons: ['Svag 75hk'] },
                { id: 'mot-2', title: 'Dieselkonvertering D24', costRange: '15-30k kr', pros: ['Mer moment', 'Bättre bränsle'], cons: ['Stort jobb'], recommended: true }
            ],
            links: [], comments: [], attachments: [],
            created: '2025-12-20T10:00:00Z',
            lastModified: '2025-12-20T10:00:00Z'
        }
    ];

    // ===== ALL 19 SHOPPING ITEMS =====
    const shoppingItems = [
        // Batteri
        { id: 'shop-bat-1', name: 'LiFePO4-celler 280Ah (EVE LF280K)', category: 'El', estimatedCost: 7000, quantity: '4 st', checked: false, status: 'RESEARCH', linkedTaskId: 'el-temp-battery' },
        { id: 'shop-bat-2', name: 'BMS för LiFePO4 (JK/Daly 100-200A)', category: 'El', estimatedCost: 1500, quantity: '1 st', checked: false, status: 'RESEARCH', linkedTaskId: 'el-temp-battery' },
        { id: 'shop-bat-3', name: 'Huvudsäkring 150-200A', category: 'El', estimatedCost: 350, quantity: '1 st', checked: false, status: 'RESEARCH', linkedTaskId: 'el-temp-battery' },
        { id: 'shop-bat-4', name: 'Batterikablar 25-35mm²', category: 'El', estimatedCost: 800, quantity: '10 meter', checked: false, status: 'RESEARCH', linkedTaskId: 'el-temp-battery' },
        { id: 'shop-bat-5', name: 'Kabelskor + krympslang', category: 'El', estimatedCost: 600, quantity: '10 meter', checked: false, status: 'RESEARCH', linkedTaskId: 'el-temp-battery' },
        // Dieselvärmare
        { id: 'shop-heat-1', name: 'Vevor 5kW Dieselvärmare', category: 'Värme', estimatedCost: 1500, quantity: '1 st komplett kit', checked: false, status: 'RESEARCH', linkedTaskId: 'heating-diesel-heater', options: [{ store: 'AliExpress', price: 1299, deliveryDays: 21 }, { store: 'Amazon.se', price: 1899, deliveryDays: 3 }] },
        { id: 'shop-heat-2', name: 'Dieseltank 10-20L (separat)', category: 'Bränsle', estimatedCost: 500, quantity: '1 st', checked: false, status: 'RESEARCH', linkedTaskId: 'heating-diesel-heater' },
        { id: 'shop-heat-3', name: 'Bränsleledning + filter', category: 'Värme', estimatedCost: 200, quantity: '1 set', checked: false, status: 'RESEARCH', linkedTaskId: 'heating-diesel-heater' },
        // Tätning
        { id: 'shop-seal-1', name: 'Sikaflex 221 (vit)', category: 'Kemi & Tätning', estimatedCost: 240, quantity: '2 tuber', checked: false, status: 'RESEARCH', linkedTaskId: 'rust-roof-seal', options: [{ store: 'Biltema', articleNumber: '36-7821', price: 119, shelfLocation: 'Gång 12' }] },
        { id: 'shop-seal-2', name: 'Rostomvandlare (Fertan)', category: 'Kemi & Tätning', estimatedCost: 170, quantity: '250ml', checked: false, status: 'RESEARCH', linkedTaskId: 'rust-roof-seal', options: [{ store: 'Biltema', articleNumber: '36-5523', price: 149 }] },
        { id: 'shop-seal-3', name: 'Primer', category: 'Kemi & Tätning', estimatedCost: 150, quantity: '1 burk', checked: false, status: 'RESEARCH', linkedTaskId: 'rust-roof-seal' },
        // Motor
        { id: 'shop-motor-1', name: 'Motorolja 10W-40 Mineral', category: 'Motor', estimatedCost: 350, quantity: '6 liter', checked: false, status: 'RESEARCH', linkedTaskId: 'motor-oil-change' },
        { id: 'shop-motor-2', name: 'Oljefilter', category: 'Motor', estimatedCost: 120, quantity: '1 st', checked: false, status: 'RESEARCH', linkedTaskId: 'motor-oil-change' },
        // Taklucka
        { id: 'shop-hatch-1', name: 'Taklucka Fiamma Vent 40', category: 'Inredning', estimatedCost: 1200, quantity: '1 st', checked: false, status: 'RESEARCH', linkedTaskId: 'roof-hatch-replace', options: [{ store: 'Camping24', price: 1199 }, { store: 'Husbilsfiansen', price: 1349 }] },
        // Dörrar
        { id: 'shop-door-1', name: 'Begagnad skjutdörr VW LT', category: 'Kaross', estimatedCost: 4000, quantity: '1 st', checked: false, status: 'RESEARCH', linkedTaskId: 'door-search' },
        { id: 'shop-door-2', name: 'Begagnad förardörr VW LT', category: 'Kaross', estimatedCost: 3000, quantity: '1 st', checked: false, status: 'RESEARCH', linkedTaskId: 'door-search' },
        // Victron
        { id: 'shop-victron-1', name: 'Victron SmartShunt 500A', category: 'El - Victron', estimatedCost: 1400, quantity: '1 st', checked: false, status: 'RESEARCH', linkedTaskId: 'el-victron-system' },
        { id: 'shop-victron-2', name: 'Victron MPPT 100/50', category: 'El - Victron', estimatedCost: 3200, quantity: '1 st', checked: false, status: 'RESEARCH', linkedTaskId: 'el-victron-system' },
        // Sol
        { id: 'shop-solar-1', name: 'Solpanel 200W', category: 'El - Sol', estimatedCost: 2000, quantity: '2 st', checked: false, status: 'RESEARCH', linkedTaskId: 'el-victron-system' }
    ];

    // SERVICE LOG
    const serviceLog = [
        { id: 'h1', date: '2025-12-05', description: 'Köp av Elton! Projektstart', mileage: '3 362 mil', performer: 'Hanna', type: 'Övrigt' },
        { id: 'h2', date: '2025-11-04', description: 'Bilen ställdes av', mileage: '3 362 mil', performer: 'Transportstyrelsen', type: 'Övrigt' },
        { id: 'h3', date: '2025-08-13', description: 'Besiktning (Godkänd)', mileage: '3 362 mil', performer: 'Bilprovningen', type: 'Besiktning' },
        { id: 'h4', date: '2025-12-20', description: 'Detaljerad inspektion. 68 anmärkningar, 20 positiva', mileage: '3 362 mil', performer: 'Joel & Hanna', type: 'Övrigt' }
    ];

    // ===== IMPORT =====
    console.log('📝 Importing 23 tasks...');
    for (const task of allTasks) {
        await tasksRef.doc(task.id).set(task, { merge: true });
    }
    console.log(`✅ ${allTasks.length} tasks imported\n`);

    console.log('🛒 Importing 19 shopping items...');
    for (const item of shoppingItems) {
        await shoppingRef.doc(item.id).set(item, { merge: true });
    }
    console.log(`✅ ${shoppingItems.length} items imported\n`);

    console.log('🔧 Importing service log...');
    for (const entry of serviceLog) {
        await serviceRef.doc(entry.id).set(entry, { merge: true });
    }
    console.log(`✅ ${serviceLog.length} log entries\n`);

    console.log('='.repeat(60));
    console.log('🎉 COMPLETE! ALL 23 TASKS + 19 SHOPPING ITEMS IMPORTED');
    console.log('='.repeat(60));
    console.log('\n📋 TASK SUMMARY:');
    console.log('   Fas 0 (DONE): 5 tasks');
    console.log('   Fas 1 Januari: 2 tasks (batteri, dieselvärmare)');
    console.log('   Fas 1 Vår: 4 tasks (quick fixes: läcka, rost, motor, markis)');
    console.log('   Fas 2 Sommar: 4 tasks');
    console.log('   Fas 3 Höst/Vinter: 6 tasks');
    console.log('   Backlog: 2 tasks');
    console.log('\n🛒 SHOPPING: 19 items inkl. dieselvärmare + solpaneler');
    console.log('\n📱 Uppdatera appen för att se allt!\n');
}

importAll().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });

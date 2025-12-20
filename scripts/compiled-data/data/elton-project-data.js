"use strict";
/**
 * ELTON PROJECT DATABASE - VW LT31 1976 (JSN398)
 * Genererad: 2025-12-20
 * Baserad på: Detaljerad inspektion + strategidiskussion
 *
 * ================================
 * ANVÄNDNING:
 * ================================
 * Denna fil innehåller all data för att populera Elton-projektet.
 * Kör import-scriptet: npx ts-node scripts/import-elton-data.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ELTON_SERVICE_LOG = exports.ELTON_TASKS = exports.ELTON_SHOPPING_ITEMS = exports.ELTON_VEHICLE_DATA = void 0;
var types_1 = require("@/types/types");
// =============================================================================
// VEHICLE DATA
// =============================================================================
exports.ELTON_VEHICLE_DATA = {
    regNo: 'JSN398',
    make: 'Volkswagen',
    model: 'LT 31 (Typ 28/21)',
    year: 1976,
    prodYear: 1976,
    regDate: '1978-02-14',
    status: 'Avställd',
    bodyType: 'Skåp Bostadsinredning',
    passengers: 4,
    inspection: {
        last: '2025-08-13',
        mileage: '3 362 mil (Mätarställning)',
        next: 'Okänd'
    },
    engine: {
        fuel: 'Bensin',
        power: '75 HK / 55 kW',
        volume: '2.0L (Audi)',
        type: '2.0L Bensin (Audi)',
        code: 'CH'
    },
    gearbox: 'Manuell 4-växlad',
    wheels: {
        drive: '2WD Bakhjulsdrift',
        tiresFront: '215R14 C',
        tiresRear: '215R14 C',
        boltPattern: '5x160'
    },
    dimensions: {
        length: 5400,
        width: 2020,
        height: '2500 mm',
        wheelbase: 2500
    },
    weights: {
        curb: 2280,
        total: 3160,
        load: 880,
        trailer: 1400,
        trailerB: 750
    },
    vin: '2862500058',
    color: 'Flerfärgad',
    history: {
        owners: 22,
        events: 38,
        lastOwnerChange: '2025-12-05'
    },
    maintenance: {
        fluids: {
            oilType: '10W-40 Mineral',
            oilCapacity: '6.0 liter',
            coolantType: 'Glykol blå (G11)',
            gearboxOil: 'API GL-4 (Gulmetallsäker)'
        },
        battery: {
            type: 'Startbatteri',
            capacity: '75-88Ah'
        },
        tires: {
            pressureFront: '3.5 bar',
            pressureRear: '4.5 bar'
        }
    },
    expertAnalysis: {
        commonFaults: [
            { title: 'Spindelbultar (Kingpins)', description: 'Måste smörjas var 500:e mil! Om de skär krävs press.', urgency: 'High' },
            { title: 'Rost i balkar', description: 'Kolla tvärbalkar och domkraftsfästen noga.', urgency: 'Medium' },
            { title: 'Takskarv glasfiber/plåt', description: 'Klassisk läckagepunkt på LT med husbilspåbyggnad.', urgency: 'High' }
        ],
        modificationTips: [
            { title: 'Motorbyte D24', description: 'Populärt att byta till Volvo D24 eller D24T för mer ork och bättre bränsle.' },
            { title: 'Victron elsystem', description: 'Bygg komplett 12V-system med LiFePO4 och Victron-komponenter.' }
        ],
        maintenanceNotes: 'OBS: 5-siffrig mätare. Mätarställning 3362 mil är troligen 13 362, 23 362 eller 33 362. Motor har körts med mycket startgas historiskt - okänt slitage.'
    }
};
// =============================================================================
// SHOPPING ITEMS
// =============================================================================
exports.ELTON_SHOPPING_ITEMS = [
    // --- FAS 1: JANUARI - LiFePO4 ---
    {
        id: 'shop-bat-1',
        name: 'LiFePO4-celler 280Ah (EVE LF280K)',
        category: 'El',
        estimatedCost: 7000,
        quantity: '4 st',
        checked: false,
        status: types_1.ShoppingItemStatus.RESEARCH,
        linkedTaskId: 'el-temp-battery',
        options: [
            { id: 'opt-bat-1a', store: 'AliExpress', articleNumber: 'EVE LF280K Grade A', price: 6200, currency: 'SEK', shippingCost: 800, totalCost: 7000, deliveryTimeDays: 21, inStock: true, url: 'https://aliexpress.com/item/eve-lf280k', lastPriceCheck: '2025-12-20' },
            { id: 'opt-bat-1b', store: 'Nkon.nl', articleNumber: 'EVE LF280K', price: 8200, currency: 'SEK', shippingCost: 350, totalCost: 8550, deliveryTimeDays: 5, inStock: true, url: 'https://nkon.nl', lastPriceCheck: '2025-12-20' },
            { id: 'opt-bat-1c', store: 'Batterihansen.se', articleNumber: 'CATL 280Ah', price: 9500, currency: 'SEK', shippingCost: 0, totalCost: 9500, deliveryTimeDays: 3, inStock: true, url: 'https://batterihansen.se', lastPriceCheck: '2025-12-20' }
        ]
    },
    {
        id: 'shop-bat-2',
        name: 'BMS för LiFePO4 (4S 100-200A)',
        category: 'El',
        estimatedCost: 1500,
        quantity: '1 st',
        checked: false,
        status: types_1.ShoppingItemStatus.RESEARCH,
        linkedTaskId: 'el-temp-battery',
        options: [
            { id: 'opt-bms-1a', store: 'AliExpress', articleNumber: 'JK BMS BD6A20S10P', price: 1100, currency: 'SEK', shippingCost: 0, totalCost: 1100, deliveryTimeDays: 14, inStock: true, url: 'https://aliexpress.com/item/jk-bms', lastPriceCheck: '2025-12-20' },
            { id: 'opt-bms-1b', store: 'Amazon.de', articleNumber: 'Daly 4S 150A', price: 1650, currency: 'SEK', shippingCost: 150, totalCost: 1800, deliveryTimeDays: 4, inStock: true, url: 'https://amazon.de', lastPriceCheck: '2025-12-20' }
        ]
    },
    {
        id: 'shop-bat-3',
        name: 'Busbars koppar (för cellkoppling)',
        category: 'El',
        estimatedCost: 300,
        quantity: '1 set',
        checked: false,
        status: types_1.ShoppingItemStatus.RESEARCH,
        linkedTaskId: 'el-temp-battery'
    },
    {
        id: 'shop-bat-4',
        name: 'ANL-säkring 150A + hållare',
        category: 'El',
        estimatedCost: 250,
        quantity: '1 st',
        checked: false,
        status: types_1.ShoppingItemStatus.RESEARCH,
        linkedTaskId: 'el-temp-battery',
        options: [
            { id: 'opt-fuse-1a', store: 'Biltema', articleNumber: '85-7150', price: 199, currency: 'SEK', shippingCost: 0, totalCost: 199, deliveryTimeDays: 0, inStock: true, shelfLocation: 'Gång 8, Bilel', lastPriceCheck: '2025-12-20' }
        ]
    },
    {
        id: 'shop-bat-5',
        name: 'Batterikabel 35mm² (röd + svart)',
        category: 'El',
        estimatedCost: 600,
        quantity: '10 meter totalt',
        checked: false,
        status: types_1.ShoppingItemStatus.RESEARCH,
        linkedTaskId: 'el-temp-battery'
    },
    // --- FAS 1: JANUARI - Dieselvärmare ---
    {
        id: 'shop-heat-1',
        name: 'Vevor 5kW Dieselvärmare',
        category: 'Värme',
        estimatedCost: 1500,
        quantity: '1 st komplett kit',
        checked: false,
        status: types_1.ShoppingItemStatus.RESEARCH,
        linkedTaskId: 'heating-diesel-heater',
        options: [
            { id: 'opt-heat-1a', store: 'AliExpress', articleNumber: 'Vevor 5kW Diesel Air Heater', price: 1299, currency: 'SEK', shippingCost: 200, totalCost: 1499, deliveryTimeDays: 21, inStock: true, url: 'https://aliexpress.com', lastPriceCheck: '2025-12-20' },
            { id: 'opt-heat-1b', store: 'Amazon.se', articleNumber: 'Vevor Diesel Heater 5KW', price: 1899, currency: 'SEK', shippingCost: 0, totalCost: 1899, deliveryTimeDays: 3, inStock: true, url: 'https://amazon.se', lastPriceCheck: '2025-12-20' }
        ]
    },
    {
        id: 'shop-heat-2',
        name: 'Dieseltank 10-20L (separat)',
        category: 'Bränsle',
        estimatedCost: 500,
        quantity: '1 st',
        checked: false,
        status: types_1.ShoppingItemStatus.RESEARCH,
        linkedTaskId: 'heating-diesel-heater'
    },
    {
        id: 'shop-heat-3',
        name: 'Bränsleledning + filter',
        category: 'Värme',
        estimatedCost: 200,
        quantity: '1 set',
        checked: false,
        status: types_1.ShoppingItemStatus.RESEARCH,
        linkedTaskId: 'heating-diesel-heater'
    },
    // --- FAS 1: VÅR - Tätning ---
    {
        id: 'shop-seal-1',
        name: 'Sikaflex 221 (vit)',
        category: 'Kemi & Tätning',
        estimatedCost: 240,
        quantity: '2 tuber',
        checked: false,
        status: types_1.ShoppingItemStatus.RESEARCH,
        linkedTaskId: 'rust-roof-seal',
        options: [
            { id: 'opt-sika-1a', store: 'Biltema', articleNumber: '36-7821', price: 119, currency: 'SEK', shippingCost: 0, totalCost: 238, deliveryTimeDays: 0, inStock: true, shelfLocation: 'Gång 12, Lim & Fog', lastPriceCheck: '2025-12-20' },
            { id: 'opt-sika-1b', store: 'Jula', articleNumber: '318-451', price: 129, currency: 'SEK', shippingCost: 0, totalCost: 258, deliveryTimeDays: 0, inStock: true, lastPriceCheck: '2025-12-20' }
        ]
    },
    {
        id: 'shop-seal-2',
        name: 'Rostomvandlare',
        category: 'Kemi & Tätning',
        estimatedCost: 170,
        quantity: '250ml',
        checked: false,
        status: types_1.ShoppingItemStatus.RESEARCH,
        linkedTaskId: 'rust-roof-seal',
        options: [
            { id: 'opt-rust-1a', store: 'Biltema', articleNumber: '36-5523 (Fertan)', price: 149, currency: 'SEK', shippingCost: 0, totalCost: 149, deliveryTimeDays: 0, inStock: true, shelfLocation: 'Gång 12, Rostskydd', lastPriceCheck: '2025-12-20' }
        ]
    },
    {
        id: 'shop-seal-3',
        name: 'Zinkspray / Zinkprimer',
        category: 'Kemi & Tätning',
        estimatedCost: 130,
        quantity: '1 burk 400ml',
        checked: false,
        status: types_1.ShoppingItemStatus.RESEARCH,
        linkedTaskId: 'rust-roof-seal'
    },
    // --- Motor service ---
    {
        id: 'shop-motor-1',
        name: 'Motorolja 10W-40 Mineral',
        category: 'Motor',
        estimatedCost: 350,
        quantity: '7 liter',
        checked: false,
        status: types_1.ShoppingItemStatus.RESEARCH,
        linkedTaskId: 'motor-oil-change',
        options: [
            { id: 'opt-oil-1a', store: 'Biltema', articleNumber: '36-1285 (5L) + 36-1282 (1L)', price: 299, currency: 'SEK', shippingCost: 0, totalCost: 378, deliveryTimeDays: 0, inStock: true, shelfLocation: 'Gång 5, Motoroljor', lastPriceCheck: '2025-12-20' }
        ]
    },
    {
        id: 'shop-motor-2',
        name: 'Oljefilter (Audi CH 2.0)',
        category: 'Motor',
        estimatedCost: 100,
        quantity: '1 st',
        checked: false,
        status: types_1.ShoppingItemStatus.RESEARCH,
        linkedTaskId: 'motor-oil-change'
    },
    // --- Taklucka ---
    {
        id: 'shop-hatch-1',
        name: 'Taklucka husbil 40x40cm',
        category: 'Kaross',
        estimatedCost: 1500,
        quantity: '1 st',
        checked: false,
        status: types_1.ShoppingItemStatus.RESEARCH,
        linkedTaskId: 'roof-hatch-replace',
        options: [
            { id: 'opt-hatch-1a', store: 'Campingvaruhuset', articleNumber: 'Fiamma Vent 40x40', price: 1199, currency: 'SEK', shippingCost: 99, totalCost: 1298, deliveryTimeDays: 3, inStock: true, url: 'https://campingvaruhuset.se', lastPriceCheck: '2025-12-20' },
            { id: 'opt-hatch-1b', store: 'Biltema', articleNumber: 'MPK VisionVent S eco', price: 899, currency: 'SEK', shippingCost: 0, totalCost: 899, deliveryTimeDays: 0, inStock: true, shelfLocation: 'Husbilsavdelning', lastPriceCheck: '2025-12-20' }
        ]
    },
    // --- Begagnade dörrar ---
    {
        id: 'shop-door-1',
        name: 'Skjutdörr VW LT (begagnad)',
        category: 'Kaross',
        estimatedCost: 3500,
        quantity: '1 st komplett',
        checked: false,
        status: types_1.ShoppingItemStatus.RESEARCH,
        linkedTaskId: 'door-sliding-replace'
    },
    {
        id: 'shop-door-2',
        name: 'Förardörr VW LT (begagnad)',
        category: 'Kaross',
        estimatedCost: 2500,
        quantity: '1 st',
        checked: false,
        status: types_1.ShoppingItemStatus.RESEARCH,
        linkedTaskId: 'door-driver-replace'
    },
    // --- Victron (Höst) ---
    {
        id: 'shop-victron-1',
        name: 'Victron SmartShunt 500A/50mV',
        category: 'El - Victron',
        estimatedCost: 1300,
        quantity: '1 st',
        checked: false,
        status: types_1.ShoppingItemStatus.RESEARCH,
        linkedTaskId: 'el-victron-system'
    },
    {
        id: 'shop-victron-2',
        name: 'Victron SmartSolar MPPT 100/50',
        category: 'El - Victron',
        estimatedCost: 3500,
        quantity: '1 st',
        checked: false,
        status: types_1.ShoppingItemStatus.RESEARCH,
        linkedTaskId: 'el-victron-system'
    },
    {
        id: 'shop-solar-1',
        name: 'Solpanel monokristallin 200W',
        category: 'El - Sol',
        estimatedCost: 3000,
        quantity: '2 st',
        checked: false,
        status: types_1.ShoppingItemStatus.RESEARCH,
        linkedTaskId: 'el-victron-system'
    }
];
// =============================================================================
// TASKS
// =============================================================================
exports.ELTON_TASKS = [
    // --- FAS 1: JANUARI ---
    {
        id: 'el-temp-battery',
        type: types_1.TaskType.BUILD,
        title: 'Bygg tillfälligt LiFePO4-bodelsbatteri',
        description: "Frist\u00E5ende 12V-system f\u00F6r bodelen som m\u00F6jligg\u00F6r enklare utflykter innan komplett Victron-system installeras.\n\n**Komponenter:**\n- 4x LiFePO4 280Ah celler (EVE/CATL)\n- JK BMS eller Daly 100-200A\n- Huvuds\u00E4kring 150-200A (inom 30cm fr\u00E5n pol!)\n- 25-35mm\u00B2 kablar f\u00F6r huvudmatning\n\n**S\u00E4kerhet:** Huvuds\u00E4kring M\u00C5STE sitta n\u00E4ra batteriet!",
        status: types_1.TaskStatus.TODO,
        priority: types_1.Priority.HIGH,
        buildPhase: types_1.BuildPhase.B2_SYSTEMS,
        phase: 'Fas 1: Januari',
        estimatedCostMin: 8000,
        estimatedCostMax: 14000,
        actualCost: 0,
        weightKg: 35,
        costType: types_1.CostType.INVESTMENT,
        difficultyLevel: 'Expert',
        requiredTools: ['Momentnyckel', 'Krympslang', 'Kabelsax', 'Multimeter'],
        tags: ['El', 'LiFePO4', 'Prioritet'],
        links: [{ id: 'l-bat-1', title: 'Will Prowse LiFePO4 guide', url: 'https://www.youtube.com/willprowse' }],
        comments: [],
        attachments: [],
        subtasks: [
            { id: 'st-bat-1', title: 'Beställ LiFePO4-celler', completed: false },
            { id: 'st-bat-2', title: 'Beställ BMS', completed: false },
            { id: 'st-bat-3', title: 'Bygg batterilåda', completed: false },
            { id: 'st-bat-4', title: 'Koppla celler + BMS', completed: false },
            { id: 'st-bat-5', title: 'Installera huvudsäkring', completed: false },
            { id: 'st-bat-6', title: 'Testa system', completed: false }
        ],
        created: '2025-12-20T10:00:00Z',
        lastModified: '2025-12-20T10:00:00Z'
    },
    {
        id: 'heating-diesel-heater',
        type: types_1.TaskType.BUILD,
        title: 'Installera dieselvärmare 5kW',
        description: "Montera Vevor 5kW dieselv\u00E4rmare f\u00F6r \u00E5ret-runt anv\u00E4ndning.\n\n**Komponenter:**\n- Vevor 5kW dieselv\u00E4rmare\n- Separat dieseltank (bilen \u00E4r bensin!)\n- Avgasr\u00F6r + munstycke\n- Br\u00E4nsleledning + pump\n- Termostat/kontrollpanel\n\n**Installation:**\n- Tank monteras under bilen eller i lastutrymme\n- V\u00E4rmare monteras s\u00E4kert och v\u00E4rmeisolerat\n- Avgaser M\u00C5STE ledas ut s\u00E4kert\n\n**VIKTIGT:** Separat dieseltank eftersom bilen g\u00E5r p\u00E5 bensin!",
        status: types_1.TaskStatus.TODO,
        priority: types_1.Priority.HIGH,
        buildPhase: types_1.BuildPhase.B2_SYSTEMS,
        phase: 'Fas 1: Januari',
        estimatedCostMin: 1500,
        estimatedCostMax: 3000,
        actualCost: 0,
        weightKg: 10,
        costType: types_1.CostType.INVESTMENT,
        difficultyLevel: 'Expert',
        requiredTools: ['Borrmaskin', 'Skruvdragare', 'Såg för avgasrör', 'Tätningsmedel'],
        tags: ['Värme', 'Diesel', 'Komfort', 'Prioritet'],
        links: [{ id: 'l-heat-1', title: 'Vevor installation guide', url: 'https://www.vevor.com' }],
        comments: [],
        attachments: [],
        subtasks: [
            { id: 'st-heat-1', title: 'Beställ Vevor 5kW värmare', completed: false },
            { id: 'st-heat-2', title: 'Köp separat dieseltank (10-20L)', completed: false },
            { id: 'st-heat-3', title: 'Planera montering (plats för värmare + tank)', completed: false },
            { id: 'st-heat-4', title: 'Montera dieseltank', completed: false },
            { id: 'st-heat-5', title: 'Montera värmare', completed: false },
            { id: 'st-heat-6', title: 'Dra bränsleledningar', completed: false },
            { id: 'st-heat-7', title: 'Installera avgasrör', completed: false },
            { id: 'st-heat-8', title: 'Testa system', completed: false }
        ],
        created: '2025-12-20T19:00:00Z',
        lastModified: '2025-12-20T19:00:00Z'
    },
    // --- FAS 1: VÅR ---
    {
        id: 'rust-roof-seal',
        type: types_1.TaskType.MAINTENANCE,
        title: 'Täta takskarv och läckagepunkter (temporärt)',
        description: "Stoppa aktivt vattenl\u00E4ckage vid f\u00F6rard\u00F6rren innan sommaren.\n\n**Metod:**\n1. Reng\u00F6r ytor med st\u00E5lborste\n2. Applicera rostomvandlare p\u00E5 synlig rost\n3. L\u00E5t torka 24h\n4. Tunn primer\n5. Sikaflex i alla skarvar\n\n**OBS:** Detta \u00E4r en TEMPOR\u00C4R l\u00F6sning.",
        status: types_1.TaskStatus.TODO,
        priority: types_1.Priority.HIGH,
        mechanicalPhase: types_1.MechanicalPhase.P2_RUST,
        phase: 'Fas 1: Vår',
        estimatedCostMin: 400,
        estimatedCostMax: 800,
        actualCost: 0,
        weightKg: 0,
        costType: types_1.CostType.OPERATION,
        difficultyLevel: 'Easy',
        requiredTools: ['Stålborste', 'Fogpistol', 'Skrapa', 'Trasor'],
        tags: ['Rost', 'Tak', 'Läckage', 'Akut'],
        links: [],
        comments: [],
        attachments: [],
        subtasks: [
            { id: 'st-seal-1', title: 'Köp material (Sikaflex, rostomvandlare, primer)', completed: false },
            { id: 'st-seal-2', title: 'Rengör takskarv vid förardörren', completed: false },
            { id: 'st-seal-3', title: 'Applicera rostomvandlare', completed: false },
            { id: 'st-seal-4', title: 'Sikaflex i skarven', completed: false }
        ],
        created: '2025-12-20T10:00:00Z',
        lastModified: '2025-12-20T10:00:00Z'
    },
    {
        id: 'rust-spot-treatment',
        type: types_1.TaskType.MAINTENANCE,
        title: 'Punktbehandla synliga rostgenomslag',
        description: "Bromsa rostspridning p\u00E5 alla synliga rostgenomslag.\n\n**Identifierade punkter:**\n- Vattenr\u00E4nna/horisontell list (runt hela bilen)\n- Vid solpanelf\u00E4ste\n- Framkant glasfibertak\n\n**M\u00E5l:** Inte snyggt, men STOPPAR rosten.",
        status: types_1.TaskStatus.TODO,
        priority: types_1.Priority.MEDIUM,
        mechanicalPhase: types_1.MechanicalPhase.P2_RUST,
        phase: 'Fas 1: Vår',
        estimatedCostMin: 300,
        estimatedCostMax: 600,
        actualCost: 0,
        weightKg: 0,
        costType: types_1.CostType.OPERATION,
        difficultyLevel: 'Easy',
        requiredTools: ['Stålborste', 'Vinkelslip med stålborste', 'Pensel'],
        tags: ['Rost', 'Kaross'],
        links: [],
        comments: [],
        attachments: [],
        subtasks: [
            { id: 'st-spot-1', title: 'Kartlägg alla rostpunkter', completed: false },
            { id: 'st-spot-2', title: 'Borsta rent', completed: false },
            { id: 'st-spot-3', title: 'Rostomvandlare på alla punkter', completed: false },
            { id: 'st-spot-4', title: 'Primer/bättringsfärg', completed: false }
        ],
        created: '2025-12-20T10:00:00Z',
        lastModified: '2025-12-20T10:00:00Z'
    },
    {
        id: 'motor-oil-change',
        type: types_1.TaskType.MAINTENANCE,
        title: 'Motor minimal service',
        description: "H\u00E5lla motorn vid liv med minimal investering.\n\n**\u00C5tg\u00E4rder:**\n- Oljebyte (10W-40 Mineral, 6 liter)\n- Byt oljefilter\n- Kontrollera luftfilter\n\n**BESLUT:** Vi investerar INTE i kamrem/stor service nu.",
        status: types_1.TaskStatus.TODO,
        priority: types_1.Priority.MEDIUM,
        mechanicalPhase: types_1.MechanicalPhase.P1_ENGINE,
        phase: 'Fas 1: Vår',
        estimatedCostMin: 500,
        estimatedCostMax: 800,
        actualCost: 0,
        weightKg: 0,
        costType: types_1.CostType.OPERATION,
        difficultyLevel: 'Easy',
        requiredTools: ['Oljefilteravdragare', 'Uppsamlingskärl', '17mm nyckel'],
        tags: ['Motor', 'Service', 'DIY'],
        links: [],
        comments: [],
        attachments: [],
        subtasks: [
            { id: 'st-oil-1', title: 'Köp olja och filter', completed: false },
            { id: 'st-oil-2', title: 'Byt motorolja', completed: false },
            { id: 'st-oil-3', title: 'Byt oljefilter', completed: false }
        ],
        created: '2025-12-20T10:00:00Z',
        lastModified: '2025-12-20T10:00:00Z'
    },
    {
        id: 'awning-remove',
        type: types_1.TaskType.MAINTENANCE,
        title: 'Demontera markis för inspektion',
        description: "Ta bort markisen f\u00F6r att inspektera glasfibertaket under f\u00E4stena.",
        status: types_1.TaskStatus.TODO,
        priority: types_1.Priority.MEDIUM,
        mechanicalPhase: types_1.MechanicalPhase.P2_RUST,
        phase: 'Fas 1: Vår',
        estimatedCostMin: 0,
        estimatedCostMax: 200,
        actualCost: 0,
        weightKg: -15,
        costType: types_1.CostType.OPERATION,
        difficultyLevel: 'Easy',
        requiredTools: ['Skruvdragare', 'Insexnycklar', 'Stege'],
        tags: ['Tak', 'Markis', 'Inspektion'],
        links: [],
        comments: [],
        attachments: [],
        subtasks: [
            { id: 'st-awn-1', title: 'Fotografera montering', completed: false },
            { id: 'st-awn-2', title: 'Demontera markis', completed: false },
            { id: 'st-awn-3', title: 'Inspektera glasfiber under fästen', completed: false }
        ],
        created: '2025-12-20T10:00:00Z',
        lastModified: '2025-12-20T10:00:00Z'
    },
    // --- FAS 2: SOMMAR ---
    {
        id: 'roof-hatch-replace',
        type: types_1.TaskType.BUILD,
        title: 'Byt taklucka till modern',
        description: "Ers\u00E4tt gammal l\u00E4ckande taklucka med modern husbilslucka.\n\n**Rekommenderade alternativ:**\n- Fiamma Vent 40 (40x40cm) - ca 1200 kr\n- MPK VisionVent (budget) - ca 900 kr",
        status: types_1.TaskStatus.TODO,
        priority: types_1.Priority.MEDIUM,
        buildPhase: types_1.BuildPhase.B1_SHELL,
        phase: 'Fas 2: Sommar',
        estimatedCostMin: 900,
        estimatedCostMax: 2500,
        actualCost: 0,
        weightKg: 3,
        costType: types_1.CostType.INVESTMENT,
        difficultyLevel: 'Medium',
        requiredTools: ['Sticksåg', 'Skruvdragare', 'Fogpistol', 'Måttband'],
        tags: ['Tak', 'Uppgradering', 'Tätning'],
        links: [],
        comments: [],
        attachments: [],
        subtasks: [
            { id: 'st-hatch-1', title: 'Mät befintligt hål', completed: false },
            { id: 'st-hatch-2', title: 'Välj och beställ lucka', completed: false },
            { id: 'st-hatch-3', title: 'Demontera gammal lucka', completed: false },
            { id: 'st-hatch-4', title: 'Montera ny lucka med Sikaflex', completed: false }
        ],
        decisionOptions: [
            { id: 'hatch-opt-1', title: 'Budget: MPK VisionVent', description: 'Enkel lucka utan fläkt.', costRange: '900 kr', pros: ['Billigast', 'Finns på Biltema'], cons: ['Ingen fläkt'] },
            { id: 'hatch-opt-2', title: 'Standard: Fiamma Vent 40', description: 'Populärt val för husbilar.', costRange: '1 200-1 300 kr', pros: ['Pålitlig', 'Bra tätningar'], cons: ['Ingen fläkt'], recommended: true }
        ],
        created: '2025-12-20T10:00:00Z',
        lastModified: '2025-12-20T10:00:00Z'
    },
    {
        id: 'door-search',
        type: types_1.TaskType.PURCHASE,
        title: 'Leta begagnade dörrar (skjut + förare)',
        description: "Hitta begagnade d\u00F6rrar i b\u00E4ttre skick.\n\n**Var leta:**\n- Blocket (s\u00F6k \"VW LT delar\")\n- eBay Kleinanzeigen (Tyskland)\n- LT-forum\n\n**Budget:** ca 2000-3000 kr per d\u00F6rr",
        status: types_1.TaskStatus.TODO,
        priority: types_1.Priority.HIGH,
        phase: 'Fas 2: Sommar',
        estimatedCostMin: 4000,
        estimatedCostMax: 8000,
        actualCost: 0,
        weightKg: 0,
        costType: types_1.CostType.INVESTMENT,
        difficultyLevel: 'Easy',
        tags: ['Dörrar', 'Begagnat', 'Inköp'],
        links: [
            { id: 'l-door-1', title: 'Blocket VW LT', url: 'https://www.blocket.se' },
            { id: 'l-door-2', title: 'eBay Kleinanzeigen', url: 'https://www.kleinanzeigen.de' }
        ],
        comments: [],
        attachments: [],
        subtasks: [
            { id: 'st-door-1', title: 'Sätt upp Blocket-bevakning', completed: false },
            { id: 'st-door-2', title: 'Kolla tyska annonser', completed: false },
            { id: 'st-door-3', title: 'Hitta skjutdörr', completed: false },
            { id: 'st-door-4', title: 'Hitta förardörr', completed: false }
        ],
        created: '2025-12-20T10:00:00Z',
        lastModified: '2025-12-20T10:00:00Z'
    },
    // --- FAS 3: HÖST/VINTER ---
    {
        id: 'door-sliding-replace',
        type: types_1.TaskType.MAINTENANCE,
        title: 'Byt skjutdörr',
        description: "Montera begagnad skjutd\u00F6rr. Befintlig \u00E4r genomrostad och M\u00C5STE BYTAS.",
        status: types_1.TaskStatus.BLOCKED,
        priority: types_1.Priority.HIGH,
        mechanicalPhase: types_1.MechanicalPhase.P2_RUST,
        phase: 'Fas 3: Höst/Vinter',
        blockers: [{ taskId: 'door-search', reason: 'Måste hitta begagnad dörr först' }],
        estimatedCostMin: 3000,
        estimatedCostMax: 5000,
        actualCost: 0,
        weightKg: 0,
        costType: types_1.CostType.INVESTMENT,
        difficultyLevel: 'Medium',
        requiredTools: ['Hylsnycklar', 'Skruvdragare', 'Domkraft', 'Hjälp (dörren är tung!)'],
        tags: ['Dörrar', 'Kaross', 'Stort jobb'],
        links: [],
        comments: [],
        attachments: [],
        subtasks: [
            { id: 'st-sdoor-1', title: 'Dokumentera kablar', completed: false },
            { id: 'st-sdoor-2', title: 'Demontera gammal dörr', completed: false },
            { id: 'st-sdoor-3', title: 'Montera ny dörr', completed: false }
        ],
        created: '2025-12-20T10:00:00Z',
        lastModified: '2025-12-20T10:00:00Z'
    },
    {
        id: 'door-driver-replace',
        type: types_1.TaskType.MAINTENANCE,
        title: 'Byt förardörr',
        description: "Montera begagnad f\u00F6rard\u00F6rr. Nederkant helt genomrostad.",
        status: types_1.TaskStatus.BLOCKED,
        priority: types_1.Priority.HIGH,
        mechanicalPhase: types_1.MechanicalPhase.P2_RUST,
        phase: 'Fas 3: Höst/Vinter',
        blockers: [{ taskId: 'door-search', reason: 'Måste hitta begagnad dörr först' }],
        estimatedCostMin: 2000,
        estimatedCostMax: 3500,
        actualCost: 0,
        weightKg: 0,
        costType: types_1.CostType.INVESTMENT,
        difficultyLevel: 'Medium',
        requiredTools: ['Hylsnycklar', 'Skruvdragare'],
        tags: ['Dörrar', 'Kaross'],
        links: [],
        comments: [],
        attachments: [],
        subtasks: [],
        created: '2025-12-20T10:00:00Z',
        lastModified: '2025-12-20T10:00:00Z'
    },
    {
        id: 'rust-beam-weld',
        type: types_1.TaskType.MAINTENANCE,
        title: 'Svetsa underredsbalk',
        description: "Reparera rostskadad tv\u00E4rbalk under chassi. \"B\u00E4ttre \u00E4n befarat\" - lokaliserat.",
        status: types_1.TaskStatus.TODO,
        priority: types_1.Priority.MEDIUM,
        mechanicalPhase: types_1.MechanicalPhase.P2_RUST,
        phase: 'Fas 3: Höst/Vinter',
        estimatedCostMin: 500,
        estimatedCostMax: 2000,
        actualCost: 0,
        weightKg: 1,
        costType: types_1.CostType.INVESTMENT,
        difficultyLevel: 'Expert',
        requiredTools: ['MIG-svets', 'Vinkelslip', 'Plåtsax', 'Rostskydd'],
        tags: ['Rost', 'Svets', 'Underrede', 'Struktur'],
        links: [],
        comments: [],
        attachments: [],
        subtasks: [
            { id: 'st-beam-1', title: 'Rengör och bedöm', completed: false },
            { id: 'st-beam-2', title: 'Skär bort dålig plåt', completed: false },
            { id: 'st-beam-3', title: 'Svetsa ny plåt', completed: false },
            { id: 'st-beam-4', title: 'Rostskydda', completed: false }
        ],
        created: '2025-12-20T10:00:00Z',
        lastModified: '2025-12-20T10:00:00Z'
    },
    {
        id: 'el-victron-system',
        type: types_1.TaskType.BUILD,
        title: 'Installera komplett Victron-elsystem',
        description: "Uppgradera till professionellt Victron-baserat elsystem.\n\n**Komponenter:**\n- Victron SmartShunt\n- Victron MPPT 100/50\n- Victron Orion-Tr Smart (DC-DC)\n- 2x 200W solpaneler",
        status: types_1.TaskStatus.TODO,
        priority: types_1.Priority.MEDIUM,
        buildPhase: types_1.BuildPhase.B2_SYSTEMS,
        phase: 'Fas 3: Höst/Vinter',
        estimatedCostMin: 12000,
        estimatedCostMax: 20000,
        actualCost: 0,
        weightKg: 30,
        costType: types_1.CostType.INVESTMENT,
        difficultyLevel: 'Expert',
        requiredTools: ['Krympverktyg', 'Multimeter', 'Kabelsax', 'Skruvdragare'],
        tags: ['El', 'Victron', 'Sol', 'Uppgradering'],
        links: [{ id: 'l-vic-1', title: 'Victron dokumentation', url: 'https://www.victronenergy.com' }],
        comments: [],
        attachments: [],
        subtasks: [
            { id: 'st-vic-1', title: 'Rita komplett elschema', completed: false },
            { id: 'st-vic-2', title: 'Beställ Victron-komponenter', completed: false },
            { id: 'st-vic-3', title: 'Montera solpaneler', completed: false },
            { id: 'st-vic-4', title: 'Installera MPPT', completed: false },
            { id: 'st-vic-5', title: 'Testa och dokumentera', completed: false }
        ],
        decisionOptions: [
            { id: 'vic-opt-1', title: 'Bas: 200W sol + grundsystem', description: 'MPPT 75/15, SmartShunt.', costRange: '5 000-7 000 kr', pros: ['Billigast'], cons: ['Ingen DC-DC', 'Ingen inverter'] },
            { id: 'vic-opt-2', title: 'Standard: 400W sol + DC-DC + inverter', description: 'MPPT 100/50, Orion DC-DC, Phoenix 800W.', costRange: '12 000-16 000 kr', pros: ['Komplett system', 'Klarar kompressorkyl'], cons: ['Medelkostnad'], recommended: true }
        ],
        created: '2025-12-20T10:00:00Z',
        lastModified: '2025-12-20T10:00:00Z'
    },
    {
        id: 'motor-evaluation',
        type: types_1.TaskType.IDEA,
        title: 'Utvärdera motor efter sommarkörning',
        description: "Efter sommarens k\u00F6rning - beslut om motorns framtid baserat p\u00E5 oljef\u00F6rbrukning, startbeteende, effekt.",
        status: types_1.TaskStatus.IDEA,
        priority: types_1.Priority.LOW,
        phase: 'Fas 3: Höst/Vinter',
        estimatedCostMin: 0,
        estimatedCostMax: 30000,
        actualCost: 0,
        weightKg: 0,
        costType: types_1.CostType.INVESTMENT,
        difficultyLevel: 'Expert',
        tags: ['Motor', 'Beslut', 'Framtid'],
        links: [],
        comments: [],
        attachments: [],
        subtasks: [],
        decisionOptions: [
            { id: 'mot-opt-1', title: 'Behåll och serva', description: 'Om motorn håller - investera i kamrem, vattenpump.', costRange: '10 000 - 15 000 kr', pros: ['Känd motor'], cons: ['Svag (75hk)'] },
            { id: 'mot-opt-2', title: 'Dieselkonvertering (D24)', description: 'Byt till Volvo D24/D24T.', costRange: '15 000 - 30 000 kr', pros: ['Mer moment', 'Bättre bränsle'], cons: ['Stort jobb'], recommended: true }
        ],
        created: '2025-12-20T10:00:00Z',
        lastModified: '2025-12-20T10:00:00Z'
    },
    // === KOMPLETTERING: SAKNADE OMRÅDEN FRÅN INSPEKTION ===
    // --- BAKSIDA (10 anmärkningar) ---
    {
        id: 'rear-fixes',
        type: types_1.TaskType.MAINTENANCE,
        title: 'Fixa baksida (baklyktor + rost + svetsar)',
        description: "Samling av alla \u00E5tg\u00E4rder p\u00E5 baksidan identifierade vid inspektion.\n\n**KRITISKT \u26A1 (BESIKTNING):**\n- ID 41: Positionsljus bak fungerar EJ \u2192 Fixa kabeldragning\n\n**ROST & KOSMETIK:**\n- ID 33-35: Rostgenomslag + lacksl\u00E4pp vid bakf\u00F6nster\n- ID 36: Kraftigt rostangrepp profilst\u00E5l (boxf\u00E4ste)\n- ID 37-38: Skruvar saknas + lacksl\u00E4pp v\u00E4nster baklykta\n- ID 40: Bristf\u00E4lliga svetsar vid igensvetsad d\u00F6rr\n\n**\u00D6VRIGT:**\n- ID 39: Gummitejp d\u00F6ljer ok\u00E4nt skick \u2192 Inspektera!\n- ID 42: \u00D6ppet in mot baklyktorna inifr\u00E5n (oavslutat arbete)\n\n**REFERENS:** Se inspektionsdata-elton.json omr\u00E5de 3",
        status: types_1.TaskStatus.TODO,
        priority: types_1.Priority.HIGH, // Baklyktor är besiktningsrelevant!
        mechanicalPhase: types_1.MechanicalPhase.P2_RUST,
        phase: 'Fas 2: Sommar',
        estimatedCostMin: 500,
        estimatedCostMax: 1500,
        actualCost: 0,
        weightKg: 0,
        costType: types_1.CostType.OPERATION,
        difficultyLevel: 'Medium',
        requiredTools: ['Multimeter', 'Lödkolv', 'Stålborste', 'Rostomvandlare'],
        tags: ['Rost', 'El', 'Baksida', 'Besiktning'],
        links: [],
        comments: [{ id: 'c-rear-1', text: 'Baklyktor måste fungera för besiktning!', createdAt: '2025-12-20', author: 'ai' }],
        attachments: [],
        subtasks: [
            { id: 'st-rear-1', title: '⚡ Fixa positionsljus bak (ID 41)', completed: false },
            { id: 'st-rear-2', title: 'Montera saknade skruvar baklykta (ID 37)', completed: false },
            { id: 'st-rear-3', title: 'Behandla rost vid bakfönster (ID 33-35)', completed: false },
            { id: 'st-rear-4', title: 'Behandla profilstål boxfäste (ID 36)', completed: false },
            { id: 'st-rear-5', title: 'Inspektera under gummitejp (ID 39)', completed: false },
            { id: 'st-rear-6', title: 'Täta in mot baklyktorna (ID 42)', completed: false }
        ],
        created: '2025-12-20T19:00:00Z',
        lastModified: '2025-12-20T19:00:00Z'
    },
    // --- PASSAGERARDÖRR (2 kritiska punkter) ---
    {
        id: 'passenger-door-fixes',
        type: types_1.TaskType.MAINTENANCE,
        title: 'Fixa passagerardörr (hål + justering)',
        description: "Passagerard\u00F6rren \u00E4r MEST ROSTFRI d\u00F6rr p\u00E5 bilen, men har 2 problem.\n\n**S\u00C4KERHET \uD83D\uDD27:**\n- ID 59: H\u00E5l och skador i pl\u00E5ten vid insteg \u2192 Svetsa/lappa\n\n**L\u00C4CKAGE:**\n- ID 60: D\u00F6rren l\u00E4cker (vatten rinner in) \u2192 Justera g\u00E5ngj\u00E4rn + t\u00E4tningar\n\n**POSITIVT:**\n- \u00D6verkant och f\u00F6nsteromr\u00E5de fint skick\n- N\u00E4stan helt rostfri (!)\n- Gummilister OK\n\n**Metod:**\n1. Svetsa/lappa h\u00E5l i insteg\n2. Justera g\u00E5ngj\u00E4rn f\u00F6r b\u00E4ttre t\u00E4tning\n3. Kontrollera/byt gummilister om n\u00F6dv\u00E4ndigt",
        status: types_1.TaskStatus.TODO,
        priority: types_1.Priority.MEDIUM,
        mechanicalPhase: types_1.MechanicalPhase.P2_RUST,
        phase: 'Fas 2: Sommar',
        estimatedCostMin: 300,
        estimatedCostMax: 1000,
        actualCost: 0,
        weightKg: 0,
        costType: types_1.CostType.OPERATION,
        difficultyLevel: 'Medium',
        requiredTools: ['MIG-svets', 'Skiftnyckel', 'Gummitätning'],
        tags: ['Dörrar', 'Svets', 'Läckage'],
        links: [],
        comments: [{ id: 'c-pass-1', text: 'Denna dörr är i bäst skick - värd att reparera!', createdAt: '2025-12-20', author: 'ai' }],
        attachments: [],
        subtasks: [
            { id: 'st-pass-1', title: '🔧 Svetsa/lappa hål i insteg (ID 59)', completed: false },
            { id: 'st-pass-2', title: 'Justera gångjärn (ID 60)', completed: false },
            { id: 'st-pass-3', title: 'Kontrollera tätningar', completed: false }
        ],
        created: '2025-12-20T19:00:00Z',
        lastModified: '2025-12-20T19:00:00Z'
    },
    // --- FRAMSIDA & HJULHUS (6 punkter) ---
    {
        id: 'front-fixes',
        type: types_1.TaskType.MAINTENANCE,
        title: 'Fixa framsida & hjulhus (rost + detaljer)',
        description: "Diverse \u00E5tg\u00E4rder p\u00E5 framsidan.\n\n**ROST:**\n- ID 64: Bristf\u00E4llig lagning hjulhusgolv (gammal pl\u00E5t kvar) \u2192 Rensa/t\u00E4ta\n- ID 65: Rostgenomslag nederkant framf\u00F6nster\n- ID 66: Rostangrepp vid luftintag\n- ID 68: Rost + lacksl\u00E4pp under vindruta\n\n**KOSMETIK:**\n- ID 67: Fult spackel vid blinkers\n- ID 69: Radioantennen sitter l\u00F6st \u2192 Dra \u00E5t\n\n**POSITIVT:**\n- Lyktor och blinkers nyligen restaurerade (rostfria!)\n\n**Metod:**\nRostbehandling + kosmetiska fixar. Ej akut men b\u00F6r g\u00F6ras.",
        status: types_1.TaskStatus.TODO,
        priority: types_1.Priority.LOW,
        mechanicalPhase: types_1.MechanicalPhase.P2_RUST,
        phase: 'Fas 3: Höst/Vinter',
        estimatedCostMin: 400,
        estimatedCostMax: 1000,
        actualCost: 0,
        weightKg: 0,
        costType: types_1.CostType.OPERATION,
        difficultyLevel: 'Easy',
        requiredTools: ['Stålborste', 'Rostomvandlare', 'Spackel', 'Skruvdragare'],
        tags: ['Rost', 'Framsida', 'Kosmetik'],
        links: [],
        comments: [],
        attachments: [],
        subtasks: [
            { id: 'st-front-1', title: 'Rensa gammal plåt hjulhus (ID 64)', completed: false },
            { id: 'st-front-2', title: 'Behandla rost framfönster (ID 65)', completed: false },
            { id: 'st-front-3', title: 'Behandla rost luftintag (ID 66)', completed: false },
            { id: 'st-front-4', title: 'Behandla rost under vindruta (ID 68)', completed: false },
            { id: 'st-front-5', title: 'Fixa antenn (ID 69)', completed: false }
        ],
        created: '2025-12-20T19:00:00Z',
        lastModified: '2025-12-20T19:00:00Z'
    },
    // --- INTERIÖR & FÖRARHYTT (4 punkter) ---
    {
        id: 'interior-fixes',
        type: types_1.TaskType.MAINTENANCE,
        title: 'Fixa interiör (instrument + fläkt + mattor)',
        description: "St\u00E4da upp i f\u00F6rarhytten.\n\n**\u00C5TG\u00C4RDER:**\n- ID 86: Ta bort eftermonterade instrument som ej fungerar\n- ID 87: Fixa kup\u00E9fl\u00E4kt (d\u00E5lig effekt, knappar saknas)\n- ID 88: Byt golvmattor\n- ID 89: Montera om lister (sitter d\u00E5ligt)\n\n**PRIORITET:**\nEj akut, men f\u00F6rb\u00E4ttrar k\u00F6rupplevelsen.\n\n**Kostnad:**\nMest DIY-arbete, nya mattor + eventuellt fl\u00E4ktreglage.",
        status: types_1.TaskStatus.TODO,
        priority: types_1.Priority.LOW,
        buildPhase: types_1.BuildPhase.B3_INTERIOR,
        phase: 'Fas 3: Höst/Vinter',
        estimatedCostMin: 200,
        estimatedCostMax: 800,
        actualCost: 0,
        weightKg: 0,
        costType: types_1.CostType.OPERATION,
        difficultyLevel: 'Easy',
        requiredTools: ['Skruvdragare', 'Plastverktyg', 'Multimeter'],
        tags: ['Interiör', 'Komfort', 'DIY'],
        links: [],
        comments: [],
        attachments: [],
        subtasks: [
            { id: 'st-int-1', title: 'Ta bort eftermonterade instrument (ID 86)', completed: false },
            { id: 'st-int-2', title: 'Fixa/byt kupéfläkt (ID 87)', completed: false },
            { id: 'st-int-3', title: 'Byt golvmattor (ID 88)', completed: false },
            { id: 'st-int-4', title: 'Montera om lister (ID 89)', completed: false }
        ],
        created: '2025-12-20T19:00:00Z',
        lastModified: '2025-12-20T19:00:00Z'
    },
    // --- EXTRA ROSTBEHANDLING (delvis täckta områden) ---
    {
        id: 'cosmetic-rust-fixes',
        type: types_1.TaskType.MAINTENANCE,
        title: 'Kosmetiska rostfixar (hela bilen)',
        description: "Samling av alla mindre rostpunkter som inte t\u00E4cks av andra tasks.\n\n**V\u00C4NSTER SIDA:**\n- ID 18-19: Bristf\u00E4lliga svetsar (2 platser)\n- ID 20-21: Lacksl\u00E4pp + rost under f\u00F6nster\n- ID 22: F\u00F6nster sitter l\u00F6st \u2192 sp\u00E4nna om\n- ID 23: Spricka plastdetalj framf\u00F6r f\u00F6nster\n- ID 24-27: Diverse rostgenomslag (sk\u00E4rm, bakdel, vertikals\u00F6m)\n\n**H\u00D6GER SIDA:**\n- ID 44: Tanklock (bensinm\u00E4rken + lack)\n- ID 45: Skrapskador hjulsk\u00E4rm\n- ID 46-47: Spackel + rost framf\u00F6r bakd\u00E4ck\n- ID 51: Fuktskada b\u00E4nkskiva (inuti!)\n- ID 52: List runt skjutd\u00F6rr trasig\n- ID 53-54: Halvf\u00E4rdig svetsning bakom framhjul\n\n**TAK:**\n- ID 1-7: Diverse sprickor + lacksl\u00E4pp (ut\u00F6ver huvudt\u00E4tning)\n\n**STRATEGI:**\nDetta \u00E4r L\u00C5GPRIORITERAT - g\u00F6r n\u00E4r tid/budget finns. Dokumenterat men ej akut.",
        status: types_1.TaskStatus.TODO,
        priority: types_1.Priority.LOW,
        mechanicalPhase: types_1.MechanicalPhase.P2_RUST,
        phase: 'Backlog',
        estimatedCostMin: 1000,
        estimatedCostMax: 3000,
        actualCost: 0,
        weightKg: 0,
        costType: types_1.CostType.OPERATION,
        difficultyLevel: 'Easy',
        requiredTools: ['Stålborste', 'Rostomvandlare', 'Bättringsfärg', 'Sikaflex'],
        tags: ['Rost', 'Kosmetik', 'Backlog'],
        links: [],
        comments: [{ id: 'c-cosm-1', text: 'Dessa punkter bromsar rosten men är inte akuta.', createdAt: '2025-12-20', author: 'ai' }],
        attachments: [],
        subtasks: [
            { id: 'st-cosm-1', title: 'Behandla alla mindre rostpunkter vänster sida', completed: false },
            { id: 'st-cosm-2', title: 'Behandla rostpunkter höger sida', completed: false },
            { id: 'st-cosm-3', title: 'Fixa fönster som sitter löst (ID 22)', completed: false },
            { id: 'st-cosm-4', title: 'Byt list runt skjutdörr (ID 52)', completed: false },
            { id: 'st-cosm-5', title: 'Fuktskadad bänkskiva (ID 51)', completed: false }
        ],
        created: '2025-12-20T19:00:00Z',
        lastModified: '2025-12-20T19:00:00Z'
    }
];
// =============================================================================
// SERVICE LOG
// =============================================================================
exports.ELTON_SERVICE_LOG = [
    { id: 'h1', date: '2025-12-05', description: 'Köp av Elton! Projektstart.', mileage: '3 362 mil', performer: 'Hanna', type: 'Övrigt' },
    { id: 'h2', date: '2025-11-04', description: 'Bilen ställdes av', mileage: '3 362 mil', performer: 'Transportstyrelsen', type: 'Övrigt' },
    { id: 'h3', date: '2025-08-13', description: 'Besiktning (Godkänd)', mileage: '3 362 mil', performer: 'Bilprovningen', type: 'Besiktning' },
    { id: 'h4', date: '2025-12-20', description: 'Detaljerad inspektion. 68 anmärkningar, 20 positiva.', mileage: '3 362 mil', performer: 'Joel & Hanna', type: 'Övrigt' }
];

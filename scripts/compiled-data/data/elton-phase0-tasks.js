"use strict";
/**
 * Elton Phase 0 Tasks
 * Completed tasks from initial purchase and analysis phase
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ELTON_PHASE0_TASKS = void 0;
var types_1 = require("@/types/types");
exports.ELTON_PHASE0_TASKS = [
    {
        id: 'phase0-purchase',
        type: types_1.TaskType.PURCHASE,
        title: 'Inköp av "Elton"',
        description: "Betalning och \u00E4garbyte via Transportstyrelsen-appen (5/12). Nu \u00E4r den v\u00E5r!\n        \n**K\u00F6pprocess:**\n- Annons: 50 000 SEK\n- Besiktning: 2025-08-13 (godk\u00E4nd)\n- M\u00E4tarst\u00E4llning: 3 362 mil\n- Plats: Ume\u00E5\n\n**Tillst\u00E5nd:**\n- \u00C4garbyte genomf\u00F6rt\n- Registreringsbevis mottaget\n- F\u00F6rs\u00E4kring aktiverad",
        status: types_1.TaskStatus.DONE,
        priority: types_1.Priority.HIGH,
        phase: 'Fas 0: Inköp & Analys',
        estimatedCostMin: 50000,
        estimatedCostMax: 50000,
        actualCost: 50000,
        weightKg: 0,
        costType: types_1.CostType.INVESTMENT,
        tags: ['Inköp', 'Ägarbyte'],
        links: [],
        comments: [],
        attachments: [],
        subtasks: [
            { id: 'st-purch-1', title: 'Besiktningsprotokoll granskat', completed: true },
            { id: 'st-purch-2', title: 'Provkörning genomförd', completed: true },
            { id: 'st-purch-3', title: 'Ägarbyte via app', completed: true },
            { id: 'st-purch-4', title: 'Betalning klar', completed: true }
        ],
        created: '2025-11-01T10:00:00Z',
        lastModified: '2025-12-05T14:30:00Z'
    },
    {
        id: 'phase0-transport',
        type: types_1.TaskType.ADMIN,
        title: 'Hemtransport till Falun',
        description: "Den f\u00F6rsta stora resan. En kritisk transport d\u00E5 bilen inte \u00E4r fullt genomg\u00E5ngen \u00E4n. K\u00F6r f\u00F6rsiktigt!\n        \n**Rutt:**\n- Start: Ume\u00E5\n- M\u00E5l: Falun\n- Distans: ~450 km\n- Ber\u00E4knad k\u00F6rtid: 6-7h (inkl. pauser)\n\n**F\u00F6rberedelser:**\n- Oljeniv\u00E5 kontrollerad\n- D\u00E4cktryck justerat\n- Kylarv\u00E4tska p\u00E5fylld\n- Extra reservdelar medtagna (s\u00E4kring, kabel)\n        \n**K\u00F6rupplevelse:**\n- Maxhastighet ~80 km/h\n- Svag i backar\n- Lite vibrationer vid 70 km/h\n- Bilen kom fram utan problem!",
        status: types_1.TaskStatus.DONE,
        priority: types_1.Priority.HIGH,
        phase: 'Fas 0: Inköp & Analys',
        estimatedCostMin: 1500,
        estimatedCostMax: 1500,
        actualCost: 1500,
        weightKg: 0,
        costType: types_1.CostType.OPERATION,
        difficultyLevel: 'Medium',
        tags: ['Transport', 'Körning'],
        links: [],
        comments: [],
        attachments: [],
        subtasks: [
            { id: 'st-trans-1', title: 'Rutt planerad', completed: true },
            { id: 'st-trans-2', title: 'Bilen förberedd', completed: true },
            { id: 'st-trans-3', title: 'Hemkörning genomförd', completed: true }
        ],
        created: '2025-11-20T08:00:00Z',
        lastModified: '2025-12-06T18:00:00Z'
    },
    {
        id: 'phase0-tires',
        type: types_1.TaskType.PURCHASE,
        title: 'Beställ Däck (Delsbo Däck)',
        description: "Ring D\u00E4ck (Euromaster) i Delsbo p\u00E5 0653-108 95 (eller 070-226 31 51).\n        \n**\u00D6ppettider:**\n- M\u00E5n-Fre 07:30-16:30 (Lunch 12-13)\n- Adress: Sunnansj\u00F6v\u00E4gen 3, Delsbo\n\n**MANUS N\u00C4R DU RINGER:**\n\"Hej, jag har en VW LT31 (Regnr JSN398). Jag beh\u00F6ver 4st \u00C5ret Runt-d\u00E4ck (C-d\u00E4ck) monterade p\u00E5 min bil. Dimension: 215 R14 C (eller 205 R14 C). Viktigt: De m\u00E5ste ha Alptopp/Sn\u00F6flinga-symbolen (3PMSF) s\u00E5 de \u00E4r lagliga p\u00E5 vintern.\"\n\nOm du inte har nya f\u00E4lgar: \"Montering p\u00E5 bilens originalf\u00E4lgar.\"\n\n**Best\u00E4llt:**\n- 4x Continental VanContact 4Season 215 R14 C\n- 3PMSF-godk\u00E4nda\n- Monterade + balanserade",
        status: types_1.TaskStatus.DONE,
        priority: types_1.Priority.HIGH,
        phase: 'Fas 0: Inköp & Analys',
        estimatedCostMin: 6000,
        estimatedCostMax: 6000,
        actualCost: 6000,
        weightKg: 60,
        costType: types_1.CostType.INVESTMENT,
        difficultyLevel: 'Easy',
        tags: ['Däck', 'Säkerhet', 'Vinter'],
        links: [
            { id: 'l-tire-1', title: 'Däckab Delsbo', url: 'https://www.dackab.se' }
        ],
        comments: [],
        attachments: [],
        subtasks: [
            { id: 'st-tire-1', title: 'Ring verkstad', completed: true },
            { id: 'st-tire-2', title: 'Boka tid', completed: true },
            { id: 'st-tire-3', title: 'Montering klar', completed: true }
        ],
        created: '2025-11-25T10:00:00Z',
        lastModified: '2025-12-08T15:00:00Z'
    },
    {
        id: 'phase0-inspection',
        type: types_1.TaskType.MAINTENANCE,
        title: 'Inspektion & Provkörning',
        description: "Provk\u00F6rning (S\u00F6ndag 2025-12-01). M\u00E4ta fukt med Meec-m\u00E4tare (kolla reglar), provstarta (kall motor), kolla rost i balkar.\n        \n**Genomf\u00F6rt:**\n- \u2705 Fuktm\u00E4tning med Meec (Taket OK, golv 15-18%)\n- \u2705 Kallstart test (Oktobermorgen -5\u00B0C)\n- \u2705 Inspektionsrapport genererad (88 observationer)\n- \u2705 Fotodokumentation\n- \u2705 Ljudinspelning motor\n\n**Kritiska fynd:**\n- \u26A1 Positionsljus bak fungerar EJ\n- \uD83D\uDD27 H\u00E5l i passagerard\u00F6rr (insteg)\n- \uD83D\uDCA7 Takl\u00F6ck risk (sprickor i t\u00E4tning)\n- \uD83E\uDD80 Omfattande rost f\u00F6rard\u00F6rr\n\n**Positiva fynd:**\n- Motor startar bra (kall)\n- V\u00E4xell\u00E5dan fungerar\n- Ingen bl\u00E5sning avgassystem\n- Rambalkar relativt OK",
        status: types_1.TaskStatus.DONE,
        priority: types_1.Priority.HIGH,
        phase: 'Fas 0: Inköp & Analys',
        estimatedCostMin: 1000,
        estimatedCostMax: 1000,
        actualCost: 1000,
        weightKg: 0,
        costType: types_1.CostType.OPERATION,
        difficultyLevel: 'Medium',
        tags: ['Inspektion', 'Dokumentation'],
        links: [],
        comments: [],
        attachments: [],
        subtasks: [
            { id: 'st-insp-1', title: 'Fuktmätning', completed: true },
            { id: 'st-insp-2', title: 'Provkörning', completed: true },
            { id: 'st-insp-3', title: 'Fotodokumentation', completed: true },
            { id: 'st-insp-4', title: 'Rapport skriven', completed: true }
        ],
        inspectionFindingIds: ['1', '3', '41', '59'], // Länkar till kritiska fynd
        created: '2025-12-01T08:00:00Z',
        lastModified: '2025-12-01T17:00:00Z'
    },
    {
        id: 'phase0-battery',
        type: types_1.TaskType.MAINTENANCE,
        title: 'Installera nytt startbatteri',
        description: "Utan el, ingen bil. Enkelt fixat nu n\u00E4r du hittat r\u00E4tt batteri.\n        \n**Specifikation:**\n- Typ: 12V startbatteri (blysyra)\n- Kapacitet: 100 Ah\n- CCA: 800A (Cold Cranking Amps)\n- Storlek: 353x175x190 mm\n- Pooler: H\u00F6ger +\n\n**Installation:**\n- Gammalt batteri borttaget\n- Polskor rengjorda \n- Nytt batteri installerat\n- Kablar \u00E5tdragna\n- Test: Bilen startar perfekt!\n\n**VIKTIGT:**\nDetta \u00E4r endast STARTbatteriet. Bodelsbatteriet \u00E4r INTE inkopplat \u00E4n (risk f\u00F6r urladdning av start). Det jobbet kommer i Fas 1.",
        status: types_1.TaskStatus.DONE,
        priority: types_1.Priority.HIGH,
        phase: 'Fas 0: Inköp & Analys',
        estimatedCostMin: 1600,
        estimatedCostMax: 1600,
        actualCost: 1600,
        weightKg: 25,
        costType: types_1.CostType.INVESTMENT,
        difficultyLevel: 'Easy',
        requiredTools: ['Skiftnyckel 10mm', 'Handskar', 'Borste för polskor'],
        tags: ['El', 'Batteri', 'Start'],
        links: [],
        comments: [],
        attachments: [],
        subtasks: [
            { id: 'st-bat-1', title: 'Köp batteri', completed: true },
            { id: 'st-bat-2', title: 'Byt batteri', completed: true },
            { id: 'st-bat-3', title: 'Testa start', completed: true }
        ],
        created: '2025-12-03T10:00:00Z',
        lastModified: '2025-12-03T12:00:00Z'
    }
];

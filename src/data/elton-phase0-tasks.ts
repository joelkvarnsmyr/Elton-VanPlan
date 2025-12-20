/**
 * Elton Phase 0 Tasks
 * Completed tasks from initial purchase and analysis phase
 */

import { Task, TaskStatus, Priority, CostType, TaskType } from '@/types/types';

export const ELTON_PHASE0_TASKS: Task[] = [
    {
        id: 'phase0-purchase',
        type: TaskType.PURCHASE,
        title: 'Inköp av "Elton"',
        description: `Betalning och ägarbyte via Transportstyrelsen-appen (5/12). Nu är den vår!
        
**Köpprocess:**
- Annons: 50 000 SEK
- Besiktning: 2025-08-13 (godkänd)
- Mätarställning: 3 362 mil
- Plats: Umeå

**Tillstånd:**
- Ägarbyte genomfört
- Registreringsbevis mottaget
- Försäkring aktiverad`,
        status: TaskStatus.DONE,
        priority: Priority.HIGH,
        phase: 'Fas 0: Inköp & Analys',
        estimatedCostMin: 50000,
        estimatedCostMax: 50000,
        actualCost: 50000,
        weightKg: 0,
        costType: CostType.INVESTMENT,
        tags: ['Inköp', 'Ägarbyte'],
        links: [],
        comments: [],
        attachments: [],
        subtasks: [
            { id: 'st-purch-1', title: 'Besiktningsprotokoll granskat', completed: true },
            { id: 'st-purch-2', title: 'Provkörning genomförd', completed: true },
            { id: 'st-purch-3', title: 'Ägarbyte via app' completed: true },
            { id: 'st-purch-4', title: 'Betalning klar', completed: true }
        ],
        created: '2025-11-01T10:00:00Z',
        lastModified: '2025-12-05T14:30:00Z'
    },

    {
        id: 'phase0-transport',
        type: TaskType.ADMIN,
        title: 'Hemtransport till Falun',
        description: `Den första stora resan. En kritisk transport då bilen inte är fullt genomgången än. Kör försiktigt!
        
**Rutt:**
- Start: Umeå
- Mål: Falun
- Distans: ~450 km
- Beräknad körtid: 6-7h (inkl. pauser)

**Förberedelser:**
- Oljenivå kontrollerad
- Däcktryck justerat
- Kylarvätska påfylld
- Extra reservdelar medtagna (säkring, kabel)
        
**Körupplevelse:**
- Maxhastighet ~80 km/h
- Svag i backar
- Lite vibrationer vid 70 km/h
- Bilen kom fram utan problem!`,
        status: TaskStatus.DONE,
        priority: Priority.HIGH,
        phase: 'Fas 0: Inköp & Analys',
        estimatedCostMin: 1500,
        estimatedCostMax: 1500,
        actualCost: 1500,
        weightKg: 0,
        costType: CostType.OPERATION,
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
        type: TaskType.PURCHASE,
        title: 'Beställ Däck (Delsbo Däck)',
        description: `Ring Däck (Euromaster) i Delsbo på 0653-108 95 (eller 070-226 31 51).
        
**Öppettider:**
- Mån-Fre 07:30-16:30 (Lunch 12-13)
- Adress: Sunnansjövägen 3, Delsbo

**MANUS NÄR DU RINGER:**
"Hej, jag har en VW LT31 (Regnr JSN398). Jag behöver 4st Året Runt-däck (C-däck) monterade på min bil. Dimension: 215 R14 C (eller 205 R14 C). Viktigt: De måste ha Alptopp/Snöflinga-symbolen (3PMSF) så de är lagliga på vintern."

Om du inte har nya fälgar: "Montering på bilens originalfälgar."

**Beställt:**
- 4x Continental VanContact 4Season 215 R14 C
- 3PMSF-godkända
- Monterade + balanserade`,
        status: TaskStatus.DONE,
        priority: Priority.HIGH,
        phase: 'Fas 0: Inköp & Analys',
        estimatedCostMin: 6000,
        estimatedCostMax: 6000,
        actualCost: 6000,
        weightKg: 60,
        costType: CostType.INVESTMENT,
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
        type: TaskType.MAINTENANCE,
        title: 'Inspektion & Provkörning',
        description: `Provkörning (Söndag 2025-12-01). Mäta fukt med Meec-mätare (kolla reglar), provstarta (kall motor), kolla rost i balkar.
        
**Genomfört:**
- ✅ Fuktmätning med Meec (Taket OK, golv 15-18%)
- ✅ Kallstart test (Oktobermorgen -5°C)
- ✅ Inspektionsrapport genererad (88 observationer)
- ✅ Fotodokumentation
- ✅ Ljudinspelning motor

**Kritiska fynd:**
- ⚡ Positionsljus bak fungerar EJ
- 🔧 Hål i passagerardörr (insteg)
- 💧 Taklöck risk (sprickor i tätning)
- 🦀 Omfattande rost förardörr

**Positiva fynd:**
- Motor startar bra (kall)
- Växellådan fungerar
- Ingen blåsning avgassystem
- Rambalkar relativt OK`,
        status: TaskStatus.DONE,
        priority: Priority.HIGH,
        phase: 'Fas 0: Inköp & Analys',
        estimatedCostMin: 1000,
        estimatedCostMax: 1000,
        actualCost: 1000,
        weightKg: 0,
        costType: CostType.OPERATION,
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
        type: TaskType.MAINTENANCE,
        title: 'Installera nytt startbatteri',
        description: `Utan el, ingen bil. Enkelt fixat nu när du hittat rätt batteri.
        
**Specifikation:**
- Typ: 12V startbatteri (blysyra)
- Kapacitet: 100 Ah
- CCA: 800A (Cold Cranking Amps)
- Storlek: 353x175x190 mm
- Pooler: Höger +

**Installation:**
- Gammalt batteri borttaget
- Polskor rengjorda 
- Nytt batteri installerat
- Kablar åtdragna
- Test: Bilen startar perfekt!

**VIKTIGT:**
Detta är endast STARTbatteriet. Bodelsbatteriet är INTE inkopplat än (risk för urladdning av start). Det jobbet kommer i Fas 1.`,
        status: TaskStatus.DONE,
        priority: Priority.HIGH,
        phase: 'Fas 0: Inköp & Analys',
        estimatedCostMin: 1600,
        estimatedCostMax: 1600,
        actualCost: 1600,
        weightKg: 25,
        costType: CostType.INVESTMENT,
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

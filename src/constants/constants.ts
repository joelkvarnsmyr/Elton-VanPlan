
import { Task, TaskStatus, CostType, VehicleData, ServiceItem, ResourceLink, KnowledgeArticle, Contact, Priority, ShoppingItem, ShoppingItemStatus, VendorOption, Project, PROJECT_PHASES, TaskType, MechanicalPhase, BuildPhase, DifficultyLevel } from '@/types/types';

// --- DEMO DATA (ELTON - JSN398) ---

const ELTON_VEHICLE_DATA: VehicleData = {
  // Legacy Flat Structure (Required for current UI)
  regNo: 'JSN398',
  make: 'Volkswagen',
  model: 'LT 31 (Typ 28/21)',
  year: 1976,
  prodYear: 1976,
  regDate: '1978-02-14', // Alla hjärtans dag!
  status: 'Avställd',
  bodyType: 'Skåp Bostadsinredning',
  passengers: 4, // Förare + 3
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
    code: 'CH' // Kritisk info!
  },
  gearbox: 'Manuell 4-växlad',
  wheels: {
    drive: '2WD Bakhjulsdrift',
    tiresFront: '215R14 C',
    tiresRear: '215R14 C',
    boltPattern: '5x160' // Unikt för LT/Transit
  },
  dimensions: {
    length: 5400,
    width: 2020,
    height: '2500 mm',
    wheelbase: 2500
  },
  weights: {
    curb: 2280, // Tjänstevikt
    total: 3160,
    load: 880, // Maxlast (Bra för vanlife!)
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

  // Enhanced Data
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
          { title: 'Rost i balkar', description: 'Kolla tvärbalkar och domkraftsfästen noga.', urgency: 'Medium' }
      ],
      modificationTips: [
          { title: 'Motorbyte D24', description: 'Populärt att byta till Volvo D24 eller D24T för mer ork.' }
      ],
      maintenanceNotes: 'OBS: 5-siffrig mätare. Mätarställning 3362 mil är troligen 13 362 eller 23 362. Historik bekräftar minst en rollover.'
  }
};

// --- EXEMPLARY SHOPPING ITEMS (With VendorOptions & Status) ---
const ELTON_SHOPPING_ITEMS: ShoppingItem[] = [
    // === RESEARCH STATUS: Multiple options being compared ===
    {
        id: 's1',
        name: 'Kamremssats (Contitech CT637K1)',
        category: 'Reservdelar',
        estimatedCost: 800,
        quantity: '1 st',
        checked: false,
        status: ShoppingItemStatus.RESEARCH,
        linkedTaskId: 'mek-1',
        options: [
            {
                id: 'opt-s1-1',
                store: 'Autodoc',
                articleNumber: '1210452',
                price: 649,
                currency: 'SEK',
                shippingCost: 49,
                totalCost: 698,
                deliveryTimeDays: 5,
                inStock: true,
                url: 'https://www.autodoc.se/contitech/1210452',
                lastPriceCheck: '2025-12-10'
            },
            {
                id: 'opt-s1-2',
                store: 'Mekonomen',
                articleNumber: 'CT637K1',
                price: 995,
                currency: 'SEK',
                shippingCost: 0,
                totalCost: 995,
                deliveryTimeDays: 0, // Hämta direkt
                inStock: true,
                shelfLocation: 'Disk - beställ fram',
                lastPriceCheck: '2025-12-08'
            },
            {
                id: 'opt-s1-3',
                store: 'SKF (Original)',
                articleNumber: 'VKMA01014',
                price: 1250,
                currency: 'SEK',
                shippingCost: 0,
                totalCost: 1250,
                deliveryTimeDays: 2,
                inStock: false,
                lastPriceCheck: '2025-12-05'
            }
        ]
    },

    // === DECIDED STATUS: Option selected, ready to buy ===
    {
        id: 's2',
        name: 'Vattenpump (Metallimpeller)',
        category: 'Reservdelar',
        estimatedCost: 400,
        quantity: '1 st',
        checked: false,
        status: ShoppingItemStatus.DECIDED,
        linkedTaskId: 'mek-1',
        selectedOptionId: 'opt-s2-1', // Best deal selected
        options: [
            {
                id: 'opt-s2-1',
                store: 'Autodoc',
                articleNumber: '2283285',
                price: 289,
                currency: 'SEK',
                shippingCost: 49,
                totalCost: 338,
                deliveryTimeDays: 5,
                inStock: true,
                url: 'https://www.autodoc.se/hepu/2283285',
                lastPriceCheck: '2025-12-10'
            },
            {
                id: 'opt-s2-2',
                store: 'Biltema',
                articleNumber: '33-1542',
                price: 449,
                currency: 'SEK',
                shippingCost: 0,
                totalCost: 449,
                deliveryTimeDays: 0,
                inStock: true,
                shelfLocation: 'Gång 4, Hylla 12',
                lastPriceCheck: '2025-12-09'
            }
        ]
    },

    // === BOUGHT STATUS: Purchased item ===
    {
        id: 's16',
        name: 'Startbatteri (75Ah)',
        category: 'Reservdelar',
        estimatedCost: 1400,
        actualCost: 1299, // Actual purchase price
        quantity: '1 st',
        checked: true, // Legacy checked
        status: ShoppingItemStatus.BOUGHT,
        store: 'Biltema',
        purchaseDate: '2025-12-08',
        linkedTaskId: 'mek-0',
        selectedOptionId: 'opt-s16-1',
        options: [
            {
                id: 'opt-s16-1',
                store: 'Biltema',
                articleNumber: '82-275',
                price: 1299,
                currency: 'SEK',
                shippingCost: 0,
                totalCost: 1299,
                deliveryTimeDays: 0,
                inStock: true,
                shelfLocation: 'Gång 2, Batterier',
                lastPriceCheck: '2025-12-08'
            }
        ]
    },

    // === RESEARCH: Simple item with fewer options ===
    {
        id: 's7',
        name: 'Motorolja 10W-40 (Mineral)',
        category: 'Kemi & Färg',
        estimatedCost: 400,
        quantity: '10 L',
        checked: false,
        status: ShoppingItemStatus.RESEARCH,
        store: 'Biltema',
        linkedTaskId: 'mek-2',
        options: [
            {
                id: 'opt-s7-1',
                store: 'Biltema',
                articleNumber: '36-1285',
                price: 349,
                currency: 'SEK',
                shippingCost: 0,
                totalCost: 349,
                deliveryTimeDays: 0,
                inStock: true,
                shelfLocation: 'Gång 5, Oljor',
                lastPriceCheck: '2025-12-10'
            },
            {
                id: 'opt-s7-2',
                store: 'Jula',
                articleNumber: '580-123',
                price: 379,
                currency: 'SEK',
                shippingCost: 0,
                totalCost: 379,
                deliveryTimeDays: 0,
                inStock: true,
                lastPriceCheck: '2025-12-09'
            }
        ]
    },

    // === Simple item without options (legacy format still works) ===
    {
        id: 's12',
        name: 'Tändstift (Bosch W7DTC)',
        category: 'Reservdelar',
        estimatedCost: 200,
        quantity: '4 st',
        checked: false,
        linkedTaskId: 'mek-2'
    },

    // === VANLIFE BUILD ITEMS ===
    {
        id: 's20',
        name: 'Armaflex Isolering (19mm)',
        category: 'Inredning',
        estimatedCost: 1500,
        quantity: '10 m²',
        checked: false,
        status: ShoppingItemStatus.RESEARCH,
        linkedTaskId: 'build-1',
        options: [
            {
                id: 'opt-s20-1',
                store: 'Bauhaus',
                articleNumber: 'ARM-19-10',
                price: 1299,
                currency: 'SEK',
                shippingCost: 99,
                totalCost: 1398,
                deliveryTimeDays: 3,
                inStock: true,
                lastPriceCheck: '2025-12-10'
            },
            {
                id: 'opt-s20-2',
                store: 'K-Rauta',
                price: 1450,
                currency: 'SEK',
                shippingCost: 0,
                totalCost: 1450,
                deliveryTimeDays: 0,
                inStock: false,
                lastPriceCheck: '2025-12-08'
            }
        ]
    },
    {
        id: 's21',
        name: 'Plywood 12mm (Golv)',
        category: 'Inredning',
        estimatedCost: 800,
        quantity: '3 skivor',
        checked: false,
        status: ShoppingItemStatus.DECIDED,
        selectedOptionId: 'opt-s21-1',
        linkedTaskId: 'build-1',
        options: [
            {
                id: 'opt-s21-1',
                store: 'Byggmax',
                price: 699,
                currency: 'SEK',
                shippingCost: 0,
                totalCost: 699,
                deliveryTimeDays: 0,
                inStock: true,
                shelfLocation: 'Skivhallen',
                lastPriceCheck: '2025-12-10'
            }
        ]
    }
];

// --- EXEMPLARY TASKS (With all new data model features) ---
const ELTON_TASKS: Task[] = [
  // ╔═══════════════════════════════════════════════════════════════╗
  // ║   MECHANICAL TRACK (P0-P3) - Vehicle Foundation              ║
  // ╚═══════════════════════════════════════════════════════════════╝

  // === P0: AKUT & SÄKERHET ===
  {
    id: 'admin-1',
    type: TaskType.ADMIN,
    title: 'Försäkra & Ställ på',
    description: 'Ring försäkringsbolag. Kolla veteranförsäkring (Folksam/IF). Ställ på via Transportstyrelsen.',
    status: TaskStatus.DONE, // Completed!
    priority: Priority.HIGH,
    mechanicalPhase: MechanicalPhase.P0_ACUTE,
    phase: 'Fas 1: Akut',
    estimatedCostMin: 0,
    estimatedCostMax: 0,
    actualCost: 0,
    weightKg: 0,
    costType: CostType.OPERATION,
    difficultyLevel: 'Easy',
    tags: ['Admin', 'Prio'],
    links: [],
    comments: [
      { id: 'c1', text: 'Veteranförsäkring kostar ca 1500/år hos Folksam', createdAt: '2025-12-06', author: 'user' }
    ],
    attachments: [],
    subtasks: [
      { id: 'st1', title: 'Ring Folksam', completed: true },
      { id: 'st2', title: 'Ställ på via Transportstyrelsen', completed: true }
    ],
    created: '2025-12-05T10:00:00Z',
    lastModified: '2025-12-07T14:30:00Z'
  },
  {
    id: 'logistik-1',
    type: TaskType.MAINTENANCE,
    title: 'Hämta bilen (Hemtransport)',
    description: 'Kör försiktigt. Kolla olja/vatten var 10:e mil. Lyssna på framvagn. Ta med reservolja!',
    status: TaskStatus.TODO,
    priority: Priority.HIGH,
    mechanicalPhase: MechanicalPhase.P0_ACUTE,
    phase: 'Fas 1: Akut',
    estimatedCostMin: 1000,
    estimatedCostMax: 1500,
    actualCost: 0,
    weightKg: 0,
    costType: CostType.OPERATION,
    difficultyLevel: 'Medium',
    requiredTools: ['Reservolja', 'Kylarvätska', 'Bogserlina'],
    blockers: [{ taskId: 'admin-1', reason: 'Måste vara försäkrad innan körning' }],
    tags: ['Transport', 'Risk'],
    links: [],
    comments: [],
    attachments: [],
    subtasks: [
      { id: 'st3', title: 'Packa reservvätska', completed: false },
      { id: 'st4', title: 'Kolla däcktryck innan avfärd', completed: false }
    ],
    created: '2025-12-05T10:00:00Z',
    lastModified: '2025-12-05T10:00:00Z'
  },
  {
    id: 'inkop-1',
    type: TaskType.PURCHASE,
    title: 'Byt Däck (Delsbo)',
    description: '215 R14 C (Året runt). Ring Däckab. Bultmönster 5x160 - unikt för LT/Transit!',
    status: TaskStatus.TODO,
    priority: Priority.HIGH,
    mechanicalPhase: MechanicalPhase.P0_ACUTE,
    phase: 'Fas 1: Akut',
    estimatedCostMin: 4000,
    estimatedCostMax: 6000,
    actualCost: 0,
    weightKg: 0,
    costType: CostType.OPERATION,
    difficultyLevel: 'Easy',
    tags: ['Däck', 'Säkerhet'],
    links: [],
    comments: [],
    attachments: [],
    subtasks: [],
    created: '2025-12-05T10:00:00Z',
    lastModified: '2025-12-05T10:00:00Z'
  },
  {
    id: 'mek-0',
    type: TaskType.MAINTENANCE,
    title: 'Byt Startbatteri',
    description: 'Det gamla är slut. 75Ah eller större. Köpt på Biltema!',
    status: TaskStatus.DONE, // Completed with purchased item
    priority: Priority.HIGH,
    mechanicalPhase: MechanicalPhase.P0_ACUTE,
    phase: 'Fas 1: Akut',
    estimatedCostMin: 1200,
    estimatedCostMax: 1600,
    actualCost: 1299, // Actual cost from purchase
    weightKg: 20,
    costType: CostType.OPERATION,
    difficultyLevel: 'Easy',
    requiredTools: ['Skiftnyckel 13mm', 'Polsmorning'],
    tags: ['El'],
    links: [],
    comments: [],
    attachments: [],
    subtasks: [],
    created: '2025-12-05T10:00:00Z',
    lastModified: '2025-12-08T16:00:00Z'
  },

  // === P1: MOTORRÄDDNING ===
  {
    id: 'mek-1',
    type: TaskType.MAINTENANCE,
    title: 'Kamrem & Vattenpump',
    description: 'Kritisk! Audi CH-motor 2.0L är interference. Byt även spännrulle och kylarvätska.',
    status: TaskStatus.TODO,
    priority: Priority.HIGH,
    mechanicalPhase: MechanicalPhase.P1_ENGINE,
    phase: 'Fas 2: Mekanisk Säkerhet',
    estimatedCostMin: 5000,
    estimatedCostMax: 7000,
    actualCost: 0,
    weightKg: 2,
    costType: CostType.OPERATION,
    difficultyLevel: 'Expert',
    requiredTools: ['Momentnyckel', 'Kamremsverktyg', 'Avdragare', 'Vevaxellåsning'],
    tags: ['Verkstad', 'Motor', 'Kritisk'],
    links: [
      { id: 'l1', title: 'VW LT Kamremsbyte guide', url: 'https://youtube.com/watch?v=example' }
    ],
    comments: [
      { id: 'c2', text: 'Viktigt: Contitech CT637K1 passar. SKF VKMA01014 är originalkvalitet.', createdAt: '2025-12-06', author: 'ai' }
    ],
    attachments: [],
    subtasks: [
      { id: 'st5', title: 'Beställ kamremssats', completed: false },
      { id: 'st6', title: 'Beställ vattenpump', completed: false },
      { id: 'st7', title: 'Boka verkstad', completed: false }
    ],
    created: '2025-12-05T10:00:00Z',
    lastModified: '2025-12-10T09:00:00Z'
  },
  {
    id: 'mek-2',
    type: TaskType.MAINTENANCE,
    title: 'Stor Service (Vätskor)',
    description: 'Olja (10W-40 Mineral), Filter, Tändstift (Bosch W7DTC), Luftfilter. OBS: GL-4 olja i lådan - aldrig GL-5!',
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
    mechanicalPhase: MechanicalPhase.P1_ENGINE,
    phase: 'Fas 2: Mekanisk Säkerhet',
    estimatedCostMin: 1500,
    estimatedCostMax: 2000,
    actualCost: 0,
    weightKg: 5,
    costType: CostType.OPERATION,
    difficultyLevel: 'Easy',
    requiredTools: ['Oljefilteravdragare', 'Spärrskaft', 'Uppsamlingskärl', 'Tändstiftsnyckel'],
    tags: ['Service', 'DIY'],
    links: [],
    comments: [],
    attachments: [],
    subtasks: [
      { id: 'st8', title: 'Byt motorolja', completed: false },
      { id: 'st9', title: 'Byt oljefilter', completed: false },
      { id: 'st10', title: 'Byt luftfilter', completed: false },
      { id: 'st11', title: 'Byt tändstift', completed: false }
    ],
    created: '2025-12-05T10:00:00Z',
    lastModified: '2025-12-05T10:00:00Z'
  },
  {
    id: 'mek-1b',
    type: TaskType.MAINTENANCE,
    title: 'Kylsystem Genomgång',
    description: 'Trycktesta, byt slangar vid behov. Spola systemet. Fyll med G11 blå glykol.',
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
    mechanicalPhase: MechanicalPhase.P1_ENGINE,
    phase: 'Fas 2: Mekanisk Säkerhet',
    estimatedCostMin: 500,
    estimatedCostMax: 1500,
    actualCost: 0,
    weightKg: 0,
    costType: CostType.OPERATION,
    difficultyLevel: 'Medium',
    requiredTools: ['Trycktestare', 'Slangklämmor'],
    tags: ['Kylsystem'],
    links: [],
    comments: [],
    attachments: [],
    subtasks: [],
    created: '2025-12-10T10:00:00Z',
    lastModified: '2025-12-10T10:00:00Z'
  },

  // === P2: ROST & KAROSS ===
  {
    id: 'mek-3',
    type: TaskType.MAINTENANCE,
    title: 'Rostlaga Balk & Dörr',
    description: 'Fixa yttre balk och skjutdörrens nederkant. Måste vara tätt innan isolering. Kan kräva plåtarbete.',
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
    mechanicalPhase: MechanicalPhase.P2_RUST,
    phase: 'Fas 3: Kaross & Rost',
    estimatedCostMin: 500,
    estimatedCostMax: 10000,
    actualCost: 0,
    weightKg: 5,
    costType: CostType.INVESTMENT,
    difficultyLevel: 'Expert',
    requiredTools: ['MIG-svets', 'Vinkelslip', 'Plåtsax', 'Brottdorn'],
    tags: ['Rost', 'Kaross', 'Kritisk'],
    links: [],
    comments: [
      { id: 'c3', text: 'Viktigt att fixa detta INNAN isolering - annars kommer fukt fastna innanför.', createdAt: '2025-12-07', author: 'ai' }
    ],
    attachments: [],
    subtasks: [
      { id: 'st12', title: 'Inspektera undersida', completed: false },
      { id: 'st13', title: 'Markera alla rostställen', completed: false },
      { id: 'st14', title: 'Boka rostverkstad alt. gör själv', completed: false }
    ],
    created: '2025-12-05T10:00:00Z',
    lastModified: '2025-12-07T12:00:00Z'
  },
  {
    id: 'mek-3b',
    type: TaskType.MAINTENANCE,
    title: 'Underredsbehandling',
    description: 'Tectyl eller Dinitrol. Hela undersidan efter rostlagning är klar.',
    status: TaskStatus.BLOCKED,
    priority: Priority.MEDIUM,
    mechanicalPhase: MechanicalPhase.P2_RUST,
    phase: 'Fas 3: Kaross & Rost',
    blockers: [{ taskId: 'mek-3', reason: 'Måste rostlaga först' }],
    estimatedCostMin: 2000,
    estimatedCostMax: 5000,
    actualCost: 0,
    weightKg: 0,
    costType: CostType.INVESTMENT,
    difficultyLevel: 'Medium',
    requiredTools: ['Högtryckstvätt', 'Tryckluft', 'Dinitrolpistol'],
    tags: ['Rost', 'Underrede'],
    links: [],
    comments: [],
    attachments: [],
    subtasks: [],
    created: '2025-12-10T10:00:00Z',
    lastModified: '2025-12-10T10:00:00Z'
  },

  // === P3: LÖPANDE UNDERHÅLL ===
  {
    id: 'mek-4',
    type: TaskType.MAINTENANCE,
    title: 'Smörj Spindelbultar (Kingpins)',
    description: 'LT-specifikt! Smörj var 500:e mil. Om de skär fast krävs press och värme.',
    status: TaskStatus.TODO,
    priority: Priority.LOW,
    mechanicalPhase: MechanicalPhase.P3_FUTURE,
    phase: 'Fas 3: Kaross & Rost',
    estimatedCostMin: 0,
    estimatedCostMax: 100,
    actualCost: 0,
    weightKg: 0,
    costType: CostType.OPERATION,
    difficultyLevel: 'Easy',
    requiredTools: ['Smörjspruta', 'Domkraft'],
    sprint: 'Löpande', // Recurring task
    tags: ['Underhåll', 'LT-specifikt'],
    links: [],
    comments: [],
    attachments: [],
    subtasks: [],
    created: '2025-12-10T10:00:00Z',
    lastModified: '2025-12-10T10:00:00Z'
  },

  // ╔═══════════════════════════════════════════════════════════════╗
  // ║   BUILD TRACK (B0-B4) - Vanlife Conversion                   ║
  // ╚═══════════════════════════════════════════════════════════════╝

  // === B0: RIVNING & FÖRBEREDELSE ===
  {
    id: 'build-0',
    type: TaskType.BUILD,
    title: 'Riva Gammal Inredning',
    description: 'Ta bort befintliga hyllor, paneler och gammal isolering. Dokumentera vad som finns!',
    status: TaskStatus.IDEA, // Research phase
    priority: Priority.LOW,
    buildPhase: BuildPhase.B0_DEMO,
    phase: 'Fas 4: Inredning & Finish',
    estimatedCostMin: 0,
    estimatedCostMax: 500,
    actualCost: 0,
    weightKg: -50, // Negative = weight removed!
    costType: CostType.INVESTMENT,
    difficultyLevel: 'Easy',
    requiredTools: ['Kofot', 'Skyddsglas', 'Dammask'],
    tags: ['Vanlife', 'Rivning'],
    links: [],
    comments: [],
    attachments: [],
    subtasks: [],
    decisionOptions: [
      {
        id: 'opt1',
        title: 'Behåll originalpanel',
        description: 'Montera isolering bakom befintlig panel om den är i gott skick.',
        costRange: '0 kr',
        pros: ['Snabbt', 'Behåller originalutseende'],
        cons: ['Sämre isolering', 'Kan dölja rost']
      },
      {
        id: 'opt2',
        title: 'Total rivning',
        description: 'Ta bort allt ner till plåten.',
        costRange: '500-1000 kr (säckar)',
        pros: ['Full kontroll', 'Kan inspektera rost', 'Maximal isolering'],
        cons: ['Mer jobb', 'Måste bygga nytt'],
        recommended: true
      }
    ],
    created: '2025-12-10T10:00:00Z',
    lastModified: '2025-12-10T10:00:00Z'
  },

  // === B1: SKAL & ISOLERING ===
  {
    id: 'build-1',
    type: TaskType.BUILD,
    title: 'Isolering & Golv',
    description: 'Armaflex 19mm på plåt (väggar/tak). Plywoodgolv 12mm. Rostskydda golvet inifrån först!',
    status: TaskStatus.BLOCKED,
    priority: Priority.MEDIUM,
    buildPhase: BuildPhase.B1_SHELL,
    phase: 'Fas 4: Inredning & Finish',
    blockers: [
      { taskId: 'mek-3', reason: 'Måste svetsa balkar innan isolering' },
      { taskId: 'build-0', reason: 'Riv gammal inredning först' }
    ],
    estimatedCostMin: 3000,
    estimatedCostMax: 5000,
    actualCost: 0,
    weightKg: 50,
    costType: CostType.INVESTMENT,
    difficultyLevel: 'Medium',
    requiredTools: ['Mattkniv', 'Kontaktlim', 'Sticksåg', 'Måttband'],
    tags: ['Vanlife', 'Isolering'],
    links: [],
    comments: [
      { id: 'c4', text: 'Armaflex är självhäftande men extra kontaktlim på vertikala ytor rekommenderas.', createdAt: '2025-12-08', author: 'ai' }
    ],
    attachments: [],
    subtasks: [
      { id: 'st15', title: 'Rengör plåtytor', completed: false },
      { id: 'st16', title: 'Rostskydda golv', completed: false },
      { id: 'st17', title: 'Montera Armaflex väggar', completed: false },
      { id: 'st18', title: 'Montera Armaflex tak', completed: false },
      { id: 'st19', title: 'Lägg plywoodgolv', completed: false }
    ],
    created: '2025-12-05T10:00:00Z',
    lastModified: '2025-12-08T14:00:00Z'
  },

  // === B2: SYSTEM (EL/VATTEN) ===
  {
    id: 'build-2',
    type: TaskType.BUILD,
    title: 'Dra El & Vatten (Infrastruktur)',
    description: 'Dra tomrör för 12V (4mm²) och slangar (10mm) innan väggarna sätts upp. Planera uttag!',
    status: TaskStatus.BLOCKED,
    priority: Priority.MEDIUM,
    buildPhase: BuildPhase.B2_SYSTEMS,
    phase: 'Fas 4: Inredning & Finish',
    blockers: [{ taskId: 'build-1', reason: 'Isolering måste vara klar först' }],
    estimatedCostMin: 1000,
    estimatedCostMax: 3000,
    actualCost: 0,
    weightKg: 10,
    costType: CostType.INVESTMENT,
    difficultyLevel: 'Medium',
    requiredTools: ['Kabelgenomföringar', 'Strips', 'Kabelsax'],
    tags: ['El', 'Vatten', 'Planering'],
    links: [],
    comments: [],
    attachments: [],
    subtasks: [
      { id: 'st20', title: 'Rita elschema', completed: false },
      { id: 'st21', title: 'Beräkna kabeldimensioner', completed: false },
      { id: 'st22', title: 'Dra huvudkablar', completed: false }
    ],
    created: '2025-12-05T10:00:00Z',
    lastModified: '2025-12-05T10:00:00Z'
  },
  {
    id: 'build-2b',
    type: TaskType.IDEA,
    title: 'Solcellssystem',
    description: 'Research: 200W panel räcker för LED + laptop. 400W om kylskåp.',
    status: TaskStatus.IDEA,
    priority: Priority.LOW,
    buildPhase: BuildPhase.B2_SYSTEMS,
    phase: 'Fas 4: Inredning & Finish',
    estimatedCostMin: 5000,
    estimatedCostMax: 15000,
    actualCost: 0,
    weightKg: 25,
    costType: CostType.INVESTMENT,
    difficultyLevel: 'Expert',
    tags: ['El', 'Sol', 'Research'],
    links: [],
    comments: [],
    attachments: [],
    subtasks: [],
    decisionOptions: [
      {
        id: 'sol1',
        title: '200W Baskonfiguration',
        description: '1x200W panel, 100Ah LiFePO4, 30A MPPT',
        costRange: '5 000 - 8 000 kr',
        pros: ['Billigt', 'Enkelt', 'Räcker för grundbehov'],
        cons: ['Ingen marginal', 'Klarar ej kylskåp']
      },
      {
        id: 'sol2',
        title: '400W Komfort',
        description: '2x200W panel, 200Ah LiFePO4, 40A MPPT, Victron',
        costRange: '12 000 - 18 000 kr',
        pros: ['Klarar kompressor-kylskåp', 'Framtidssäkert'],
        cons: ['Dyrare', 'Mer vikt på taket'],
        recommended: true
      }
    ],
    created: '2025-12-10T10:00:00Z',
    lastModified: '2025-12-10T10:00:00Z'
  },

  // === B3: INREDNING ===
  {
    id: 'build-3',
    type: TaskType.BUILD,
    title: 'Bygg Sängstomme',
    description: 'Fast säng bak (140cm bred). Förvaring under. Bygg i 18mm plywood.',
    status: TaskStatus.TODO,
    priority: Priority.LOW,
    buildPhase: BuildPhase.B3_INTERIOR,
    phase: 'Fas 4: Inredning & Finish',
    estimatedCostMin: 1500,
    estimatedCostMax: 3000,
    actualCost: 0,
    weightKg: 40,
    costType: CostType.INVESTMENT,
    difficultyLevel: 'Medium',
    requiredTools: ['Sticksåg', 'Skruvdragare', 'Vinkelmätare'],
    tags: ['Vanlife', 'Snickeri'],
    links: [],
    comments: [],
    attachments: [],
    subtasks: [],
    created: '2025-12-10T10:00:00Z',
    lastModified: '2025-12-10T10:00:00Z'
  },
  {
    id: 'build-3b',
    type: TaskType.BUILD,
    title: 'Köksenhet',
    description: 'Enkel köksmodul: Diskho, gasolspis, förvaring.',
    status: TaskStatus.TODO,
    priority: Priority.LOW,
    buildPhase: BuildPhase.B3_INTERIOR,
    phase: 'Fas 4: Inredning & Finish',
    estimatedCostMin: 2000,
    estimatedCostMax: 5000,
    actualCost: 0,
    weightKg: 30,
    costType: CostType.INVESTMENT,
    difficultyLevel: 'Medium',
    requiredTools: ['Sticksåg', 'Skruvdragare', 'Rörverktyg'],
    tags: ['Vanlife', 'Kök'],
    links: [],
    comments: [],
    attachments: [],
    subtasks: [],
    created: '2025-12-10T10:00:00Z',
    lastModified: '2025-12-10T10:00:00Z'
  },

  // === B4: FINISH & PIFF ===
  {
    id: 'build-4',
    type: TaskType.BUILD,
    title: 'Slutfinish & Detaljer',
    description: 'Lister, LED-belysning, gardiner, slutmontering av uttag.',
    status: TaskStatus.TODO,
    priority: Priority.LOW,
    buildPhase: BuildPhase.B4_FINISH,
    phase: 'Fas 4: Inredning & Finish',
    estimatedCostMin: 1000,
    estimatedCostMax: 3000,
    actualCost: 0,
    weightKg: 5,
    costType: CostType.INVESTMENT,
    difficultyLevel: 'Easy',
    tags: ['Vanlife', 'Finish'],
    links: [],
    comments: [],
    attachments: [],
    subtasks: [],
    created: '2025-12-10T10:00:00Z',
    lastModified: '2025-12-10T10:00:00Z'
  }
];

export const SERVICE_LOG_ITEMS: ServiceItem[] = [
    {
        id: 'h1',
        date: '2025-12-05',
        description: 'Köp av Elton! Projektstart.',
        mileage: '3 362 mil',
        performer: 'Jag',
        type: 'Övrigt'
    },
    {
        id: 'h2',
        date: '2025-11-04',
        description: 'Bilen ställdes av',
        mileage: '3 362 mil',
        performer: 'Transportstyrelsen',
        type: 'Övrigt'
    },
    {
        id: 'h3',
        date: '2025-08-13',
        description: 'Besiktning (Godkänd)',
        mileage: '3 362 mil',
        performer: 'Bilprovningen',
        type: 'Besiktning'
    },
    {
        id: 'h4',
        date: '2019-11-08',
        description: 'Annonserad (25 000 mil angivet)',
        mileage: '25 000 mil',
        performer: 'Säljare',
        type: 'Övrigt'
    }
];

// --- KNOWLEDGE INJECTION ---

export const CRITICAL_WARNINGS = [
    {
        id: 'gl4-oil',
        condition: (v: VehicleData) => v.year < 1990 && v.gearbox?.toLowerCase().includes('manuell'),
        title: '⚠️ Varning: Växellådsolja (Gulmetall)',
        content: 'Gamla manuella växellådor (pre-1990) har ofta synkroniseringar av mässing/gulmetall. Modern API GL-5 olja innehåller additiv som fräter sönder dessa. Du MÅSTE använda API GL-4. Använd aldrig GL-5 om du inte är 100% säker på att lådan tål det.'
    },
    {
        id: 'interference-engine',
        // D24 är känd, men generellt för gamla bilar med rem är detta en bra varning att kolla upp
        condition: (v: VehicleData) => (v.engine.code?.includes('D24') || v.engine.code?.includes('B230K') || v.year < 2000),
        title: '⚠️ Varning: Kamrem (Interference)',
        content: 'Många äldre motorer är av typen "Interference". Om kamremmen går av krockar kolvar och ventiler, vilket leder till totalhaveri. Om historik saknas: Byt rem direkt!'
    },
    {
        id: 'lt-kingpins',
        condition: (v: VehicleData) => (v.model?.includes('LT') && v.year < 1996),
        title: '⚠️ Modellspecifikt: VW LT Spindelbultar',
        content: 'Framvagnen på VW LT Mk1 har spindelbultar (kingpins) som MÅSTE smörjas regelbundet (var 500:e mil). Om de rostar fast blir styrningen trög och byte kräver ofta press och värme.'
    }
];

// --- EXPORTS ---

export const DEMO_PROJECT: Project = {
    id: 'demo-elton',
    name: 'Elton (VW LT31)',
    type: 'conversion', // Updated type
    brand: 'vanplan',
    // NEW ownership model
    ownerIds: ['demo'],
    primaryOwnerId: 'demo',
    memberIds: [],
    invitedEmails: [],
    // Legacy fields (for backwards compatibility)
    ownerId: 'demo',
    ownerEmail: 'demo',
    vehicleData: ELTON_VEHICLE_DATA,
    tasks: ELTON_TASKS,
    shoppingItems: ELTON_SHOPPING_ITEMS,
    serviceLog: SERVICE_LOG_ITEMS,
    fuelLog: [],
    knowledgeArticles: [],
    created: '2025-12-05',
    lastModified: '2025-12-11',
    isDemo: true,
    userSkillLevel: 'intermediate',
    nickname: 'Elton'
};

export const EMPTY_PROJECT_TEMPLATE: Project = {
    id: '',
    name: 'Nytt Projekt',
    type: 'renovation',
    brand: 'vanplan',
    // NEW ownership model
    ownerIds: [],
    primaryOwnerId: '',
    memberIds: [],
    invitedEmails: [],
    // Legacy fields (for backwards compatibility)
    ownerId: '',
    ownerEmail: '',
    vehicleData: {
        regNo: '', make: '', model: '', year: 0, prodYear: 0, regDate: '', status: '', bodyType: '', passengers: 0,
        inspection: { last: '', mileage: '', next: '' },
        engine: { fuel: '', power: '', volume: '' },
        gearbox: '',
        wheels: { drive: '', tiresFront: '', tiresRear: '', boltPattern: '' },
        dimensions: { length: 0, width: 0, height: '', wheelbase: 0 },
        weights: { curb: 0, total: 0, load: 0, trailer: 0, trailerB: 0 },
        vin: '', color: '',
        history: { owners: 0, events: 0, lastOwnerChange: '' }
    },
    tasks: [],
    shoppingItems: [],
    serviceLog: [],
    fuelLog: [],
    knowledgeArticles: [],
    created: '',
    lastModified: ''
};

export const VEHICLE_TIPS = []; // Placeholder
export const RESOURCE_LINKS = []; // Placeholder
export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = []; // Placeholder

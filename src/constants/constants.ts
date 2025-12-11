
import { Task, TaskStatus, CostType, VehicleData, ServiceItem, ResourceLink, KnowledgeArticle, Contact, Priority, ShoppingItem, Project, PROJECT_PHASES, TaskType, MechanicalPhase, BuildPhase } from '@/types/types';

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

const ELTON_SHOPPING_ITEMS: ShoppingItem[] = [
    { id: 's1', name: 'Kamremssats (Contitech CT637K1)', category: 'Reservdelar', estimatedCost: 800, quantity: '1 st', checked: false, url: 'https://www.autodoc.se/contitech/1210452', linkedTaskId: 'mek-1' },
    { id: 's2', name: 'Vattenpump (Metallimpeller)', category: 'Reservdelar', estimatedCost: 400, quantity: '1 st', checked: false, url: 'https://www.autodoc.se/hepu/2283285', linkedTaskId: 'mek-1' },
    { id: 's16', name: 'Startbatteri (75Ah)', category: 'Reservdelar', estimatedCost: 1400, quantity: '1 st', checked: false, store: 'Biltema', linkedTaskId: 'mek-0' },
    { id: 's7', name: 'Motorolja 10W-40 (Mineral)', category: 'Kemi & Färg', estimatedCost: 400, quantity: '10 L', checked: false, store: 'Biltema', linkedTaskId: 'mek-2' },
    { id: 's12', name: 'Tändstift (Bosch W7DTC)', category: 'Reservdelar', estimatedCost: 200, quantity: '4 st', checked: false, linkedTaskId: 'mek-2' },
];

const ELTON_TASKS: Task[] = [
  // === SPRINT 0: LOGISTIK & START (Prio 1) ===
  {
    id: 'admin-1',
    type: TaskType.ADMIN,
    title: 'Försäkra & Ställ på',
    description: 'Ring försäkringsbolag. Kolla veteranförsäkring.',
    status: TaskStatus.TODO,
    priority: Priority.HIGH,
    mechanicalPhase: MechanicalPhase.P0_ACUTE,
    phase: 'Fas 1: Akut', // Legacy fallback
    estimatedCostMin: 0, 
    estimatedCostMax: 0,
    actualCost: 0,
    weightKg: 0,
    costType: CostType.OPERATION,
    tags: ['Admin', 'Prio'],
    links: [], comments: [], attachments: [], subtasks: []
  },
  {
    id: 'logistik-1',
    type: TaskType.MAINTENANCE,
    title: 'Hämta bilen (Hemtransport)',
    description: 'Kör försiktigt. Kolla olja/vatten var 10:e mil. Lyssna på framvagn.',
    status: TaskStatus.TODO,
    priority: Priority.HIGH,
    mechanicalPhase: MechanicalPhase.P0_ACUTE,
    phase: 'Fas 1: Akut',
    estimatedCostMin: 1000, 
    estimatedCostMax: 1500,
    actualCost: 0,
    weightKg: 0,
    costType: CostType.OPERATION,
    tags: ['Transport', 'Risk'],
    links: [], comments: [], attachments: [], subtasks: []
  },
  {
    id: 'inkop-1',
    type: TaskType.PURCHASE,
    title: 'Byt Däck (Delsbo)',
    description: '215 R14 C (Året runt). Ring Däckab. Bultmönster 5x160.',
    status: TaskStatus.TODO,
    priority: Priority.HIGH,
    mechanicalPhase: MechanicalPhase.P0_ACUTE,
    phase: 'Fas 1: Akut',
    estimatedCostMin: 4000, 
    estimatedCostMax: 6000,
    actualCost: 0,
    weightKg: 0,
    costType: CostType.OPERATION,
    tags: ['Däck', 'Säkerhet'],
    links: [], comments: [], attachments: [], subtasks: []
  },
  {
    id: 'mek-0',
    type: TaskType.MAINTENANCE,
    title: 'Byt Startbatteri',
    description: 'Det gamla är slut. 75Ah eller större.',
    status: TaskStatus.TODO,
    priority: Priority.HIGH,
    mechanicalPhase: MechanicalPhase.P0_ACUTE,
    phase: 'Fas 1: Akut',
    estimatedCostMin: 1200, 
    estimatedCostMax: 1600,
    actualCost: 0,
    weightKg: 20,
    costType: CostType.OPERATION,
    tags: ['El'],
    links: [], comments: [], attachments: [], subtasks: []
  },

  // === SPRINT 1: MOTORRÄDDNING (Garagefasen) ===
  {
    id: 'mek-1',
    type: TaskType.MAINTENANCE,
    title: 'Kamrem & Vattenpump',
    description: 'Kritisk! Audi CH-motor 2.0L är interference. Byt även spännrulle.',
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
    requiredTools: ['Momentnyckel', 'Kamremsverktyg', 'Avdragare'],
    tags: ['Verkstad', 'Motor', 'Kritisk'],
    links: [], comments: [], attachments: [], subtasks: []
  },
  {
    id: 'mek-2',
    type: TaskType.MAINTENANCE,
    title: 'Stor Service (Vätskor)',
    description: 'Olja (10W-40), Filter, Tändstift (Bosch W7DTC), Luftfilter. OBS: GL-4 i lådan!',
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
    requiredTools: ['Oljefilteravdragare', 'Spärrskaft'],
    tags: ['Service'],
    links: [], comments: [], attachments: [], subtasks: []
  },

  // === SPRINT 2: KAROSS & FÖRBEREDELSE (Innan bygget) ===
  {
    id: 'mek-3',
    type: TaskType.MAINTENANCE,
    title: 'Rostlaga Balk & Dörr',
    description: 'Fixa yttre balk och skjutdörrens nederkant. Måste vara tätt innan isolering.',
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
    mechanicalPhase: MechanicalPhase.P2_RUST,
    phase: 'Fas 3: Kaross & Rost',
    estimatedCostMin: 500, 
    estimatedCostMax: 10000,
    actualCost: 0,
    weightKg: 5,
    costType: CostType.INVESTMENT,
    difficultyLevel: 'Medium',
    requiredTools: ['Svets', 'Vinkelslip'],
    tags: ['Rost', 'Kaross'],
    links: [], comments: [], attachments: [], subtasks: []
  },

  // === SPRINT 3: VANLIFE BYGGE (Skalet) ===
  {
    id: 'build-1',
    type: TaskType.BUILD,
    title: 'Isolering & Golv',
    description: 'Armaflex på plåt. Plywoodgolv. Rostskydda golvet inifrån först!',
    status: TaskStatus.BLOCKED, // Blocked by mek-3
    priority: Priority.MEDIUM,
    buildPhase: BuildPhase.B1_SHELL,
    phase: 'Fas 4: Inredning & Finish',
    blockers: [{ taskId: 'mek-3', reason: 'Måste svetsa balkar innan isolering' }],
    estimatedCostMin: 3000, 
    estimatedCostMax: 5000,
    actualCost: 0,
    weightKg: 50,
    costType: CostType.INVESTMENT,
    tags: ['Vanlife', 'Isolering'],
    links: [], comments: [], attachments: [], subtasks: []
  },
  {
    id: 'build-2',
    type: TaskType.BUILD,
    title: 'Dra El & Vatten (Infrastruktur)',
    description: 'Dra tomrör för 12V och slangar innan väggarna sätts upp.',
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
    buildPhase: BuildPhase.B2_SYSTEMS,
    phase: 'Fas 4: Inredning & Finish',
    estimatedCostMin: 1000, 
    estimatedCostMax: 3000,
    actualCost: 0,
    weightKg: 10,
    costType: CostType.INVESTMENT,
    tags: ['El', 'Vatten'],
    links: [], comments: [], attachments: [], subtasks: []
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

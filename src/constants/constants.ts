
import { Task, TaskStatus, CostType, VehicleData, ServiceItem, ResourceLink, KnowledgeArticle, Contact, Priority, ShoppingItem, Project, PROJECT_PHASES } from '@/types/types';

// --- DEMO DATA (ELTON) ---

const ELTON_VEHICLE_DATA: VehicleData = {
  regNo: 'JSN398',
  make: 'Volkswagen',
  model: 'LT 31 Skåp',
  year: 1976,
  prodYear: 1976,
  regDate: '1978-02-14',
  status: 'Avställd (sedan 2025-11-04)',
  bodyType: 'Skåp Bostadsinredning',
  passengers: 3, // + förare
  inspection: {
    last: '2025-08-13',
    mileage: '3 368 mil (Troligen slagit om, 13k/23k mil?)',
    next: 'Okänd'
  },
  engine: {
    fuel: 'Bensin',
    power: '75 HK / 55 kW',
    volume: '2.0L (Audi 100 motor)'
  },
  gearbox: 'Manuell',
  wheels: {
    drive: '2WD (Bakhjulsdrift)',
    tiresFront: '215R14',
    tiresRear: '215R14',
    boltPattern: '5x160' // Known spec for LT31
  },
  dimensions: {
    length: 5400,
    width: 1980,
    height: 'Okänd',
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
    lastOwnerChange: '2023-06-28'
  }
};

const ELTON_SHOPPING_ITEMS: ShoppingItem[] = [
    { id: 's1', name: 'Kamremssats (Contitech CT637K1)', category: 'Reservdelar', estimatedCost: 800, quantity: '1 st', checked: false, url: 'https://www.autodoc.se/contitech/1210452', linkedTaskId: '4' },
    { id: 's2', name: 'Vattenpump (Metallimpeller)', category: 'Reservdelar', estimatedCost: 400, quantity: '1 st', checked: false, url: 'https://www.autodoc.se/hepu/2283285', linkedTaskId: '4' },
    { id: 's16', name: 'Startbatteri (75Ah)', category: 'Reservdelar', estimatedCost: 1400, quantity: '1 st', checked: false, store: 'Biltema', linkedTaskId: '2' },
];

const ELTON_TASKS: Task[] = [
  {
    id: '0-1',
    title: 'Inspektion & Provkörning',
    description: 'Provkörning (Söndag). Mäta fukt med Meec-mätare.',
    status: TaskStatus.DONE,
    phase: PROJECT_PHASES.renovation[0], // Fas 1: Akut (typ) or Fas 0 Planering logic needed
    priority: Priority.HIGH,
    sprint: 'Sprint 0: Inköp',
    estimatedCostMin: 500,
    estimatedCostMax: 1000,
    actualCost: 800,
    weightKg: 0,
    costType: CostType.OPERATION,
    tags: ['Analys', 'Köp'],
    links: [],
    comments: [],
    attachments: [],
    decisionOptions: [],
    subtasks: []
  },
  {
    id: '1',
    title: 'Laga rostig balk (Yttre - Ej bärande)',
    description: 'Kan vänta till nästa säsong.',
    status: TaskStatus.IDEA, // Example of IDEA
    phase: PROJECT_PHASES.renovation[2], // Kaross
    priority: Priority.LOW,
    sprint: 'Sommar/Höst',
    estimatedCostMin: 300,
    estimatedCostMax: 10000,
    actualCost: 0,
    weightKg: 5,
    costType: CostType.INVESTMENT,
    tags: ['Rost', 'Kaross'],
    links: [],
    comments: [],
    attachments: [],
    subtasks: [],
    decisionOptions: []
  },
  {
    id: '2',
    title: 'Installera nytt startbatteri',
    description: 'Prio 1: Utan el, ingen bil.',
    status: TaskStatus.TODO,
    phase: PROJECT_PHASES.renovation[0], // Akut
    priority: Priority.HIGH,
    sprint: 'Sprint 1: Besiktning',
    estimatedCostMin: 1200,
    estimatedCostMax: 1600,
    actualCost: 0,
    weightKg: 20,
    costType: CostType.OPERATION,
    tags: ['Prio 1', 'El'],
    links: [],
    comments: [],
    attachments: [],
    subtasks: [],
    decisionOptions: []
  }
];

export const SERVICE_LOG_ITEMS: ServiceItem[] = [
    {
        id: 's1',
        date: '2025-08-13',
        description: 'Kontrollbesiktning (Godkänd)',
        mileage: '3 368 mil',
        performer: 'Bilprovningen',
        type: 'Besiktning'
    }
];

// --- EXPORTS ---

export const DEMO_PROJECT: Project = {
    id: 'demo-elton',
    name: 'Elton (VW LT31)',
    type: 'renovation',
    ownerId: 'demo',
    ownerEmail: 'demo',
    vehicleData: ELTON_VEHICLE_DATA,
    tasks: ELTON_TASKS,
    shoppingItems: ELTON_SHOPPING_ITEMS,
    serviceLog: SERVICE_LOG_ITEMS,
    fuelLog: [],
    knowledgeArticles: [],
    created: '2025-01-01',
    lastModified: '2025-01-01',
    isDemo: true
};

export const EMPTY_PROJECT_TEMPLATE: Project = {
    id: '',
    name: 'Nytt Projekt',
    type: 'renovation',
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


export type ProjectType = 'renovation' | 'conversion' | 'maintenance';
export type BrandId = 'vanplan' | 'racekoll' | 'mcgaraget' | 'klassikern';
export type DifficultyLevel = 'Easy' | 'Medium' | 'Expert';
export type UserSkillLevel = 'beginner' | 'intermediate' | 'expert';

export const PROJECT_PHASES = {
    renovation: ['Fas 1: Akut', 'Fas 2: Mekanisk Säkerhet', 'Fas 3: Kaross & Rost', 'Fas 4: Inredning & Finish'],
    conversion: ['Fas 1: Planering & Inköp', 'Fas 2: Isolering & Grund', 'Fas 3: El & Vatten', 'Fas 4: Snickerier & Inredning', 'Fas 5: Finish & Piff'],
    maintenance: ['Vårkoll', 'Säsong', 'Höst/Vinterförvaring', 'Löpande']
};

export enum TaskStatus {
  IDEA = 'Idé & Research', 
  TODO = 'Att göra',
  IN_PROGRESS = 'Pågående',
  DONE = 'Klart',
}

export enum Priority {
  HIGH = 'Hög',     
  MEDIUM = 'Medel', 
  LOW = 'Låg'       
}

export enum CostType {
  INVESTMENT = 'Investering', 
  OPERATION = 'Drift', 
}

export interface Link {
  id: string;
  title: string;
  url: string;
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string; 
  author: 'user' | 'ai';
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'file';
  data: string; 
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface DecisionOption {
  id: string;
  title: string; 
  description: string;
  costRange: string;
  pros: string[];
  cons: string[];
  recommended?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  phase: string; 
  priority?: Priority; 
  sprint?: string;     
  estimatedCostMin: number;
  estimatedCostMax: number;
  actualCost: number;
  weightKg: number; 
  costType: CostType;
  tags: string[];
  links: Link[];
  comments: Comment[];
  attachments: Attachment[];
  subtasks: Subtask[];
  decisionOptions?: DecisionOption[];
  // New fields for Planner improvements
  difficultyLevel?: DifficultyLevel;
  requiredTools?: string[];
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: 'Reservdelar' | 'Kemi & Färg' | 'Verktyg' | 'Inredning' | 'Övrigt';
  estimatedCost: number;
  actualCost?: number;
  quantity: string;
  checked: boolean;
  url?: string;
  store?: string;
  purchaseDate?: string;
  receiptUrl?: string; 
  linkedTaskId?: string;
}

export interface ServiceItem {
  id: string;
  date: string;
  description: string;
  mileage: string;
  performer: string;
  type: 'Service' | 'Reparation' | 'Besiktning' | 'Övrigt';
}

export interface FuelLogItem {
    id: string;
    date: string;
    mileage: number; 
    liters: number;
    pricePerLiter: number;
    totalCost: number;
    fullTank: boolean;
}

export interface ResourceLink {
  category: string;
  title: string;
  url: string;
  description: string;
  icon?: any;
}

export interface KnowledgeArticle {
    id: string;
    title: string;
    summary: string;
    content: string; 
    tags: string[];
}

export interface Contact {
    name: string;
    phone: string;
    location: string;
    category: 'Specialist' | 'Veteran & Kaross' | 'Service & Akut' | 'Märkesverkstad' | 'Försäkring & Räddning';
    specialty: string;
    note?: string;
}

// New: Structured Expert Analysis
export interface ExpertAnalysis {
    commonFaults: { 
        title: string; 
        description: string; 
        urgency: 'High' | 'Medium' | 'Low';
    }[];
    modificationTips: { 
        title: string; 
        description: string; 
    }[];
    maintenanceNotes: string; // e.g. "Smörj spindelbultar!"
}

export interface VehicleMaintenanceData {
    fluids: {
        oilType: string;
        oilCapacity: string;
        coolantType: string;
        gearboxOil?: string;
    };
    battery: {
        type: string;
        capacity: string;
    };
    tires: {
        pressureFront: string;
        pressureRear: string;
    };
}

// Detailed Vehicle Data Structure
export interface VehicleIdentity {
  regNo: string;
  make: string;
  model: string;
  year: number;
  productionYear: number;
  firstRegistration: string;
  vin: string;
  color: string;
  bodyType: string;
}

export interface EngineSpecs {
  code?: string; // Motor code (e.g., CH, D24, B230)
  type: string; // e.g., "2.0L Bensin"
  cylinders?: number;
  power: string; // e.g., "75 HK / 55 kW"
  torque?: string; // e.g., "152 Nm"
  volume: string; // e.g., "2.0L"
  fuel: string; // Bensin, Diesel, El
  cooling?: string; // Vattenkyld, Luftkyld
  valveTrain?: string; // SOHC, DOHC
  valveAdjustment?: string; // Shims, Hydrauliska
  carburetor?: string; // Solex 35, Weber
}

export interface VehicleSpecs {
  gearbox: string;
  drive: string; // 2WD, 4WD, AWD
  tires: string;
  boltPattern: string;
  length: number;
  width: number;
  height?: string;
  wheelbase: number;
  weights: {
    curb: number;
    total: number;
    load: number;
    trailer: number;
    trailerB?: number;
  };
}

export interface VehicleStatus {
  current: string; // "I trafik", "Avställd"
  since?: string;
  lastInspection: string;
  nextInspection?: string;
  odometerReading?: number;
  odometerNote?: string; // For 5-digit odometers
}

// Main VehicleData interface (simplified top-level)
export interface VehicleData {
  // Legacy flat structure (for backwards compatibility)
  regNo: string;
  make: string;
  model: string;
  year: number;
  prodYear: number;
  regDate: string;
  status: string;
  bodyType: string;
  passengers: number;
  inspection: {
    last: string;
    mileage: string;
    next: string;
  };
  engine: {
    fuel: string;
    power: string;
    volume: string;
    type?: string; // e.g., "2.0L Bensin", "1.9 TDI"
    code?: string;
    cylinders?: number;
    torque?: string;
    cooling?: string;
    valveTrain?: string;
    carburetor?: string;
  };
  gearbox: string;
  wheels: {
    drive: string;
    tiresFront: string;
    tiresRear: string;
    boltPattern: string;
  };
  dimensions: {
    length: number;
    width: number;
    height: string;
    wheelbase: number;
  };
  weights: {
    curb: number;
    total: number;
    load: number;
    trailer: number;
    trailerB: number;
  };
  vin: string;
  color: string;
  history: {
    owners: number;
    events: number;
    lastOwnerChange: string;
  };

  // Enhanced data
  expertAnalysis?: ExpertAnalysis;
  maintenance?: VehicleMaintenanceData;

  // New structured format (optional, for detailed exports)
  identity?: VehicleIdentity;
  engineSpecs?: EngineSpecs;
  specs?: VehicleSpecs;
  vehicleStatus?: VehicleStatus;
}

export interface UserProfile {
    uid: string;
    name: string;
    email: string;
    avatar?: string;
}

/**
 * User Settings
 * Preferences and configuration for the user experience
 */
export interface UserSettings {
    userId: string;
    dialectId?: 'dalmal' | 'gotlandska' | 'rikssvenska' | 'standard';
    darkMode?: boolean;
    language?: 'sv' | 'en';
}

export interface Project {
    id: string;
    name: string;
    type: ProjectType;
    brand: BrandId;
    ownerId: string;
    ownerEmail: string;

    // Co-working fields
    members?: string[];
    invitedEmails?: string[];

    vehicleData: VehicleData;
    tasks: Task[];
    shoppingItems: ShoppingItem[];
    serviceLog: ServiceItem[];
    fuelLog: FuelLogItem[];
    contacts?: Contact[];
    knowledgeArticles?: KnowledgeArticle[];
    customIcon?: string;
    created: string;
    lastModified: string;
    isDemo?: boolean;

    // User preferences & personalization
    userSkillLevel?: UserSkillLevel; // Påverkar AI:ns kommunikation och rekommendationer
    nickname?: string; // Fordonets smeknamn (påverkar Eltons personlighet)

    // Location for workshop recommendations
    location?: {
        city: string;
        region: string;
        country: string;
        coordinates?: { lat: number; lng: number };
        source: 'gps' | 'ip' | 'manual';
        lastUpdated: string;
    };
}


// Tool Definitions for AI
export interface ToolCall {
  name: string;
  args: any;
  id: string;
}

// Export/Import Format
export interface ProjectExportMeta {
  project: string;
  exported: string; // ISO date
  version: string;
}

export interface ProjectExport {
  meta: ProjectExportMeta;
  vehicle: VehicleData;
  knowledgeBase: KnowledgeArticle[];
  tasks: Task[];
  shoppingList: ShoppingItem[];
  contacts: Contact[];
  tips: Array<{ title: string; text: string }>;
}

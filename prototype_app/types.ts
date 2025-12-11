

export type ProjectType = 'renovation' | 'conversion' | 'maintenance';

export enum TaskStatus {
  IDEA = 'Idé & Research', // New status for backlog/dreams
  TODO = 'Att göra',
  IN_PROGRESS = 'Pågående',
  DONE = 'Klart',
}

export enum Priority {
  HIGH = 'Hög',     // Safety, Legal, breakdown risk
  MEDIUM = 'Medel', // Function, Preventative
  LOW = 'Låg'       // Cosmetic, Comfort
}

export enum CostType {
  INVESTMENT = 'Investering', // Increases value (e.g. Heater, Solar)
  OPERATION = 'Drift', // Consumables (e.g. Oil, Gas, Tires)
}

export interface Link {
  id: string;
  title: string;
  url: string;
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string; // ISO date string
  author: 'user' | 'ai';
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'file';
  data: string; // Base64 string for this demo
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface DecisionOption {
  id: string;
  title: string; // e.g. "Göra själv", "Leja ut"
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
  phase: string; // Changed from Enum to String for flexibility
  priority?: Priority; 
  sprint?: string;     
  estimatedCostMin: number;
  estimatedCostMax: number;
  actualCost: number;
  weightKg: number; 
  costType: CostType;
  tags: string[]; // Can include "Vår", "Höst", "Årlig"
  links: Link[];
  comments: Comment[];
  attachments: Attachment[];
  subtasks: Subtask[];
  decisionOptions?: DecisionOption[];
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
  receiptImage?: string; 
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

export interface VehicleData {
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
    code?: string;
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
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

export interface Project {
    id: string;
    name: string;
    type: ProjectType; // New field
    phases: string[];  // New field: Custom phases for this project
    vehicleData: VehicleData;
    tasks: Task[];
    shoppingItems: ShoppingItem[];
    serviceLog: ServiceItem[];
    fuelLog: FuelLogItem[];
    knowledgeArticles?: KnowledgeArticle[]; 
    created: string;
    lastModified: string;
    isDemo?: boolean;
    customIcon?: string; 
}

// Tool Definitions for AI
export interface ToolCall {
  name: string;
  args: any;
  id: string;
}
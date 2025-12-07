
export enum Phase {
  PLANNING = 'Fas 0: Inköp & Analys',
  ACUTE = 'Fas 1: Akut',
  MECHANICAL = 'Fas 2: Mekanisk Säkerhet',
  BODY = 'Fas 3: Kaross & Rost',
  BUILD = 'Fas 4: Vanlife-bygget',
}

export enum TaskStatus {
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
  phase: Phase;
  priority?: Priority; // New field
  sprint?: string;     // New field (e.g. "Sprint 1", "Weekend 42")
  estimatedCostMin: number;
  estimatedCostMax: number;
  actualCost: number;
  weightKg: number; // For Payload Calculator
  costType: CostType;
  tags: string[];
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
  actualCost?: number; // New: What we actually paid
  quantity: string; // e.g. "4 liter", "1 st"
  checked: boolean;
  url?: string; // New: Link to product
  store?: string; // New: Where to buy
  purchaseDate?: string; // New: When it was bought
  receiptImage?: string; // New: Base64 image of receipt
  linkedTaskId?: string; // New: Link cost to a specific task
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
    mileage: number; // Mätarställning
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
    content: string; // Markdown supported
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
  year: number; // Model year
  prodYear: number; // Manufactured
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
    curb: number; // Tjänstevikt
    total: number; // Totalvikt
    load: number; // Lastvikt
    trailer: number; // Max släpvagnsvikt
    trailerB: number; // Släp totalvikt (B)
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
    vehicleData: VehicleData;
    tasks: Task[];
    shoppingItems: ShoppingItem[];
    serviceLog: ServiceItem[];
    fuelLog: FuelLogItem[];
    created: string;
    lastModified: string;
    isDemo?: boolean;
}

// Tool Definitions for AI
export interface ToolCall {
  name: string;
  args: any;
  id: string;
}


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

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  phase: Phase;
  estimatedCostMin: number;
  estimatedCostMax: number;
  actualCost: number;
  weightKg: number; // For Payload Calculator
  costType: CostType;
  tags: string[];
  links: Link[];
  comments: Comment[];
  attachments: Attachment[];
}

export interface ProjectStats {
  totalEstimatedMin: number;
  totalEstimatedMax: number;
  totalSpent: number;
  progress: number;
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
import { ShoppingItem, VendorOption } from './shopping';
import { Task } from './task';
import { VehicleData } from './vehicle';
import { UserSkillLevel } from './user';

export interface ChatContext {
    type: 'shopping_item' | 'task' | 'inspection_finding';
    item?: ShoppingItem;
    task?: Task;
    vehicleData: VehicleData;
    userSkillLevel?: UserSkillLevel;
    relatedTasks?: Task[];
    relatedItems?: ShoppingItem[];
    availablePhases?: string[];
    // Inspection Context
    inspectionFinding?: any; // Avoiding circular dependency for now, or use DetailedInspectionFinding
    inspectionArea?: any;
}

export interface ContextualChatMessage {
    id: string;
    role: 'user' | 'model';
    content: string;
    timestamp: string;
    proposedUpdates?: VendorOption[]; // For AI-suggested vendor options
}

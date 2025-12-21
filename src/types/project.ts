import { ProjectExportMeta } from './common';
import { VehicleData, ServiceItem, FuelLogItem } from './vehicle';
import { Task } from './task';
import { ShoppingItem } from './shopping';
import { InspectionFinding, DetailedInspection } from './inspection';
import { MileageReading, VehicleHistoryEvent, PriceHistoryPoint, VehicleStatistics } from './vehicle-history-types';

export type ProjectType = 'renovation' | 'conversion' | 'maintenance';
export type BrandId = 'vanplan' | 'racekoll' | 'mcgaraget' | 'klassikern';

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

export interface ProjectParticipant {
    name: string;
    role: string;
    competenceProfile?: string;
    assets?: string;
}

export interface StrategicDecision {
    id: string;
    area: string; // "motor", "doors", "roofLeak", etc
    decision: string;
    reasoning: string;
    actionNow: string;
    actionFuture: string;
    decidedDate: string;
}

export interface ProjectUnknown {
    item: string;
    status: string;
    theory?: string;
    reliability?: string;
}

export interface ProjectConstraint {
    type: 'resource' | 'knowledge' | 'time' | 'access';
    description: string;
}

export interface ProjectMetadata {
    projectId: string;
    participants: ProjectParticipant[];
    context?: {
        location?: string;
        seasonGoal?: string;
        travelPlans?: string;
    };
    strategicDecisions?: StrategicDecision[];
    unknowns?: ProjectUnknown[];
    constraints?: ProjectConstraint[];
}

export interface Project {
    id: string;
    name: string;
    type: ProjectType;
    brand: BrandId;

    // === OWNERSHIP (Multi-owner support) ===
    ownerIds: string[];        // All owners (e.g., married couple sharing a project)
    primaryOwnerId: string;    // "Account holder" for billing/primary contact
    memberIds: string[];       // Editors who don't own (collaborators)
    invitedEmails: string[];   // Pending invitations

    // Legacy fields (deprecated - for backwards compatibility)
    /** @deprecated Use ownerIds[0] instead */
    ownerId?: string;
    /** @deprecated Lookup in users collection instead */
    ownerEmail?: string;
    /** @deprecated Use memberIds instead */
    members?: string[];

    // === VEHICLE DATA ===
    vehicleData: VehicleData;

    // === SUB-COLLECTION REFERENCES (data loaded separately) ===
    // Note: These arrays are kept for backwards compatibility but
    // should be loaded via getTasks(), getShoppingItems() etc.
    tasks: Task[];
    shoppingItems: ShoppingItem[];
    serviceLog: ServiceItem[];
    fuelLog: FuelLogItem[];
    inspections?: InspectionFinding[]; // AI-generated findings
    detailedInspections?: DetailedInspection[]; // Structured inspection reports
    projectMetadata?: ProjectMetadata; // Context, participants, decisions
    contacts?: Contact[];
    knowledgeArticles?: KnowledgeArticle[];
    mileageReadings?: MileageReading[];
    historyEvents?: VehicleHistoryEvent[];
    priceHistory?: PriceHistoryPoint[];
    vehicleStatistics?: VehicleStatistics[];

    // === METADATA ===
    customIcon?: string;
    created: string;
    lastModified: string;
    isDemo?: boolean;

    // === HISTORY ===
    // === HISTORY ===
    // historyEvents handled above with proper type

    // === PROJECT PREFERENCES ===
    nickname?: string; // Fordonets smeknamn (påverkar Eltons personlighet)

    // === LOCATION ===
    location?: {
        city: string;
        region: string;
        country: string;
        coordinates?: { lat: number; lng: number };
        source: 'gps' | 'ip' | 'manual';
        lastUpdated: string;
    };
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

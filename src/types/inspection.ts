// --- INSPECTION MODULE ---
export interface InspectionFinding {
    id: string;
    projectId?: string; // Optional if embedded in project
    imageUrl?: string;
    audioUrl?: string;
    date: string;
    category: 'EXTERIOR' | 'ENGINE' | 'UNDERCARRIAGE' | 'INTERIOR';

    // AI Analysis
    aiDiagnosis: string;
    severity: 'COSMETIC' | 'WARNING' | 'CRITICAL';
    confidence: number;

    // System Link
    convertedToTaskId?: string;
    status?: 'open' | 'fixed' | 'ignored';
}

// --- DETAILED INSPECTION MODULE (for structured inspections) ---
export interface DetailedInspectionFinding {
    id: number | string;
    category: 'Anmärkning' | 'Positivt';
    type: string; // "Sprickor", "Rost", "Läckage", etc
    description: string;
    position?: string; // "Insida över förardörr"
    detail?: string; // Extended description
    action?: string; // Recommended action
    linkedTaskIds?: string[]; // Tasks that address this finding
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status?: 'open' | 'fixed' | 'ignored';
    resolutionNotes?: string;
}

export interface DetailedInspectionArea {
    areaId: number;
    name: string; // "Taket", "Motor", "Baksidan"
    findings: DetailedInspectionFinding[];
    summary?: {
        negative: number;
        positive: number;
    };
    // UI hints
    actionLabel?: string; // "TÄTA AKUT", "BYT UT", "SVETSA & SKYDDA"
    actionPriority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface DetailedInspection {
    id: string;
    projectId: string;
    date: string;
    inspectors: string[];
    type: string; // "Totalinspektion (Exteriör, Interiör, Mekaniskt)"
    sourceFiles?: string[]; // Audio/video filenames
    areas: DetailedInspectionArea[];
    statistics: {
        total: number;
        negative: number;
        positive: number;
    };
}

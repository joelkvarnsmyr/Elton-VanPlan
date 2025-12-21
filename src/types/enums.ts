// Legacy phases (still used for categorization in UI if detailed phases not set)
export const PROJECT_PHASES = {
    renovation: ['Fas 1: Akut', 'Fas 2: Mekanisk Säkerhet', 'Fas 3: Kaross & Rost', 'Fas 4: Inredning & Finish'],
    conversion: ['Fas 1: Planering & Inköp', 'Fas 2: Isolering & Grund', 'Fas 3: El & Vatten', 'Fas 4: Snickerier & Inredning', 'Fas 5: Finish & Piff'],
    maintenance: ['Vårkoll', 'Säsong', 'Höst/Vinterförvaring', 'Löpande']
};

// Sorterar uppgifter i rätt "fack"
export enum TaskType {
    IDEA = 'IDEA',           // "Borde vi...?" (Kräver research)
    MAINTENANCE = 'MAINT',   // Reparation & Service (Måste göras)
    BUILD = 'BUILD',         // Vanlife-bygge (Förbättring)
    PURCHASE = 'BUY',        // Rena inköp
    ADMIN = 'ADMIN',          // Försäkring, Besiktning, Ägarbyte
    REPAIR = 'REPAIR',       // Reparation
    RESEARCH = 'RESEARCH',   // Research
    UPGRADE = 'UPGRADE',     // Uppgradering
    INSPECTION = 'INSPECTION', // Inspektion
    DIY = 'DIY',             // DIY
    SERVICE = 'SERVICE'      // Service
}

// Mekaniska spåret (Bilen) - Prioritet 1
export enum MechanicalPhase {
    P0_ACUTE = '0. Akut & Säkerhet',      // Hemtransport, Däck, Batteri
    P1_ENGINE = '1. Motorräddning',       // Kamrem, Service, Kylsystem
    P2_RUST = '2. Rost & Kaross',         // Svetsa balkar (Görs innan inredning!)
    P3_FUTURE = '3. Löpande Underhåll'    // Framtida service
}

// Byggspåret (Huset) - Prioritet 2
export enum BuildPhase {
    B0_DEMO = '0. Rivning & Förberedelse',
    B1_SHELL = '1. Skal & Isolering',     // Hål, Isolering, Golv
    B2_SYSTEMS = '2. System (El/Vatten)', // Kablar & Slang
    B3_INTERIOR = '3. Inredning',         // Väggar & Möbler
    B4_FINISH = '4. Finish & Piff'
}

export enum TaskStatus {
    IDEA = 'Idé & Research',
    TODO = 'Att göra',
    IN_PROGRESS = 'Pågående',
    DONE = 'Klart',
    BLOCKED = 'Blockerad'
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

// Shopping Item Status (for shopping intelligence)
export enum ShoppingItemStatus {
    RESEARCH = 'RESEARCH',   // Still comparing options
    DECIDED = 'DECIDED',     // Option selected, ready to buy
    BOUGHT = 'BOUGHT'        // Purchased
}

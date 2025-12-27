/**
 * Electrical System Types for VanPlan
 * 
 * Data model for visualizing and building campervan electrical systems
 * with animated power flow visualization.
 */

// === Component Types ===
export type ElectricalComponentType =
    | 'solar_panel'    // Solpanel
    | 'mppt'           // MPPT-laddare (SmartSolar)
    | 'dc_dc'          // DC-DC omvandlare (Orion)
    | 'battery'        // Batteri (LiFePO4, AGM)
    | 'inverter'       // Inverter (MultiPlus)
    | 'distributor'    // Säkringscentral (Lynx)
    | 'monitor'        // Monitor (Cerbo GX)
    | 'consumer_12v'   // 12V förbrukare
    | 'consumer_230v'  // 230V uttag
    | 'shore_power'    // Landström
    | 'alternator';    // Generator/Alternator

// === Component Specs ===
export interface ComponentSpecs {
    voltage?: number;        // Nominell spänning (V)
    capacity?: number;       // Kapacitet (Ah för batterier)
    power?: number;          // Effekt (W)
    maxCurrent?: number;     // Max ström (A)
    energyCapacity?: number; // Wh (för batterier: capacity * voltage)
    efficiency?: number;     // 0-100% för laddare/inverters
    weight?: number;         // Vikt i kg
}

// === Electrical Component ===
export interface ElectricalComponent {
    id: string;
    type: ElectricalComponentType;
    name: string;
    brand?: string;            // "Victron", "Renogy", etc.
    model?: string;            // "SmartSolar MPPT 100/30"
    specs?: ComponentSpecs;
    position: { x: number; y: number };
    icon?: string;             // Emoji or icon identifier
    customImage?: string;      // Base64 encoded image

    // Product linking
    productUrl?: string;       // Link to manufacturer page
    purchaseUrl?: string;      // Link to purchase (store)

    // Integration with VanPlan
    linkedShoppingItemId?: string;  // Link to shopping list item
    linkedTaskIds?: string[];       // Links to related tasks
}

// === Connection Types ===
export type ConnectionType = 'dc_positive' | 'dc_negative' | 'ac' | 'data';
export type VoltageLevel = 12 | 24 | 48 | 230;

// === Electrical Connection ===
export interface ElectricalConnection {
    id: string;
    fromId: string;
    toId: string;
    fromPort?: 'input' | 'output' | 'battery' | 'load' | 'solar';
    toPort?: 'input' | 'output' | 'battery' | 'load' | 'solar';
    type: ConnectionType;
    voltage: VoltageLevel;
    label?: string;
    cableSize?: string;  // Cable dimension, e.g., "6mm²", "10mm²", "25mm²"
}

// === Energy Scenarios ===
export type EnergyScenario = 'solar' | 'driving' | 'shore' | 'night';

export interface ScenarioConfig {
    id: EnergyScenario;
    name: string;
    nameEn: string;
    icon: string;
    description: string;
    activeConnections: string[]; // Connection IDs that are active in this scenario
    flowDirection: 'charge' | 'discharge' | 'both';
}

// === Live Stats ===
export interface SystemStats {
    solarPower: number;        // Current solar input (W)
    loadPower: number;         // Current consumption (W)
    batteryPercent: number;    // Battery SOC (%)
    batteryState: 'charging' | 'discharging' | 'idle';
    activeScenario: EnergyScenario;
}

// === Complete Electrical System ===
export interface ElectricalSystem {
    id: string;
    name: string;
    components: ElectricalComponent[];
    connections: ElectricalConnection[];
    activeScenario: EnergyScenario;
    stats?: SystemStats;
    created: string;
    lastModified: string;
}

// === Default Scenarios ===
export const DEFAULT_SCENARIOS: ScenarioConfig[] = [
    {
        id: 'solar',
        name: 'Off-grid (Sol)',
        nameEn: 'Off-grid (Solar)',
        icon: '☀️',
        description: 'Solpaneler laddar batteriet',
        activeConnections: [],
        flowDirection: 'charge',
    },
    {
        id: 'driving',
        name: 'Körning',
        nameEn: 'Driving',
        icon: '🚐',
        description: 'Alternator laddar via DC-DC',
        activeConnections: [],
        flowDirection: 'charge',
    },
    {
        id: 'shore',
        name: 'Landström',
        nameEn: 'Shore Power',
        icon: '🔌',
        description: 'Ansluten till elnätet',
        activeConnections: [],
        flowDirection: 'charge',
    },
    {
        id: 'night',
        name: 'Natt',
        nameEn: 'Night',
        icon: '🌙',
        description: 'Batteri driver förbrukare',
        activeConnections: [],
        flowDirection: 'discharge',
    },
];

// === Default Component Templates ===
export interface ComponentTemplate {
    type: ElectricalComponentType;
    name: string;
    icon: string;
    brand?: string;
    model?: string;
    defaultSpecs?: ComponentSpecs;
}

export const DEFAULT_COMPONENT_TEMPLATES: ComponentTemplate[] = [
    // Power Sources
    { type: 'solar_panel', name: 'Solpanel', icon: '☀️', defaultSpecs: { power: 200, voltage: 18 } },
    { type: 'shore_power', name: 'Landström', icon: '🏠', defaultSpecs: { voltage: 230 } },
    { type: 'alternator', name: 'Generator', icon: '🚐', defaultSpecs: { voltage: 14, maxCurrent: 100 } },

    // Chargers & Converters
    { type: 'mppt', name: 'MPPT Laddare', icon: '⚡', brand: 'Victron', model: 'SmartSolar MPPT', defaultSpecs: { maxCurrent: 30 } },
    { type: 'dc_dc', name: 'DC-DC Omvandlare', icon: '🔄', brand: 'Victron', model: 'Orion-Tr Smart', defaultSpecs: { maxCurrent: 30 } },
    { type: 'inverter', name: 'Inverter/Laddare', icon: '🔌', brand: 'Victron', model: 'MultiPlus-II', defaultSpecs: { power: 3000 } },

    // Storage & Distribution
    { type: 'battery', name: 'LiFePO4 Batteri', icon: '🔋', defaultSpecs: { voltage: 12, capacity: 200 } },
    { type: 'distributor', name: 'Säkringscentral', icon: '📦', brand: 'Victron', model: 'Lynx Distributor' },
    { type: 'monitor', name: 'Systemmonitor', icon: '📊', brand: 'Victron', model: 'Cerbo GX' },

    // Consumers - 12V
    { type: 'consumer_12v', name: '12V Förbrukare', icon: '💡', defaultSpecs: { voltage: 12 } },
    { type: 'consumer_12v', name: 'LED-belysning', icon: '💡', defaultSpecs: { voltage: 12, power: 50 } },
    { type: 'consumer_12v', name: 'Kompressor Kylskåp', icon: '❄️', defaultSpecs: { voltage: 12, power: 45 } },
    { type: 'consumer_12v', name: 'Dieselvärmare', icon: '🔥', defaultSpecs: { voltage: 12, power: 35 } },
    { type: 'consumer_12v', name: 'Vattenpump', icon: '💧', defaultSpecs: { voltage: 12, power: 60 } },
    { type: 'consumer_12v', name: 'Fläktar', icon: '🌀', defaultSpecs: { voltage: 12, power: 25 } },
    { type: 'consumer_12v', name: 'USB-laddare', icon: '🔌', defaultSpecs: { voltage: 12, power: 30 } },

    // Consumers - 230V (High Power)
    { type: 'consumer_230v', name: '230V Uttag', icon: '🔌', defaultSpecs: { voltage: 230 } },
    { type: 'consumer_230v', name: 'Induktionshäll', icon: '🍳', defaultSpecs: { voltage: 230, power: 2000 } },
    { type: 'consumer_230v', name: 'Airfryer', icon: '🍟', defaultSpecs: { voltage: 230, power: 1500 } },
    { type: 'consumer_230v', name: 'Vattenkokare', icon: '☕', defaultSpecs: { voltage: 230, power: 2000 } },
    { type: 'consumer_230v', name: 'Värmeelement 500W', icon: '🔥', defaultSpecs: { voltage: 230, power: 500 } },
    { type: 'consumer_230v', name: 'Värmeelement 1000W', icon: '🔥', defaultSpecs: { voltage: 230, power: 1000 } },
    { type: 'consumer_230v', name: 'Hårtork', icon: '💨', defaultSpecs: { voltage: 230, power: 1200 } },
    { type: 'consumer_230v', name: 'Mikrovågsugn', icon: '📻', defaultSpecs: { voltage: 230, power: 800 } },
    { type: 'consumer_230v', name: 'AC/Luftkonditionering', icon: '❄️', defaultSpecs: { voltage: 230, power: 1200 } },
];

// === Utility Functions ===
export function createComponent(
    template: ComponentTemplate,
    position: { x: number; y: number }
): ElectricalComponent {
    return {
        id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: template.type,
        name: template.name,
        brand: template.brand,
        model: template.model,
        specs: template.defaultSpecs,
        position,
        icon: template.icon,
    };
}

export function createConnection(
    fromId: string,
    toId: string,
    type: ConnectionType = 'dc_positive',
    voltage: VoltageLevel = 12
): ElectricalConnection {
    return {
        id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        fromId,
        toId,
        type,
        voltage,
    };
}

export function createEmptySystem(name: string = 'Mitt Elsystem'): ElectricalSystem {
    return {
        id: `sys-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        components: [],
        connections: [],
        activeScenario: 'solar',
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
    };
}

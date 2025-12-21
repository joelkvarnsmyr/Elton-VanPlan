/**
 * Vehicle History Types
 * Types for tracking mileage, events, pricing, and statistics over vehicle lifetime
 */

/**
 * Mileage Reading
 * Represents a single mileage data point from inspection, registration, or advertisement
 */
export interface MileageReading {
    id: string;
    date: string; // ISO format
    mileage: number; // Swedish "mil" (1 mil = 10 km)
    source: 'Besiktning' | 'Efterkontroll' | 'Registrering' | 'Annons';
    eventType?: string; // e.g., "Kontrollbesiktning"
    verified: boolean; // If from Transportstyrelsen
}

/**
 * Vehicle History Event
 * Represents any significant event in the vehicle's history
 */
export interface VehicleHistoryEvent {
    id: string;
    date: string; // ISO format
    type: 'owner_change' | 'inspection' | 'registration' | 'deregistration' | 'advertisement' | 'other';
    title: string; // e.g., "Ägarbyte", "I trafik", "Kontrollbesiktning"
    description?: string; // e.g., "Till en person i Umeå kommun"
    mileage?: number; // If relevant
    price?: number; // For advertisements (SEK)
    location?: string; // e.g., "Umeå kommun"
    url?: string; // For advertisements
    metadata?: {
        adRemovalDate?: string;
        priceUpdated?: string;
        [key: string]: any;
    };
}

/**
 * Price History Point
 * Historical pricing data from advertisements or valuations
 */
export interface PriceHistoryPoint {
    date: string; // ISO format
    estimatedPrice: number; // SEK
    source: 'annons' | 'uppskattn' | 'försäljning';
    change?: number; // Change from previous (SEK)
    mileage?: number; // If known
}

/**
 * Vehicle Statistics
 * Statistical data about the vehicle model in Sweden
 */
export interface VehicleStatistics {
    totalInSweden: number; // Total number of this model
    sameEngineType: number; // Same engine type
    model: string; // e.g., "Volkswagen LT Panel Van 31"
    yearRange: string; // e.g., "1975 - 1983"
    lastUpdated: string; // ISO format
}

/**
 * Vehicle Maintenance Data
 * Critical maintenance info and specs
 */
export interface HistoryMaintenanceData {
    fluids: {
        oilType: string;
        oilCapacity: string;
        coolantType: string;
        gearboxOil: string;
    };
    battery: {
        type: string;
        cca: number;
        installed: string;
    };
    criticalNotes?: string[];
    maintenanceNotes?: string;
}

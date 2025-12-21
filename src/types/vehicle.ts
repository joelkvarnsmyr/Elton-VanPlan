import { MileageReading, VehicleHistoryEvent, PriceHistoryPoint, VehicleStatistics } from './vehicle-history-types';

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

    // Historic Data
    mileageHistory?: MileageReading[];
    historyEvents?: VehicleHistoryEvent[];
    priceHistory?: PriceHistoryPoint[];
    statistics?: VehicleStatistics;

    // Metadata
    dataLastUpdated?: string;
    nextDataUpdate?: string;


    // New structured format (optional, for detailed exports)
    identity?: VehicleIdentity;
    engineSpecs?: EngineSpecs;
    specs?: VehicleSpecs;
    vehicleStatus?: VehicleStatus;
}

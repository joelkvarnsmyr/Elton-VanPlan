/**
 * Type definitions for Elton VanPlan
 */

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
        next: string;
        mileage: string;
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
        mileageHistory?: Array<{
            date: string;
            mileage: number;
            mileageFormatted: string;
            type: string;
        }>;
    };
}

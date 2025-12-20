/**
 * Elton Vehicle History Data
 * Complete mileage history, timeline events, price history, and statistics
 * Source: Transportstyrelsen, car.info, biluppgifter.se
 */

import {
    MileageReading,
    VehicleHistoryEvent,
    PriceHistoryPoint,
    VehicleStatistics
} from '../types/vehicle-history-types';

// ============================================================================
// MILEAGE HISTORY (9 data points)
// ============================================================================

export const ELTON_MILEAGE_HISTORY: MileageReading[] = [
    {
        id: 'mr-1978-02-14',
        date: '1978-02-14',
        mileage: 0,
        source: 'Registrering',
        eventType: 'Registrerad',
        verified: true
    },
    {
        id: 'mr-2015-03-24',
        date: '2015-03-24',
        mileage: 1385,
        source: 'Besiktning',
        eventType: 'Kontrollbesiktning',
        verified: true
    },
    {
        id: 'mr-2017-07-19',
        date: '2017-07-19',
        mileage: 1973,
        source: 'Besiktning',
        eventType: 'Kontrollbesiktning',
        verified: true
    },
    {
        id: 'mr-2019-05-29',
        date: '2019-05-29',
        mileage: 2273,
        source: 'Besiktning',
        eventType: 'Kontrollbesiktning',
        verified: true
    },
    {
        id: 'mr-2019-06-25',
        date: '2019-06-25',
        mileage: 2281,
        source: 'Efterkontroll',
        eventType: 'Efterkontroll-besiktning',
        verified: true
    },
    {
        id: 'mr-2019-11-08',
        date: '2019-11-08',
        mileage: 2500, // Från annons "25 000 mil"
        source: 'Annons',
        verified: false
    },
    {
        id: 'mr-2021-06-28',
        date: '2021-06-28',
        mileage: 2668,
        source: 'Besiktning',
        eventType: 'Kontrollbesiktning',
        verified: true
    },
    {
        id: 'mr-2023-05-11',
        date: '2023-05-11',
        mileage: 3098,
        source: 'Besiktning',
        eventType: 'Kontrollbesiktning',
        verified: true
    },
    {
        id: 'mr-2025-08-13',
        date: '2025-08-13',
        mileage: 3362,
        source: 'Besiktning',
        eventType: 'Kontrollbesiktning',
        verified: true
    }
];

// ============================================================================
// VEHICLE HISTORY EVENTS (35+ events)
// ============================================================================

export const ELTON_HISTORY_EVENTS: VehicleHistoryEvent[] = [
    // 2025
    {
        id: 'ev-2025-12-10',
        date: '2025-12-10',
        type: 'registration',
        title: 'I trafik'
    },
    {
        id: 'ev-2025-11-04',
        date: '2025-11-04',
        type: 'deregistration',
        title: 'Avställd'
    },
    {
        id: 'ev-2025-10-23',
        date: '2025-10-23',
        type: 'advertisement',
        title: 'Privatannons',
        price: 50000,
        metadata: {
            adRemovalDate: '2025-12-01'
        }
    },
    {
        id: 'ev-2025-08-13',
        date: '2025-08-13',
        type: 'inspection',
        title: 'Kontrollbesiktning',
        mileage: 3362
    },
    {
        id: 'ev-2025-07-03',
        date: '2025-07-03',
        type: 'registration',
        title: 'I trafik'
    },

    // 2024
    {
        id: 'ev-2024-12-10',
        date: '2024-12-10',
        type: 'deregistration',
        title: 'Avställd'
    },
    {
        id: 'ev-2024-04-28',
        date: '2024-04-28',
        type: 'registration',
        title: 'I trafik'
    },

    // 2023
    {
        id: 'ev-2023-10-22',
        date: '2023-10-22',
        type: 'deregistration',
        title: 'Avställd'
    },
    {
        id: 'ev-2023-06-28',
        date: '2023-06-28',
        type: 'owner_change',
        title: 'Ägarbyte',
        description: 'Till en person'
    },
    {
        id: 'ev-2023-05-11',
        date: '2023-05-11',
        type: 'inspection',
        title: 'Kontrollbesiktning',
        mileage: 3098
    },
    {
        id: 'ev-2023-05-03',
        date: '2023-05-03',
        type: 'advertisement',
        title: 'Privatannons',
        price: 70000,
        metadata: {
            adRemovalDate: '2023-06-30',
            priceUpdated: '2023-06-27'
        }
    },
    {
        id: 'ev-2023-04-20',
        date: '2023-04-20',
        type: 'registration',
        title: 'I trafik'
    },
    {
        id: 'ev-2023-04-19',
        date: '2023-04-19',
        type: 'owner_change',
        title: 'Ägarbyte',
        description: 'Till en person i Umeå kommun',
        location: 'Umeå kommun'
    },
    {
        id: 'ev-2023-03-12',
        date: '2023-03-12',
        type: 'advertisement',
        title: 'Privatannons',
        price: 85000,
        metadata: {
            adRemovalDate: '2023-04-21',
            priceUpdated: '2023-04-14'
        }
    },

    // 2022
    {
        id: 'ev-2022-09-30',
        date: '2022-09-30',
        type: 'advertisement',
        title: 'Privatannons',
        price: 95000,
        metadata: {
            adRemovalDate: '2022-12-02',
            priceUpdated: '2022-10-16'
        }
    },
    {
        id: 'ev-2022-08-10',
        date: '2022-08-10',
        type: 'deregistration',
        title: 'Avställd'
    },
    {
        id: 'ev-2022-06-09',
        date: '2022-06-09',
        type: 'registration',
        title: 'I trafik'
    },

    // 2021
    {
        id: 'ev-2021-10-28',
        date: '2021-10-28',
        type: 'deregistration',
        title: 'Avställd'
    },
    {
        id: 'ev-2021-06-28',
        date: '2021-06-28',
        type: 'inspection',
        title: 'Kontrollbesiktning',
        mileage: 2668
    },
    {
        id: 'ev-2021-06-01',
        date: '2021-06-01',
        type: 'registration',
        title: 'I trafik'
    },

    // 2020
    {
        id: 'ev-2020-12-16',
        date: '2020-12-16',
        type: 'deregistration',
        title: 'Avställd'
    },
    {
        id: 'ev-2020-06-11',
        date: '2020-06-11',
        type: 'owner_change',
        title: 'Ägarbyte',
        description: 'Till en person i Sundsvall kommun',
        location: 'Sundsvall kommun'
    },

    // 2019
    {
        id: 'ev-2019-09-07',
        date: '2019-09-07',
        type: 'advertisement',
        title: 'Privatannons',
        price: 20000,
        mileage: 2500,
        metadata: {
            adRemovalDate: '2019-11-26',
            priceUpdated: '2019-11-01'
        }
    },
    {
        id: 'ev-2019-07-21',
        date: '2019-07-21',
        type: 'owner_change',
        title: 'Ägarbyte',
        description: 'Till en person i Luleå kommun',
        location: 'Luleå kommun'
    },
    {
        id: 'ev-2019-06-25',
        date: '2019-06-25',
        type: 'inspection',
        title: 'Efterkontroll-besiktning',
        mileage: 2281
    },
    {
        id: 'ev-2019-05-29',
        date: '2019-05-29',
        type: 'inspection',
        title: 'Kontrollbesiktning',
        mileage: 2273
    },
    {
        id: 'ev-2019-05-27',
        date: '2019-05-27',
        type: 'registration',
        title: 'I trafik'
    },

    // 2018
    {
        id: 'ev-2018-10-07',
        date: '2018-10-07',
        type: 'deregistration',
        title: 'Avställd'
    },
    {
        id: 'ev-2018-05-01',
        date: '2018-05-01',
        type: 'registration',
        title: 'I trafik'
    },

    // 2017
    {
        id: 'ev-2017-09-27',
        date: '2017-09-27',
        type: 'deregistration',
        title: 'Avställd'
    },
    {
        id: 'ev-2017-07-19',
        date: '2017-07-19',
        type: 'inspection',
        title: 'Kontrollbesiktning',
        mileage: 1973
    },
    {
        id: 'ev-2017-05-04',
        date: '2017-05-04',
        type: 'registration',
        title: 'I trafik'
    },

    // 2016
    {
        id: 'ev-2016-09-27',
        date: '2016-09-27',
        type: 'deregistration',
        title: 'Avställd'
    },
    {
        id: 'ev-2016-04-09',
        date: '2016-04-09',
        type: 'registration',
        title: 'I trafik'
    },

    // 2015
    {
        id: 'ev-2015-08-01',
        date: '2015-08-01',
        type: 'owner_change',
        title: 'Ägarbyte',
        description: 'Till en person i Skellefteå kommun',
        location: 'Skellefteå kommun'
    },
    {
        id: 'ev-2015-04-02',
        date: '2015-04-02',
        type: 'owner_change',
        title: 'Ägarbyte',
        description: 'Till en person i Norrbotten län',
        location: 'Norrbotten län'
    },
    {
        id: 'ev-2015-03-24',
        date: '2015-03-24',
        type: 'inspection',
        title: 'Kontrollbesiktning',
        mileage: 1385
    },

    // 2014
    {
        id: 'ev-2014-07-22',
        date: '2014-07-22',
        type: 'owner_change',
        title: 'Ägarbyte',
        description: 'Till en person i Gävle kommun',
        location: 'Gävle kommun'
    },

    // 2012
    {
        id: 'ev-2012-09-19',
        date: '2012-09-19',
        type: 'inspection',
        title: 'Efterkontroll-besiktning'
    },

    // 1978
    {
        id: 'ev-1978-02-14-reg',
        date: '1978-02-14',
        type: 'registration',
        title: 'Registrerad',
        description: 'JSN398'
    },
    {
        id: 'ev-1978-02-14-pre',
        date: '1978-02-14',
        type: 'other',
        title: 'Förregistrerad'
    }
];

// ============================================================================
// PRICE HISTORY (5 advertisements)
// ============================================================================

export const ELTON_PRICE_HISTORY: PriceHistoryPoint[] = [
    {
        date: '2019-09-07',
        estimatedPrice: 20000,
        source: 'annons',
        mileage: 2500
    },
    {
        date: '2022-09-30',
        estimatedPrice: 95000,
        source: 'annons',
        change: 75000
    },
    {
        date: '2023-03-12',
        estimatedPrice: 85000,
        source: 'annons',
        change: -10000
    },
    {
        date: '2023-05-03',
        estimatedPrice: 70000,
        source: 'annons',
        change: -15000,
        mileage: 3098
    },
    {
        date: '2025-10-23',
        estimatedPrice: 50000,
        source: 'annons',
        change: -20000,
        mileage: 3362
    }
];

// ============================================================================
// VEHICLE STATISTICS
// ============================================================================

export const ELTON_STATISTICS: VehicleStatistics = {
    totalInSweden: 395,
    sameEngineType: 265,
    model: 'Volkswagen LT Panel Van 31',
    yearRange: '1975 - 1983',
    lastUpdated: '2025-12-16'
};

// ============================================================================
// SUMMARY DATA FOR VEHICLEDATA
// ============================================================================

export const ELTON_ESTIMATED_CURRENT_MILEAGE = 3418; // Calculated
export const ELTON_ANNUAL_DRIVING = 223; // mil/year
export const ELTON_DATA_LAST_UPDATED = '2025-12-16';
export const ELTON_NEXT_DATA_UPDATE = '2025-12-23';

// Store configuration for shopping list vendor options
// This allows for easy expansion and store preference management

export interface StoreConfig {
    id: string;
    name: string;
    displayName: string;
    category: 'auto_parts' | 'hardware' | 'online' | 'specialist';
    country: 'SE' | 'DE' | 'UK' | 'NO';
    hasPhysicalStores: boolean;
    supportsShelfLocation: boolean;
    icon?: string; // Future: emoji or icon identifier
    color?: string; // Brand color for UI
    website?: string;
    typicalShippingCost?: number; // SEK
    typicalDeliveryDays?: number;
}

export const STORES: Record<string, StoreConfig> = {
    // Swedish Physical Stores
    BILTEMA: {
        id: 'biltema',
        name: 'Biltema',
        displayName: 'Biltema',
        category: 'auto_parts',
        country: 'SE',
        hasPhysicalStores: true,
        supportsShelfLocation: true,
        icon: '🔧',
        color: '#003366',
        website: 'https://www.biltema.se',
        typicalShippingCost: 0, // Free pickup in store
        typicalDeliveryDays: 0,
    },
    JULA: {
        id: 'jula',
        name: 'Jula',
        displayName: 'Jula',
        category: 'hardware',
        country: 'SE',
        hasPhysicalStores: true,
        supportsShelfLocation: true,
        icon: '🛠️',
        color: '#E30613',
        website: 'https://www.jula.se',
        typicalShippingCost: 0,
        typicalDeliveryDays: 0,
    },
    MEKONOMEN: {
        id: 'mekonomen',
        name: 'Mekonomen',
        displayName: 'Mekonomen',
        category: 'auto_parts',
        country: 'SE',
        hasPhysicalStores: true,
        supportsShelfLocation: false,
        icon: '🚗',
        color: '#009FE3',
        website: 'https://www.mekonomen.se',
        typicalShippingCost: 0,
        typicalDeliveryDays: 1,
    },
    MOTOACTION: {
        id: 'motoaction',
        name: 'MotoAction',
        displayName: 'MotoAction',
        category: 'auto_parts',
        country: 'SE',
        hasPhysicalStores: true,
        supportsShelfLocation: false,
        icon: '🏍️',
        color: '#000000',
        website: 'https://www.motoaction.se',
        typicalShippingCost: 0,
        typicalDeliveryDays: 1,
    },

    // Online Stores (Swedish)
    AUTODOC: {
        id: 'autodoc',
        name: 'Autodoc',
        displayName: 'Autodoc',
        category: 'online',
        country: 'SE',
        hasPhysicalStores: false,
        supportsShelfLocation: false,
        icon: '🇸🇪',
        color: '#FF6600',
        website: 'https://www.autodoc.se',
        typicalShippingCost: 89,
        typicalDeliveryDays: 3,
    },
    SKRUVAT: {
        id: 'skruvat',
        name: 'Skruvat',
        displayName: 'Skruvat.se',
        category: 'hardware',
        country: 'SE',
        hasPhysicalStores: false,
        supportsShelfLocation: false,
        icon: '🔩',
        color: '#FF9900',
        website: 'https://www.skruvat.se',
        typicalShippingCost: 49,
        typicalDeliveryDays: 2,
    },

    // German Online Stores
    AUTODOC_DE: {
        id: 'autodoc_de',
        name: 'AutodocDE',
        displayName: 'Autodoc (Tyskland)',
        category: 'online',
        country: 'DE',
        hasPhysicalStores: false,
        supportsShelfLocation: false,
        icon: '🇩🇪',
        color: '#FF6600',
        website: 'https://www.autodoc.de',
        typicalShippingCost: 89,
        typicalDeliveryDays: 5,
    },
    EBAY_DE: {
        id: 'ebay_de',
        name: 'eBayDE',
        displayName: 'eBay (Tyskland)',
        category: 'online',
        country: 'DE',
        hasPhysicalStores: false,
        supportsShelfLocation: false,
        icon: '🛒',
        color: '#E53238',
        website: 'https://www.ebay.de',
        typicalShippingCost: 120,
        typicalDeliveryDays: 7,
    },

    // Specialist Stores
    CUSTOM: {
        id: 'custom',
        name: 'Custom',
        displayName: 'Annan butik',
        category: 'specialist',
        country: 'SE',
        hasPhysicalStores: true,
        supportsShelfLocation: false,
        icon: '📦',
        color: '#6B7280',
        typicalShippingCost: 0,
        typicalDeliveryDays: 0,
    },
};

// Helper functions
export const getStoreById = (id: string): StoreConfig | undefined => {
    return Object.values(STORES).find(store => store.id === id);
};

export const getStoresByCategory = (category: StoreConfig['category']): StoreConfig[] => {
    return Object.values(STORES).filter(store => store.category === category);
};

export const getPhysicalStores = (): StoreConfig[] => {
    return Object.values(STORES).filter(store => store.hasPhysicalStores);
};

export const getOnlineStores = (): StoreConfig[] => {
    return Object.values(STORES).filter(store => !store.hasPhysicalStores);
};

export const getAllStores = (): StoreConfig[] => {
    return Object.values(STORES);
};

// For dropdown/select components
export const getStoreOptions = () => {
    return Object.values(STORES).map(store => ({
        value: store.id,
        label: store.displayName,
        icon: store.icon,
    }));
};

import { ShoppingItemStatus } from './enums';

export interface VendorOption {
    id: string;
    store: string;          // 'Biltema', 'Autodoc', 'Jula'
    articleNumber?: string;  // T.ex. '80-275' (Används för deep-links/sök)

    price: number;
    currency: 'SEK' | 'EUR';
    shippingCost: number;   // Avgörande för jämförelse (Tyskland vs Butik)
    totalCost?: number;     // Beräknat: price + shippingCost

    deliveryTimeDays?: number; // 0 = Hämta direkt
    inStock?: boolean;
    shelfLocation?: string; // 'Gång 4, Hylla 12' (Endast fysisk butik)
    url?: string;            // Direktlänk till produkt
    lastPriceCheck?: string; // ISO date - priser ändras!
}

export interface ShoppingItem {
    id: string;
    name: string;
    category: 'Reservdelar' | 'Kemi & Färg' | 'Kemi & Tätning' | 'Verktyg' | 'Inredning' | 'El' | 'Motor' | 'Kaross' | 'El - Victron' | 'El - Sol' | 'Rostskydd' | 'Isolering' | 'Värme' | 'Bränsle' | 'Övrigt';
    estimatedCost: number;
    actualCost?: number;
    quantity: string;
    checked: boolean;        // Legacy - use status instead
    status?: ShoppingItemStatus; // RESEARCH | DECIDED | BOUGHT
    url?: string;
    store?: string;
    purchaseDate?: string;
    receiptUrl?: string;
    linkedTaskId?: string;

    // Smart Shopping Features
    options?: VendorOption[];
    selectedOptionId?: string;
}

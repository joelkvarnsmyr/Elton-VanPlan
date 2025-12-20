import { 
  Task, 
  TaskStatus, 
  CostType, 
  VehicleData, 
  ServiceItem, 
  Priority, 
  ShoppingItem, 
  ShoppingItemStatus, 
  Project, 
  TaskType, 
  MechanicalPhase, 
  BuildPhase 
} from '@/types/types';

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║  ELTON PROJECT DATABASE - VW LT31 1976 (JSN398)                          ║
// ║  Genererad: 2025-12-20                                                    ║
// ║  Baserad på: Detaljerad inspektion + strategidiskussion                   ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

// =============================================================================
// VEHICLE DATA
// =============================================================================

const ELTON_VEHICLE_DATA: VehicleData = {
  // --- Grunddata ---
  regNo: 'JSN398',
  make: 'Volkswagen',
  model: 'LT 31 (Typ 28/21)',
  year: 1976,
  prodYear: 1976,
  regDate: '1978-02-14',
  status: 'Avställd',
  bodyType: 'Skåp Bostadsinredning',
  passengers: 4,
  nickname: 'Elton',

  // --- Besiktning ---
  inspection: {
    last: '2025-08-13',
    mileage: '3 362 mil (Mätarställning)',
    next: 'Okänd'
  },

  // --- Motor (Audi CH 2.0L) ---
  engine: {
    fuel: 'Bensin',
    power: '75 HK / 55 kW',
    volume: '2.0L (Audi)',
    type: '2.0L Bensin (Audi)',
    code: 'CH'
  },

  // --- Drivlina ---
  gearbox: 'Manuell 4-växlad',
  wheels: {
    drive: '2WD Bakhjulsdrift',
    tiresFront: '215R14 C',
    tiresRear: '215R14 C',
    boltPattern: '5x160'
  },

  // --- Dimensioner ---
  dimensions: {
    length: 5400,
    width: 2020,
    height: '2500 mm',
    wheelbase: 2500
  },

  // --- Vikter ---
  weights: {
    curb: 2280,
    total: 3160,
    load: 880,
    trailer: 1400,
    trailerB: 750
  },

  // --- Identitet ---
  vin: '2862500058',
  color: 'Flerfärgad',
  history: {
    owners: 22,
    events: 38,
    lastOwnerChange: '2025-12-05'
  },

  // --- Underhållsdata ---
  maintenance: {
    fluids: {
      oilType: '10W-40 Mineral',
      oilCapacity: '6.0 liter',
      coolantType: 'Glykol blå (G11)',
      gearboxOil: 'API GL-4 (Gulmetallsäker)'
    },
    battery: {
      type: 'Startbatteri',
      capacity: '75-88Ah'
    },
    tires: {
      pressureFront: '3.5 bar',
      pressureRear: '4.5 bar'
    }
  },

  // --- Expertanalys ---
  expertAnalysis: {
    commonFaults: [
      { 
        title: 'Spindelbultar (Kingpins)', 
        description: 'Måste smörjas var 500:e mil! Om de skär krävs press.', 
        urgency: 'High' 
      },
      { 
        title: 'Rost i balkar', 
        description: 'Kolla tvärbalkar och domkraftsfästen noga.', 
        urgency: 'Medium' 
      },
      { 
        title: 'Takskarv glasfiber/plåt', 
        description: 'Klassisk läckagepunkt på LT med husbilspåbyggnad.', 
        urgency: 'High' 
      }
    ],
    modificationTips: [
      { 
        title: 'Motorbyte D24', 
        description: 'Populärt att byta till Volvo D24 eller D24T för mer ork och bättre bränsle.' 
      },
      { 
        title: 'Victron elsystem', 
        description: 'Bygg komplett 12V-system med LiFePO4 och Victron-komponenter.' 
      }
    ],
    maintenanceNotes: 'OBS: 5-siffrig mätare. Mätarställning 3362 mil är troligen 13 362, 23 362 eller 33 362. Motor har körts med mycket startgas historiskt - okänt slitage.'
  }
};

// =============================================================================
// STRATEGISKA BESLUT (Dokumenterade från genomgång 2025-12-20)
// =============================================================================

const STRATEGIC_DECISIONS = {
  motor: {
    decision: 'MINIMAL_SERVICE_NOW',
    reasoning: 'Okänd historik, tidigare startgasanvändning, oljig kamrem. Ej värt att investera 10-15k i omfattande service på en potentiellt svag motor.',
    actionNow: 'Oljebyte, luftfiltertätning, monitorera förbrukning',
    actionFuture: 'Utvärdera efter sommarens körning. Planera för eventuellt motorbyte (diesel eller starkare bensin) höst/vinter.',
    decidedDate: '2025-12-20'
  },
  doors: {
    decision: 'REPLACE_WITH_USED',
    reasoning: 'Både skjutdörr och förardörr har för omfattande rostskador för att reparera ekonomiskt. 1300 LT-bilar kvar i trafik, regelbunden skrotning ger tillgång till begagnade delar.',
    actionNow: 'Börja leta begagnade dörrar (Blocket, tyska eBay Kleinanzeigen, LT-forum)',
    actionFuture: 'Byt båda dörrarna när lämpliga hittas',
    decidedDate: '2025-12-20'
  },
  roofLeak: {
    decision: 'TEMPORARY_SEAL_NOW',
    reasoning: 'Stoppa aktivt vattenläckage innan sommaren. Ordentlig reparation kräver mer tid och garage.',
    actionNow: 'Sikaflex-tätning av takskarv vid förardörren',
    actionFuture: 'Ordentlig rostbehandling och tätning höst/vinter med garage',
    decidedDate: '2025-12-20'
  },
  roofHatch: {
    decision: 'REPLACE_WITH_MODERN',
    reasoning: 'Befintlig lucka har rostig ram, dåliga tätningar. Ny modern lucka ger säker tätning och bättre ventilation.',
    recommendation: 'Fiamma Vent/Turbo eller Dometic Mini Heki (40x40cm)',
    decidedDate: '2025-12-20'
  },
  awning: {
    decision: 'REMOVE_FOR_INSPECTION',
    reasoning: 'Läckage vid markisfästet. Behöver inspekteras för att bedöma skador och täta ordentligt.',
    actionNow: 'Demontera markis',
    actionFuture: 'Beslut om återmontering efter inspektion av glasfibertak under fästena',
    decidedDate: '2025-12-20'
  },
  insulation: {
    decision: 'KEEP_FOR_SUMMER_REDO_LATER',
    reasoning: 'Befintlig isolering i bodelen är acceptabel. Förarhyttsområdet är slarvigt gjort men funktionellt. Vill använda bilen i sommar.',
    actionNow: 'Lev med befintlig isolering',
    actionFuture: 'Göra om isolering förarhytt + taklucksområde höst/vinter',
    decidedDate: '2025-12-20'
  },
  electrical: {
    decision: 'TEMPORARY_LIFEPO4_NOW_VICTRON_LATER',
    reasoning: 'Vill kunna göra enklare utflykter i januari. Bygger fristående LiFePO4-system som senare integreras i komplett Victron-uppsättning.',
    actionNow: 'Bygg ~300Ah LiFePO4-bodelsbatteri som separat system',
    actionFuture: 'Komplett Victron-system med MPPT, DC-DC, inverter, nya solpaneler (2x200W)',
    decidedDate: '2025-12-20'
  },
  repaint: {
    decision: 'NOT_YET',
    reasoning: 'Aktiv rost måste stoppas först. Omlackering på bil med rost under är bortkastade pengar.',
    actionNow: 'Punktbehandla rostgenomslag, täta läckagepunkter',
    actionFuture: 'Eventuell lackering om 2-3 år när allt annat är klart',
    decidedDate: '2025-12-20'
  }
};

// =============================================================================
// SHOPPING ITEMS - Organiserade per fas
// =============================================================================

const ELTON_SHOPPING_ITEMS: ShoppingItem[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // FAS 1: JANUARI - Tillfälligt LiFePO4 system
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'shop-bat-1',
    name: 'LiFePO4-celler 280Ah (EVE LF280K)',
    category: 'El',
    estimatedCost: 7000,
    quantity: '4 st',
    checked: false,
    status: ShoppingItemStatus.RESEARCH,
    linkedTaskId: 'el-temp-battery',
    options: [
      {
        id: 'opt-bat-1a',
        store: 'AliExpress',
        articleNumber: 'EVE LF280K Grade A',
        price: 6200,
        currency: 'SEK',
        shippingCost: 800,
        totalCost: 7000,
        deliveryTimeDays: 21,
        inStock: true,
        url: 'https://aliexpress.com/item/eve-lf280k',
        lastPriceCheck: '2025-12-20'
      },
      {
        id: 'opt-bat-1b',
        store: 'Nkon.nl',
        articleNumber: 'EVE LF280K',
        price: 8200,
        currency: 'SEK',
        shippingCost: 350,
        totalCost: 8550,
        deliveryTimeDays: 5,
        inStock: true,
        url: 'https://nkon.nl',
        lastPriceCheck: '2025-12-20'
      },
      {
        id: 'opt-bat-1c',
        store: 'Batterihansen.se',
        articleNumber: 'CATL 280Ah',
        price: 9500,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 9500,
        deliveryTimeDays: 3,
        inStock: true,
        url: 'https://batterihansen.se',
        lastPriceCheck: '2025-12-20'
      }
    ]
  },
  {
    id: 'shop-bat-2',
    name: 'BMS för LiFePO4 (4S 100-200A)',
    category: 'El',
    estimatedCost: 1500,
    quantity: '1 st',
    checked: false,
    status: ShoppingItemStatus.RESEARCH,
    linkedTaskId: 'el-temp-battery',
    options: [
      {
        id: 'opt-bms-1a',
        store: 'AliExpress',
        articleNumber: 'JK BMS BD6A20S10P',
        price: 1100,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 1100,
        deliveryTimeDays: 14,
        inStock: true,
        url: 'https://aliexpress.com/item/jk-bms',
        lastPriceCheck: '2025-12-20'
      },
      {
        id: 'opt-bms-1b',
        store: 'Amazon.de',
        articleNumber: 'Daly 4S 150A',
        price: 1650,
        currency: 'SEK',
        shippingCost: 150,
        totalCost: 1800,
        deliveryTimeDays: 4,
        inStock: true,
        url: 'https://amazon.de',
        lastPriceCheck: '2025-12-20'
      },
      {
        id: 'opt-bms-1c',
        store: 'Batterihansen.se',
        articleNumber: 'JK BMS 200A Bluetooth',
        price: 2200,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 2200,
        deliveryTimeDays: 2,
        inStock: true,
        lastPriceCheck: '2025-12-20'
      }
    ]
  },
  {
    id: 'shop-bat-3',
    name: 'Busbars koppar (för cellkoppling)',
    category: 'El',
    estimatedCost: 300,
    quantity: '1 set',
    checked: false,
    status: ShoppingItemStatus.RESEARCH,
    linkedTaskId: 'el-temp-battery',
    options: [
      {
        id: 'opt-bus-1a',
        store: 'AliExpress',
        articleNumber: 'Copper busbar set 280Ah',
        price: 250,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 250,
        deliveryTimeDays: 14,
        inStock: true,
        lastPriceCheck: '2025-12-20'
      },
      {
        id: 'opt-bus-1b',
        store: 'Elfa Distrelec',
        articleNumber: 'Kopparkabel 50mm² + kabelsko',
        price: 450,
        currency: 'SEK',
        shippingCost: 59,
        totalCost: 509,
        deliveryTimeDays: 2,
        inStock: true,
        lastPriceCheck: '2025-12-20'
      }
    ]
  },
  {
    id: 'shop-bat-4',
    name: 'ANL-säkring 150A + hållare',
    category: 'El',
    estimatedCost: 250,
    quantity: '1 st',
    checked: false,
    status: ShoppingItemStatus.RESEARCH,
    linkedTaskId: 'el-temp-battery',
    options: [
      {
        id: 'opt-fuse-1a',
        store: 'Biltema',
        articleNumber: '85-7150',
        price: 199,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 199,
        deliveryTimeDays: 0,
        inStock: true,
        shelfLocation: 'Gång 8, Bilel',
        lastPriceCheck: '2025-12-20'
      },
      {
        id: 'opt-fuse-1b',
        store: 'Kjell & Company',
        articleNumber: '48172',
        price: 279,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 279,
        deliveryTimeDays: 0,
        inStock: true,
        lastPriceCheck: '2025-12-20'
      }
    ]
  },
  {
    id: 'shop-bat-5',
    name: 'Batterikabel 35mm² (röd + svart)',
    category: 'El',
    estimatedCost: 600,
    quantity: '10 meter totalt',
    checked: false,
    status: ShoppingItemStatus.RESEARCH,
    linkedTaskId: 'el-temp-battery',
    options: [
      {
        id: 'opt-cable-1a',
        store: 'Biltema',
        articleNumber: '85-3350 + 85-3351',
        price: 89,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 534,
        deliveryTimeDays: 0,
        inStock: true,
        shelfLocation: 'Gång 8, Kabel (per meter x 6)',
        lastPriceCheck: '2025-12-20'
      },
      {
        id: 'opt-cable-1b',
        store: 'Elfa Distrelec',
        articleNumber: 'H07V-K 35mm²',
        price: 45,
        currency: 'SEK',
        shippingCost: 59,
        totalCost: 509,
        deliveryTimeDays: 2,
        inStock: true,
        lastPriceCheck: '2025-12-20'
      }
    ]
  },
  {
    id: 'shop-bat-6',
    name: 'Kabelsko M8 för 35mm²',
    category: 'El',
    estimatedCost: 150,
    quantity: '10 st',
    checked: false,
    status: ShoppingItemStatus.RESEARCH,
    linkedTaskId: 'el-temp-battery',
    options: [
      {
        id: 'opt-lug-1a',
        store: 'Biltema',
        articleNumber: '85-3208',
        price: 15,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 150,
        deliveryTimeDays: 0,
        inStock: true,
        lastPriceCheck: '2025-12-20'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FAS 1: VÅR - Tätning och rostbehandling
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'shop-seal-1',
    name: 'Sikaflex 221 (vit)',
    category: 'Kemi & Tätning',
    estimatedCost: 240,
    quantity: '2 tuber',
    checked: false,
    status: ShoppingItemStatus.RESEARCH,
    linkedTaskId: 'rust-roof-seal',
    options: [
      {
        id: 'opt-sika-1a',
        store: 'Biltema',
        articleNumber: '36-7821',
        price: 119,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 238,
        deliveryTimeDays: 0,
        inStock: true,
        shelfLocation: 'Gång 12, Lim & Fog',
        lastPriceCheck: '2025-12-20'
      },
      {
        id: 'opt-sika-1b',
        store: 'Jula',
        articleNumber: '318-451',
        price: 129,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 258,
        deliveryTimeDays: 0,
        inStock: true,
        lastPriceCheck: '2025-12-20'
      },
      {
        id: 'opt-sika-1c',
        store: 'Bauhaus',
        articleNumber: 'SIKA-221',
        price: 139,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 278,
        deliveryTimeDays: 0,
        inStock: true,
        lastPriceCheck: '2025-12-20'
      }
    ]
  },
  {
    id: 'shop-seal-2',
    name: 'Rostomvandlare',
    category: 'Kemi & Tätning',
    estimatedCost: 170,
    quantity: '250ml',
    checked: false,
    status: ShoppingItemStatus.RESEARCH,
    linkedTaskId: 'rust-roof-seal',
    options: [
      {
        id: 'opt-rust-1a',
        store: 'Biltema',
        articleNumber: '36-5523 (Fertan)',
        price: 149,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 149,
        deliveryTimeDays: 0,
        inStock: true,
        shelfLocation: 'Gång 12, Rostskydd',
        lastPriceCheck: '2025-12-20'
      },
      {
        id: 'opt-rust-1b',
        store: 'Jula',
        articleNumber: '013-721 (Brunox)',
        price: 169,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 169,
        deliveryTimeDays: 0,
        inStock: true,
        lastPriceCheck: '2025-12-20'
      },
      {
        id: 'opt-rust-1c',
        store: 'Mekonomen',
        articleNumber: 'Hammerite Kurust',
        price: 199,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 199,
        deliveryTimeDays: 0,
        inStock: true,
        lastPriceCheck: '2025-12-20'
      }
    ]
  },
  {
    id: 'shop-seal-3',
    name: 'Zinkspray / Zinkprimer',
    category: 'Kemi & Tätning',
    estimatedCost: 130,
    quantity: '1 burk 400ml',
    checked: false,
    status: ShoppingItemStatus.RESEARCH,
    linkedTaskId: 'rust-roof-seal',
    options: [
      {
        id: 'opt-zinc-1a',
        store: 'Biltema',
        articleNumber: '36-8320',
        price: 99,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 99,
        deliveryTimeDays: 0,
        inStock: true,
        lastPriceCheck: '2025-12-20'
      },
      {
        id: 'opt-zinc-1b',
        store: 'Jula',
        articleNumber: '013-210',
        price: 119,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 119,
        deliveryTimeDays: 0,
        inStock: true,
        lastPriceCheck: '2025-12-20'
      }
    ]
  },
  {
    id: 'shop-seal-4',
    name: 'Stålborste för borrmaskin',
    category: 'Verktyg',
    estimatedCost: 80,
    quantity: '1 st',
    checked: false,
    status: ShoppingItemStatus.RESEARCH,
    linkedTaskId: 'rust-roof-seal',
    options: [
      {
        id: 'opt-brush-1a',
        store: 'Biltema',
        articleNumber: '10-1542',
        price: 69,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 69,
        deliveryTimeDays: 0,
        inStock: true,
        lastPriceCheck: '2025-12-20'
      },
      {
        id: 'opt-brush-1b',
        store: 'Jula',
        articleNumber: '005-362',
        price: 89,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 89,
        deliveryTimeDays: 0,
        inStock: true,
        lastPriceCheck: '2025-12-20'
      }
    ]
  },
  {
    id: 'shop-seal-5',
    name: 'Aceton (rengöring)',
    category: 'Kemi & Tätning',
    estimatedCost: 60,
    quantity: '1 liter',
    checked: false,
    status: ShoppingItemStatus.RESEARCH,
    linkedTaskId: 'rust-roof-seal',
    options: [
      {
        id: 'opt-acet-1a',
        store: 'Biltema',
        articleNumber: '36-1010',
        price: 49,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 49,
        deliveryTimeDays: 0,
        inStock: true,
        lastPriceCheck: '2025-12-20'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FAS 2: SOMMAR - Taklucka
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'shop-hatch-1',
    name: 'Taklucka husbil 40x40cm',
    category: 'Kaross',
    estimatedCost: 1500,
    quantity: '1 st',
    checked: false,
    status: ShoppingItemStatus.RESEARCH,
    linkedTaskId: 'roof-hatch-replace',
    options: [
      {
        id: 'opt-hatch-1a',
        store: 'Campingvaruhuset',
        articleNumber: 'Fiamma Vent 40x40',
        price: 1199,
        currency: 'SEK',
        shippingCost: 99,
        totalCost: 1298,
        deliveryTimeDays: 3,
        inStock: true,
        url: 'https://campingvaruhuset.se',
        lastPriceCheck: '2025-12-20'
      },
      {
        id: 'opt-hatch-1b',
        store: 'Husvagnsexperten',
        articleNumber: 'Dometic Mini Heki',
        price: 1695,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 1695,
        deliveryTimeDays: 5,
        inStock: true,
        url: 'https://husvagnsexperten.se',
        lastPriceCheck: '2025-12-20'
      },
      {
        id: 'opt-hatch-1c',
        store: 'Biltema',
        articleNumber: 'MPK VisionVent S eco',
        price: 899,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 899,
        deliveryTimeDays: 0,
        inStock: true,
        shelfLocation: 'Husbilsavdelning',
        lastPriceCheck: '2025-12-20'
      },
      {
        id: 'opt-hatch-1d',
        store: 'Campingvaruhuset',
        articleNumber: 'Fiamma Turbo Vent (med fläkt)',
        price: 2195,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 2195,
        deliveryTimeDays: 5,
        inStock: true,
        lastPriceCheck: '2025-12-20'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FAS 2: SOMMAR - Begagnade dörrar
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'shop-door-1',
    name: 'Skjutdörr VW LT (begagnad)',
    category: 'Kaross',
    estimatedCost: 3500,
    quantity: '1 st komplett',
    checked: false,
    status: ShoppingItemStatus.RESEARCH,
    linkedTaskId: 'door-sliding-replace',
    options: [
      {
        id: 'opt-door-1a',
        store: 'Blocket',
        articleNumber: 'BEVAKNING AKTIV',
        price: 2000,
        currency: 'SEK',
        shippingCost: 1000,
        totalCost: 3000,
        deliveryTimeDays: 14,
        inStock: false,
        lastPriceCheck: '2025-12-20'
      },
      {
        id: 'opt-door-1b',
        store: 'eBay Kleinanzeigen (DE)',
        articleNumber: 'VW LT Schiebetür',
        price: 2500,
        currency: 'SEK',
        shippingCost: 1500,
        totalCost: 4000,
        deliveryTimeDays: 10,
        inStock: false,
        url: 'https://kleinanzeigen.de',
        lastPriceCheck: '2025-12-20'
      }
    ]
  },
  {
    id: 'shop-door-2',
    name: 'Förardörr VW LT (begagnad)',
    category: 'Kaross',
    estimatedCost: 2500,
    quantity: '1 st',
    checked: false,
    status: ShoppingItemStatus.RESEARCH,
    linkedTaskId: 'door-driver-replace',
    options: [
      {
        id: 'opt-door-2a',
        store: 'Blocket',
        articleNumber: 'BEVAKNING AKTIV',
        price: 1500,
        currency: 'SEK',
        shippingCost: 500,
        totalCost: 2000,
        deliveryTimeDays: 14,
        inStock: false,
        lastPriceCheck: '2025-12-20'
      },
      {
        id: 'opt-door-2b',
        store: 'eBay Kleinanzeigen (DE)',
        articleNumber: 'VW LT Fahrertür',
        price: 1800,
        currency: 'SEK',
        shippingCost: 1000,
        totalCost: 2800,
        deliveryTimeDays: 10,
        inStock: false,
        url: 'https://kleinanzeigen.de',
        lastPriceCheck: '2025-12-20'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FAS 1: VÅR - Motor minimal service
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'shop-motor-1',
    name: 'Motorolja 10W-40 Mineral',
    category: 'Motor',
    estimatedCost: 350,
    quantity: '7 liter',
    checked: false,
    status: ShoppingItemStatus.RESEARCH,
    linkedTaskId: 'motor-oil-change',
    options: [
      {
        id: 'opt-oil-1a',
        store: 'Biltema',
        articleNumber: '36-1285 (5L) + 36-1282 (1L)',
        price: 299,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 378,
        deliveryTimeDays: 0,
        inStock: true,
        shelfLocation: 'Gång 5, Motoroljor',
        lastPriceCheck: '2025-12-20'
      },
      {
        id: 'opt-oil-1b',
        store: 'Jula',
        articleNumber: '580-123',
        price: 329,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 408,
        deliveryTimeDays: 0,
        inStock: true,
        lastPriceCheck: '2025-12-20'
      }
    ]
  },
  {
    id: 'shop-motor-2',
    name: 'Oljefilter (Audi CH 2.0)',
    category: 'Motor',
    estimatedCost: 100,
    quantity: '1 st',
    checked: false,
    status: ShoppingItemStatus.RESEARCH,
    linkedTaskId: 'motor-oil-change',
    options: [
      {
        id: 'opt-filter-1a',
        store: 'Autodoc',
        articleNumber: 'MANN W719/5',
        price: 79,
        currency: 'SEK',
        shippingCost: 49,
        totalCost: 128,
        deliveryTimeDays: 5,
        inStock: true,
        url: 'https://autodoc.se',
        lastPriceCheck: '2025-12-20'
      },
      {
        id: 'opt-filter-1b',
        store: 'Mekonomen',
        articleNumber: 'MANN oljefilter',
        price: 149,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 149,
        deliveryTimeDays: 1,
        inStock: true,
        lastPriceCheck: '2025-12-20'
      }
    ]
  },
  {
    id: 'shop-motor-3',
    name: 'Luftfilter (Audi CH 2.0)',
    category: 'Motor',
    estimatedCost: 180,
    quantity: '1 st',
    checked: false,
    status: ShoppingItemStatus.RESEARCH,
    linkedTaskId: 'motor-oil-change',
    options: [
      {
        id: 'opt-air-1a',
        store: 'Autodoc',
        articleNumber: 'MANN C24332',
        price: 129,
        currency: 'SEK',
        shippingCost: 49,
        totalCost: 178,
        deliveryTimeDays: 5,
        inStock: true,
        lastPriceCheck: '2025-12-20'
      },
      {
        id: 'opt-air-1b',
        store: 'Mekonomen',
        articleNumber: 'Luftfilter universal',
        price: 199,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 199,
        deliveryTimeDays: 1,
        inStock: false,
        lastPriceCheck: '2025-12-20'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FAS 3: HÖST - Victron elsystem
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'shop-victron-1',
    name: 'Victron SmartShunt 500A/50mV',
    category: 'El - Victron',
    estimatedCost: 1300,
    quantity: '1 st',
    checked: false,
    status: ShoppingItemStatus.RESEARCH,
    linkedTaskId: 'el-victron-system',
    options: [
      {
        id: 'opt-shunt-1a',
        store: 'Batteriexperten.se',
        articleNumber: 'SHU050150050',
        price: 1195,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 1195,
        deliveryTimeDays: 2,
        inStock: true,
        url: 'https://batteriexperten.se',
        lastPriceCheck: '2025-12-20'
      },
      {
        id: 'opt-shunt-1b',
        store: 'Elfa Distrelec',
        articleNumber: 'Victron SmartShunt',
        price: 1395,
        currency: 'SEK',
        shippingCost: 59,
        totalCost: 1454,
        deliveryTimeDays: 2,
        inStock: true,
        lastPriceCheck: '2025-12-20'
      }
    ]
  },
  {
    id: 'shop-victron-2',
    name: 'Victron SmartSolar MPPT 100/50',
    category: 'El - Victron',
    estimatedCost: 3500,
    quantity: '1 st',
    checked: false,
    status: ShoppingItemStatus.RESEARCH,
    linkedTaskId: 'el-victron-system',
    options: [
      {
        id: 'opt-mppt-1a',
        store: 'Batteriexperten.se',
        articleNumber: 'SCC110050210',
        price: 3295,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 3295,
        deliveryTimeDays: 2,
        inStock: true,
        lastPriceCheck: '2025-12-20'
      },
      {
        id: 'opt-mppt-1b',
        store: 'Solcellsbutiken.se',
        articleNumber: 'Victron MPPT 100/50',
        price: 3495,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 3495,
        deliveryTimeDays: 3,
        inStock: true,
        lastPriceCheck: '2025-12-20'
      }
    ]
  },
  {
    id: 'shop-victron-3',
    name: 'Victron Orion-Tr Smart 12/12-30A DC-DC',
    category: 'El - Victron',
    estimatedCost: 2800,
    quantity: '1 st',
    checked: false,
    status: ShoppingItemStatus.RESEARCH,
    linkedTaskId: 'el-victron-system',
    options: [
      {
        id: 'opt-dcdc-1a',
        store: 'Batteriexperten.se',
        articleNumber: 'ORI121236140',
        price: 2595,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 2595,
        deliveryTimeDays: 2,
        inStock: true,
        lastPriceCheck: '2025-12-20'
      }
    ]
  },
  {
    id: 'shop-victron-4',
    name: 'Victron Phoenix Inverter 12/1200',
    category: 'El - Victron',
    estimatedCost: 3500,
    quantity: '1 st',
    checked: false,
    status: ShoppingItemStatus.RESEARCH,
    linkedTaskId: 'el-victron-system',
    options: [
      {
        id: 'opt-inv-1a',
        store: 'Batteriexperten.se',
        articleNumber: 'PIN121120200',
        price: 3195,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 3195,
        deliveryTimeDays: 2,
        inStock: true,
        lastPriceCheck: '2025-12-20'
      },
      {
        id: 'opt-inv-1b',
        store: 'Batteriexperten.se',
        articleNumber: 'PIN121080200 (800W, billigare)',
        price: 2395,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 2395,
        deliveryTimeDays: 2,
        inStock: true,
        lastPriceCheck: '2025-12-20'
      }
    ]
  },
  {
    id: 'shop-solar-1',
    name: 'Solpanel monokristallin 200W',
    category: 'El - Sol',
    estimatedCost: 3000,
    quantity: '2 st',
    checked: false,
    status: ShoppingItemStatus.RESEARCH,
    linkedTaskId: 'el-victron-system',
    options: [
      {
        id: 'opt-solar-1a',
        store: 'Solcellsbutiken.se',
        articleNumber: 'Mono 200W (kompakt)',
        price: 1395,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 2790,
        deliveryTimeDays: 5,
        inStock: true,
        lastPriceCheck: '2025-12-20'
      },
      {
        id: 'opt-solar-1b',
        store: 'Biltema',
        articleNumber: '85-7200',
        price: 1499,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 2998,
        deliveryTimeDays: 0,
        inStock: true,
        lastPriceCheck: '2025-12-20'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FAS 3: HÖST - Rostbehandling ordentlig
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'shop-rust-1',
    name: 'Hålrumsolja Fluid Film',
    category: 'Rostskydd',
    estimatedCost: 600,
    quantity: '2 liter',
    checked: false,
    status: ShoppingItemStatus.RESEARCH,
    linkedTaskId: 'rust-cavity-treatment',
    options: [
      {
        id: 'opt-cavity-1a',
        store: 'Biltema',
        articleNumber: '36-5680',
        price: 249,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 498,
        deliveryTimeDays: 0,
        inStock: true,
        shelfLocation: 'Gång 12, Rostskydd',
        lastPriceCheck: '2025-12-20'
      },
      {
        id: 'opt-cavity-1b',
        store: 'Mekonomen',
        articleNumber: 'Dinitrol ML',
        price: 349,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 698,
        deliveryTimeDays: 0,
        inStock: true,
        lastPriceCheck: '2025-12-20'
      }
    ]
  },
  {
    id: 'shop-rust-2',
    name: 'Underredsskydd Tectyl',
    category: 'Rostskydd',
    estimatedCost: 1800,
    quantity: '5 liter',
    checked: false,
    status: ShoppingItemStatus.RESEARCH,
    linkedTaskId: 'rust-undercarriage',
    options: [
      {
        id: 'opt-under-1a',
        store: 'Biltema',
        articleNumber: '36-5620 Tectyl',
        price: 299,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 1495,
        deliveryTimeDays: 0,
        inStock: true,
        lastPriceCheck: '2025-12-20'
      },
      {
        id: 'opt-under-1b',
        store: 'Mekonomen',
        articleNumber: 'Dinitrol UB',
        price: 399,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 1995,
        deliveryTimeDays: 0,
        inStock: true,
        lastPriceCheck: '2025-12-20'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FAS 3: HÖST - Isolering om
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'shop-insul-1',
    name: 'Armaflex AF 19mm självhäftande',
    category: 'Isolering',
    estimatedCost: 2500,
    quantity: '15 m²',
    checked: false,
    status: ShoppingItemStatus.RESEARCH,
    linkedTaskId: 'insulation-redo',
    options: [
      {
        id: 'opt-arma-1a',
        store: 'Bauhaus',
        articleNumber: 'Armaflex AF 19mm',
        price: 159,
        currency: 'SEK',
        shippingCost: 99,
        totalCost: 2484,
        deliveryTimeDays: 3,
        inStock: true,
        lastPriceCheck: '2025-12-20'
      },
      {
        id: 'opt-arma-1b',
        store: 'K-Rauta',
        articleNumber: 'Armacell självhäftande',
        price: 179,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 2685,
        deliveryTimeDays: 5,
        inStock: false,
        lastPriceCheck: '2025-12-20'
      }
    ]
  },
  {
    id: 'shop-insul-2',
    name: 'Armaflex kontaktlim',
    category: 'Isolering',
    estimatedCost: 200,
    quantity: '1 liter',
    checked: false,
    status: ShoppingItemStatus.RESEARCH,
    linkedTaskId: 'insulation-redo',
    options: [
      {
        id: 'opt-glue-1a',
        store: 'Bauhaus',
        articleNumber: 'Armaflex 520',
        price: 189,
        currency: 'SEK',
        shippingCost: 0,
        totalCost: 189,
        deliveryTimeDays: 3,
        inStock: true,
        lastPriceCheck: '2025-12-20'
      }
    ]
  }
];

// =============================================================================
// TASKS - Organiserade per fas och område
// =============================================================================

const ELTON_TASKS: Task[] = [
  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║  FAS 1: JANUARI - AKUT & FÖRBEREDELSE                                    ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  // --- El: Tillfälligt bodelsbatteri ---
  {
    id: 'el-temp-battery',
    type: TaskType.BUILD,
    title: 'Bygg tillfälligt LiFePO4-bodelsbatteri',
    description: `Fristående 12V-system för bodelen som möjliggör enklare utflykter innan komplett Victron-system installeras.

**Komponenter:**
- 4x LiFePO4 280Ah celler (EVE/CATL)
- JK BMS eller Daly 100-200A
- Huvudsäkring 150-200A (inom 30cm från pol!)
- 25-35mm² kablar för huvudmatning
- Egenbyggd batterilåda

**Koncept:** Systemet körs separat från fordonsel. Laddas via befintlig solpanel. Kan senare integreras i Victron-systemet.

**Säkerhet:** Huvudsäkring MÅSTE sitta nära batteriet!`,
    status: TaskStatus.TODO,
    priority: Priority.HIGH,
    buildPhase: BuildPhase.B2_SYSTEMS,
    phase: 'Fas 1: Januari',
    estimatedCostMin: 8000,
    estimatedCostMax: 14000,
    actualCost: 0,
    weightKg: 35,
    costType: CostType.INVESTMENT,
    difficultyLevel: 'Expert',
    requiredTools: ['Momentnyckel', 'Krympslang', 'Kabelsax', 'Multimeter'],
    tags: ['El', 'LiFePO4', 'Prioritet'],
    links: [
      { id: 'l-bat-1', title: 'Will Prowse LiFePO4 guide', url: 'https://www.youtube.com/willprowse' }
    ],
    comments: [
      { 
        id: 'c-bat-1', 
        text: 'Kan återanvända befintlig EPever-regulator tillfälligt, eller köpa Victron MPPT nu som investering för framtida system.', 
        createdAt: '2025-12-20', 
        author: 'ai' 
      }
    ],
    attachments: [],
    subtasks: [
      { id: 'st-bat-1', title: 'Beställ LiFePO4-celler', completed: false },
      { id: 'st-bat-2', title: 'Beställ BMS', completed: false },
      { id: 'st-bat-3', title: 'Bygg batterilåda', completed: false },
      { id: 'st-bat-4', title: 'Koppla celler + BMS', completed: false },
      { id: 'st-bat-5', title: 'Installera huvudsäkring', completed: false },
      { id: 'st-bat-6', title: 'Koppla till solpanel', completed: false },
      { id: 'st-bat-7', title: 'Testa system', completed: false }
    ],
    created: '2025-12-20T10:00:00Z',
    lastModified: '2025-12-20T10:00:00Z'
  },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║  FAS 1: VÅR - TÄTNING & ROSTBROMSNING                                    ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  // --- Tak: Tätning ---
  {
    id: 'rust-roof-seal',
    type: TaskType.MAINTENANCE,
    title: 'Täta takskarv och läckagepunkter (temporärt)',
    description: `Stoppa aktivt vattenläckage vid förardörren innan sommaren.

**Problem identifierade:**
- Spricka i takskarv ovanför förardörren (huvudläcka)
- Osäkra skruvar utan tätning
- Sprucken fog vid taklucka
- Läckage vid markisfäste

**Metod:**
1. Rengör ytor med stålborste
2. Applicera rostomvandlare på synlig rost
3. Låt torka 24h
4. Tunn primer
5. Sikaflex i alla skarvar och runt skruvar

**OBS:** Detta är en TEMPORÄR lösning som köper tid. Ordentlig behandling görs höst/vinter med garage.`,
    status: TaskStatus.TODO,
    priority: Priority.HIGH,
    mechanicalPhase: MechanicalPhase.P2_RUST,
    phase: 'Fas 1: Vår',
    estimatedCostMin: 400,
    estimatedCostMax: 800,
    actualCost: 0,
    weightKg: 0,
    costType: CostType.OPERATION,
    difficultyLevel: 'Easy',
    requiredTools: ['Stålborste', 'Fogpistol', 'Skrapa', 'Trasor'],
    tags: ['Rost', 'Tak', 'Läckage', 'Akut'],
    links: [],
    comments: [
      { 
        id: 'c-seal-1', 
        text: 'Bra att bilen nu är täckt med kapell - skyddar medan vi planerar.', 
        createdAt: '2025-12-20', 
        author: 'user' 
      }
    ],
    attachments: [],
    subtasks: [
      { id: 'st-seal-1', title: 'Köp material (Sikaflex, rostomvandlare, primer)', completed: false },
      { id: 'st-seal-2', title: 'Rengör takskarv vid förardörren', completed: false },
      { id: 'st-seal-3', title: 'Applicera rostomvandlare', completed: false },
      { id: 'st-seal-4', title: 'Vänta 24h', completed: false },
      { id: 'st-seal-5', title: 'Primer på rostbehandlade ytor', completed: false },
      { id: 'st-seal-6', title: 'Sikaflex i skarven', completed: false },
      { id: 'st-seal-7', title: 'Täta lösa skruvar', completed: false },
      { id: 'st-seal-8', title: 'Täta runt taklucka (temporärt)', completed: false }
    ],
    created: '2025-12-20T10:00:00Z',
    lastModified: '2025-12-20T10:00:00Z'
  },

  // --- Rost: Punktbehandling ---
  {
    id: 'rust-spot-treatment',
    type: TaskType.MAINTENANCE,
    title: 'Punktbehandla synliga rostgenomslag',
    description: `Bromsa rostspridning på alla synliga rostgenomslag.

**Identifierade punkter:**
- Vattenränna/horisontell list (runt hela bilen)
- Vid solpanelfäste
- Framkant glasfibertak
- Diverse småpunkter på kaross

**Metod:**
1. Borsta bort lös rost
2. Rostomvandlare
3. Primer + bättringsfärg ELLER Tectyl/Fluid Film på dolda ytor

**Mål:** Inte snyggt, men STOPPAR rosten från att sprida sig.`,
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
    mechanicalPhase: MechanicalPhase.P2_RUST,
    phase: 'Fas 1: Vår',
    estimatedCostMin: 300,
    estimatedCostMax: 600,
    actualCost: 0,
    weightKg: 0,
    costType: CostType.OPERATION,
    difficultyLevel: 'Easy',
    requiredTools: ['Stålborste', 'Vinkelslip med stålborste', 'Pensel'],
    tags: ['Rost', 'Kaross'],
    links: [],
    comments: [],
    attachments: [],
    subtasks: [
      { id: 'st-spot-1', title: 'Kartlägg alla rostpunkter', completed: false },
      { id: 'st-spot-2', title: 'Borsta rent', completed: false },
      { id: 'st-spot-3', title: 'Rostomvandlare på alla punkter', completed: false },
      { id: 'st-spot-4', title: 'Primer/bättringsfärg', completed: false }
    ],
    created: '2025-12-20T10:00:00Z',
    lastModified: '2025-12-20T10:00:00Z'
  },

  // --- Motor: Minimal service ---
  {
    id: 'motor-oil-change',
    type: TaskType.MAINTENANCE,
    title: 'Motor minimal service',
    description: `Hålla motorn vid liv med minimal investering tills beslut om byte tas.

**Åtgärder:**
- Oljebyte (10W-40 Mineral, 6 liter)
- Byt oljefilter
- Kontrollera/byt luftfilter (sitter otätt enligt inspektion)
- Monitorera oljeförbrukning

**BESLUT:** Vi investerar INTE i kamrem, vattenpump eller stor service nu. Motorn har okänd historik och har körts med mycket startgas. Vi kör och utvärderar i sommar.

**Framtid:** Om motorn håller - överväg service. Om problem - planera motorbyte (diesel eller starkare bensin).`,
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
    mechanicalPhase: MechanicalPhase.P1_ENGINE,
    phase: 'Fas 1: Vår',
    estimatedCostMin: 500,
    estimatedCostMax: 800,
    actualCost: 0,
    weightKg: 0,
    costType: CostType.OPERATION,
    difficultyLevel: 'Easy',
    requiredTools: ['Oljefilteravdragare', 'Uppsamlingskärl', '17mm nyckel'],
    tags: ['Motor', 'Service', 'DIY'],
    links: [],
    comments: [
      { 
        id: 'c-mot-1', 
        text: 'Strategiskt beslut: Minimal insats nu, utvärdera efter sommaren.', 
        createdAt: '2025-12-20', 
        author: 'ai' 
      }
    ],
    attachments: [],
    subtasks: [
      { id: 'st-oil-1', title: 'Köp olja och filter', completed: false },
      { id: 'st-oil-2', title: 'Byt motorolja', completed: false },
      { id: 'st-oil-3', title: 'Byt oljefilter', completed: false },
      { id: 'st-oil-4', title: 'Kontrollera luftfilter', completed: false },
      { id: 'st-oil-5', title: 'Notera oljenivå för framtida jämförelse', completed: false }
    ],
    created: '2025-12-20T10:00:00Z',
    lastModified: '2025-12-20T10:00:00Z'
  },

  // --- Markis: Demontering ---
  {
    id: 'awning-remove',
    type: TaskType.MAINTENANCE,
    title: 'Demontera markis för inspektion',
    description: `Ta bort markisen för att inspektera glasfibertaket under fästena.

**Syfte:**
- Se skador under fästena
- Behandla/täta glasfibern
- Besluta om markisen är värd att sätta tillbaka

**Vid demontering:**
- Dokumentera hur den sitter
- Spara alla fästen och skruvar
- Inspektera glasfibern noga

**Efter inspektion:** Täta alla skruvhål ordentligt (Sikaflex) oavsett om markisen återmonteras.`,
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
    mechanicalPhase: MechanicalPhase.P2_RUST,
    phase: 'Fas 1: Vår',
    estimatedCostMin: 0,
    estimatedCostMax: 200,
    actualCost: 0,
    weightKg: -15,
    costType: CostType.OPERATION,
    difficultyLevel: 'Easy',
    requiredTools: ['Skruvdragare', 'Insexnycklar', 'Stege'],
    tags: ['Tak', 'Markis', 'Inspektion'],
    links: [],
    comments: [],
    attachments: [],
    subtasks: [
      { id: 'st-awn-1', title: 'Fotografera montering', completed: false },
      { id: 'st-awn-2', title: 'Demontera markis', completed: false },
      { id: 'st-awn-3', title: 'Inspektera glasfiber under fästen', completed: false },
      { id: 'st-awn-4', title: 'Dokumentera skador', completed: false },
      { id: 'st-awn-5', title: 'Beslut om återmontering', completed: false }
    ],
    created: '2025-12-20T10:00:00Z',
    lastModified: '2025-12-20T10:00:00Z'
  },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║  FAS 2: SOMMAR - KÖRA & LÄRA KÄNNA BILEN                                 ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  // --- Taklucka byte ---
  {
    id: 'roof-hatch-replace',
    type: TaskType.BUILD,
    title: 'Byt taklucka till modern',
    description: `Ersätt gammal läckande taklucka med modern husbilslucka.

**Befintligt problem:**
- Rostig ram
- Spruckna/gamla tätningar
- Svårt att få tätt

**Rekommenderade alternativ:**
- Fiamma Vent 40 (40x40cm) - ca 1200 kr
- Fiamma Turbo Vent (med fläkt) - ca 2000 kr  
- Dometic Mini Heki - ca 1700 kr
- MPK VisionVent (budget) - ca 900 kr

**VIKTIGT innan köp:**
- Mät befintligt hål (invändigt mått)
- Mät taktjocklek (glasfiber + isolering)
- Bestäm om ni vill ha inbyggd fläkt

**Installation:**
- Ny lucka kommer med tätningar och monteringsanvisning
- Sikaflex runt för extra säkerhet`,
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
    buildPhase: BuildPhase.B1_SHELL,
    phase: 'Fas 2: Sommar',
    estimatedCostMin: 900,
    estimatedCostMax: 2500,
    actualCost: 0,
    weightKg: 3,
    costType: CostType.INVESTMENT,
    difficultyLevel: 'Medium',
    requiredTools: ['Sticksåg', 'Skruvdragare', 'Fogpistol', 'Måttband'],
    tags: ['Tak', 'Uppgradering', 'Tätning'],
    links: [],
    comments: [],
    attachments: [],
    subtasks: [
      { id: 'st-hatch-1', title: 'Mät befintligt hål', completed: false },
      { id: 'st-hatch-2', title: 'Mät taktjocklek', completed: false },
      { id: 'st-hatch-3', title: 'Välj och beställ lucka', completed: false },
      { id: 'st-hatch-4', title: 'Demontera gammal lucka', completed: false },
      { id: 'st-hatch-5', title: 'Anpassa hål om nödvändigt', completed: false },
      { id: 'st-hatch-6', title: 'Montera ny lucka med Sikaflex', completed: false }
    ],
    decisionOptions: [
      {
        id: 'hatch-opt-1',
        title: 'Budget: MPK VisionVent',
        description: 'Enkel lucka utan fläkt. Fungerar bra för ventilation.',
        costRange: '900 kr',
        pros: ['Billigast', 'Finns på Biltema', 'Enkel montering'],
        cons: ['Ingen fläkt', 'Enklare kvalitet']
      },
      {
        id: 'hatch-opt-2',
        title: 'Standard: Fiamma Vent 40',
        description: 'Populärt val för husbilar. Bra kvalitet och tätning.',
        costRange: '1 200-1 300 kr',
        pros: ['Pålitlig', 'Bra tätningar', 'Lätt att få tag på reservdelar'],
        cons: ['Ingen fläkt'],
        recommended: true
      },
      {
        id: 'hatch-opt-3',
        title: 'Premium: Dometic Mini Heki',
        description: 'Premiumalternativ med bättre isolering.',
        costRange: '1 700 kr',
        pros: ['Bäst isolering', 'Hög kvalitet'],
        cons: ['Dyrare', 'Längre leverans']
      },
      {
        id: 'hatch-opt-4',
        title: 'Med fläkt: Fiamma Turbo Vent',
        description: 'Inbyggd 12V-fläkt för aktiv ventilation.',
        costRange: '2 200 kr',
        pros: ['Aktiv ventilation', 'Bra vid matlagning/sömn', 'Termostat'],
        cons: ['Dyrast', 'Kräver 12V-anslutning', 'Mer att gå sönder']
      }
    ],
    created: '2025-12-20T10:00:00Z',
    lastModified: '2025-12-20T10:00:00Z'
  },

  // --- Hitta begagnade dörrar ---
  {
    id: 'door-search',
    type: TaskType.PURCHASE,
    title: 'Leta begagnade dörrar (skjut + förare)',
    description: `Hitta begagnade dörrar i bättre skick än befintliga.

**Behov:**
1. Skjutdörr - KRITISK (helt genomrostad nederkant och ramverk)
2. Förardörr - HÖG (genomrostad nederkant)

**Var leta:**
- Blocket (sök "VW LT delar")
- Facebook-grupper för VW LT
- eBay Kleinanzeigen (Tyskland - större utbud!)
- LT-forum och entusiastgrupper
- Bilskrotar specialiserade på äldre fordon

**Vid skjutdörr - kolla att:**
- Skena följer med (era är slitna)
- Rullarna är i bra skick
- Fönster/ventil fungerar

**Vid förardörr - kolla att:**
- Fönstermekanism följer med
- Låscylinder kan flyttas över (behåll samma nyckel)

**Budget:** ca 2000-3000 kr per dörr + eventuell frakt från Tyskland`,
    status: TaskStatus.TODO,
    priority: Priority.HIGH,
    phase: 'Fas 2: Sommar',
    estimatedCostMin: 4000,
    estimatedCostMax: 8000,
    actualCost: 0,
    weightKg: 0,
    costType: CostType.INVESTMENT,
    difficultyLevel: 'Easy',
    tags: ['Dörrar', 'Begagnat', 'Inköp'],
    links: [
      { id: 'l-door-1', title: 'Blocket VW LT', url: 'https://www.blocket.se' },
      { id: 'l-door-2', title: 'eBay Kleinanzeigen', url: 'https://www.kleinanzeigen.de' }
    ],
    comments: [
      { 
        id: 'c-door-1', 
        text: '1300 LT-bilar kvar i drift i Sverige, regelbunden skrotning. Borde gå att hitta.', 
        createdAt: '2025-12-20', 
        author: 'user' 
      }
    ],
    attachments: [],
    subtasks: [
      { id: 'st-door-1', title: 'Sätt upp Blocket-bevakning', completed: false },
      { id: 'st-door-2', title: 'Kolla tyska annonser', completed: false },
      { id: 'st-door-3', title: 'Kontakta LT-forum', completed: false },
      { id: 'st-door-4', title: 'Hitta skjutdörr', completed: false },
      { id: 'st-door-5', title: 'Hitta förardörr', completed: false }
    ],
    created: '2025-12-20T10:00:00Z',
    lastModified: '2025-12-20T10:00:00Z'
  },

  // ╔═══════════════════════════════════════════════════════════════════════════╗
  // ║  FAS 3: HÖST/VINTER - STORA JOBB MED GARAGE                              ║
  // ╚═══════════════════════════════════════════════════════════════════════════╝

  // --- Byt skjutdörr ---
  {
    id: 'door-sliding-replace',
    type: TaskType.MAINTENANCE,
    title: 'Byt skjutdörr',
    description: `Montera begagnad skjutdörr.

**Befintligt problem:**
- Hela nedre ramverket genomrostat
- Perforerad plåt
- Exponerade kablar
- Dörren "hänger" (slitna rullar + inget stöd nertill)

**Inte värt att reparera** - hela dörrens struktur är förstörd.

**Vid byte:**
- Dokumentera kabeldragning innan demontering
- Byt eventuellt skena och rullar samtidigt
- Justera för bra passform
- Smörj alla glidytor`,
    status: TaskStatus.BLOCKED,
    priority: Priority.HIGH,
    mechanicalPhase: MechanicalPhase.P2_RUST,
    phase: 'Fas 3: Höst/Vinter',
    blockers: [{ taskId: 'door-search', reason: 'Måste hitta begagnad dörr först' }],
    estimatedCostMin: 3000,
    estimatedCostMax: 5000,
    actualCost: 0,
    weightKg: 0,
    costType: CostType.INVESTMENT,
    difficultyLevel: 'Medium',
    requiredTools: ['Hylsnycklar', 'Skruvdragare', 'Domkraft', 'Hjälp (dörren är tung!)'],
    tags: ['Dörrar', 'Kaross', 'Stort jobb'],
    links: [],
    comments: [],
    attachments: [],
    subtasks: [
      { id: 'st-sdoor-1', title: 'Dokumentera kablar', completed: false },
      { id: 'st-sdoor-2', title: 'Demontera gammal dörr', completed: false },
      { id: 'st-sdoor-3', title: 'Inspektera skena och fästen', completed: false },
      { id: 'st-sdoor-4', title: 'Montera ny dörr', completed: false },
      { id: 'st-sdoor-5', title: 'Justera och smörj', completed: false },
      { id: 'st-sdoor-6', title: 'Testa funktion', completed: false }
    ],
    created: '2025-12-20T10:00:00Z',
    lastModified: '2025-12-20T10:00:00Z'
  },

  // --- Byt förardörr ---
  {
    id: 'door-driver-replace',
    type: TaskType.MAINTENANCE,
    title: 'Byt förardörr',
    description: `Montera begagnad förardörr.

**Befintligt problem:**
- Nederkant helt genomrostad
- Lack och spackel hänger löst
- Fukt tränger in i balk ovanför

**Enklare byte än skjutdörr** - vanliga gångjärn.

**Vid byte:**
- Flytta över låscylinder (behåll samma nyckel)
- Kolla att fönstermekanism fungerar på ny dörr
- Justera gångjärn för bra passform`,
    status: TaskStatus.BLOCKED,
    priority: Priority.HIGH,
    mechanicalPhase: MechanicalPhase.P2_RUST,
    phase: 'Fas 3: Höst/Vinter',
    blockers: [{ taskId: 'door-search', reason: 'Måste hitta begagnad dörr först' }],
    estimatedCostMin: 2000,
    estimatedCostMax: 3500,
    actualCost: 0,
    weightKg: 0,
    costType: CostType.INVESTMENT,
    difficultyLevel: 'Medium',
    requiredTools: ['Hylsnycklar', 'Skruvdragare', 'Stöd för dörr'],
    tags: ['Dörrar', 'Kaross'],
    links: [],
    comments: [],
    attachments: [],
    subtasks: [
      { id: 'st-ddoor-1', title: 'Demontera gammal dörr', completed: false },
      { id: 'st-ddoor-2', title: 'Flytta låscylinder', completed: false },
      { id: 'st-ddoor-3', title: 'Montera ny dörr', completed: false },
      { id: 'st-ddoor-4', title: 'Justera gångjärn', completed: false }
    ],
    created: '2025-12-20T10:00:00Z',
    lastModified: '2025-12-20T10:00:00Z'
  },

  // --- Svetsa underredsbalk ---
  {
    id: 'rust-beam-weld',
    type: TaskType.MAINTENANCE,
    title: 'Svetsa underredsbalk',
    description: `Reparera rostskadad tvärbalk under chassi.

**Skada:**
- Lokaliserad röta i bottensektion av balk
- Joel bedömde: "Bättre än befarat" - inte kritiskt men behöver åtgärdas
- Resten av underredet är i bra skick

**Metod:**
1. Rengör och bedöm omfattning
2. Skär bort dålig plåt
3. Svetsa in ny plåt
4. Rostskydda ordentligt

**Kräver:** MIG-svets och erfarenhet (Joel)`,
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
    mechanicalPhase: MechanicalPhase.P2_RUST,
    phase: 'Fas 3: Höst/Vinter',
    estimatedCostMin: 500,
    estimatedCostMax: 2000,
    actualCost: 0,
    weightKg: 1,
    costType: CostType.INVESTMENT,
    difficultyLevel: 'Expert',
    requiredTools: ['MIG-svets', 'Vinkelslip', 'Plåtsax', 'Rostskydd'],
    tags: ['Rost', 'Svets', 'Underrede', 'Struktur'],
    links: [],
    comments: [
      { 
        id: 'c-beam-1', 
        text: 'Joel: "Inte så illa som jag trodde - lokaliserat och hanterbart"', 
        createdAt: '2025-12-20', 
        author: 'user' 
      }
    ],
    attachments: [],
    subtasks: [
      { id: 'st-beam-1', title: 'Rengör och bedöm', completed: false },
      { id: 'st-beam-2', title: 'Skär bort dålig plåt', completed: false },
      { id: 'st-beam-3', title: 'Svetsa ny plåt', completed: false },
      { id: 'st-beam-4', title: 'Rostskydda', completed: false }
    ],
    created: '2025-12-20T10:00:00Z',
    lastModified: '2025-12-20T10:00:00Z'
  },

  // --- Hålrumsbehandling ---
  {
    id: 'rust-cavity-treatment',
    type: TaskType.MAINTENANCE,
    title: 'Hålrumsbehandling (rostskyddsolja)',
    description: `Spruta in rostskyddsolja i alla hålrum och balkar.

**Områden:**
- Dörrbalkar
- Takbalkar (vid förardörren)
- Chassibalkar
- Alla dolda utrymmen

**Produkter:**
- Fluid Film
- Dinitrol ML
- Tectyl ML

**Metod:**
Kräver hålrumspistol och tryckluft, eller professionell behandling.`,
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
    mechanicalPhase: MechanicalPhase.P2_RUST,
    phase: 'Fas 3: Höst/Vinter',
    estimatedCostMin: 1000,
    estimatedCostMax: 3000,
    actualCost: 0,
    weightKg: 0,
    costType: CostType.INVESTMENT,
    difficultyLevel: 'Medium',
    requiredTools: ['Hålrumspistol', 'Kompressor', 'Skyddsglasögon'],
    tags: ['Rost', 'Skydd', 'Förebyggande'],
    links: [],
    comments: [],
    attachments: [],
    subtasks: [
      { id: 'st-cav-1', title: 'Identifiera alla hålrum', completed: false },
      { id: 'st-cav-2', title: 'Köp rostskyddsolja', completed: false },
      { id: 'st-cav-3', title: 'Behandla dörrbalkar', completed: false },
      { id: 'st-cav-4', title: 'Behandla takbalkar', completed: false },
      { id: 'st-cav-5', title: 'Behandla chassi', completed: false }
    ],
    created: '2025-12-20T10:00:00Z',
    lastModified: '2025-12-20T10:00:00Z'
  },

  // --- Underredsbehandling ---
  {
    id: 'rust-undercarriage',
    type: TaskType.MAINTENANCE,
    title: 'Underredsbehandling',
    description: `Komplett underredsbehandling efter svetsarbeten är klara.

**Förutsättningar:**
- Alla svetsarbeten klara
- Underredet rengjort (högtryckstvätt)
- Torrt

**Produkter:**
- Tectyl
- Dinitrol
- Eller professionell behandling

**Kostnad DIY:** ca 2000-3000 kr
**Kostnad professionell:** ca 4000-6000 kr`,
    status: TaskStatus.BLOCKED,
    priority: Priority.MEDIUM,
    mechanicalPhase: MechanicalPhase.P2_RUST,
    phase: 'Fas 3: Höst/Vinter',
    blockers: [{ taskId: 'rust-beam-weld', reason: 'Svetsarbeten måste vara klara först' }],
    estimatedCostMin: 2000,
    estimatedCostMax: 6000,
    actualCost: 0,
    weightKg: 0,
    costType: CostType.INVESTMENT,
    difficultyLevel: 'Medium',
    requiredTools: ['Högtryckstvätt', 'Kompressor', 'Sprutpistol'],
    tags: ['Rost', 'Underrede', 'Skydd'],
    links: [],
    comments: [],
    attachments: [],
    subtasks: [],
    created: '2025-12-20T10:00:00Z',
    lastModified: '2025-12-20T10:00:00Z'
  },

  // --- Isolering om ---
  {
    id: 'insulation-redo',
    type: TaskType.BUILD,
    title: 'Gör om isolering (förarhytt + taklucka)',
    description: `Riva och göra om isoleringen i förarhyttsområdet.

**Problem med befintlig:**
- XPS-skivor slarvigt monterade
- Stora glipor till yttertak
- Ingen ångspärr
- Risk för kondens

**Bodelen är OK** - kan behållas.

**Ny isolering:**
- Armaflex 19mm direkt på plåt (självhäftande + kontaktlim)
- Täta alla skarvar
- Ordentlig finish

**Samtidigt:**
- Rostbehandla synlig plåt i balken ovanför förardörren
- Dokumentera och förbättra kabeldragning`,
    status: TaskStatus.BLOCKED,
    priority: Priority.LOW,
    buildPhase: BuildPhase.B1_SHELL,
    phase: 'Fas 3: Höst/Vinter',
    blockers: [
      { taskId: 'rust-roof-seal', reason: 'Läckage måste vara stoppat' },
      { taskId: 'roof-hatch-replace', reason: 'Ny lucka bör vara på plats' }
    ],
    estimatedCostMin: 2000,
    estimatedCostMax: 4000,
    actualCost: 0,
    weightKg: 5,
    costType: CostType.INVESTMENT,
    difficultyLevel: 'Medium',
    requiredTools: ['Mattkniv', 'Kontaktlim', 'Stålborste', 'Rostomvandlare'],
    tags: ['Isolering', 'Inredning', 'Komfort'],
    links: [],
    comments: [],
    attachments: [],
    subtasks: [
      { id: 'st-ins-1', title: 'Riva befintlig isolering förarhytt', completed: false },
      { id: 'st-ins-2', title: 'Rostbehandla synlig plåt', completed: false },
      { id: 'st-ins-3', title: 'Montera Armaflex', completed: false },
      { id: 'st-ins-4', title: 'Täta alla skarvar', completed: false },
      { id: 'st-ins-5', title: 'Montera innertak', completed: false }
    ],
    decisionOptions: [
      {
        id: 'ins-opt-1',
        title: 'Armaflex (självhäftande)',
        description: 'Gummiisolering som fäster direkt på plåt. Fungerar som ångspärr.',
        costRange: '2 500-3 500 kr',
        pros: ['Enkel montering', 'Ångspärr inbyggd', 'Följer konturer', 'Ingen kondens mot plåt'],
        cons: ['Dyrare per m²', 'Svårt att återanvända'],
        recommended: true
      },
      {
        id: 'ins-opt-2',
        title: 'XPS-skivor + ångspärr',
        description: 'Styva skivor som befintlig isolering. Kräver separat ångspärr.',
        costRange: '1 500-2 000 kr',
        pros: ['Billigare', 'Bra R-värde', 'Lätt att skära'],
        cons: ['Kräver separat ångspärr', 'Glipor vid ojämna ytor', 'Befintlig lösning var dålig']
      },
      {
        id: 'ins-opt-3',
        title: 'Fårull / Naturmaterial',
        description: 'Ekologiskt alternativ som andas.',
        costRange: '3 000-4 500 kr',
        pros: ['Naturligt', 'Fukthanterande', 'Miljövänligt'],
        cons: ['Dyrt', 'Kräver noggrann ventilation', 'Kan mögla om fel']
      }
    ],
    created: '2025-12-20T10:00:00Z',
    lastModified: '2025-12-20T10:00:00Z'
  },

  // --- Victron elsystem ---
  {
    id: 'el-victron-system',
    type: TaskType.BUILD,
    title: 'Installera komplett Victron-elsystem',
    description: `Uppgradera till professionellt Victron-baserat elsystem.

**Komponenter:**
- Victron SmartShunt (batteriövervakning)
- Victron MPPT 100/30 eller 100/50 (solregulator)
- Victron Orion-Tr Smart (DC-DC laddning från generator)
- Victron Phoenix Inverter (12V→230V)
- 2x 200W solpaneler (ersätter gammal)
- Integration av LiFePO4-batteri från januari

**Samtidigt:**
- Städa upp fordonsel (säkringsskåp)
- Ny kabeldragning med rätt dimensioner
- Ordentlig dokumentation

**Fördelar:**
- Bluetooth-övervakning via app
- Effektiv laddning (MPPT vs PWM)
- Säker laddning av LiFePO4 från generator
- 230V för laptop etc.`,
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
    buildPhase: BuildPhase.B2_SYSTEMS,
    phase: 'Fas 3: Höst/Vinter',
    estimatedCostMin: 12000,
    estimatedCostMax: 20000,
    actualCost: 0,
    weightKg: 30,
    costType: CostType.INVESTMENT,
    difficultyLevel: 'Expert',
    requiredTools: ['Krympverktyg', 'Multimeter', 'Kabelsax', 'Skruvdragare'],
    tags: ['El', 'Victron', 'Sol', 'Uppgradering'],
    links: [
      { id: 'l-vic-1', title: 'Victron dokumentation', url: 'https://www.victronenergy.com' }
    ],
    comments: [
      { 
        id: 'c-vic-1', 
        text: 'LiFePO4-batteriet från januari integreras i detta system', 
        createdAt: '2025-12-20', 
        author: 'ai' 
      }
    ],
    attachments: [],
    subtasks: [
      { id: 'st-vic-1', title: 'Rita komplett elschema', completed: false },
      { id: 'st-vic-2', title: 'Beställ Victron-komponenter', completed: false },
      { id: 'st-vic-3', title: 'Beställ solpaneler', completed: false },
      { id: 'st-vic-4', title: 'Demontera gammalt system', completed: false },
      { id: 'st-vic-5', title: 'Montera solpaneler på tak', completed: false },
      { id: 'st-vic-6', title: 'Installera MPPT', completed: false },
      { id: 'st-vic-7', title: 'Installera SmartShunt', completed: false },
      { id: 'st-vic-8', title: 'Installera Orion DC-DC', completed: false },
      { id: 'st-vic-9', title: 'Installera inverter', completed: false },
      { id: 'st-vic-10', title: 'Städa fordonsel', completed: false },
      { id: 'st-vic-11', title: 'Testa och dokumentera', completed: false }
    ],
    decisionOptions: [
      {
        id: 'vic-opt-1',
        title: 'Bas: 200W sol + grundsystem',
        description: 'MPPT 75/15, SmartShunt, befintligt batteri.',
        costRange: '5 000-7 000 kr',
        pros: ['Billigast', 'Räcker för LED + laddning'],
        cons: ['Ingen DC-DC', 'Klarar inte kompressorkyl', 'Ingen inverter']
      },
      {
        id: 'vic-opt-2',
        title: 'Standard: 400W sol + DC-DC + inverter 800W',
        description: 'MPPT 100/50, Orion DC-DC, Phoenix 800W, SmartShunt.',
        costRange: '12 000-16 000 kr',
        pros: ['Komplett system', 'Laddning från körning', 'Klarar kompressorkyl'],
        cons: ['Medelkostnad'],
        recommended: true
      },
      {
        id: 'vic-opt-3',
        title: 'Premium: 400W + Multiplus',
        description: 'Full integration med landström-laddning via Multiplus.',
        costRange: '20 000-25 000 kr',
        pros: ['Allt-i-ett', 'Landström-laddning', 'Övervakningsapp'],
        cons: ['Dyrt', 'Komplex installation', 'Overkill för ert behov?']
      }
    ],
    created: '2025-12-20T10:00:00Z',
    lastModified: '2025-12-20T10:00:00Z'
  },

  // --- Motor utvärdering ---
  {
    id: 'motor-evaluation',
    type: TaskType.IDEA,
    title: 'Utvärdera motor efter sommarkörning',
    description: `Efter sommarens körning - beslut om motorns framtid.

**Utvärderingskriterier:**
- Oljeförbrukning (mät regelbundet)
- Startbeteende
- Effekt i backar
- Ovanliga ljud
- Överhettning

**Alternativ:**
1. **Motorn håller bra** → Överväg större service (kamrem, vattenpump)
2. **Motorn är tveksam** → Planera motorbyte

**Motorbytesalternativ:**
- Volvo D24 / D24T (diesel, populärt val)
- Starkare bensinmotor
- Dieselkonvertering ger bättre moment och ekonomi`,
    status: TaskStatus.IDEA,
    priority: Priority.LOW,
    phase: 'Fas 3: Höst/Vinter',
    estimatedCostMin: 0,
    estimatedCostMax: 30000,
    actualCost: 0,
    weightKg: 0,
    costType: CostType.INVESTMENT,
    difficultyLevel: 'Expert',
    tags: ['Motor', 'Beslut', 'Framtid'],
    links: [],
    comments: [],
    attachments: [],
    subtasks: [],
    decisionOptions: [
      {
        id: 'mot-opt-1',
        title: 'Behåll och serva',
        description: 'Om motorn visar sig hålla bra - investera i kamrem, vattenpump, etc.',
        costRange: '10 000 - 15 000 kr',
        pros: ['Känd motor', 'Billigare än byte'],
        cons: ['Fortfarande svag (75hk)', 'Okänd återstående livslängd']
      },
      {
        id: 'mot-opt-2',
        title: 'Dieselkonvertering (D24)',
        description: 'Byt till Volvo D24 eller D24T diesel',
        costRange: '15 000 - 30 000 kr',
        pros: ['Mer moment', 'Bättre bränsle', 'Pålitlig motor'],
        cons: ['Stort jobb', 'Kräver anpassningar'],
        recommended: true
      },
      {
        id: 'mot-opt-3',
        title: 'Kör tills den dör',
        description: 'Minimal investering, byt när den går sönder',
        costRange: '0 kr (nu)',
        pros: ['Billigt nu', 'Kanske håller länge'],
        cons: ['Risk för haveri', 'Oplanerat stopp']
      }
    ],
    created: '2025-12-20T10:00:00Z',
    lastModified: '2025-12-20T10:00:00Z'
  }
];

// =============================================================================
// SERVICE LOG
// =============================================================================

const SERVICE_LOG_ITEMS: ServiceItem[] = [
  {
    id: 'h1',
    date: '2025-12-05',
    description: 'Köp av Elton! Projektstart.',
    mileage: '3 362 mil',
    performer: 'Hanna',
    type: 'Övrigt'
  },
  {
    id: 'h2',
    date: '2025-11-04',
    description: 'Bilen ställdes av',
    mileage: '3 362 mil',
    performer: 'Transportstyrelsen',
    type: 'Övrigt'
  },
  {
    id: 'h3',
    date: '2025-08-13',
    description: 'Besiktning (Godkänd)',
    mileage: '3 362 mil',
    performer: 'Bilprovningen',
    type: 'Besiktning'
  },
  {
    id: 'h4',
    date: '2025-12-20',
    description: 'Detaljerad inspektion med Joel. 68 anmärkningar, 20 positiva. Se inspektionsdata.',
    mileage: '3 362 mil',
    performer: 'Joel & Hanna',
    type: 'Inspektion'
  },
  {
    id: 'h5',
    date: '2025-12-20',
    description: 'Strategimöte: Beslut om motor (minimal service), dörrar (byta begagnade), tak (täta nu, lucka senare), el (tillfälligt LiFePO4 januari, Victron höst)',
    mileage: '3 362 mil',
    performer: 'Joel & Hanna',
    type: 'Planering'
  }
];

// =============================================================================
// INSPECTION DATA (Rådata från inspektion 2025-12-20)
// =============================================================================

const INSPECTION_DATA = {
  date: '2025-12-20',
  inspectors: ['Joel Kvarnsmyr', 'Hanna Eriksson'],
  totalObservations: 88,
  negativeObservations: 68,
  positiveObservations: 20,
  
  areas: {
    tak: {
      negative: [
        'Sprickbildningar på cirka 10 olika ställen',
        'Kraftig spricka på vänster sida, en tredjedel från bak',
        'Sprickor i glasfibern framtill (troligen från skruvmontering)',
        'Kraftig spricka längst fram ovanför förardörren - HUVUDLÄCKA',
        'Lacken har rest sig och rost tränger fram på flera ställen',
        'Genomgående rostangrepp runt hela den horisontella listen/vattenrännan',
        'Större rostreaktion i glasfibern direkt under markisfästet',
        'Osäkra skruvar som misstänks orsaka vattenläckage',
        'Vattenläckage vid markisens infästning på höger sida',
        'En svacka i taket vid vänster framkant',
        'Dåligt utförd isolering baktill, exponerar yttertaket',
        'Synligt yttertak inifrån, risk för kondens'
      ],
      positive: [
        'Taket i övrigt i relativt gott skick',
        'Endast mindre anmärkningar på bakre delen/toppen'
      ]
    },
    
    skjutdorr: {
      negative: [
        'Kraftig rost i nederkant - GENOMROSTAD',
        'Hela nedre dörrens ramverk är borta',
        'Perforerad plåt med synlig konstruktion bakom',
        'Exponerade kablar',
        'Dörren "hänger" på grund av slitna rullar + ingen struktur nertill'
      ],
      positive: [],
      verdict: 'MÅSTE BYTAS - Ej reparerbar ekonomiskt'
    },
    
    forardorr: {
      negative: [
        'Nederkant helt genomrostad',
        'Lack och spackel hänger löst',
        'Fukt tränger in och skadar balk ovanför',
        'Spricka/öppning i takskarv ovanför dörren'
      ],
      positive: [],
      verdict: 'REKOMMENDERAS BYTE till begagnad'
    },
    
    passagerardorr: {
      negative: ['Mindre anmärkningar'],
      positive: ['Nästan helt rostfri!'],
      verdict: 'OK'
    },
    
    underrede: {
      negative: [
        'Lokaliserad röta i tvärbalk (bättre än befarat)',
        'Behöver rostskydd för året-runt-körning'
      ],
      positive: [
        'Överlag i mycket bra skick',
        'Chassi solitt',
        'Domkraftsfästen OK'
      ],
      verdict: 'Svetslaga balk, sedan underredsbehandling'
    },
    
    motor: {
      negative: [
        'Allmänt oljig',
        'Kamrem oljig',
        'Luftfilter sitter otätt',
        'Historik av startgasanvändning (risk)',
        'Ingen servicebok - okänd historik',
        'Svag (75hk) - kämpar i backar'
      ],
      positive: [
        'Går jämnt',
        'Startar',
        'Inga konstiga ljud'
      ],
      verdict: 'Minimal service nu, utvärdera efter sommaren'
    },
    
    el: {
      negative: [
        'Batterier var felkopplade (start + bodel ihop) - ÅTGÄRDAT',
        'Underdimensionerade kablar till bodelsladdning',
        'Gammalt PWM-regulator (ineffektivt)',
        'Säkringsskåp = kaos (50 år av tillägg)',
        'Inga huvudsäkringar nära batterier'
      ],
      positive: [
        'Solpanel fungerar',
        'Grundsystem fungerar'
      ],
      verdict: 'Tillfälligt LiFePO4 nu, komplett Victron senare'
    },
    
    isolering: {
      negative: [
        'Förarhytt: Slarvigt gjord med XPS-spillbitar',
        'Stora glipor till yttertak',
        'PU-skum som inte tätar ordentligt',
        'Ingen ångspärr'
      ],
      positive: [
        'Bodelen: Mer systematiskt gjord',
        'XPS-skivor mer sammanhängande'
      ],
      verdict: 'Kör med befintlig i sommar, göra om förarhytt höst/vinter'
    }
  }
};

// =============================================================================
// PROJECT TEAM
// =============================================================================

const PROJECT_TEAM = {
  participants: [
    {
      name: 'Hanna Eriksson',
      role: 'Ägare & Lärling',
      competence: 'Nybörjare, vill lära sig alla moment',
      assets: 'Ägare av fordonet'
    },
    {
      name: 'Joel Kvarnsmyr',
      role: 'Tekniskt ansvarig',
      competence: 'Erfaren (tidigare LT31-ägare, totalrenovering, svets, el, VVS), student',
      assets: 'Tillgång till fullutrustat garage på Gotland'
    }
  ],
  constraints: [
    'Saknar fast garage/verkstad (hyra via Ramirent vid behov)',
    'Kompetensöverföring (Hanna lär sig under arbetets gång)'
  ],
  goals: {
    summer2025: 'Körbar bil för att lära känna den',
    autumnWinter2025: 'Större jobb med tillgång till garage på Gotland',
    travelPlans: 'Gotland i sommar (semester + arbete)'
  }
};

// =============================================================================
// BUDGET SUMMARY
// =============================================================================

const BUDGET_SUMMARY = {
  phase1_january: {
    name: 'Januari: LiFePO4-batteri',
    items: [
      { item: 'LiFePO4-celler', cost: 7000 },
      { item: 'BMS', cost: 1500 },
      { item: 'Övrigt material', cost: 1500 }
    ],
    totalMin: 8000,
    totalMax: 14000
  },
  phase1_spring: {
    name: 'Vår: Tätning & minimal service',
    items: [
      { item: 'Tätning tak (Sikaflex etc)', cost: 500 },
      { item: 'Rostbehandling punkter', cost: 500 },
      { item: 'Motor oljebyte', cost: 600 }
    ],
    totalMin: 1200,
    totalMax: 2000
  },
  phase2_summer: {
    name: 'Sommar: Taklucka & dörrjakt',
    items: [
      { item: 'Ny taklucka', cost: 1500 },
      { item: 'Begagnad skjutdörr', cost: 3000 },
      { item: 'Begagnad förardörr', cost: 2000 }
    ],
    totalMin: 5000,
    totalMax: 9000
  },
  phase3_autumn: {
    name: 'Höst/Vinter: Stora jobb',
    items: [
      { item: 'Dörrbyten (arbete)', cost: 1000 },
      { item: 'Svetsning balk', cost: 1500 },
      { item: 'Hålrumsbehandling', cost: 2000 },
      { item: 'Underredsbehandling', cost: 4000 },
      { item: 'Isolering om', cost: 3000 },
      { item: 'Victron-system komplett', cost: 15000 }
    ],
    totalMin: 20000,
    totalMax: 35000
  },
  grandTotal: {
    min: 34200,
    max: 60000,
    note: 'Exklusive eventuellt motorbyte (15-30k extra)'
  }
};

// =============================================================================
// CRITICAL WARNINGS
// =============================================================================

const CRITICAL_WARNINGS = [
  {
    id: 'gl4-oil',
    condition: 'Manuell växellåda pre-1990',
    title: '⚠️ Varning: Växellådsolja (Gulmetall)',
    content: 'Gamla manuella växellådor har synkroniseringar av mässing. API GL-5 olja fräter sönder dessa. MÅSTE använda API GL-4!'
  },
  {
    id: 'lt-kingpins',
    condition: 'VW LT Mk1',
    title: '⚠️ Modellspecifikt: Spindelbultar',
    content: 'Framvagnen har spindelbultar (kingpins) som MÅSTE smörjas var 500:e mil. Om de rostar fast krävs press och värme.'
  },
  {
    id: 'interference-engine',
    condition: 'Audi CH-motor',
    title: '⚠️ Varning: Kamrem (Interference)',
    content: 'Motorn är av typen "Interference". Om kamremmen går av krockar kolvar och ventiler = totalhaveri. Okänd historik = hög risk.'
  },
  {
    id: 'battery-safety',
    condition: 'LiFePO4-installation',
    title: '⚠️ Batterisäkerhet',
    content: 'Huvudsäkring MÅSTE sitta inom 30cm från batteripol. Utan säkring = brandrisk vid kortslutning.'
  }
];

// =============================================================================
// EXPORT: COMPLETE PROJECT
// =============================================================================

export const ELTON_PROJECT: Project = {
  id: 'elton-jsn398',
  name: 'Elton (VW LT31 1976)',
  type: 'conversion',
  brand: 'vanplan',
  
  // Ownership
  ownerIds: ['hanna-eriksson'],
  primaryOwnerId: 'hanna-eriksson',
  memberIds: ['joel-kvarnsmyr'],
  invitedEmails: [],
  
  // Legacy fields
  ownerId: 'hanna-eriksson',
  ownerEmail: 'hanna@example.com',
  
  // Data
  vehicleData: ELTON_VEHICLE_DATA,
  tasks: ELTON_TASKS,
  shoppingItems: ELTON_SHOPPING_ITEMS,
  serviceLog: SERVICE_LOG_ITEMS,
  fuelLog: [],
  knowledgeArticles: [],
  
  // Metadata
  created: '2025-12-05',
  lastModified: '2025-12-20',
  isDemo: false,
  userSkillLevel: 'intermediate',
  nickname: 'Elton'
};

// Additional exports for use in other parts of the app
export { 
  STRATEGIC_DECISIONS,
  INSPECTION_DATA,
  PROJECT_TEAM,
  BUDGET_SUMMARY,
  CRITICAL_WARNINGS
};

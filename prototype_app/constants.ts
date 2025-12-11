
import { Task, TaskStatus, CostType, VehicleData, ServiceItem, ResourceLink, KnowledgeArticle, Contact, Priority, ShoppingItem, Project, ProjectType } from './types';

// --- DEMO DATA (ELTON) ---

const ELTON_VEHICLE_DATA: VehicleData = {
  regNo: 'JSN398',
  make: 'Volkswagen',
  model: 'LT 31 Skåp',
  year: 1976,
  prodYear: 1976,
  regDate: '1978-02-14',
  status: 'Avställd (sedan 2025-11-04)',
  bodyType: 'Skåp Bostadsinredning',
  passengers: 3, // + förare
  inspection: {
    last: '2025-08-13',
    mileage: '03 362 (5-siffrig mätare! Troligen 13k/23k mil)',
    next: 'Okänd'
  },
  engine: {
    fuel: 'Bensin',
    power: '75 HK / 55 kW',
    volume: '2.0L (Audi CH-motor)'
  },
  gearbox: 'Manuell 4-växlad',
  wheels: {
    drive: '2WD (Bakhjulsdrift)',
    tiresFront: '215R14 (Original)',
    tiresRear: '215R14 (Original)',
    boltPattern: '5x160' // Known spec for LT31
  },
  dimensions: {
    length: 5400,
    width: 1980,
    height: 'Okänd',
    wheelbase: 2500
  },
  weights: {
    curb: 2280,
    total: 3160,
    load: 880,
    trailer: 1400,
    trailerB: 750 // Utökad B kan behövas för tungt släp
  },
  vin: '2862500058',
  color: 'Flerfärgad',
  history: {
    owners: 22,
    events: 38,
    lastOwnerChange: '2023-06-28'
  }
};

const ELTON_SHOPPING_ITEMS: ShoppingItem[] = [
    // Kamrem & Motor (Från Kamrems-rapporten)
    { id: 's1', name: 'Kamremssats (Contitech CT637K1)', category: 'Reservdelar', estimatedCost: 800, quantity: '1 st', checked: false, url: 'https://www.autodoc.se/contitech/1210452', linkedTaskId: '4' },
    { id: 's2', name: 'Vattenpump (Metallimpeller)', category: 'Reservdelar', estimatedCost: 400, quantity: '1 st', checked: false, url: 'https://www.autodoc.se/hepu/2283285', linkedTaskId: '4' },
    { id: 's3', name: 'Packbox Kamaxel (32x47x10 FPM)', category: 'Reservdelar', estimatedCost: 100, quantity: '1 st', checked: false, url: 'https://www.autodoc.se/elring/985552' },
    { id: 's4', name: 'Packbox Vevaxel Fram (35x48x10 PTFE)', category: 'Reservdelar', estimatedCost: 100, quantity: '1 st', checked: false, url: 'https://www.autodoc.se/elring/985148' },
    { id: 's5', name: 'Ventilkåpspackning (Kork)', category: 'Reservdelar', estimatedCost: 150, quantity: '1 sats', checked: false, url: 'https://www.autodoc.se/reinz/7441225', linkedTaskId: '5' },
    { id: 's6', name: 'Kilrem (10x1013mm)', category: 'Reservdelar', estimatedCost: 100, quantity: '1 st', checked: false, url: 'https://www.autodoc.se/contitech/210352' },

    // Service & Vätskor (Från Service-rapporten)
    { id: 's7', name: 'Motorolja 10W-40 (Mineral)', category: 'Kemi & Färg', estimatedCost: 500, quantity: '5 liter', checked: false, store: 'Biltema', linkedTaskId: '5' },
    { id: 's8', name: 'Oljefilter', category: 'Reservdelar', estimatedCost: 100, quantity: '1 st', checked: false, url: 'https://www.autodoc.se/mahle-original/2683076', linkedTaskId: '5' },
    { id: 's9', name: 'Växellådsolja 80W-90 GL-4', category: 'Kemi & Färg', estimatedCost: 300, quantity: '2 liter', checked: false, store: 'Swedol', linkedTaskId: '5' },
    { id: 's10', name: 'Bakaxelolja 80W-90 GL-5', category: 'Kemi & Färg', estimatedCost: 300, quantity: '2 liter', checked: false, store: 'Swedol' },
    { id: 's11', name: 'Kylarvätska (G11 Blå)', category: 'Kemi & Färg', estimatedCost: 200, quantity: '3 liter', checked: false, store: 'Biltema' },
    { id: 's12', name: 'Tändstift (Bosch W7DTC)', category: 'Reservdelar', estimatedCost: 200, quantity: '4 st', checked: false, url: 'https://www.autodoc.se/bosch/1148182', linkedTaskId: '5' },

    // Vätskeöverföring (Slangar)
    { id: 's13', name: 'Bränsleslang SAE J30 R9 (7.5mm)', category: 'Reservdelar', estimatedCost: 150, quantity: '2 meter', checked: false, store: 'Mekonomen' },
    { id: 's14', name: 'Slangklämmor (ABA Original)', category: 'Verktyg', estimatedCost: 300, quantity: '10-pack', checked: false, store: 'Swedol' },
    { id: 's15', name: 'Kylarslang Nedre (Armerad/Spiral)', category: 'Reservdelar', estimatedCost: 200, quantity: '1 st', checked: false, store: 'Biltema' },

    // Prio 1 & 2
    { id: 's16', name: 'Startbatteri (75Ah)', category: 'Reservdelar', estimatedCost: 1400, quantity: '1 st', checked: false, store: 'Biltema', linkedTaskId: '2' },
    { id: 's17', name: 'Plåt (1.5mm - för balk)', category: 'Övrigt', estimatedCost: 300, quantity: '1 ark', checked: false, linkedTaskId: '1' },
    { id: 's18', name: 'Linolja (Rå kallpressad)', category: 'Kemi & Färg', estimatedCost: 500, quantity: '1 liter', checked: false, linkedTaskId: '8' },
];

const ELTON_TASKS: Task[] = [
  // FAS 0: INKÖP
  {
    id: '0-1',
    title: 'Inspektion & Provkörning',
    description: 'Provkörning (Söndag). Mäta fukt med Meec-mätare (kolla reglar), provstarta (kall motor), kolla rost i balkar.',
    status: TaskStatus.DONE,
    phase: 'Fas 0: Inköp & Analys',
    priority: Priority.HIGH,
    sprint: 'Sprint 0: Inköp',
    estimatedCostMin: 500,
    estimatedCostMax: 1000,
    actualCost: 800,
    weightKg: 0,
    costType: CostType.OPERATION,
    tags: ['Analys', 'Köp'],
    links: [],
    comments: [],
    attachments: [],
    decisionOptions: [],
    subtasks: []
  },
  {
    id: '0-2',
    title: 'Inköp av "Elton"',
    description: 'Betalning och ägarbyte via Transportstyrelsen-appen (5/12). Nu är den vår!',
    status: TaskStatus.DONE,
    phase: 'Fas 0: Inköp & Analys',
    priority: Priority.HIGH,
    sprint: 'Sprint 0: Inköp',
    estimatedCostMin: 30000,
    estimatedCostMax: 30000,
    actualCost: 30000,
    weightKg: 0,
    costType: CostType.INVESTMENT,
    tags: ['Inköp', 'Milstolpe'],
    links: [],
    comments: [],
    attachments: [],
    decisionOptions: [],
    subtasks: []
  },
  {
    id: '0-3',
    title: 'Hemtransport till Falun',
    description: 'Den första stora resan. En kritisk transport då bilen inte är fullt genomgången än. Kör försiktigt!',
    status: TaskStatus.TODO,
    phase: 'Fas 0: Inköp & Analys',
    priority: Priority.HIGH,
    sprint: 'Sprint 0: Inköp',
    estimatedCostMin: 1000,
    estimatedCostMax: 1500,
    actualCost: 0,
    weightKg: 0,
    costType: CostType.OPERATION,
    tags: ['Transport', 'Säkerhet'],
    links: [],
    comments: [],
    attachments: [],
    decisionOptions: [],
    subtasks: [
        { id: 'st1', title: '🚦 Kolla Status: Avställd! Fixa påställning.', completed: false },
        { id: 'st2', title: '🛠️ Bärande Balk: Kör extremt lugnt (Prio 1).', completed: false },
        { id: 'st3', title: '😬 Kamrem: Kritisk! Undvik höga varv.', completed: false },
        { id: 'st4', title: '🌡️ Kylsystem: Håll koll på tempen. Ha med vatten.', completed: false },
        { id: 'st5', title: '🔋 El: Startar den pålitligt?', completed: false },
        { id: 'st6', title: '🚗 Däck: Kolla bultmönster (5x160) och luft.', completed: false },
        { id: 'st7', title: '⚙️ Styrning: Kan vara trög pga spindelbultar.', completed: false },
        { id: 'st8', title: '🧰 Nödutrustning: Verktyg, olja, bogserlina.', completed: false }
    ]
  },
  {
    id: '0-4',
    title: 'Beställ Däck (Delsbo Däck)',
    description: `Ring Däckab (Euromaster) i Delsbo på 0653-108 95 (eller 070-226 31 51).
Öppet: Mån-Fre 07:30-16:30 (Lunch 12-13).
Adress: Sunnansjövägen 3.

**MANUS NÄR DU RINGER:**
"Hej, jag har en VW LT31 (Regnr JSN398).
Jag behöver 4st Året Runt-däck (C-däck) monterade på min bil.
Dimension: 215 R14 C (eller 205 R14 C).
Viktigt: De måste ha Alptopp/Snöflinga-symbolen (3PMSF) så de är lagliga på vintern."

Om du inte har nya fälgar: "Montering på bilens originalfälgar."`,
    status: TaskStatus.TODO,
    phase: 'Fas 0: Inköp & Analys',
    priority: Priority.HIGH,
    sprint: 'Sprint 0: Inköp',
    estimatedCostMin: 4000,
    estimatedCostMax: 6000,
    actualCost: 0,
    weightKg: 0,
    costType: CostType.OPERATION,
    tags: ['Däck', 'Säkerhet', 'Inköp'],
    links: [],
    comments: [],
    attachments: [],
    decisionOptions: [],
    subtasks: [
        { id: 'st1', title: '📞 Ring Däckab (0653-108 95)', completed: false },
        { id: 'st2', title: '✅ Bekräfta dimension (215 R14 C)', completed: false },
        { id: 'st3', title: '❄️ Bekräfta snöflinga/alptopp (3PMSF)', completed: false },
        { id: 'st4', title: '📅 Boka tid för montering', completed: false }
    ]
  },

  // FAS 1: AKUT (PRIO 1)
  {
    id: '1',
    title: 'Laga rostig balk (Yttre - Ej bärande)',
    description: 'Detta är inte den bärande ramen, utan yttre balk. Kan vänta till nästa säsong. Håll koll så det inte sprider sig.',
    status: TaskStatus.TODO,
    phase: 'Fas 3: Kaross & Rost',
    priority: Priority.LOW,
    sprint: 'Sommar/Höst',
    estimatedCostMin: 300,
    estimatedCostMax: 10000,
    actualCost: 0,
    weightKg: 5,
    costType: CostType.INVESTMENT,
    tags: ['Rost', 'Kaross'],
    links: [],
    comments: [],
    attachments: [],
    subtasks: [],
    decisionOptions: [
        {
            id: 'd1a',
            title: 'Göra själv (Svetsa)',
            description: 'Kräver svetskunskaper. Kapa bort sjukt stål och svetsa dit nytt (1.5-2mm plåt).',
            costRange: '300 – 500 kr',
            pros: ['Extremt billigt', 'Lärorikt'],
            cons: ['Kräver kunskap & utrustning', 'Tar tid']
        },
        {
            id: 'd1b',
            title: 'Leja ut (Verkstad)',
            description: 'Jobb för mekanisk verkstad eller rostsvetsare.',
            costRange: '4 000 – 10 000 kr',
            pros: ['Proffsresultat', 'Tidsbesparande', 'Säkert'],
            cons: ['Dyrt', 'Kan vara svårt att hitta tid']
        }
    ]
  },
  {
    id: '2',
    title: 'Installera nytt startbatteri',
    description: 'Prio 1: Utan el, ingen bil. Enkelt fixat nu när du hittat rätt batteri.',
    status: TaskStatus.TODO,
    phase: 'Fas 1: Akut',
    priority: Priority.HIGH,
    sprint: 'Sprint 1: Besiktning',
    estimatedCostMin: 1200,
    estimatedCostMax: 1600,
    actualCost: 0,
    weightKg: 20,
    costType: CostType.OPERATION,
    tags: ['Prio 1', 'El'],
    links: [],
    comments: [],
    attachments: [],
    subtasks: [],
    decisionOptions: [
        {
            id: 'd2a',
            title: 'Göra själv',
            description: 'Enkel montering av batteri.',
            costRange: '1 200 – 1 600 kr (Endast material)',
            pros: ['Enkelt', 'Gratis arbete'],
            cons: [],
            recommended: true
        },
        {
            id: 'd2b',
            title: 'Leja ut',
            description: 'Verkstad gör det.',
            costRange: '+ 500-800 kr arbetskostnad',
            pros: [],
            cons: ['Onödig kostnad']
        }
    ]
  },

  // FAS 2: MEKANISK
  {
    id: '4',
    title: 'Kamrem & Vattenpump',
    description: 'Kritisk punkt! Kör ej långt innan detta är gjort. Om remmen går av är motorn skrot.',
    status: TaskStatus.TODO,
    phase: 'Fas 2: Mekanisk Säkerhet',
    priority: Priority.HIGH,
    sprint: 'Sprint 2: Motorräddning',
    estimatedCostMin: 5000,
    estimatedCostMax: 7000,
    actualCost: 0,
    weightKg: 3,
    costType: CostType.OPERATION,
    tags: ['Verkstad', 'Kritisk'],
    links: [],
    comments: [],
    attachments: [],
    subtasks: [],
    decisionOptions: []
  },
  {
    id: '5',
    title: 'Stor Service',
    description: 'Oljebyte (10W-40/15W-40), Oljefilter, Luftfilter, Bränslefilter.',
    status: TaskStatus.TODO,
    phase: 'Fas 2: Mekanisk Säkerhet',
    priority: Priority.MEDIUM,
    sprint: 'Sprint 2: Motorräddning',
    estimatedCostMin: 1500,
    estimatedCostMax: 1500,
    actualCost: 0,
    weightKg: 5,
    costType: CostType.OPERATION,
    tags: ['Service', 'Gör själv'],
    links: [],
    comments: [],
    attachments: [],
    subtasks: [],
    decisionOptions: []
  },

  // FAS 3: KAROSS (PRIO 2)
  {
    id: '3',
    title: 'Fixa sidoskjutdörren',
    description: 'Prio 2: Subakut. Kraftig rostskada i nederkant. Om dörren hänger snett eller är otät tränger fukt in.',
    status: TaskStatus.TODO,
    phase: 'Fas 3: Kaross & Rost',
    priority: Priority.MEDIUM,
    estimatedCostMin: 500,
    estimatedCostMax: 10000,
    actualCost: 0,
    weightKg: 20,
    costType: CostType.INVESTMENT,
    tags: ['Prio 2', 'Kaross'],
    links: [],
    comments: [],
    attachments: [],
    subtasks: [],
    decisionOptions: [
        {
            id: 'd3a',
            title: 'Laga befintlig dörr',
            description: 'Svetsa och spackla den gamla.',
            costRange: 'DIY: 500kr / Proffs: 5-10k',
            pros: ['Behåller originaldel'],
            cons: ['Tidskrävande', 'Ofta dyrt att leja bort', 'Kan rosta igen']
        },
        {
            id: 'd3b',
            title: 'Byta dörr (Begagnad)',
            description: 'Hitta frisk dörr på bildelsbasen/Facebook.',
            costRange: '1 500 – 3 500 kr',
            pros: ['Snabbare', 'Bättre resultat', 'Enklare'],
            cons: ['Kräver att man hittar en dörr'],
            recommended: true
        }
    ]
  },
  {
    id: '8',
    title: 'Rostskydda underredet',
    description: 'Prio 2: OBS! Görs EFTER svetsning. Linoljebaserat är bäst på gamla bilar då det kryper in i rosten.',
    status: TaskStatus.TODO,
    phase: 'Fas 3: Kaross & Rost',
    priority: Priority.MEDIUM,
    estimatedCostMin: 1500,
    estimatedCostMax: 15000,
    actualCost: 0,
    weightKg: 5,
    costType: CostType.INVESTMENT,
    tags: ['Prio 2', 'Underhåll'],
    links: [],
    comments: [],
    attachments: [],
    subtasks: [],
    decisionOptions: [
        {
            id: 'd8a',
            title: 'Göra själv (Linolja)',
            description: 'Tryckluftsspruta och rå kallpressad linolja.',
            costRange: '1 500 – 2 500 kr',
            pros: ['Billigt', 'Bra skydd'],
            cons: ['Grisigt jobb', 'Kräver kompressor/spruta']
        },
        {
            id: 'd8b',
            title: 'Leja ut (Proffs)',
            description: 'Dinitrol/Mercasol behandling.',
            costRange: '8 000 – 15 000 kr',
            pros: ['Bekvämt', 'Grundligt'],
            cons: ['Dyrt', 'Vissa massor kan dölja rost']
        }
    ]
  }
];

export const SERVICE_LOG_ITEMS: ServiceItem[] = [
    {
        id: 's1',
        date: '2025-08-13',
        description: 'Kontrollbesiktning (Godkänd)',
        mileage: '3 368 mil',
        performer: 'Bilprovningen',
        type: 'Besiktning'
    }
];

// --- EXPORTS ---

export const ELTON_PHASES = ['Fas 0: Inköp & Analys', 'Fas 1: Akut', 'Fas 2: Mekanisk Säkerhet', 'Fas 3: Kaross & Rost', 'Fas 4: Vanlife-bygget'];

export const DEMO_PROJECT: Project = {
    id: 'demo-elton',
    name: 'Elton (VW LT31)',
    type: 'renovation',
    phases: ELTON_PHASES,
    vehicleData: ELTON_VEHICLE_DATA,
    tasks: ELTON_TASKS,
    shoppingItems: ELTON_SHOPPING_ITEMS,
    serviceLog: SERVICE_LOG_ITEMS,
    fuelLog: [],
    created: '2025-01-01',
    lastModified: '2025-01-01',
    isDemo: true
};

export const TEMPLATES: Record<string, { phases: string[], tasks: Task[] }> = {
    'renovation': {
        phases: ['Fas 0: Analys', 'Fas 1: Mekanik', 'Fas 2: Kaross', 'Fas 3: Inredning'],
        tasks: []
    },
    'conversion': {
        phases: ['Fas 1: Planering & Inköp', 'Fas 2: Isolering & Golv', 'Fas 3: El & Vatten', 'Fas 4: Snickerier', 'Fas 5: Finish'],
        tasks: []
    },
    'maintenance': {
        phases: ['Vårservice', 'Säsong', 'Höst/Vinterförvaring', 'Löpande Underhåll'],
        tasks: []
    }
};

export const EMPTY_PROJECT_TEMPLATE: Project = {
    id: '',
    name: 'Nytt Projekt',
    type: 'conversion',
    phases: TEMPLATES['conversion'].phases,
    vehicleData: {
        regNo: '', make: '', model: '', year: 0, prodYear: 0, regDate: '', status: '', bodyType: '', passengers: 0,
        inspection: { last: '', mileage: '', next: '' },
        engine: { fuel: '', power: '', volume: '' },
        gearbox: '',
        wheels: { drive: '', tiresFront: '', tiresRear: '', boltPattern: '' },
        dimensions: { length: 0, width: 0, height: '', wheelbase: 0 },
        weights: { curb: 0, total: 0, load: 0, trailer: 0, trailerB: 0 },
        vin: '', color: '',
        history: { owners: 0, events: 0, lastOwnerChange: '' }
    },
    tasks: [],
    shoppingItems: [],
    serviceLog: [],
    fuelLog: [],
    created: '',
    lastModified: ''
};

export const VEHICLE_TIPS = [
  {
    category: 'Livsviktigt Underhåll ("LT Killers")',
    items: [
      {
        title: 'Spindelbultarna fram (Kingpins)',
        content: 'Detta är LT-ägarens viktigaste punkt! Framvagnen har smörjnipplar som ofta glöms bort. Smörj dessa med fettspruta minst en gång om året (eller var 500:e mil). Om de rostar fast blir styrningen extremt trög och kräver ofta en 20-tons press för att bytas.',
        priority: 'Kritisk'
      },
      {
        title: 'Kamremmen (Audi-motorn)',
        content: 'Din 2.0L bensinmotor (CH) har kamrem. Byt den direkt om du är osäker. Om den går av rasar motorn (interferensmotor).',
        priority: 'Kritisk'
      },
      {
        title: 'Kylsystemet & "Doghouse"',
        content: 'Motorn sitter mellan framsätena och det blir väldigt varmt där inne. Gamla slangar spricker ofta. Se över alla kylslangar och lufta systemet noga.',
        priority: 'Viktigt'
      },
      {
        title: 'Bränsleslangar',
        content: 'Dagens bensin med etanol torkar ut gamla gummislangar. Byt alla bränsleslangar för att undvika motorbrand!',
        priority: 'Kritisk'
      }
    ]
  },
  {
    category: 'Teknisk Analys & Status',
    items: [
      {
        title: 'Mätarställning: 5-siffrig!',
        content: 'Varning: Mätaren på LT31 går bara till 99 999. Den har med 99% sannolikhet slagit runt minst en, kanske två gånger. "3 300 mil" är troligen 13 300 eller 23 300 mil.',
        priority: 'Analys'
      },
      {
        title: 'Motor: Audi CH',
        content: 'Du har en 2.0L bensinmotor (75hk) som också satt i Audi 100 och Porsche 924. Delar kan ofta hittas genom att söka på dessa bilar istället för LT!',
        priority: 'Info'
      },
      {
        title: 'Lastvikt: 880 kg',
        content: 'Som "Skåp Bostadsinredning" har du 880 kg lastvikt. Det är bra! Du har marginal för ett rejält bygge.',
        priority: 'Analys'
      }
    ]
  },
  {
    category: 'Råd kring Motorbyte (Bensin → Diesel?)',
    items: [
      {
        title: 'Besiktning & Regler',
        content: 'Du måste göra en registreringsbesiktning för att ändra bränsleslag. Det brukar gå bra, men kräver vägning av bilen.',
        priority: 'Info'
      },
      {
        title: 'Elsystemet',
        content: 'Din bil saknar "glödgning" (förvärmning). Du måste dra ny el för glödstift/relä och montera en knapp. Varvräknare från bensin fungerar inte på diesel (behöver W-uttag från generatorn).',
        priority: 'Info'
      },
      {
        title: 'Bränslesystemet',
        content: 'Bensintanken måste tömmas och sköljas. Påfyllningsröret kan ha en "strypning" som måste tas bort. Du måste antagligen dra en returledning för bränslet (dieselmotorer skickar tillbaka mycket bränsle).',
        priority: 'Info'
      },
      {
        title: 'Alternativ: Volvo B230 (Bensin)',
        content: 'Ett "wildcard" är att sätta i en Volvo 940 motor (B230). Du slipper regga om bränslet, den är tystare än diesel, men drar mer (1.2-1.5 l/mil).',
        priority: 'Tips'
      }
    ]
  },
  {
    category: 'Komfort & Uppgraderingar',
    items: [
      {
        title: 'Ljudisolering (Prio 1)',
        content: 'Du sitter i princip på motorn. En oisolerad LT dånar så mycket att man måste skrika i 80 km/h. Klä insidan av motorkåpan med tjockt, brandskyddat ljudisoleringsmaterial (t.ex. Silent Coat + tung matta).',
        priority: 'Komfort'
      }
    ]
  }
];

export const RESOURCE_LINKS: ResourceLink[] = [
    {
        category: 'Manualer & Info',
        title: 'Haynes Manual VW LT (1976-1987)',
        url: 'https://haynes.com',
        description: 'Bibeln för hemma-mekaniker. Ett måste i handskfacket.'
    },
    {
        category: 'Manualer & Info',
        title: 'LT-Freunde (Tyskt Forum)',
        url: 'https://www.lt-freunde.de',
        description: 'Världens största kunskapsbank för LT1. Använd Google Translate.'
    },
    {
        category: 'Delar & Köp',
        title: 'Bildelsbasen',
        url: 'https://www.bildelsbasen.se',
        description: 'Sök på begagnade delar i Sverige. Bra för dörrar och kaross.'
    },
    {
        category: 'Delar & Köp',
        title: 'Brickwerks (UK)',
        url: 'https://brickwerks.co.uk',
        description: 'Specialister på VW-bussar. Har ofta svåra delar till LT.'
    },
    {
        category: 'Delar & Köp',
        title: 'VW Classic Parts',
        url: 'https://www.volkswagen-classic-parts.com',
        description: 'Volkswagens egna lager för veteranbilar.'
    },
     {
        category: 'Delar & Köp',
        title: 'eBay Tyskland (eBay.de)',
        url: 'https://www.ebay.de',
        description: 'Sök på "VW LT 31" här. Tyskland har mest delar.'
    }
];

export const WORKSHOP_CONTACTS: Contact[] = [
    // Försäkring
    {
        name: 'Länsförsäkringar Dalarna',
        phone: '023-930 00',
        location: 'Falun/Hela Dalarna',
        category: 'Försäkring & Räddning',
        specialty: 'Kundservice',
        note: 'Försäkringsfrågor och skadeanmälan.'
    },
    {
        name: 'LF Dalarna Jourtjänst',
        phone: '020-59 00 00',
        location: 'Sverige',
        category: 'Försäkring & Räddning',
        specialty: 'Bärgning & Akut',
        note: 'Ring hit vid olycka eller driftstopp dygnet runt.'
    },
    // Specialister
    {
        name: 'Borlänge Motorrenovering',
        phone: '0243-22 46 00',
        location: 'Borlänge',
        category: 'Specialist',
        specialty: 'Motorrenovering',
        note: 'Guldstandarden för tunga jobb (borrning, topplock). Räddar motorer.'
    },
    {
        name: 'Hanssons Bil & Motor',
        phone: '0243-22 11 99',
        location: 'Borlänge',
        category: 'Specialist',
        specialty: 'Entusiastfordon',
        note: 'Djupt tekniskt kunnande (BMW/Audi). Mekaniskt "gehör".'
    },
    // Veteran & Kaross
    {
        name: 'Hallklint Bil',
        phone: '0243-921 00',
        location: 'Avesta',
        category: 'Veteran & Kaross',
        specialty: 'Veteranexperter',
        note: 'Specialiserade på "analoga" bilar. Förgasarkungar.'
    },
    {
        name: 'Falu Bilplåt',
        phone: '023-200 44',
        location: 'Falun',
        category: 'Veteran & Kaross',
        specialty: 'Plåt & Lack',
        note: 'Välkomnar veteranbilar. Kan PDR (bucklor).'
    },
    {
        name: 'Kaptens Motor',
        phone: 'Se webb',
        location: 'Orsa',
        category: 'Veteran & Kaross',
        specialty: 'Äldre teknik',
        note: 'Mazda/Fiat-kompetens. Bra på udda problem.'
    },
    // Service & Akut
    {
        name: 'Nini Verkstad',
        phone: '023-249 00',
        location: 'Falun',
        category: 'Service & Akut',
        specialty: 'Akutjour',
        note: 'Unik jourtjänst. Drop-in och helgöppet vid kris.'
    },
    {
        name: 'Total Bil',
        phone: '023-70 99 60',
        location: 'Falun',
        category: 'Service & Akut',
        specialty: 'Allmänverkstad',
        note: 'Topprankad i Falun. Envis felsökning.'
    },
    {
        name: 'Bil & AC Center',
        phone: '0243-823 20',
        location: 'Borlänge',
        category: 'Service & Akut',
        specialty: 'AC & Allmän',
        note: 'Ärliga bedömningar. Autoexperten-ansluten.'
    },
    {
        name: 'LTE Bil',
        phone: '-',
        location: 'Borlänge',
        category: 'Service & Akut',
        specialty: 'Service',
        note: 'Autoexperten. Snabb service, godkänd bilverkstad.'
    },
    // Märkes
    {
        name: 'Rolf Ericson Bil',
        phone: '023-588 00',
        location: 'Falun',
        category: 'Märkesverkstad',
        specialty: 'Volvo/Renault',
        note: 'Bra för reservdelar och moderna tillbehör.'
    }
];

export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
    {
        id: 'guide-mekaniker',
        title: 'Guide: Hitta Rätt Mekaniker & Serviceplan',
        summary: 'En praktisk guide för att hitta en verkstad som förstår gamla bilar, inkl. "Lackmustestet" och checklista för service.',
        tags: ['Service', 'Guide', 'Motor'],
        content: `# Guide: Hitta Rätt Mekaniker & Serviceplan

## 1. Vem ska du leta efter?
Undvik stora moderna verkstadskedjor. De är duktiga på att koppla in datorer, men din bil har inget diagnosuttag.
Leta efter: "Gubbverkstäder", veteranbilsspecialister eller verkstäder som skyltar med "Klassiska VW/Audi".

**Det hemliga tipset:** Eftersom din motor (CH) är en Audi-motor som också satt i Porsche 924, kan en gammal Porsche-specialist eller en Audi-entusiast ofta vara bättre än en renodlad "Folkabuss-mekaniker" (som är vana vid luftkylda boxermotorer).

## "Lackmustestet" – Frågor för att testa mekanikern
När du ringer, ställ dessa frågor för att avgöra om de vet vad de pratar om.

**Fråga 1 (Det viktigaste):** "Kan ni justera ventilerna på den här motorn? Det är en 2-liters bensinare (CH)."
*   **Rätt svar:** "Ja, vi har verktyg för att byta shims (brickor)." Eller: "Har du shims-sats?"
*   **Fel svar:** "Jadå, vi skruvar bara på justerskruvarna." (Då tror de att det är en gammal Folkabuss-motor. Din motor har inga skruvar, den har brickor. Springer de på detta kommer de antingen inte göra jobbet eller göra fel.)

**Fråga 2:** "Har ni utrustning för att ställa in en förgasare med CO-halt?"
Många moderna verkstäder har slängt sina gamla avgasanalysatorer. Utan en sådan gissar de bara när de ställer in din Solex-förgasare.

## Checklista för "Stor Service" (Detta ska du be om)
Lämna denna lista till verkstaden. Det sparar tid och minskar risken för missförstånd.

### A. Motorn (Kritiskt)
*   **Ventilspel:** Kontrollera och justera vid behov. (Kall motor: Insug 0,15-0,25 mm / Avgas 0,35-0,45 mm). Tips: Säg att du kan beställa shims om de saknar rätt storlek (de är samma som till Volvo 240/740 diesel och många VW/Audi).
*   **Kamrem:** Om du inte vet exakt när den byttes senast – byt den. Om den går av rasar motorn. Byt även spännrullen.
*   **Tändning:**
    *   Byt brytarspetsar och kondensator (eller be dem installera brytarlöst system om du köpt ett).
    *   Ställ tändningen med stroboskop (5° eller 7,5° FÖD med vakuumslang bortkopplad).
    *   Byt tändstift (Bosch W7DTC eller motsvarande).
*   **Förgasare:** Kontrollera att choken öppnar helt när motorn blir varm. Justera tomgång och CO-halt.

### B. Vätskor (Viktigt med rätt sorter)
*   **Växellåda:** Be dem byta oljan, men varna dem: "Använd absolut inte GL-5 olja, den äter upp synkroniseringen. Det måste vara GL-4 80W-90."
*   **Bakaxel:** Här ska det vara GL-5 olja.
*   **Kylarvätska:** Byt om den är brun/grumlig. Använd G11 (Blå/Grön).

### C. Säkerhet
*   **Bromsar:** Be dem lufta bromsarna och byta all bromsvätska (den drar åt sig vatten och rostar cylindrarna inifrån). Eftersom bilen stått sedan 2007 kan hjulcylindrarna bak ha ärgat fast.
*   **Bränsleslangar:** Be dem inspektera alla gummislangar. Dagens bensin med etanol torkar ut gamla slangar snabbt = brandrisk.

## Strategi för delar
Mekaniker avskyr att leta efter delar till gamla bilar för att det tar tid de inte kan debitera för.
Erbjud dig att köpa delarna: "Om ni säger vad som behövs, så beställer jag hem grejerna."
När du letar delar till motorn, sök på Audi 100 (C1) 2.0 eller Porsche 924 2.0 på sajter som Autodoc eller Bildelaronline24. Det är ofta lättare att hitta delar "vägen runt" än att söka på VW LT.`
    },
    {
        id: 'analys-jsn398',
        title: 'Fordonsteknisk Analys: VW LT31 (JSN398)',
        summary: 'En djupgående analys av ditt specifika fordon baserat på chassinummer och historik.',
        tags: ['Fakta', 'Historik', 'Analys'],
        content: `# Fordonsteknisk Analys: Volkswagen LT31 (JSN398)

## Exekutiv Sammanfattning
Denna rapport analyserar ditt fordon JSN398, en Volkswagen LT31 av 1976 års modell. Det är ett tidigt exemplar ("Series 1") utrustad med den vätskekylda 2,0-liters bensinmotorn (kod CH), som den delar med Audi 100 och Porsche 924.

## Avkodning av Identitet
**Chassinummer:** 2862500058
*   **28:** VW LT-serien (Typ 28)
*   **6:** Modellår 1976
*   **500058:** Tillverkad i Hannover. Ett lågt nummer som indikerar att det är en tidig bil.

## Drivlinans Ingenjörskonst: Motor CH (2.0L Bensin)
Hjärtat i JSN398 är bensinmotorn med koden CH. Detta är en tekniskt intressant kraftkälla.
*   **Släktskap:** Samma grundmotorblock användes i Audi 100 och Porsche 924. Sök delar till dessa bilar!
*   **Ventiljustering:** Motorn använder **shims** (brickor) för ventiljustering, inte skruvar. Detta är kritiskt att veta för mekanikern.
*   **Specifikation:** 75 hk, SOHC, Kamrem.

## Kritisk Underhållsinfo
*   **Förgasare:** Solex 35 PDSIT-5. Känd för problem med automatchoken.
*   **Kylsystem:** Motorn sitter trångt ("doghouse"). Lufta systemet noga.
*   **Växellåda:** Manuell 4-växlad. Kräver GL-4 olja (ej GL-5!).

## Sammanfattande Datatabell för JSN398
| Datapunkt | Specifikation | Notering |
|---|---|---|
| Modell | VW LT31 (Typ 28) | Modellår 1976 |
| Motor | 2.0L Bensin (Kod: CH) | 4-cylindrig radmotor (Audi-design) |
| Ventilspel (Kall) | Insug: 0.15-0.25 / Avgas: 0.35-0.45 | Justeras med shims! |
| Tändstift | Bosch W7DTC | 0.7-0.8 mm |
| Tändning | 7.5° FÖD @ 900 v/min | Vakuum bortkopplad |
| Olja Motor | 10W-40 Mineral | ca 4.5-5 liter |
| Olja Växellåda | SAE 80W-90 GL-4 | EJ GL-5! |`
    },
    {
        id: 'odometer-rapport',
        title: 'Teknisk Utredning: 5-siffrig Vägmätare',
        summary: 'Varför din mätare visar "3000 mil" men bilen har gått mycket längre. Om mekanisk rollover.',
        tags: ['Instrument', 'Miltal', 'Fakta'],
        content: `# Teknisk Utredning: Vägmätaren i VW LT Mk1 (1976–1980)

## Sammanfattning
Vägmätaren (odometern) i Volkswagen LT31 av din årsmodell är av en **fem-siffrig** mekanisk konstruktion.
Detta innebär att mätaren endast kan visa upp till **99 999 kilometer**. Vid överskridande sker en mekanisk "nollställning" (rollover) till 00 000.

## Vad betyder detta för JSN398?
Din mätare visar ca 3 300 mil. Eftersom bilen är från 1976 och har haft 22 ägare, är det statistiskt omöjligt att detta är korrekt totalsträcka.
*   **Scenario A:** Den har slagit runt en gång = 13 300 mil.
*   **Scenario B:** Den har slagit runt två gånger = 23 300 mil.

## Den "Sjätte Siffran"
Många ägare luras av den sista siffran. Om din mätare har en siffra som är röd eller vit mot annan bakgrund längst till höger, visar den **100 meter**, inte mil.
En mätare som visar "99999" (där sista är röd) står på 99 999,9 km (alltså ca 10 000 mil).

## Hur vet man sanningen?
Det går inte att veta exakt utan fullständig dokumentation.
*   **Pedalgummi:** Är de helt nerslitna till metallen? Då har den gått långt (>20k mil).
*   **Ratt:** Är ratten blankpolerad och hal? Tecken på höga mil.
*   **Förarstol:** Är tyget trasigt på insteget?

## Slutsats
Lita inte på mätaren. Bedöm skicket på motor och kaross. Att mätaren står på 3000 mil är bara var den befinner sig i sin nuvarande cykel.`
    },
    {
        id: 'verkstad-analys',
        title: 'Strategisk Analys: Verkstäder i Falun/Borlänge',
        summary: 'Vilka verkstäder kan man lita på? En genomgång av lokala aktörer för veteranbilar och motorjobb.',
        tags: ['Verkstad', 'Lokalt', 'Dalarna'],
        content: `# Strategisk Analys: Verkstäder i Falun-Borlänge

## Inledning
Att hitta rätt verkstad för en bil från 1976 är svårt. Moderna kedjor saknar ofta kompetensen för förgasare och ventilshims. Här är de bästa alternativen i din region.

## 1. Avancerad Mekanik & Motorrenovering
*   **Borlänge Motorrenovering AB:** Regionens experter på tunga jobb. Om din motor rasar eller behöver borras, är det hit du går. De kan också ha delar till äldre motorer.
*   **Hanssons Bil & Motor (Borlänge):** Entusiastens val. Djupt kunnande om äldre teknik och BMW, men bra på allt mekaniskt.

## 2. Veteranbilar & Kaross
*   **Hallklint Bil (Avesta):** Värt resan. De har specialiserat sig på veteranbilar och "analoga" fordon (MG, Porsche, Land Rover). De förstår förgasare.
*   **Falu Bilplåt (Falun):** Experter på plåt och rost. De tar sig an äldre bilar och kan även PDR (bucklor).
*   **Kaptens Motor (Orsa):** Glenn Brus är en expert på äldre teknik (Mazda/Fiat).

## 3. Allmänservice (Bäst omdömen)
*   **Total Bil (Falun):** Problemlösarna. Kända för att inte ge upp vid felsökning.
*   **Nini Verkstad (Falun):** **Spara detta nummer! (023-249 00)**. De har akutjour och drop-in, även lördagar. En räddare i nöden.
*   **Bil & AC Center (Borlänge):** Ärliga och duktiga, särskilt på AC och allmän service.

## Strategiska Rekommendationer
*   **Veteran:** Undvik Mekonomen/kedjorna för motortekniska jobb på din LT. Åk till Hallklint eller Hanssons.
*   **Akut:** Ring Nini Verkstad.
*   **Delar:** Försök hitta delarna själv (se reservdelsguiden) och ta med till verkstaden.`
    }
];

export const PARTS_HUNTING_TIPS = [
    "Använd alltid originalnumret (OEM) när du söker delar på eBay.",
    "Bultmönstret 5x160 är unikt för LT och Ford Transit (Mk1/Mk2). Fälgar från andra bilar passar inte.",
    "Motordelar till bensinaren (2.0L) är ofta samma som till Audi 100 från samma era.",
    "Baklyktor och blinkersglas är hårdvaluta – var rädd om dem!"
];

// --- FEATURE FLAGS ---

export interface FeatureFlags {
    ENABLE_DEBUG_UI: boolean; // Visa teknisk data
    USE_EXPERIMENTAL_MODEL: boolean; // T.ex. Gemini Pro istället för Flash
    SHOW_RAW_COSTS: boolean; // Visa rådata i budget
}

export const DEFAULT_FLAGS: FeatureFlags = {
    ENABLE_DEBUG_UI: false,
    USE_EXPERIMENTAL_MODEL: false,
    SHOW_RAW_COSTS: false
};

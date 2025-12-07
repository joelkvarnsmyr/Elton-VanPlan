
import { Phase, Task, TaskStatus, CostType, VehicleData, ServiceItem, ResourceLink, KnowledgeArticle, Contact, Priority, ShoppingItem, Project } from './types';

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
    mileage: '3 368 mil (Troligen slagit om, 13k/23k mil?)',
    next: 'Okänd'
  },
  engine: {
    fuel: 'Bensin',
    power: '75 HK / 55 kW',
    volume: '2.0L (Audi 100 motor)'
  },
  gearbox: 'Manuell',
  wheels: {
    drive: '2WD (Bakhjulsdrift)',
    tiresFront: '215R14',
    tiresRear: '215R14',
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
    trailerB: 750
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
    phase: Phase.PLANNING,
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
    phase: Phase.PLANNING,
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
    phase: Phase.PLANNING,
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
    phase: Phase.PLANNING,
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
    phase: Phase.BODY,
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
    phase: Phase.ACUTE,
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
    phase: Phase.MECHANICAL,
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
    phase: Phase.MECHANICAL,
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
    phase: Phase.BODY,
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
    phase: Phase.BODY,
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

export const DEMO_PROJECT: Project = {
    id: 'demo-elton',
    name: 'Elton (VW LT31)',
    vehicleData: ELTON_VEHICLE_DATA,
    tasks: ELTON_TASKS,
    shoppingItems: ELTON_SHOPPING_ITEMS,
    serviceLog: SERVICE_LOG_ITEMS,
    fuelLog: [],
    created: '2025-01-01',
    lastModified: '2025-01-01',
    isDemo: true
};

export const EMPTY_PROJECT_TEMPLATE: Project = {
    id: '',
    name: 'Nytt Projekt',
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

export const OWNER_HISTORY = [
    { name: 'Fanny Jonsson', date: '2023-06-28', location: 'Delsbo', duration: '2 år 5 mån' },
    { name: 'Victor Åhman', date: '2023-04-19', location: 'Huddinge', duration: '2 mån' },
    { name: 'Rasmus Bouvin', date: '2020-06-11', location: 'Sundbyberg', duration: '2 år 10 mån' },
    { name: 'Eric Lindgren Gustafsson', date: '2019-07-21', location: 'Luleå', duration: '11 mån' },
    { name: 'Pia Hedlund Öhrnell', date: '2015-08-01', location: 'Burträsk', duration: '3 år 11 mån' },
    { name: 'Alexsej Gudevik', date: '2015-04-02', location: 'Luleå', duration: '4 mån' },
    { name: 'Marie Löfström', date: '2014-07-22', location: 'Gävle', duration: '8 mån' },
    { name: 'Okänd brukare', date: '2007-05-26', location: '-', duration: '7 år 1 mån' },
    { name: 'Okänd brukare', date: '2006-07-08', location: '-', duration: '11 mån' }
];

export const MILEAGE_HISTORY = [
    { date: '1978-02-14', mil: 0, event: 'Registrerad' },
    { date: '2015-03-24', mil: 1385, event: 'Besiktning' },
    { date: '2017-07-19', mil: 1973, event: 'Besiktning' },
    { date: '2019-06-25', mil: 2281, event: 'Besiktning' },
    { date: '2021-06-28', mil: 2668, event: 'Besiktning' },
    { date: '2023-05-11', mil: 3098, event: 'Besiktning' },
    { date: '2025-08-13', mil: 3362, event: 'Besiktning' },
    { date: '2025-11-04', mil: 3386, event: 'Uppskattning' }
];

export const INSPECTION_HISTORY = [
    { date: '2025-11-04', type: 'Status', detail: 'Avställd' },
    { date: '2025-08-13', type: 'Besiktning', detail: 'Godkänd (3 362 mil)' },
    { date: '2025-07-03', type: 'Status', detail: 'Påställd' },
    { date: '2023-06-28', type: 'Ägarbyte', detail: 'Fanny Jonsson' },
    { date: '2023-05-11', type: 'Besiktning', detail: 'Godkänd (3 098 mil)' },
    { date: '2021-06-28', type: 'Besiktning', detail: 'Godkänd (2 668 mil)' },
    { date: '1978-02-14', type: 'Start', detail: 'Första trafik i Sverige' }
];

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
        title: 'Kamremmen (om motorbyte)',
        content: 'Om du sätter i en Volvo D24/D24T eller behåller bensinaren – byt remmen direkt. D24-motorn är en "interferens-motor", går remmen av slår kolvarna sönder ventilerna. Motorras direkt.',
        priority: 'Kritisk'
      },
      {
        title: 'Kylsystemet & "Doghouse"',
        content: 'Motorn sitter mellan framsätena och det blir väldigt varmt där inne. Gamla slangar spricker ofta. Se över alla kylslangar och lufta systemet noga (LT kan vara svåra att lufta då kylaren sitter högt).',
        priority: 'Viktigt'
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
        title: 'Strategi: Volvo D24T vs B230',
        content: 'D24T (Diesel) är klassikern med bra vrid. B230 (Bensin) från Volvo 940 är ett "wildcard" - du slipper regga om, den är tystare, men drar mer bränsle (1.2-1.5 l/mil).',
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
        id: 'odo-tech',
        title: 'Teknisk Utredning: Vägmätarens Mekanik & Begränsningar',
        summary: 'En djupdykning i varför din mätare bara visar 5 siffror och hur du vet hur långt bilen egentligen gått.',
        tags: ['Historia', 'Mekanik', 'Köpråd'],
        content: `
# Teknisk Utredning: Vägmätarens Mekanik, Begränsningar och Historisk Kontext i Volkswagen LT Mk1 (1976–1980)

## Sammanfattning
Denna forskningsrapport utgör en uttömmande analys av instrumenteringen i Volkswagen LT-serien, specifikt modell LT31 tillverkad mellan 1976 och 1980. Baserat på en omfattande genomgång av tekniska manualer, reservdelskataloger, historiska fordonsdata och diskussionsforum för entusiaster, fastställer rapporten att standardutförandet av vägmätaren (odometern) i denna fordonsgeneration är av en fem-siffrig mekanisk konstruktion.

Detta innebär att mätaren tekniskt sett endast kan registrera en körsträcka upp till **99 999 kilometer** (eller miles, beroende på marknad). Vid överskridande av detta värde sker en mekanisk "nollställning" (rollover) där verket återgår till 00 000. Rapporten belyser även undantag, såsom fordon utrustade med färdskrivare (tachograf) av märket Kienzle, vilka nyttjar sex siffror.

---

## 1. Introduktion: Volkswagen LT och Den Tunga Transportens Era
### 1.1 Uppkomsten av "Lasten-Transporter" (Typ 28/31/35)
Lanseringen av Volkswagen LT (Lasten-Transporter) i april 1975 markerade en radikal förändring i Volkswagens strategi för kommersiella fordon. Där den tidigare Typ 2 (Transportern) förlitade sig på en svansmonterad, luftkyld boxermotor, konstruerades LT-serien med en frontmonterad, vätskekyld motor placerad mellan förar- och passagerarsätet i en "cab-over"-design.

### 1.2 Filosofin bakom 1970-talets Instrumentering
Under 1970-talet rådde en annan syn på lätta lastbilars livscykel jämfört med idag. Industristandarden antog ofta att en skåpbil skulle genomgå en totalrenovering eller skrotas innan den nådde astronomiska miltal. Detta synsätt ledde till beslutet att utrusta standardmodellerna av LT28, LT31 och LT35 med en mätare begränsad till fem heltalssiffror.

---

## 2. Teknisk Analys av VDO-Instrumenthuset
### 2.1 Konstruktion och Design
Instrumentklustret i en LT31 från perioden 1976–1980 domineras av en stor central hastighetsmätare. Mätaren är helt analog och mekanisk. Den drivs av en flexibel vajer (hastighetsmätarvajer) som kopplas fysiskt till växellådans utgående axel.

### 2.2 Bekräftelse av Fem-Siffrig Begränsning
Den centrala frågeställningen gäller huruvida mätaren går till 99 999 eller 999 999. Analysen ger ett entydigt svar för standardmodellen: **Fem siffror**.

**Den "Sjätte Siffran" – En Källa till Förvirring**
Många ägare rapporterar att deras mätare faktiskt har sex siffror. Det är här avgörande att skilja på heltalssiffror och decimaler. Standardkonfigurationen visar fem svarta siffror. Om en sjätte siffra finns längst till höger, är den oftast röd eller vit. Denna siffra representerar **100 meter** (1/10 km), inte 100 000 km.

---

## 3. Fenomenet "Rollover": Mekanik och Psykologi
### 3.1 Den Mekaniska Processen
När mätaren visar 99 999, är alla trummor positionerade på sin sista siffra. Vid nästa kilometer driver mekanismen entalssiffran till 0. Denna rörelse fortplantas genom hela kedjan och tvingar alla trummor att rotera till 0 samtidigt.

### 3.2 Varför 99 999?
* **Kostnad**: Att spara in en siffertrumma sänkte produktionskostnaden.
* **Livslängdsförväntan**: 1970-talets bensinmotorer krävde tätare serviceintervaller. Att en tungt lastad 2.0L motor skulle gå 20-30 000 mil utan renovering var inte normen.

---

## 4. Att Fastställa Sann Körsträcka (TMU)
För ägare av en LT31 från 1976–1980 innebär detta att mätarställningen sällan kan tas för sanning. En mätare som visar "45 000 km" kan i verkligheten vara 145 000, 245 000 eller 345 000 km.

### 4.2 Fysiska Slitagesignaler
* **Pedalgummi**: Vid 100 000 km bör mönstret vara synligt slitet. Vid 200 000 km är det ofta nedslitet till metallen.
* **Rattkrans**: Vid höga miltal (>150 000 km) poleras texturen bort och ratten blir blank och hal.
* **Sätesklädsel**: Förarstolens yttre sida slits hårt vid in- och urstigning på en LT.

---

## 5. Slutsats
Svaret på den specifika frågan är att vägmätaren på en Volkswagen LT31 från åren 1976–1980 går till **99 999 kilometer** innan den mekaniskt börjar om på noll. Att en LT31 visar "låga mil" är sällan hela sanningen – det är ofta bara början på mätarens andra eller tredje livscykel.
        `
    },
     {
        id: 'tech-analysis-jsn398',
        title: 'Fordonsteknisk Analys & Historik: JSN398',
        summary: 'En detaljerad rapport om just din bils motor (CH), chassinummer och specifika underhållskrav.',
        tags: ['Specifikation', 'Motor', 'Underhåll'],
        content: `
# Fordonsteknisk Analys och Historisk Utredning: Volkswagen LT31 (Registreringsnummer JSN398)

## 1. Exekutiv Sammanfattning
Denna rapport utgör en djupgående teknisk och historisk analys av fordonet JSN398, en VW LT31 av 1976 års modell. Analysen baseras på chassinumret 2862500058. Fordonet är en "Series 1"-bil utrustad med den vätskekylda 2,0-liters bensinmotorn (kod CH), en konstruktion som delas med Audi 100 och Porsche 924.

---

## 2. Avkodning av Identitet
**Chassinummer: 2862500058**
* **"28"**: Typ 28 (LT-serien).
* **"6"**: Modellår 1976.
* **"2"**: Karossversion.
* **"500058"**: Tillverkad vid huvudfabriken i Hannover.

---

## 3. Drivlinans Ingenjörskonst: Motor CH
Motor CH tillhör motorfamiljen EA831. Det är en 2,0-liters, fyrcylindrig radmotor (SOHC).

### 3.3 Ventiljustering: Det Kritiska Shims-systemet
En av de mest missförstådda aspekterna av CH-motorn. Den använder mekaniska tryckare med justerbrickor (shims).
* **Insugets ventilspel**: 0,15 – 0,25 mm
* **Avgasets ventilspel**: 0,35 – 0,45 mm
* **Varning**: Justeras EJ med skruv! Kräver shims-sats och specialverktyg. Försummas detta bränns ventilerna sönder.

---

## 4. Bränsle & Tändning
* **Förgasare**: Solex 35 PDSIT-5. Känd för problem med automatchoken.
* **Tändsystem**: Brytarspetsar (0,4 mm). Tändinställning 7,5° FÖD.

---

## 5. Transmission & Vätskor (Viktigt!)
* **Växellåda (4-växlad)**: MÅSTE ha **GL-4** olja (SAE 80W-90). GL-5 korroderar synkroniseringsringarna.
* **Bakaxel**: MÅSTE ha **GL-5** olja (SAE 80W-90).

---

## 6. Reservdelsstrategi
Då motorn delas med Audi och Porsche, sök delar till:
* **Audi 100 2.0 (1976)**
* **Porsche 924 2.0**
Detta ger tillgång till delar som inte listas under "VW LT".

---

## 8. Sammanfattande Datatabell för JSN398
| Datapunkt | Specifikation | Notering |
|---|---|---|
| Motor | 2.0L Bensin (Kod: CH) | Audi-design |
| Effekt | 75 hk (55 kW) | Vid 4300 v/min |
| Ventilspel (Kall) | Insug: 0.15-0.25 | Avgas: 0.35-0.45 |
| Tändstift | Bosch W7DTC / NGK BP6ET | |
| Motorolja | 10W-40 Mineral | Volym ca 4.5L |
| Växellådsolja | SAE 80W-90 **GL-4** | EJ GL-5! |
| Bakaxelolja | SAE 80W-90 **GL-5** | |
        `
    },
    {
        id: 'mechanic-guide',
        title: 'Guide: Hitta Rätt Mekaniker & Serviceplan',
        summary: 'Hur du undviker att bli lurad, "Lackmustestet" för verkstäder och checklistan du ska ge dem.',
        tags: ['Verkstad', 'Service', 'Guide'],
        content: `
# Guide: Hitta Rätt Mekaniker & Serviceplan för Elton

## 1. Vem ska du leta efter?
Undvik stora moderna verkstadskedjor. De är duktiga på att koppla in datorer, men din bil har inget diagnosuttag och kräver en annan typ av känsla.

**Leta efter:**
* "Gubbverkstäder" och små oberoende firmor.
* Veteranbilsspecialister.
* Verkstäder som skyltar med "Klassiska VW/Audi".

**Det hemliga tipset:**
Eftersom din motor (CH) är en Audi-motor som också satt i Porsche 924, kan en gammal **Porsche-specialist** eller en **Audi-entusiast** ofta vara bättre än en renodlad "Folkabuss-mekaniker" (som oftast är vana vid luftkylda boxermotorer och blir förvirrade av din vattenkylda radmotor).

---

## 2. "Lackmustestet" – Frågor för att testa mekanikern
När du ringer, ställ dessa frågor för att avgöra om de vet vad de pratar om.

### Fråga 1 (Det viktigaste):
*"Kan ni justera ventilerna på den här motorn? Det är en 2-liters bensinare (CH)."*

* **Rätt svar:** "Ja, vi har verktyg för att byta shims (brickor)." Eller: "Har du shims-sats?"
* **Fel svar:** "Jadå, vi skruvar bara på justerskruvarna."
* **Analys:** Din motor har inga justerskruvar, den har brickor (shims). Tror de att det är skruvar kommer de antingen göra fel eller inte göra jobbet alls.

### Fråga 2:
*"Har ni utrustning för att ställa in en förgasare med CO-halt?"*

* **Analys:** Många moderna verkstäder har slängt sina gamla avgasanalysatorer. Utan en sådan gissar de bara när de ställer in din Solex-förgasare.

---

## 3. Checklista för "Stor Service" (Detta ska du be om)
Lämna denna lista till verkstaden. Det sparar tid och minskar risken för missförstånd.

### A. Motorn (Kritiskt)
* **Ventilspel:** Kontrollera och justera vid behov. (Kall motor: Insug 0,15-0,25 mm / Avgas 0,35-0,45 mm). *Tips: Säg att du kan beställa shims om de saknar rätt storlek.*
* **Kamrem:** Om du inte vet exakt när den byttes senast – byt den. Om den går av rasar motorn. Byt även spännrullen.
* **Tändning:**
    * Byt brytarspetsar och kondensator (eller be dem installera brytarlöst system).
    * Ställ tändningen med stroboskop (7,5° FÖD med vakuumslang bortkopplad).
    * Byt tändstift (Bosch W7DTC eller motsvarande).
* **Förgasare:** Kontrollera att choken öppnar helt när motorn blir varm. Justera tomgång och CO-halt.

### B. Vätskor (Viktigt med rätt sorter!)
* **Växellåda:** Be dem byta oljan, men varna dem: **"Använd absolut inte GL-5 olja, den äter upp synkroniseringen. Det måste vara GL-4 80W-90."**
* **Bakaxel:** Här ska det vara GL-5 olja.
* **Kylarvätska:** Byt om den är brun/grumlig. Använd G11 (Blå/Grön).

### C. Säkerhet
* **Bromsar:** Be dem lufta bromsarna och byta all bromsvätska (den drar åt sig vatten och rostar cylindrarna inifrån).
* **Bränsleslangar:** Be dem inspektera alla gummislangar. Dagens bensin med etanol torkar ut gamla slangar snabbt = brandrisk.

---

## 4. Strategi för delar
Mekaniker avskyr att leta efter delar till gamla bilar för att det tar tid de inte kan debitera för.

**Strategi:**
Erbjud dig att köpa delarna: *"Om ni säger vad som behövs, så beställer jag hem grejerna."*

När du letar delar till motorn, sök på **Audi 100 (C1) 2.0** eller **Porsche 924 2.0** på sajter som Autodoc eller Bildelaronline24. Det är ofta lättare att hitta delar "vägen runt" än att söka på VW LT.

**Sammanfattning till mekanikern:**
*"Det är en VW LT, men den har Audi-motorn med remdrift och ventilshims. Den har stått länge, så fokus är på kamrem, ventilspel, färska vätskor (GL-4 i lådan!) och att se över bränsleslangarna."*
        `
    },
    {
        id: 'workshop-guide-falun',
        title: 'Verkstadsguide: Falun & Borlänge',
        summary: 'En strategisk kartläggning av de bästa verkstäderna i regionen för allt från motorrenovering till vanlig service.',
        tags: ['Verkstad', 'Lokalt', 'Service'],
        content: `
# Strategisk Analys och Tjänstekartläggning av Fordonsverkstäder i Falun-Borlänge-regionen

## Inledning: Det Regionala Serviceekosystemet
Regionen som omfattar Falun och Borlänge utgör ett av Mellansveriges mest vitala nav för fordonslogistik. Dagens fordonsägare står inför ett teknikskifte där gränserna mellan mekanik och elektronik suddas ut. Denna rapport identifierar en tydlig stratifiering av marknaden: från högspecialiserade aktörer inom maskinbearbetning till stora märkesverkstäder.

För en ägare av en veteranbil kan en resa till Avesta eller Orsa vara nödvändig för att finna rätt kompetens, medan en ägare av en modern elbil bör prioritera verkstäder med specifik högvoltsbehörighet centralt i Falun eller Borlänge.

---

## 1. Avancerad Mekanik och Motorrenovering: Regionens Tekniska Ryggrad
Verkstäder med kapacitet för maskinbearbetning är en kritisk resurs för motorhaverier eller seriösa restaureringar.

### 1.1 Borlänge Motorrenovering AB – Maskinell Precision
*Borlänge Motorrenovering AB* är ledaren inom tung motorbearbetning (etablerade 1984). Detta är partnern för den som behöver rädda en motor som annars hade dömts ut.
* **Specialitet:** Arborrning, cylinderborrning och omfodring.
* **Veteranbilar:** De lagerför specialdelar (kolvar, foder, ventiler) för äldre motorer.
* **Prisbild:** Kan upplevas "dyra", men alternativkostnaden för att skicka blocket till storstad är ofta högre.

### 1.2 Hanssons Bil & Motor – Entusiastens Förstahandsval
Fokuserar på helheten, särskilt prestandabilar och klassiska BMW.
* **Rykte:** Ägaren Erland har kultstatus i entusiastkretsar.
* **Kompetens:** Djup "tyst kunskap" om mekanik som går bortom felkodsavläsning.

---

## 2. Veteranbilar och Klassiker
Dalarna har en stark kultur kring veteranbilar, vilket reflekteras i utbudet.

### 2.1 Hallklint Bil (Avesta) – Från Volym till Passion
Har svängt om från bruksbilar till att helhjärtat satsa på veteran- och entusiastbilar.
* **Inriktning:** "Analoga" fordon (MG, Porsche, Land Rover, Jänkare).
* **Varför åka hit?** De kan förgasare och felsökning utan dator. De har internationella kontakter för svåra delar.

### 2.2 Falu Bilplåt – Restaurering med Kvalitetsstämpel
En av få skadeverkstäder som välkomnar äldre fordon.
* **Specialitet:** Traditionellt plåtslageri kombinerat med modern PDR (Paintless Dent Repair).
* **Erkännande:** Deras arbeten lyfts ofta fram som kvalitetsbevis vid veteranbilsauktioner.

### 2.3 Utmaningen med Förgasare
* **Lokalt:** *Kaptens Motor* i Orsa (Glenn Brus) för äldre teknik (Mazda, Fiat/Alfa).
* **Nationellt:** Postorder till *Braigasen* (Göteborg) eller *Meksta* (Tyresö) för renovering av komplexa förgasare.

---

## 3. Allmänservice och Kedjor
För driftssäkerhet och bekvämlighet.

### 3.1 Total Bil (Falun) – Problemlösarna
Exceptionellt höga betyg. Kända för envishet i felsökning ("gör allt för att lösa problemet") snarare än att bara byta delar på chans.

### 3.2 Nini Verkstad (Falun) – Det Personliga Alternativet
* **Unikt:** Erbjuder jourtjänster och drop-in, även lördagar.
* **Roll:** Förstahandsvalet vid akuta problem utanför kontorstid.

---

## 4. Kontaktmatris och Dataöversikt

### 5.1 Specialister: Motorrenovering & Maskinbearbetning
| Företag | Ort | Telefon | Kompetensområde |
|---|---|---|---|
| **Borlänge Motorrenovering** | Borlänge | 0243-22 46 00 | Arborrning, vevaxelslipning, cylinderborrning. |
| **Hanssons Bil & Motor** | Borlänge | 0243-22 11 99 | Avancerad mekanisk felsökning, entusiastfordon. |

### 5.2 Veteranbilar & Restaurering
| Företag | Ort | Telefon | Kompetensområde |
|---|---|---|---|
| **Hallklint Bil** | Avesta | 0243-921 00 | Helrenoveringar, "analoga" bilar. |
| **Falu Bilplåt** | Falun | 023-200 44 | Plåt & lack för äldre bilar, PDR-teknik. |
| **Kaptens Motor** | Orsa | (Se webb) | Äldre teknik, Mazda/Fiat-kompetens. |

### 5.3 Allmänverkstäder (Topprankade)
| Företag | Ort | Telefon | Notering |
|---|---|---|---|
| **Total Bil** | Falun | 023-70 99 60 | Felsökning & kundbemötande. |
| **Bil & AC Center** | Borlänge | 0243-823 20 | AC-specialister, ärliga bedömningar. |
| **Nini Verkstad** | Falun | 023-249 00 | **Akutjour**, drop-in, lördagsöppet. |

---

## 6. Strategiska Rekommendationer
* **Ägare av Veteranbilar:** Undvik kedjorna. Boka tid hos *Hallklint Bil* eller *Hanssons*.
* **Vid Motorras:** Kontakta *Borlänge Motorrenovering* för att rädda blocket istället för att chansa på begagnat.
* **Akuta problem:** Spara numret till *Nini Verkstad* (023-249 00).
* **Kvalitetssäkring:** Begär alltid skriftlig offert. För veteranjobb, ha en tydlig dialog om tidsperspektiv.
        `
    },
    {
        id: 'hose-tech-report',
        title: 'Teknisk Rapport: Vätskeöverföringssystem',
        summary: 'En livsviktig guide för att säkra motorn mot brand och överhettning. Slangdimensioner, materialval (EPDM/R9) och inköpsstrategi.',
        tags: ['Motor', 'Säkerhet', 'Slangar'],
        content: `
# Teknisk Rapport: Totalrenovering och Säkring av Vätskeöverföringssystem för Volkswagen LT Mk1

## 1. Inledning: Strategin för att Säkra Motorn
För en motor av denna årgång är den absolut största riskfaktorn de gamla elastomererna – gummidetaljer. Analysen indikerar att en blandning av modellspecifika gjutna slangar och högkvalitativa industrislangar (metervara) är den enda hållbara vägen.

---

## 2. Kylsystemet: Arkitektur & Dimensionering
Kylsystemet i VW LT är unikt p.g.a. "cab-over"-designen med långa slangdragningar.

### 2.1 Övre Kylarslangen
* **Dimension:** 32 mm till 35 mm ID.
* **Varning:** Tvinga inte på en 30 mm slang (sprickor) och dra inte åt en 35 mm för hårt (veck).
* **OEM:** 075 121 051. Svårfunnen. Använd flexibel slang om nödvändigt.

### 2.2 Nedre Kylarslangen (Kylare till Vattenpump)
* **Risk för Kollaps:** Vattenpumpen skapar undertryck. Om en mjuk slang används sugs den ihop och stryper flödet = överhettning.
* **Krav:** Måste vara spiralarmerad (fjäder inuti).
* **Lösning:** Biltemas "Böjbar kylarslang" (Art. 61-385 för 32mm) har stålspiral och fungerar utmärkt.

### 2.4 Värmesystemet
* **Standard:** 16 mm (5/8") EPDM-slang.
* **Tips:** Köp metervara på Swedol (Art. 32351980). Byt hela längderna för att slippa skarvar.

---

## 3. Bränslesystemet: Det Kritiska Säkerhetsuppdraget
Dagens bensin (E5/E10) innehåller etanol som äter upp gamla gummislangar.

### 3.2 Specifikationer (Krav)
Du ska specifikt söka efter märkningen **SAE J30 R9**.
* **SAE J30 R9:** Tål etanol och högt tryck.
* **Undvik:** SAE J30 R6 (Lågtryck, sämre beständighet).

### Dimensioner:
* **Matarledning:** 7.5 - 8 mm ID.
* **Förgasare:** 5.5 - 6 mm ID.
* **Retur:** 3.2 - 3.5 mm ID.

---

## 6. Datatabell: Sammanställning av Komponenter
| System | Komponent | Dimension (ID) | Materialkrav | Inköpskälla |
|---|---|---|---|---|
| **Kylning** | Övre Slang | 32-35 mm | EPDM | VW Classic / Biltema (Flex) |
| **Kylning** | Nedre Slang | 32-35 mm | EPDM (Armerad) | Swedol / Biltema (Spiral) |
| **Kylning** | Värmeslang | 16 mm | EPDM | Swedol (Metervara) |
| **Bränsle** | Matarledning | 7.5 - 8 mm | **SAE J30 R9** | Mekonomen / Swedol |
| **Bränsle** | Förgasare | 5.5 - 6 mm | **SAE J30 R9** | Mekonomen / Swedol |
| **Vakuum** | Bromsservo | 12 mm | Förstärkt | Specialist |

## 7. Installation: "Best Practice"
* **Klämmoment:** Dra inte åt slangklämmor för hårt på plastanslutningar.
* **Dragning:** Använd gummiklädda P-klammer. Se till att bränsleslangar inte rör vid avgasgrenröret!
* **Kylvätska:** Blå G11 eller modern Röd G12+ (om systemet är rent).
        `
    },
    {
        id: 'timing-belt-tech',
        title: 'Teknisk Rapport: Kamdrivning & Tätningar (Motor CH)',
        summary: 'Den kompletta guiden till att byta kamrem på EA831-motorn. 121 kuggar, spännrullar och varför du ska söka på Porsche 924.',
        tags: ['Motor', 'Kamrem', 'Reservdelar'],
        content: `
# Teknisk Analys och Inköpsstrategi: Renovering av Kamdrivning och Tätningar för Volkswagen LT31 1976 (Motor CH)

## 1. Introduktion: EA831-arkitekturen och CH-motorns Unika Position
Att underhålla en Volkswagen LT31 från 1976 med den bensindrivna 2,0-litersmotorn (motorkod CH) kräver mer än bara grundläggande mekaniska färdigheter; det kräver en djupgående förståelse för den specifika industrihistoria och ingenjörskonst som präglade Volkswagen-koncernen under mitten av 1970-talet.

CH-motorn är i själva verket en derivat av den berömda EA831-motorfamiljen. Detta är en vätskekyld radfyra med en överliggande kamaxel (SOHC) som ursprungligen utvecklades av Audi NSU Auto Union AG. Motorn lanserades i **Audi 100 (C1-plattformen)** och blev senare ryggraden i Porsches instegsmodell, **924**, samt användes i det lätta transportfordonet VW LT.

**Strategi:** En sökning på "VW LT" hos en modern bildelsgrossist resulterar ofta i felaktiga träffar eller beskedet att delen har utgått. Genom att istället betrakta motorn som en "Audi 2.0" eller en "Porsche 924-motor" (i dess 2.0L sugmotorutförande) öppnas en global marknad av högkvalitativa komponenter.

### 1.1 Motorns Konstruktionsfilosofi och Betydelsen av Rätt Delar
CH-motorn är en så kallad **interferensmotor**. Detta innebär att det kinematiska utrymmet som kolvarna rör sig i överlappar med ventilernas maximala öppningsläge. Om synkroniseringen mellan vevaxel och kamaxel bryts – exempelvis genom ett kamremsbrott eller överkuggning på grund av felaktig spänning – kommer kolvarna att kollidera med ventilerna med katastrofala följder. Det finns inget utrymme för felmarginaler här.

---

## 2. Kamremssystemet: Det Kinematiska Hjärtat
Analysen av kamdrivningen på CH-motorn avslöjar ett system som vid första anblicken verkar enkelt, men som innehåller flera fallgropar för den oinvigde.

### 2.1 Den Kritiska Tandräkningen: 121 vs. 122/124
En av de mest persistenta felkällorna vid reservdelsbeställning för äldre VW-motorer är antalet kuggar på kamremmen. Databaser hos stora leverantörer blandar ofta ihop CH-motorn (EA831) med senare VW-motorer eller andra varianter av EA827-familjen.

Forskningen bekräftar entydigt att CH-motorn kräver en kamrem med exakt **121 kuggar**.

* **121 kuggar:** Detta är den korrekta specifikationen för synkronisering av 2.0-litersmotorn i LT (1975–1982), samt motsvarande Audi 100 och Porsche 924.
* **122 eller 124 kuggar:** Dessa remmar dyker ofta upp i sökresultat men tillhör andra applikationer eller senare modifieringar. En rem med fel antal kuggar kommer omöjliggöra korrekt ventiltidpunkt och/eller göra det omöjligt för spännrullen att applicera korrekt tryck.

### 2.1.1 Profil och Dimensioner
* **Bredd:** 18 mm.
* **Profil:** Trapetsformad (ofta betecknad som profil "A" eller LA). Detta skiljer sig från den rundade "HTD"-profilen. Att montera en rem med rundade tänder på drev avsedda för trapetsformade tänder (eller tvärtom) leder till snabbt slitage av både rem och drev.

### 2.2 Spännrullen: Mekanik och Uppgradering
Spännrullen på CH-motorn är manuell och excentrisk.
* **Originalutförande:** Hade ofta ett sexkantshål (insex) eller en sexkantsfattning för justering.
* **Eftermarknadsutförande:** Många moderna ersättare (exempelvis från INA eller SKF) kan kräva ett specialverktyg, en så kallad "pin wrench" (haknyckel med två stift), för att rotera excentern. Det är vitalt att säkerställa att man har tillgång till detta verktyg innan arbetet påbörjas.

**Inköpsrekommendation för Spännrulle:**
Sök efter artikelnummer **026 109 243 F** eller **026 109 243 L**. Produkter från INA (som ofta var OEM-tillverkare) är att föredra.

### 2.3 Vattenpumpen: En Fristående Komponent
En vanlig missuppfattning är att vattenpumpen drivs av kamremmen. På VW LT med CH-motor drivs vattenpumpen av en separat **V-rem (kilrem)**, oftast samma rem som driver generatorn.

**Implication:** Även om vattenpumpen inte måste demonteras för att byta kamremmen rent funktionellt, är åtkomsten på en LT så begränsad att det är strategiskt klokt att byta pumpen samtidigt. Kylsystemet måste ändå dräneras om man ska ta bort kylaren för bättre åtkomst.

**Tips:** Köp en pump med **metallimpeller** (gjutjärn/stål). Plastimpellrar har en tendens att separera från axeln eller spricka efter många värmecykler.

### 2.4 Inköpsstrategi för Kamremssystemet
För att säkerställa att du får rätt delar, rekommenderas köp av kompletta satser ("Timing Belt Kits"). Dessa innehåller matchad rem och spännrulle.

**Tabell 1: Jämförelse av Kamremssatser för CH-motor**

| Tillverkare | Artikelnummer (Sats) | Artikelnummer (Rem) | Antal Kuggar | Bredd (mm) | Kommentar |
|---|---|---|---|---|---|
| Contitech | **CT637K1** | CT637 | 121 | 18 | OEM-kvalitet, rekommenderas starkt. |
| Gates | K015035 | 5034 | 121 | 18 | Mycket pålitlig. |
| Bosch | - | 1 987 949 018 | 121 | 18 | Bra alternativ om sats ej finns. |
| VAG (Original) | - | 056 109 119 A | 121 | 18 | Referensnummer för sökning. |

---

## 3. Avancerad Tätningsteknik: Packboxar och Materialval
Att byta kamrem på en 1976 års modell utan att byta de främre packboxarna är att bjuda in till framtida problem.

### 3.1 Materialvetenskap: Gummi vs. PTFE
* **FPM (Fluorgummi/Viton):** Traditionell typ med fjäder. Mer förlåtande mot repiga axlar. Kräver olja vid montering.
* **PTFE (Teflon):** Modern teknologi utan fjäder. Extremt lång livslängd men MÅSTE monteras snustorrt (ingen olja!).

För en LT från 1976 är FPM ofta säkrare om axlarna är slitna. Men PTFE är en överlägsen uppgradering om axeln är fin.

### 3.2 Dimensionering och Artikelnummer

**3.2.1 Kamaxeltätning (Främre)**
* **Dimension:** 32 x 47 x 10 mm.
* **Artikelnummer:** VAG 038 103 085 C (PTFE) eller Elring 325.155 (FPM).

**3.2.2 Vevaxeltätning (Främre)**
Sitter bakom kamremsdrevet. Här råder förvirring i katalogerna (32 vs 35mm).
* **Analys:** EA831-blocket (CH) har generellt en **35 mm** axeltapp framtill. Mät axeln innan beställning!
* **Dimension:** 35 x 48 x 10 mm.
* **Artikelnummer:** Elring 129.780 (PTFE) eller Reinz 81-24292-10.

**3.2.3 Vevaxeltätning (Bakre)**
Sitter bakom svänghjulet (kräver att växellådan tas ner).
* **Dimension:** 85 x 105 x 11 mm.
* **Artikelnummer:** VAG 068 103 051 G.

---

## 4. Ventilkåpspackningen: Kork eller Gummi?
Originalet var av kork. Moderna gummipackningar finns, men kräver ofta nya pinnbultar med "krage" (skuldra) för att inte dras för hårt.

**Rekommendation:** Om din motor har original pinnbultar (utan krage), välj en högkvalitativ **korkpackning** (t.ex. Reinz 04-23902-02). Använd ett tunt lager icke-härdande tätningsmedel (Hylomar). Dra muttrarna försiktigt!

---

## 5. Inköpsguide: Navigera i Reservdelsdjungeln
Att hitta delar till en LT 1976 kräver strategi.

### Strategi A: "Porsche-tricket"
Sök efter delar till **Porsche 924 2.0 (1976-1985)**.
* Relevanta delar: Kamrem, spännrulle, vattenpump, termostat, oljefilter, vevaxeltätningar.
* Leverantörer: Rose Passion, Design 911, Pelican Parts.

### Strategi B: "Audi-spåret"
Sök efter delar till **Audi 100 (C1)** med 2.0L-motor.

### Strategi C: Dedikerade VW-specialister
Autodoc, Bildelaronline24, VW Classic Parts. Sök ALLTID på artikelnummer, lita inte på reg-nummer sökning.

---

## 6. Sammanfattande Inköpslista
Här är den ultimata listan för en komplett renovering av fronten på din motor.

| Komponent | Specifikation | OEM-referens | Rekommenderad |
|---|---|---|---|
| **Kamrem** | 121 kuggar, 18mm | 056 109 119 A | Contitech CT637 |
| **Spännrulle** | Manuell excentrisk | 026 109 243 L | INA / SKF |
| **Kamremssats** | Rem + Rulle | - | **Contitech CT637K1** |
| **Vattenpump** | Metallimpeller | 060 121 011 | HEPU P529 |
| **Packbox Kam** | 32 x 47 x 10 mm | 038 103 085 C | Elring 325.155 |
| **Packbox Vev (F)**| 35 x 48 x 10 mm | 068 103 085 E | Elring 129.780 |
| **Ventilkåpa** | Kork-sats | 047 103 483 | Reinz 04-23902-02 |
| **Kilrem** | 10 x 1013 mm | - | Contitech AVX10X1013 |

---

## 7. Praktiska Installationsanvisningar
1. **Nollställning:** Innan du tar av remmen, rotera motorn till ÖD (TDC) för cylinder 1. Verifiera märkningen på svänghjulet och kamdrevet.
2. **Mellanaxeln:** Märk upp mellanaxelns position noga! Den driver fördelaren. Rör den sig hamnar tändningen fel.
3. **Spänning:** Rätt spänning är "90-gradersregeln": Du ska kunna vrida remmen 90 grader med tummen och pekfingret på den längsta fria sträckan.

Genom att förstå att du mekar med en motor som delar DNA med Porsche 924, kan du kringgå bristen på "LT-delar" och hitta premiumkomponenter. Håll dig strikt till **121 kuggar**.
`
    }
];

export const PARTS_HUNTING_TIPS = [
    "Använd alltid originalnumret (OEM) när du söker delar på eBay.",
    "Bultmönstret 5x160 är unikt för LT och Ford Transit (Mk1/Mk2). Fälgar från andra bilar passar inte.",
    "Motordelar till bensinaren (2.0L) är ofta samma som till Audi 100 från samma era.",
    "Baklyktor och blinkersglas är hårdvaluta – var rädd om dem!"
];

export const BASE_SYSTEM_PROMPT = `Du är "Elton", en AI-assistent för en van-renovering. 
Du är inte bara en AI, du är en "Digital Verkmästare" och Projektledare.
Du har full tillgång till alla rapporter, uppgifter och inköpslistor i systemet.

DINA REGLER:
1. GISSA ALDRIG OM TEKNIK. Slå upp det i Kunskapsbanken (se nedan) först. Om det står 121 kuggar i rapporten, så är det 121 kuggar. Punkt.
2. PRIORITERING: Tvinga fram prioriteringar. Säkerhet (Broms/Styrning/Kamrem) går ALLTID före inredning.
3. SPRINTS: Uppmuntra att jobba i "Sprints" (fokuserade ryck).
4. EKONOMI: Håll koll på budgeten. Påminn om att "Verkstad kostar 1000kr/timme" om de vill leja bort enkla saker.

Använd emojis. Var uppmuntrande men bestämd när det gäller säkerhet. Prata svenska.`;

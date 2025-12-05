

import { Phase, Task, TaskStatus, CostType, VehicleData } from './types';

export const VEHICLE_DATA: VehicleData = {
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

export const INITIAL_TASKS: Task[] = [
  // FAS 0: INKÖP
  {
    id: '0-1',
    title: 'Inspektion & Provkörning',
    description: 'Provkörning (Söndag). Mäta fukt med Meec-mätare (kolla reglar), provstarta (kall motor), kolla rost i balkar.',
    status: TaskStatus.DONE,
    phase: Phase.PLANNING,
    estimatedCostMin: 500,
    estimatedCostMax: 1000,
    actualCost: 800,
    weightKg: 0,
    costType: CostType.OPERATION,
    tags: ['Analys', 'Köp'],
    links: [],
    comments: [],
    attachments: []
  },
  {
    id: '0-2',
    title: 'Inköp av "Elton"',
    description: 'Betalning och ägarbyte via Transportstyrelsen-appen (5/12). Nu är den vår!',
    status: TaskStatus.DONE,
    phase: Phase.PLANNING,
    estimatedCostMin: 30000,
    estimatedCostMax: 30000,
    actualCost: 30000,
    weightKg: 0,
    costType: CostType.INVESTMENT,
    tags: ['Inköp', 'Milstolpe'],
    links: [],
    comments: [],
    attachments: []
  },

  // FAS 1: AKUT
  {
    id: '1',
    title: 'Däck & Hjul (Vinter)',
    description: 'Köp Nokian Hakkapeliitta. Regbevis säger 215R14, men kontrollera om 185 R14 C funkar. Kontrollera bultmönster 5x160 noga.',
    status: TaskStatus.TODO,
    phase: Phase.ACUTE,
    estimatedCostMin: 2000,
    estimatedCostMax: 6000,
    actualCost: 0,
    weightKg: 40,
    costType: CostType.OPERATION,
    tags: ['Kritisk', 'Säkerhet'],
    links: [
        { id: 'l1', title: 'Sökning på Blocket', url: 'https://www.blocket.se/annonser/hela_sverige?q=185+r14+c' }
    ],
    comments: [],
    attachments: []
  },
  {
    id: '2',
    title: 'Startbatteri',
    description: 'Prio 1. Utan el, ingen bil. Köp Biltema Silver Art. 80-2752 (75Ah, 750 CCA). Enkel montering.',
    status: TaskStatus.TODO,
    phase: Phase.ACUTE,
    estimatedCostMin: 1200,
    estimatedCostMax: 1600,
    actualCost: 0,
    weightKg: 20,
    costType: CostType.OPERATION,
    tags: ['El', 'Motor', 'Prio 1'],
    links: [],
    comments: [],
    attachments: []
  },
  {
    id: '3',
    title: 'Bränslesystem & Tändning',
    description: 'Byt mjuka slangar, montera backventil innan pump, byt stift/fördelare/rotor.',
    status: TaskStatus.TODO,
    phase: Phase.ACUTE,
    estimatedCostMin: 1000,
    estimatedCostMax: 2000,
    actualCost: 0,
    weightKg: 2,
    costType: CostType.OPERATION,
    tags: ['Motor', 'Drift'],
    links: [],
    comments: [],
    attachments: []
  },
  
  // FAS 2: MEKANISK
  {
    id: '4',
    title: 'Kamrem & Vattenpump',
    description: 'Boka verkstad. Kritisk punkt! Kör ej långt innan detta är gjort.',
    status: TaskStatus.TODO,
    phase: Phase.MECHANICAL,
    estimatedCostMin: 5000,
    estimatedCostMax: 7000,
    actualCost: 0,
    weightKg: 3,
    costType: CostType.OPERATION,
    tags: ['Verkstad', 'Kritisk'],
    links: [],
    comments: [],
    attachments: []
  },
  {
    id: '5',
    title: 'Stor Service',
    description: 'Oljebyte (10W-40/15W-40), Oljefilter, Luftfilter, Bränslefilter.',
    status: TaskStatus.TODO,
    phase: Phase.MECHANICAL,
    estimatedCostMin: 1500,
    estimatedCostMax: 1500,
    actualCost: 0,
    weightKg: 5,
    costType: CostType.OPERATION,
    tags: ['Service', 'Gör själv'],
    links: [],
    comments: [],
    attachments: []
  },

  // FAS 3: KAROSS
  {
    id: '6',
    title: 'Svetsa Y-Balken (Bärande)',
    description: 'Prio 1 (Omgående). Bärande konstruktion! Kapa bort sjukt stål, svetsa nytt (1.5-2mm). Leja ut: 4-10k. Göra själv: ca 500kr.',
    status: TaskStatus.TODO,
    phase: Phase.BODY,
    estimatedCostMin: 500,
    estimatedCostMax: 10000,
    actualCost: 0,
    weightKg: 5,
    costType: CostType.INVESTMENT,
    tags: ['Rost', 'Svets', 'Prio 1', 'Kritisk'],
    links: [],
    comments: [],
    attachments: []
  },
  {
    id: '7',
    title: 'Byt Sidodörr (Skjutdörr)',
    description: 'Leta frisk skjutdörr på bildelsbasen/Facebook. Laga ej den gamla.',
    status: TaskStatus.TODO,
    phase: Phase.BODY,
    estimatedCostMin: 1500,
    estimatedCostMax: 3000,
    actualCost: 0,
    weightKg: 25,
    costType: CostType.INVESTMENT,
    tags: ['Kaross'],
    links: [],
    comments: [],
    attachments: []
  },
  {
    id: '12',
    title: 'Fixa Förardörren',
    description: 'Prio 2 (Subakut). Kraftig rostskada. Alt A: Laga/Svetsa (ca 500kr). Alt B: Byta dörr (Rekommenderas, 1500-3500kr).',
    status: TaskStatus.TODO,
    phase: Phase.BODY,
    estimatedCostMin: 500,
    estimatedCostMax: 3500,
    actualCost: 0,
    weightKg: 20,
    costType: CostType.INVESTMENT,
    tags: ['Kaross', 'Prio 2'],
    links: [],
    comments: [],
    attachments: []
  },
  {
    id: '8',
    title: 'Rostskydd (Linolja)',
    description: 'Prio 2. Görs EFTER svetsning. Linoljebaserat är bäst på gamla bilar. Proffs: 8-15k. Göra själv: ca 1500-2500kr (Grisigt jobb!).',
    status: TaskStatus.TODO,
    phase: Phase.BODY,
    estimatedCostMin: 1500,
    estimatedCostMax: 15000,
    actualCost: 0,
    weightKg: 2,
    costType: CostType.INVESTMENT,
    tags: ['Underhåll', 'Prio 2'],
    links: [],
    comments: [],
    attachments: []
  },
  {
    id: '13',
    title: 'Lackskador & Ytrost',
    description: 'Prio 3 (Lång sikt). Slipa, rostomvandlare, grundfärg, täckfärg. Bättringsmåla själv (1-2k) eller partiell proffslack (10-20k).',
    status: TaskStatus.TODO,
    phase: Phase.BODY,
    estimatedCostMin: 1000,
    estimatedCostMax: 20000,
    actualCost: 0,
    weightKg: 1,
    costType: CostType.INVESTMENT,
    tags: ['Kosmetika', 'Prio 3'],
    links: [],
    comments: [],
    attachments: []
  },

  // FAS 4: VANLIFE
  {
    id: '9',
    title: 'Isolering (Armaflex)',
    description: 'Riv ut gammalt. Tvätta. Klistra Armaflex mot plåt. Fuktmät reglar (max 18-20%).',
    status: TaskStatus.TODO,
    phase: Phase.BUILD,
    estimatedCostMin: 2000,
    estimatedCostMax: 4000,
    actualCost: 0,
    weightKg: 15,
    costType: CostType.INVESTMENT,
    tags: ['Interiör'],
    links: [],
    comments: [],
    attachments: []
  },
  {
    id: '10',
    title: 'Dieselvärmare (Vevor)',
    description: 'Montera med separat 10L tank (pga bensinbil). Borra golv för avgas.',
    status: TaskStatus.TODO,
    phase: Phase.BUILD,
    estimatedCostMin: 1400,
    estimatedCostMax: 1400,
    actualCost: 0,
    weightKg: 8,
    costType: CostType.INVESTMENT,
    tags: ['Värme'],
    links: [],
    comments: [],
    attachments: []
  },
  {
    id: '11',
    title: 'Mellanvägg & El',
    description: 'Bygg vägg mot hytt. Installera LiFePO4 + DC-DC laddare.',
    status: TaskStatus.TODO,
    phase: Phase.BUILD,
    estimatedCostMin: 4000,
    estimatedCostMax: 8000,
    actualCost: 0,
    weightKg: 40,
    costType: CostType.INVESTMENT,
    tags: ['El', 'Snickeri'],
    links: [],
    comments: [],
    attachments: []
  },
];

export const BASE_SYSTEM_PROMPT = `
Du är en expert på att renovera skåpbilar, specifikt VW LT31 bensinare. Du hjälper till med projektet "Elton".

HÄR ÄR FULLSTÄNDIG DATA OM FORDONET (JSN398):
${JSON.stringify(VEHICLE_DATA, null, 2)}

HÄR ÄR VÅRA SPECIFIKA EXPERTTIPS OCH GUIDER:
${JSON.stringify(VEHICLE_TIPS, null, 2)}

HÄR ÄR DEN GÄLLANDE UNDERHÅLLSPLANEN (PRIO 1-3):
Prio 1 (Omgående):
1. Laga rostig balk (Bärande). Viktigast! Måste svetsas.
2. Nytt startbatteri.

Prio 2 (Subakut):
3. Fixa förardörren (Rost). Byta eller laga.
4. Rostskydda underredet (Linolja, efter svets).

Prio 3 (Lång sikt):
5. Laga lackskador & ytrost.

HÄR ÄR AKTUELL PROJEKTPLAN:
När du svarar, ta hänsyn till uppgifter, kommentarer som användaren skrivit på uppgifter, och om det finns kvitton/bilder uppladdade (du ser filnamnen).

VIKTIGT OM BILEN:
- Det är en bensinare (2.0L Audi motor).
- Den är registrerad med BOSTADSINREDNING vilket är bra för camper-bygget.
- Mätaren har troligen slagit om (endast 5 siffror), så "3000 mil" är nog 13000 eller 23000 mil.
- Max lastvikt är 880 kg. Håll koll på detta i råden.

Svara alltid kort, peppande och strukturerat. Använd emojis.
`;
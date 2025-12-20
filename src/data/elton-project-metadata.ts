/**
 * ELTON PROJECT METADATA
 * 
 * Converted from project_metadata.json
 * Context, participants, strategic decisions, unknowns
 */

import { ProjectMetadata } from '@/types/types';

export const ELTON_PROJECT_METADATA: ProjectMetadata = {
    projectId: 'elton-jsn398',

    participants: [
        {
            name: 'Joel Kvarnsmyr',
            role: 'Tekniskt ansvarig',
            competenceProfile: 'Erfaren (tidigare LT31-ägare, totalrenovering, svets, el, VVS), student.',
            assets: 'Har tillgång till fullutrustat garage på Gotland.'
        },
        {
            name: 'Hanna Eriksson',
            role: 'Ägare & Lärling',
            competenceProfile: 'Nybörjare, vill lära sig alla moment.',
            assets: 'Ägare av fordonet.'
        }
    ],

    context: {
        location: 'Saknar fast garage/verkstad. Verktyg hyrs via Ramirent.',
        seasonGoal: 'Körbar bil sommaren (lära känna bilen). Större jobb höst/vinter.',
        travelPlans: 'Gotland i sommar (semester + arbete).'
    },

    strategicDecisions: [
        {
            id: 'D1',
            area: 'motor',
            decision: 'MINIMAL_SERVICE_NOW',
            reasoning: 'Okänd historik, tidigare startgasanvändning, oljig kamrem. Ej värt att investera 10-15k i omfattande service på en potentiellt svag motor.',
            actionNow: 'Oljebyte, luftfiltertätning, monitorera förbrukning',
            actionFuture: 'Utvärdera efter sommarens körning. Planera för eventuellt motorbyte (diesel/starkare bensin) höst/vinter.',
            decidedDate: '2025-12-20'
        },
        {
            id: 'D2',
            area: 'doors',
            decision: 'REPLACE_WITH_USED',
            reasoning: 'Både skjutdörr och förardörr har för omfattande rostskador för att reparera ekonomiskt. 1300 LT-bilar kvar i trafik, regelbunden skrotning ger tillgång till begagnade delar.',
            actionNow: 'Börja leta begagnade dörrar (Blocket, tyska eBay Kleinanzeigen, LT-forum)',
            actionFuture: 'Byt båda dörrarna när lämpliga hittas',
            decidedDate: '2025-12-20'
        },
        {
            id: 'D3',
            area: 'roofLeak',
            decision: 'TEMPORARY_SEAL_NOW',
            reasoning: 'Stoppa aktivt vattenläckage innan sommaren. Ordentlig reparation kräver mer tid och garage.',
            actionNow: 'Sikaflex-tätning av takskarv vid förardörren',
            actionFuture: 'Ordentlig rostbehandling och tätning höst/vinter med garage',
            decidedDate: '2025-12-20'
        },
        {
            id: 'D4',
            area: 'roofHatch',
            decision: 'REPLACE_WITH_MODERN',
            reasoning: 'Befintlig lucka har rostig ram, dåliga tätningar. Ny modern lucka ger säker tätning och bättre ventilation.',
            actionNow: 'Beställa Fiamma Vent/Turbo eller Dometic Mini Heki (40x40cm)',
            actionFuture: 'Montera i sommar',
            decidedDate: '2025-12-20'
        },
        {
            id: 'D5',
            area: 'awning',
            decision: 'REMOVE_FOR_INSPECTION',
            reasoning: 'Läckage vid markisfästet. Behöver inspekteras för att bedöma skador och täta ordentligt.',
            actionNow: 'Demontera markis',
            actionFuture: 'Beslut om återmontering efter inspektion av glasfibertak under fästena',
            decidedDate: '2025-12-20'
        },
        {
            id: 'D6',
            area: 'insulation',
            decision: 'KEEP_FOR_SUMMER_REDO_LATER',
            reasoning: 'Befintlig isolering i bodelen är acceptabel. Förarhyttsområdet är slarvigt gjort men funktionellt. Vill använda bilen i sommar.',
            actionNow: 'Lev med befintlig isolering',
            actionFuture: 'Göra om isolering förarhytt + taklucksområde höst/vinter',
            decidedDate: '2025-12-20'
        },
        {
            id: 'D7',
            area: 'electrical',
            decision: 'TEMPORARY_LIFEPO4_NOW_VICTRON_LATER',
            reasoning: 'Vill kunna göra enklare utflykter i januari. Bygger fristående LiFePO4-system som senare integreras i komplett Victron-uppsättning.',
            actionNow: 'Bygg ~300Ah LiFePO4-bodelsbatteri som separat system',
            actionFuture: 'Komplett Victron-system med MPPT, DC-DC, inverter, nya solpaneler (2x200W)',
            decidedDate: '2025-12-20'
        },
        {
            id: 'D8',
            area: 'repaint',
            decision: 'NOT_YET',
            reasoning: 'Aktiv rost måste stoppas först. Omlackering på bil med rost under är bortkastade pengar.',
            actionNow: 'Punktbehandla rostgenomslag, täta läckagepunkter',
            actionFuture: 'Eventuell lackering om 2-3 år när allt annat är klart',
            decidedDate: '2025-12-20'
        }
    ],

    unknowns: [
        {
            item: 'Mätarställning',
            status: 'Okänd',
            theory: 'Mätaren slår om vid 10 000. Verklig sträcka: 13k, 23k eller 33k mil.',
            reliability: 'Mycket osäker'
        },
        {
            item: 'Isolering i väggar',
            status: 'Okänd',
            theory: 'Misstänkt dålig (express-skivor + sprutskum, slarvigt utfört)'
        },
        {
            item: 'Växellådsolja & Nav',
            status: 'Okänd status'
        }
    ],

    constraints: [
        { type: 'resource', description: 'Saknar garage (begränsar stora jobb vintertid).' },
        { type: 'knowledge', description: 'Kompetensöverföring (Hanna måste läras upp under arbetets gång).' },
        { type: 'access', description: 'Garage tillgängligt på Gotland först höst/vinter.' }
    ]
};

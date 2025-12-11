/**
 * Expert Analysis Service
 *
 * Automatically generates expert analysis for vehicles including:
 * - Common faults and issues
 * - Modification tips
 * - Maintenance schedules
 * - Model-specific recommendations
 *
 * All AI calls are handled via Cloud Functions for security.
 */

import { ExpertAnalysis, VehicleMaintenanceData } from '@/types/types';
import { generateJSON } from './aiService';

// ===========================
// MAIN EXPERT ANALYSIS GENERATOR
// ===========================

/**
 * Generate comprehensive expert analysis for a vehicle
 */
export async function generateExpertAnalysis(
  make: string,
  model: string,
  year: number,
  engineCode?: string
): Promise<ExpertAnalysis> {

  const vehicleId = `${make} ${model} ${year}${engineCode ? ` (${engineCode})` : ''}`;

  try {
    const systemPrompt = `Du är en expert på klassiska bilar och husvagnar, särskilt svensk bilhistoria.

⚠️ VIKTIGT: SKRIV ENDAST PÅ SVENSKA - inga engelska ord i title eller description.

Analysera detta fordon: ${vehicleId}`;

    const userPrompt = `Ge mig en strukturerad analys i JSON-format med följande struktur:

{
  "commonFaults": [
    {
      "title": "Kort titel på problemet",
      "description": "Detaljerad beskrivning av vad som går fel och varför",
      "urgency": "High" | "Medium" | "Low"
    }
  ],
  "modificationTips": [
    {
      "title": "Titel på modifiering",
      "description": "Vad modifieringen innebär och fördelar"
    }
  ],
  "maintenanceNotes": "En personlig kommentar från dig som expert, som en vän skulle ge. Kort och kärnfull."
}

VIKTIGA REGLER:
- Skriv på SVENSKA
- Var SPECIFIK för denna modell och årgång
- Inkludera endast KÄNDA problem för just denna bil
- Sortera efter urgency (High först)
- Mainenance notes ska vara max 2 meningar, som en erfaren mekaniker skulle säga

Fokusera på:
1. Rostproblem (specifika platser)
2. Mekaniska svagheter
3. Elektriska problem
4. Kända serviceintervaller
5. Vanliga uppgraderingar`;

    const response = await generateJSON<ExpertAnalysis>(
      systemPrompt,
      userPrompt,
      { temperature: 0.7, maxTokens: 3000 }
    );

    console.log(`✅ Expert analysis generated for ${vehicleId} via ${response.provider}`);
    return response.data;

  } catch (error) {
    console.error('Failed to generate expert analysis:', error);

    // Fallback to template-based analysis
    return getFallbackAnalysis(make, model, year);
  }
}

// ===========================
// MAINTENANCE DATA GENERATOR
// ===========================

/**
 * Generate maintenance data (fluids, battery, tires, etc.)
 */
export async function generateMaintenanceData(
  make: string,
  model: string,
  year: number,
  engineVolume?: string
): Promise<VehicleMaintenanceData> {

  try {
    const systemPrompt = `Du är en mekaniker-expert. Ge mig teknisk service-data för:

⚠️ VIKTIGT: Svara på SVENSKA.

Fordon: ${make} ${model} ${year}
${engineVolume ? `Motor: ${engineVolume}` : ''}`;

    const userPrompt = `Ge mig JSON med denna struktur:

{
  "fluids": {
    "oilType": "t.ex. 10W-40",
    "oilCapacity": "t.ex. 4.5 liter",
    "coolantType": "t.ex. G12+",
    "gearboxOil": "t.ex. 75W-90 (2.5L)"
  },
  "battery": {
    "type": "t.ex. 12V Blysyra",
    "capacity": "t.ex. 75Ah"
  },
  "tires": {
    "pressureFront": "t.ex. 2.2 bar",
    "pressureRear": "t.ex. 2.5 bar"
  }
}

Var så specifik som möjligt för denna årgång och modell.`;

    const response = await generateJSON<VehicleMaintenanceData>(
      systemPrompt,
      userPrompt,
      { temperature: 0.7, maxTokens: 2000 }
    );

    console.log(`✅ Maintenance data generated via ${response.provider}`);
    return response.data;

  } catch (error) {
    console.error('Failed to generate maintenance data:', error);

    // Generic fallback
    return {
      fluids: {
        oilType: '10W-40 eller 15W-40',
        oilCapacity: 'Se instruktionsbok',
        coolantType: 'Kylvätska för -35°C'
      },
      battery: {
        type: '12V Blysyra',
        capacity: '70-80 Ah'
      },
      tires: {
        pressureFront: '2.2 bar',
        pressureRear: '2.5 bar'
      }
    };
  }
}

// ===========================
// FALLBACK DATA (When AI Fails or No API Key)
// ===========================

/**
 * Template-based analysis for common vehicles
 */
function getFallbackAnalysis(make: string, model: string, year: number): ExpertAnalysis {

  const vehicleKey = `${make.toLowerCase()} ${model.toLowerCase()}`.trim();

  // Known vehicle templates
  if (vehicleKey.includes('volkswagen') && vehicleKey.includes('lt')) {
    return {
      commonFaults: [
        {
          title: 'Rostangrepp i golv och hjulhus',
          description: 'VW LT är berömt för rost i golvet, särskilt vid lastrummets bakkant och vid vattenpump-fästet. Kontrollera noggrant innan köp!',
          urgency: 'High'
        },
        {
          title: 'Svag växellåda',
          description: 'Den manuella 4-växlade lådan är inte byggd för tung last. Undvik att överbelasta och hålla växeloljor bytt.',
          urgency: 'Medium'
        },
        {
          title: 'Elektriska problem (jordfelsökare)',
          description: 'Äldre kabeldragningar kan ge intermittenta problem. Kolla särskilt startmotor och generator-anslutningar.',
          urgency: 'Low'
        }
      ],
      modificationTips: [
        {
          title: 'Uppgradera till 5-växlad låda',
          description: 'Möjligt att byta till senare LT-modellers 5-växlade låda för bättre motorvägskörning.'
        },
        {
          title: 'Modernisera elsystemet',
          description: 'Byt till LED-lampor och dra nya kablar för tillförlitligare funktion.'
        }
      ],
      maintenanceNotes: 'Smörj spindelbultar och kontrollera bromsslanger varje år! LT:n gillar inte att stå still – kör den regelbundet.'
    };
  }

  if (vehicleKey.includes('volvo') && (vehicleKey.includes('240') || vehicleKey.includes('740'))) {
    return {
      commonFaults: [
        {
          title: 'Stötdämpare och fjädring sliten',
          description: 'Efter 30+ år är stötdämpare och bussningar ofta helt slut. Byt allt i fjädringen för bästa resultat.',
          urgency: 'Medium'
        },
        {
          title: 'Bränslepump (särskilt med Bosch K-Jetronic)',
          description: 'Äldre Volvos med mekanisk insprutning kan få problem med bränslepump. Håll filter rent.',
          urgency: 'Medium'
        },
        {
          title: 'Rost i bakskärmar och tröskel',
          description: 'Klassiska Volvo-rostfickor. Kolla särskilt bakom plastlist på trösklar.',
          urgency: 'High'
        }
      ],
      modificationTips: [
        {
          title: 'Uppgradera bromsarna',
          description: '740 Turbo-bromsar passar direkt på 240 och ger mycket bättre bromskraft.'
        },
        {
          title: 'Bättre ljuddämpning',
          description: 'Lägg till modern dämpningsmatta under mattor för betydligt tystare körning.'
        }
      ],
      maintenanceNotes: 'Volvo 240/740 går hur långt som helst om du byter olja ofta och håller koll på rosten. En "miljonbil" på riktigt!'
    };
  }

  // Generic fallback for unknown vehicles
  return {
    commonFaults: [
      {
        title: 'Åldersrelaterad rost',
        description: `För en ${year}-modell, kontrollera noga efter rost i balkar, golv och hjulhus. Rost är den största fienden för äldre fordon.`,
        urgency: 'High'
      },
      {
        title: 'Slitna gummidelar',
        description: 'Gummibussningar, packningar och slangar blir spröda med tiden. Byt ut systematiskt för att undvika läckage.',
        urgency: 'Medium'
      },
      {
        title: 'Elektriska problem',
        description: 'Äldre kabeldragningar kan ha oxiderade kontakter. Rensa och skydda alla anslutningar.',
        urgency: 'Low'
      }
    ],
    modificationTips: [
      {
        title: 'Modernisera säkerhetsutrustning',
        description: 'Överväg att installera moderna bromsar, bälten och barnstolar om fordonet ska användas regelbundet.'
      },
      {
        title: 'Förbättra isolering',
        description: 'Lägg till modern värme- och ljudisolering för ökad komfort, särskilt i skåpbilar/husvagnar.'
      }
    ],
    maintenanceNotes: 'Klassiska fordon kräver lite mer uppmärksamhet än moderna, men är ofta enklare att laga själv. Bytt ofta, kör försiktigt!'
  };
}

// ===========================
// RECALL & SAFETY CHECKS
// ===========================

/**
 * Check for recalls and safety campaigns
 * TODO: Integrate with Transportstyrelsen's recall database
 */
export async function checkRecalls(vin: string, make: string, model: string, year: number): Promise<{
  hasRecalls: boolean;
  recalls: Array<{ title: string; description: string; severity: 'Critical' | 'Important' | 'Notice' }>;
}> {

  try {
    // TODO: Call actual recall API
    // For now, return empty
    console.warn('Recall checking not yet implemented');

    return {
      hasRecalls: false,
      recalls: []
    };

  } catch (error) {
    console.error('Failed to check recalls:', error);
    return {
      hasRecalls: false,
      recalls: []
    };
  }
}

// ===========================
// FORUM & COMMUNITY DATA
// ===========================

/**
 * Fetch community knowledge from forums
 * Example sources: Garaget.org, Bilsidan.se, model-specific forums
 */
export async function fetchCommunityKnowledge(make: string, model: string): Promise<{
  forumLinks: string[];
  popularMods: string[];
  expertContacts: string[];
}> {

  // TODO: Implement web scraping or API integration with Swedish car forums

  const vehicleKey = `${make} ${model}`.toLowerCase();

  // Hardcoded popular forums for common Swedish vehicles
  const forumMap: Record<string, string[]> = {
    'volkswagen lt': [
      'https://www.garaget.org/?car=298',
      'https://www.facebook.com/groups/volkswagenltsverige'
    ],
    'volvo 240': [
      'https://www.240turbo.com',
      'https://www.volvocars.com/se'
    ],
    'volvo 740': [
      'https://www.garaget.org/?car=116',
      'https://www.v70.se'
    ]
  };

  const links = forumMap[vehicleKey] || [
    'https://www.garaget.org',
    'https://www.bilsidan.se'
  ];

  return {
    forumLinks: links,
    popularMods: [],
    expertContacts: []
  };
}

// ===========================
// EXPORT ALL
// ===========================

export default {
  generateExpertAnalysis,
  generateMaintenanceData,
  checkRecalls,
  fetchCommunityKnowledge
};

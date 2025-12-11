/**
 * Comprehensive Onboarding Service
 *
 * Generates complete project data structure for all vehicle types:
 * - Renovering (restoration)
 * - Nybygge/Conversion (van conversion)
 * - Förvaltning (maintenance)
 *
 * Creates:
 * - Detailed vehicle data
 * - Knowledge base articles
 * - Phase-specific tasks
 * - Shopping lists
 * - Local contacts
 * - Expert tips
 *
 * All AI calls are handled via Cloud Functions for security.
 */

import {
  VehicleData,
  ProjectType,
  Task,
  ShoppingItem,
  KnowledgeArticle,
  Contact,
  ResourceLink,
  PROJECT_PHASES,
  TaskStatus,
  Priority,
  CostType
} from '@/types/types';
import {
  generateExpertAnalysis,
  generateMaintenanceData
} from './expertAnalysisService';
import { generateJSON } from './aiService';

// ===========================
// TYPES
// ===========================

export interface OnboardingInput {
  projectType: ProjectType;
  vehicleData: Partial<VehicleData>;
  userLocation?: string; // e.g., "Falun" for local contacts
  userInput?: string; // Original description
  imageBase64?: string;
}

export interface OnboardingResult {
  vehicle: VehicleData;
  knowledgeBase: KnowledgeArticle[];
  tasks: Task[];
  shoppingList: ShoppingItem[];
  contacts: Contact[];
  tips: Array<{ title: string; text: string }>;
  resourceLinks: ResourceLink[];
}

// ===========================
// PROJECT TYPE PROMPTS
// ===========================

const PROJECT_TYPE_CONTEXT = {
  renovation: {
    goal: "Restaurera/renovera en gammal bil som behöver mekaniskt & karossarbete",
    focus: "Rost, mekanisk säkerhet, besiktning, att få bilen i körbart skick",
    phases: PROJECT_PHASES.renovation,
    priorities: ["Säkerhet först", "Mekanisk funktion", "Rost", "Kosmetiskt sist"],
    keywords: ["kamrem", "rost", "bromsar", "besiktning", "renovering", "reparation"]
  },
  conversion: {
    goal: "Bygga om en fungerande skåpbil till husbil/camper",
    focus: "Isolering, el-system, vatten, snickerier, inredning, camping-funktionalitet",
    phases: PROJECT_PHASES.conversion,
    priorities: ["Planering & design", "Isolering", "El & säkerhet", "Vatten", "Inredning"],
    keywords: ["isolering", "solpaneler", "vatten", "snickerier", "möbler", "LED", "elcentral"]
  },
  maintenance: {
    goal: "Förvalta och underhålla en färdig, fungerande bil",
    focus: "Regelbunden service, säsongsunderhåll, vinterförvaring, mindre reparationer",
    phases: PROJECT_PHASES.maintenance,
    priorities: ["Förebyggande underhåll", "Säsongsberedning", "Löpande service"],
    keywords: ["service", "däck", "vinterförvaring", "oljebyte", "besiktning", "däcktryck"]
  }
};

// ===========================
// MAIN ONBOARDING GENERATOR
// ===========================

/**
 * Generate complete onboarding data for a vehicle project
 */
export async function generateCompleteOnboarding(
  input: OnboardingInput
): Promise<OnboardingResult> {

  console.log(`🚀 Generating onboarding for ${input.projectType} project...`);

  const context = PROJECT_TYPE_CONTEXT[input.projectType];
  const phases = context.phases;

  try {
    // Step 1: Enrich vehicle data with expert analysis
    const [expertAnalysis, maintenanceData] = await Promise.all([
      generateExpertAnalysis(
        input.vehicleData.make || 'Unknown',
        input.vehicleData.model || 'Unknown',
        input.vehicleData.year || new Date().getFullYear(),
        input.vehicleData.engine?.code
      ),
      generateMaintenanceData(
        input.vehicleData.make || 'Unknown',
        input.vehicleData.model || 'Unknown',
        input.vehicleData.year || new Date().getFullYear(),
        input.vehicleData.engine?.volume
      )
    ]);

    const enrichedVehicle: VehicleData = {
      ...input.vehicleData,
      expertAnalysis,
      maintenance: maintenanceData
    } as VehicleData;

    // Step 2: Generate knowledge base articles
    const knowledgeBase = await generateKnowledgeBase(
      enrichedVehicle,
      input.projectType,
      input.userInput
    );

    // Step 3: Generate tasks for each phase
    const tasks = await generatePhaseTasks(
      enrichedVehicle,
      input.projectType,
      phases,
      expertAnalysis
    );

    // Step 4: Generate shopping list
    const shoppingList = await generateShoppingList(
      enrichedVehicle,
      input.projectType,
      tasks
    );

    // Step 5: Generate local contacts
    const contacts = await generateLocalContacts(
      enrichedVehicle,
      input.userLocation || 'Sverige'
    );

    // Step 6: Generate expert tips
    const tips = generateExpertTips(
      enrichedVehicle,
      input.projectType,
      expertAnalysis
    );

    // Step 7: Generate resource links
    const resourceLinks = await generateResourceLinks(
      enrichedVehicle,
      input.projectType
    );

    console.log(`✅ Onboarding complete: ${tasks.length} tasks, ${knowledgeBase.length} articles, ${shoppingList.length} items, ${resourceLinks.length} links`);

    return {
      vehicle: enrichedVehicle,
      knowledgeBase,
      tasks,
      shoppingList,
      contacts,
      tips,
      resourceLinks
    };

  } catch (error) {
    console.error('Onboarding generation failed:', error);

    // Fallback: Return minimal but valid structure
    return {
      vehicle: input.vehicleData as VehicleData,
      knowledgeBase: [],
      tasks: [],
      shoppingList: [],
      contacts: [],
      tips: [],
      resourceLinks: []
    };
  }
}

// ===========================
// KNOWLEDGE BASE GENERATOR
// ===========================

async function generateKnowledgeBase(
  vehicle: VehicleData,
  projectType: ProjectType,
  userInput?: string
): Promise<KnowledgeArticle[]> {

  const context = PROJECT_TYPE_CONTEXT[projectType];

  const systemPrompt = `Du är en expert på ${vehicle.make} ${vehicle.model} (${vehicle.year}) och ska skapa en kunskapsbas för ett ${projectType}-projekt.

PROJEKTTYP: ${context.goal}
FOKUS: ${context.focus}

⚠️ KRITISKT SPRÅKKRAV:
- SKRIV ENDAST PÅ SVENSKA
- INGA engelska ord eller fraser
- Översätt alla termer: "Engine" → "Motor", "Brake" → "Broms", "Service" → "Service/Underhåll"

VIKTIGA REGLER:
- Var SPECIFIK för denna bil (${vehicle.make} ${vehicle.model} ${vehicle.year})
- Fokusera på ${context.focus}
- Använd Markdown i content-fältet
- Basera artiklar på VERKLIGA fakta om modellen
- Inkludera tekniska specifikationer där relevant`;

  const userPrompt = `Skapa 3-4 artiklar i JSON-format:

{
  "articles": [
    {
      "id": "analys-fordon",
      "title": "Fordonsteknisk Analys: ${vehicle.make} ${vehicle.model}",
      "tags": ["Fakta", "Historik", "Analys"],
      "summary": "Djupgående analys av detta fordon baserat på årsmodell och teknik.",
      "content": "# Markdown-formaterad artikel här\\n\\n## Tekniska detaljer\\n- Motor: ${vehicle.engine?.code || 'Okänd'}\\n- Årsmodell: ${vehicle.year}\\n\\n## Historik\\n..."
    },
    {
      "id": "guide-${projectType}",
      "title": "Guide: ${projectType === 'renovation' ? 'Renovering steg-för-steg' : projectType === 'conversion' ? 'Ombyggnadsguide' : 'Underhållsplan'}",
      "tags": ["Guide", "Praktiskt"],
      "summary": "...",
      "content": "..."
    },
    {
      "id": "vanliga-fel",
      "title": "Vanliga Problem & Lösningar",
      "tags": ["Felsökning", "Reparation"],
      "summary": "De vanligaste problemen med ${vehicle.make} ${vehicle.model} och hur du löser dem.",
      "content": "..."
    }
  ]
}

${userInput ? `\nANVÄNDARENS INPUT: "${userInput}"` : ''}`;

  try {
    const response = await generateJSON<{ articles: KnowledgeArticle[] }>(
      systemPrompt,
      userPrompt,
      { temperature: 0.7, maxTokens: 6000 }
    );

    console.log(`✅ Knowledge base generated via ${response.provider}`);
    return response.data.articles || [];

  } catch (error) {
    console.error('Knowledge base generation failed:', error);
    return getFallbackKnowledgeBase(vehicle, projectType);
  }
}

// ===========================
// TASK GENERATOR
// ===========================

async function generatePhaseTasks(
  vehicle: VehicleData,
  projectType: ProjectType,
  phases: string[],
  expertAnalysis: any
): Promise<Task[]> {

  const context = PROJECT_TYPE_CONTEXT[projectType];

  const systemPrompt = `Du är en projektplanerare för ett ${projectType}-projekt med ${vehicle.make} ${vehicle.model} (${vehicle.year}).

⚠️ KRITISKT SPRÅKKRAV:
- SKRIV ALLT PÅ SVENSKA (title, description, subtasks, tags)
- INGA engelska ord: "Safety" → "Säkerhet", "Check" → "Kontroll", "System" → "System (OK, men förklara på svenska)"

PROJEKTTYP: ${context.goal}
FASER: ${phases.join(', ')}`;

  const userPrompt = `Skapa en komplett lista på uppgifter fördelade över faserna. Returnera JSON:

{
  "tasks": [
    {
      "title": "Uppgiftens namn",
      "description": "Detaljerad beskrivning",
      "phase": "Fas 1: ...",
      "priority": "Hög" | "Medel" | "Låg",
      "estimatedCostMin": 500,
      "estimatedCostMax": 2000,
      "weightKg": 0,
      "difficultyLevel": "Easy" | "Medium" | "Expert",
      "requiredTools": ["Skiftnyckel set", "Momentnyckel"],
      "subtasks": ["🔧 Steg 1", "🛠️ Steg 2"],
      "tags": ["Motor", "Säkerhet"],
      "decisionOptions": [
        {
          "title": "Alternativ 1",
          "description": "Beskrivning av detta val",
          "costRange": "500-1000 kr",
          "pros": ["Fördel 1", "Fördel 2"],
          "cons": ["Nackdel 1"],
          "recommended": true
        }
      ]
    }
  ]
}

VIKTIGA REGLER FÖR DECISIONOPTIONS:
- Använd ENDAST för uppgifter där det finns FLERA sätt att lösa problemet (t.ex. "Göra själv" vs "Leja ut till verkstad")
- Minst 2 alternativ per decisionOption
- Ett alternativ ska markeras som "recommended: true"
- För dyra/svåra reparationer (>5000kr eller Expert-nivå): ALLTID inkludera "Gör själv" vs "Verkstad"
- För inredningsval (conversion): Inkludera olika material/stilar
- För service: Inkludera DIY vs professionell service

EMOJI FÖR SUBTASKS (använd relevant emoji i början av varje subtask):
- 🔧 Demontering/mekaniskt arbete
- 🛠️ Montering/byggande
- 🔋 El-arbete
- 🌡️ Vätskor (olja, kylvätska)
- ⚙️ Justering/inställning
- 🚗 Provkörning/test
- 🧰 Förberedelse/verktyg
- 🎨 Målning/finish
- 📏 Mätning/planering
- 🔍 Inspektion/kontroll
- 🚦 Säkerhetskontroll
- 💡 Tips/viktigt att tänka på

REGLER:
- Minst 3-5 uppgifter per fas
- Första fasen ska ha AKUTA/KRITISKA uppgifter
- Använd EXAKTA fasnamn från listan ovan
- För ${projectType}:
  ${projectType === 'renovation' ? '- Fokusera på säkerhet, rost, mekanik först\n- Inkludera besiktningskrav' : ''}
  ${projectType === 'conversion' ? '- Planering & design först\n- El-säkerhet är KRITISKT\n- Tänk isolering före inredning' : ''}
  ${projectType === 'maintenance' ? '- Förebyggande underhåll\n- Säsongsberedning\n- Serviceintervaller' : ''}

ANVÄND EXPERTANALYS:
${JSON.stringify(expertAnalysis?.commonFaults?.slice(0, 3) || [], null, 2)}`;

  try {
    const response = await generateJSON<{ tasks: any[] }>(
      systemPrompt,
      userPrompt,
      { temperature: 0.7, maxTokens: 8000 }
    );

    const parsed = response.data;
    console.log(`✅ Tasks generated via ${response.provider}`);

    // Convert to Task format
    return parsed.tasks.map((t: any, idx: number) => ({
      id: `task-${Date.now()}-${idx}`,
      title: t.title,
      description: t.description || '',
      status: TaskStatus.TODO,
      phase: t.phase,
      priority: t.priority || Priority.MEDIUM,
      sprint: undefined,
      estimatedCostMin: t.estimatedCostMin || 0,
      estimatedCostMax: t.estimatedCostMax || 0,
      actualCost: 0,
      weightKg: t.weightKg || 0,
      costType: CostType.OPERATION,
      tags: t.tags || [],
      links: [],
      comments: [],
      attachments: [],
      subtasks: (t.subtasks || []).map((st: string) => ({
        id: Math.random().toString(36).substr(2, 9),
        title: st,
        completed: false
      })),
      decisionOptions: (t.decisionOptions || []).map((opt: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        title: opt.title,
        description: opt.description,
        costRange: opt.costRange,
        pros: opt.pros || [],
        cons: opt.cons || [],
        recommended: opt.recommended || false
      })),
      difficultyLevel: t.difficultyLevel,
      requiredTools: t.requiredTools || []
    }));

  } catch (error) {
    console.error('Task generation failed:', error);
    return getFallbackTasks(vehicle, projectType, phases);
  }
}

// ===========================
// SHOPPING LIST GENERATOR
// ===========================

async function generateShoppingList(
  vehicle: VehicleData,
  projectType: ProjectType,
  tasks: Task[]
): Promise<ShoppingItem[]> {

  const context = PROJECT_TYPE_CONTEXT[projectType];

  // Create a task index for linking
  const taskIndex = tasks.map(t => ({
    id: t.id,
    title: t.title,
    tags: t.tags,
    phase: t.phase
  }));

  const systemPrompt = `Skapa en inköpslista för ${vehicle.make} ${vehicle.model} (${vehicle.year}) ${projectType}-projekt.

PROJEKTTYP: ${context.goal}`;

  const userPrompt = `BEFINTLIGA UPPGIFTER (för länkning):
${JSON.stringify(taskIndex, null, 2)}

Basera listan på:
- Fordonets underhållsbehov
- Projekttypen (${projectType})
- Uppgifterna som ska göras

Returnera JSON:

{
  "items": [
    {
      "name": "Produktnamn (inkl. specifikation)",
      "category": "Reservdelar" | "Kemi & Färg" | "Verktyg" | "Inredning" | "Övrigt",
      "estimatedCost": 500,
      "quantity": "4 st" eller "2 liter",
      "url": "butik.se (om känd)",
      "priority": "Hög" | "Medel" | "Låg",
      "linkedTaskId": "task-xxx-yyy" (OM produkten är direkt kopplad till en specifik uppgift)
    }
  ]
}

VIKTIGT FÖR linkedTaskId:
- Matcha produkter mot uppgifter baserat på titel och taggar
- Exempel: "Kamremssats" ska länkas till uppgiften "Byt kamrem och vattenpump"
- Endast länka om det är en TYDLIG koppling
- Om osäker: lämna linkedTaskId tom

FÖR ${projectType.toUpperCase()}:
${projectType === 'renovation' ? '- Servicedelar (olja, filter, bromsvätska)\n- Reservdelar för kända fel\n- Verktyg för diagnostik' : ''}
${projectType === 'conversion' ? '- Isoleringsmaterial\n- El-komponenter (kablar, säkringar)\n- Byggnads-/snickerimaterial\n- Batteri/solpaneler' : ''}
${projectType === 'maintenance' ? '- Serviceintervall-delar\n- Säsongsartiklar (frostskydd, starthjälp)\n- Förbrukningsmaterial' : ''}

MOTOR: ${vehicle.engine?.volume || 'Okänd'} ${vehicle.engine?.fuel || 'Okänd'}`;

  try {
    const response = await generateJSON<{ items: any[] }>(
      systemPrompt,
      userPrompt,
      { temperature: 0.7, maxTokens: 4000 }
    );

    const parsed = response.data;
    console.log(`✅ Shopping list generated via ${response.provider}`);

    return parsed.items.map((item: any, idx: number) => ({
      id: `shop-${Date.now()}-${idx}`,
      name: item.name,
      category: item.category || 'Övrigt',
      estimatedCost: item.estimatedCost || 0,
      quantity: item.quantity || '1 st',
      checked: false,
      url: item.url,
      store: item.url ? new URL(item.url).hostname : undefined,
      linkedTaskId: item.linkedTaskId || undefined
    }));

  } catch (error) {
    console.error('Shopping list generation failed:', error);
    return [];
  }
}

// ===========================
// LOCAL CONTACTS GENERATOR
// ===========================

async function generateLocalContacts(
  vehicle: VehicleData,
  location: string
): Promise<Contact[]> {

  // TODO: Integrate with Google Maps API for real local contacts
  // For now, return comprehensive generic Swedish contacts

  const baseContacts: Contact[] = [
    {
      name: 'Bilprovningen',
      phone: '0771-11 11 11',
      location: 'Sverige',
      category: 'Service & Akut',
      specialty: 'Besiktning',
      note: 'Bokning via bilprovningen.se'
    },
    {
      name: 'Mekonomen',
      phone: '0771-11 00 00',
      location: location,
      category: 'Service & Akut',
      specialty: 'Reservdelar, Serviceverkstad',
      note: 'Sök lokala butiker på mekonomen.se'
    },
    {
      name: 'Biltema',
      phone: '0770-20 10 00',
      location: location,
      category: 'Service & Akut',
      specialty: 'Reservdelar, Verktyg, Kemi',
      note: 'Hitta närmaste butik på biltema.se'
    },
    {
      name: 'Din Bil',
      phone: '0771-11 11 19',
      location: location,
      category: 'Service & Akut',
      specialty: 'Serviceverkstad, Reparationer',
      note: 'Kedja av fristående verkstäder'
    }
  ];

  // Add brand-specific contacts
  const make = vehicle.make.toLowerCase();
  if (make.includes('volkswagen') || make.includes('vw')) {
    baseContacts.push({
      name: 'VW-specialist',
      phone: 'Sök lokalt',
      location: location,
      category: 'Märkesverkstad',
      specialty: 'Volkswagen-specialist',
      note: 'Sök "VW verkstad ' + location + '" för lokala alternativ'
    });
  } else if (make.includes('volvo')) {
    baseContacts.push({
      name: 'Volvo-specialist',
      phone: 'Sök lokalt',
      location: location,
      category: 'Märkesverkstad',
      specialty: 'Volvo-specialist',
      note: 'Sök "Volvo verkstad ' + location + '" för lokala alternativ'
    });
  }

  // Add classic car specialists for older vehicles
  if (vehicle.year && vehicle.year < 2000) {
    baseContacts.push({
      name: 'Veteranbilar Sverige',
      phone: 'Lokalt',
      location: location,
      category: 'Veteran & Kaross',
      specialty: 'Klassiska bilar, Rostskydd',
      note: 'Sök lokala veteran-specialister'
    });
  }

  return baseContacts;
}

// ===========================
// RESOURCE LINKS GENERATOR
// ===========================

async function generateResourceLinks(
  vehicle: VehicleData,
  projectType: ProjectType
): Promise<ResourceLink[]> {

  const context = PROJECT_TYPE_CONTEXT[projectType];

  const systemPrompt = `Skapa en resursbank med användbara länkar för ${vehicle.make} ${vehicle.model} (${vehicle.year}) ${projectType}-projekt.

PROJEKTTYP: ${context.goal}`;

  const userPrompt = `Returnera JSON med länkar till:

{
  "links": [
    {
      "category": "Verkstadshandbok",
      "title": "Officiell servicemanual",
      "url": "https://...",
      "description": "Komplett verkstadshandbok med tekniska specifikationer"
    },
    {
      "category": "Forum & Community",
      "title": "VW LT-klubben Sverige",
      "url": "https://...",
      "description": "Svenskt forum för LT-ägare"
    },
    {
      "category": "Reservdelar",
      "title": "Classic Parts (specialdelar)",
      "url": "https://...",
      "description": "Specialist på äldre VW-delar"
    }
  ]
}

KATEGORIER ATT INKLUDERA:
- "Verkstadshandbok" - Officiella manualer och teknisk dokumentation
- "Forum & Community" - Forum, Facebook-grupper, klubbar
- "Reservdelar" - Butiker som säljer delar för denna bil
- "Video & Guider" - YouTube-kanaler med relevanta guider
- "Verktyg & Utrustning" - Specialverktyg som behövs

FÖR ${projectType.toUpperCase()}:
${projectType === 'renovation' ? '- Fokusera på restaureringsforum och originaldelar\n- Inkludera resurser för rostbekämpning och svetsteknik' : ''}
${projectType === 'conversion' ? '- Inkludera husbilforum och ombyggnadsguider\n- Fokusera på el-installation och snickeri-resurser' : ''}
${projectType === 'maintenance' ? '- Inkludera underhållsscheman och DIY-guider\n- Fokusera på serviceintervaller och vanliga reparationer' : ''}

REGLER:
- ENDAST riktiga, existerande webbplatser
- Prioritera SVENSKA resurser först
- Om osäker: använd generiska men trovärdiga källor (t.ex. "Garaget.org", "Bilsport Forum")
- Inkludera minst 5-8 länkar`;

  try {
    const response = await generateJSON<{ links: ResourceLink[] }>(
      systemPrompt,
      userPrompt,
      { temperature: 0.7, maxTokens: 3000 }
    );

    console.log(`✅ Resource links generated via ${response.provider}`);
    return response.data.links || [];

  } catch (error) {
    console.error('Resource links generation failed:', error);
    return getFallbackResourceLinks(vehicle, projectType);
  }
}

// ===========================
// EXPERT TIPS GENERATOR
// ===========================

function generateExpertTips(
  vehicle: VehicleData,
  projectType: ProjectType,
  expertAnalysis: any
): Array<{ title: string; text: string }> {

  const tips: Array<{ title: string; text: string }> = [];

  // From expert analysis
  if (expertAnalysis?.maintenanceNotes) {
    tips.push({
      title: 'Från Experten',
      text: expertAnalysis.maintenanceNotes
    });
  }

  // Project-type specific tips
  if (projectType === 'renovation') {
    tips.push({
      title: 'Prioritering',
      text: 'Börja alltid med säkerhet: bromsar, styrning, belysning. Kosmetik kommer sist!'
    });
  } else if (projectType === 'conversion') {
    tips.push({
      title: 'El-säkerhet',
      text: 'Aldrig spara på säkringar och kabeldimensioner. Brand är största risken i husbilar!'
    });
  } else if (projectType === 'maintenance') {
    tips.push({
      title: 'Förebygg Istället för Laga',
      text: 'Regelbunden service kostar alltid mindre än akutreparationer. Följ serviceintervallerna!'
    });
  }

  return tips;
}

// ===========================
// FALLBACK DATA
// ===========================

function getFallbackKnowledgeBase(
  vehicle: VehicleData,
  projectType: ProjectType
): KnowledgeArticle[] {
  return [
    {
      id: 'welcome',
      title: `Välkommen till ditt ${projectType}-projekt!`,
      summary: 'AI-generering misslyckades. Lägg till egna artiklar manuellt.',
      content: `# Välkommen!\n\nDetta är ett ${projectType}-projekt för ${vehicle.make} ${vehicle.model}.`,
      tags: ['Info']
    }
  ];
}

function getFallbackTasks(
  vehicle: VehicleData,
  projectType: ProjectType,
  phases: string[]
): Task[] {
  return [{
    id: 'fallback-1',
    title: `Starta ${projectType}-projektet`,
    description: 'AI kunde inte generera uppgifter. Lägg till egna manuellt.',
    status: TaskStatus.TODO,
    phase: phases[0],
    priority: Priority.HIGH,
    estimatedCostMin: 0,
    estimatedCostMax: 0,
    actualCost: 0,
    weightKg: 0,
    costType: CostType.OPERATION,
    tags: ['Start'],
    links: [],
    comments: [],
    attachments: [],
    subtasks: []
  }];
}

function getFallbackResourceLinks(
  vehicle: VehicleData,
  projectType: ProjectType
): ResourceLink[] {
  // Generic Swedish car resources
  const genericLinks: ResourceLink[] = [
    {
      category: 'Forum & Community',
      title: 'Garaget.org',
      url: 'https://www.garaget.org',
      description: 'Sveriges största bilcommunity med forum och guider'
    },
    {
      category: 'Forum & Community',
      title: 'Bilsport Forum',
      url: 'https://forum.bilsport.se',
      description: 'Aktivt forum för svenska bilentusiaster'
    },
    {
      category: 'Reservdelar',
      title: 'Mekonomen',
      url: 'https://www.mekonomen.se',
      description: 'Reservdelar och tillbehör'
    },
    {
      category: 'Reservdelar',
      title: 'Biltema',
      url: 'https://www.biltema.se',
      description: 'Verktyg, kemiprodukter och reservdelar'
    },
    {
      category: 'Video & Guider',
      title: 'ChrisFix (YouTube)',
      url: 'https://www.youtube.com/@chrisfix',
      description: 'Detaljerade reparationsguider på engelska'
    }
  ];

  // Add project-specific links
  if (projectType === 'conversion') {
    genericLinks.push({
      category: 'Forum & Community',
      title: 'Husbilsforum',
      url: 'https://www.husbil.se/forum',
      description: 'Forum för husbilsbyggare och ägare'
    });
  }

  return genericLinks;
}

// ===========================
// EXPORT
// ===========================

export default {
  generateCompleteOnboarding
};

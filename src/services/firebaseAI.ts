/**
 * Firebase AI Logic Service
 *
 * Client-side AI service using Firebase AI Logic SDK.
 * Provides secure access to Gemini API via Firebase proxy service.
 *
 * Benefits:
 * - API key stays on server (protected by Firebase)
 * - App Check integration for security
 * - Per-user rate limiting
 * - Lower cost (no Cloud Functions execution fees)
 * - True streaming support
 *
 * Note: Function calling (tool use) still requires tool declaration
 * and handling on client-side, but prompts can be protected with
 * Prompt Templates in Firebase Console.
 */

import { app } from './firebase';
import { getAI, getGenerativeModel, GoogleAIBackend, Schema } from 'firebase/ai';
import type { Task, ShoppingItem, VehicleData, ProjectType } from '@/types/types';

// Initialize Firebase AI Logic with Google AI backend
const ai = getAI(app, { backend: new GoogleAIBackend() });

// Define tool declarations for Gemini function calling
const tools = [{
  functionDeclarations: [
    {
      name: 'addTask',
      description: 'Add a new task to the project plan',
      parameters: Schema.object({
        properties: {
          title: Schema.string({ description: 'Short title of the task' }),
          description: Schema.string({ description: 'Detailed description' }),
          estimatedCostMax: Schema.number({ description: 'Estimated max cost in SEK' }),
          // GAP 5 FIX: Changed from hardcoded enum to dynamic string
          // This allows AI to use custom phase names created during onboarding
          phase: Schema.string({
            description: 'Phase name - MUST use exact name from existing phases (e.g. "Fas 1: Rostbehandling") or "Backlog" for unassigned tasks'
          }),
          priority: Schema.enumString({ enum: ['Hög', 'Medel', 'Låg'], description: 'Priority level' }),
          sprint: Schema.string({ description: 'Sprint name' }),
          // PHASE 1: Team Coordination
          assignedTo: Schema.string({
            description: 'Who should do this? User ID for team member, "ai" for Elton, or leave empty for unassigned'
          }),
          // PHASE 2: Hill Chart position
          hillPosition: Schema.number({
            description: 'Position on Hill Chart: 0-49 = figuring it out (uphill), 50 = known solution (peak), 51-100 = execution (downhill). Default 10 for new complex tasks, 60 for straightforward tasks.'
          }),
        },
        optionalProperties: ['estimatedCostMax', 'priority', 'sprint', 'assignedTo', 'hillPosition']
      })
    },
    {
      name: 'updateTask',
      description: 'Update an existing task',
      parameters: Schema.object({
        properties: {
          taskTitleKeywords: Schema.string({ description: 'Keywords to find the task' }),
          newStatus: Schema.enumString({ enum: ['todo', 'in-progress', 'done'] }),
          newPriority: Schema.enumString({ enum: ['Hög', 'Medel', 'Låg'] }),
        },
        optionalProperties: ['newStatus', 'newPriority']
      })
    },
    {
      name: 'deleteTask',
      description: 'Delete a task from the project',
      parameters: Schema.object({
        properties: {
          taskTitleKeywords: Schema.string({ description: 'Keywords to find task to delete' }),
        }
      })
    },
    {
      name: 'addToShoppingList',
      description: 'Add item to shopping list',
      parameters: Schema.object({
        properties: {
          name: Schema.string({ description: 'Item name' }),
          category: Schema.string({ description: 'Category' }),
          estimatedCost: Schema.number({ description: 'Estimated cost in SEK' }),
          quantity: Schema.string({ description: 'Quantity' }),
        },
        optionalProperties: ['category', 'estimatedCost', 'quantity']
      })
    },
    {
      name: 'inspectImage',
      description: 'Du är en expertmekaniker specialiserad på veteranbilar. Analysera bild från användaren för att identifiera komponenter, bedöma skick (rost, sprickor, slitage), och bedöm allvarlighetsgrad. Var pessimistisk gällande rost på bärande delar. Om osäker, föreslå manuell inspektion.',
      parameters: Schema.object({
        properties: {
          zone: Schema.enumString({
            enum: ['EXTERIOR', 'ENGINE', 'UNDERCARRIAGE', 'INTERIOR'],
            description: 'Inspection zone: EXTERIOR (karosseri, lack, glas), ENGINE (motor, vätskor, remmar), UNDERCARRIAGE (balkar, avgassystem, bromsrör), INTERIOR (instrument, golv, dörrar)'
          }),
          userDescription: Schema.string({ description: 'What the user said about the image/area being inspected' }),
        }
      })
    },
    {
      name: 'inspectAudio',
      description: 'Analysera ljudfil från fordonet (motorljud, klickande, gnisslande). Identifiera avvikelser och bedöm allvarlighetsgrad.',
      parameters: Schema.object({
        properties: {
          zone: Schema.enumString({
            enum: ['ENGINE', 'UNDERCARRIAGE', 'INTERIOR'],
            description: 'Sound source zone'
          }),
          userDescription: Schema.string({ description: 'What the user said about the sound' }),
        }
      })
    },
    {
      name: 'updateProjectMetadata',
      description: 'Uppdatera projektets metadata som namn, smeknamn (nickname), beskrivning, eller projekttyp. Använd detta när användaren vill ändra grundläggande projektinformation.',
      parameters: Schema.object({
        properties: {
          field: Schema.enumString({
            enum: ['name', 'nickname', 'description', 'type'],
            description: 'Field to update: name (projektnamn), nickname (smeknamn för bilen), description (projektbeskrivning), type (renovation/conversion/maintenance)'
          }),
          value: Schema.string({ description: 'New value for the field' }),
        }
      })
    },
    {
      name: 'createPhase',
      description: 'Create a new project phase from chat. Use this when setting up a new project or restructuring phases.',
      parameters: Schema.object({
        properties: {
          name: Schema.string({ description: 'Phase name (e.g. "Fas 1: Rostbehandling")' }),
          description: Schema.string({ description: 'Detailed description of what this phase includes' }),
          order: Schema.number({ description: 'Order number (1, 2, 3...)' }),
        },
        optionalProperties: ['description']
      })
    },
    {
      name: 'setProjectType',
      description: 'Set the type of the project (Renovation vs Conversion vs Maintenance)',
      parameters: Schema.object({
        properties: {
          type: Schema.enumString({
            enum: ['renovation', 'conversion', 'maintenance'],
            description: 'renovation = återställa ursprung, conversion = bygga om (t.ex. camper), maintenance = underhåll'
          }),
        }
      })
    },
    {
      name: 'completeSetup',
      description: 'Mark the project setup/onboarding as complete. Use this when phases and tasks are created and user is ready.',
      parameters: Schema.object({
        properties: {
          summary: Schema.string({ description: 'Brief summary of what was accomplished during setup' }),
        },
        optionalProperties: ['summary']
      })
    },
  ]
}];

/**
 * Get a Gemini model instance configured for chat with tools
 */
export const getChatModel = (options: { disableTools?: boolean } = {}) => {
  const modelConfig: any = {
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.9,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    }
  };

  if (!options.disableTools) {
    modelConfig.tools = tools;
  }

  return getGenerativeModel(ai, modelConfig);
};

/**
 * Build system instruction with project context
 */
const buildSystemInstruction = (
  vehicleData: VehicleData,
  currentTasks: Task[],
  currentShoppingList: ShoppingItem[],
  projectName?: string,
  userSkillLevel?: string,
  projectType?: ProjectType,
  // PHASE 3: Strategic context
  strategicContext?: {
    vision?: string;
    principles?: string[];
    budgetCap?: number;
    budgetSpent?: number;
    deadline?: string;
  },
  disableTools?: boolean
) => {
  const skillLevelContext = userSkillLevel
    ? `\n\n=== ANVÄNDARENS KUNSKAPSNIVÅ ===\n${userSkillLevel === 'beginner'
      ? 'NYBÖRJARE: Förklara allt tydligt, ge detaljerade steg-för-steg instruktioner.'
      : userSkillLevel === 'intermediate'
        ? 'HEMMAMECK: Balansera mellan DIY och verkstad. Ge praktiska tips.'
        : 'CERTIFIERAD: Teknisk och koncis. Fokusera på specs och momentvärden.'
    }`
    : '';

  const projectTypeContext = projectType
    ? `\n\n=== PROJEKTTYP ===\n${projectType === 'renovation'
      ? 'RENOVERING: Fokus på att återställa till ursprungligt skick.'
      : projectType === 'conversion'
        ? 'OMBYGGNAD (CAMPER): Fokus på camper-ombyggnad.'
        : 'FÖRVALTNING: Fokus på löpande underhåll och service.'
    }`
    : '';

  let toolInstructions = '';
  if (disableTools) {
    toolInstructions = `
=== DISKUSSIONSLÄGE (INGA ÄNDRINGAR) ===
Du är just nu i ett rent DISKUSSIONSLÄGE.
- Du kan INTE utföra några förändringar i projektet.
- Du har INGA verktyg tillgängliga (ingen addTask, ingen addToShoppingList).
- Diskutera idéer, ge råd, och bolla tankar fritt.
- Om användaren ber dig "lägga till" eller "spara" något, påminn dem om att de måste byta till Verkstadsläge för att du ska kunna agera.`;
  } else {
    toolInstructions = `
VIKTIGT - VERKTYGSANVÄNDNING:
- När användaren ger dig uppgifter, inköp, eller data: ANVÄND ALLTID verktygen (addTask, addToShoppingList, etc.)
- ALDRIG bara "prata om" att ha sparat något - GÖR DET faktiskt!
- Om användaren säger "här är en lista" eller "lägg till dessa" - ANVÄND verktyg direkt
- Bekräfta först vad du kommer göra, ANVÄND sedan verktygen, bekräfta EFTER att de körts

Exempel:
Användare: "Lägg till uppgift: Byt kamrem"
Fel: "Jag har sparat uppgiften om kamrem" (gjorde ingenting!)
Rätt: *använder addTask-verktyget* "Jag har nu lagt till uppgiften i din projektplan!"`;
  }

  const instructionText = `Du är Elton, en AI-mekaniker för ${projectName || 'fordonet'}.

${skillLevelContext}
${projectTypeContext}

=== FORDONSDATA ===
${JSON.stringify(vehicleData, null, 2)}

=== AKTUELLA UPPGIFTER ===
${currentTasks.map(t => `- ${t.title} (${t.status})`).join('\n')}

=== INKÖPSLISTA ===
${currentShoppingList.map(i => `- ${i.name} (${i.checked ? 'köpt' : 'att köpa'})`).join('\n')}

=== PROJEKTFASER (ANVÄND EXAKT DESSA NAMN) ===
Du MÅSTE använda EXAKT dessa fasnamn när du lägger till uppgifter:
- "Fas 1: Vår" - Akuta åtgärder innan sommaren (batteri, tätning, rost, motorservice)
- "Fas 2: Vår/Sommar" - Körning och inlärning (taklucka, markis, leta dörrar)
- "Fas 3: Höst/Vinter" - Större ombyggnad i garage (dörrar, svetsning, elsystem, isolering)
- "Backlog" - Framtida uppgifter utan specifik fas

VIKTIGT: Använd EXAKT dessa namn. Lägg INTE till extra text som "(Gotland med garage)" eller "– Nu/Januari".

${toolInstructions}

Svara hjälpsamt och personligt.`;

  // Add strategic context if available
  let strategicSection = '';
  if (strategicContext) {
    const parts = [];
    if (strategicContext.vision) {
      parts.push(`VISION: ${strategicContext.vision}`);
    }
    if (strategicContext.principles && strategicContext.principles.length > 0) {
      parts.push(`PRINCIPER: ${strategicContext.principles.join(', ')}`);
    }
    if (strategicContext.budgetCap) {
      const spent = strategicContext.budgetSpent || 0;
      const remaining = strategicContext.budgetCap - spent;
      const percent = Math.round((spent / strategicContext.budgetCap) * 100);
      parts.push(`BUDGET: ${spent}/${strategicContext.budgetCap} kr använt (${percent}%) - ${remaining} kr kvar`);
    }
    if (strategicContext.deadline) {
      const deadline = new Date(strategicContext.deadline);
      const today = new Date();
      const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      parts.push(`DEADLINE: ${strategicContext.deadline} (${daysLeft} dagar kvar)`);
    }
    if (parts.length > 0) {
      strategicSection = `\n\n=== PROJEKTMÅL (VIKTIGT!) ===\n${parts.join('\n')}\n\nREFERERA TILL DESSA MÅL I DINA SVAR! Om ett förslag överskrider budget eller hotar deadline, VARNA användaren.`;
    }
  }

  const fullInstruction = instructionText + strategicSection;

  // Firebase AI Logic SDK requires Content format for systemInstruction
  return {
    parts: [{ text: fullInstruction }]
  } as any;
};

/**
 * Stream a chat response using Firebase AI Logic SDK
 *
 * This version uses Firebase's proxy service and supports true streaming.
 * Function calls are handled via the response.functionCalls() method.
 */
export const streamChatMessage = async (
  history: Array<{ role: 'user' | 'model'; content: string; image?: string }>,
  newMessage: string,
  vehicleData: VehicleData,
  currentTasks: Task[],
  currentShoppingList: ShoppingItem[],
  onChunk: (text: string) => void,
  onToolCall: (toolCalls: any[]) => Promise<any[]>,
  imageBase64?: string,
  projectName?: string,
  userSkillLevel?: string,
  projectType?: ProjectType,
  customSystemInstruction?: string,
  disableTools?: boolean
) => {
  const model = getChatModel({ disableTools });

  // Build system instruction: Use custom if provided, otherwise build standard
  let systemInstruction: any;

  if (customSystemInstruction) {
    systemInstruction = {
      parts: [{ text: customSystemInstruction }]
    };
  } else {
    systemInstruction = buildSystemInstruction(
      vehicleData,
      currentTasks,
      currentShoppingList,
      projectName,
      userSkillLevel,
      projectType,
      undefined, // strategicContext
      disableTools
    );
  }


  // Convert history to Gemini format
  let chatHistory = history.map(msg => ({
    role: msg.role,
    parts: msg.image
      ? [{ text: msg.content }, { inlineData: { mimeType: 'image/jpeg', data: msg.image } }]
      : [{ text: msg.content }]
  }));

  // Firebase AI SDK requires first message to be from 'user', not 'model'
  // Remove any leading 'model' messages from history
  while (chatHistory.length > 0 && chatHistory[0].role === 'model') {
    console.warn('⚠️ Removing leading model message from chat history');
    chatHistory.shift();
  }

  // Prepare message parts
  const messageParts: any[] = [{ text: newMessage }];
  if (imageBase64) {
    messageParts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64
      }
    });
  }

  // Start chat with system instruction
  const chat = model.startChat({
    history: chatHistory,
    systemInstruction
  });

  // Stream response
  const result = await chat.sendMessageStream(messageParts);

  // Process stream
  let fullText = '';
  let functionCalls: any[] = [];

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    if (chunkText) {
      fullText += chunkText;
      onChunk(fullText);
    }

    // Check for function calls
    const calls = chunk.functionCalls?.();
    if (calls && calls.length > 0) {
      functionCalls = calls;
    }
  }

  // If there are function calls, execute them and continue conversation
  if (functionCalls.length > 0) {
    const toolResults = await onToolCall(functionCalls);

    // Convert tool results to Firebase AI format: { functionResponse: { name, response: { content } } }
    const functionResponses = toolResults.map(tr => ({
      functionResponse: {
        name: tr.name,
        response: { content: tr.result }
      }
    }));

    // Send tool responses back
    const followUpResult = await chat.sendMessageStream(functionResponses);

    // Stream follow-up response
    for await (const chunk of followUpResult.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        fullText += chunkText;
        onChunk(fullText);
      }
    }
  }

  return {
    text: fullText,
    functionCalls
  };
};

/**
 * Analyze an image or audio for vehicle inspection using Gemini 2.5 Flash
 * This is called when the AI uses inspectImage or inspectAudio tools
 */
export const analyzeInspectionEvidence = async (
  zone: 'EXTERIOR' | 'ENGINE' | 'UNDERCARRIAGE' | 'INTERIOR',
  userDescription: string,
  imageBase64?: string,
  audioBase64?: string
): Promise<{
  aiDiagnosis: string;
  severity: 'COSMETIC' | 'WARNING' | 'CRITICAL';
  confidence: number;
  category: typeof zone;
}> => {
  const model = getGenerativeModel(ai, {
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    }
  });

  // Zone-specific checklists
  const zoneChecklists = {
    EXTERIOR: `
ELTON INSPECTOR - ZONE 1: EXTERIOR ("Skalet")
==============================================

CHECKLIST:
□ Glas (vindrutor, sidorutor, bakruta - sprickor, repor)
□ Gummilister (dörrar, fönster - spruckna, hårdnade)
□ Lack (färgskikt - flagning, blåsor, nedbrytning)
□ Rostfällor:
  - Hjulhus (framsida, baksida)
  - Fotsteg/trösklar (bärande del!)
  - Dörrkanter (underkant)
  - Motorhuv/baklucka (kanter)

ESKALERINGSLOGIK:
- Level 1 (Look): Syns bubblor eller missfärgning? → Gå till Level 2
- Level 2 (Poke): "Poka försiktigt med skruvmejsel" → Går det igenom? → CRITICAL
- Level 3 (Disassemble): "Ta bort lista/panel för djupare inspektion"`,

    ENGINE: `
ELTON INSPECTOR - ZONE 2: ENGINE ("Hjärtat")
==============================================

CHECKLIST:
□ Vätskor:
  - Motorolja (nivå, färg, konsistens)
  - Kylvätska (nivå, färg, läckage)
  - "Majonnäs-koll" (vit sörja = vatten i olja = packning!)
□ Mekanisk hälsa:
  - Kamremmar/V-remmar (sprickor, slitage)
  - Slangar (sprickor, svullnad, läckage)
  - Tändstift/kablar
□ Elmotorer:
  - Torkarmotorer (funktion)
  - Fläktar (funktion, oljud)

ESKALERINGSLOGIK:
- Level 1 (Listen): Hör du tickande/gnisslande vid olika varvtal?
- Level 2 (Measure): "Följer ljudet motorvarvtal?" → Ja = ventiljustering
- Level 3 (Disassemble): "Ta av ventilkåpan för visuell inspektion"`,

    UNDERCARRIAGE: `
ELTON INSPECTOR - ZONE 3: UNDERCARRIAGE ("Skelettet")
=======================================================

CHECKLIST:
□ Balkar (längsgående, tvärbalkar - ROST = KRITISKT!)
□ Avgassystem:
  - Grenrör (sprickor, läckage)
  - Katalysator (bulor, läckage)
  - Dämpare/ljuddämpare (rostangrepp, hål)
□ Bromsrör (rost, läckage)
□ Fjädring (bussningar, stötdämpare)

ESKALERINGSLOGIK:
- Level 1 (Look): Syns rost på balk? → Gå till Level 2
- Level 2 (Poke): "Poka med mejsel" → Knastar/går igenom? → CRITICAL
- Level 3 (Professional): "Detta kräver lyft och professionell bedömning"`,

    INTERIOR: `
ELTON INSPECTOR - ZONE 4: INTERIOR ("Kontoret")
================================================

CHECKLIST:
□ Instrument:
  - Mätare (fungerar alla?)
  - Varningslampor (tänds/släcks korrekt?)
  - Reglage (värme, ventilation)
□ Golv:
  - Mattor/golvbrunnар (fukt = läckage eller rost!)
  - Pedalgummі (slitage)
□ Dörrar:
  - Tätningslister (spruckna?)
  - Lås/handtag (funktion)
  - Högtalare (funktion)

ESKALERINGSLOGIK:
- Level 1 (Look): Ser du fläckar eller fukt?
- Level 2 (Touch): "Känn på golvet under mattor" → Blött? → Hitta läckage!
- Level 3 (Trace): "Spåra läckaget (gummilister, tätningar, rostangrepр)"`
  };

  const zoneChecklist = zoneChecklists[zone];

  const inspectorPrompt = `Du är en expertmekaniker specialiserad på veteranbilar, särskilt från 60-80-talet.

${zoneChecklist}

ANVÄNDARENS BESKRIVNING: ${userDescription}

Analysera ${imageBase64 ? 'bilden' : 'ljudet'} med hjälp av checklistorna ovan.

ANALYSPROCESS:
1. Identifiera vad användaren visar (komponent, område)
2. Jämför mot checklist - vad ser/hörs du?
3. Bedöm allvarlighetsgrad (se regler nedan)
4. Föreslå eskalering om nödvändigt (Level 1→2→3)
5. Rekommendera åtgärd

ALLVARLIGHETSGRADER:
- CRITICAL = Säkerhetsrisk ELLER bärande del ELLER riskerar stopp
  * Rost på balkar, ramar, fästen
  * Broms-/styrningsfel
  * Allvarligt motorproblem

- WARNING = Behöver åtgärdas snart, blir värre med tiden
  * Mindre rostangrepp (ej bärande)
  * Slitage som påverkar funktion
  * Läckage (olja, kylvätska)

- COSMETIC = Estetiskt eller mycket mindre problem
  * Ytlig lackskada
  * Mindre repor
  * Slitagemärken som ej påverkar funktion

REGLER:
- Var PESSIMISTISK gällande rost på bärande delar
- Vid osäkerhet → föreslå nästa nivå (Level 2 eller 3)
- Referera till årsmodellspecifika problem om möjligt
- Ge konkreta nästa-steg åtgärder

Svara i JSON-format:
{
  "diagnosis": "Detaljerad beskrivning...\n\n**Nästa steg:** [konkret åtgärd eller uppföljningsfråga]",
  "severity": "COSMETIC|WARNING|CRITICAL",
  "confidence": 85
}`;

  const parts: any[] = [{ text: inspectorPrompt }];

  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64
      }
    });
  }

  if (audioBase64) {
    parts.push({
      inlineData: {
        mimeType: 'audio/mp3',
        data: audioBase64
      }
    });
  }

  const result = await model.generateContent(parts);
  const responseText = result.response.text();

  // Parse JSON response
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        aiDiagnosis: parsed.diagnosis || responseText,
        severity: parsed.severity || 'WARNING',
        confidence: parsed.confidence || 75,
        category: zone
      };
    }
  } catch (e) {
    console.warn('Failed to parse JSON from inspector, using raw text');
  }

  // Fallback: extract info from text
  const hasCriticalKeywords = /kritisk|akut|farlig|omedelbar|strukturell|bärande/i.test(responseText);
  const hasWarningKeywords = /varning|åtgärd|bör|rekommend/i.test(responseText);

  return {
    aiDiagnosis: responseText,
    severity: hasCriticalKeywords ? 'CRITICAL' : hasWarningKeywords ? 'WARNING' : 'COSMETIC',
    confidence: 75,
    category: zone
  };
};

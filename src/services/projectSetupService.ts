
import { Project, ProjectSchema, VehicleData } from '@/types/types';
import { db } from '@/services/db';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export type SetupStage = 'initial' | 'defining-goals' | 'creating-phases' | 'adding-tasks' | 'complete';

export interface SetupContext {
    projectId: string;
    vehicleData: VehicleData;
    setupStage: SetupStage;
    phasesCreated: number;
    tasksCreated: number;
}

/**
 * Creates a skeletal project for V2 onboarding
 */
export async function createV2Project(
    vehicleDescription: string,
    aiData: any,
    userEmail: string,
    imageBase64?: string
): Promise<Project> {

    // Extract vehicle data from AI response
    const vehicleData: VehicleData = aiData.vehicleData || {
        make: 'Okänt',
        model: 'Fordon',
        year: new Date().getFullYear()
    };

    // Create minimal project structure
    const minimalProject: Partial<Project> = {
        name: aiData.projectName || vehicleDescription.substring(0, 30),
        description: vehicleDescription,
        // NO projectType yet - decided in chat
        vehicleData: vehicleData,
        tasks: [],
        shoppingList: [],
        contacts: [],
        ownerEmail: userEmail,
        collaborators: [],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        status: 'active',
        // V2 specific fields
        setupComplete: false,
        setupStage: 'initial',
        phases: [] // Empty phases initially
    };

    // Validate against schema (simplified validation since we don't have full data yet)
    // We'll rely on the existing schema but some required fields might be missing in a skeletal project
    // So we might need to be careful. However, 'phases' is a new field we need to add to the type definition.

    // Since we haven't updated the Project type definition yet, we'll cast it.
    // TODO: Update Project type to include setupComplete, setupStage, phases (if making phases dynamic)

    try {
        // Save to Firestore
        const docRef = await addDoc(collection(db, 'projects'), {
            ...minimalProject,
            createdAt: serverTimestamp(),
            lastModified: serverTimestamp()
        });

        return {
            id: docRef.id,
            ...minimalProject
        } as Project;

    } catch (error) {
        console.error('Error creating V2 project:', error);
        throw error;
    }
}

/**
 * Generates the system instruction for the AI during Project Setup mode
 */
export function getSetupSystemInstruction(
    vehicleData: VehicleData,
    currentPhases: any[],
    currentTasks: any[]
): string {
    // Check if we have phases to determine if we are in phase creation or task creation mode
    const hasPhases = currentPhases && currentPhases.length > 0;

    return `
DU ÄR ELTON - EN EXPERT PÅ FORDONSPROJEKT.
Du hjälper användaren att sätta upp ett nytt projekt för:
${vehicleData.make} ${vehicleData.model} (${vehicleData.year})

NUVARANDE STATUS:
- Antal faser skapade: ${currentPhases?.length || 0}
- Antal uppgifter skapade: ${currentTasks?.length || 0}

${hasPhases ? 'FASER FINNS REDAN:\n' + currentPhases.map(p => `- ${p.name}`).join('\n') : 'INGA FASER SKAPADE ÄN.'}

DIN UPPGIFT:
Detta är "Setup Mode". Din enda uppgift är att genom konversation bygga upp projektstrukturen.

STEG ATT FÖLJA:
1. Om inga faser finns:
   - Fråga användaren vad målet är (renovering, bygga camper, etc.)
   - Föreslå 3-5 faser baserat på målet och fordonstypen
   - Be om godkännande att skapa dem
   - ANVÄND VERKTYGET 'createPhase' för att skapa dem (ett anrop per fas)

2. När faser finns:
   - Gå igenom fas för fas och föreslå viktiga uppgifter
   - Fråga om kända problem (rost, motor, etc.)
   - Skapa uppgifter med 'addTask' och se till att ange rätt 'phase'
   
3. När ni verkar klara:
   - Fråga om användaren känner sig redo att börja
   - ANVÄND VERKTYGET 'completeSetup' för att avsluta onboardingen

TONLÄGE:
- Var entusiastisk och personlig!
- Ställ en fråga i taget.
- Var proaktiv med förslag ("Ska jag lägga till X?").
- Lyssna på användaren.

ANVÄNDBARA VERKTYG:
- createPhase(name, description, order) -> Skapa en fas
- addTask(title, phase, ...) -> Skapa uppgift
- setProjectType(type) -> Sätt projekttyp
- completeSetup(summary) -> Avsluta setup
`;
}

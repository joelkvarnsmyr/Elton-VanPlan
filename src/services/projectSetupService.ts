import { Project, VehicleData, Phase, ProjectType, Task, TaskStatus, CostType } from '@/types/types';
import { db } from '@/services/db';
import { collection, addDoc, doc, setDoc, updateDoc, arrayUnion, serverTimestamp, writeBatch } from 'firebase/firestore';

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
    userId: string,
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
        // NO projectType yet - decided in chat
        vehicleData: vehicleData,
        tasks: [],
        shoppingItems: [],
        contacts: [],
        ownerIds: [userId],
        primaryOwnerId: userId,
        memberIds: [],
        invitedEmails: [],
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        // V2 specific fields
        setupComplete: false,
        setupStage: 'initial',
        phases: [] // Empty phases initially
    };

    try {
        // Save to Firestore
        const docRef = await addDoc(collection(db, 'projects'), {
            ...minimalProject,
            createdAt: serverTimestamp(),
            lastModified: serverTimestamp()
        });

        // GAP 2 FIX: Save initialTasks from Deep Research to subcollection
        if (aiData.initialTasks && aiData.initialTasks.length > 0) {
            console.log(`📝 Saving ${aiData.initialTasks.length} initialTasks from Deep Research...`);
            const batch = writeBatch(db);

            for (const taskData of aiData.initialTasks) {
                const taskRef = doc(collection(db, 'projects', docRef.id, 'tasks'));
                const fullTask: Task = {
                    id: taskRef.id,
                    title: taskData.title || 'Ny uppgift',
                    description: taskData.description || '',
                    status: TaskStatus.TODO,
                    phase: taskData.phase || 'Backlog',
                    priority: taskData.priority,
                    estimatedCostMin: taskData.estimatedCostMin || 0,
                    estimatedCostMax: taskData.estimatedCostMax || 0,
                    actualCost: 0,
                    weightKg: 0,
                    costType: CostType.INVESTMENT,
                    tags: taskData.tags || [],
                    links: [],
                    comments: [],
                    attachments: [],
                    subtasks: taskData.subtasks || [],
                    difficultyLevel: taskData.difficultyLevel,
                    requiredTools: taskData.requiredTools || [],
                    blockers: taskData.blockers || [],
                    type: taskData.type,
                    mechanicalPhase: taskData.mechanicalPhase,
                    buildPhase: taskData.buildPhase,
                    created: new Date().toISOString(),
                    lastModified: new Date().toISOString()
                };
                batch.set(taskRef, fullTask);
            }

            await batch.commit();
            console.log(`✅ Saved ${aiData.initialTasks.length} tasks to Firestore`);
        }

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

    // - completeSetup(summary) -> Avsluta setup
    // `;

    // Firebase AI Logic SDK requires Content format for systemInstruction
    const instructionText = `
DU ÄR ELTON - EN EXPERT PÅ FORDONSPROJEKT.
Du hjälper användaren att sätta upp ett nytt projekt för:
${vehicleData.make} ${vehicleData.model} (${vehicleData.year})

NUVARANDE STATUS:
- Antal faser skapade: ${currentPhases?.length || 0}
- Antal uppgifter skapade: ${currentTasks?.length || 0}

${hasPhases ? 'FASER FINNS REDAN:\n' + currentPhases.map(p => `- ${p.name}`).join('\n') : 'INGA FASER SKAPADE ÄN.'}

${currentTasks?.length > 0 ? 'UPPGIFTER FINNS REDAN:\n' + currentTasks.map(t => `- ${t.title} (${t.phase})`).join('\n') : ''}

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
   - Skapa uppgifter med 'addTask' och ange rätt 'phase' (MÅSTE matcha ett av fasnamnen ovan)
   
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
- addTask(title, phase, description, priority) -> Skapa uppgift (phase MÅSTE matcha ett fasnamn!)
- setProjectType(type) -> Sätt projekttyp
- completeSetup(summary) -> Avsluta setup
`;
    // Use manual JSON construction to satisfy SDK type requirement if needed, or just return text parts
    return {
        parts: [{ text: instructionText }]
    } as any;
}

/**
 * Adds a new phase to the project
 */
export async function addPhaseToProject(projectId: string, name: string, description: string, order: number) {
    const phase: Phase = {
        id: `phase-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        description,
        order,
        createdBy: 'ai',
        createdAt: new Date().toISOString()
    };

    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
        phases: arrayUnion(phase),
        lastModified: serverTimestamp()
    });

    return phase;
}

/**
 * Sets the project type
 */
export async function updateProjectType(projectId: string, type: ProjectType) {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
        type: type,
        lastModified: serverTimestamp()
    });
}

/**
 * Marks setup as complete
 */
export async function completeProjectSetup(projectId: string) {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
        setupComplete: true,
        setupStage: 'complete',
        lastModified: serverTimestamp()
    });
}

// ============================================================================
// GAP 1 FIX: Add task to project during onboarding
// ============================================================================

/**
 * Adds a new task to the project's tasks subcollection.
 * Used during onboarding to actually persist tasks to Firestore.
 */
export async function addTaskToProject(
    projectId: string,
    taskData: Partial<Task>
): Promise<Task> {
    const taskRef = doc(collection(db, 'projects', projectId, 'tasks'));

    const fullTask: Task = {
        id: taskRef.id,
        title: taskData.title || 'Ny uppgift',
        description: taskData.description || '',
        status: TaskStatus.TODO,
        phase: taskData.phase || 'Backlog',
        priority: taskData.priority,
        sprint: taskData.sprint,
        estimatedCostMin: taskData.estimatedCostMin || 0,
        estimatedCostMax: taskData.estimatedCostMax || 0,
        actualCost: 0,
        weightKg: 0,
        costType: CostType.INVESTMENT,
        tags: taskData.tags || [],
        links: [],
        comments: [],
        attachments: [],
        subtasks: taskData.subtasks || [],
        difficultyLevel: taskData.difficultyLevel,
        requiredTools: taskData.requiredTools || [],
        blockers: taskData.blockers || [],
        type: taskData.type,
        mechanicalPhase: taskData.mechanicalPhase,
        buildPhase: taskData.buildPhase,
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
    };

    await setDoc(taskRef, fullTask);
    console.log(`✅ Task "${fullTask.title}" saved to Firestore (ID: ${taskRef.id})`);

    return fullTask;
}

// ============================================================================
// GAP 3 FIX: Progressive setup stage updates
// ============================================================================

/**
 * Updates the setup stage for progressive state tracking.
 * Allows resuming onboarding if user closes the page mid-flow.
 */
export async function updateSetupStage(projectId: string, stage: SetupStage) {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
        setupStage: stage,
        lastModified: serverTimestamp()
    });
    console.log(`📍 Setup stage updated to: ${stage}`);
}

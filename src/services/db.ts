
import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  writeBatch,
  where,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import {
  Task,
  VehicleData,
  Project,
  ShoppingItem,
  UserProfile,
  ServiceItem,
  FuelLogItem,
  KnowledgeArticle,
  Contact
} from '@/types/types';
import { 
  DEMO_PROJECT 
} from '@/constants/constants';

// --- HELPERS ---

function getProjectRef(projectId: string): any {
  return doc(db, 'projects', projectId);
}

const getTasksRef = (projectId: string) => collection(db, 'projects', projectId, 'tasks');
const getShoppingRef = (projectId: string) => collection(db, 'projects', projectId, 'shoppingList');
const getServiceLogRef = (projectId: string) => collection(db, 'projects', projectId, 'serviceLog');
const getFuelLogRef = (projectId: string) => collection(db, 'projects', projectId, 'fuelLog');
const getKnowledgeBaseRef = (projectId: string) => collection(db, 'projects', projectId, 'knowledgeBase');


// --- SEEDING ---

export const forceSeedProject = async (userEmail: string, userId: string) => {
  const projectId = DEMO_PROJECT.id;
  console.log(`Seeding database for project ${projectId} and owner: ${userEmail} (${userId})...`);
  
  const batch = writeBatch(db);

  const projectRef = doc(db, 'projects', projectId);
  const projectData: Project = {
    ...DEMO_PROJECT,
    // NEW ownership model
    ownerIds: [userId],
    primaryOwnerId: userId,
    memberIds: [],
    invitedEmails: [],
    // Legacy fields
    ownerId: userId,
    ownerEmail: userEmail,
    members: [],
    // Data
    created: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    isDemo: true,
    tasks: [],
    shoppingItems: [],
    serviceLog: [],
    fuelLog: [],
    knowledgeArticles: []
  };
  batch.set(projectRef, projectData);

  const tasksRef = getTasksRef(projectId);
  for (const task of DEMO_PROJECT.tasks) {
    const taskRef = doc(tasksRef, task.id);
    batch.set(taskRef, task);
  }

  const shoppingRef = getShoppingRef(projectId);
  for (const item of DEMO_PROJECT.shoppingItems) {
    const itemRef = doc(shoppingRef, item.id);
    batch.set(itemRef, item);
  }

  // Seed serviceLog sub-collection (if demo data exists)
  if (DEMO_PROJECT.serviceLog && DEMO_PROJECT.serviceLog.length > 0) {
    const serviceLogRef = getServiceLogRef(projectId);
    for (const entry of DEMO_PROJECT.serviceLog) {
      const entryRef = doc(serviceLogRef, entry.id);
      batch.set(entryRef, entry);
    }
  }

  // Seed fuelLog sub-collection (if demo data exists)
  if (DEMO_PROJECT.fuelLog && DEMO_PROJECT.fuelLog.length > 0) {
    const fuelLogRef = getFuelLogRef(projectId);
    for (const entry of DEMO_PROJECT.fuelLog) {
      const entryRef = doc(fuelLogRef, entry.id);
      batch.set(entryRef, entry);
    }
  }

  // Seed knowledgeBase sub-collection (if demo data exists)
  if (DEMO_PROJECT.knowledgeArticles && DEMO_PROJECT.knowledgeArticles.length > 0) {
    const knowledgeRef = getKnowledgeBaseRef(projectId);
    for (const article of DEMO_PROJECT.knowledgeArticles) {
      const articleRef = doc(knowledgeRef, article.id);
      batch.set(articleRef, article);
    }
  }

  await batch.commit();
  console.log('Database seeded successfully.');
};

// --- USER PROFILE ---

export const getUserProfile = async (uid: string, email: string): Promise<UserProfile> => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
    } else {
        const nameFromEmail = email.split('@')[0];
        const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
        
        const newProfile: UserProfile = {
            uid,
            email,
            name: formattedName
        };
        await setDoc(userRef, newProfile);
        return newProfile;
    }
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, data);
};

// --- DATA ACCESS ---

export const getProjectsForUser = async (userId: string, userEmail?: string): Promise<Project[]> => {
    console.log('🔍 getProjectsForUser called:', { userId, userEmail });

    const projectsMap = new Map<string, Project>();

    // 1. Get owned projects (NEW MODEL: ownerIds array)
    const qOwnerIds = query(collection(db, 'projects'), where("ownerIds", "array-contains", userId));
    const snapOwnerIds = await getDocs(qOwnerIds);
    console.log('  📊 Owned projects (ownerIds):', snapOwnerIds.size);
    snapOwnerIds.forEach(doc => {
        const data = doc.data();
        console.log('    - Owner:', doc.id, data.name);
        projectsMap.set(doc.id, { id: doc.id, ...data } as Project);
    });

    // 1b. Legacy: Get owned projects (OLD MODEL: ownerId singular)
    const qOwnerId = query(collection(db, 'projects'), where("ownerId", "==", userId));
    const snapOwnerId = await getDocs(qOwnerId);
    console.log('  📊 Owned projects (legacy ownerId):', snapOwnerId.size);
    snapOwnerId.forEach(doc => {
        const data = doc.data();
        if (!projectsMap.has(doc.id)) {
            console.log('    - Owner (legacy):', doc.id, data.name);
            projectsMap.set(doc.id, { id: doc.id, ...data } as Project);
        }
    });

    // 2. Get member projects (NEW MODEL: memberIds array)
    const qMemberIds = query(collection(db, 'projects'), where("memberIds", "array-contains", userId));
    const snapMemberIds = await getDocs(qMemberIds);
    console.log('  📊 Member projects (memberIds):', snapMemberIds.size);
    snapMemberIds.forEach(doc => {
        const data = doc.data();
        if (!projectsMap.has(doc.id)) {
            console.log('    - Member:', doc.id, data.name);
            projectsMap.set(doc.id, { id: doc.id, ...data } as Project);
        }
    });

    // 2b. Legacy: Get member projects (OLD MODEL: members array)
    const qMembers = query(collection(db, 'projects'), where("members", "array-contains", userId));
    const snapMembers = await getDocs(qMembers);
    console.log('  📊 Member projects (legacy members):', snapMembers.size);
    snapMembers.forEach(doc => {
        const data = doc.data();
        if (!projectsMap.has(doc.id)) {
            console.log('    - Member (legacy):', doc.id, data.name);
            projectsMap.set(doc.id, { id: doc.id, ...data } as Project);
        }
    });

    // 3. Get invited projects (if email is provided)
    if (userEmail) {
        const qInvited = query(collection(db, 'projects'), where("invitedEmails", "array-contains", userEmail));
        const snapInvited = await getDocs(qInvited);
        console.log('  📊 Invited projects found:', snapInvited.size);
        snapInvited.forEach(doc => {
            const data = doc.data();
            if (!projectsMap.has(doc.id)) {
                console.log('    - Invited:', doc.id, data.name);
                projectsMap.set(doc.id, { id: doc.id, ...data } as Project);
            }
        });
    }

    const allProjects = Array.from(projectsMap.values());
    console.log('✅ Total unique projects:', allProjects.length);

    return allProjects;
}

/**
 * Get project metadata only (no sub-collections)
 * Use this for lightweight operations
 */
export const getProject = async (projectId: string): Promise<Project | null> => {
  const docSnap = await getDoc(getProjectRef(projectId));
  if (!docSnap.exists()) {
    return null;
  }
  const data = docSnap.data() as Record<string, unknown>;
  return { ...data, id: docSnap.id } as Project;
};

/**
 * Get project with all sub-collections loaded
 * Use this when you need the complete project state
 */
export const getProjectFull = async (projectId: string): Promise<Project | null> => {
  const project = await getProject(projectId);
  if (!project) return null;

  // Load sub-collections in parallel
  const [tasks, shoppingItems] = await Promise.all([
    getTasks(projectId),
    getShoppingItems(projectId)
  ]);

  return {
    ...project,
    tasks,
    shoppingItems
  };
};

export const createProject = async (
    name: string,
    model: string,
    userId: string,
    userEmail: string,
    template?: Partial<Project>
): Promise<Project> => {
    console.log('🔍 createProject called:', { name, model, userId, userEmail });

    const newProjectRef = doc(collection(db, 'projects'));
    const currentYear = new Date().getFullYear();

    let vehicleData: VehicleData = {
        make: model.split(' ')[0] || 'Okänd',
        model: model.split(' ').slice(1).join(' ') || 'Modell',
        year: currentYear, 
        prodYear: currentYear,
        regNo: '',
        regDate: new Date().toISOString().split('T')[0],
        status: 'I trafik',
        bodyType: 'Skåp',
        passengers: 3,
        inspection: { last: '', next: '', mileage: '' },
        engine: { fuel: 'Diesel', power: '', volume: '' },
        gearbox: 'Manuell',
        wheels: { drive: '2WD', tiresFront: '', tiresRear: '', boltPattern: '' },
        dimensions: { length: 0, width: 0, height: '', wheelbase: 0 },
        weights: { curb: 0, total: 0, load: 0, trailer: 0, trailerB: 0 },
        vin: '',
        color: '',
        history: { owners: 1, events: 0, lastOwnerChange: '' }
    };

    if (template?.vehicleData) {
        vehicleData = {
            ...vehicleData,
            ...template.vehicleData,
            year: template.vehicleData.year || currentYear,
            prodYear: template.vehicleData.prodYear || currentYear
        };
    }

    const newProject: Project = {
        id: newProjectRef.id,
        name: name || 'Nytt Projekt',
        type: (template?.type || 'renovation') as any,
        brand: 'vanplan',

        // NEW ownership model
        ownerIds: [userId],
        primaryOwnerId: userId,
        memberIds: [],
        invitedEmails: [],

        // Legacy fields (for backwards compatibility)
        ownerId: userId,
        ownerEmail: userEmail,
        members: [],

        // Data
        vehicleData: vehicleData,
        tasks: [],
        shoppingItems: [],
        serviceLog: [],
        fuelLog: [],
        knowledgeArticles: [], // Legacy field, now using sub-collection
        customIcon: template?.customIcon || null,

        // Metadata
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        isDemo: false,

        // User preferences
        ...(template?.userSkillLevel && { userSkillLevel: template.userSkillLevel }),
        ...(template?.nickname && { nickname: template.nickname })
    };

    console.log('💾 Saving project to Firestore:', {
        id: newProject.id,
        name: newProject.name,
        ownerId: newProject.ownerId,
        ownerEmail: newProject.ownerEmail
    });

    await setDoc(newProjectRef, newProject);

    console.log('✅ Project saved successfully!');

    if (template?.tasks && template.tasks.length > 0) {
        const tasksRef = collection(db, 'projects', newProjectRef.id, 'tasks');
        const batch = writeBatch(db);

        for (const task of template.tasks) {
            const taskRef = doc(tasksRef);
            const taskWithId = {
                ...task,
                id: taskRef.id,
                priority: task.priority || 'Medel',
                phase: task.phase || 'Fas 0: Inköp & Analys',
                estimatedCostMin: task.estimatedCostMin || 0,
                estimatedCostMax: task.estimatedCostMax || 0,
                actualCost: task.actualCost || 0
            };
            batch.set(taskRef, taskWithId);
        }
        await batch.commit();
    }

    // Add knowledge articles to sub-collection
    if (template?.knowledgeArticles && template.knowledgeArticles.length > 0) {
        const knowledgeRef = getKnowledgeBaseRef(newProjectRef.id);
        const batch = writeBatch(db);

        for (const article of template.knowledgeArticles) {
            const articleRef = doc(knowledgeRef, article.id || undefined);
            const articleWithId = {
                ...article,
                id: article.id || articleRef.id
            };
            batch.set(articleRef, articleWithId);
        }
        await batch.commit();
    }

    return newProject;
};

export const deleteProjectFull = async (projectId: string) => {
    // Get all sub-collections
    const tasksSnap = await getDocs(getTasksRef(projectId));
    const itemsSnap = await getDocs(getShoppingRef(projectId));
    const serviceLogSnap = await getDocs(getServiceLogRef(projectId));
    const fuelLogSnap = await getDocs(getFuelLogRef(projectId));
    const knowledgeSnap = await getDocs(getKnowledgeBaseRef(projectId));

    const batch = writeBatch(db);

    // Delete all sub-collection documents
    tasksSnap.forEach((docSnap) => batch.delete(docSnap.ref));
    itemsSnap.forEach((docSnap) => batch.delete(docSnap.ref));
    serviceLogSnap.forEach((docSnap) => batch.delete(docSnap.ref));
    fuelLogSnap.forEach((docSnap) => batch.delete(docSnap.ref));
    knowledgeSnap.forEach((docSnap) => batch.delete(docSnap.ref));

    // Delete chat history if exists
    const chatRef = doc(db, 'projects', projectId, 'chat', 'history');
    batch.delete(chatRef);

    // Delete project document
    batch.delete(getProjectRef(projectId));

    await batch.commit();
};

// --- SERVICE LOG (Sub-collection) ---

export const getServiceLog = async (projectId: string): Promise<ServiceItem[]> => {
    const querySnapshot = await getDocs(getServiceLogRef(projectId));
    return querySnapshot.docs.map(doc => doc.data() as ServiceItem);
};

export const addServiceEntry = async (projectId: string, entry: Omit<ServiceItem, 'id'>) => {
    const docRef = await addDoc(getServiceLogRef(projectId), entry);
    await updateDoc(docRef, { id: docRef.id });
    return { ...entry, id: docRef.id } as ServiceItem;
};

export const updateServiceEntry = async (projectId: string, entryId: string, updates: Partial<ServiceItem>) => {
    const entryRef = doc(getServiceLogRef(projectId), entryId);
    await updateDoc(entryRef, updates);
};

export const deleteServiceEntry = async (projectId: string, entryId: string) => {
    const entryRef = doc(getServiceLogRef(projectId), entryId);
    await deleteDoc(entryRef);
};

// --- FUEL LOG (Sub-collection) ---

export const getFuelLog = async (projectId: string): Promise<FuelLogItem[]> => {
    const querySnapshot = await getDocs(getFuelLogRef(projectId));
    return querySnapshot.docs.map(doc => doc.data() as FuelLogItem);
};

export const addFuelEntry = async (projectId: string, entry: Omit<FuelLogItem, 'id'>) => {
    const docRef = await addDoc(getFuelLogRef(projectId), entry);
    await updateDoc(docRef, { id: docRef.id });
    return { ...entry, id: docRef.id } as FuelLogItem;
};

export const updateFuelEntry = async (projectId: string, entryId: string, updates: Partial<FuelLogItem>) => {
    const entryRef = doc(getFuelLogRef(projectId), entryId);
    await updateDoc(entryRef, updates);
};

export const deleteFuelEntry = async (projectId: string, entryId: string) => {
    const entryRef = doc(getFuelLogRef(projectId), entryId);
    await deleteDoc(entryRef);
};

// Legacy batch update (kept for backwards compatibility during migration)
export const updateFuelLog = async (projectId: string, updatedFuelLog: FuelLogItem[]) => {
    // Delete all existing entries and re-create
    const existingDocs = await getDocs(getFuelLogRef(projectId));
    const batch = writeBatch(db);
    existingDocs.forEach(docSnap => batch.delete(docSnap.ref));

    // Add new entries
    for (const entry of updatedFuelLog) {
        const entryRef = doc(getFuelLogRef(projectId), entry.id || undefined);
        batch.set(entryRef, { ...entry, id: entry.id || entryRef.id });
    }

    await batch.commit();
};

// Legacy batch update (kept for backwards compatibility during migration)
export const updateServiceLog = async (projectId: string, updatedServiceLog: ServiceItem[]) => {
    // Delete all existing entries and re-create
    const existingDocs = await getDocs(getServiceLogRef(projectId));
    const batch = writeBatch(db);
    existingDocs.forEach(docSnap => batch.delete(docSnap.ref));

    // Add new entries
    for (const entry of updatedServiceLog) {
        const entryRef = doc(getServiceLogRef(projectId), entry.id || undefined);
        batch.set(entryRef, { ...entry, id: entry.id || entryRef.id });
    }

    await batch.commit();
};

export const updateContacts = async (projectId: string, contacts: Contact[]) => {
    const projectRef = getProjectRef(projectId);
    await updateDoc(projectRef, {
        contacts: contacts,
        lastModified: new Date().toISOString()
    });
};

export const updateProjectLocation = async (projectId: string, location: any) => {
    const projectRef = getProjectRef(projectId);
    await updateDoc(projectRef, {
        location: location,
        lastModified: new Date().toISOString()
    });
};

// --- KNOWLEDGE BASE (Sub-collection) ---

export const getKnowledgeBase = async (projectId: string): Promise<KnowledgeArticle[]> => {
    const querySnapshot = await getDocs(getKnowledgeBaseRef(projectId));
    return querySnapshot.docs.map(doc => doc.data() as KnowledgeArticle);
};

export const addKnowledgeArticle = async (projectId: string, article: Omit<KnowledgeArticle, 'id'>) => {
    const docRef = await addDoc(getKnowledgeBaseRef(projectId), article);
    await updateDoc(docRef, { id: docRef.id });
    return { ...article, id: docRef.id } as KnowledgeArticle;
};

export const updateKnowledgeArticle = async (projectId: string, articleId: string, updates: Partial<KnowledgeArticle>) => {
    const articleRef = doc(getKnowledgeBaseRef(projectId), articleId);
    await updateDoc(articleRef, updates);
};

export const deleteKnowledgeArticle = async (projectId: string, articleId: string) => {
    const articleRef = doc(getKnowledgeBaseRef(projectId), articleId);
    await deleteDoc(articleRef);
};

export const updateVehicleData = async (projectId: string, data: Partial<VehicleData>) => {
  const projectData = await getProject(projectId);
  if (projectData) {
      const updatedVehicleData = { ...projectData.vehicleData, ...data };
      await updateDoc(getProjectRef(projectId), { vehicleData: updatedVehicleData });
  }
};

// --- CO-WORKING ---

export const inviteUserToProject = async (projectId: string, email: string) => {
    const projectRef = getProjectRef(projectId);
    await updateDoc(projectRef, {
        invitedEmails: arrayUnion(email),
        lastModified: new Date().toISOString()
    });
};

export const acceptProjectInvite = async (projectId: string, userId: string, email: string) => {
    const projectRef = getProjectRef(projectId);
    await updateDoc(projectRef, {
        // NEW model
        memberIds: arrayUnion(userId),
        // Legacy (keep in sync)
        members: arrayUnion(userId),
        // Remove from invited
        invitedEmails: arrayRemove(email),
        lastModified: new Date().toISOString()
    });
};

export const removeMemberFromProject = async (projectId: string, userId: string) => {
    const projectRef = getProjectRef(projectId);
    await updateDoc(projectRef, {
        // NEW model
        memberIds: arrayRemove(userId),
        // Legacy (keep in sync)
        members: arrayRemove(userId),
        lastModified: new Date().toISOString()
    });
};

export const cancelInvite = async (projectId: string, email: string) => {
    const projectRef = getProjectRef(projectId);
    await updateDoc(projectRef, {
        invitedEmails: arrayRemove(email),
        lastModified: new Date().toISOString()
    });
};

// Add a co-owner to a project (new feature)
export const addCoOwner = async (projectId: string, userId: string) => {
    const projectRef = getProjectRef(projectId);
    await updateDoc(projectRef, {
        ownerIds: arrayUnion(userId),
        lastModified: new Date().toISOString()
    });
};

// Remove a co-owner from a project (new feature)
export const removeCoOwner = async (projectId: string, userId: string) => {
    const project = await getProject(projectId);
    if (!project) throw new Error('Project not found');

    // Cannot remove primary owner
    if (project.primaryOwnerId === userId) {
        throw new Error('Cannot remove primary owner. Transfer ownership first.');
    }

    const projectRef = getProjectRef(projectId);
    await updateDoc(projectRef, {
        ownerIds: arrayRemove(userId),
        lastModified: new Date().toISOString()
    });
};

// Transfer primary ownership (new feature)
export const transferPrimaryOwnership = async (projectId: string, newPrimaryOwnerId: string) => {
    const project = await getProject(projectId);
    if (!project) throw new Error('Project not found');

    // New owner must already be in ownerIds
    if (!project.ownerIds.includes(newPrimaryOwnerId)) {
        throw new Error('New owner must be added as co-owner first');
    }

    const projectRef = getProjectRef(projectId);
    await updateDoc(projectRef, {
        primaryOwnerId: newPrimaryOwnerId,
        lastModified: new Date().toISOString()
    });
}


// --- TASKS & SHOPPING ---

export const getTasks = async (projectId: string): Promise<Task[]> => {
  const querySnapshot = await getDocs(getTasksRef(projectId));
  return querySnapshot.docs.map(doc => doc.data() as Task);
};

export const addTask = async (projectId: string, task: Omit<Task, 'id'>) => {
  const docRef = await addDoc(getTasksRef(projectId), task);
  await updateDoc(docRef, { id: docRef.id });
  return { ...task, id: docRef.id } as Task;
};

export const updateTask = async (projectId: string, taskId: string, updates: Partial<Task>) => {
  const taskRef = doc(getTasksRef(projectId), taskId);
  await updateDoc(taskRef, updates);
};

export const deleteTask = async (projectId: string, taskId: string) => {
  const taskRef = doc(getTasksRef(projectId), taskId);
  await deleteDoc(taskRef);
};

export const getShoppingItems = async (projectId: string): Promise<ShoppingItem[]> => {
  const querySnapshot = await getDocs(getShoppingRef(projectId));
  return querySnapshot.docs.map(doc => doc.data() as ShoppingItem);
};

export const addShoppingItem = async (projectId: string, item: Omit<ShoppingItem, 'id'>) => {
  const docRef = await addDoc(getShoppingRef(projectId), item);
  await updateDoc(docRef, { id: docRef.id });
  return { ...item, id: docRef.id } as ShoppingItem;
};

export const updateShoppingItem = async (projectId: string, itemId: string, updates: Partial<ShoppingItem>) => {
  const itemRef = doc(getShoppingRef(projectId), itemId);
  await updateDoc(itemRef, updates);
};

export const deleteShoppingItem = async (projectId: string, itemId: string) => {
  const itemRef = doc(getShoppingRef(projectId), itemId);
  await deleteDoc(itemRef);
};

// --- CHAT HISTORY ---

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  imageUrl?: string; // URL to Firebase Storage instead of base64
  timestamp: string;
}

const getChatRef = (projectId: string) => doc(db, 'projects', projectId, 'chat', 'history');

export const getChatHistory = async (projectId: string): Promise<ChatMessage[]> => {
  const chatRef = getChatRef(projectId);
  const chatSnap = await getDoc(chatRef);

  if (chatSnap.exists()) {
    return chatSnap.data().messages || [];
  }
  return [];
};

export const saveChatHistory = async (projectId: string, messages: ChatMessage[]) => {
  const chatRef = getChatRef(projectId);
  await setDoc(chatRef, { messages, lastModified: new Date().toISOString() });
};

export const clearChatHistory = async (projectId: string) => {
  const chatRef = getChatRef(projectId);
  await deleteDoc(chatRef);
};

// --- DEPENDENCY ENGINE (BLOCKERS) ---

/**
 * Check if a task is blocked by other tasks
 * Returns: { blocked: boolean, blockedBy: Task[] }
 */
export const getTaskBlockers = async (
  projectId: string,
  taskId: string
): Promise<{ blocked: boolean; blockedBy: Task[] }> => {
  const allTasks = await getTasks(projectId);
  const currentTask = allTasks.find(t => t.id === taskId);

  if (!currentTask || !currentTask.blockers || currentTask.blockers.length === 0) {
    return { blocked: false, blockedBy: [] };
  }

  // Extract taskIds from blockers (supports both new TaskBlocker[] and legacy string[] format)
  const blockerIds = currentTask.blockers.map(b => typeof b === 'string' ? b : b.taskId);

  const blockedBy = allTasks.filter(t =>
    blockerIds.includes(t.id) && t.status !== 'Klart'
  );

  return {
    blocked: blockedBy.length > 0,
    blockedBy
  };
};

/**
 * Get all tasks that are currently blocked
 */
export const getBlockedTasks = async (projectId: string): Promise<Task[]> => {
  const allTasks = await getTasks(projectId);

  const blockedTasks = await Promise.all(
    allTasks.map(async task => {
      const { blocked } = await getTaskBlockers(projectId, task.id);
      return blocked ? task : null;
    })
  );

  return blockedTasks.filter((t): t is Task => t !== null);
};

/**
 * Get tasks that can be started now (not blocked)
 */
export const getAvailableTasks = async (projectId: string): Promise<Task[]> => {
  const allTasks = await getTasks(projectId);

  const availableTasks = await Promise.all(
    allTasks.map(async task => {
      if (task.status === 'Klart' || task.status === 'Pågående') {
        return null; // Already done or in progress
      }

      const { blocked } = await getTaskBlockers(projectId, task.id);
      return !blocked ? task : null;
    })
  );

  return availableTasks.filter((t): t is Task => t !== null);
};

// --- SHOPPING INTELLIGENCE (STORE MODE) ---

export interface ShoppingItemsByStore {
  store: string;
  items: ShoppingItem[];
  totalCost: number;
  itemsWithLocation: ShoppingItem[];
  itemsWithoutLocation: ShoppingItem[];
}

/**
 * Get shopping items grouped by store
 * Perfect for "Store Mode" - when you're physically in a store
 */
export const getShoppingItemsByStore = async (
  projectId: string,
  storeName?: string
): Promise<ShoppingItemsByStore[]> => {
  const allItems = await getShoppingItems(projectId);

  // Build a map of store -> items
  const storeMap = new Map<string, ShoppingItem[]>();

  allItems.forEach(item => {
    // Check both item.store and selected option
    let itemStore = item.store || 'Ospecificerad';

    if (item.options && item.selectedOptionId) {
      const selectedOption = item.options.find(opt => opt.id === item.selectedOptionId);
      if (selectedOption) {
        itemStore = selectedOption.store;
      }
    }

    if (!storeMap.has(itemStore)) {
      storeMap.set(itemStore, []);
    }
    storeMap.get(itemStore)!.push(item);
  });

  // Convert to array and sort
  const result: ShoppingItemsByStore[] = Array.from(storeMap.entries()).map(
    ([store, items]) => {
      // Separate items with/without shelf location
      const itemsWithLocation = items.filter(item => {
        if (item.options && item.selectedOptionId) {
          const selectedOption = item.options.find(opt => opt.id === item.selectedOptionId);
          return selectedOption?.shelfLocation;
        }
        return false;
      });

      const itemsWithoutLocation = items.filter(item => {
        if (item.options && item.selectedOptionId) {
          const selectedOption = item.options.find(opt => opt.id === item.selectedOptionId);
          return !selectedOption?.shelfLocation;
        }
        return true;
      });

      // Sort items with location by shelf
      itemsWithLocation.sort((a, b) => {
        const aOption = a.options?.find(opt => opt.id === a.selectedOptionId);
        const bOption = b.options?.find(opt => opt.id === b.selectedOptionId);
        const aLocation = aOption?.shelfLocation || '';
        const bLocation = bOption?.shelfLocation || '';
        return aLocation.localeCompare(bLocation, 'sv');
      });

      // Sort items without location by article number
      itemsWithoutLocation.sort((a, b) => {
        const aOption = a.options?.find(opt => opt.id === a.selectedOptionId);
        const bOption = b.options?.find(opt => opt.id === b.selectedOptionId);
        const aArticle = aOption?.articleNumber || '';
        const bArticle = bOption?.articleNumber || '';
        return aArticle.localeCompare(bArticle, 'sv');
      });

      const totalCost = items.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);

      return {
        store,
        items,
        totalCost,
        itemsWithLocation,
        itemsWithoutLocation
      };
    }
  );

  // Filter by store if specified
  if (storeName) {
    return result.filter(s => s.store.toLowerCase().includes(storeName.toLowerCase()));
  }

  // Sort by total cost (most expensive first)
  return result.sort((a, b) => b.totalCost - a.totalCost);
};

/**
 * Get shopping items for a specific store, optimized for in-store shopping
 */
export const getStoreShoppingList = async (
  projectId: string,
  storeName: string
): Promise<ShoppingItem[]> => {
  const storeGroups = await getShoppingItemsByStore(projectId, storeName);

  if (storeGroups.length === 0) {
    return [];
  }

  // Return items sorted: first with location (by shelf), then without (by article number)
  return [
    ...storeGroups[0].itemsWithLocation,
    ...storeGroups[0].itemsWithoutLocation
  ];
};

// --- REAL-TIME LISTENERS ---

/**
 * Subscribe to tasks updates in real-time
 * Returns an unsubscribe function
 */
export const subscribeToTasks = (
  projectId: string,
  callback: (tasks: Task[]) => void
): Unsubscribe => {
  return onSnapshot(getTasksRef(projectId), (snapshot) => {
    const tasks = snapshot.docs.map(doc => doc.data() as Task);
    callback(tasks);
  });
};

/**
 * Subscribe to shopping items updates in real-time
 * Returns an unsubscribe function
 */
export const subscribeToShoppingItems = (
  projectId: string,
  callback: (items: ShoppingItem[]) => void
): Unsubscribe => {
  return onSnapshot(getShoppingRef(projectId), (snapshot) => {
    const items = snapshot.docs.map(doc => doc.data() as ShoppingItem);
    callback(items);
  });
};

/**
 * Subscribe to project metadata updates in real-time
 * Returns an unsubscribe function
 */
export const subscribeToProject = (
  projectId: string,
  callback: (project: Project | null) => void
): Unsubscribe => {
  return onSnapshot(getProjectRef(projectId), (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() } as Project);
    } else {
      callback(null);
    }
  });
};

/**
 * Subscribe to complete project (metadata + sub-collections) in real-time
 * Returns an unsubscribe function
 */
export const subscribeToProjectFull = (
  projectId: string,
  callback: (project: Project | null) => void
): Unsubscribe => {
  let projectData: Project | null = null;
  let tasksData: Task[] = [];
  let shoppingData: ShoppingItem[] = [];

  const merge = () => {
    if (projectData) {
      callback({
        ...projectData,
        tasks: tasksData,
        shoppingItems: shoppingData
      });
    }
  };

  // Subscribe to project metadata
  const unsubProject = subscribeToProject(projectId, (project) => {
    projectData = project;
    merge();
  });

  // Subscribe to tasks
  const unsubTasks = subscribeToTasks(projectId, (tasks) => {
    tasksData = tasks;
    merge();
  });

  // Subscribe to shopping items
  const unsubShopping = subscribeToShoppingItems(projectId, (items) => {
    shoppingData = items;
    merge();
  });

  // Return combined unsubscribe function
  return () => {
    unsubProject();
    unsubTasks();
    unsubShopping();
  };
};

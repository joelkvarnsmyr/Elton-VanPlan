
import { db } from './firebase';
export { db };
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
  Contact,
  InspectionFinding,
  VehicleHistoryEvent,
  MileageReading
} from '@/types/types';
// DEMO_PROJECT import removed

// --- HELPERS ---

function getProjectRef(projectId: string): any {
  return doc(db, 'projects', projectId);
}

const getTasksRef = (projectId: string) => collection(db, 'projects', projectId, 'tasks');
const getShoppingRef = (projectId: string) => collection(db, 'projects', projectId, 'shoppingList');
const getServiceLogRef = (projectId: string) => collection(db, 'projects', projectId, 'serviceLog');
const getFuelLogRef = (projectId: string) => collection(db, 'projects', projectId, 'fuelLog');
const getKnowledgeBaseRef = (projectId: string) => collection(db, 'projects', projectId, 'knowledgeBase');
const getInspectionsRef = (projectId: string) => collection(db, 'projects', projectId, 'inspections');


// --- SEEDING ---

// --- SEEDING ---

export const forceSeedProject = async (userEmail: string, userId: string) => {
  console.log('Seeding demo project from template...');
  // Use the new template system
  // We use a fixed template ID project 'template-elton'
  return createProjectFromTemplate('template-elton', userId, userEmail, 'Elton (Demo)');
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
    /* userSkillLevel not in Project type yet
    ...(template?.userSkillLevel && { userSkillLevel: template.userSkillLevel }), */
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
  // ... (existing createProject) ...
  return newProject;
};

/**
 * Create a new project based on a Firestore template
 * deeply copies all subcollections
 */
export const createProjectFromTemplate = async (
  templateId: string,
  userId: string,
  userEmail: string,
  projectName?: string
): Promise<Project> => {
  console.log('🏗️ Creating project from template:', templateId);

  // 1. Fetch Template Data
  const templateRef = doc(db, 'projects', templateId);
  const templateSnap = await getDoc(templateRef);

  if (!templateSnap.exists()) {
    throw new Error(`Template project ${templateId} not found`);
  }

  const templateData = templateSnap.data() as Project;

  // 2. Create New Project
  const newProjectRef = doc(collection(db, 'projects'));
  const projectId = newProjectRef.id;

  const newProject: Project = {
    ...templateData,
    id: projectId,
    name: projectName || templateData.name,
    ownerIds: [userId],
    primaryOwnerId: userId,
    memberIds: [],
    invitedEmails: [],
    // Legacy mapping
    ownerId: userId,
    ownerEmail: userEmail,
    members: [],

    // Reset specific fields
    created: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    isDemo: true // Mark as demo/template-derived
  };

  // 3. Save Project Document
  const batch = writeBatch(db);
  batch.set(newProjectRef, newProject);

  // 4. Copy Sub-collections
  const copyCollection = async (collectionName: string, destName?: string) => {
    const sourceRef = collection(db, 'projects', templateId, collectionName);
    const destRef = collection(db, 'projects', projectId, destName || collectionName);
    const snap = await getDocs(sourceRef);

    snap.forEach(docSnap => {
      const data = docSnap.data();
      const newDocRef = doc(destRef, docSnap.id); // Keep original IDs for internal linking
      // Update projectId references if they exist
      if (data.projectId) {
        data.projectId = projectId;
      }
      batch.set(newDocRef, data);
    });
    console.log(`   - Copied ${snap.size} documents from ${collectionName}`);
  };

  await Promise.all([
    copyCollection('tasks'),
    copyCollection('tasks'),
    copyCollection('shoppingList'), // Was shoppingItems in template, but code expects shoppingList
    copyCollection('serviceLog'),
    copyCollection('fuelLog'),
    copyCollection('knowledgeBase'),
    copyCollection('inspections')
  ]);

  await batch.commit();
  console.log('✅ Template project created successfully:', projectId);

  return newProject;
};

export const deleteProjectFull = async (projectId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get all sub-collections in parallel
    const [tasksSnap, itemsSnap, serviceLogSnap, fuelLogSnap, knowledgeSnap, inspectionsSnap] = await Promise.all([
      getDocs(getTasksRef(projectId)),
      getDocs(getShoppingRef(projectId)),
      getDocs(getServiceLogRef(projectId)),
      getDocs(getFuelLogRef(projectId)),
      getDocs(getKnowledgeBaseRef(projectId)),
      getDocs(getInspectionsRef(projectId))
    ]);

    // Firestore batch limit is 500 operations
    const MAX_BATCH_SIZE = 450;
    const allDocs = [
      ...tasksSnap.docs,
      ...itemsSnap.docs,
      ...serviceLogSnap.docs,
      ...fuelLogSnap.docs,
      ...knowledgeSnap.docs,
      ...inspectionsSnap.docs
    ];

    // Process in batches if needed
    for (let i = 0; i < allDocs.length; i += MAX_BATCH_SIZE) {
      const batch = writeBatch(db);
      const chunk = allDocs.slice(i, i + MAX_BATCH_SIZE);
      chunk.forEach((docSnap) => batch.delete(docSnap.ref));
      await batch.commit();
    }

    // Final batch: delete chat history and project document
    const finalBatch = writeBatch(db);
    const chatRef = doc(db, 'projects', projectId, 'chat', 'history');
    finalBatch.delete(chatRef);
    finalBatch.delete(getProjectRef(projectId));
    await finalBatch.commit();

    console.log(`Successfully deleted project ${projectId} and all subcollections`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting project ${projectId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during project deletion'
    };
  }
};

// --- SERVICE LOG (Sub-collection) ---

export const getServiceLog = async (projectId: string): Promise<ServiceItem[]> => {
  try {
    const querySnapshot = await getDocs(getServiceLogRef(projectId));
    return querySnapshot.docs.map(doc => doc.data() as ServiceItem);
  } catch (error) {
    console.error(`Error fetching service log for project ${projectId}:`, error);
    return [];
  }
};

export const addServiceEntry = async (projectId: string, entry: Omit<ServiceItem, 'id'>): Promise<ServiceItem | null> => {
  try {
    // Create doc reference first to get ID atomically
    const docRef = doc(getServiceLogRef(projectId));
    const entryWithId: ServiceItem = { ...entry, id: docRef.id } as ServiceItem;
    await setDoc(docRef, entryWithId);
    return entryWithId;
  } catch (error) {
    console.error(`Error adding service entry to project ${projectId}:`, error);
    return null;
  }
};

export const updateServiceEntry = async (projectId: string, entryId: string, updates: Partial<ServiceItem>): Promise<boolean> => {
  try {
    const entryRef = doc(getServiceLogRef(projectId), entryId);
    await updateDoc(entryRef, updates);
    return true;
  } catch (error) {
    console.error(`Error updating service entry ${entryId}:`, error);
    return false;
  }
};

export const deleteServiceEntry = async (projectId: string, entryId: string): Promise<boolean> => {
  try {
    const entryRef = doc(getServiceLogRef(projectId), entryId);
    await deleteDoc(entryRef);
    return true;
  } catch (error) {
    console.error(`Error deleting service entry ${entryId}:`, error);
    return false;
  }
};

// --- FUEL LOG (Sub-collection) ---

export const getFuelLog = async (projectId: string): Promise<FuelLogItem[]> => {
  try {
    const querySnapshot = await getDocs(getFuelLogRef(projectId));
    return querySnapshot.docs.map(doc => doc.data() as FuelLogItem);
  } catch (error) {
    console.error(`Error fetching fuel log for project ${projectId}:`, error);
    return [];
  }
};

export const addFuelEntry = async (projectId: string, entry: Omit<FuelLogItem, 'id'>): Promise<FuelLogItem | null> => {
  try {
    // Create doc reference first to get ID atomically
    const docRef = doc(getFuelLogRef(projectId));
    const entryWithId: FuelLogItem = { ...entry, id: docRef.id } as FuelLogItem;
    await setDoc(docRef, entryWithId);
    return entryWithId;
  } catch (error) {
    console.error(`Error adding fuel entry to project ${projectId}:`, error);
    return null;
  }
};

export const updateFuelEntry = async (projectId: string, entryId: string, updates: Partial<FuelLogItem>): Promise<boolean> => {
  try {
    const entryRef = doc(getFuelLogRef(projectId), entryId);
    await updateDoc(entryRef, updates);
    return true;
  } catch (error) {
    console.error(`Error updating fuel entry ${entryId}:`, error);
    return false;
  }
};

export const deleteFuelEntry = async (projectId: string, entryId: string): Promise<boolean> => {
  try {
    const entryRef = doc(getFuelLogRef(projectId), entryId);
    await deleteDoc(entryRef);
    return true;
  } catch (error) {
    console.error(`Error deleting fuel entry ${entryId}:`, error);
    return false;
  }
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

export const updateProject = async (projectId: string, updates: Partial<Project>) => {
  const projectRef = getProjectRef(projectId);
  await updateDoc(projectRef, {
    ...updates,
    lastModified: new Date().toISOString()
  } as any);
};

// --- KNOWLEDGE BASE (Sub-collection) ---

export const getKnowledgeBase = async (projectId: string): Promise<KnowledgeArticle[]> => {
  try {
    const querySnapshot = await getDocs(getKnowledgeBaseRef(projectId));
    return querySnapshot.docs.map(doc => doc.data() as KnowledgeArticle);
  } catch (error) {
    console.error(`Error fetching knowledge base for project ${projectId}:`, error);
    return [];
  }
};

export const addKnowledgeArticle = async (projectId: string, article: Omit<KnowledgeArticle, 'id'>): Promise<KnowledgeArticle | null> => {
  try {
    // Create doc reference first to get ID atomically
    const docRef = doc(getKnowledgeBaseRef(projectId));
    const articleWithId: KnowledgeArticle = { ...article, id: docRef.id } as KnowledgeArticle;
    await setDoc(docRef, articleWithId);
    return articleWithId;
  } catch (error) {
    console.error(`Error adding knowledge article to project ${projectId}:`, error);
    return null;
  }
};

export const updateKnowledgeArticle = async (projectId: string, articleId: string, updates: Partial<KnowledgeArticle>): Promise<boolean> => {
  try {
    const articleRef = doc(getKnowledgeBaseRef(projectId), articleId);
    await updateDoc(articleRef, updates);
    return true;
  } catch (error) {
    console.error(`Error updating knowledge article ${articleId}:`, error);
    return false;
  }
};

export const deleteKnowledgeArticle = async (projectId: string, articleId: string): Promise<boolean> => {
  try {
    const articleRef = doc(getKnowledgeBaseRef(projectId), articleId);
    await deleteDoc(articleRef);
    return true;
  } catch (error) {
    console.error(`Error deleting knowledge article ${articleId}:`, error);
    return false;
  }
};

export const updateVehicleData = async (projectId: string, data: Partial<VehicleData>) => {
  const projectData = await getProject(projectId);
  if (projectData) {
    const updatedVehicleData = { ...projectData.vehicleData, ...data };
    await updateDoc(getProjectRef(projectId), { vehicleData: updatedVehicleData } as any);
  }
};

export const addVehicleHistoryEvent = async (projectId: string, event: VehicleHistoryEvent) => {
  const projectRef = getProjectRef(projectId);
  await updateDoc(projectRef, {
    'vehicleData.historyEvents': arrayUnion(event),
    lastModified: new Date().toISOString()
  } as any);
};

export const addMileageReading = async (projectId: string, reading: MileageReading) => {
  const projectRef = getProjectRef(projectId);
  await updateDoc(projectRef, {
    'vehicleData.mileageHistory': arrayUnion(reading),
    lastModified: new Date().toISOString()
  } as any);
};

// --- INSPECTION FINDINGS ---

export const addInspectionFinding = async (projectId: string, finding: Omit<InspectionFinding, 'id'>) => {
  const docRef = await addDoc(getInspectionsRef(projectId), {
    ...finding,
    projectId,
    date: finding.date || new Date().toISOString()
  });
  await updateDoc(docRef, { id: docRef.id });
  return { ...finding, id: docRef.id, projectId } as InspectionFinding;
};

export const getInspectionFindings = async (projectId: string): Promise<InspectionFinding[]> => {
  const snapshot = await getDocs(getInspectionsRef(projectId));
  return snapshot.docs.map(doc => doc.data() as InspectionFinding);
};

export const updateInspectionFinding = async (projectId: string, findingId: string, updates: Partial<InspectionFinding>) => {
  const findingRef = doc(getInspectionsRef(projectId), findingId);
  await updateDoc(findingRef, updates);
};

export const deleteInspectionFinding = async (projectId: string, findingId: string) => {
  const findingRef = doc(getInspectionsRef(projectId), findingId);
  await deleteDoc(findingRef);
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
  // Remove undefined fields (Firestore doesn't accept them)
  const cleanMessages = messages.map(msg => {
    const clean: any = {
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp
    };
    if (msg.imageUrl !== undefined) {
      clean.imageUrl = msg.imageUrl;
    }
    return clean;
  });
  await setDoc(chatRef, { messages: cleanMessages, lastModified: new Date().toISOString() });
};

export const clearChatHistory = async (projectId: string) => {
  const chatRef = getChatRef(projectId);
  await deleteDoc(chatRef);
};

// --- DEPENDENCY ENGINE (BLOCKERS) ---

/**
 * Check if a task is blocked by other tasks (optimized version)
 * Uses provided tasks array to avoid N+1 queries
 * Returns: { blocked: boolean, blockedBy: Task[] }
 */
export const checkTaskBlockers = (
  task: Task,
  allTasks: Task[]
): { blocked: boolean; blockedBy: Task[] } => {
  if (!task.blockers || task.blockers.length === 0) {
    return { blocked: false, blockedBy: [] };
  }

  // Extract taskIds from blockers (supports both new TaskBlocker[] and legacy string[] format)
  const blockerIds = task.blockers.map(b => typeof b === 'string' ? b : b.taskId);

  const blockedBy = allTasks.filter(t =>
    blockerIds.includes(t.id) && t.status !== 'Klart'
  );

  return {
    blocked: blockedBy.length > 0,
    blockedBy
  };
};

/**
 * Check if a task is blocked by other tasks
 * Returns: { blocked: boolean, blockedBy: Task[] }
 * Note: For bulk operations, use checkTaskBlockers() with pre-fetched tasks to avoid N+1 queries
 */
export const getTaskBlockers = async (
  projectId: string,
  taskId: string
): Promise<{ blocked: boolean; blockedBy: Task[] }> => {
  try {
    const allTasks = await getTasks(projectId);
    const currentTask = allTasks.find(t => t.id === taskId);

    if (!currentTask) {
      return { blocked: false, blockedBy: [] };
    }

    return checkTaskBlockers(currentTask, allTasks);
  } catch (error) {
    console.error(`Error checking blockers for task ${taskId}:`, error);
    return { blocked: false, blockedBy: [] };
  }
};

/**
 * Get all tasks that are currently blocked
 * Optimized: Single query, O(n) processing
 */
export const getBlockedTasks = async (projectId: string): Promise<Task[]> => {
  try {
    const allTasks = await getTasks(projectId);

    // Process all tasks in memory (1 query instead of N+1)
    return allTasks.filter(task => {
      const { blocked } = checkTaskBlockers(task, allTasks);
      return blocked;
    });
  } catch (error) {
    console.error(`Error getting blocked tasks for project ${projectId}:`, error);
    return [];
  }
};

/**
 * Get tasks that can be started now (not blocked)
 * Optimized: Single query, O(n) processing
 */
export const getAvailableTasks = async (projectId: string): Promise<Task[]> => {
  try {
    const allTasks = await getTasks(projectId);

    // Process all tasks in memory (1 query instead of N+1)
    return allTasks.filter(task => {
      // Skip completed or in-progress tasks
      if (task.status === 'Klart' || task.status === 'Pågående') {
        return false;
      }

      const { blocked } = checkTaskBlockers(task, allTasks);
      return !blocked;
    });
  } catch (error) {
    console.error(`Error getting available tasks for project ${projectId}:`, error);
    return [];
  }
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
 * Subscribe to inspection findings updates in real-time
 * Returns an unsubscribe function
 */
export const subscribeToInspectionFindings = (
  projectId: string,
  callback: (findings: InspectionFinding[]) => void
): Unsubscribe => {
  return onSnapshot(getInspectionsRef(projectId), (snapshot) => {
    const findings = snapshot.docs.map(doc => doc.data() as InspectionFinding);
    callback(findings);
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
  console.log('🎧 Starting full project subscription:', projectId);
  let projectData: Project | null = null;
  let tasksData: Task[] = [];
  let shoppingData: ShoppingItem[] = [];
  let inspectionsData: InspectionFinding[] = [];

  const merge = () => {
    if (projectData) {
      callback({
        ...projectData,
        tasks: tasksData,
        shoppingItems: shoppingData,
        inspections: inspectionsData
      });
    } else {
      console.log('⏳ Waiting for project metadata...');
    }
  };

  // Subscribe to project metadata
  const unsubProject = subscribeToProject(projectId, (project) => {
    // console.log('📦 Project update:', project?.id);
    projectData = project;
    merge();
  });

  // Subscribe to tasks
  const unsubTasks = subscribeToTasks(projectId, (tasks) => {
    // console.log('📋 Tasks update:', tasks.length);
    tasksData = tasks;
    merge();
  });

  // Subscribe to shopping items
  const unsubShopping = subscribeToShoppingItems(projectId, (items) => {
    // console.log('🛒 Shopping update:', items.length);
    shoppingData = items;
    merge();
  });

  // Subscribe to inspection findings
  const unsubInspections = subscribeToInspectionFindings(projectId, (findings) => {
    inspectionsData = findings;
    merge();
  });

  // Return combined unsubscribe function
  return () => {
    unsubProject();
    unsubTasks();
    unsubShopping();
    unsubInspections();
  };
};

// --- WAITLIST MANAGEMENT ---

export interface WaitlistEntry {
  email: string;
  name?: string;
  source?: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  notificationSent?: boolean;
  position?: number;
}

/**
 * Add email to waitlist
 * Returns: { success: boolean, error?: string, position?: number }
 */
export const addToWaitlist = async (
  email: string,
  additionalData?: { name?: string; source?: string }
): Promise<{ success: boolean; error?: string; position?: number }> => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Ogiltig e-postadress' };
    }

    // Check if email already exists
    const waitlistRef = doc(db, 'waitlist', email);
    const existingEntry = await getDoc(waitlistRef);

    if (existingEntry.exists()) {
      const data = existingEntry.data() as WaitlistEntry;
      return {
        success: false,
        error: 'Du står redan på väntelistan!',
        position: data.position
      };
    }

    // Get current waitlist count for position
    const waitlistCollection = collection(db, 'waitlist');
    const snapshot = await getDocs(waitlistCollection);
    const position = snapshot.size + 1;

    // Create new waitlist entry
    const newEntry: WaitlistEntry = {
      email,
      name: additionalData?.name,
      source: additionalData?.source,
      timestamp: new Date().toISOString(),
      status: 'pending',
      position
    };

    await setDoc(waitlistRef, newEntry);

    console.log('✅ Added to waitlist:', email, 'Position:', position);

    return {
      success: true,
      position
    };
  } catch (error: any) {
    console.error('❌ Error adding to waitlist:', error);
    return {
      success: false,
      error: error.message || 'Kunde inte lägga till i väntelistan'
    };
  }
};

/**
 * Get user's position in waitlist
 */
export const getWaitlistPosition = async (email: string): Promise<number | null> => {
  try {
    const waitlistRef = doc(db, 'waitlist', email);
    const entry = await getDoc(waitlistRef);

    if (entry.exists()) {
      const data = entry.data() as WaitlistEntry;
      return data.position || null;
    }

    return null;
  } catch (error) {
    console.error('Error getting waitlist position:', error);
    return null;
  }
};

/**
 * Check if email is on waitlist
 */
export const isEmailOnWaitlist = async (email: string): Promise<boolean> => {
  try {
    const waitlistRef = doc(db, 'waitlist', email);
    const entry = await getDoc(waitlistRef);
    return entry.exists();
  } catch (error) {
    console.error('Error checking waitlist:', error);
    return false;
  }
};

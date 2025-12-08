
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
  arrayRemove
} from 'firebase/firestore';
import { 
  Task, 
  VehicleData, 
  Project, 
  ShoppingItem,
  UserProfile,
  ServiceItem,
  FuelLogItem,
  KnowledgeArticle
} from '../types';
import { 
  DEMO_PROJECT 
} from '../constants';

// --- HELPERS ---

function getProjectRef(projectId: string): any {
  return doc(db, 'projects', projectId);
}

const getTasksRef = (projectId: string) => collection(db, 'projects', projectId, 'tasks');
const getShoppingRef = (projectId: string) => collection(db, 'projects', projectId, 'shoppingList');


// --- SEEDING ---

export const forceSeedProject = async (userEmail: string, userId: string) => {
  const projectId = DEMO_PROJECT.id;
  console.log(`Seeding database for project ${projectId} and owner: ${userEmail} (${userId})...`);
  
  const batch = writeBatch(db);

  const projectRef = doc(db, 'projects', projectId);
  const projectData: Project = {
    ...DEMO_PROJECT,
    ownerId: userId,
    ownerEmail: userEmail,
    created: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    isDemo: true,
    tasks: [],
    shoppingItems: [],
    serviceLog: [],
    fuelLog: [],
    knowledgeArticles: [],
    members: [],
    invitedEmails: []
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
    const projectsMap = new Map<string, Project>();

    // 1. Get owned projects
    const qOwned = query(collection(db, 'projects'), where("ownerId", "==", userId));
    const snapOwned = await getDocs(qOwned);
    snapOwned.forEach(doc => projectsMap.set(doc.id, { id: doc.id, ...doc.data() } as Project));

    // 2. Get member projects
    const qMember = query(collection(db, 'projects'), where("members", "array-contains", userId));
    const snapMember = await getDocs(qMember);
    snapMember.forEach(doc => projectsMap.set(doc.id, { id: doc.id, ...doc.data() } as Project));

    // 3. Get invited projects (if email is provided)
    if (userEmail) {
        const qInvited = query(collection(db, 'projects'), where("invitedEmails", "array-contains", userEmail));
        const snapInvited = await getDocs(qInvited);
        snapInvited.forEach(doc => projectsMap.set(doc.id, { id: doc.id, ...doc.data() } as Project));
    }

    return Array.from(projectsMap.values());
}

export const getProject = async (projectId: string): Promise<Project | null> => {
  const docSnap = await getDoc(getProjectRef(projectId));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Project;
  }
  return null;
};

export const createProject = async (
    name: string, 
    model: string, 
    userId: string, 
    userEmail: string,
    template?: Partial<Project> 
): Promise<Project> => {
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
        type: (template?.type || 'renovation') as any, // Use template type or default
        brand: 'vanplan',
        ownerId: userId,
        ownerEmail: userEmail,
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        isDemo: false,
        vehicleData: vehicleData,
        tasks: [],
        shoppingItems: [],
        serviceLog: [],
        fuelLog: [],
        knowledgeArticles: template?.knowledgeArticles || [],
        customIcon: template?.customIcon || null,
        members: [],
        invitedEmails: []
    };

    await setDoc(newProjectRef, newProject);

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

    return newProject;
};

export const deleteProjectFull = async (projectId: string) => {
    const tasksSnap = await getDocs(getTasksRef(projectId));
    const itemsSnap = await getDocs(getShoppingRef(projectId));
    
    const batch = writeBatch(db);
    
    tasksSnap.forEach((doc) => batch.delete(doc.ref));
    itemsSnap.forEach((doc) => batch.delete(doc.ref));
    
    batch.delete(getProjectRef(projectId));
    
    await batch.commit();
};

export const addServiceEntry = async (projectId: string, entry: ServiceItem) => {
    const projectRef = getProjectRef(projectId);
    await updateDoc(projectRef, {
        serviceLog: arrayUnion(entry)
    });
};

export const addFuelEntry = async (projectId: string, entry: FuelLogItem) => {
    const projectRef = getProjectRef(projectId);
    await updateDoc(projectRef, {
        fuelLog: arrayUnion(entry)
    });
};

export const addKnowledgeArticle = async (projectId: string, article: KnowledgeArticle) => {
    const projectRef = getProjectRef(projectId);
    await updateDoc(projectRef, {
        knowledgeArticles: arrayUnion(article)
    });
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
        invitedEmails: arrayUnion(email)
    });
};

export const acceptProjectInvite = async (projectId: string, userId: string, email: string) => {
    const projectRef = getProjectRef(projectId);
    await updateDoc(projectRef, {
        members: arrayUnion(userId),
        invitedEmails: arrayRemove(email)
    });
};

export const removeMemberFromProject = async (projectId: string, userId: string) => {
    const projectRef = getProjectRef(projectId);
    await updateDoc(projectRef, {
        members: arrayRemove(userId)
    });
};

export const cancelInvite = async (projectId: string, email: string) => {
     const projectRef = getProjectRef(projectId);
    await updateDoc(projectRef, {
        invitedEmails: arrayRemove(email)
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

import { Project, UserProfile } from '../types';
import { DEMO_PROJECT } from '../constants';
import { auth, db as firestore, googleProvider, storage } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, doc, setDoc, getDocs, deleteDoc, query, where, getDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

// --- INTERFACE ---
export interface DBInterface {
    type: 'local' | 'firebase';
    // Auth
    login(): Promise<UserProfile | null>;
    logout(): Promise<void>;
    onUserChange(callback: (user: UserProfile | null) => void): () => void;
    
    // Data
    getProjects(userId: string): Promise<Project[]>;
    saveProject(userId: string, project: Project): Promise<void>;
    deleteProject(userId: string, projectId: string): Promise<void>;
    
    // Storage (Optional for now, strictly needed for Firebase images)
    uploadImage?(userId: string, projectId: string, base64Data: string): Promise<string>;
}

// --- 1. LOCAL STORAGE IMPLEMENTATION (DEV/BETA) ---
class LocalStorageDB implements DBInterface {
    type = 'local' as const;

    async login(): Promise<UserProfile | null> {
        // Simulerad inloggning
        const mockUser: UserProfile = { id: 'u1', name: 'Garagehjälten (Local)', email: 'dev@local.se' };
        localStorage.setItem('elton-user', JSON.stringify(mockUser));
        return mockUser;
    }

    async logout(): Promise<void> {
        localStorage.removeItem('elton-user');
    }

    onUserChange(callback: (user: UserProfile | null) => void): () => void {
        // I local storage mode, we verify state on load. 
        // Vi kan inte riktigt prenumerera på localStorage changes enkelt utan window events, 
        // så vi kör en engångskoll vid init i App.tsx istället.
        const saved = localStorage.getItem('elton-user');
        callback(saved ? JSON.parse(saved) : null);
        return () => {}; // No cleanup needed
    }

    async getProjects(userId: string): Promise<Project[]> {
        // I LocalStorage mode delar alla "användare" på samma lagring i webbläsaren
        const saved = localStorage.getItem('elton-projects');
        let projects: Project[] = saved ? JSON.parse(saved) : [];
        
        // Ensure Demo Project is accessible if added
        // (In local mode we treat DEMO_PROJECT as separate unless explicitly saved)
        return projects;
    }

    async saveProject(userId: string, project: Project): Promise<void> {
        const saved = localStorage.getItem('elton-projects');
        let projects: Project[] = saved ? JSON.parse(saved) : [];
        
        const idx = projects.findIndex(p => p.id === project.id);
        if (idx >= 0) {
            projects[idx] = project;
        } else {
            projects.push(project);
        }
        localStorage.setItem('elton-projects', JSON.stringify(projects));
    }

    async deleteProject(userId: string, projectId: string): Promise<void> {
        const saved = localStorage.getItem('elton-projects');
        let projects: Project[] = saved ? JSON.parse(saved) : [];
        projects = projects.filter(p => p.id !== projectId);
        localStorage.setItem('elton-projects', JSON.stringify(projects));
    }
}

// --- 2. FIREBASE IMPLEMENTATION (PRODUCTION) ---
class FirebaseDB implements DBInterface {
    type = 'firebase' as const;

    async login(): Promise<UserProfile | null> {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            return this.mapUser(user);
        } catch (error) {
            console.error("Firebase Login Error", error);
            return null;
        }
    }

    async logout(): Promise<void> {
        await signOut(auth);
    }

    onUserChange(callback: (user: UserProfile | null) => void): () => void {
        return onAuthStateChanged(auth, (firebaseUser) => {
            callback(firebaseUser ? this.mapUser(firebaseUser) : null);
        });
    }

    async getProjects(userId: string): Promise<Project[]> {
        try {
            const q = query(collection(firestore, 'users', userId, 'projects'));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => doc.data() as Project);
        } catch (e) {
            console.error("Failed to fetch projects", e);
            return [];
        }
    }

    async saveProject(userId: string, project: Project): Promise<void> {
        // Save entire project document
        // In a real optimized app, we might save sub-collections for tasks, 
        // but for <2MB JSON, saving the whole object is faster and cheaper for reads.
        const projectRef = doc(firestore, 'users', userId, 'projects', project.id);
        await setDoc(projectRef, project, { merge: true });
    }

    async deleteProject(userId: string, projectId: string): Promise<void> {
        await deleteDoc(doc(firestore, 'users', userId, 'projects', projectId));
    }

    private mapUser(u: FirebaseUser): UserProfile {
        return {
            id: u.uid,
            name: u.displayName || 'Användare',
            email: u.email || '',
            avatar: u.photoURL || undefined
        };
    }
}

// --- FACTORY ---
// Kollar miljövariabeln VITE_USE_FIREBASE (sätts i .env)
const env = (import.meta as any).env || {};
const useFirebase = env.VITE_USE_FIREBASE === 'true';

export const db: DBInterface = useFirebase ? new FirebaseDB() : new LocalStorageDB();

console.log(`Database Service initialized in ${useFirebase ? 'FIREBASE (Cloud)' : 'LOCAL STORAGE (Browser)'} mode.`);
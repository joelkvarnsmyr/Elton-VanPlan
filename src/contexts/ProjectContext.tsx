import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Project, Task, ShoppingItem, VehicleData, Contact } from '@/types/types';
import {
    updateTask as dbUpdateTask,
    deleteTask as dbDeleteTask,
    addTask as dbAddTask,
    addShoppingItem as dbAddShoppingItem,
    updateShoppingItem as dbUpdateShoppingItem,
    deleteShoppingItem as dbDeleteShoppingItem,
    updateProject,
    subscribeToProjectFull
} from '@/services/db';

interface ProjectContextType {
    activeProject: Project | null;
    setActiveProject: (project: Project | null) => void;
    tasks: Task[];
    shoppingItems: ShoppingItem[];
    vehicleData: VehicleData | null;

    // Task actions
    addTask: (task: Omit<Task, 'id'>) => Promise<Task>;
    updateTask: (task: Task) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;

    // Shopping actions
    addShoppingItem: (item: Omit<ShoppingItem, 'id'>) => Promise<void>;
    updateShoppingItem: (item: ShoppingItem) => Promise<void>;
    deleteShoppingItem: (id: string) => Promise<void>;

    // Vehicle data actions
    updateVehicleData: (updates: Partial<VehicleData>) => Promise<void>;

    // Project metadata actions
    updateContacts: (contacts: Contact[]) => Promise<void>;
    updateLocation: (location: any) => Promise<void>;
    updateProjectMetadata: (field: string, value: string) => Promise<void>;

    // Toast notifications
    showToast: (message: string, type?: 'success' | 'error') => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeProject, setActiveProject] = useState<Project | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Real-time subscription to active project
    useEffect(() => {
        if (!activeProject?.id) return;

        console.log('🔴 [ProjectContext] Setting up real-time listeners for project:', activeProject.id);

        const unsubscribe = subscribeToProjectFull(activeProject.id, (updatedProject) => {
            if (updatedProject) {
                console.log('📡 [ProjectContext] Real-time update received:', updatedProject.name);
                setActiveProject(updatedProject);
            }
        });

        return () => {
            console.log('🔴 [ProjectContext] Cleaning up real-time listeners');
            unsubscribe();
        };
    }, [activeProject?.id]);

    const activeProjectRef = useRef(activeProject);
    useEffect(() => { activeProjectRef.current = activeProject; }, [activeProject]);

    const addTask = async (taskData: Omit<Task, 'id'>) => {
        if (!activeProjectRef.current) return {} as Task;
        try {
            const newTask = await dbAddTask(activeProjectRef.current.id, taskData);
            // Context update usually happens via refetch or optimistic update.
            // For now let's rely on the DB call triggering a state update if we were listening,
            // OR manually update state.
            // Since we might not have real-time stream setup in context yet (it just used initial fetch in my mock),
            // we should update state.
            const updatedTasks = [...(activeProjectRef.current.tasks || []), newTask];
            setActiveProject({ ...activeProjectRef.current, tasks: updatedTasks });
            showToast('Uppgift tillagd!');
            return newTask;
        } catch (err) {
            console.error("Failed to add task", err);
            showToast("Kunde inte skapa uppgift", "error");
            throw err;
        }
    };

    const updateTask = async (task: Task) => {
        if (!activeProjectRef.current) return;
        // Optimistic update first
        const originalTasks = activeProjectRef.current.tasks;
        const updatedTasks = activeProjectRef.current.tasks.map(t => t.id === task.id ? task : t);
        setActiveProject({ ...activeProjectRef.current, tasks: updatedTasks });
        try {
            // Save to tasks subcollection (not project document!)
            await dbUpdateTask(activeProjectRef.current.id, task.id, task);
        } catch (error) {
            console.error("Failed to update task", error);
            // Revert on error
            setActiveProject({ ...activeProjectRef.current, tasks: originalTasks });
            showToast("Kunde inte uppdatera uppgift", "error");
        }
    };

    const deleteTask = async (taskId: string) => {
        if (!activeProject) return;
        const originalTasks = activeProject.tasks;
        setActiveProject({
            ...activeProject,
            tasks: activeProject.tasks.filter(t => t.id !== taskId)
        });
        try {
            await dbDeleteTask(activeProject.id, taskId);
            showToast('Uppgift raderad');
        } catch (e) {
            setActiveProject({ ...activeProject, tasks: originalTasks });
            showToast('Kunde inte radera uppgift', 'error');
        }
    };

    const addShoppingItem = async (item: Omit<ShoppingItem, 'id'>) => {
        if (!activeProject) return;
        try {
            const newItem = await dbAddShoppingItem(activeProject.id, item);
            setActiveProject({
                ...activeProject,
                shoppingItems: [...activeProject.shoppingItems, newItem]
            });
            showToast(`Lade till ${item.name}`);
        } catch (e) {
            showToast('Kunde inte spara vara', 'error');
        }
    };

    const updateShoppingItem = async (updatedItem: ShoppingItem) => {
        if (!activeProject) return;
        const originalItems = activeProject.shoppingItems;
        setActiveProject({
            ...activeProject,
            shoppingItems: activeProject.shoppingItems.map(item =>
                item.id === updatedItem.id ? updatedItem : item
            )
        });
        try {
            await dbUpdateShoppingItem(activeProject.id, updatedItem.id, updatedItem);
        } catch (e) {
            setActiveProject({ ...activeProject, shoppingItems: originalItems });
            showToast('Kunde inte uppdatera', 'error');
        }
    };

    const deleteShoppingItem = async (id: string) => {
        if (!activeProject) return;
        const originalItems = activeProject.shoppingItems;
        setActiveProject({
            ...activeProject,
            shoppingItems: activeProject.shoppingItems.filter(i => i.id !== id)
        });
        try {
            await dbDeleteShoppingItem(activeProject.id, id);
            showToast('Vara raderad');
        } catch (e) {
            setActiveProject({ ...activeProject, shoppingItems: originalItems });
            showToast('Fel vid radering', 'error');
        }
    };

    const updateVehicleData = async (updates: Partial<VehicleData>) => {
        if (!activeProject) return;
        const mergedVehicleData = { ...activeProject.vehicleData, ...updates };

        // Deep merge for nested objects
        for (const key in updates) {
            if (typeof updates[key as keyof VehicleData] === 'object' && updates[key as keyof VehicleData] !== null) {
                (mergedVehicleData as any)[key] = {
                    ...(activeProject.vehicleData[key as keyof VehicleData] as any),
                    ...(updates[key as keyof VehicleData] as any)
                };
            }
        }

        setActiveProject({ ...activeProject, vehicleData: mergedVehicleData });
        try {
            await updateProject(activeProject.id, { vehicleData: mergedVehicleData });
            showToast('Fordonsdata uppdaterad!');
        } catch (error) {
            console.error('Error updating vehicle data:', error);
            setActiveProject(activeProject); // Revert
            showToast('Kunde inte uppdatera fordonsdata', 'error');
        }
    };

    const updateContacts = async (updatedContacts: Contact[]) => {
        if (!activeProject) return;
        try {
            await updateProject(activeProject.id, { contacts: updatedContacts });
            setActiveProject({ ...activeProject, contacts: updatedContacts });
            showToast('Kontakter uppdaterade!');
        } catch (error) {
            console.error('Error updating contacts:', error);
            showToast('Kunde inte uppdatera kontakter', 'error');
        }
    };

    const updateLocation = async (location: any) => {
        if (!activeProject) return;
        try {
            await updateProject(activeProject.id, { location });
            setActiveProject({ ...activeProject, location });
            showToast('Plats uppdaterad!');
        } catch (error) {
            console.error('Error updating location:', error);
            showToast('Kunde inte uppdatera plats', 'error');
        }
    };

    const updateProjectMetadata = async (field: string, value: string) => {
        if (!activeProject) return;
        const updates: any = { [field]: value };
        setActiveProject({ ...activeProject, ...updates });
        try {
            await updateProject(activeProject.id, updates);
            showToast(`${field === 'nickname' ? 'Smeknamn' : 'Projektnamn'} uppdaterat!`);
        } catch (error) {
            console.error('Error updating project metadata:', error);
            setActiveProject(activeProject);
            showToast('Kunde inte uppdatera projekt', 'error');
        }
    };

    const value: ProjectContextType = {
        activeProject,
        setActiveProject,
        tasks: activeProject?.tasks || [],
        shoppingItems: activeProject?.shoppingItems || [],
        vehicleData: activeProject?.vehicleData || null,
        addTask,
        updateTask,
        deleteTask,
        addShoppingItem,
        updateShoppingItem,
        deleteShoppingItem,
        updateVehicleData,
        updateContacts,
        updateLocation,
        updateProjectMetadata,
        showToast
    };

    return (
        <ProjectContext.Provider value={value}>
            {children}
            {toast && (
                <div className={`fixed bottom-24 right-4 z-50 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in ${toast.type === 'error' ? 'bg-rose-500 text-white' : 'bg-nordic-charcoal text-white dark:bg-teal-600'
                    }`}>
                    <span className="font-medium text-sm">{toast.message}</span>
                </div>
            )}
        </ProjectContext.Provider>
    );
};

export const useProject = () => {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
};

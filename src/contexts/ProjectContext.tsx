/**
 * Project Context
 *
 * Provides project state and methods throughout the app.
 * Handles active project, project list, and real-time subscriptions.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { Project, Task, ShoppingItem } from '@/types/types';
import {
  getProject,
  getProjectsForUser,
  createProject as createProjectDb,
  deleteProjectFull,
  getTasks,
  getShoppingItems,
  addTask as addTaskDb,
  updateTask as updateTaskDb,
  deleteTask as deleteTaskDb,
  addShoppingItem as addShoppingItemDb,
  updateShoppingItem as updateShoppingItemDb,
  deleteShoppingItem as deleteShoppingItemDb,
  updateProject as updateProjectDb,
  subscribeToProjectFull
} from '@/services/db';
import { useAuth } from './AuthContext';

// --- TYPES ---

interface ProjectContextType {
  // State
  projects: Project[];
  activeProject: Project | null;
  isLoading: boolean;

  // Project Actions
  loadProjects: () => Promise<void>;
  selectProject: (projectId: string) => Promise<void>;
  createProject: (project: Omit<Project, 'id'>) => Promise<Project | null>;
  deleteProject: (projectId: string) => Promise<boolean>;
  updateProject: (updates: Partial<Project>) => Promise<boolean>;
  clearActiveProject: () => void;

  // Task Actions
  addTask: (task: Omit<Task, 'id'>) => Promise<Task | null>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<boolean>;

  // Shopping Actions
  addShoppingItem: (item: Omit<ShoppingItem, 'id'>) => Promise<ShoppingItem | null>;
  updateShoppingItem: (itemId: string, updates: Partial<ShoppingItem>) => Promise<boolean>;
  deleteShoppingItem: (itemId: string) => Promise<boolean>;
}

// --- CONTEXT ---

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// --- PROVIDER ---

interface ProjectProviderProps {
  children: ReactNode;
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Load projects when user changes
  useEffect(() => {
    if (user) {
      loadProjects();
    } else {
      setProjects([]);
      setActiveProject(null);
    }
  }, [user?.uid]);

  // Cleanup subscription on unmount or project change
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

  // Load all projects for user
  const loadProjects = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const userProjects = await getProjectsForUser(user.uid, user.email);
      setProjects(userProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
    setIsLoading(false);
  }, [user]);

  // Select and load a project with real-time subscription
  const selectProject = useCallback(async (projectId: string) => {
    setIsLoading(true);

    // Cleanup previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    try {
      const projData = await getProject(projectId);
      if (projData) {
        const [tasks, shopping] = await Promise.all([
          getTasks(projectId),
          getShoppingItems(projectId)
        ]);

        const fullProject = {
          ...projData,
          tasks: tasks || [],
          shoppingItems: shopping || []
        };

        setActiveProject(fullProject);

        // Setup real-time subscription
        unsubscribeRef.current = subscribeToProjectFull(projectId, (updatedProject) => {
          if (updatedProject) {
            setActiveProject(updatedProject);
          }
        });
      }
    } catch (error) {
      console.error('Error loading project:', error);
    }

    setIsLoading(false);
  }, []);

  // Create a new project
  const createProject = useCallback(async (project: Omit<Project, 'id'>): Promise<Project | null> => {
    if (!user) return null;

    try {
      const newProject = await createProjectDb(project);
      setProjects(prev => [...prev, newProject]);
      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      return null;
    }
  }, [user]);

  // Delete a project
  const deleteProject = useCallback(async (projectId: string): Promise<boolean> => {
    try {
      const result = await deleteProjectFull(projectId);
      if (result.success) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        if (activeProject?.id === projectId) {
          setActiveProject(null);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  }, [activeProject]);

  // Update current project
  const updateProject = useCallback(async (updates: Partial<Project>): Promise<boolean> => {
    if (!activeProject) return false;

    try {
      await updateProjectDb(activeProject.id, updates);
      // Real-time subscription will update the state
      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      return false;
    }
  }, [activeProject]);

  // Clear active project
  const clearActiveProject = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    setActiveProject(null);
  }, []);

  // --- TASK ACTIONS ---

  const addTask = useCallback(async (task: Omit<Task, 'id'>): Promise<Task | null> => {
    if (!activeProject) return null;

    try {
      const newTask = await addTaskDb(activeProject.id, task);
      // Real-time subscription will update the state
      return newTask;
    } catch (error) {
      console.error('Error adding task:', error);
      return null;
    }
  }, [activeProject]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>): Promise<boolean> => {
    if (!activeProject) return false;

    try {
      await updateTaskDb(activeProject.id, taskId, updates);
      // Real-time subscription will update the state
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      return false;
    }
  }, [activeProject]);

  const deleteTask = useCallback(async (taskId: string): Promise<boolean> => {
    if (!activeProject) return false;

    try {
      await deleteTaskDb(activeProject.id, taskId);
      // Real-time subscription will update the state
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }, [activeProject]);

  // --- SHOPPING ACTIONS ---

  const addShoppingItem = useCallback(async (item: Omit<ShoppingItem, 'id'>): Promise<ShoppingItem | null> => {
    if (!activeProject) return null;

    try {
      const newItem = await addShoppingItemDb(activeProject.id, item);
      // Real-time subscription will update the state
      return newItem;
    } catch (error) {
      console.error('Error adding shopping item:', error);
      return null;
    }
  }, [activeProject]);

  const updateShoppingItem = useCallback(async (itemId: string, updates: Partial<ShoppingItem>): Promise<boolean> => {
    if (!activeProject) return false;

    try {
      await updateShoppingItemDb(activeProject.id, itemId, updates);
      // Real-time subscription will update the state
      return true;
    } catch (error) {
      console.error('Error updating shopping item:', error);
      return false;
    }
  }, [activeProject]);

  const deleteShoppingItem = useCallback(async (itemId: string): Promise<boolean> => {
    if (!activeProject) return false;

    try {
      await deleteShoppingItemDb(activeProject.id, itemId);
      // Real-time subscription will update the state
      return true;
    } catch (error) {
      console.error('Error deleting shopping item:', error);
      return false;
    }
  }, [activeProject]);

  const value: ProjectContextType = {
    projects,
    activeProject,
    isLoading,
    loadProjects,
    selectProject,
    createProject,
    deleteProject,
    updateProject,
    clearActiveProject,
    addTask,
    updateTask,
    deleteTask,
    addShoppingItem,
    updateShoppingItem,
    deleteShoppingItem
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

// --- HOOKS ---

export function useProject(): ProjectContextType {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}

/**
 * Hook that requires an active project
 */
export function useActiveProject(): Project {
  const { activeProject } = useProject();

  if (!activeProject) {
    throw new Error('No active project');
  }

  return activeProject;
}

/**
 * Hook for accessing tasks from active project
 */
export function useTasks(): Task[] {
  const { activeProject } = useProject();
  return activeProject?.tasks || [];
}

/**
 * Hook for accessing shopping items from active project
 */
export function useShoppingItems(): ShoppingItem[] {
  const { activeProject } = useProject();
  return activeProject?.shoppingItems || [];
}

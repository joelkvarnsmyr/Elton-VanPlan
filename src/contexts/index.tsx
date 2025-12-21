/**
 * Contexts Index
 *
 * Re-exports all contexts and provides a combined AppProvider.
 */

import React, { ReactNode } from 'react';
import { AuthProvider, useAuth, useRequireAuth } from './AuthContext';
import { ProjectProvider, useProject, useActiveProject, useTasks, useShoppingItems } from './ProjectContext';
import { UIProvider, useUI, useToast, useDarkMode, useNavigation, useModals, ViewType, Toast } from './UIContext';

// --- RE-EXPORTS ---

export {
  // Auth
  AuthProvider,
  useAuth,
  useRequireAuth,

  // Project
  ProjectProvider,
  useProject,
  useActiveProject,
  useTasks,
  useShoppingItems,

  // UI
  UIProvider,
  useUI,
  useToast,
  useDarkMode,
  useNavigation,
  useModals
};

export type { ViewType, Toast };

// --- COMBINED PROVIDER ---

interface AppProviderProps {
  children: ReactNode;
}

/**
 * Combined provider that wraps all context providers.
 * Use this at the app root to enable all contexts.
 *
 * @example
 * ```tsx
 * <AppProvider>
 *   <App />
 * </AppProvider>
 * ```
 */
export function AppProvider({ children }: AppProviderProps) {
  return (
    <UIProvider>
      <AuthProvider>
        <ProjectProvider>
          {children}
        </ProjectProvider>
      </AuthProvider>
    </UIProvider>
  );
}

// --- UTILITY HOOKS ---

/**
 * Combined hook for common app state
 * Provides user, project, and UI state in one object
 */
export function useAppState() {
  const auth = useAuth();
  const project = useProject();
  const ui = useUI();

  return {
    // Auth
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isAuthLoading: auth.isLoading,

    // Project
    projects: project.projects,
    activeProject: project.activeProject,
    isProjectLoading: project.isLoading,

    // UI
    isDarkMode: ui.isDarkMode,
    currentView: ui.currentView,
    toasts: ui.toasts,

    // Combined loading state
    isLoading: auth.isLoading || project.isLoading
  };
}

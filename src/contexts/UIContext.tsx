/**
 * UI Context
 *
 * Provides UI state and methods throughout the app.
 * Handles toasts, dark mode, modals, and navigation.
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

// --- TYPES ---

export type ViewType = 'dashboard' | 'tasks' | 'ai' | 'specs' | 'shopping' | 'roadmap' | 'scraper' | 'inspection';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface UIContextType {
  // Dark Mode
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;

  // Navigation
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;

  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type'], duration?: number) => void;
  dismissToast: (id: string) => void;

  // Modals
  modals: {
    settings: boolean;
    members: boolean;
    fuelLog: boolean;
    serviceBook: boolean;
    magicImport: boolean;
  };
  openModal: (modal: keyof UIContextType['modals']) => void;
  closeModal: (modal: keyof UIContextType['modals']) => void;
  toggleModal: (modal: keyof UIContextType['modals']) => void;

  // Filters
  activePhaseFilter: string;
  setActivePhaseFilter: (phase: string) => void;
  shoppingTaskFilter: string | undefined;
  setShoppingTaskFilter: (taskId: string | undefined) => void;

  // Task viewing
  taskToView: string | null;
  setTaskToView: (taskId: string | null) => void;
}

// --- CONTEXT ---

const UIContext = createContext<UIContextType | undefined>(undefined);

// --- LOCAL STORAGE KEYS ---

const DARK_MODE_KEY = 'elton-dark-mode';

// --- PROVIDER ---

interface UIProviderProps {
  children: ReactNode;
}

export function UIProvider({ children }: UIProviderProps) {
  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(DARK_MODE_KEY);
      if (saved !== null) {
        return saved === 'true';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Navigation
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Modals
  const [modals, setModals] = useState({
    settings: false,
    members: false,
    fuelLog: false,
    serviceBook: false,
    magicImport: false
  });

  // Filters
  const [activePhaseFilter, setActivePhaseFilter] = useState<string>('ALL');
  const [shoppingTaskFilter, setShoppingTaskFilter] = useState<string | undefined>(undefined);

  // Task viewing
  const [taskToView, setTaskToView] = useState<string | null>(null);

  // Apply dark mode to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem(DARK_MODE_KEY, String(isDarkMode));
  }, [isDarkMode]);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  // Set dark mode explicitly
  const setDarkMode = useCallback((enabled: boolean) => {
    setIsDarkMode(enabled);
  }, []);

  // Show toast notification
  const showToast = useCallback((
    message: string,
    type: Toast['type'] = 'success',
    duration: number = 3000
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const toast: Toast = { id, message, type, duration };

    setToasts(prev => [...prev, toast]);

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }
  }, []);

  // Dismiss toast
  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Open modal
  const openModal = useCallback((modal: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modal]: true }));
  }, []);

  // Close modal
  const closeModal = useCallback((modal: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modal]: false }));
  }, []);

  // Toggle modal
  const toggleModal = useCallback((modal: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modal]: !prev[modal] }));
  }, []);

  const value: UIContextType = {
    isDarkMode,
    toggleDarkMode,
    setDarkMode,
    currentView,
    setCurrentView,
    toasts,
    showToast,
    dismissToast,
    modals,
    openModal,
    closeModal,
    toggleModal,
    activePhaseFilter,
    setActivePhaseFilter,
    shoppingTaskFilter,
    setShoppingTaskFilter,
    taskToView,
    setTaskToView
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}

// --- HOOKS ---

export function useUI(): UIContextType {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}

/**
 * Hook for toast notifications
 */
export function useToast() {
  const { showToast, dismissToast, toasts } = useUI();
  return { showToast, dismissToast, toasts };
}

/**
 * Hook for dark mode
 */
export function useDarkMode() {
  const { isDarkMode, toggleDarkMode, setDarkMode } = useUI();
  return { isDarkMode, toggleDarkMode, setDarkMode };
}

/**
 * Hook for navigation
 */
export function useNavigation() {
  const { currentView, setCurrentView } = useUI();
  return { currentView, setCurrentView };
}

/**
 * Hook for modals
 */
export function useModals() {
  const { modals, openModal, closeModal, toggleModal } = useUI();
  return { modals, openModal, closeModal, toggleModal };
}

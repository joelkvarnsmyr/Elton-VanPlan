/**
 * Auth Context
 *
 * Provides authentication state and methods throughout the app.
 * Eliminates prop-drilling for user-related data.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { UserProfile } from '@/types/types';
import { subscribeToAuthChanges, completeLogin, logout as firebaseLogout } from '@/services/auth';
import { getUserProfile, updateUserProfile as updateProfile } from '@/services/db';

// --- TYPES ---

interface AuthContextType {
  // State
  user: UserProfile | null;
  firebaseUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

// --- CONTEXT ---

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- PROVIDER ---

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    // Complete any pending email link login
    completeLogin().catch(console.error);

    // Subscribe to auth changes
    const unsubscribe = subscribeToAuthChanges(async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser && fbUser.email) {
        try {
          const profile = await getUserProfile(fbUser.uid, fbUser.email);
          setUser(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await firebaseLogout();
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }, []);

  // Update user profile
  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false;

    try {
      await updateProfile(user.uid, updates);
      setUser(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }, [user]);

  // Refresh user data from database
  const refreshUser = useCallback(async () => {
    if (!firebaseUser?.email) return;

    try {
      const profile = await getUserProfile(firebaseUser.uid, firebaseUser.email);
      setUser(profile);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, [firebaseUser]);

  const value: AuthContextType = {
    user,
    firebaseUser,
    isLoading,
    isAuthenticated: !!user,
    logout,
    updateUserProfile,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// --- HOOK ---

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// --- UTILITY HOOK ---

/**
 * Hook that requires authentication
 * Throws if user is not authenticated
 */
export function useRequireAuth(): UserProfile {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    throw new Error('Auth is still loading');
  }

  if (!user) {
    throw new Error('User is not authenticated');
  }

  return user;
}

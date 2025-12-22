import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '@/types/types';
import { subscribeToAuthChanges, logout as authLogout } from '@/services/auth';
import { getUserProfile, updateUserProfile as dbUpdateUserProfile } from '@/services/db';

interface UserContextType {
    currentUser: UserProfile | null;
    isLoading: boolean;
    updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
    logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToAuthChanges(async (user) => {
            if (user) {
                const profile = await getUserProfile(user.uid, user.email!);
                setCurrentUser(profile);
            } else {
                setCurrentUser(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const updateProfile = async (updates: Partial<UserProfile>) => {
        if (!currentUser) return;
        try {
            await dbUpdateUserProfile(currentUser.uid, updates);
            setCurrentUser({ ...currentUser, ...updates });
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    };

    const logout = async () => {
        await authLogout();
        setCurrentUser(null);
    };

    const value: UserContextType = {
        currentUser,
        isLoading,
        updateProfile,
        logout
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

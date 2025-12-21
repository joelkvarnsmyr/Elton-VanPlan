export type DifficultyLevel = 'Easy' | 'Medium' | 'Expert';
export type UserSkillLevel = 'beginner' | 'intermediate' | 'expert';

export interface UserProfile {
    uid: string;
    name: string;
    email: string;
    avatar?: string;
    skillLevel?: UserSkillLevel; // Mechanical skill level for personalized AI guidance
    favoriteStores?: string[]; // Preferred stores for shopping recommendations (e.g., ['Biltema', 'Jula'])
}

/**
 * User Settings
 * Preferences and configuration for the user experience
 */
export interface UserSettings {
    userId: string;
    dialectId?: 'dalmal' | 'gotlandska' | 'rikssvenska' | 'standard';
    darkMode?: boolean;
    language?: 'sv' | 'en';
}

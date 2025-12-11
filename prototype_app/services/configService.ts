
import { FeatureFlags, DEFAULT_FLAGS } from '../constants';
import { PROMPT_VERSIONS, BASE_PROMPT_V1 } from '../prompts';

const STORAGE_KEY_FLAGS = 'elton-feature-flags';
const STORAGE_KEY_PROMPT = 'elton-prompt-version';

export const configService = {
    // Feature Flags
    getFlags: (): FeatureFlags => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY_FLAGS);
            if (saved) {
                return { ...DEFAULT_FLAGS, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.error("Failed to load flags", e);
        }
        return DEFAULT_FLAGS;
    },

    setFlag: (key: keyof FeatureFlags, value: boolean) => {
        const current = configService.getFlags();
        const updated = { ...current, [key]: value };
        localStorage.setItem(STORAGE_KEY_FLAGS, JSON.stringify(updated));
        // Force reload usually needed for flags to take deep effect, 
        // but React state update handled in App/DevTools is better.
    },

    // Prompt Versioning
    getActivePromptVersion: (): string => {
        return localStorage.getItem(STORAGE_KEY_PROMPT) || 'v1';
    },

    setActivePromptVersion: (version: string) => {
        if (PROMPT_VERSIONS[version as keyof typeof PROMPT_VERSIONS]) {
            localStorage.setItem(STORAGE_KEY_PROMPT, version);
        }
    },

    getSystemPrompt: (): string => {
        const v = configService.getActivePromptVersion();
        // @ts-ignore
        return PROMPT_VERSIONS[v]?.prompt || BASE_PROMPT_V1;
    }
};

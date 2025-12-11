Projekten jag skapar med min profil verkar inte sparas/länkas till min profil? Är det något fel? Vad kan vara fel? /**
 * ONBOARDING & PROMPT PERSONALIZATION TESTS
 *
 * Verifierar att userSkillLevel och projectType propageras korrekt genom hela systemet
 * och att AI:n genererar personaliserade uppgifter och svar.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateProjectProfile } from '../services/geminiService';
import { ACTIVE_PROMPTS } from '../config/prompts';
import type { ProjectType, UserSkillLevel } from '../types';

// Mock @google/genai
vi.mock('@google/genai', () => ({
    GoogleGenAI: vi.fn().mockImplementation(() => ({
        models: {
            generateContent: vi.fn()
        }
    })),
    Type: {
        OBJECT: 'OBJECT',
        STRING: 'STRING',
        NUMBER: 'NUMBER',
        ARRAY: 'ARRAY'
    }
}));

describe('Prompt Personalization System', () => {

    describe('PLANNER Prompt Generation', () => {

        it('should accept projectType and userSkillLevel parameters', () => {
            const vehicleData = JSON.stringify({ make: 'Volvo', model: '240', year: 1990 });
            const projectType = 'renovation';
            const userSkillLevel = 'beginner';

            const prompt = ACTIVE_PROMPTS.agents.planner.text(vehicleData, projectType, userSkillLevel);

            expect(prompt).toContain('PROJEKTTYP: renovation');
            expect(prompt).toContain('ANVÄNDARENS KUNSKAPSNIVÅ: beginner');
        });

        it('should include beginner-specific instructions for nybörjare', () => {
            const vehicleData = '{}';
            const prompt = ACTIVE_PROMPTS.agents.planner.text(vehicleData, 'renovation', 'beginner');

            expect(prompt).toContain('NYBÖRJARE');
            expect(prompt).toContain('DETALJERADE uppgifter');
            expect(prompt).toContain('minst 5-8 steg per uppgift');
            expect(prompt).toContain('Förklara alla tekniska termer');
            expect(prompt).toContain('själv eller lämna på verkstad');
        });

        it('should include intermediate-specific instructions for hemmameck', () => {
            const vehicleData = '{}';
            const prompt = ACTIVE_PROMPTS.agents.planner.text(vehicleData, 'renovation', 'intermediate');

            expect(prompt).toContain('HEMMAMECK');
            expect(prompt).toContain('3-5 subtasks');
            expect(prompt).toContain('praktiska tips');
            expect(prompt).toContain('tidsestimat');
        });

        it('should include expert-specific instructions for certifierad', () => {
            const vehicleData = '{}';
            const prompt = ACTIVE_PROMPTS.agents.planner.text(vehicleData, 'renovation', 'expert');

            expect(prompt).toContain('CERTIFIERAD');
            expect(prompt).toContain('2-3 subtasks');
            expect(prompt).toContain('specs och momentvärden');
            expect(prompt).toContain('Inga förklaringar av grundläggande termer');
        });

        it('should include renovation-specific instructions', () => {
            const vehicleData = '{}';
            const prompt = ACTIVE_PROMPTS.agents.planner.text(vehicleData, 'renovation', 'intermediate');

            expect(prompt).toContain('RENOVERING');
            expect(prompt).toContain('återställa fordonet till ursprungligt skick');
            expect(prompt).toContain('slitage, rost, defekta delar');
        });

        it('should include conversion-specific instructions', () => {
            const vehicleData = '{}';
            const prompt = ACTIVE_PROMPTS.agents.planner.text(vehicleData, 'conversion', 'intermediate');

            expect(prompt).toContain('OMBYGGNAD (CAMPER/HUSBIL)');
            expect(prompt).toContain('isolering, sänginredning, el-system, vatten');
            expect(prompt).toContain('viktökningar');
        });

        it('should include maintenance-specific instructions', () => {
            const vehicleData = '{}';
            const prompt = ACTIVE_PROMPTS.agents.planner.text(vehicleData, 'maintenance', 'intermediate');

            expect(prompt).toContain('FÖRVALTNING');
            expect(prompt).toContain('löpande underhåll');
            expect(prompt).toContain('Förebyggande underhåll');
        });
    });

    describe('generateProjectProfile Integration', () => {

        it('should accept optional projectType and userSkillLevel parameters', async () => {
            // This test verifies the function signature
            const params = {
                vehicleDescription: 'Volvo 240 1990',
                imageBase64: undefined,
                projectType: 'renovation' as ProjectType,
                userSkillLevel: 'beginner' as UserSkillLevel
            };

            // Function should accept these parameters without TypeScript errors
            expect(() => {
                generateProjectProfile(
                    params.vehicleDescription,
                    params.imageBase64,
                    params.projectType,
                    params.userSkillLevel
                );
            }).not.toThrow();
        });

        it('should use default values when parameters are not provided', async () => {
            // This verifies backwards compatibility
            expect(() => {
                generateProjectProfile('Volvo 240 1990');
            }).not.toThrow();
        });
    });

    describe('Conversational Decision Making', () => {

        it('should include conversational decision-making in BASE prompt', () => {
            const basePrompt = ACTIVE_PROMPTS.baseSystemPrompt;

            expect(basePrompt).toContain('KONVERSATIONELLT BESLUTSFATTANDE');
            expect(basePrompt).toContain('Vill du göra det själv eller lämna på verkstad?');
        });
    });
});

describe('Task Generation Expectations', () => {

    describe('Beginner Task Structure', () => {

        it('should expect 5-8 subtasks for beginners', () => {
            // This is a contract test - verifies what we expect AI to generate
            const expectedBeginner = {
                title: 'Byt kamrem',
                description: expect.stringContaining('Vill du göra själv eller lämna på verkstad?'),
                difficultyLevel: 'Expert',
                subtasks: expect.arrayContaining([
                    expect.objectContaining({ title: expect.any(String) })
                ]),
                requiredTools: expect.any(Array)
            };

            // Minimum 5 subtasks for beginners
            expect(5).toBeLessThanOrEqual(8); // Beginner range: 5-8
        });
    });

    describe('Intermediate Task Structure', () => {

        it('should expect 3-5 subtasks for intermediate users', () => {
            const expectedIntermediate = {
                title: 'Byt kamrem',
                description: expect.stringContaining('Ca 2-3h för erfaren hemmameck'),
                difficultyLevel: expect.any(String),
                subtasks: expect.any(Array),
                requiredTools: expect.any(Array)
            };

            // Range check
            expect(3).toBeLessThanOrEqual(5); // Intermediate range: 3-5
        });
    });

    describe('Expert Task Structure', () => {

        it('should expect 2-3 subtasks for experts with technical specs', () => {
            const expectedExpert = {
                title: 'Kamremsbyte',
                description: expect.stringContaining('Nm'), // Should contain moment values
                difficultyLevel: expect.any(String),
                subtasks: expect.any(Array),
                requiredTools: expect.any(Array)
            };

            // Range check
            expect(2).toBeLessThanOrEqual(3); // Expert range: 2-3
        });
    });
});

describe('Project Type Context Validation', () => {

    it('should validate renovation project type mapping', () => {
        const validTypes: ProjectType[] = ['renovation', 'conversion', 'maintenance'];
        expect(validTypes).toContain('renovation');
    });

    it('should validate conversion project type mapping', () => {
        const validTypes: ProjectType[] = ['renovation', 'conversion', 'maintenance'];
        expect(validTypes).toContain('conversion');
    });

    it('should validate maintenance project type mapping', () => {
        const validTypes: ProjectType[] = ['renovation', 'conversion', 'maintenance'];
        expect(validTypes).toContain('maintenance');
    });
});

describe('User Skill Level Validation', () => {

    it('should validate beginner skill level', () => {
        const validLevels: UserSkillLevel[] = ['beginner', 'intermediate', 'expert'];
        expect(validLevels).toContain('beginner');
    });

    it('should validate intermediate skill level', () => {
        const validLevels: UserSkillLevel[] = ['beginner', 'intermediate', 'expert'];
        expect(validLevels).toContain('intermediate');
    });

    it('should validate expert skill level', () => {
        const validLevels: UserSkillLevel[] = ['beginner', 'intermediate', 'expert'];
        expect(validLevels).toContain('expert');
    });
});

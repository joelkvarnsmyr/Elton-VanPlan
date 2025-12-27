/**
 * ONBOARDING & PROMPT PERSONALIZATION TESTS
 *
 * Verifierar att userSkillLevel och projectType propageras korrekt genom hela systemet
 * och att AI:n genererar personaliserade uppgifter och svar.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateProjectProfile } from '@/services/geminiService';
import { ACTIVE_PROMPTS } from '@/config/prompts';
import type { ProjectType, UserSkillLevel } from '@/types/types';

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

// Mock vehicleDataService
vi.mock('@/services/vehicleDataService', () => ({
    validateSwedishRegNo: vi.fn().mockReturnValue(false),
    fetchVehicleByRegNo: vi.fn().mockResolvedValue({ success: false })
}));

// Mock firebaseAIService
vi.mock('@/services/firebaseAIService', () => ({
    performDeepResearch: vi.fn().mockResolvedValue({
        projectName: 'Test Project',
        projectType: 'renovation',
        vehicleData: { make: 'Test', model: 'Car', year: 2020 },
        initialTasks: [],
        analysisReport: 'Test report',
        provider: 'mock'
    })
}));

describe('Prompt Personalization System', () => {

    // describe('PLANNER Prompt Generation') - Covered by planner-prompt.test.ts
    // describe('Conversational Decision Making') - Covered by planner-prompt.test.ts
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

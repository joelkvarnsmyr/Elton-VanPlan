/**
 * ONBOARDING SERVICE TESTS (Nivå 2: Integration)
 *
 * Verifierar att `onboardingService` kan hantera svar (och fel) från AI-tjänsten.
 *
 * MOCKING:
 * - `generateJSON` från `aiService` är helt mockad. Vi testar inte den riktiga AI:n.
 * - `expertAnalysisService` är också mockad för att isolera testningen till `onboardingService`.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateCompleteOnboarding } from '@/services/onboardingService';
import type { OnboardingInput } from '@/services/onboardingService';
import * as aiService from '@/services/aiService';
import * as expertAnalysisService from '@/services/expertAnalysisService';
import { TaskStatus } from '@/types/types';

// Mocka hela moduler
vi.mock('@/services/aiService');
vi.mock('@/services/expertAnalysisService');

describe('Onboarding Service Integration Tests', () => {

    const mockInput: OnboardingInput = {
        projectType: 'renovation',
        vehicleData: {
            make: 'Volvo',
            model: '240',
            year: 1990,
        },
        userInput: 'Min gamla 240 har rost i skärmarna.'
    };

    // Återställ mocks före varje test
    beforeEach(() => {
        vi.resetAllMocks();

        // Standard mock för expertanalys (returnerar tomma objekt)
        vi.spyOn(expertAnalysisService, 'generateExpertAnalysis').mockResolvedValue({
            commonFaults: [],
            modificationTips: [],
            maintenanceNotes: ''
        });
        vi.spyOn(expertAnalysisService, 'generateMaintenanceData').mockResolvedValue({});
    });

    it('should handle a perfect AI response ("Happy Path")', async () => {
        // --- Arrange ---
        const mockAiResponse = {
            articles: [
                { id: 'art-1', title: 'Testartikel', content: 'Innehåll', tags: ['Test'], summary: '...' }
            ],
            tasks: [
                { id: 'task-1', title: 'Byt olja', phase: 'Fas 1: Planering', priority: 'Hög', subtasks: [{title: 'Köp olja', completed: false}] }
            ],
            items: [
                { name: 'Motorolja 10W-40', category: 'Kemi & Färg', estimatedCost: 500 }
            ],
            links: [
                { category: 'Forum', title: 'Volvo Forum', url: 'https://forum.example.com' }
            ]
        };

        // Mocka `generateJSON` för varje anrop den kommer göra
        const mockedGenerateJson = vi.spyOn(aiService, 'generateJSON');
        mockedGenerateJson
            .mockResolvedValueOnce({ data: { articles: mockAiResponse.articles }, provider: 'mock' }) // För knowledge base
            .mockResolvedValueOnce({ data: { tasks: mockAiResponse.tasks }, provider: 'mock' })       // För tasks
            .mockResolvedValueOnce({ data: { items: mockAiResponse.items }, provider: 'mock' })       // För shopping list
            .mockResolvedValueOnce({ data: { links: mockAiResponse.links }, provider: 'mock' });      // För resource links

        // --- Act ---
        const result = await generateCompleteOnboarding(mockInput);

        // --- Assert ---
        expect(result).toBeDefined();
        expect(result.knowledgeBase.length).toBe(1);
        expect(result.knowledgeBase[0].title).toBe('Testartikel');

        expect(result.tasks.length).toBe(1);
        expect(result.tasks[0].title).toBe('Byt olja');
        expect(result.tasks[0].status).toBe(TaskStatus.TODO); // Verifiera att default-värden sätts

        expect(result.shoppingList.length).toBe(1);
        expect(result.shoppingList[0].name).toBe('Motorolja 10W-40');

        expect(result.resourceLinks.length).toBe(1);
        expect(result.resourceLinks[0].title).toBe('Volvo Forum');
    });

    it('should handle AI returning malformed JSON', async () => {
        // --- Arrange ---
        // Mocka `generateJSON` så att den returnerar något som inte är giltig data
        const mockedGenerateJson = vi.spyOn(aiService, 'generateJSON');
        mockedGenerateJson.mockResolvedValue({ data: { articles: "inte en array" }, provider: 'mock' }); // Felaktig datatyp

        // --- Act ---
        const result = await generateCompleteOnboarding(mockInput);

        // --- Assert ---
        expect(result).toBeDefined();
        // Förväntar oss fallback-data eftersom JSON-parsningen internt kommer misslyckas
        expect(result.knowledgeBase.length).toBe(1); // Fallback-artikel
        expect(result.knowledgeBase[0].id).toBe('welcome');
        expect(result.tasks.length).toBe(1); // Fallback-task
        expect(result.tasks[0].id).toBe('fallback-1');
        expect(result.shoppingList).toEqual([]); // Fallback är tom array
    });

    it('should handle network error or AI service failure', async () => {
        // --- Arrange ---
        // Mocka `generateJSON` så att den kastar ett fel
        const mockedGenerateJson = vi.spyOn(aiService, 'generateJSON');
        mockedGenerateJson.mockRejectedValue(new Error('AI service is down'));

        // --- Act ---
        const result = await generateCompleteOnboarding(mockInput);

        // --- Assert ---
        expect(result).toBeDefined();
        // Hela processen ska misslyckas och returnera den övergripande fallback-strukturen
        expect(result.vehicle.make).toBe('Volvo'); // Indata ska finnas kvar
        expect(result.knowledgeBase).toEqual([]);
        expect(result.tasks).toEqual([]);
        expect(result.shoppingList).toEqual([]);
        expect(result.contacts).toEqual([]);
        expect(result.tips).toEqual([]);
        expect(result.resourceLinks).toEqual([]);
    });

    it('should correctly map and enrich task data', async () => {
        // --- Arrange ---
        const mockAiTasks = {
            tasks: [
                {
                    title: "Rostlaga skärmkant",
                    description: "Slipa, spackla, måla",
                    phase: "Fas 2: Kaross",
                    priority: "Hög",
                    estimatedCostMin: 300,
                    estimatedCostMax: 800,
                    subtasks: ["Slipa rent", "Applicera rostomvandlare"]
                }
            ]
        };

        const mockedGenerateJson = vi.spyOn(aiService, 'generateJSON');
        mockedGenerateJson
            .mockResolvedValueOnce({ data: { articles: [] }, provider: 'mock' })
            .mockResolvedValueOnce({ data: mockAiTasks, provider: 'mock' })
            .mockResolvedValueOnce({ data: { items: [] }, provider: 'mock' })
            .mockResolvedValueOnce({ data: { links: [] }, provider: 'mock' });

        // --- Act ---
        const result = await generateCompleteOnboarding(mockInput);

        // --- Assert ---
        expect(result.tasks.length).toBe(1);
        const task = result.tasks[0];

        // Verifiera att data från AI:n mappas korrekt
        expect(task.title).toBe("Rostlaga skärmkant");
        expect(task.phase).toBe("Fas 2: Kaross");
        expect(task.estimatedCostMin).toBe(300);

        // Verifiera att default-värden och struktur sätts korrekt
        expect(task.id).toContain('task-');
        expect(task.status).toBe(TaskStatus.TODO);
        expect(task.actualCost).toBe(0);
        expect(task.subtasks.length).toBe(2);
        expect(task.subtasks[0].completed).toBe(false);
        expect(task.subtasks[0].title).toBe("Slipa rent");
    });
});

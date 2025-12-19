
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('firebase/app', () => ({
    initializeApp: vi.fn(),
}));

vi.mock('firebase/functions', () => ({
    getFunctions: vi.fn(),
    httpsCallable: vi.fn(() => vi.fn()),
}));

vi.mock('firebase/firestore', () => ({
    getFirestore: vi.fn(),
}));

vi.mock('firebase/ai', () => ({
    getAI: vi.fn(),
    getGenerativeModel: vi.fn(),
    GoogleAIBackend: vi.fn()
}));

vi.mock('../firebase', () => ({
    db: {},
    app: {}, // app mock needed for aiProxyService
    functions: {}
}));

vi.mock('../firebaseAIService', () => ({
    performDeepResearch: vi.fn(),
    checkHealth: vi.fn(),
    createModel: vi.fn()
}));

vi.mock('../featureFlagService', () => ({
    getAIModelVersion: vi.fn().mockReturnValue('mock-model-v1'),
    isFeatureEnabled: vi.fn().mockReturnValue(true)
}));

vi.mock('../aiProxyService', () => ({
    sendChatMessage: vi.fn(),
    parseInput: vi.fn(),
    sendToolResponse: vi.fn(),
    createModel: vi.fn()
}));

// Mock @/config/prompts to avoid loading that file (which might depend on other things)
vi.mock('@/config/prompts', () => ({
    ACTIVE_PROMPTS: {
        system: 'mock-system-prompt',
        detective: 'mock-detective-prompt'
    }
}));

// Mock @/constants/constants to avoid loading that file
vi.mock('@/constants/constants', () => ({
    KNOWLEDGE_ARTICLES: [],
    CRITICAL_WARNINGS: []
}));

// Mock @/types/types to avoid issues (though types are usually fine, enums can be tricky)
// Usually not needed for types, but let's be safe if there are values exported
vi.mock('@/types/types', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as object),
        PROJECT_PHASES: { renovation: [], conversion: [], maintenance: [] }
    };
});

// 2. Import module under test
import { parseTasksFromInput, streamGeminiResponse } from '../geminiService';
import * as aiProxyService from '../aiProxyService';

describe('Gemini Service Logic', () => {

    describe('parseTasksFromInput', () => {
        it('should parse valid input successfully', async () => {
            // Setup mock return
            (aiProxyService.parseInput as any).mockResolvedValue({
                tasks: [{ title: 'New Task', description: 'Desc', phase: 'Fas 1' }],
                shoppingItems: []
            });

            const result = await parseTasksFromInput('Fixa hammare');

            expect(result.tasks).toHaveLength(1);
            expect(result.tasks[0].title).toBe('New Task');
        });

        it('should handle errors gracefully', async () => {
            (aiProxyService.parseInput as any).mockRejectedValue(new Error('Fail'));

            const result = await parseTasksFromInput('Crash me');

            expect(result.tasks).toEqual([]);
        });
    });

    describe('streamGeminiResponse', () => {
        const mockCallbacks = {
            onChunk: vi.fn(),
            onToolCall: vi.fn()
        };

        it('should send chat message and stream response', async () => {
            (aiProxyService.sendChatMessage as any).mockResolvedValue({
                text: 'Hello world',
                toolCalls: []
            });

            await streamGeminiResponse(
                [],
                'Hi',
                {} as any,
                [],
                [],
                mockCallbacks.onChunk,
                mockCallbacks.onToolCall
            );

            expect(aiProxyService.sendChatMessage).toHaveBeenCalled();
            // Since we simulate streaming with the full text in the original service:
            expect(mockCallbacks.onChunk).toHaveBeenCalledWith('Hello world');
        });
    });
});

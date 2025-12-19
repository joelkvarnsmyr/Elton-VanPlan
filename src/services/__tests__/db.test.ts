
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    addTask,
    updateTask,
    deleteTask,
    getTasks,
    getProjectsForUser
} from '../db';

// Mock dependencies
const mockAddDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDeleteDoc = vi.fn();
const mockGetDocs = vi.fn();
const mockDoc = vi.fn(() => ({ id: 'mock-doc-ref' }));
const mockCollection = vi.fn(() => ({ id: 'mock-collection-ref' }));
const mockQuery = vi.fn();
const mockWhere = vi.fn();

vi.mock('firebase/firestore', () => ({
    getFirestore: vi.fn(),
    collection: (...args: any[]) => mockCollection(...args), // Return object
    addDoc: (...args: any[]) => mockAddDoc(...args),
    updateDoc: (...args: any[]) => mockUpdateDoc(...args),
    doc: (...args: any[]) => mockDoc(...args), // Return object
    query: (...args: any[]) => mockQuery(...args),
    where: (...args: any[]) => mockWhere(...args),
    getDocs: (...args: any[]) => mockGetDocs(...args),
    deleteDoc: (...args: any[]) => mockDeleteDoc(...args),
    writeBatch: vi.fn(() => ({
        set: vi.fn(),
        commit: vi.fn(),
        delete: vi.fn()
    })),
    onSnapshot: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn()
}));

vi.mock('../firebase', () => ({
    db: {}
}));

describe('Database Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Task Operations', () => {
        const projectId = 'test-project-id';
        const taskData = {
            title: 'Test Task',
            description: 'Test Description',
            status: 'Todo',
            phase: 'Fas 1'
        };

        it('should add a task successfully', async () => {
            const mockRef = { id: 'new-task-id' };
            mockAddDoc.mockResolvedValueOnce(mockRef);

            const result = await addTask(projectId, taskData as any);

            expect(mockCollection).toHaveBeenCalled(); // Should fetch collection ref
            expect(mockAddDoc).toHaveBeenCalledWith(expect.anything(), taskData);
            expect(mockUpdateDoc).toHaveBeenCalledWith(mockRef, { id: 'new-task-id' });
            expect(result).toEqual({ ...taskData, id: 'new-task-id' });
        });

        it('should update a task successfully', async () => {
            const taskId = 'task-1';
            const updates = { status: 'Done' };

            await updateTask(projectId, taskId, updates as any);

            expect(mockDoc).toHaveBeenCalled();
            expect(mockUpdateDoc).toHaveBeenCalledWith(expect.anything(), updates);
        });

        it('should delete a task successfully', async () => {
            const taskId = 'task-1';

            await deleteTask(projectId, taskId);

            expect(mockDoc).toHaveBeenCalled();
            expect(mockDeleteDoc).toHaveBeenCalled();
        });

        it('should get tasks successfully', async () => {
            const mockSnapshot = {
                docs: [
                    { data: () => ({ id: 't1', title: 'Task 1' }) },
                    { data: () => ({ id: 't2', title: 'Task 2' }) }
                ]
            };
            mockGetDocs.mockResolvedValueOnce(mockSnapshot);

            const result = await getTasks(projectId);

            expect(result).toHaveLength(2);
            expect(result[0].id).toBe('t1');
        });
    });

    describe('Project Operations', () => {
        it('should get projects for user', async () => {
            const userId = 'user-123';

            // Mock empty results for all queries to simplify test
            const emptySnap = { size: 0, forEach: vi.fn() };
            mockGetDocs.mockResolvedValue(emptySnap);

            const result = await getProjectsForUser(userId);

            expect(result).toEqual([]);
            expect(mockQuery).toHaveBeenCalled();
        });
    });
});

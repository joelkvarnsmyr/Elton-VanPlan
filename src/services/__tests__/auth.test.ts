
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    loginWithPassword,
    registerWithPassword,
    logout,
    subscribeToAuthChanges
} from '../auth';

// Mock dependencies
const mockSignInWithEmailAndPassword = vi.fn();
const mockCreateUserWithEmailAndPassword = vi.fn();
const mockSignOut = vi.fn();
const mockOnAuthStateChanged = vi.fn();

vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(),
    signInWithEmailAndPassword: (...args: any[]) => mockSignInWithEmailAndPassword(...args),
    createUserWithEmailAndPassword: (...args: any[]) => mockCreateUserWithEmailAndPassword(...args),
    signOut: (...args: any[]) => mockSignOut(...args),
    onAuthStateChanged: (...args: any[]) => mockOnAuthStateChanged(...args),
    // Needed for other imports in the file even if not tested here
    sendSignInLinkToEmail: vi.fn(),
    isSignInWithEmailLink: vi.fn(),
    signInWithEmailLink: vi.fn()
}));

vi.mock('../firebase', () => ({
    auth: {}
}));

describe('Auth Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('loginWithPassword', () => {
        it('should login successfully', async () => {
            const mockUser = { uid: 'user-1', email: 'test@example.com' };
            mockSignInWithEmailAndPassword.mockResolvedValueOnce({ user: mockUser });

            const result = await loginWithPassword('test@example.com', 'password');

            expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'test@example.com', 'password');
            expect(result.success).toBe(true);
            expect(result.user).toEqual(mockUser);
        });

        it('should handle login errors', async () => {
            mockSignInWithEmailAndPassword.mockRejectedValueOnce(new Error('Auth failed'));

            const result = await loginWithPassword('test@example.com', 'wrong');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Auth failed');
        });
    });

    describe('registerWithPassword', () => {
        it('should register successfully', async () => {
            const mockUser = { uid: 'new-user', email: 'new@example.com' };
            mockCreateUserWithEmailAndPassword.mockResolvedValueOnce({ user: mockUser });

            const result = await registerWithPassword('new@example.com', 'password');

            expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'new@example.com', 'password');
            expect(result.success).toBe(true);
            expect(result.user).toEqual(mockUser);
        });

        it('should handle registration errors', async () => {
            mockCreateUserWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/email-already-in-use', message: 'Email taken' });

            const result = await registerWithPassword('existing@example.com', 'password');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Adressen används redan.');
        });
    });

    describe('logout', () => {
        it('should sign out', async () => {
            await logout();
            expect(mockSignOut).toHaveBeenCalled();
        });
    });

    describe('subscribeToAuthChanges', () => {
        it('should setup auth listener', () => {
            const callback = vi.fn();
            subscribeToAuthChanges(callback);
            expect(mockOnAuthStateChanged).toHaveBeenCalledWith(expect.anything(), callback);
        });
    });
});

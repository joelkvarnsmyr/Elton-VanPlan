/**
 * Phase Normalizer
 * 
 * Ensures consistent phase naming across the application.
 * Maps various phase inputs to canonical phase names.
 */

export const CANONICAL_PHASES = {
    'Fas 1: Vår': ['vår', 'spring', 'januari', 'january', 'nu', 'fas 1'],
    'Fas 2: Vår/Sommar': ['sommar', 'summer', 'vår/sommar', 'fas 2'],
    'Fas 3: Höst/Vinter': ['höst', 'vinter', 'fall', 'winter', 'gotland', 'garage', 'fas 3'],
    'Backlog': ['backlog', 'senare', 'framtid', 'future']
} as const;

/**
 * Normalize a phase input string to a canonical phase name
 * 
 * @param input - The phase string to normalize (e.g., "Fas 1 – Nu/Januari")
 * @returns Canonical phase name (e.g., "Fas 1: Vår")
 * 
 * @example
 * normalizePhaseInput("Fas 1 – Nu/Januari (före sommaren)") // "Fas 1: Vår"
 * normalizePhaseInput("Höst/Vinter (Gotland med garage)") // "Fas 3: Höst/Vinter"
 * normalizePhaseInput("Sommar") // "Fas 2: Vår/Sommar"
 */
export function normalizePhaseInput(input: string | undefined): string {
    if (!input) return 'Backlog';

    const lower = input.toLowerCase().trim();

    // Check each canonical phase
    for (const [canonical, keywords] of Object.entries(CANONICAL_PHASES)) {
        if (keywords.some(kw => lower.includes(kw))) {
            return canonical;
        }
    }

    // Fallback to Backlog for unknown phases
    console.warn(`⚠️ Unknown phase "${input}" normalized to Backlog`);
    return 'Backlog';
}

/**
 * Get all canonical phase names
 */
export function getCanonicalPhases(): string[] {
    return Object.keys(CANONICAL_PHASES);
}

/**
 * Check if a phase name is canonical (exact match)
 */
export function isCanonicalPhase(phase: string): boolean {
    return Object.keys(CANONICAL_PHASES).includes(phase);
}

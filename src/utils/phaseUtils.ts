

export const normalizePhase = (phaseStr: string | undefined): { id: string, label: string, order: number } => {
    if (!phaseStr) return { id: 'unknown', label: 'Okänd Fas', order: 99 };

    const p = phaseStr.toLowerCase();

    // Specific mapping for "Backlog"
    if (p.includes('backlog')) return { id: 'backlog', label: 'Backlog', order: 90 };

    // Detect canonical phases - MUST match database exactly
    if (p.includes('fas 1') || p.includes('vår')) return { id: 'p1', label: 'Fas 1: Vår', order: 1 };
    if (p.includes('fas 2') || p.includes('sommar')) return { id: 'p2', label: 'Fas 2: Vår/Sommar', order: 2 };
    if (p.includes('fas 3') || p.includes('höst') || p.includes('vinter')) return { id: 'p3', label: 'Fas 3: Höst/Vinter', order: 3 };

    return { id: 'other', label: phaseStr, order: 80 };
};

export const groupTasksByPhase = (tasks: any[]) => {
    const groups: Record<string, { label: string, order: number, tasks: any[], estimatedCost: number, actualCost: number }> = {};

    tasks.forEach(t => {
        const { id, label, order } = normalizePhase(t.phase);

        if (!groups[id]) {
            groups[id] = { label, order, tasks: [], estimatedCost: 0, actualCost: 0 };
        }

        groups[id].tasks.push(t);

        // Calculate costs
        const est = t.estimatedCostMax ? (t.estimatedCostMin + t.estimatedCostMax) / 2 : (t.estimatedCost || 0);
        groups[id].estimatedCost += est;
        groups[id].actualCost += (t.actualCost || 0);
    });

    return Object.values(groups).sort((a, b) => a.order - b.order);
};

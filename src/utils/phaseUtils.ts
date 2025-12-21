
export const normalizePhase = (phaseStr: string | undefined): { id: string, label: string, order: number } => {
    if (!phaseStr) return { id: 'unknown', label: 'Okänd Fas', order: 99 };

    const p = phaseStr.toLowerCase();

    // Specific mapping for "Backlog"
    if (p.includes('backlog')) return { id: 'backlog', label: 'Backlog', order: 90 };

    // Detect numeric phases
    if (p.includes('fas 1') || p.includes('phase 1')) return { id: 'p1', label: 'Fas 1: Akut & Motor', order: 1 };
    if (p.includes('fas 2') || p.includes('phase 2')) return { id: 'p2', label: 'Fas 2: Kaross & Rost', order: 2 };
    if (p.includes('fas 3') || p.includes('phase 3')) return { id: 'p3', label: 'Fas 3: System & Bygge', order: 3 };
    if (p.includes('fas 4') || p.includes('phase 4')) return { id: 'p4', label: 'Fas 4: Inredning & Finish', order: 4 };
    if (p.includes('fas 0') || p.includes('phase 0')) return { id: 'p0', label: 'Fas 0: Planering', order: 0 };

    // Fallback for seasonal/other phases
    if (p.includes('vår') || p.includes('sommar')) return { id: 'season', label: 'Säsong', order: 10 };
    if (p.includes('höst') || p.includes('vinter')) return { id: 'storage', label: 'Vinterförvaring', order: 11 };

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

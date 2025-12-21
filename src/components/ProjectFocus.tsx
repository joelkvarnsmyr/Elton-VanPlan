import React, { useMemo } from 'react';
import { Project, Task, TaskStatus, Priority, ShoppingItem, ShoppingItemStatus } from '@/types/types';
import { ArrowRight, CheckCircle2, ShoppingBag, Target } from 'lucide-react';

interface ProjectFocusProps {
    project: Project;
    onViewTask: (taskId: string) => void;
    onViewShopping: () => void;
}

// Local helper component for currency
const formatSEK = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 0 }).format(amount);
};

export const ProjectFocus: React.FC<ProjectFocusProps> = ({ project, onViewTask, onViewShopping }) => {
    const { tasks, shoppingItems } = project;

    // 1. Determine Active Phase
    const focus = useMemo(() => {
        // Phases in logical order
        const orderedPhases = [
            'Fas 1: Akut',
            'Fas 2: Mekanisk Säkerhet',
            'Fas 3: Kaross & Rost',
            'Fas 4: Inredning & Finish'
        ];

        // Find the first phase that has tasks which are NOT done
        const activePhase = orderedPhases.find(phase =>
            tasks.some(t => (t.phase || '').startsWith(phase.split(':')[0]) && t.status !== TaskStatus.DONE)
        ) || 'Slutför'; // Fallback

        const phaseTasks = tasks.filter(t => (t.phase || '').startsWith(activePhase.split(':')[0]));
        const phaseDone = phaseTasks.filter(t => t.status === TaskStatus.DONE).length;
        const phaseTotal = phaseTasks.length;
        const phaseProgress = phaseTotal > 0 ? Math.round((phaseDone / phaseTotal) * 100) : 0;

        // 2. Determine Next Task
        // Filter out DONE tasks
        const pendingTasks = tasks.filter(t => t.status !== TaskStatus.DONE);

        // Sort logic: 
        // 1. IN_PROGRESS first
        // 2. High Priority
        // 3. Phase order (current phase tasks first)
        const nextTask = pendingTasks.sort((a, b) => {
            // Status: In Progress > Todo
            if (a.status === TaskStatus.IN_PROGRESS && b.status !== TaskStatus.IN_PROGRESS) return -1;
            if (b.status === TaskStatus.IN_PROGRESS && a.status !== TaskStatus.IN_PROGRESS) return 1;

            // Priority: High > Medium > Low
            const pMap = { [Priority.HIGH]: 3, [Priority.MEDIUM]: 2, [Priority.LOW]: 1 };
            const pA = pMap[a.priority] || 0;
            const pB = pMap[b.priority] || 0;
            if (pA !== pB) return pB - pA; // Descending

            // Belong to active phase?
            const aActive = (a.phase || '').startsWith(activePhase.split(':')[0]) ? 1 : 0;
            const bActive = (b.phase || '').startsWith(activePhase.split(':')[0]) ? 1 : 0;
            if (aActive !== bActive) return bActive - aActive;

            return 0;
        })[0];

        // 3. Determine Next Purchase
        // Unchecked items
        const buyList = shoppingItems.filter(i => !i.checked);

        // Sort:
        // 1. Linked to "Next Task"
        // 2. Status = DECIDED
        // 3. High cost (often important)
        const nextBuy = buyList.sort((a, b) => {
            if (nextTask && a.linkedTaskId === nextTask.id && b.linkedTaskId !== nextTask.id) return -1;
            if (nextTask && b.linkedTaskId === nextTask.id && a.linkedTaskId !== nextTask.id) return 1;

            const sMap: Record<string, number> = { [ShoppingItemStatus.DECIDED]: 3, [ShoppingItemStatus.RESEARCH]: 2 };
            const sA = sMap[a.status || ''] || 0;
            const sB = sMap[b.status || ''] || 0;
            if (sA !== sB) return sB - sA;

            return (b.estimatedCost || 0) - (a.estimatedCost || 0);
        })[0];

        return { activePhase, phaseProgress, nextTask, nextBuy };
    }, [tasks, shoppingItems]);

    if (!focus.nextTask && !focus.nextBuy) return null; // Nothing to show?

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* CARD 1: ACTIVE PHASE */}
            <div className="bg-nordic-charcoal dark:bg-nordic-dark-surface text-nordic-ice p-6 rounded-3xl shadow-sm flex flex-col justify-between h-full relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <div>
                    <div className="flex items-center gap-2 mb-2 text-teal-400">
                        <Target size={18} />
                        <span className="text-xs font-bold uppercase tracking-widest">Nuvarande Fokus</span>
                    </div>
                    <h3 className="text-2xl font-serif font-bold mb-1">{focus.activePhase}</h3>
                    <p className="text-sm text-slate-400">
                        {focus.phaseProgress === 100 ? 'Färdigt! Dags för nästa fas.' : `${focus.phaseProgress}% slutfört av fasen`}
                    </p>
                </div>

                <div className="mt-6">
                    <div className="w-full bg-slate-700/50 rounded-full h-2 mb-2 overflow-hidden">
                        <div
                            className="bg-teal-500 h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${focus.phaseProgress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* CARD 2: NEXT TASK */}
            <div
                onClick={() => focus.nextTask && onViewTask(focus.nextTask.id)}
                className="bg-white dark:bg-nordic-dark-surface p-6 rounded-3xl shadow-sm border border-nordic-ice dark:border-nordic-dark-bg cursor-pointer hover:shadow-md transition-all group relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-2 h-full bg-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="flex flex-col h-full justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-rose-500">
                                <CheckCircle2 size={18} />
                                <span className="text-xs font-bold uppercase tracking-widest">Nästa Uppgift</span>
                            </div>
                            {focus.nextTask?.priority === Priority.HIGH && (
                                <span className="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-200 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Prio</span>
                            )}
                        </div>

                        {focus.nextTask ? (
                            <>
                                <h3 className="text-xl font-bold text-nordic-charcoal dark:text-nordic-ice mb-2 line-clamp-2 group-hover:text-rose-600 transition-colors">
                                    {focus.nextTask.title}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-nordic-dark-muted line-clamp-2 mb-4">
                                    {focus.nextTask.description}
                                </p>
                            </>
                        ) : (
                            <p className="text-slate-400 italic">Inga uppgifter kvar!</p>
                        )}
                    </div>

                    <div className="flex items-center text-sm font-medium text-slate-400 group-hover:text-rose-500 transition-colors">
                        Öppna uppgift <ArrowRight size={16} className="ml-1" />
                    </div>
                </div>
            </div>

            {/* CARD 3: NEXT PURCHASE */}
            <div
                onClick={onViewShopping}
                className="bg-white dark:bg-nordic-dark-surface p-6 rounded-3xl shadow-sm border border-nordic-ice dark:border-nordic-dark-bg cursor-pointer hover:shadow-md transition-all group relative"
            >
                <div className="flex flex-col h-full justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-nordic-blue-dark dark:text-blue-400 mb-3">
                            <ShoppingBag size={18} />
                            <span className="text-xs font-bold uppercase tracking-widest">Nästa Inköp</span>
                        </div>

                        {focus.nextBuy ? (
                            <>
                                <h3 className="text-xl font-bold text-nordic-charcoal dark:text-nordic-ice mb-2 group-hover:text-nordic-blue-dark transition-colors">
                                    {focus.nextBuy.name}
                                </h3>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl font-serif font-bold text-slate-700 dark:text-white">
                                        {focus.nextBuy.estimatedCost ? formatSEK(focus.nextBuy.estimatedCost) : '-'}
                                    </span>
                                    {focus.nextBuy.status === ShoppingItemStatus.DECIDED && (
                                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Köpredo</span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400">
                                    {focus.nextBuy.linkedTaskId && focus.nextTask && focus.nextBuy.linkedTaskId === focus.nextTask.id
                                        ? "Behövs för nästa uppgift!"
                                        : "Prioriterat inköp"}
                                </p>
                            </>
                        ) : (
                            <p className="text-slate-400 italic">Inget att handla just nu.</p>
                        )}
                    </div>

                    <div className="flex items-center text-sm font-medium text-slate-400 group-hover:text-nordic-blue-dark transition-colors">
                        Gå till inköpslistan <ArrowRight size={16} className="ml-1" />
                    </div>
                </div>
            </div>
        </div>
    );
};

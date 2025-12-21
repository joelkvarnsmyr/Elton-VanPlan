import React, { useMemo } from 'react';
import { Task, TaskStatus, Project } from '@/types/types';
import { groupTasksByPhase } from '@/utils/phaseUtils';
import { CheckCircle2, Circle, ArrowRight, Coins, AlertCircle } from 'lucide-react';

interface ProjectRoadmapProps {
    tasks: Task[];
    onPhaseClick?: (phaseId: string) => void;
    activePhaseId?: string; // If parent wants to control/highlight one
}

const formatSEK = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 0 }).format(amount);
};

export const ProjectRoadmap: React.FC<ProjectRoadmapProps> = ({ tasks, onPhaseClick, activePhaseId }) => {

    // 1. Group Data
    const phases = useMemo(() => groupTasksByPhase(tasks), [tasks]);

    // 2. Identify Current Active Phase (First non-complete)
    const currentPhaseIndex = phases.findIndex(p => {
        const total = p.tasks.length;
        const done = p.tasks.filter(t => t.status === TaskStatus.DONE).length;
        return done < total;
    });

    // If all done, maybe highlight the last one or show a "Done" state? 
    // Default to the found index or 0 if none found (e.g. empty project)
    const activeIndex = currentPhaseIndex === -1 ? phases.length - 1 : currentPhaseIndex;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-xl text-nordic-charcoal dark:text-nordic-ice">Projektets Resa</h3>
                <span className="text-xs text-slate-400">Överblick & Ekonomi</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {phases.map((phase, idx) => {
                    const totalTasks = phase.tasks.length;
                    const completedTasks = phase.tasks.filter(t => t.status === TaskStatus.DONE).length;
                    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                    const isCurrent = idx === activeIndex;
                    const isPast = idx < activeIndex;
                    const isFuture = idx > activeIndex;

                    return (
                        <div
                            key={phase.label}
                            onClick={() => onPhaseClick && onPhaseClick(phase.label)}
                            className={`
                                relative p-6 rounded-3xl border transition-all duration-300 group cursor-pointer
                                ${isCurrent
                                    ? 'bg-white dark:bg-nordic-dark-surface border-teal-500 shadow-md ring-1 ring-teal-500/20'
                                    : 'bg-white dark:bg-nordic-dark-surface border-nordic-ice dark:border-nordic-dark-bg hover:shadow-md'
                                }
                                ${isPast ? 'opacity-70 grayscale-[0.5] hover:opacity-100' : ''}
                            `}
                        >
                            {/* Connector Line (except for last item) */}
                            {idx !== phases.length - 1 && (
                                <div className="absolute left-9 bottom-0 translate-y-full w-0.5 h-4 bg-nordic-ice dark:bg-nordic-charcoal -z-10"></div>
                            )}

                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">

                                {/* Status Icon */}
                                <div className={`
                                    w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-bold text-lg
                                    ${isCurrent
                                        ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                                        : isPast
                                            ? 'bg-green-100 text-green-600 dark:bg-green-900/20'
                                            : 'bg-slate-100 text-slate-400 dark:bg-nordic-charcoal'
                                    }
                                `}>
                                    {isPast ? <CheckCircle2 size={24} /> : (isCurrent ? (idx + 1) : <Circle size={24} />)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className={`font-bold text-lg truncate ${isCurrent ? 'text-nordic-charcoal dark:text-nordic-ice' : 'text-slate-600 dark:text-slate-400'}`}>
                                            {phase.label}
                                        </h4>
                                        {isCurrent && (
                                            <span className="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                                Pågående
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-nordic-dark-muted">
                                        <span>{completedTasks} av {totalTasks} uppgifter</span>
                                        <div className="w-24 h-1.5 bg-slate-100 dark:bg-nordic-charcoal rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${isPast ? 'bg-green-500' : 'bg-teal-500'}`} style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Economics */}
                                <div className="flex items-center gap-6 sm:border-l sm:border-slate-100 sm:dark:border-nordic-charcoal sm:pl-6 pt-4 sm:pt-0 mt-2 sm:mt-0 border-t border-slate-50 dark:border-nordic-charcoal">
                                    <div className="min-w-[100px]">
                                        <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">Estimat</p>
                                        <p className="font-mono font-medium text-slate-600 dark:text-slate-300">{formatSEK(phase.estimatedCost)}</p>
                                    </div>
                                    <div className="min-w-[100px]">
                                        <p className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">Utfall</p>
                                        <div className="flex items-center gap-1.5">
                                            <p className={`font-mono font-bold ${phase.actualCost > phase.estimatedCost * 1.1 ? 'text-rose-500' : 'text-nordic-charcoal dark:text-nordic-ice'}`}>
                                                {formatSEK(phase.actualCost)}
                                            </p>
                                            {phase.actualCost > phase.estimatedCost * 1.1 && <AlertCircle size={12} className="text-rose-500" />}
                                        </div>
                                    </div>
                                    <div className="hidden sm:block text-slate-300 group-hover:text-teal-500 transition-colors">
                                        <ArrowRight size={20} />
                                    </div>
                                </div>

                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

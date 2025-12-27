import React, { useMemo } from 'react';
import { Project, Task } from '@/types/types';
import { Target, Wallet, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';

interface GoalsDashboardProps {
    project: Project;
    tasks: Task[];
}

/**
 * Goals Dashboard Component (V2MOM-inspired)
 * 
 * Displays strategic project information:
 * - Vision (the "why")
 * - Principles (guiding values)
 * - Budget progress
 * - Deadline countdown
 * - Task completion rate
 */
export const GoalsDashboard: React.FC<GoalsDashboardProps> = ({ project, tasks }) => {
    // Calculate metrics
    const metrics = useMemo(() => {
        const totalSpent = tasks.reduce((sum, t) => sum + (t.actualCost || 0), 0);
        const completedTasks = tasks.filter(t => t.status === 'Klart').length;
        const totalTasks = tasks.length;

        // Days to deadline
        let daysToDeadline: number | null = null;
        if (project.deadline) {
            const deadline = new Date(project.deadline);
            const today = new Date();
            daysToDeadline = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        }

        // Budget percentage
        const budgetPercentage = project.budgetCap
            ? Math.min(100, (totalSpent / project.budgetCap) * 100)
            : 0;

        // Task completion percentage
        const completionPercentage = totalTasks > 0
            ? (completedTasks / totalTasks) * 100
            : 0;

        return {
            totalSpent,
            completedTasks,
            totalTasks,
            daysToDeadline,
            budgetPercentage,
            completionPercentage,
            isOverBudget: project.budgetCap ? totalSpent > project.budgetCap : false,
            isOverdue: daysToDeadline !== null && daysToDeadline < 0
        };
    }, [project, tasks]);

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 0 }).format(amount);
    };

    // Progress bar color based on value
    const getProgressColor = (percentage: number, isWarning: boolean = false) => {
        if (isWarning) return percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-amber-500' : 'bg-teal-500';
        return 'bg-teal-500';
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            {/* Vision */}
            {project.vision && (
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-teal-500" />
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Vision</h3>
                    </div>
                    <p className="text-lg font-medium text-slate-800 dark:text-white">
                        {project.vision}
                    </p>
                </div>
            )}

            {/* Progress Bars */}
            <div className="space-y-4 mb-6">
                {/* Budget */}
                {project.budgetCap && (
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2">
                                <Wallet className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Budget</span>
                            </div>
                            <span className={`text-sm font-bold ${metrics.isOverBudget ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`}>
                                {formatCurrency(metrics.totalSpent)} / {formatCurrency(project.budgetCap)}
                            </span>
                        </div>
                        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${getProgressColor(metrics.budgetPercentage, true)} transition-all duration-500`}
                                style={{ width: `${metrics.budgetPercentage}%` }}
                            />
                        </div>
                        {metrics.isOverBudget && (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Budget överskriden med {formatCurrency(metrics.totalSpent - project.budgetCap)}
                            </p>
                        )}
                    </div>
                )}

                {/* Deadline */}
                {project.deadline && (
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Deadline</span>
                            </div>
                            <span className={`text-sm font-bold ${metrics.isOverdue ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`}>
                                {metrics.daysToDeadline !== null && (
                                    metrics.daysToDeadline >= 0
                                        ? `${metrics.daysToDeadline} dagar kvar`
                                        : `${Math.abs(metrics.daysToDeadline)} dagar försenat`
                                )}
                            </span>
                        </div>
                        <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            {/* Visual representation: assume 365 days max for visualization */}
                            <div
                                className={`h-full ${metrics.isOverdue ? 'bg-red-500' : 'bg-blue-500'} transition-all duration-500`}
                                style={{ width: `${Math.max(0, 100 - (metrics.daysToDeadline || 0) / 3.65)}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Task Progress */}
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Uppgifter</span>
                        </div>
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                            {metrics.completedTasks} / {metrics.totalTasks} klara
                        </span>
                    </div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 transition-all duration-500"
                            style={{ width: `${metrics.completionPercentage}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Principles */}
            {project.principles && project.principles.length > 0 && (
                <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        📌 Principer
                    </h4>
                    <ul className="space-y-1">
                        {project.principles.map((principle, idx) => (
                            <li key={idx} className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                                {principle}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Empty state */}
            {!project.vision && !project.budgetCap && !project.deadline && (
                <div className="text-center py-4 text-slate-400">
                    <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Inga projektmål satta ännu.</p>
                    <p className="text-xs mt-1">Sätt vision, budget och deadline för att se framsteg.</p>
                </div>
            )}
        </div>
    );
};

export default GoalsDashboard;

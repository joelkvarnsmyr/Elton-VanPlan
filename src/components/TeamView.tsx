import React, { useMemo } from 'react';
import { Task, TaskStatus } from '@/types/types';
import { User, Bot, Users, HelpCircle, ChevronRight } from 'lucide-react';

interface TeamViewProps {
    tasks: Task[];
    onTaskClick?: (task: Task) => void;
}

interface Assignee {
    id: string;
    label: string;
    icon: React.ReactNode;
    color: string;
}

const ASSIGNEES: Assignee[] = [
    { id: 'user1', label: 'Jag', icon: <User size={18} />, color: 'bg-blue-500' },
    { id: 'partner', label: 'Partner', icon: <Users size={18} />, color: 'bg-purple-500' },
    { id: 'ai', label: 'Elton', icon: <Bot size={18} />, color: 'bg-teal-500' },
    { id: '', label: 'Ej tilldelad', icon: <HelpCircle size={18} />, color: 'bg-slate-400' },
];

/**
 * TeamView Component (Flight Level 2 - Coordination)
 * 
 * Swimlane visualization showing who's working on what.
 * Enables team coordination by making work distribution visible.
 */
export const TeamView: React.FC<TeamViewProps> = ({ tasks, onTaskClick }) => {
    // Group tasks by assignee
    const tasksByAssignee = useMemo(() => {
        const groups: Record<string, Task[]> = {};

        ASSIGNEES.forEach(a => {
            groups[a.id] = [];
        });

        tasks.forEach(task => {
            const assigneeId = task.assignedTo || '';
            if (groups[assigneeId]) {
                groups[assigneeId].push(task);
            } else {
                groups[''].push(task); // Unassigned
            }
        });

        return groups;
    }, [tasks]);

    // Calculate stats
    const getStats = (assigneeTasks: Task[]) => {
        const inProgress = assigneeTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
        const done = assigneeTasks.filter(t => t.status === TaskStatus.DONE).length;
        const todo = assigneeTasks.filter(t => t.status === TaskStatus.TODO).length;
        return { inProgress, done, todo, total: assigneeTasks.length };
    };

    // Status color
    const getStatusBadge = (status: TaskStatus) => {
        switch (status) {
            case TaskStatus.DONE: return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case TaskStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case TaskStatus.TODO: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
            default: return 'bg-slate-100 text-slate-500';
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Users className="text-teal-500" size={20} />
                    Teamöversikt (Flight Level 2)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                    Vem gör vad? Se arbetsfördelningen i realtid.
                </p>
            </div>

            {/* Swimlanes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x divide-slate-200 dark:divide-slate-700">
                {ASSIGNEES.map(assignee => {
                    const assigneeTasks = tasksByAssignee[assignee.id] || [];
                    const stats = getStats(assigneeTasks);
                    const hasWIPWarning = stats.inProgress > 3;

                    return (
                        <div key={assignee.id} className="flex flex-col">
                            {/* Swimlane Header */}
                            <div className={`p-4 ${assignee.color} bg-opacity-10 dark:bg-opacity-20 border-b border-slate-200 dark:border-slate-700`}>
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-lg ${assignee.color} text-white`}>
                                        {assignee.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-white">
                                            {assignee.label}
                                        </h3>
                                        <div className="flex gap-2 text-xs">
                                            <span className="text-blue-600 dark:text-blue-400">
                                                {stats.inProgress} pågående
                                            </span>
                                            <span className="text-green-600 dark:text-green-400">
                                                {stats.done} klara
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* WIP Warning */}
                                {hasWIPWarning && (
                                    <div className="mt-2 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-lg">
                                        ⚠️ Hög arbetsbelastning ({stats.inProgress} pågående)
                                    </div>
                                )}
                            </div>

                            {/* Tasks */}
                            <div className="p-3 space-y-2 flex-1 min-h-[200px] bg-slate-50/50 dark:bg-slate-900/30">
                                {assigneeTasks.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic text-center py-8">
                                        Inga uppgifter
                                    </p>
                                ) : (
                                    assigneeTasks.slice(0, 8).map(task => (
                                        <button
                                            key={task.id}
                                            onClick={() => onTaskClick?.(task)}
                                            className="w-full text-left p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-500 transition-all hover:shadow-sm group"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-200 line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                                                    {task.title}
                                                </h4>
                                                <ChevronRight size={14} className="text-slate-300 group-hover:text-teal-500 flex-shrink-0 mt-0.5" />
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${getStatusBadge(task.status)}`}>
                                                    {task.status === TaskStatus.IN_PROGRESS ? 'Pågår' :
                                                        task.status === TaskStatus.DONE ? 'Klart' : 'Att göra'}
                                                </span>
                                                <span className="text-[10px] text-slate-400 truncate">
                                                    {task.phase}
                                                </span>
                                            </div>
                                            {/* Hill position indicator */}
                                            {task.hillPosition !== undefined && (
                                                <div className="mt-2 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-amber-400 via-green-400 to-blue-400"
                                                        style={{ width: `${task.hillPosition}%` }}
                                                    />
                                                </div>
                                            )}
                                        </button>
                                    ))
                                )}
                                {assigneeTasks.length > 8 && (
                                    <p className="text-xs text-center text-slate-400">
                                        +{assigneeTasks.length - 8} fler uppgifter
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TeamView;

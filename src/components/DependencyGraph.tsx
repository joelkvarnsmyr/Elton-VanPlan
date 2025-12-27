import React, { useMemo } from 'react';
import { Task } from '@/types/types';
import { GitBranch, AlertCircle } from 'lucide-react';

interface DependencyGraphProps {
    tasks: Task[];
    onTaskClick?: (task: Task) => void;
    selectedPhase?: string;
}

interface Node {
    id: string;
    title: string;
    status: string;
    phase: string;
    blockedBy: string[];
    isBlocked: boolean;
    blocksCount: number;
}

/**
 * Dependency Graph Component
 * 
 * Visualizes task dependencies/blockers as a flow diagram.
 * Highlights critical paths and blocked tasks.
 */
export const DependencyGraph: React.FC<DependencyGraphProps> = ({
    tasks,
    onTaskClick,
    selectedPhase
}) => {
    // Build dependency graph
    const { nodes, edges, criticalTasks } = useMemo(() => {
        const filteredTasks = selectedPhase
            ? tasks.filter(t => t.phase === selectedPhase)
            : tasks;

        // Create nodes
        const nodeMap = new Map<string, Node>();
        filteredTasks.forEach(task => {
            const blockerIds = task.blockers?.map(b => b.taskId) || [];
            nodeMap.set(task.id, {
                id: task.id,
                title: task.title,
                status: task.status,
                phase: task.phase,
                blockedBy: blockerIds,
                isBlocked: blockerIds.length > 0,
                blocksCount: 0
            });
        });

        // Count how many tasks each task blocks
        nodeMap.forEach(node => {
            node.blockedBy.forEach(blockerId => {
                const blocker = nodeMap.get(blockerId);
                if (blocker) {
                    blocker.blocksCount++;
                }
            });
        });

        // Create edges
        const edgesList: Array<{ from: string; to: string; reason?: string }> = [];
        filteredTasks.forEach(task => {
            task.blockers?.forEach(blocker => {
                if (nodeMap.has(blocker.taskId)) {
                    edgesList.push({
                        from: blocker.taskId,
                        to: task.id,
                        reason: blocker.reason
                    });
                }
            });
        });

        // Find critical tasks (most blocksCount + not done)
        const critical = Array.from(nodeMap.values())
            .filter(n => n.blocksCount > 0 && n.status !== 'Klart')
            .sort((a, b) => b.blocksCount - a.blocksCount)
            .slice(0, 3);

        return {
            nodes: Array.from(nodeMap.values()),
            edges: edgesList,
            criticalTasks: critical
        };
    }, [tasks, selectedPhase]);

    // Status to color mapping
    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'Klart': return 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'Pågående': return 'bg-amber-100 border-amber-500 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'Blockerad': return 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-slate-100 border-slate-400 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
        }
    };

    // Separate blocked and independent tasks
    const blockedTasks = nodes.filter(n => n.isBlocked);
    const blockingTasks = nodes.filter(n => n.blocksCount > 0);
    const independentTasks = nodes.filter(n => !n.isBlocked && n.blocksCount === 0);

    const findTask = (id: string) => tasks.find(t => t.id === id);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-teal-500" />
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                        Beroenden
                    </h3>
                </div>
                <span className="text-sm text-slate-500">
                    {edges.length} beroenden
                </span>
            </div>

            {/* Critical Path Warning */}
            {criticalTasks.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-2">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-bold">Kritiska blockerare</span>
                    </div>
                    <div className="space-y-1">
                        {criticalTasks.map(task => (
                            <button
                                key={task.id}
                                onClick={() => {
                                    const t = findTask(task.id);
                                    if (t) onTaskClick?.(t);
                                }}
                                className="block text-sm text-red-600 dark:text-red-300 hover:underline"
                            >
                                ⚠️ {task.title} (blockerar {task.blocksCount} uppgifter)
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Dependency Chains */}
            {edges.length > 0 ? (
                <div className="space-y-3">
                    {/* Show blocking relationships */}
                    {blockingTasks.map(blocker => {
                        const dependents = blockedTasks.filter(t =>
                            t.blockedBy.includes(blocker.id)
                        );
                        if (dependents.length === 0) return null;

                        return (
                            <div key={blocker.id} className="flex items-center gap-2 flex-wrap">
                                {/* Blocker node */}
                                <button
                                    onClick={() => {
                                        const t = findTask(blocker.id);
                                        if (t) onTaskClick?.(t);
                                    }}
                                    className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all hover:scale-105 ${getStatusColor(blocker.status)}`}
                                >
                                    {blocker.title.substring(0, 25)}{blocker.title.length > 25 ? '...' : ''}
                                </button>

                                {/* Arrow */}
                                <span className="text-slate-400">→</span>

                                {/* Dependent nodes */}
                                {dependents.map((dep, idx) => (
                                    <React.Fragment key={dep.id}>
                                        {idx > 0 && <span className="text-slate-300">,</span>}
                                        <button
                                            onClick={() => {
                                                const t = findTask(dep.id);
                                                if (t) onTaskClick?.(t);
                                            }}
                                            className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all hover:scale-105 ${getStatusColor(dep.status)}`}
                                        >
                                            {dep.title.substring(0, 25)}{dep.title.length > 25 ? '...' : ''}
                                        </button>
                                    </React.Fragment>
                                ))}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-8 text-slate-400">
                    <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Inga beroenden definierade.</p>
                    <p className="text-xs mt-1">Lägg till blockers på uppgifter för att se beroendekedjan.</p>
                </div>
            )}

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-4 text-xs">
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-green-500" /> Klart
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-amber-500" /> Pågående
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-red-500" /> Blockerat
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-slate-400" /> Att göra
                </span>
            </div>
        </div>
    );
};

export default DependencyGraph;

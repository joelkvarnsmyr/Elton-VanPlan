import React from 'react';
import { Task } from '@/types/types';

interface HillChartProps {
    tasks: Task[];
    onTaskClick?: (task: Task) => void;
    onHillPositionChange?: (taskId: string, newPosition: number) => void;
    selectedPhase?: string; // Filter by phase
}

/**
 * Hill Chart Component (Shape Up methodology)
 * 
 * Visualizes task uncertainty/progress on a hill curve:
 * - Left side (0-49): "Figuring it out" - problem solving, unknowns
 * - Peak (50): "We know what to do" - solution is clear
 * - Right side (51-100): "Getting it done" - execution, known work
 * 
 * Unlike % complete, this shows WHERE in the problem-solving process each task is.
 */
export const HillChart: React.FC<HillChartProps> = ({
    tasks,
    onTaskClick,
    onHillPositionChange,
    selectedPhase
}) => {
    // Filter tasks that have hill positions
    const tasksWithHill = tasks.filter(t =>
        t.hillPosition !== undefined &&
        t.hillPosition !== null &&
        (!selectedPhase || t.phase === selectedPhase)
    );

    // SVG dimensions
    const width = 600;
    const height = 200;
    const padding = 40;
    const hillHeight = 120;

    // Calculate hill curve points (quadratic bezier approximation)
    const hillPath = `
        M ${padding} ${height - padding}
        Q ${width / 2} ${height - padding - hillHeight} ${width - padding} ${height - padding}
    `;

    // Convert hillPosition (0-100) to x coordinate on the curve
    const positionToX = (position: number): number => {
        const usableWidth = width - 2 * padding;
        return padding + (position / 100) * usableWidth;
    };

    // Calculate y position on the hill curve for a given x
    const getYOnCurve = (position: number): number => {
        // Quadratic curve: highest at 50, lowest at 0 and 100
        const normalizedPos = position / 100; // 0 to 1
        const curveHeight = 4 * hillHeight * normalizedPos * (1 - normalizedPos);
        return height - padding - curveHeight;
    };

    // Get color based on status
    const getTaskColor = (task: Task): string => {
        if (task.status === 'Klart') return '#10b981'; // green
        if (task.status === 'Pågående') return '#f59e0b'; // amber
        if (task.status === 'Blockerad') return '#ef4444'; // red
        return '#6366f1'; // indigo for todo/idea
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                        Hill Chart
                    </h3>
                    <p className="text-xs text-slate-500">
                        Vänster = Problem | Toppen = Löst | Höger = Exekvering
                    </p>
                </div>
                <div className="text-sm text-slate-500">
                    {tasksWithHill.length} uppgifter
                </div>
            </div>

            {/* SVG Hill Chart */}
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto"
                style={{ maxHeight: '250px' }}
            >
                {/* Grid lines */}
                <line
                    x1={width / 2} y1={padding}
                    x2={width / 2} y2={height - padding}
                    stroke="#e2e8f0"
                    strokeDasharray="4 4"
                />

                {/* Hill curve (background) */}
                <path
                    d={hillPath}
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="2"
                />

                {/* Hill fill gradient */}
                <defs>
                    <linearGradient id="hillGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.5" />
                        <stop offset="50%" stopColor="#d1fae5" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#dbeafe" stopOpacity="0.5" />
                    </linearGradient>
                </defs>
                <path
                    d={`${hillPath} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`}
                    fill="url(#hillGradient)"
                />

                {/* Labels */}
                <text x={padding + 20} y={height - 10} className="text-xs fill-slate-400">
                    Utforskar
                </text>
                <text x={width / 2 - 20} y={height - padding - hillHeight - 10} className="text-xs fill-slate-400">
                    Lösning klar
                </text>
                <text x={width - padding - 70} y={height - 10} className="text-xs fill-slate-400">
                    Exekverar
                </text>

                {/* Task dots */}
                {tasksWithHill.map((task, index) => {
                    const x = positionToX(task.hillPosition!);
                    const y = getYOnCurve(task.hillPosition!);
                    const color = getTaskColor(task);

                    return (
                        <g
                            key={task.id}
                            className="cursor-pointer transition-transform hover:scale-110"
                            onClick={() => onTaskClick?.(task)}
                        >
                            {/* Shadow */}
                            <circle
                                cx={x}
                                cy={y + 2}
                                r={10}
                                fill="rgba(0,0,0,0.1)"
                            />
                            {/* Dot */}
                            <circle
                                cx={x}
                                cy={y}
                                r={8}
                                fill={color}
                                stroke="white"
                                strokeWidth="2"
                            />
                            {/* Tooltip on hover (using title for simplicity) */}
                            <title>{task.title} ({task.hillPosition}%)</title>
                        </g>
                    );
                })}
            </svg>

            {/* Legend */}
            {tasksWithHill.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {tasksWithHill.slice(0, 6).map(task => (
                        <button
                            key={task.id}
                            onClick={() => onTaskClick?.(task)}
                            className="text-xs px-2 py-1 rounded-full border hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            style={{ borderColor: getTaskColor(task), color: getTaskColor(task) }}
                        >
                            {task.title.substring(0, 20)}{task.title.length > 20 ? '...' : ''}
                        </button>
                    ))}
                    {tasksWithHill.length > 6 && (
                        <span className="text-xs text-slate-400 py-1">
                            +{tasksWithHill.length - 6} till
                        </span>
                    )}
                </div>
            )}

            {/* Empty state */}
            {tasksWithHill.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                    <p className="text-sm">Inga uppgifter har Hill-position ännu.</p>
                    <p className="text-xs mt-1">Elton kan sätta position när du skapar uppgifter.</p>
                </div>
            )}
        </div>
    );
};

export default HillChart;

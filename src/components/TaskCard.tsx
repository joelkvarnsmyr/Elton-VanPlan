import React, { useState, useRef, useEffect } from 'react';
import { Task, TaskStatus, Priority, TaskType, DifficultyLevel } from '@/types/types';
import { Check, AlertCircle, MessageSquare, Paperclip, Link as LinkIcon, ListChecks, CalendarClock, Lock, ShoppingCart, Wrench, FileText, Brain, Lightbulb, Scan } from 'lucide-react';

export interface TaskCardProps {
    task: Task;
    tasks: Task[];
    onClick: (task: Task) => void;
    onUpdateTask: (task: Task) => void;
    isTaskBlocked: (task: Task, allTasks: Task[]) => { blocked: boolean; blockedBy: Task[] };
    getTaskTypeInfo: (type?: TaskType) => { icon: React.ElementType; color: string; label: string };
    getDifficultyInfo: (level?: DifficultyLevel) => { color: string; label: string; icon?: React.ReactNode };
    getPriorityColor: (priority?: Priority) => string;
    getStatusColor: (status: TaskStatus) => string;
    style?: React.CSSProperties;
    isDragging?: boolean;
    dragAttributes?: any;
    dragListeners?: any;
}

export const TaskCard: React.FC<TaskCardProps> = ({
    task,
    tasks,
    onClick,
    onUpdateTask,
    isTaskBlocked,
    getTaskTypeInfo,
    getDifficultyInfo,
    getPriorityColor,
    getStatusColor,
    style,
    isDragging,
    dragAttributes,
    dragListeners
}) => {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState(task.title);
    const titleInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditingTitle && titleInputRef.current) {
            titleInputRef.current.focus();
        }
    }, [isEditingTitle]);

    const handleTitleSubmit = () => {
        setIsEditingTitle(false);
        if (editedTitle.trim() !== task.title) {
            onUpdateTask({ ...task, title: editedTitle.trim() });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleTitleSubmit();
        }
        if (e.key === 'Escape') {
            setEditedTitle(task.title);
            setIsEditingTitle(false);
        }
    };

    const handleStatusChange = (e: React.MouseEvent) => {
        e.stopPropagation();
        let nextStatus = TaskStatus.TODO;
        if (task.status === TaskStatus.IDEA) nextStatus = TaskStatus.TODO;
        else if (task.status === TaskStatus.TODO) nextStatus = TaskStatus.IN_PROGRESS;
        else if (task.status === TaskStatus.IN_PROGRESS) nextStatus = TaskStatus.DONE;
        else if (task.status === TaskStatus.DONE) nextStatus = TaskStatus.TODO;
        onUpdateTask({ ...task, status: nextStatus });
    };

    const { blocked, blockedBy } = isTaskBlocked(task, tasks);
    const subtasks = task.subtasks || [];
    const completedSubtasks = subtasks.filter(s => s.completed).length;
    const taskTypeInfo = getTaskTypeInfo(task.type);
    const difficultyInfo = getDifficultyInfo(task.difficultyLevel);

    return (
        <div
            style={style}
            {...dragAttributes}
            {...dragListeners}
            onClick={() => !isEditingTitle && onClick(task)}
            className={`group relative p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between cursor-pointer bg-white dark:bg-nordic-dark-bg ${blocked ? 'bg-slate-100 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 opacity-60' :
                task.status === TaskStatus.DONE ? 'border-slate-100 dark:border-nordic-charcoal opacity-70 hover:opacity-100' : 'border-slate-200 dark:border-nordic-charcoal shadow-sm'
                }`}
        >
            <div>
                <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-1 flex-wrap">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${getStatusColor(task.status)}`}>
                            {task.status}
                        </span>
                        {task.type && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase border flex items-center gap-1 ${taskTypeInfo.color}`}>
                                <taskTypeInfo.icon size={10} />
                                {taskTypeInfo.label}
                            </span>
                        )}
                    </div>
                    <div className="flex gap-1 items-center">
                        {difficultyInfo && (
                            <span className="text-sm" title={difficultyInfo.label}>
                                {difficultyInfo.icon}
                            </span>
                        )}
                        {task.priority && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase border ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                            </span>
                        )}
                        {task.tags && task.tags.includes('Kritisk') && (
                            <span className="text-rose-500 animate-pulse">
                                <AlertCircle size={16} />
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-start gap-2 mb-2">
                    {blocked && (
                        <div
                            className="mt-0.5 text-amber-500 dark:text-amber-400"
                            title={`Blockeras av: ${blockedBy.map(t => t.title).join(', ')}`}
                        >
                            <Lock size={18} />
                        </div>
                    )}

                    <div className="flex-1" onDoubleClick={(e) => { e.stopPropagation(); setIsEditingTitle(true); }}>
                        {isEditingTitle ? (
                            <input
                                ref={titleInputRef}
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                onBlur={handleTitleSubmit}
                                onKeyDown={handleKeyDown}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full font-bold text-lg p-1 rounded border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:bg-nordic-dark-surface dark:text-nordic-ice"
                            />
                        ) : (
                            <h4 className={`font-bold text-lg leading-snug ${blocked ? 'text-slate-400 dark:text-slate-600' :
                                task.status === TaskStatus.DONE ? 'text-slate-500 dark:text-nordic-dark-muted line-through decoration-2 decoration-slate-300' : 'text-nordic-charcoal dark:text-nordic-ice'
                                }`}
                                title="Double click to edit"
                            >
                                {task.title}
                            </h4>
                        )}
                    </div>
                </div>

                {blocked && (
                    <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 rounded-lg">
                        <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">
                            🔒 Väntar på: {blockedBy.map(t => t.title).join(', ')}
                        </p>
                    </div>
                )}

                {task.sprint && (
                    <div className="mb-2 inline-flex items-center gap-1.5 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-md text-xs font-medium border border-indigo-100 dark:border-indigo-900/30">
                        <CalendarClock size={12} />
                        {task.sprint}
                    </div>
                )}

                <p className="text-sm text-slate-500 dark:text-nordic-dark-muted leading-relaxed mb-4 line-clamp-2">{task.description}</p>
            </div>

            <div className="flex flex-col gap-3 mt-2 pt-4 border-t border-slate-50 dark:border-nordic-charcoal">
                <div className="flex gap-3 text-slate-400">
                    {(subtasks.length > 0) && (
                        <div className={`flex items-center gap-1 text-xs ${completedSubtasks === subtasks.length ? 'text-green-500' : 'text-slate-400'}`}>
                            <ListChecks size={14} />
                            <span>{completedSubtasks}/{subtasks.length}</span>
                        </div>
                    )}
                    {(task.comments?.length > 0) && (
                        <div className="flex items-center gap-1 text-xs">
                            <MessageSquare size={14} />
                            <span>{task.comments.length}</span>
                        </div>
                    )}
                    {(task.attachments?.length > 0) && (
                        <div className="flex items-center gap-1 text-xs">
                            <Paperclip size={14} />
                            <span>{task.attachments.length}</span>
                        </div>
                    )}
                    {(task.links?.length > 0) && (
                        <div className="flex items-center gap-1 text-xs">
                            <LinkIcon size={14} />
                            <span>{task.links.length}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-slate-400 font-bold">Estimat</span>
                        <span className="text-sm font-mono text-slate-600 dark:text-slate-300">{task.estimatedCostMin}-{task.estimatedCostMax} kr</span>
                    </div>

                    <button
                        onClick={handleStatusChange}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${task.status === TaskStatus.DONE
                            ? 'bg-nordic-green text-green-800 scale-110 shadow-inner'
                            : 'bg-slate-100 dark:bg-nordic-charcoal text-slate-400 hover:bg-nordic-blue hover:text-blue-800 hover:scale-110'
                            }`}
                    >
                        <Check size={20} strokeWidth={task.status === TaskStatus.DONE ? 3 : 2} />
                    </button>
                </div>
            </div>
        </div>
    );
};

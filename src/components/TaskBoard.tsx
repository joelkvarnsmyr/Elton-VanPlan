import React, { useState, useEffect, useMemo } from 'react';
import { Task, TaskStatus, Priority, ShoppingItem, VehicleData, TaskType, DifficultyLevel } from '@/types/types';
import { ChevronDown, ChevronRight, Check, AlertCircle, MessageSquare, Paperclip, Link as LinkIcon, ListChecks, CalendarClock, Lightbulb, Plus, Lock, Maximize2, Minimize2, Wrench, ShoppingCart, FileText, Users, Brain } from 'lucide-react';
import { TaskDetailModal } from './TaskDetailModal';

interface TaskBoardProps {
  tasks: Task[];
  shoppingItems: ShoppingItem[];
  vehicleData: VehicleData;
  onUpdateTask: (task: Task) => void;
  onAddShoppingItem?: (item: Omit<ShoppingItem, 'id'>) => void;
  initialFilter?: string | 'ALL';
}

// Helper to check if task is blocked
const isTaskBlocked = (task: Task, allTasks: Task[]): { blocked: boolean; blockedBy: Task[] } => {
  if (!task.blockers || task.blockers.length === 0) {
    return { blocked: false, blockedBy: [] };
  }

  // Extract taskIds from blockers (supports both new TaskBlocker[] and legacy string[] format)
  const blockerIds = task.blockers.map(b => typeof b === 'string' ? b : b.taskId);

  const blockedBy = allTasks.filter(t =>
    blockerIds.includes(t.id) && t.status !== TaskStatus.DONE
  );

  return {
    blocked: blockedBy.length > 0,
    blockedBy
  };
};

// Get task type color and icon
const getTaskTypeInfo = (type?: TaskType) => {
  switch (type) {
    case TaskType.MAINTENANCE:
      return { color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300', icon: Wrench, label: 'Underhåll' };
    case TaskType.BUILD:
      return { color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300', icon: Wrench, label: 'Bygge' };
    case TaskType.PURCHASE:
      return { color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300', icon: ShoppingCart, label: 'Inköp' };
    case TaskType.ADMIN:
      return { color: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-300', icon: FileText, label: 'Admin' };
    case TaskType.IDEA:
      return { color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300', icon: Lightbulb, label: 'Idé' };
    default:
      return { color: 'bg-slate-50 text-slate-600 border-slate-200', icon: FileText, label: 'Uppgift' };
  }
};

// Get difficulty icon and color
const getDifficultyInfo = (level?: DifficultyLevel) => {
  switch (level) {
    case 'Easy':
      return { icon: '🟢', label: 'Lätt', color: 'text-green-600' };
    case 'Medium':
      return { icon: '🟡', label: 'Medel', color: 'text-amber-600' };
    case 'Expert':
      return { icon: '🔴', label: 'Expert', color: 'text-red-600' };
    default:
      return null;
  }
};

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, shoppingItems, vehicleData, onUpdateTask, onAddShoppingItem, initialFilter = 'ALL' }) => {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<string | 'ALL'>('ALL');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Derive unique phases from tasks to support dynamic project types
  const phases = useMemo(() => {
    // Get all phases from tasks, filter out undefined, remove duplicates
    const allPhases = Array.from(new Set(tasks.map(t => t.phase).filter(Boolean)));
    // Sort them? Or keep order? Usually we want them in a specific logical order.
    // For now, simple sort or just discovery order.
    return allPhases.sort();
  }, [tasks]);

  useEffect(() => {
    setActiveFilter(initialFilter);
    if (initialFilter !== 'ALL' && phases.includes(initialFilter)) {
      setExpandedPhases(new Set([initialFilter]));
    } else if (phases.length > 0 && initialFilter === 'ALL' && expandedPhases.size === 0) {
      // Default to expanding the first phase if none selected
      setExpandedPhases(new Set([phases[0]]));
    }
  }, [initialFilter, phases]);

  const togglePhase = (phase: string) => {
    setExpandedPhases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(phase)) {
        newSet.delete(phase);
      } else {
        newSet.add(phase);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedPhases(new Set(filteredPhases));
  };

  const collapseAll = () => {
    setExpandedPhases(new Set());
  };

  const filteredPhases = activeFilter === 'ALL' ? phases : [activeFilter];

  // Separate Ideas from "Real" Tasks
  const ideaTasks = tasks.filter(t => t.status === TaskStatus.IDEA);
  const realTasks = tasks.filter(t => t.status !== TaskStatus.IDEA);

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.DONE: return 'bg-nordic-green text-green-900 border-green-200 dark:bg-green-900/40 dark:text-green-200 dark:border-green-900';
      case TaskStatus.IN_PROGRESS: return 'bg-nordic-blue text-blue-900 border-blue-200 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-900';
      case TaskStatus.TODO: return 'bg-nordic-pink text-rose-900 border-rose-200 dark:bg-rose-900/40 dark:text-rose-200 dark:border-rose-900';
      case TaskStatus.IDEA: return 'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-900';
      default: return 'bg-slate-100';
    }
  };

  const getPriorityColor = (priority?: Priority) => {
    switch (priority) {
      case Priority.HIGH: return 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-300 border-rose-100 dark:border-rose-900';
      case Priority.MEDIUM: return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-300 border-amber-100 dark:border-amber-900';
      default: return 'text-slate-500 bg-slate-50 dark:bg-slate-800 dark:text-slate-400 border-slate-100 dark:border-slate-700';
    }
  };

  const handleStatusChange = (task: Task) => {
    let nextStatus = TaskStatus.TODO;
    if (task.status === TaskStatus.IDEA) nextStatus = TaskStatus.TODO; // Activate idea
    else if (task.status === TaskStatus.TODO) nextStatus = TaskStatus.IN_PROGRESS;
    else if (task.status === TaskStatus.IN_PROGRESS) nextStatus = TaskStatus.DONE;
    else if (task.status === TaskStatus.DONE) nextStatus = TaskStatus.TODO;

    onUpdateTask({ ...task, status: nextStatus });
  };

  return (
    <div className="space-y-8 pb-20">

      {/* IDEAS SECTION */}
      {ideaTasks.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-3xl border border-amber-100 dark:border-amber-900/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white dark:bg-amber-900/50 rounded-xl text-amber-500 shadow-sm">
              <Lightbulb size={24} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xl text-amber-900 dark:text-amber-100">Idébanken</h3>
              <p className="text-xs text-amber-700 dark:text-amber-300">Drömmar och tankar som inte är spikade än.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {ideaTasks.map(task => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="bg-white/80 dark:bg-nordic-dark-bg/80 backdrop-blur border border-amber-100 dark:border-amber-900/50 p-4 rounded-xl cursor-pointer hover:shadow-md transition-all hover:-translate-y-1"
              >
                <h4 className="font-bold text-sm text-nordic-charcoal dark:text-nordic-ice mb-1">{task.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{task.description}</p>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleStatusChange(task); }}
                    className="text-[10px] font-bold uppercase tracking-wider text-amber-600 hover:bg-amber-100 px-2 py-1 rounded-md transition-colors"
                  >
                    Aktivera
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phase Filter Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide sticky top-0 bg-nordic-ice/95 dark:bg-nordic-dark-bg/95 z-20 py-2 backdrop-blur-sm">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeFilter === 'ALL' ? 'bg-nordic-charcoal text-white shadow-md dark:bg-teal-600' : 'bg-white text-slate-500 hover:bg-slate-50 dark:bg-nordic-dark-surface dark:text-nordic-dark-muted dark:hover:bg-nordic-charcoal'}`}
        >
          Alla Faser
        </button>
        {phases.map(phase => (
          <button
            key={phase}
            onClick={() => setActiveFilter(phase)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeFilter === phase ? 'bg-nordic-charcoal text-white shadow-md dark:bg-teal-600' : 'bg-white text-slate-500 hover:bg-slate-50 dark:bg-nordic-dark-surface dark:text-nordic-dark-muted dark:hover:bg-nordic-charcoal'}`}
          >
            {phase}
          </button>
        ))}
      </div>

      {/* Expand/Collapse All Buttons */}
      {filteredPhases.length > 1 && (
        <div className="flex gap-2 justify-end">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-nordic-dark-surface border border-slate-200 dark:border-nordic-charcoal rounded-lg hover:bg-slate-50 dark:hover:bg-nordic-charcoal transition-colors flex items-center gap-1.5"
          >
            <Maximize2 size={14} />
            Expandera alla
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-nordic-dark-surface border border-slate-200 dark:border-nordic-charcoal rounded-lg hover:bg-slate-50 dark:hover:bg-nordic-charcoal transition-colors flex items-center gap-1.5"
          >
            <Minimize2 size={14} />
            Stäng alla
          </button>
        </div>
      )}

      {/* DYNAMIC PHASES */}
      {filteredPhases.map((phase) => {
        const phaseTasks = realTasks.filter(t => t.phase === phase);
        const isExpanded = expandedPhases.has(phase) || filteredPhases.length === 1;

        if (phaseTasks.length === 0) return null;

        return (
          <div key={phase} className="bg-white dark:bg-nordic-dark-surface rounded-3xl border border-nordic-ice dark:border-nordic-dark-bg shadow-sm overflow-hidden transition-all duration-500 ease-in-out">
            <button
              onClick={() => togglePhase(phase)}
              className="w-full flex items-center justify-between p-6 bg-white dark:bg-nordic-dark-surface hover:bg-nordic-ice/30 dark:hover:bg-nordic-charcoal/30 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2.5 rounded-xl transition-colors ${isExpanded ? 'bg-nordic-charcoal text-white dark:bg-teal-600' : 'bg-nordic-ice text-slate-500 dark:bg-nordic-charcoal dark:text-nordic-ice'}`}>
                  {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
                <div className="text-left">
                  <h3 className="font-serif font-bold text-xl text-nordic-charcoal dark:text-nordic-ice">{phase}</h3>
                  <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-nordic-dark-muted mt-1">
                    <span className="bg-nordic-green/50 dark:bg-green-900/30 px-2 py-0.5 rounded-full text-xs text-green-900 dark:text-green-200 font-medium">
                      {phaseTasks.filter(t => t.status === TaskStatus.DONE).length} Klara
                    </span>
                    <span>•</span>
                    <span>{phaseTasks.length} Totalt</span>
                  </div>
                </div>
              </div>
            </button>

            {isExpanded && (
              <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 bg-nordic-ice/20 dark:bg-black/10 border-t border-nordic-ice dark:border-nordic-dark-bg">
                <div className="h-2 col-span-full"></div>
                {phaseTasks.map(task => {
                  const subtasks = task.subtasks || [];
                  const completedSubtasks = subtasks.filter(s => s.completed).length;
                  const { blocked, blockedBy } = isTaskBlocked(task, tasks);
                  const taskTypeInfo = getTaskTypeInfo(task.type);
                  const difficultyInfo = getDifficultyInfo(task.difficultyLevel);

                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={`group relative p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between cursor-pointer ${blocked ? 'bg-slate-100 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 opacity-60 cursor-not-allowed' :
                        task.status === TaskStatus.DONE ? 'bg-white dark:bg-nordic-dark-bg border-slate-100 dark:border-nordic-charcoal opacity-70 hover:opacity-100' : 'bg-white dark:bg-nordic-dark-bg border-slate-200 dark:border-nordic-charcoal shadow-sm'
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
                          <h4 className={`font-bold text-lg flex-1 ${blocked ? 'text-slate-400 dark:text-slate-600' :
                            task.status === TaskStatus.DONE ? 'text-slate-500 dark:text-nordic-dark-muted line-through decoration-2 decoration-slate-300' : 'text-nordic-charcoal dark:text-nordic-ice'
                            }`}>
                            {task.title}
                          </h4>
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
                        {/* Indicators for attachments/comments/subtasks */}
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
                            onClick={(e) => { e.stopPropagation(); handleStatusChange(task); }}
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
                  )
                })}
              </div>
            )}
          </div>
        );
      })}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          vehicleData={vehicleData}
          shoppingItems={shoppingItems}
          onUpdate={(updated) => {
            onUpdateTask(updated);
            setSelectedTask(updated); // Keep modal open with fresh data
          }}
          onAddShoppingItem={onAddShoppingItem}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};

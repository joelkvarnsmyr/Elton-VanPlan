import React, { useState, useEffect, useMemo } from 'react';
import { Task, TaskStatus, Priority, ShoppingItem, VehicleData, TaskType, DifficultyLevel } from '@/types/types';
import { ChevronDown, ChevronRight, Check, AlertCircle, MessageSquare, Paperclip, Link as LinkIcon, ListChecks, CalendarClock, Lightbulb, Plus, Lock, Maximize2, Minimize2, Wrench, ShoppingCart, FileText, Users, Brain, Scan } from 'lucide-react';
import { TaskDetailModal } from './TaskDetailModal';
import { normalizePhase, groupTasksByPhase } from '@/utils/phaseUtils';
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, TouchSensor, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableTaskCard } from './SortableTaskCard';
import { TaskCard } from './TaskCard';

interface TaskBoardProps {
  tasks: Task[];
  shoppingItems: ShoppingItem[];
  vehicleData: VehicleData;
  onUpdateTask: (task: Task) => void;
  onAddShoppingItem?: (item: Omit<ShoppingItem, 'id'>) => void;
  initialFilter?: string | 'ALL';
  initialSelectedTaskId?: string | null;
  projectId: string; // Added prop
}

// Helper: Check if task is blocked by dependencies
const isTaskBlocked = (task: Task, allTasks: Task[]) => {
  if (!task.dependencies || task.dependencies.length === 0) return { blocked: false, blockedBy: [] };
  const blockers = allTasks.filter(t => task.dependencies?.includes(t.id) && t.status !== TaskStatus.DONE);
  return { blocked: blockers.length > 0, blockedBy: blockers };
};

// Helper: Get task type icon and color
const getTaskTypeInfo = (type?: TaskType) => {
  switch (type) {
    case TaskType.REPAIR: return { icon: Wrench, color: 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800', label: 'Reparation' };
    case TaskType.PURCHASE: return { icon: ShoppingCart, color: 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800', label: 'Inköp' };
    case TaskType.ADMIN: return { icon: FileText, color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800', label: 'Admin' };
    case TaskType.RESEARCH: return { icon: Brain, color: 'text-teal-600 bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800', label: 'Research' };
    case TaskType.UPGRADE: return { icon: Lightbulb, color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800', label: 'Uppgradering' };
    case TaskType.INSPECTION: return { icon: Scan, color: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800', label: 'Inspektion' };
    case TaskType.DIY: return { icon: Wrench, color: 'text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800', label: 'DIY' };
    case TaskType.SERVICE: return { icon: Wrench, color: 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/20 dark:text-slate-300 dark:border-slate-800', label: 'Service' };
    default: return { icon: ListChecks, color: 'text-slate-500 bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700', label: 'Uppgift' };
  }
};

// Helper: Get difficulty info
const getDifficultyInfo = (level?: DifficultyLevel) => {
  switch (level) {
    case 'Easy': return { color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800', label: 'Enkel' };
    case 'Medium': return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800', label: 'Medel' };
    case 'Expert': return { color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800', label: 'Expert' };
    default: return { color: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700', label: 'Okänd' };
  }
};



export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, shoppingItems, vehicleData, onUpdateTask, onAddShoppingItem, initialFilter = 'ALL', initialSelectedTaskId, projectId }) => {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<string | 'ALL'>('ALL');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeDragTask, setActiveDragTask] = useState<Task | null>(null);

  const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 5 } });
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } });
  const sensors = useSensors(pointerSensor, touchSensor);

  useEffect(() => {
    if (initialSelectedTaskId) {
      const task = tasks.find(t => t.id === initialSelectedTaskId);
      if (task) {
        setSelectedTask(task);
        if (task.phase) {
          setActiveFilter(task.phase);
          setExpandedPhases(new Set([task.phase]));
        }
      }
    }
  }, [initialSelectedTaskId, tasks]);

  // Derive unique phases
  const phases = useMemo(() => {
    const allPhases = Array.from(new Set(tasks.map(t => t.phase).filter(Boolean)));
    return allPhases.sort((a, b) => {
      if (a === 'Backlog') return 1;
      if (b === 'Backlog') return -1;
      return a.localeCompare(b);
    });
  }, [tasks]);

  useEffect(() => {
    if (initialSelectedTaskId) return;

    setActiveFilter(initialFilter);
    if (initialFilter !== 'ALL' && phases.includes(initialFilter)) {
      setExpandedPhases(new Set([initialFilter]));
    } else if (phases.length > 0 && initialFilter === 'ALL' && expandedPhases.size === 0) {
      setExpandedPhases(new Set([phases[0]]));
    }
  }, [initialFilter, phases, initialSelectedTaskId]);

  const togglePhase = (phase: string) => {
    setExpandedPhases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(phase)) newSet.delete(phase);
      else newSet.add(phase);
      return newSet;
    });
  };

  const expandAll = () => setExpandedPhases(new Set(filteredPhases));
  const collapseAll = () => setExpandedPhases(new Set());

  const filteredPhases = activeFilter === 'ALL' ? phases : [activeFilter];
  const ideaTasks = tasks.filter(t => t.status === TaskStatus.IDEA);
  const realTasks = tasks.filter(t => t.status !== TaskStatus.IDEA);

  // DnD Handlers
  const handleDragStart = (event: any) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) setActiveDragTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragTask(null);

    if (!over) return;

    // Check if dropped on a phase container (we'll make phase containers droppable)
    // OR dropped on another task in a different phase
    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) return;

    let targetPhase = '';

    // If 'over' is a phase ID directly
    if (phases.includes(over.id as string)) {
      targetPhase = over.id as string;
    }
    // If 'over' is a task, find its phase
    else {
      const overTask = tasks.find(t => t.id === over.id);
      if (overTask && overTask.phase) {
        targetPhase = overTask.phase;
      }
    }

    // Update phase if changed
    if (targetPhase && targetPhase !== activeTask.phase) {
      onUpdateTask({ ...activeTask, phase: targetPhase });
    }
  };

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
    if (task.status === TaskStatus.IDEA) nextStatus = TaskStatus.TODO;
    else if (task.status === TaskStatus.TODO) nextStatus = TaskStatus.IN_PROGRESS;
    else if (task.status === TaskStatus.IN_PROGRESS) nextStatus = TaskStatus.DONE;
    else if (task.status === TaskStatus.DONE) nextStatus = TaskStatus.TODO;
    onUpdateTask({ ...task, status: nextStatus });
  };


  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-8 pb-20">

        {/* IDEAS SECTION (Keep as is, no DnD needed here necessarily, but consistent styling) */}
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
                <div key={task.id} onClick={() => setSelectedTask(task)} className="bg-white/80 dark:bg-nordic-dark-bg/80 backdrop-blur border border-amber-100 dark:border-amber-900/50 p-4 rounded-xl cursor-pointer hover:shadow-md transition-all hover:-translate-y-1">
                  <h4 className="font-bold text-sm text-nordic-charcoal dark:text-nordic-ice mb-1">{task.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{task.description}</p>
                  <div className="mt-3 flex justify-end">
                    <button onClick={(e) => { e.stopPropagation(); handleStatusChange(task); }} className="text-[10px] font-bold uppercase tracking-wider text-amber-600 hover:bg-amber-100 px-2 py-1 rounded-md transition-colors">Aktivera</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Phase Filter Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide sticky top-0 bg-nordic-ice/95 dark:bg-nordic-dark-bg/95 z-20 py-2 backdrop-blur-sm">
          <button onClick={() => setActiveFilter('ALL')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeFilter === 'ALL' ? 'bg-nordic-charcoal text-white shadow-md dark:bg-teal-600' : 'bg-white text-slate-500 hover:bg-slate-50 dark:bg-nordic-dark-surface dark:text-nordic-dark-muted dark:hover:bg-nordic-charcoal'}`}>Alla Faser</button>
          {phases.map(phase => (
            <button key={phase} onClick={() => setActiveFilter(phase)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeFilter === phase ? 'bg-nordic-charcoal text-white shadow-md dark:bg-teal-600' : 'bg-white text-slate-500 hover:bg-slate-50 dark:bg-nordic-dark-surface dark:text-nordic-dark-muted dark:hover:bg-nordic-charcoal'}`}>{phase}</button>
          ))}
        </div>

        {/* Expand/Collapse All */}
        {filteredPhases.length > 1 && (
          <div className="flex gap-2 justify-end">
            <button onClick={expandAll} className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-nordic-dark-surface border border-slate-200 dark:border-nordic-charcoal rounded-lg hover:bg-slate-50 dark:hover:bg-nordic-charcoal transition-colors flex items-center gap-1.5"><Maximize2 size={14} />Expandera alla</button>
            <button onClick={collapseAll} className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-nordic-dark-surface border border-slate-200 dark:border-nordic-charcoal rounded-lg hover:bg-slate-50 dark:hover:bg-nordic-charcoal transition-colors flex items-center gap-1.5"><Minimize2 size={14} />Stäng alla</button>
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
                // We use a simplified droppable area for the header could be tricky, keep it simple for now
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
                      <span className="bg-nordic-green/50 dark:bg-green-900/30 px-2 py-0.5 rounded-full text-xs text-green-900 dark:text-green-200 font-medium">{phaseTasks.filter(t => t.status === TaskStatus.DONE).length} Klara</span>
                      <span>•</span>
                      <span>{phaseTasks.length} Totalt</span>
                    </div>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="p-6 pt-0 bg-nordic-ice/20 dark:bg-black/10 border-t border-nordic-ice dark:border-nordic-dark-bg">
                  <div className="h-2"></div>
                  <SortableContext items={phaseTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {phaseTasks.map(task => (
                        <SortableTaskCard
                          key={task.id}
                          task={task}
                          tasks={tasks}
                          onClick={setSelectedTask}
                          onUpdateTask={onUpdateTask}
                          isTaskBlocked={isTaskBlocked}
                          getDifficultyInfo={getDifficultyInfo}
                          getPriorityColor={getPriorityColor}
                          getStatusColor={getStatusColor}
                          getTaskTypeInfo={getTaskTypeInfo}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </div>
              )}
            </div>
          );
        })}

        <DragOverlay>
          {activeDragTask ? (
            <div className="opacity-80 rotate-2 scale-105 cursor-grabbing pointer-events-none">
              <TaskCard
                task={activeDragTask}
                tasks={tasks}
                onClick={() => { }}
                onUpdateTask={() => { }}
                isTaskBlocked={isTaskBlocked}
                getDifficultyInfo={getDifficultyInfo}
                getPriorityColor={getPriorityColor}
                getStatusColor={getStatusColor}
                getTaskTypeInfo={getTaskTypeInfo}
              />
            </div>
          ) : null}
        </DragOverlay>

        {selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            vehicleData={vehicleData}
            shoppingItems={shoppingItems}
            onUpdate={(updated) => {
              onUpdateTask(updated);
              setSelectedTask(updated);
            }}
            onAddShoppingItem={onAddShoppingItem}
            onClose={() => setSelectedTask(null)}
            availablePhases={phases}
            projectId={projectId}
          />
        )}
      </div>
    </DndContext>
  );
};

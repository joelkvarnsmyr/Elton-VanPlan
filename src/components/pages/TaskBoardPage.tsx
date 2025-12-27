import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TaskBoard } from '../TaskBoard';
import { HillChart } from '../HillChart';
import { GoalsDashboard } from '../GoalsDashboard';
import { DependencyGraph } from '../DependencyGraph';
import { TeamView } from '../TeamView';
import { TaskDetailModal } from '../TaskDetailModal';
import { useProject } from '@/contexts';
import { ShoppingItem, Task } from '@/types/types';
import { LayoutGrid, Mountain, Target, GitBranch, Users } from 'lucide-react';

type ViewMode = 'board' | 'hill' | 'goals' | 'dependencies' | 'team';

export const TaskBoardPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const phaseFilter = searchParams.get('phase') || 'ALL';
    const highlightedTaskId = searchParams.get('taskId');

    const [activeView, setActiveView] = useState<ViewMode>('board');
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const {
        activeProject,
        tasks,
        shoppingItems,
        updateTask,
        addShoppingItem
    } = useProject();

    if (!activeProject) return null;

    // Derive unique phases for TaskDetailModal
    const phases = Array.from(new Set(tasks.map(t => t.phase).filter(Boolean))).sort();

    const viewTabs: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
        { id: 'board', label: 'Tavla', icon: <LayoutGrid size={16} /> },
        { id: 'team', label: 'Team', icon: <Users size={16} /> },
        { id: 'hill', label: 'Hill Chart', icon: <Mountain size={16} /> },
        { id: 'goals', label: 'Mål', icon: <Target size={16} /> },
        { id: 'dependencies', label: 'Beroenden', icon: <GitBranch size={16} /> },
    ];

    return (
        <div className="space-y-4">
            {/* View Toggle Tabs */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                {viewTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveView(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeView === tab.id
                            ? 'bg-teal-500 text-white shadow-md'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                    >
                        {tab.icon}
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Views */}
            {activeView === 'board' && (
                <TaskBoard
                    tasks={tasks}
                    shoppingItems={shoppingItems}
                    vehicleData={activeProject.vehicleData}
                    onUpdateTask={updateTask}
                    onAddShoppingItem={(item) => addShoppingItem(item as ShoppingItem)}
                    initialFilter={phaseFilter}
                    initialSelectedTaskId={highlightedTaskId}
                    projectId={activeProject.id}
                />
            )}

            {activeView === 'hill' && (
                <HillChart
                    tasks={tasks}
                    onTaskClick={setSelectedTask}
                />
            )}

            {activeView === 'goals' && (
                <GoalsDashboard
                    project={activeProject}
                    tasks={tasks}
                />
            )}

            {activeView === 'dependencies' && (
                <DependencyGraph
                    tasks={tasks}
                    onTaskClick={setSelectedTask}
                />
            )}

            {activeView === 'team' && (
                <TeamView
                    tasks={tasks}
                    onTaskClick={setSelectedTask}
                />
            )}

            {/* Task Detail Modal (shared across views) */}
            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    vehicleData={activeProject.vehicleData}
                    shoppingItems={shoppingItems}
                    onUpdate={(updated) => {
                        updateTask(updated);
                        setSelectedTask(updated);
                    }}
                    onAddShoppingItem={addShoppingItem}
                    onClose={() => setSelectedTask(null)}
                    availablePhases={phases}
                    projectId={activeProject.id}
                />
            )}
        </div>
    );
};

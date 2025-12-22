import React from 'react';
import { TaskBoard } from '../TaskBoard';
import { useProject } from '@/contexts/ProjectContext';
import { useVanPlanQueryParams } from '@/hooks/useQueryParams';

export const TaskBoardPage: React.FC = () => {
    const { activeProject, updateTask } = useProject();
    const { phase, taskId } = useVanPlanQueryParams();

    if (!activeProject) return null;

    return (
        <TaskBoard
            tasks={activeProject.tasks}
            shoppingItems={activeProject.shoppingItems}
            vehicleData={activeProject.vehicleData}
            onUpdateTask={updateTask}
            initialFilter={phase || 'ALL'}
            initialSelectedTaskId={taskId}
            projectId={activeProject.id}
        />
    );
};

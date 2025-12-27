
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AIAssistant } from '../AIAssistant';
import { useProject } from '@/contexts';

export const AIAssistantPage: React.FC = () => {
    const {
        activeProject,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        addShoppingItem,
        updateShoppingItem,
        deleteShoppingItem,
        updateVehicleData,
        updateProjectMetadata
    } = useProject();
    const navigate = useNavigate();

    if (!activeProject) return null;

    return (
        <AIAssistant
            project={activeProject}
            onClose={() => navigate('.')}
            onAddTask={(newTasks) => {
                // AIAssistant passes array, context addTask takes single. Loop needed.
                newTasks.forEach(t => addTask(t));
            }}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            onAddShoppingItem={addShoppingItem}
            onUpdateShoppingItem={updateShoppingItem}
            onDeleteShoppingItem={deleteShoppingItem}
            onUpdateVehicleData={updateVehicleData}
            // Add other callbacks as needed if context supports them
            onUpdateProjectMetadata={updateProjectMetadata}
        />
    );
};

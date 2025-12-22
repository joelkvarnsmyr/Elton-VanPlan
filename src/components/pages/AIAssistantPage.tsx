import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AIAssistant } from '../AIAssistant';
import { useProject } from '@/contexts/ProjectContext';

export const AIAssistantPage: React.FC = () => {
    const {
        activeProject,
        updateTask,
        deleteTask,
        addShoppingItem,
        updateShoppingItem,
        deleteShoppingItem,
        updateVehicleData,
        updateProjectMetadata,
    } = useProject();
    const navigate = useNavigate();

    if (!activeProject) return null;

    // Placeholder handlers for features not yet in ProjectContext
    const handleAddTasks = async (tasks: any[]) => {
        console.warn('Add tasks not yet implemented in ProjectContext');
    };

    const handleAddKnowledgeArticle = async (article: any) => {
        console.warn('Add knowledge article not yet implemented');
    };

    const handleAddServiceLog = async (log: any) => {
        console.warn('Add service log not yet implemented');
    };

    const handleAddHistoryEvent = async (event: any) => {
        console.warn('Add history event not yet implemented');
    };

    return (
        <AIAssistant
            project={activeProject}
            contacts={activeProject.contacts}
            userSkillLevel={undefined} // TODO: Get from user context
            onAddTask={handleAddTasks}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            onAddShoppingItem={addShoppingItem}
            onUpdateShoppingItem={updateShoppingItem}
            onDeleteShoppingItem={deleteShoppingItem}
            onUpdateVehicleData={updateVehicleData}
            onAddKnowledgeArticle={handleAddKnowledgeArticle}
            onAddServiceLog={handleAddServiceLog}
            onAddHistoryEvent={handleAddHistoryEvent}
            onUpdateProjectMetadata={updateProjectMetadata}
            onClose={() => navigate(`/project/${activeProject.id}`)}
        />
    );
};

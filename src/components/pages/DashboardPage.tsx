
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dashboard } from '../Dashboard';
import { useProject } from '@/contexts';

export const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    // We don't need to pass project data as Dashboard uses useProject() now.
    // But we need to handle the navigation callbacks.

    const handlePhaseClick = (phaseId: string) => {
        // Navigate to tasks with phase filter
        // We'll pass the filter via state or search params. 
        // Let's use search params for better shareability.
        navigate(`/project/${useProject().activeProject!.id}/tasks?phase=${phaseId}`);
    };

    const handleViewTask = (taskId: string) => {
        navigate(`/project/${useProject().activeProject!.id}/tasks?taskId=${taskId}`);
    };

    const handleViewShopping = () => {
        navigate(`/project/${useProject().activeProject!.id}/shopping`);
    };

    return (
        <Dashboard
            onPhaseClick={handlePhaseClick}
            onViewTask={handleViewTask}
            onViewShopping={handleViewShopping}
        />
    );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dashboard } from '../Dashboard';
import { useProject } from '@/contexts/ProjectContext';

export const DashboardPage: React.FC = () => {
    const { activeProject } = useProject();
    const navigate = useNavigate();

    if (!activeProject) return null;

    const handlePhaseClick = (phase: string) => {
        navigate(`/project/${activeProject.id}/tasks?phase=${encodeURIComponent(phase)}`);
    };

    const handleViewTask = (taskId: string) => {
        navigate(`/project/${activeProject.id}/tasks?taskId=${taskId}`);
    };

    const handleViewShopping = () => {
        navigate(`/project/${activeProject.id}/shopping`);
    };

    return (
        <Dashboard
            project={activeProject}
            onPhaseClick={handlePhaseClick}
            onViewTask={handleViewTask}
            onViewShopping={handleViewShopping}
        />
    );
};

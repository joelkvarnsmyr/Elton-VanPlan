import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectSelector } from '../ProjectSelector';
import { UserProfile, Project } from '@/types/types';

interface ProjectSelectorPageProps {
    user: UserProfile;
    projects: Project[];
    onSelectProject: (projectId: string) => void;
    onCreateProject: (project: Partial<Project>) => void;
    onDeleteProject: (projectId: string) => void;
    onLogout: () => void;
    onSeed?: () => void;
}

export const ProjectSelectorPage: React.FC<ProjectSelectorPageProps> = ({
    user,
    projects,
    onSelectProject,
    onCreateProject,
    onDeleteProject,
    onLogout,
    onSeed,
}) => {
    const navigate = useNavigate();

    const handleSelectProject = (projectId: string) => {
        onSelectProject(projectId);
        navigate(`/project/${projectId}`);
    };

    return (
        <ProjectSelector
            user={user}
            projects={projects}
            onSelectProject={handleSelectProject}
            onCreateProject={onCreateProject}
            onLogout={onLogout}
            onDeleteProject={onDeleteProject}
            onSeed={onSeed}
        />
    );
};

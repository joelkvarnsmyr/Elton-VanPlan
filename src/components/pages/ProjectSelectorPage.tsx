
import React from 'react';
import { ProjectSelector } from '../ProjectSelector';
import { Project, VehicleData } from '@/types/types';

interface ProjectSelectorPageProps {
    user: any;
    projects: Project[];
    onSelectProject: (id: string) => Promise<void>;
    onCreateProject: (project: Partial<Project>) => void;
    onDeleteProject: (id: string) => Promise<void>;
    onLogout: () => Promise<void>;
    onSeed: () => Promise<void>;
    onCreateV2Project: (
        vehicleData: VehicleData,
        imageBase64?: string,
        vehicleDescription?: string,
        aiData?: any
    ) => Promise<string>;
}

export const ProjectSelectorPage: React.FC<ProjectSelectorPageProps> = (props) => {
    return (
        <ProjectSelector
            {...props}
        />
    );
};

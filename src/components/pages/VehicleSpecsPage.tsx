import React from 'react';
import { VehicleSpecs } from '../VehicleSpecs';
import { useProject } from '@/contexts/ProjectContext';

export const VehicleSpecsPage: React.FC = () => {
    const { activeProject, updateContacts, updateLocation } = useProject();

    if (!activeProject) return null;

    return (
        <VehicleSpecs
            vehicleData={activeProject.vehicleData}
            tasks={activeProject.tasks}
            contacts={activeProject.contacts || []}
            projectLocation={
                activeProject.location
                    ? {
                        city: activeProject.location.city,
                        lat: activeProject.location.coordinates?.lat || 0,
                        lng: activeProject.location.coordinates?.lng || 0,
                    }
                    : undefined
            }
            onUpdateContacts={updateContacts}
            onUpdateLocation={updateLocation}
            projectType={activeProject.type}
        />
    );
};


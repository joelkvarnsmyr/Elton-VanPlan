
import React from 'react';
import { VehicleSpecs } from '../VehicleSpecs';
import { useProject } from '@/contexts';

export const VehicleSpecsPage: React.FC = () => {
    const { activeProject, updateVehicleData } = useProject();

    if (!activeProject) return null;

    return (
        <VehicleSpecs
            vehicleData={activeProject.vehicleData}
            onUpdateSpecs={(data: any) => updateVehicleData(data)}
        />
    );
};

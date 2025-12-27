import React from 'react';
import { ElectricalSystemBuilder } from '../electrical/ElectricalSystemBuilder';

/**
 * Electrical System Page
 * 
 * Wrapper page component for the electrical system visualizer.
 * Integrates with the project dashboard navigation.
 */
export const ElectricalSystemPage: React.FC = () => {
    return (
        <div className="h-full">
            <ElectricalSystemBuilder />
        </div>
    );
};

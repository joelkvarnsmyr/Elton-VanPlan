import React, { useState } from 'react';
import { DetailedInspection, Task } from '@/types/types';
import InspectionOverview from './InspectionOverview';
import InspectionDetail from './InspectionDetail';

interface InspectionPageProps {
    inspection: DetailedInspection;
    tasks?: Task[];
    onViewTask?: (taskId: string) => void;
}

/**
 * Main Inspection Page Component
 * Combines InspectionOverview and InspectionDetail
 */
export const InspectionPage: React.FC<InspectionPageProps> = ({
    inspection,
    tasks = [],
    onViewTask
}) => {
    const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);

    const selectedArea = selectedAreaId !== null
        ? inspection.areas.find(a => a.areaId === selectedAreaId)
        : null;

    return (
        <>
            <InspectionOverview
                inspection={inspection}
                onAreaClick={setSelectedAreaId}
            />

            {selectedArea && (
                <InspectionDetail
                    area={selectedArea}
                    tasks={tasks}
                    onClose={() => setSelectedAreaId(null)}
                    onViewTask={onViewTask}
                />
            )}
        </>
    );
};

export default InspectionPage;

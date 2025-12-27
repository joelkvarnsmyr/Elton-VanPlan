
import React from 'react';
import { InspectionPage } from '../inspection/InspectionPage';
import { useProject } from '@/contexts';
import { useNavigate } from 'react-router-dom';

export const InspectionPageWrapper: React.FC = () => {
    const { activeProject, tasks } = useProject();
    const navigate = useNavigate();

    if (!activeProject) return null;
    // If no inspections, maybe redirect or show empty state?
    // User's App.tsx rendered: {currentView === 'inspection' && activeProject.inspections && activeProject.inspections.length > 0 && <InspectionPage inspection={activeProject.inspections[0] as any} tasks={activeProject.tasks} onViewTask={(taskId) => { setCurrentView('tasks'); }} />}

    const inspection = activeProject.inspections && activeProject.inspections.length > 0 ? activeProject.inspections[0] : null;

    if (!inspection) {
        return (
            <div className="p-8 text-center text-slate-500">
                <p>Inga inspektioner hittades.</p>
                <button onClick={() => navigate('../ai')} className="mt-4 text-teal-600 font-bold hover:underline">Starta en inspektion med AI</button>
            </div>
        );
    }

    return (
        <InspectionPage
            inspection={inspection as any} // Forced cast as in App.tsx
            tasks={tasks}
            onViewTask={(taskId) => navigate(`../tasks?taskId=${taskId}`)}
        />
    );
};

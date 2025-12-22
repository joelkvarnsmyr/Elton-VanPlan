```typescript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { InspectionPage } from '../inspection/InspectionPage';
import { useProject } from '@/contexts/ProjectContext';

export const InspectionPageWrapper: React.FC = () => {
  const { activeProject } = useProject();
  const navigate = useNavigate();

  if (!activeProject) return null;

  if (!activeProject.inspections || activeProject.inspections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Ingen inspektion tillgänglig för detta projekt
          </p>
          <button
            onClick={() => navigate(`/ project / ${ activeProject.id } `)}
            className="px-4 py-2 bg-nordic-charcoal dark:bg-teal-600 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-teal-700"
          >
            Tillbaka till översikt
          </button>
        </div>
      </div>
    );
  }

  return (
    <InspectionPage
      inspection={activeProject.inspections[0] as any}
      tasks={activeProject.tasks}
      onViewTask={(taskId) => navigate(`/ project / ${ activeProject.id }/tasks?taskId=${taskId}`)}
    />
  );
};
```

import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserProfile } from '@/types/types';
import { WaitlistLanding } from '@/components/WaitlistLanding';
import { ProjectLayout } from '@/components/layout/ProjectLayout';
import { Roadmap } from '@/components/Roadmap';
import { Loader2 } from 'lucide-react';

// Page components
import { DashboardPage } from '@/components/pages/DashboardPage';
import { TaskBoardPage } from '@/components/pages/TaskBoardPage';
import { ShoppingListPage } from '@/components/pages/ShoppingListPage';
import { VehicleSpecsPage } from '@/components/pages/VehicleSpecsPage';
import { AIAssistantPage } from '@/components/pages/AIAssistantPage';
import { InspectionPageWrapper } from '@/components/pages/InspectionPageWrapper';

interface AppRoutesProps {
    currentUser: UserProfile | null;
    isLoading: boolean;
}

const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-slate-400 text-4xl" />
    </div>
);

/**
 * Main routing configuration for VanPlan
 */
export const AppRoutes: React.FC<AppRoutesProps> = ({ currentUser, isLoading }) => {
    // Show loading state while checking auth
    if (isLoading) {
        return null; // App.tsx handles the loading UI
    }

    // Not logged in - show landing page
    if (!currentUser) {
        return (
            <Routes>
                <Route path="/" element={<WaitlistLanding />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        );
    }

    // Logged in - show full app
    return (
        <Suspense fallback={<LoadingFallback />}>
            <Routes>
                {/* Roadmap - accessible without project */}
                <Route path="/roadmap" element={<Roadmap onClose={() => window.history.back()} />} />

                {/* Project Selector - will be implemented in App.tsx */}
                <Route path="/projects" element={<div>Project Selector (handled by App.tsx)</div>} />

                {/* Project Routes - wrapped in ProjectLayout */}
                <Route path="/project/:projectId" element={<ProjectLayout currentUser={currentUser} />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="tasks" element={<TaskBoardPage />} />
                    <Route path="shopping" element={<ShoppingListPage />} />
                    <Route path="specs" element={<VehicleSpecsPage />} />
                    <Route path="ai" element={<AIAssistantPage />} />
                    <Route path="inspection" element={<InspectionPageWrapper />} />
                </Route>

                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/projects" replace />} />
                <Route path="*" element={<Navigate to="/projects" replace />} />
            </Routes>
        </Suspense>
    );
};

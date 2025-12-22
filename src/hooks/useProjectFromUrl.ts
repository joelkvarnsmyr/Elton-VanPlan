import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Project } from '@/types/types';
import { getProject, getTasks, getShoppingItems } from '@/services/db';

interface UseProjectFromUrlResult {
    project: Project | null;
    isLoading: boolean;
    error: string | null;
}

/**
 * Custom hook to load a project based on the URL parameter
 * Handles loading, error states, and redirects
 */
export const useProjectFromUrl = (): UseProjectFromUrlResult => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadProject = async () => {
            if (!projectId) {
                setError('Inget projekt-ID angivet');
                setIsLoading(false);
                navigate('/projects');
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const projData = await getProject(projectId);

                if (!projData) {
                    setError('Projektet kunde inte hittas');
                    setIsLoading(false);
                    // Redirect to projects after a short delay
                    setTimeout(() => navigate('/projects'), 2000);
                    return;
                }

                // Load tasks and shopping items
                const [tasks, shopping] = await Promise.all([
                    getTasks(projectId),
                    getShoppingItems(projectId)
                ]);

                setProject({
                    ...projData,
                    tasks: tasks || [],
                    shoppingItems: shopping || []
                });
                setIsLoading(false);
            } catch (err) {
                console.error('Error loading project from URL:', err);
                setError('Kunde inte ladda projektdata');
                setIsLoading(false);
                setTimeout(() => navigate('/projects'), 2000);
            }
        };

        loadProject();
    }, [projectId, navigate]);

    return { project, isLoading, error };
};

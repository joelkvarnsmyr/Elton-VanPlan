import { useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Custom hook for type-safe query parameter management
 */
export const useQueryParams = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const getParam = useCallback((key: string): string | null => {
        return searchParams.get(key);
    }, [searchParams]);

    const setParam = useCallback((key: string, value: string | null) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            if (value === null || value === '') {
                newParams.delete(key);
            } else {
                newParams.set(key, value);
            }
            return newParams;
        });
    }, [setSearchParams]);

    const setParams = useCallback((params: Record<string, string | null>) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            Object.entries(params).forEach(([key, value]) => {
                if (value === null || value === '') {
                    newParams.delete(key);
                } else {
                    newParams.set(key, value);
                }
            });
            return newParams;
        });
    }, [setSearchParams]);

    const clearParams = useCallback(() => {
        setSearchParams(new URLSearchParams());
    }, [setSearchParams]);

    return {
        getParam,
        setParam,
        setParams,
        clearParams,
        searchParams
    };
};

/**
 * Hook for common query parameters used in VanPlan
 */
export const useVanPlanQueryParams = () => {
    const { getParam, setParam, setParams } = useQueryParams();

    return {
        // Phase filter
        phase: getParam('phase'),
        setPhase: (phase: string | null) => setParam('phase', phase),

        // Task ID (for opening task modal)
        taskId: getParam('taskId'),
        setTaskId: (taskId: string | null) => setParam('taskId', taskId),

        // Shopping item ID (for opening shopping modal)
        itemId: getParam('itemId'),
        setItemId: (itemId: string | null) => setParam('itemId', itemId),

        // Status filter
        status: getParam('status'),
        setStatus: (status: string | null) => setParam('status', status),

        // Generic setter for multiple params
        setMultiple: setParams
    };
};

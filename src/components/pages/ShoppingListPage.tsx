import React from 'react';
import { ShoppingList } from '../ShoppingList';
import { useProject } from '@/contexts/ProjectContext';
import { useVanPlanQueryParams } from '@/hooks/useQueryParams';
import { uploadReceipt } from '@/services/storage';

export const ShoppingListPage: React.FC = () => {
    const {
        activeProject,
        addShoppingItem,
        updateShoppingItem,
        deleteShoppingItem,
    } = useProject();
    const { taskId: filterByTaskId } = useVanPlanQueryParams();

    if (!activeProject) return null;

    const handleUploadReceipt = async (itemId: string, file: File) => {
        // Note: This needs currentUser which we don't have in context yet
        // For now, we'll skip the upload functionality
        console.warn('Receipt upload not yet implemented in routing version');
    };

    const handleToggle = (id: string) => {
        const item = activeProject.shoppingItems.find(x => x.id === id);
        if (item) {
            updateShoppingItem({ ...item, checked: !item.checked });
        }
    };

    return (
        <ShoppingList
            items={activeProject.shoppingItems}
            tasks={activeProject.tasks}
            vehicleData={activeProject.vehicleData}
            projectId={activeProject.id}
            onAdd={addShoppingItem}
            onDelete={deleteShoppingItem}
            onToggle={handleToggle}
            onUpdate={updateShoppingItem}
            onUploadReceipt={handleUploadReceipt}
            filterByTaskId={filterByTaskId || undefined}
        />
    );
};

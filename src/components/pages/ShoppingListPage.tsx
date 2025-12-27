
import React from 'react';
import { ShoppingList } from '../ShoppingList';
import { useProject, useUser } from '@/contexts';
import { uploadReceipt } from '@/services/storage';

export const ShoppingListPage: React.FC = () => {
    const { activeProject, addShoppingItem, updateShoppingItem, deleteShoppingItem } = useProject();
    const { currentUser } = useUser();

    const handleUploadReceipt = async (itemId: string, file: File) => {
        if (!activeProject || !currentUser) return;
        try {
            const downloadURL = await uploadReceipt(file, currentUser.uid, activeProject.id, itemId);
            const itemToUpdate = activeProject.shoppingItems.find(i => i.id === itemId);
            if (itemToUpdate) {
                const updatedItem = { ...itemToUpdate, receiptUrl: downloadURL };
                await updateShoppingItem(updatedItem);
                // Toast handled by component or context?
            }
        } catch (error) {
            console.error("Error uploading receipt:", error);
            // Handle error (maybe pass a toast callback?)
        }
    };

    if (!activeProject) return null;

    return (
        <ShoppingList
            items={activeProject.shoppingItems}
            tasks={activeProject.tasks}
            vehicleData={activeProject.vehicleData}
            projectId={activeProject.id}
            onUploadReceipt={handleUploadReceipt}
            onAdd={addShoppingItem}
            onUpdate={updateShoppingItem}
            onDelete={deleteShoppingItem}
            onToggle={(id) => {
                const item = activeProject.shoppingItems.find(i => i.id === id);
                if (item) {
                    updateShoppingItem({ ...item, checked: !item.checked });
                }
            }}
        />
    );
};

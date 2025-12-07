
import React, { useState } from 'react';
import { ShoppingItem, Task } from '../types';
import { ShoppingBag, Plus, Trash2, CheckCircle2, Circle, ExternalLink, Image as ImageIcon, X, Link as LinkIcon, DollarSign, Calendar, Save, Loader2 } from 'lucide-react';

interface ShoppingListProps {
  items: ShoppingItem[];
  tasks?: Task[];
  onToggle: (id: string) => void;
  onAdd: (item: Omit<ShoppingItem, 'id'>) => void;
  onUpdate: (item: ShoppingItem) => void;
  onDelete: (id: string) => void;
  onUploadReceipt: (itemId: string, file: File) => Promise<void>;
}

export const ShoppingList: React.FC<ShoppingListProps> = ({ items, tasks = [], onToggle, onAdd, onUpdate, onDelete, onUploadReceipt }) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemCost, setNewItemCost] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<ShoppingItem['category']>('Reservdelar');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState<ShoppingItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Detail Modal State
  const [editActualCost, setEditActualCost] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editStore, setEditStore] = useState('');
  const [editLinkedTask, setEditLinkedTask] = useState('');

  const handleOpenDetail = (item: ShoppingItem) => {
      setSelectedItem(item);
      setEditActualCost(item.actualCost?.toString() || '');
      setEditUrl(item.url || '');
      setEditStore(item.store || '');
      setEditLinkedTask(item.linkedTaskId || '');
  };

  const handleSaveDetail = () => {
      if (!selectedItem) return;
      onUpdate({
          ...selectedItem,
          actualCost: parseInt(editActualCost) || undefined,
          url: editUrl,
          store: editStore,
          linkedTaskId: editLinkedTask,
          checked: parseInt(editActualCost) > 0 ? true : selectedItem.checked
      });
      setSelectedItem(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && selectedItem) {
          setIsUploading(true);
          try {
              await onUploadReceipt(selectedItem.id, file);
              // After upload is complete, the parent will update the item prop.
              // We can close the modal, or wait for the prop to update and show the new image.
              setSelectedItem(null); 
          } catch (error) {
              console.error("Upload failed", error);
              // Optionally, show a toast or an error message to the user
          } finally {
              setIsUploading(false);
          }
      }
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    onAdd({
      name: newItemName,
      estimatedCost: parseInt(newItemCost) || 0,
      category: newItemCategory,
      quantity: '1 st',
      checked: false
    });
    setNewItemName('');
    setNewItemCost('');
  };

  const categories = ['Reservdelar', 'Kemi & Färg', 'Verktyg', 'Inredning', 'Övrigt'];
  const totalCost = items.reduce((sum, item) => sum + (item.checked ? 0 : item.estimatedCost), 0);
  const spentCost = items.reduce((sum, item) => sum + (item.actualCost || 0), 0);

  const filteredCategories = activeFilter === 'ALL' ? categories : [activeFilter];

  return (
    <div className="space-y-6 pb-20 animate-fade-in relative">
        
      <div className="bg-gradient-to-r from-nordic-ice to-white dark:from-nordic-charcoal dark:to-nordic-dark-surface p-8 rounded-3xl border border-nordic-ice dark:border-nordic-dark-bg shadow-sm">
        {/* ... header content ... */}
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {/* ... filter tabs ... */}
      </div>

      <div className="bg-white dark:bg-nordic-dark-surface p-4 rounded-2xl border border-nordic-ice dark:border-nordic-dark-bg flex flex-col md:flex-row gap-3 shadow-sm">
        {/* ... add item form ... */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCategories.map(category => {
            const categoryItems = items.filter(i => i.category === category);
            if (categoryItems.length === 0) return null;

            return (
                <div key={category} className="bg-white dark:bg-nordic-dark-surface rounded-2xl border border-nordic-ice dark:border-nordic-dark-bg overflow-hidden animate-fade-in">
                    <div className="bg-nordic-ice/50 dark:bg-nordic-charcoal/50 p-4 border-b border-nordic-ice dark:border-nordic-dark-bg flex justify-between items-center">
                        <h4 className="font-bold text-nordic-charcoal dark:text-nordic-ice text-sm uppercase tracking-wider">{category}</h4>
                        <span className="text-xs text-slate-400 bg-white dark:bg-nordic-dark-bg px-2 py-1 rounded-md">{categoryItems.length} st</span>
                    </div>
                    <div className="divide-y divide-slate-50 dark:divide-nordic-charcoal">
                        {categoryItems.map(item => (
                            <div 
                                key={item.id} 
                                className={`p-4 flex items-center gap-3 transition-all hover:bg-slate-50 dark:hover:bg-nordic-charcoal/30 cursor-pointer group ${item.checked ? 'bg-slate-50/50 dark:bg-black/20' : ''}`}
                                onClick={() => handleOpenDetail(item)}
                            >
                               {/* ... item content ... */}
                            </div>
                        ))}
                    </div>
                </div>
            );
        })}
      </div>
      
      {selectedItem && (
          <div className="fixed inset-0 bg-nordic-charcoal/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-nordic-dark-surface w-full max-w-md rounded-3xl shadow-xl overflow-hidden animate-fade-in">
                  <div className="p-6 border-b border-slate-100 dark:border-nordic-dark-bg flex justify-between items-start">
                       <div>
                          <h3 className="font-serif font-bold text-xl text-nordic-charcoal dark:text-nordic-ice">{selectedItem.name}</h3>
                          <span className="text-xs text-slate-400 uppercase tracking-wider">{selectedItem.category}</span>
                      </div>
                      <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-nordic-charcoal rounded-full"><X size={20} className="text-slate-500" /></button>
                  </div>
                  
                  <div className="p-6 space-y-6">
                      {/* ... detail form fields ... */}

                      <div>
                          <label className="text-xs font-bold text-slate-500 block mb-2">Kvitto</label>
                          {selectedItem.receiptUrl ? (
                              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-nordic-charcoal">
                                  <a href={selectedItem.receiptUrl} target="_blank" rel="noreferrer">
                                    <img src={selectedItem.receiptUrl} alt="Kvitto" className="w-full h-48 object-cover" />
                                  </a>
                                  <button 
                                    onClick={() => onUpdate({...selectedItem, receiptUrl: undefined})}
                                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md text-rose-500"
                                  >
                                      <Trash2 size={16} />
                                  </button>
                              </div>
                          ) : (
                              <label className={`border-2 border-dashed border-slate-200 dark:border-nordic-charcoal rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 transition-colors ${isUploading ? 'bg-slate-100' : 'hover:bg-slate-50 dark:hover:bg-nordic-dark-bg cursor-pointer'}`}>
                                  {isUploading ? (
                                      <>
                                        <Loader2 className="animate-spin text-teal-500" size={24}/>
                                        <span className="text-sm mt-2">Laddar upp...</span>
                                      </>
                                  ) : (
                                      <>
                                        <ImageIcon size={24} className="mb-2" />
                                        <span className="text-sm">Ladda upp bild</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                                      </>
                                  )}
                              </label>
                          )}
                      </div>

                      <button 
                        onClick={handleSaveDetail}
                        className="w-full py-3 bg-nordic-charcoal dark:bg-teal-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-teal-700"
                      >
                          <Save size={18} /> Spara ändringar
                      </button>
                  </div>
              </div>
          </div>
      )}

      {items.length === 0 && (
          <div className="text-center py-20">
              <p className="text-slate-400">Listan är tom.</p>
          </div>
      )}

    </div>
  );
};

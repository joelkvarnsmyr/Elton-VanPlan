
import React, { useState, useMemo } from 'react';
import { ShoppingItem, Task } from '@/types/types';
import { ShoppingBag, Plus, Trash2, CheckCircle2, Circle, ExternalLink, Image as ImageIcon, X, Link as LinkIcon, DollarSign, Calendar, Save, Loader2, Store, Grid3x3 } from 'lucide-react';

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
  const [viewMode, setViewMode] = useState<'category' | 'store'>('category'); // NEW: Store Mode toggle

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

  // NEW: Store Mode - group items by store with smart sorting
  const itemsByStore = useMemo(() => {
    const storeMap = new Map<string, ShoppingItem[]>();

    items.forEach(item => {
      // Determine store from item.store or selected option
      let itemStore = item.store || 'Ospecificerad';

      if (item.options && item.selectedOptionId) {
        const selectedOption = item.options.find(opt => opt.id === item.selectedOptionId);
        if (selectedOption) {
          itemStore = selectedOption.store;
        }
      }

      if (!storeMap.has(itemStore)) {
        storeMap.set(itemStore, []);
      }
      storeMap.get(itemStore)!.push(item);
    });

    // Convert to array and sort items within each store
    return Array.from(storeMap.entries()).map(([store, storeItems]) => {
      // Separate items with/without shelf location
      const itemsWithLocation = storeItems.filter(item => {
        if (item.options && item.selectedOptionId) {
          const selectedOption = item.options.find(opt => opt.id === item.selectedOptionId);
          return selectedOption?.shelfLocation;
        }
        return false;
      });

      const itemsWithoutLocation = storeItems.filter(item => {
        if (item.options && item.selectedOptionId) {
          const selectedOption = item.options.find(opt => opt.id === item.selectedOptionId);
          return !selectedOption?.shelfLocation;
        }
        return true;
      });

      // Sort items with location by shelf
      itemsWithLocation.sort((a, b) => {
        const aOption = a.options?.find(opt => opt.id === a.selectedOptionId);
        const bOption = b.options?.find(opt => opt.id === b.selectedOptionId);
        const aLocation = aOption?.shelfLocation || '';
        const bLocation = bOption?.shelfLocation || '';
        return aLocation.localeCompare(bLocation, 'sv');
      });

      // Sort items without location by article number
      itemsWithoutLocation.sort((a, b) => {
        const aOption = a.options?.find(opt => opt.id === a.selectedOptionId);
        const bOption = b.options?.find(opt => opt.id === b.selectedOptionId);
        const aArticle = aOption?.articleNumber || '';
        const bArticle = bOption?.articleNumber || '';
        return aArticle.localeCompare(bArticle, 'sv');
      });

      const allItems = [...itemsWithLocation, ...itemsWithoutLocation];
      const totalCost = storeItems.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);

      return {
        store,
        items: allItems,
        totalCost,
        itemsWithLocation,
        itemsWithoutLocation
      };
    }).sort((a, b) => b.totalCost - a.totalCost); // Sort stores by total cost (highest first)
  }, [items]);

  return (
    <div className="space-y-6 pb-20 animate-fade-in relative">
        
      <div className="bg-gradient-to-r from-nordic-ice to-white dark:from-nordic-charcoal dark:to-nordic-dark-surface p-8 rounded-3xl border border-nordic-ice dark:border-nordic-dark-bg shadow-sm">
        {/* ... header content ... */}
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {viewMode === 'category' && categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(activeFilter === cat ? 'ALL' : cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeFilter === cat
                  ? 'bg-nordic-charcoal text-white dark:bg-teal-600'
                  : 'bg-white text-slate-500 hover:bg-slate-50 dark:bg-nordic-dark-surface dark:text-nordic-dark-muted'
              }`}
            >
              {cat}
            </button>
          ))}
          {viewMode === 'store' && itemsByStore.map(({ store }) => (
            <button
              key={store}
              onClick={() => setActiveFilter(activeFilter === store ? 'ALL' : store)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeFilter === store
                  ? 'bg-nordic-charcoal text-white dark:bg-teal-600'
                  : 'bg-white text-slate-500 hover:bg-slate-50 dark:bg-nordic-dark-surface dark:text-nordic-dark-muted'
              }`}
            >
              {store}
            </button>
          ))}
        </div>

        {/* Toggle Button */}
        <div className="flex gap-2 bg-white dark:bg-nordic-dark-surface p-1 rounded-full border border-nordic-ice dark:border-nordic-dark-bg">
          <button
            onClick={() => setViewMode('category')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
              viewMode === 'category'
                ? 'bg-nordic-charcoal text-white dark:bg-teal-600'
                : 'text-slate-500 hover:text-nordic-charcoal dark:text-nordic-dark-muted'
            }`}
          >
            <Grid3x3 size={14} />
            Kategori
          </button>
          <button
            onClick={() => setViewMode('store')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
              viewMode === 'store'
                ? 'bg-nordic-charcoal text-white dark:bg-teal-600'
                : 'text-slate-500 hover:text-nordic-charcoal dark:text-nordic-dark-muted'
            }`}
          >
            <Store size={14} />
            Butik
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-nordic-dark-surface p-4 rounded-2xl border border-nordic-ice dark:border-nordic-dark-bg flex flex-col md:flex-row gap-3 shadow-sm">
        {/* ... add item form ... */}
      </div>

      {/* Category Mode */}
      {viewMode === 'category' && (
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
                                 {/* Item rendering - kept as is */}
                                 <button onClick={(e) => { e.stopPropagation(); onToggle(item.id); }} className="flex-shrink-0">
                                    {item.checked ? <CheckCircle2 size={20} className="text-green-500" /> : <Circle size={20} className="text-slate-300" />}
                                 </button>
                                 <div className="flex-1">
                                    <p className={`font-medium ${item.checked ? 'line-through text-slate-400' : 'text-nordic-charcoal dark:text-nordic-ice'}`}>{item.name}</p>
                                    <p className="text-xs text-slate-400">{item.quantity} • {item.estimatedCost} kr</p>
                                 </div>
                              </div>
                          ))}
                      </div>
                  </div>
              );
          })}
        </div>
      )}

      {/* Store Mode */}
      {viewMode === 'store' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {itemsByStore.map(({ store, items: storeItems, totalCost, itemsWithLocation, itemsWithoutLocation }) => {
              if (activeFilter !== 'ALL' && activeFilter !== store) return null;

              return (
                  <div key={store} className="bg-white dark:bg-nordic-dark-surface rounded-2xl border border-nordic-ice dark:border-nordic-dark-bg overflow-hidden animate-fade-in">
                      <div className="bg-teal-50 dark:bg-teal-900/20 p-4 border-b border-teal-100 dark:border-teal-900/40 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                              <Store size={18} className="text-teal-600 dark:text-teal-400" />
                              <h4 className="font-bold text-nordic-charcoal dark:text-nordic-ice text-sm uppercase tracking-wider">{store}</h4>
                          </div>
                          <div className="text-right">
                              <span className="text-xs text-slate-400 block">{storeItems.length} items</span>
                              <span className="text-xs font-mono text-teal-600 dark:text-teal-400">{totalCost} kr</span>
                          </div>
                      </div>
                      <div className="divide-y divide-slate-50 dark:divide-nordic-charcoal">
                          {/* Items with shelf location first */}
                          {itemsWithLocation.map(item => {
                              const selectedOption = item.options?.find(opt => opt.id === item.selectedOptionId);
                              return (
                                  <div
                                      key={item.id}
                                      className={`p-4 flex items-center gap-3 transition-all hover:bg-slate-50 dark:hover:bg-nordic-charcoal/30 cursor-pointer group ${item.checked ? 'bg-slate-50/50 dark:bg-black/20' : ''}`}
                                      onClick={() => handleOpenDetail(item)}
                                  >
                                     <button onClick={(e) => { e.stopPropagation(); onToggle(item.id); }} className="flex-shrink-0">
                                        {item.checked ? <CheckCircle2 size={20} className="text-green-500" /> : <Circle size={20} className="text-slate-300" />}
                                     </button>
                                     <div className="flex-1">
                                        <p className={`font-medium ${item.checked ? 'line-through text-slate-400' : 'text-nordic-charcoal dark:text-nordic-ice'}`}>{item.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded font-mono">
                                                📍 {selectedOption?.shelfLocation}
                                            </span>
                                            {selectedOption?.articleNumber && (
                                                <span className="text-xs text-slate-400">Art: {selectedOption.articleNumber}</span>
                                            )}
                                        </div>
                                     </div>
                                     <span className="text-sm font-mono text-slate-600 dark:text-slate-300">{item.estimatedCost} kr</span>
                                  </div>
                              );
                          })}
                          {/* Items without shelf location */}
                          {itemsWithoutLocation.map(item => {
                              const selectedOption = item.options?.find(opt => opt.id === item.selectedOptionId);
                              return (
                                  <div
                                      key={item.id}
                                      className={`p-4 flex items-center gap-3 transition-all hover:bg-slate-50 dark:hover:bg-nordic-charcoal/30 cursor-pointer group ${item.checked ? 'bg-slate-50/50 dark:bg-black/20' : ''}`}
                                      onClick={() => handleOpenDetail(item)}
                                  >
                                     <button onClick={(e) => { e.stopPropagation(); onToggle(item.id); }} className="flex-shrink-0">
                                        {item.checked ? <CheckCircle2 size={20} className="text-green-500" /> : <Circle size={20} className="text-slate-300" />}
                                     </button>
                                     <div className="flex-1">
                                        <p className={`font-medium ${item.checked ? 'line-through text-slate-400' : 'text-nordic-charcoal dark:text-nordic-ice'}`}>{item.name}</p>
                                        {selectedOption?.articleNumber && (
                                            <p className="text-xs text-slate-400">Art: {selectedOption.articleNumber}</p>
                                        )}
                                     </div>
                                     <span className="text-sm font-mono text-slate-600 dark:text-slate-300">{item.estimatedCost} kr</span>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              );
          })}
        </div>
      )}
      
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

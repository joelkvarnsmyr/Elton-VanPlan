
import React, { useState } from 'react';
import { ShoppingItem, Task } from '../types';
import { ShoppingBag, Plus, Trash2, CheckCircle2, Circle, ExternalLink, Image as ImageIcon, X, Link as LinkIcon, DollarSign, Calendar, Save } from 'lucide-react';

interface ShoppingListProps {
  items: ShoppingItem[];
  tasks?: Task[]; // To link items to tasks
  onToggle: (id: string) => void;
  onAdd: (item: ShoppingItem) => void;
  onUpdate: (item: ShoppingItem) => void; // New prop for updates
  onDelete: (id: string) => void;
}

export const ShoppingList: React.FC<ShoppingListProps> = ({ items, tasks = [], onToggle, onAdd, onUpdate, onDelete }) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemCost, setNewItemCost] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<ShoppingItem['category']>('Reservdelar');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState<ShoppingItem | null>(null);

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
          checked: parseInt(editActualCost) > 0 ? true : selectedItem.checked // Auto-check if price added
      });
      setSelectedItem(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && selectedItem) {
          const reader = new FileReader();
          reader.onloadend = () => {
              onUpdate({
                  ...selectedItem,
                  receiptImage: reader.result as string
              });
              // Update local state if needed to show preview immediately, 
              // but selectedItem comes from props so it might lag a frame.
              // Better to rely on parent update or local preview.
          };
          reader.readAsDataURL(file);
      }
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    
    const newItem: ShoppingItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newItemName,
      estimatedCost: parseInt(newItemCost) || 0,
      category: newItemCategory,
      quantity: '1 st',
      checked: false
    };
    
    onAdd(newItem);
    setNewItemName('');
    setNewItemCost('');
  };

  const categories = ['Reservdelar', 'Kemi & Färg', 'Verktyg', 'Inredning', 'Övrigt'];
  const totalCost = items.reduce((sum, item) => sum + (item.checked ? 0 : item.estimatedCost), 0);
  const spentCost = items.reduce((sum, item) => sum + (item.actualCost || (item.checked ? item.estimatedCost : 0)), 0);

  const filteredCategories = activeFilter === 'ALL' ? categories : [activeFilter];

  return (
    <div className="space-y-6 pb-20 animate-fade-in relative">
        
      {/* Header Card */}
      <div className="bg-gradient-to-r from-nordic-ice to-white dark:from-nordic-charcoal dark:to-nordic-dark-surface p-8 rounded-3xl border border-nordic-ice dark:border-nordic-dark-bg shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h3 className="font-serif font-bold text-2xl text-nordic-charcoal dark:text-nordic-ice flex items-center gap-2">
                    <ShoppingBag className="text-teal-600" /> Inköpslista
                </h3>
                <p className="text-slate-600 dark:text-nordic-dark-muted">Håll koll på utgifterna. Klicka på en vara för detaljer.</p>
            </div>
            <div className="flex gap-4">
                <div className="text-right p-4 bg-white dark:bg-nordic-dark-bg rounded-2xl border border-slate-100 dark:border-nordic-charcoal shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Att handla för</p>
                    <p className="text-2xl font-mono font-bold text-nordic-charcoal dark:text-nordic-ice">{totalCost} kr</p>
                </div>
                <div className="text-right p-4 bg-slate-50 dark:bg-nordic-charcoal rounded-2xl border border-slate-100 dark:border-nordic-dark-bg">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verklig Utgift</p>
                    <p className="text-2xl font-mono font-bold text-teal-600 dark:text-teal-400">{spentCost} kr</p>
                </div>
            </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        <button 
           onClick={() => setActiveFilter('ALL')}
           className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeFilter === 'ALL' ? 'bg-nordic-charcoal text-white shadow-md dark:bg-teal-600' : 'bg-white text-slate-500 hover:bg-slate-50 dark:bg-nordic-dark-surface dark:text-nordic-dark-muted dark:hover:bg-nordic-charcoal'}`}
        >
          Alla
        </button>
        {categories.map(cat => (
          <button 
             key={cat}
             onClick={() => setActiveFilter(cat)}
             className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeFilter === cat ? 'bg-nordic-charcoal text-white shadow-md dark:bg-teal-600' : 'bg-white text-slate-500 hover:bg-slate-50 dark:bg-nordic-dark-surface dark:text-nordic-dark-muted dark:hover:bg-nordic-charcoal'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Add Item Input */}
      <div className="bg-white dark:bg-nordic-dark-surface p-4 rounded-2xl border border-nordic-ice dark:border-nordic-dark-bg flex flex-col md:flex-row gap-3 shadow-sm">
        <input 
            placeholder="Vad behöver du? (t.ex. Oljefilter)" 
            className="flex-[2] p-3 rounded-xl bg-slate-50 dark:bg-nordic-dark-bg border border-slate-200 dark:border-nordic-charcoal text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            value={newItemName}
            onChange={e => setNewItemName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddItem()}
        />
        <select 
            className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-nordic-dark-bg border border-slate-200 dark:border-nordic-charcoal text-sm dark:text-white focus:outline-none"
            value={newItemCategory}
            onChange={e => setNewItemCategory(e.target.value as any)}
        >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="flex gap-2">
            <input 
                type="number"
                placeholder="Est. Pris" 
                className="w-24 p-3 rounded-xl bg-slate-50 dark:bg-nordic-dark-bg border border-slate-200 dark:border-nordic-charcoal text-sm dark:text-white focus:outline-none"
                value={newItemCost}
                onChange={e => setNewItemCost(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddItem()}
            />
            <button 
                onClick={handleAddItem}
                className="bg-nordic-charcoal dark:bg-teal-600 text-white px-4 rounded-xl hover:bg-slate-800 dark:hover:bg-teal-700 transition-colors flex items-center justify-center"
            >
                <Plus size={20} />
            </button>
        </div>
      </div>

      {/* Grouped List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCategories.map(category => {
            const categoryItems = items.filter(i => i.category === category);
            if (categoryItems.length === 0 && activeFilter !== 'ALL') return <div className="text-slate-400 italic p-4 text-center col-span-full">Inga varor i denna kategori.</div>;
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
                                <button 
                                    className={`shrink-0 transition-colors ${item.checked ? 'text-teal-600' : 'text-slate-300 group-hover:text-slate-400'}`}
                                    onClick={(e) => { e.stopPropagation(); onToggle(item.id); }}
                                >
                                    {item.checked ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                                </button>
                                <div className="flex-1 min-w-0">
                                    <p className={`font-medium text-sm truncate ${item.checked ? 'text-slate-400 line-through decoration-slate-300' : 'text-nordic-charcoal dark:text-nordic-ice'}`}>
                                        {item.name}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <span>{item.quantity !== '1 st' ? `${item.quantity} • ` : ''}</span>
                                        {item.actualCost ? (
                                            <span className="text-teal-600 font-bold">{item.actualCost} kr (Köpt)</span>
                                        ) : (
                                            <span>Est: {item.estimatedCost} kr</span>
                                        )}
                                    </div>
                                </div>
                                
                                {item.url && (
                                    <a 
                                        href={item.url} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-2 text-teal-600 hover:bg-teal-50 rounded-full"
                                    >
                                        <ExternalLink size={16} />
                                    </a>
                                )}

                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                    className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            );
        })}
      </div>
      
      {/* Detail Modal */}
      {selectedItem && (
          <div className="fixed inset-0 bg-nordic-charcoal/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-nordic-dark-surface w-full max-w-md rounded-3xl shadow-xl overflow-hidden animate-fade-in">
                  <div className="p-6 border-b border-slate-100 dark:border-nordic-dark-bg flex justify-between items-start">
                      <div>
                          <h3 className="font-serif font-bold text-xl text-nordic-charcoal dark:text-nordic-ice">{selectedItem.name}</h3>
                          <span className="text-xs text-slate-400 uppercase tracking-wider">{selectedItem.category}</span>
                      </div>
                      <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-nordic-charcoal rounded-full">
                          <X size={20} className="text-slate-500" />
                      </button>
                  </div>
                  
                  <div className="p-6 space-y-6">
                      
                      {/* Cost Section */}
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 dark:bg-nordic-dark-bg p-3 rounded-xl border border-slate-100 dark:border-nordic-charcoal">
                              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Verkligt Pris (kr)</label>
                              <div className="flex items-center gap-2">
                                  <DollarSign size={16} className="text-teal-600" />
                                  <input 
                                    className="bg-transparent w-full font-mono font-bold text-nordic-charcoal dark:text-nordic-ice focus:outline-none"
                                    placeholder="0"
                                    value={editActualCost}
                                    onChange={e => setEditActualCost(e.target.value)}
                                  />
                              </div>
                          </div>
                          <div className="bg-slate-50 dark:bg-nordic-dark-bg p-3 rounded-xl border border-slate-100 dark:border-nordic-charcoal">
                              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Inköpsställe</label>
                              <div className="flex items-center gap-2">
                                  <ShoppingBag size={16} className="text-slate-400" />
                                  <input 
                                    className="bg-transparent w-full text-sm text-nordic-charcoal dark:text-nordic-ice focus:outline-none"
                                    placeholder="Butik..."
                                    value={editStore}
                                    onChange={e => setEditStore(e.target.value)}
                                  />
                              </div>
                          </div>
                      </div>

                      {/* URL Section */}
                      <div>
                          <label className="text-xs font-bold text-slate-500 block mb-2">Webblänk</label>
                          <div className="flex gap-2">
                              <input 
                                className="flex-1 p-2 bg-slate-50 dark:bg-nordic-dark-bg border border-slate-200 dark:border-nordic-charcoal rounded-lg text-sm dark:text-white"
                                placeholder="https://..."
                                value={editUrl}
                                onChange={e => setEditUrl(e.target.value)}
                              />
                              {editUrl && (
                                  <a href={editUrl} target="_blank" rel="noreferrer" className="p-2 bg-nordic-ice dark:bg-nordic-charcoal rounded-lg text-teal-600">
                                      <ExternalLink size={20} />
                                  </a>
                              )}
                          </div>
                      </div>

                      {/* Task Link Section */}
                      <div>
                          <label className="text-xs font-bold text-slate-500 block mb-2 flex items-center gap-1">
                              <LinkIcon size={12} /> Koppla till Uppgift (Budget)
                          </label>
                          <select 
                            className="w-full p-2 bg-slate-50 dark:bg-nordic-dark-bg border border-slate-200 dark:border-nordic-charcoal rounded-lg text-sm dark:text-white"
                            value={editLinkedTask}
                            onChange={e => setEditLinkedTask(e.target.value)}
                          >
                              <option value="">Ingen koppling</option>
                              {tasks.map(t => (
                                  <option key={t.id} value={t.id}>{t.title}</option>
                              ))}
                          </select>
                          <p className="text-[10px] text-slate-400 mt-1">Kostnaden läggs till på uppgiftens utfall.</p>
                      </div>

                      {/* Receipt Upload */}
                      <div>
                          <label className="text-xs font-bold text-slate-500 block mb-2">Kvitto</label>
                          {selectedItem.receiptImage ? (
                              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-nordic-charcoal">
                                  <img src={selectedItem.receiptImage} alt="Kvitto" className="w-full h-48 object-cover" />
                                  <button 
                                    onClick={() => onUpdate({...selectedItem, receiptImage: undefined})}
                                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md text-rose-500"
                                  >
                                      <Trash2 size={16} />
                                  </button>
                              </div>
                          ) : (
                              <label className="border-2 border-dashed border-slate-200 dark:border-nordic-charcoal rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-nordic-dark-bg transition-colors cursor-pointer">
                                  <ImageIcon size={24} className="mb-2" />
                                  <span className="text-sm">Ladda upp bild</span>
                                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
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
              <p className="text-slate-400">Listan är tom. Be Elton lägga till något eller skriv in själv!</p>
          </div>
      )}

    </div>
  );
};

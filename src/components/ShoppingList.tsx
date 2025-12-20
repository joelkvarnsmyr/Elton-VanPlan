
import React, { useState, useMemo } from 'react';
import { ShoppingItem, Task, VendorOption, ShoppingItemStatus, VehicleData, ChatContext } from '@/types/types';
import { ShoppingBag, Plus, ExternalLink, Circle, CheckCircle2, MessageCircle, X, ChevronDown, Layers, ListTodo, Tags, Store, Trash2 } from 'lucide-react';
import { ContextualChat } from './ContextualChat';

interface ShoppingListProps {
  items: ShoppingItem[];
  tasks?: Task[];
  vehicleData?: VehicleData;
  onToggle: (id: string) => void;
  onAdd: (item: Omit<ShoppingItem, 'id'>) => void;
  onUpdate: (item: ShoppingItem) => void;
  onDelete: (id: string) => void;
  onUploadReceipt: (itemId: string, file: File) => Promise<void>;
  filterByTaskId?: string;
}

type ViewMode = 'category' | 'task' | 'store';

export const ShoppingList: React.FC<ShoppingListProps> = ({
  items,
  tasks = [],
  vehicleData,
  onToggle,
  onAdd,
  onUpdate,
  onDelete,
  onUploadReceipt,
  filterByTaskId
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemCost, setNewItemCost] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<ShoppingItem['category']>('Reservdelar');
  const [activeFilter, setActiveFilter] = useState('Alla');
  const [viewMode, setViewMode] = useState<ViewMode>('category');
  const [selectedItem, setSelectedItem] = useState<ShoppingItem | null>(null);
  const [chatContext, setChatContext] = useState<ChatContext | null>(null);

  const categories = ['Reservdelar', 'Kemi & Färg', 'Verktyg', 'Inredning', 'Övrigt'];

  const openChatForItem = (item: ShoppingItem) => {
    if (!vehicleData) return;
    setChatContext({
      type: 'shopping_item',
      item,
      vehicleData,
      relatedTasks: tasks
    });
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    onAdd({
      name: newItemName,
      estimatedCost: parseInt(newItemCost) || 0,
      category: newItemCategory,
      quantity: '1 st',
      checked: false,
      status: ShoppingItemStatus.RESEARCH
    });
    setNewItemName('');
    setNewItemCost('');
  };

  // Apply task filter first
  const filteredItems = filterByTaskId
    ? items.filter(i => i.linkedTaskId === filterByTaskId)
    : items;

  // Get task name by ID
  const getTaskName = (taskId?: string) => {
    if (!taskId) return 'Okopplad';
    const task = tasks.find(t => t.id === taskId);
    return task?.title || 'Okopplad';
  };

  // Get task phase by ID
  const getTaskPhase = (taskId?: string) => {
    if (!taskId) return null;
    const task = tasks.find(t => t.id === taskId);
    return task?.phase;
  };

  // Dynamic grouping based on view mode
  const groupedItems = useMemo(() => {
    const groups = new Map<string, ShoppingItem[]>();

    filteredItems.forEach(item => {
      let groupKey: string;

      switch (viewMode) {
        case 'task':
          groupKey = getTaskName(item.linkedTaskId);
          break;
        case 'store':
          groupKey = item.store || 'Ingen butik vald';
          break;
        case 'category':
        default:
          groupKey = item.category || 'Övrigt';
      }

      // Apply category filter if active
      if (activeFilter !== 'Alla' && viewMode === 'category' && groupKey !== activeFilter) {
        return;
      }

      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(item);
    });

    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredItems, viewMode, activeFilter]);

  // Calculate totals
  const totalEstimated = filteredItems.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);
  const totalActual = filteredItems.reduce((sum, item) => sum + (item.actualCost || 0), 0);
  const completedCount = filteredItems.filter(i => i.checked).length;

  return (
    <div className="min-h-screen bg-[#f5f3f0] pb-24 sm:pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          {/* Summary bar - mobile optimized */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-slate-500">
                <span className="font-bold text-slate-700">{completedCount}</span>/{filteredItems.length} klara
              </span>
              <span className="hidden sm:inline text-sm text-slate-400">•</span>
              <span className="text-xs sm:text-sm text-slate-500">
                Est: <span className="font-mono font-bold text-slate-700">{totalEstimated.toLocaleString()}</span> kr
              </span>
            </div>

            {/* View mode toggle */}
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('category')}
                className={`p-1.5 sm:px-2 sm:py-1 rounded-md text-xs flex items-center gap-1 ${viewMode === 'category' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-500'}`}
                title="Visa per kategori"
              >
                <Tags size={14} />
                <span className="hidden sm:inline">Kategori</span>
              </button>
              <button
                onClick={() => setViewMode('task')}
                className={`p-1.5 sm:px-2 sm:py-1 rounded-md text-xs flex items-center gap-1 ${viewMode === 'task' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-500'}`}
                title="Visa per task"
              >
                <ListTodo size={14} />
                <span className="hidden sm:inline">Task</span>
              </button>
              <button
                onClick={() => setViewMode('store')}
                className={`p-1.5 sm:px-2 sm:py-1 rounded-md text-xs flex items-center gap-1 ${viewMode === 'store' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-500'}`}
                title="Visa per butik"
              >
                <Store size={14} />
                <span className="hidden sm:inline">Butik</span>
              </button>
            </div>
          </div>

          {/* Category tabs - horizontal scroll on mobile */}
          {viewMode === 'category' && (
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
              {['Alla', ...categories].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${activeFilter === cat
                      ? 'bg-[#2c2c2c] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Add new item bar - responsive */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 bg-[#f5f3f0] rounded-lg p-3 mt-3">
            <input
              placeholder="Vad behöver du?"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400"
            />
            <div className="flex gap-2">
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value as ShoppingItem['category'])}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs sm:text-sm text-slate-700 outline-none flex-1 sm:flex-none"
                aria-label="Välj kategori"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <input
                type="number"
                placeholder="Pris"
                value={newItemCost}
                onChange={(e) => setNewItemCost(e.target.value)}
                className="w-20 sm:w-24 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs sm:text-sm text-slate-700 outline-none"
              />
              <button
                onClick={handleAddItem}
                disabled={!newItemName.trim()}
                className="bg-[#2c2c2c] text-white rounded-full p-2 hover:bg-[#1a1a1a] disabled:opacity-50 transition-all"
                aria-label="Lägg till"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Items list */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {groupedItems.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <ShoppingBag size={40} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-400 text-base sm:text-lg">Inga items att visa</p>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Lägg till din första item ovan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {groupedItems.map(([groupName, groupItems]) => (
              <div key={groupName} className="space-y-2 sm:space-y-3">
                {/* Group header */}
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate pr-2">
                    {groupName}
                  </h3>
                  <span className="text-xs text-slate-400 flex-shrink-0">{groupItems.length} st</span>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {groupItems.map(item => {
                    const linkedTask = tasks.find(t => t.id === item.linkedTaskId);

                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`bg-white rounded-lg p-3 sm:p-4 flex items-center gap-2 sm:gap-3 hover:shadow-md transition-all cursor-pointer active:scale-[0.99] ${item.checked ? 'opacity-60' : ''
                          }`}
                      >
                        {/* Checkbox */}
                        <button
                          onClick={(e) => { e.stopPropagation(); onToggle(item.id); }}
                          className="flex-shrink-0 touch-manipulation"
                          aria-label={item.checked ? 'Markera som ej köpt' : 'Markera som köpt'}
                        >
                          {item.checked ? (
                            <CheckCircle2 size={22} className="text-green-500" />
                          ) : (
                            <Circle size={22} className="text-slate-300" />
                          )}
                        </button>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${item.checked ? 'text-slate-400 line-through' : 'text-slate-700'
                            }`}>
                            {item.name}
                          </p>
                          <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 flex-wrap">
                            {item.quantity && (
                              <span className="text-[10px] sm:text-xs text-slate-400">{item.quantity}</span>
                            )}
                            {item.estimatedCost > 0 && (
                              <>
                                <span className="text-[10px] text-slate-300">•</span>
                                <span className="text-[10px] sm:text-xs text-slate-500 font-mono">{item.estimatedCost} kr</span>
                              </>
                            )}
                            {linkedTask && viewMode !== 'task' && (
                              <>
                                <span className="text-[10px] text-slate-300">•</span>
                                <span className="text-[10px] sm:text-xs text-blue-500 truncate max-w-[100px]">{linkedTask.title}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Quick actions */}
                        <div className="flex gap-1 flex-shrink-0">
                          {vehicleData && (
                            <button
                              onClick={(e) => { e.stopPropagation(); openChatForItem(item); }}
                              className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                              title="Prata med ELTON"
                            >
                              <MessageCircle size={16} />
                            </button>
                          )}
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-full transition-colors"
                              onClick={(e) => e.stopPropagation()}
                              title="Öppna länk"
                            >
                              <ExternalLink size={16} />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={() => setSelectedItem(null)}>
          <div
            className="bg-white w-full sm:w-[500px] sm:max-h-[80vh] max-h-[85vh] rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-4">
                <h3 className="font-bold text-lg text-slate-800 truncate">{selectedItem.name}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{selectedItem.category}</span>
                  {selectedItem.store && (
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{selectedItem.store}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 hover:bg-slate-100 rounded-full"
                aria-label="Stäng"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[60vh]">
              {/* Price & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] uppercase text-slate-400 font-bold">Estimerat</p>
                  <p className="text-xl font-mono font-bold text-slate-700">{selectedItem.estimatedCost || 0} kr</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] uppercase text-slate-400 font-bold">Faktiskt</p>
                  <p className="text-xl font-mono font-bold text-green-600">{selectedItem.actualCost || '–'} kr</p>
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Antal</span>
                <span className="text-sm font-medium text-slate-700">{selectedItem.quantity || '1 st'}</span>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500">Status</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${selectedItem.checked
                    ? 'bg-green-100 text-green-700'
                    : selectedItem.status === ShoppingItemStatus.DECIDED
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                  {selectedItem.checked ? 'Köpt' : selectedItem.status || 'Jämför'}
                </span>
              </div>

              {/* Linked Task */}
              {selectedItem.linkedTaskId && (
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500">Kopplad uppgift</span>
                  <span className="text-sm font-medium text-blue-600 truncate max-w-[200px]">
                    {getTaskName(selectedItem.linkedTaskId)}
                  </span>
                </div>
              )}

              {/* Vendor Options */}
              {selectedItem.options && selectedItem.options.length > 0 && (
                <div>
                  <p className="text-xs uppercase text-slate-400 font-bold mb-2">Jämför alternativ</p>
                  <div className="space-y-2">
                    {selectedItem.options.map((opt, idx) => (
                      <div key={idx} className={`p-3 rounded-lg border ${selectedItem.selectedOptionId === opt.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200'
                        }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{opt.store}</span>
                          <span className="font-mono text-sm font-bold">{opt.totalCost} kr</span>
                        </div>
                        {opt.shelfLocation && (
                          <p className="text-xs text-slate-500 mt-1">📍 {opt.shelfLocation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* URL */}
              {selectedItem.url && (
                <a
                  href={selectedItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-2 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200 transition-colors"
                >
                  Öppna produktlänk ↗
                </a>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-slate-100 flex gap-2">
              {vehicleData && (
                <button
                  onClick={() => { openChatForItem(selectedItem); setSelectedItem(null); }}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} /> Prata med ELTON
                </button>
              )}
              <button
                onClick={() => { onDelete(selectedItem.id); setSelectedItem(null); }}
                className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"
                aria-label="Ta bort"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contextual Chat Modal */}
      {chatContext && (
        <ContextualChat
          context={chatContext}
          onClose={() => setChatContext(null)}
          onUpdateItem={(updatedItem) => {
            onUpdate(updatedItem);
            setChatContext(prev => prev ? { ...prev, item: updatedItem } : null);
          }}
        />
      )}
    </div>
  );
};

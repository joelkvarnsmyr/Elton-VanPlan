
import React, { useState, useMemo } from 'react';
import { ShoppingItem, Task, VendorOption, ShoppingItemStatus, VehicleData, ChatContext } from '@/types/types';
import { ShoppingBag, Plus, ExternalLink, Circle, CheckCircle2, MessageCircle, X, ChevronDown, Layers, ListTodo, Tags, Store, Trash2, Save, Edit2 } from 'lucide-react';
import { ContextualChat } from './ContextualChat';

// Item Detail/Edit Modal Component
interface ItemDetailModalProps {
  item: ShoppingItem;
  tasks: Task[];
  categories: string[];
  vehicleData?: VehicleData;
  onSave: (item: ShoppingItem) => void;
  onDelete: () => void;
  onClose: () => void;
  onOpenChat: () => void;
}

const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  tasks,
  categories,
  vehicleData,
  onSave,
  onDelete,
  onClose,
  onOpenChat
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: item.name,
    estimatedCost: item.estimatedCost || 0,
    actualCost: item.actualCost || 0,
    quantity: item.quantity || '1 st',
    store: item.store || '',
    category: (item.category || 'Övrigt') as ShoppingItem['category'],
    url: item.url || '',
    linkedTaskId: item.linkedTaskId || '',
    status: item.status || ShoppingItemStatus.RESEARCH
  });

  const handleSave = () => {
    onSave({
      ...item,
      name: editData.name,
      estimatedCost: editData.estimatedCost,
      actualCost: editData.actualCost || undefined,
      quantity: editData.quantity,
      store: editData.store || undefined,
      category: editData.category as ShoppingItem['category'],
      url: editData.url || undefined,
      linkedTaskId: editData.linkedTaskId || undefined,
      status: editData.status
    });
    setIsEditing(false);
  };

  const getTaskName = (taskId?: string) => {
    if (!taskId) return '';
    const task = tasks.find(t => t.id === taskId);
    return task?.title || '';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white w-full sm:w-[500px] sm:max-h-[85vh] max-h-[90vh] rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-slate-800">
              {isEditing ? 'Redigera' : 'Detaljer'}
            </h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
                title="Redigera"
              >
                <Edit2 size={16} className="text-slate-500" />
              </button>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full" aria-label="Stäng">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Produktnamn</label>
            {isEditing ? (
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            ) : (
              <p className="text-base font-medium text-slate-800">{item.name}</p>
            )}
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Estimerat pris</label>
              {isEditing ? (
                <input
                  type="number"
                  value={editData.estimatedCost}
                  onChange={(e) => setEditData(prev => ({ ...prev, estimatedCost: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <p className="text-xl font-mono font-bold text-slate-700">{item.estimatedCost || 0} kr</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Faktiskt pris</label>
              {isEditing ? (
                <input
                  type="number"
                  value={editData.actualCost || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, actualCost: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <p className="text-xl font-mono font-bold text-green-600">{item.actualCost || '–'} kr</p>
              )}
            </div>
          </div>

          {/* Quantity & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Antal</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.quantity}
                  onChange={(e) => setEditData(prev => ({ ...prev, quantity: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <p className="text-sm text-slate-700">{item.quantity || '1 st'}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Kategori</label>
              {isEditing ? (
                <select
                  value={editData.category}
                  onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value as ShoppingItem['category'] }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  aria-label="Välj kategori"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              ) : (
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{item.category}</span>
              )}
            </div>
          </div>

          {/* Store */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Butik</label>
            {isEditing ? (
              <input
                type="text"
                value={editData.store}
                onChange={(e) => setEditData(prev => ({ ...prev, store: e.target.value }))}
                placeholder="T.ex. Biltema, Jula..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            ) : (
              <p className="text-sm text-slate-700">{item.store || '–'}</p>
            )}
          </div>

          {/* URL */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Produktlänk</label>
            {isEditing ? (
              <input
                type="url"
                value={editData.url}
                onChange={(e) => setEditData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            ) : item.url ? (
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate block">
                {item.url}
              </a>
            ) : (
              <p className="text-sm text-slate-400">Ingen länk</p>
            )}
          </div>

          {/* Linked Task */}
          <div>
            <label htmlFor="edit-linked-task" className="block text-xs font-bold text-slate-400 uppercase mb-1">Kopplad uppgift</label>
            {isEditing ? (
              <select
                id="edit-linked-task"
                value={editData.linkedTaskId}
                onChange={(e) => setEditData(prev => ({ ...prev, linkedTaskId: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Ingen koppling</option>
                {tasks.map(task => <option key={task.id} value={task.id}>{task.title}</option>)}
              </select>
            ) : (
              <p className="text-sm text-blue-600">{getTaskName(item.linkedTaskId) || '–'}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Status</label>
            {isEditing ? (
              <select
                value={editData.status}
                onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value as ShoppingItemStatus }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value={ShoppingItemStatus.RESEARCH}>Jämför</option>
                <option value={ShoppingItemStatus.DECIDED}>Bestämt</option>
                <option value={ShoppingItemStatus.BOUGHT}>Köpt</option>
              </select>
            ) : (
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.checked ? 'bg-green-100 text-green-700'
                : item.status === ShoppingItemStatus.DECIDED ? 'bg-blue-100 text-blue-700'
                  : 'bg-amber-100 text-amber-700'
                }`}>
                {item.checked ? 'Köpt' : item.status || 'Jämför'}
              </span>
            )}
          </div>

          {/* Vendor Options (view only) */}
          {!isEditing && item.options && item.options.length > 0 && (
            <div>
              <p className="text-xs uppercase text-slate-400 font-bold mb-2">Jämför alternativ</p>
              <div className="space-y-2">
                {item.options.map((opt, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border ${item.selectedOptionId === opt.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{opt.store}</span>
                      <span className="font-mono text-sm font-bold">{opt.totalCost} kr</span>
                    </div>
                    {opt.shelfLocation && <p className="text-xs text-slate-500 mt-1">📍 {opt.shelfLocation}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 flex gap-2 bg-slate-50">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-300"
              >
                Avbryt
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium text-sm hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Save size={16} /> Spara
              </button>
            </>
          ) : (
            <>
              {vehicleData && (
                <button
                  onClick={onOpenChat}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} /> Prata med ELTON
                </button>
              )}
              <button
                onClick={() => setIsEditing(true)}
                className="py-3 px-4 bg-slate-200 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-300 flex items-center justify-center gap-2"
              >
                <Edit2 size={16} /> Redigera
              </button>
              <button
                onClick={onDelete}
                className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"
                aria-label="Ta bort"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ShoppingList Props
interface ShoppingListProps {
  items: ShoppingItem[];
  tasks: Task[];
  vehicleData: VehicleData;
  projectId: string; // Added prop
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
  projectId,
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

  // New filter states
  const [statusFilter, setStatusFilter] = useState<'all' | ShoppingItemStatus>('all');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');

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

  // Get unique phases from tasks
  const availablePhases = useMemo(() => {
    const phases = new Set<string>();
    tasks.forEach(task => {
      if (task.phase) phases.add(task.phase);
      if (task.mechanicalPhase) phases.add(task.mechanicalPhase);
      if (task.buildPhase) phases.add(task.buildPhase);
    });
    return Array.from(phases).sort();
  }, [tasks]);

  // Apply all filters
  const filteredItems = useMemo(() => {
    let filtered = filterByTaskId
      ? items.filter(i => i.linkedTaskId === filterByTaskId)
      : items;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => {
        const itemStatus = item.status || (item.checked ? ShoppingItemStatus.BOUGHT : ShoppingItemStatus.RESEARCH);
        return itemStatus === statusFilter;
      });
    }

    // Phase filter
    if (phaseFilter !== 'all') {
      filtered = filtered.filter(item => {
        if (!item.linkedTaskId) return false;
        const task = tasks.find(t => t.id === item.linkedTaskId);
        if (!task) return false;
        return task.phase === phaseFilter || task.mechanicalPhase === phaseFilter || task.buildPhase === phaseFilter;
      });
    }

    return filtered;
  }, [items, filterByTaskId, statusFilter, phaseFilter, tasks]);

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

          {/* Filter controls */}
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            {/* Status filter */}
            <div className="flex-1">
              <label htmlFor="filter-status" className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
              <select
                id="filter-status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | ShoppingItemStatus)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Alla</option>
                <option value={ShoppingItemStatus.RESEARCH}>🔍 Jämför</option>
                <option value={ShoppingItemStatus.DECIDED}>✓ Bestämt</option>
                <option value={ShoppingItemStatus.BOUGHT}>✓ Köpt</option>
              </select>
            </div>

            {/* Phase filter */}
            <div className="flex-1">
              <label htmlFor="filter-phase" className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fas</label>
              <select
                id="filter-phase"
                value={phaseFilter}
                onChange={(e) => setPhaseFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Alla faser</option>
                {availablePhases.map(phase => (
                  <option key={phase} value={phase}>{phase}</option>
                ))}
              </select>
            </div>

            {/* Clear filters button */}
            {(statusFilter !== 'all' || phaseFilter !== 'all') && (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setPhaseFilter('all');
                }}
                className="self-end px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap"
              >
                Rensa filter
              </button>
            )}
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

      {/* Item Detail/Edit Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          tasks={tasks}
          categories={categories}
          vehicleData={vehicleData}
          onSave={(updated) => {
            onUpdate(updated);
            setSelectedItem(updated);
          }}
          onDelete={() => {
            onDelete(selectedItem.id);
            setSelectedItem(null);
          }}
          onClose={() => setSelectedItem(null)}
          onOpenChat={() => {
            openChatForItem(selectedItem);
            setSelectedItem(null);
          }}
        />
      )}

      {/* Contextual Chat Modal */}
      {chatContext && (
        <ContextualChat
          context={chatContext}
          projectId={projectId}
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

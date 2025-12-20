
import React, { useState, useMemo } from 'react';
import { ShoppingItem, Task, VendorOption, ShoppingItemStatus, VehicleData, ChatContext } from '@/types/types';
import { ShoppingBag, Plus, ExternalLink, Circle, CheckCircle2, MessageCircle } from 'lucide-react';
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
  const [chatContext, setChatContext] = useState<ChatContext | null>(null);

  const openChatForItem = (item: ShoppingItem) => {
    if (!vehicleData) return;
    setChatContext({
      type: 'shopping_item',
      item,
      vehicleData,
      relatedTasks: tasks
    });
  };

  const categories = ['Reservdelar', 'Kemi & Färg', 'Verktyg', 'Inredning', 'Övrigt'];

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

  // Apply filters
  let filteredItems = filterByTaskId
    ? items.filter(i => i.linkedTaskId === filterByTaskId)
    : items;

  // Group by category
  const itemsByCategory = useMemo(() => {
    const categoryMap = new Map<string, ShoppingItem[]>();

    // If a specific category is selected, only show that category
    const categoriesToShow = activeFilter === 'Alla' ? categories : [activeFilter];

    categoriesToShow.forEach(cat => {
      const categoryItems = filteredItems.filter(item => item.category === cat);
      if (categoryItems.length > 0) {
        categoryMap.set(cat, categoryItems);
      }
    });

    return Array.from(categoryMap.entries());
  }, [filteredItems, activeFilter, categories]);

  return (
    <div className="min-h-screen bg-[#f5f3f0] pb-20">
      {/* Header with tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            {['Alla', ...categories].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === cat
                  ? 'bg-[#2c2c2c] text-white'
                  : 'bg-transparent text-slate-600 hover:bg-slate-100'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Add new item bar */}
          <div className="flex items-center gap-3 bg-[#f5f3f0] rounded-lg p-3">
            <input
              placeholder="Vad behöver du? (t.ex. Oljefilter)"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400"
            />
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value as ShoppingItem['category'])}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input
              type="number"
              placeholder="Est. Pris"
              value={newItemCost}
              onChange={(e) => setNewItemCost(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              className="w-28 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none"
            />
            <button
              onClick={handleAddItem}
              disabled={!newItemName.trim()}
              className="bg-[#2c2c2c] text-white rounded-full p-2 hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Items grid */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {itemsByCategory.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-400 text-lg">Inga items att visa</p>
            <p className="text-slate-400 text-sm mt-1">Lägg till din första item ovan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {itemsByCategory.map(([category, categoryItems]) => (
              <div key={category} className="space-y-3">
                {/* Category header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {category}
                  </h3>
                  <span className="text-xs text-slate-400">{categoryItems.length} st</span>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {categoryItems.map(item => (
                    <div
                      key={item.id}
                      className={`bg-white rounded-lg p-4 flex items-center gap-3 hover:shadow-sm transition-all ${item.checked ? 'opacity-60' : ''
                        }`}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => onToggle(item.id)}
                        className="flex-shrink-0"
                      >
                        {item.checked ? (
                          <CheckCircle2 size={20} className="text-green-500" />
                        ) : (
                          <Circle size={20} className="text-slate-300 hover:text-slate-400" />
                        )}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${item.checked ? 'text-slate-400 line-through' : 'text-slate-700'
                          }`}>
                          {item.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {item.quantity && (
                            <span className="text-xs text-slate-400">{item.quantity}</span>
                          )}
                          {item.quantity && item.estimatedCost > 0 && (
                            <span className="text-xs text-slate-300">•</span>
                          )}
                          {item.estimatedCost > 0 && (
                            <span className="text-xs text-slate-500">Est: {item.estimatedCost} kr</span>
                          )}
                        </div>
                      </div>

                      {/* Chat button */}
                      {vehicleData && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openChatForItem(item);
                          }}
                          className="flex-shrink-0 text-blue-500 hover:text-blue-600 transition-colors"
                          title="Prata med ELTON om detta"
                        >
                          <MessageCircle size={16} />
                        </button>
                      )}

                      {/* Link icon */}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

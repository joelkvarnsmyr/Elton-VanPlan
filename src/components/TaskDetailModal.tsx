
import React, { useState, useMemo } from 'react';
import { Task, Link, Comment, Attachment, Subtask, ShoppingItem, VehicleData, TaskStatus, ChatContext } from '@/types/types';
import { X, ExternalLink, Plus, MessageSquare, Paperclip, Trash2, Send, Save, FileText, Lightbulb, Check, XCircle, ListChecks, CheckCircle2, Circle, BookOpen, Wrench, ShoppingBag, Archive, MessageCircle } from 'lucide-react';
import { KNOWLEDGE_ARTICLES } from '@/constants/constants';
import { ContextualChat } from './ContextualChat';

interface TaskDetailModalProps {
    task: Task;
    vehicleData: VehicleData;
    shoppingItems: ShoppingItem[];
    onUpdate: (task: Task) => void;
    onAddShoppingItem?: (item: Omit<ShoppingItem, 'id'>) => void;
    onDelete?: (taskId: string) => void;
    onAskElton?: (taskContext: string) => void;
    onClose: () => void;
    availablePhases?: string[];
}


export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, vehicleData, shoppingItems, onUpdate, onAddShoppingItem, onDelete, onAskElton, onClose, availablePhases }) => {
    const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'decision'>('details');
    const [newComment, setNewComment] = useState('');
    const [newLinkTitle, setNewLinkTitle] = useState('');
    const [newLinkUrl, setNewLinkUrl] = useState('');
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [newShoppingItemName, setNewShoppingItemName] = useState('');
    const [newShoppingItemCost, setNewShoppingItemCost] = useState('');
    const [showAddShopping, setShowAddShopping] = useState(false);
    const [chatContext, setChatContext] = useState<ChatContext | null>(null);

    const openChatForTask = () => {
        const linkedItems = shoppingItems.filter(i => i.linkedTaskId === task.id);
        setChatContext({
            type: 'task',
            task,
            vehicleData,
            relatedItems: linkedItems,
            availablePhases
        });
    };

    // Local state edit fields
    const [editedDescription, setEditedDescription] = useState(task.description);
    const [editedActualCost, setEditedActualCost] = useState(task.actualCost.toString());

    const hasDecisionOptions = task.decisionOptions && task.decisionOptions.length > 0;

    // Ensure subtasks exists (migration for old tasks)
    const subtasks = task.subtasks || [];
    const completedSubtasks = subtasks.filter(s => s.completed).length;
    const progress = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

    // --- SMART CONTEXT LOGIC ---
    const smartContext = useMemo(() => {
        const keywords = task.title.toLowerCase().split(' ').filter(w => w.length > 3);
        const context: any = {
            specs: [],
            articles: [],
            inventory: []
        };

        // 1. Find Vehicle Specs
        if (keywords.some(k => 'däck hjul fälg bult'.includes(k))) {
            context.specs.push({ label: 'Bultmönster', value: vehicleData.wheels.boltPattern });
            context.specs.push({ label: 'Däckdimension', value: vehicleData.wheels.tiresFront });
        }
        if (keywords.some(k => 'olja filter service motor'.includes(k))) {
            context.specs.push({ label: 'Motorolja', value: '10W-40 Mineral' }); // Generic or specific if available
            context.specs.push({ label: 'Volym', value: vehicleData.engine.volume });
        }
        if (keywords.some(k => 'växellåda låda växel'.includes(k))) {
            context.specs.push({ label: 'Växellåda', value: vehicleData.gearbox });
        }
        if (keywords.some(k => 'last vikt lasta'.includes(k))) {
            context.specs.push({ label: 'Max Lastvikt', value: `${vehicleData.weights.load} kg` });
        }

        // 2. Find Relevant Articles
        context.articles = KNOWLEDGE_ARTICLES.filter(article => {
            const contentLower = article.content.toLowerCase();
            return keywords.some(k => contentLower.includes(k));
        });

        // 3. Find Inventory (Shopping List items by keyword match)
        context.inventory = shoppingItems.filter(item => {
            return keywords.some(k => item.name.toLowerCase().includes(k));
        });

        // 4. NEW: Find items directly linked to this task
        context.linkedItems = shoppingItems.filter(item => item.linkedTaskId === task.id);

        return context;
    }, [task.id, task.title, vehicleData, shoppingItems]);


    const handleSaveDetails = () => {
        onUpdate({
            ...task,
            description: editedDescription,
            actualCost: parseInt(editedActualCost) || 0
        });
    };

    const handleAddSubtask = () => {
        if (!newSubtaskTitle.trim()) return;
        const subtask: Subtask = {
            id: Math.random().toString(36).substr(2, 9),
            title: newSubtaskTitle,
            completed: false
        };
        onUpdate({
            ...task,
            subtasks: [...subtasks, subtask]
        });
        setNewSubtaskTitle('');
    };

    const handleToggleSubtask = (id: string) => {
        onUpdate({
            ...task,
            subtasks: subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s)
        });
    };

    const handleDeleteSubtask = (id: string) => {
        onUpdate({
            ...task,
            subtasks: subtasks.filter(s => s.id !== id)
        });
    };

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        const comment: Comment = {
            id: Math.random().toString(36).substr(2, 9),
            text: newComment,
            createdAt: new Date().toISOString(),
            author: 'user'
        };
        onUpdate({
            ...task,
            comments: [...task.comments, comment]
        });
        setNewComment('');
    };

    const handleAddLink = () => {
        if (!newLinkUrl.trim()) return;
        const link: Link = {
            id: Math.random().toString(36).substr(2, 9),
            title: newLinkTitle || newLinkUrl,
            url: newLinkUrl.startsWith('http') ? newLinkUrl : `https://${newLinkUrl}`
        };
        onUpdate({
            ...task,
            links: [...task.links, link]
        });
        setNewLinkTitle('');
        setNewLinkUrl('');
    };

    const handleDeleteLink = (id: string) => {
        onUpdate({
            ...task,
            links: task.links.filter(l => l.id !== id)
        });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const attachment: Attachment = {
                    id: Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    type: file.type.startsWith('image/') ? 'image' : 'file',
                    data: reader.result as string
                };
                onUpdate({
                    ...task,
                    attachments: [...task.attachments, attachment]
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteAttachment = (id: string) => {
        onUpdate({
            ...task,
            attachments: task.attachments.filter(a => a.id !== id)
        });
    };

    return (
        <div className="fixed inset-0 bg-nordic-charcoal/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-nordic-dark-surface w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-nordic-ice to-white dark:from-nordic-dark-bg dark:to-nordic-dark-surface border-b border-slate-100 dark:border-nordic-charcoal flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${task.status === 'Klart' ? 'bg-nordic-green text-green-800' : 'bg-nordic-blue text-blue-800'
                                }`}>
                                {task.status}
                            </span>
                            <span className="text-slate-400 text-xs font-mono uppercase">{task.phase}</span>
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-nordic-charcoal dark:text-nordic-ice">{task.title}</h2>
                    </div>
                    <div className="flex gap-2">
                        {/* Contextual AI Chat Button */}
                        <button
                            onClick={openChatForTask}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        >
                            <MessageCircle size={16} /> Prata med ELTON
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-nordic-charcoal rounded-full transition-colors">
                            <X size={24} className="text-slate-500 dark:text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="flex border-b border-slate-100 dark:border-nordic-charcoal bg-white dark:bg-nordic-dark-surface sticky top-0 z-10">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`flex-1 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'details' ? 'border-nordic-charcoal text-nordic-charcoal dark:border-teal-400 dark:text-teal-400' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        >
                            Detaljer & Checklistor
                        </button>
                        <button
                            onClick={() => setActiveTab('decision')}
                            className={`flex-1 py-3 font-medium text-sm border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'decision' ? 'border-amber-400 text-amber-600 dark:text-amber-400' : 'border-transparent text-slate-400 hover:text-amber-500'}`}
                        >
                            <Lightbulb size={16} />
                            Beslutsstöd
                        </button>
                        <button
                            onClick={() => setActiveTab('comments')}
                            className={`flex-1 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'comments' ? 'border-nordic-charcoal text-nordic-charcoal dark:border-teal-400 dark:text-teal-400' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        >
                            Kommentarer ({task.comments.length})
                        </button>
                    </div>

                    <div className="p-6">
                        {activeTab === 'details' && (
                            <div className="space-y-8">
                                {/* Description & Cost */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Beskrivning</label>
                                        <textarea
                                            value={editedDescription}
                                            onChange={(e) => setEditedDescription(e.target.value)}
                                            onBlur={handleSaveDetails}
                                            className="w-full p-3 bg-slate-50 dark:bg-nordic-dark-bg rounded-xl border border-slate-200 dark:border-nordic-charcoal focus:ring-2 focus:ring-teal-500/20 focus:outline-none text-slate-700 dark:text-nordic-ice min-h-[80px]"
                                        />
                                    </div>

                                    {/* Checklist Subtasks */}
                                    <div className="bg-white dark:bg-nordic-dark-bg/30 p-4 rounded-2xl border border-slate-100 dark:border-nordic-charcoal">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-serif font-bold text-lg text-nordic-charcoal dark:text-nordic-ice flex items-center gap-2">
                                                <ListChecks size={18} className="text-teal-600" /> Checklista
                                            </h3>
                                            {subtasks.length > 0 && (
                                                <span className="text-xs font-bold text-slate-400">{Math.round(progress)}%</span>
                                            )}
                                        </div>

                                        {subtasks.length > 0 && (
                                            <div className="w-full h-1.5 bg-slate-100 dark:bg-nordic-charcoal rounded-full mb-4 overflow-hidden">
                                                <div
                                                    className="h-full bg-teal-500 transition-all duration-500"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        )}

                                        <div className="space-y-2 mb-3">
                                            {subtasks.map(subtask => (
                                                <div
                                                    key={subtask.id}
                                                    className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-nordic-charcoal/50 rounded-lg group cursor-pointer"
                                                    onClick={() => handleToggleSubtask(subtask.id)}
                                                >
                                                    <div className={`transition-colors ${subtask.completed ? 'text-teal-600' : 'text-slate-300'}`}>
                                                        {subtask.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                                    </div>
                                                    <span className={`flex-1 text-sm ${subtask.completed ? 'text-slate-400 line-through decoration-slate-300' : 'text-nordic-charcoal dark:text-slate-200'}`}>
                                                        {subtask.title}
                                                    </span>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteSubtask(subtask.id); }}
                                                        className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex gap-2 items-center mt-2">
                                            <Plus size={16} className="text-slate-400 ml-2" />
                                            <input
                                                placeholder="Lägg till en punkt..."
                                                value={newSubtaskTitle}
                                                onChange={e => setNewSubtaskTitle(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
                                                className="flex-1 bg-transparent text-sm p-1 focus:outline-none dark:text-white placeholder:text-slate-400"
                                            />
                                            <button
                                                onClick={handleAddSubtask}
                                                disabled={!newSubtaskTitle.trim()}
                                                className="text-xs font-bold bg-slate-100 dark:bg-nordic-charcoal px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-nordic-dark-surface transition-colors disabled:opacity-0"
                                            >
                                                Lägg till
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-nordic-dark-bg border border-slate-100 dark:border-nordic-charcoal">
                                            <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Estimat</span>
                                            <span className="text-xl font-mono font-medium text-slate-700 dark:text-nordic-ice">{task.estimatedCostMin} - {task.estimatedCostMax} kr</span>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-nordic-dark-bg border border-slate-100 dark:border-nordic-charcoal">
                                            <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Verklig Kostnad</span>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={editedActualCost}
                                                    onChange={(e) => setEditedActualCost(e.target.value)}
                                                    onBlur={handleSaveDetails}
                                                    className="w-24 bg-transparent font-mono text-xl font-medium text-nordic-charcoal dark:text-nordic-ice focus:outline-none border-b border-slate-300 dark:border-slate-600 focus:border-teal-500"
                                                />
                                                <span className="text-slate-500 dark:text-slate-400">kr</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Links Section */}
                                <div>
                                    <h3 className="font-serif font-bold text-lg text-nordic-charcoal dark:text-nordic-ice mb-3 flex items-center gap-2">
                                        <ExternalLink size={18} /> Länkar
                                    </h3>
                                    <div className="space-y-2 mb-3">
                                        {task.links.map(link => (
                                            <div key={link.id} className="flex items-center justify-between p-3 bg-white dark:bg-nordic-dark-bg border border-slate-200 dark:border-nordic-charcoal rounded-xl group hover:border-teal-200 transition-colors">
                                                <a href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-medium hover:underline truncate">
                                                    <ExternalLink size={14} /> {link.title}
                                                </a>
                                                <button onClick={() => handleDeleteLink(link.id)} className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            placeholder="Titel (t.ex. Mekonomen)"
                                            value={newLinkTitle}
                                            onChange={e => setNewLinkTitle(e.target.value)}
                                            className="flex-1 p-2 bg-slate-50 dark:bg-nordic-dark-bg border border-slate-200 dark:border-nordic-charcoal rounded-lg text-sm dark:text-white"
                                        />
                                        <input
                                            placeholder="https://..."
                                            value={newLinkUrl}
                                            onChange={e => setNewLinkUrl(e.target.value)}
                                            className="flex-1 p-2 bg-slate-50 dark:bg-nordic-dark-bg border border-slate-200 dark:border-nordic-charcoal rounded-lg text-sm dark:text-white"
                                        />
                                        <button onClick={handleAddLink} disabled={!newLinkUrl} className="p-2 bg-nordic-charcoal dark:bg-teal-600 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-teal-700 disabled:opacity-50">
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Attachments Section */}
                                <div>
                                    <h3 className="font-serif font-bold text-lg text-nordic-charcoal dark:text-nordic-ice mb-3 flex items-center gap-2">
                                        <Paperclip size={18} /> Filer & Kvitton
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                                        {task.attachments.map(att => (
                                            <div key={att.id} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-nordic-charcoal aspect-square bg-slate-50 dark:bg-nordic-dark-bg flex items-center justify-center">
                                                {att.type === 'image' ? (
                                                    <img src={att.data} alt={att.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-center p-2">
                                                        <FileText className="mx-auto mb-1 text-slate-400" />
                                                        <p className="text-[10px] text-slate-500 truncate">{att.name}</p>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <button onClick={() => handleDeleteAttachment(att.id)} className="p-2 bg-white rounded-full text-rose-500 hover:bg-rose-50">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <label className="cursor-pointer rounded-xl border-2 border-dashed border-slate-200 dark:border-nordic-charcoal hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-all aspect-square flex flex-col items-center justify-center text-slate-400 hover:text-teal-600 dark:hover:text-teal-400">
                                            <Plus size={24} className="mb-1" />
                                            <span className="text-xs font-medium">Ladda upp</span>
                                            <input type="file" onChange={handleFileUpload} className="hidden" />
                                        </label>
                                    </div>
                                </div>

                            </div>
                        )}

                        {activeTab === 'decision' && (
                            <div className="space-y-6">
                                {/* 1. Smart Context Section */}
                                {(smartContext.specs.length > 0 || smartContext.articles.length > 0 || smartContext.inventory.length > 0) && (
                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                                        <h3 className="font-serif font-bold text-lg text-indigo-900 dark:text-indigo-200 mb-4 flex items-center gap-2">
                                            <Wrench size={18} /> Eltons Tekniska Noteringar
                                        </h3>

                                        <div className="grid grid-cols-1 gap-4">
                                            {/* Specs from Vehicle Data */}
                                            {smartContext.specs.length > 0 && (
                                                <div className="bg-white dark:bg-nordic-dark-bg p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                                                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 block">Specifikationer</span>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {smartContext.specs.map((spec: any, idx: number) => (
                                                            <div key={idx}>
                                                                <span className="text-xs text-slate-500 block">{spec.label}</span>
                                                                <span className="font-bold text-nordic-charcoal dark:text-nordic-ice text-sm">{spec.value}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Inventory Match */}
                                            {smartContext.inventory.length > 0 && (
                                                <div className="bg-white dark:bg-nordic-dark-bg p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                                                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 block flex items-center gap-1">
                                                        <ShoppingBag size={12} /> Från Inköpslistan
                                                    </span>
                                                    <div className="space-y-1">
                                                        {smartContext.inventory.map((item: any, idx: number) => (
                                                            <div key={idx} className="flex items-center gap-2 text-sm">
                                                                {item.checked ? <CheckCircle2 size={14} className="text-green-500" /> : <Circle size={14} className="text-slate-300" />}
                                                                <span className={item.checked ? 'text-slate-400 line-through' : 'text-nordic-charcoal dark:text-nordic-ice'}>{item.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* NEW: Directly Linked Shopping Items */}
                                            <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-xl border border-teal-100 dark:border-teal-900/50">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1">
                                                        <ShoppingBag size={12} /> Inköpslista för denna uppgift
                                                    </span>
                                                    {onAddShoppingItem && (
                                                        <button
                                                            onClick={() => setShowAddShopping(!showAddShopping)}
                                                            className="text-teal-600 hover:text-teal-700 text-xs flex items-center gap-1"
                                                        >
                                                            <Plus size={12} /> Lägg till
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Add shopping item form */}
                                                {showAddShopping && onAddShoppingItem && (
                                                    <div className="mb-3 p-2 bg-white dark:bg-nordic-dark-surface rounded-lg border border-teal-200">
                                                        <input
                                                            type="text"
                                                            placeholder="Produktnamn..."
                                                            value={newShoppingItemName}
                                                            onChange={(e) => setNewShoppingItemName(e.target.value)}
                                                            className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded mb-2 outline-none focus:ring-1 focus:ring-teal-500"
                                                        />
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="number"
                                                                placeholder="Pris (kr)"
                                                                value={newShoppingItemCost}
                                                                onChange={(e) => setNewShoppingItemCost(e.target.value)}
                                                                className="w-24 px-2 py-1.5 text-sm border border-slate-200 rounded outline-none focus:ring-1 focus:ring-teal-500"
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    if (newShoppingItemName.trim()) {
                                                                        onAddShoppingItem({
                                                                            name: newShoppingItemName,
                                                                            category: 'Reservdelar',
                                                                            estimatedCost: parseInt(newShoppingItemCost) || 0,
                                                                            quantity: '1 st',
                                                                            checked: false,
                                                                            linkedTaskId: task.id
                                                                        });
                                                                        setNewShoppingItemName('');
                                                                        setNewShoppingItemCost('');
                                                                        setShowAddShopping(false);
                                                                    }
                                                                }}
                                                                className="flex-1 bg-teal-600 text-white text-xs py-1.5 rounded hover:bg-teal-700"
                                                            >
                                                                Lägg till
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Linked items list */}
                                                {smartContext.linkedItems && smartContext.linkedItems.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {smartContext.linkedItems.map((item: any, idx: number) => (
                                                            <div key={idx} className="flex items-center justify-between gap-2 text-sm">
                                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                    {item.checked ? <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" /> : <Circle size={14} className="text-slate-300 flex-shrink-0" />}
                                                                    <span className={`truncate ${item.checked ? 'text-slate-400 line-through' : 'text-nordic-charcoal dark:text-nordic-ice'}`}>{item.name}</span>
                                                                </div>
                                                                <span className="text-xs font-mono text-slate-500 flex-shrink-0">{item.estimatedCost} kr</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-slate-400 italic">Inga inköp kopplade till denna uppgift än</p>
                                                )}
                                            </div>

                                            {/* Related Articles */}
                                            {smartContext.articles.map((article) => (
                                                <div key={article.id} className="bg-white dark:bg-nordic-dark-bg p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50 hover:border-indigo-300 transition-colors group cursor-pointer">
                                                    <div className="flex items-start gap-3">
                                                        <BookOpen className="text-indigo-500 shrink-0 mt-1" size={18} />
                                                        <div>
                                                            <h4 className="font-bold text-sm text-nordic-charcoal dark:text-nordic-ice group-hover:underline">{article.title}</h4>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{article.summary}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 2. Manual Decision Options */}
                                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm flex gap-3">
                                    <Lightbulb className="shrink-0" size={20} />
                                    <p>Här kan du jämföra olika vägar framåt. Vad är värt mest – din tid eller dina pengar?</p>
                                </div>

                                {hasDecisionOptions ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {task.decisionOptions!.map(option => (
                                            <div key={option.id} className={`p-6 rounded-3xl border-2 relative ${option.recommended ? 'border-teal-400 bg-teal-50 dark:bg-teal-900/10' : 'border-slate-100 dark:border-nordic-charcoal bg-white dark:bg-nordic-dark-bg'}`}>
                                                {option.recommended && (
                                                    <div className="absolute -top-3 left-6 bg-teal-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                                                        Rekommenderas
                                                    </div>
                                                )}
                                                <h3 className="font-serif font-bold text-xl text-nordic-charcoal dark:text-nordic-ice mb-1">{option.title}</h3>
                                                <p className="text-slate-500 dark:text-nordic-dark-muted text-sm mb-4">{option.description}</p>

                                                <div className="bg-nordic-ice dark:bg-nordic-charcoal p-3 rounded-xl mb-4 text-center">
                                                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Prisspann</span>
                                                    <span className="font-mono font-bold text-lg text-nordic-charcoal dark:text-white">{option.costRange}</span>
                                                </div>

                                                <div className="space-y-4">
                                                    <div>
                                                        <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase block mb-2">Fördelar</span>
                                                        <ul className="space-y-1">
                                                            {option.pros.map((p, i) => (
                                                                <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                                    <Check size={14} className="text-green-500 mt-0.5 shrink-0" /> {p}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-bold text-rose-500 dark:text-rose-400 uppercase block mb-2">Nackdelar</span>
                                                        <ul className="space-y-1">
                                                            {option.cons.map((c, i) => (
                                                                <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                                    <XCircle size={14} className="text-rose-400 mt-0.5 shrink-0" /> {c}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-slate-400 italic">
                                        Inga manuella alternativ inlagda än.
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'comments' && (
                            <div className="flex flex-col h-[500px]">
                                <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                                    {task.comments.length === 0 && (
                                        <div className="text-center py-10 text-slate-400">
                                            <MessageSquare size={48} className="mx-auto mb-2 opacity-20" />
                                            <p>Inga kommentarer än.</p>
                                        </div>
                                    )}
                                    {task.comments.map(comment => (
                                        <div key={comment.id} className={`p-4 rounded-2xl max-w-[90%] ${comment.author === 'user' ? 'bg-nordic-ice dark:bg-teal-900/30 ml-auto rounded-br-none' : 'bg-white dark:bg-nordic-charcoal border border-slate-100 dark:border-nordic-dark-bg mr-auto rounded-bl-none'}`}>
                                            <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed">{comment.text}</p>
                                            <p className="text-[10px] text-slate-400 mt-2 text-right">{new Date(comment.createdAt).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-nordic-charcoal flex gap-2">
                                    <input
                                        value={newComment}
                                        onChange={e => setNewComment(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                                        placeholder="Skriv en kommentar..."
                                        className="flex-1 p-3 bg-slate-50 dark:bg-nordic-dark-bg border border-slate-200 dark:border-nordic-charcoal rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:text-white"
                                    />
                                    <button onClick={handleAddComment} disabled={!newComment.trim()} className="p-3 bg-nordic-charcoal dark:bg-teal-600 text-white rounded-xl hover:bg-slate-800 dark:hover:bg-teal-700 disabled:opacity-50">
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Contextual Chat Modal */}
            {chatContext && (
                <ContextualChat
                    context={chatContext}
                    onClose={() => setChatContext(null)}
                    onUpdateTask={(updatedTask) => {
                        onUpdate(updatedTask);
                        // Update context with fresh task data
                        setChatContext(prev => prev ? { ...prev, task: updatedTask } : null);
                    }}
                />
            )}
        </div>
    );
};

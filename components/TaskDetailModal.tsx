import React, { useState } from 'react';
import { Task, Link, Comment, Attachment } from '../types';
import { X, ExternalLink, Plus, MessageSquare, Paperclip, Trash2, Send, Save, FileText } from 'lucide-react';

interface TaskDetailModalProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onUpdate, onClose }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'comments'>('details');
  const [newComment, setNewComment] = useState('');
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  
  // Local state edit fields
  const [editedDescription, setEditedDescription] = useState(task.description);
  const [editedActualCost, setEditedActualCost] = useState(task.actualCost.toString());

  const handleSaveDetails = () => {
    onUpdate({
      ...task,
      description: editedDescription,
      actualCost: parseInt(editedActualCost) || 0
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
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-nordic-ice to-white border-b border-slate-100 flex justify-between items-start">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
                        task.status === 'Klart' ? 'bg-nordic-green text-green-800' : 'bg-nordic-blue text-blue-800'
                    }`}>
                        {task.status}
                    </span>
                    <span className="text-slate-400 text-xs font-mono uppercase">{task.phase}</span>
                </div>
                <h2 className="text-2xl font-serif font-bold text-nordic-charcoal">{task.title}</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} className="text-slate-500" />
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
            <div className="flex border-b border-slate-100">
                <button 
                    onClick={() => setActiveTab('details')} 
                    className={`flex-1 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'details' ? 'border-nordic-charcoal text-nordic-charcoal' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    Detaljer & Ekonomi
                </button>
                <button 
                    onClick={() => setActiveTab('comments')} 
                    className={`flex-1 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'comments' ? 'border-nordic-charcoal text-nordic-charcoal' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    Kommentarer ({task.comments.length})
                </button>
            </div>

            <div className="p-6">
                {activeTab === 'details' ? (
                    <div className="space-y-8">
                        {/* Description & Cost */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Beskrivning</label>
                                <textarea 
                                    value={editedDescription}
                                    onChange={(e) => setEditedDescription(e.target.value)}
                                    onBlur={handleSaveDetails}
                                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:outline-none text-slate-700 min-h-[100px]"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Estimat</span>
                                    <span className="text-xl font-mono font-medium text-slate-700">{task.estimatedCostMin} - {task.estimatedCostMax} kr</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Verklig Kostnad</span>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            value={editedActualCost}
                                            onChange={(e) => setEditedActualCost(e.target.value)}
                                            onBlur={handleSaveDetails}
                                            className="w-24 bg-transparent font-mono text-xl font-medium text-nordic-charcoal focus:outline-none border-b border-slate-300 focus:border-teal-500"
                                        />
                                        <span className="text-slate-500">kr</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Links Section */}
                        <div>
                             <h3 className="font-serif font-bold text-lg text-nordic-charcoal mb-3 flex items-center gap-2">
                                <ExternalLink size={18} /> Länkar
                             </h3>
                             <div className="space-y-2 mb-3">
                                {task.links.map(link => (
                                    <div key={link.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl group hover:border-teal-200 transition-colors">
                                        <a href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-teal-700 font-medium hover:underline truncate">
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
                                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                />
                                <input 
                                    placeholder="https://..." 
                                    value={newLinkUrl}
                                    onChange={e => setNewLinkUrl(e.target.value)}
                                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                />
                                <button onClick={handleAddLink} disabled={!newLinkUrl} className="p-2 bg-nordic-charcoal text-white rounded-lg hover:bg-slate-800 disabled:opacity-50">
                                    <Plus size={18} />
                                </button>
                             </div>
                        </div>

                        {/* Attachments Section */}
                        <div>
                             <h3 className="font-serif font-bold text-lg text-nordic-charcoal mb-3 flex items-center gap-2">
                                <Paperclip size={18} /> Filer & Kvitton
                             </h3>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                                {task.attachments.map(att => (
                                    <div key={att.id} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-50 flex items-center justify-center">
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
                                <label className="cursor-pointer rounded-xl border-2 border-dashed border-slate-200 hover:border-teal-400 hover:bg-teal-50 transition-all aspect-square flex flex-col items-center justify-center text-slate-400 hover:text-teal-600">
                                    <Plus size={24} className="mb-1" />
                                    <span className="text-xs font-medium">Ladda upp</span>
                                    <input type="file" onChange={handleFileUpload} className="hidden" />
                                </label>
                             </div>
                        </div>

                    </div>
                ) : (
                    <div className="flex flex-col h-[500px]">
                        <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                            {task.comments.length === 0 && (
                                <div className="text-center py-10 text-slate-400">
                                    <MessageSquare size={48} className="mx-auto mb-2 opacity-20" />
                                    <p>Inga kommentarer än.</p>
                                </div>
                            )}
                            {task.comments.map(comment => (
                                <div key={comment.id} className={`p-4 rounded-2xl max-w-[90%] ${comment.author === 'user' ? 'bg-nordic-ice ml-auto rounded-br-none' : 'bg-white border border-slate-100 mr-auto rounded-bl-none'}`}>
                                    <p className="text-slate-700 text-sm leading-relaxed">{comment.text}</p>
                                    <p className="text-[10px] text-slate-400 mt-2 text-right">{new Date(comment.createdAt).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                            <input 
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                                placeholder="Skriv en kommentar..."
                                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                            />
                            <button onClick={handleAddComment} disabled={!newComment.trim()} className="p-3 bg-nordic-charcoal text-white rounded-xl hover:bg-slate-800 disabled:opacity-50">
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
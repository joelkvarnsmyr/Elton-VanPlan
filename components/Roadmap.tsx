
import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, Construction, ArrowLeft, ChevronDown, ChevronUp, Beaker, Layers, Zap, PenTool, Database, MessageSquare } from 'lucide-react';
import { ROADMAP_FEATURES, Feature, ChecklistItem } from '../roadmapData';

export const Roadmap: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const StatusBadge = ({ status }: { status: string }) => {
        if (status === 'done') return <span className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-800 text-[10px] font-bold uppercase rounded-md border border-teal-200"><CheckCircle2 size={12} /> Lanserad</span>;
        if (status === 'in-progress') return <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase rounded-md border border-amber-200"><Construction size={12} /> Pågår</span>;
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded-md border border-slate-200"><Circle size={12} /> Planerad</span>;
    };

    const CategoryIcon = ({ category }: { category: string }) => {
        switch(category) {
            case 'AI Core': return <Zap size={16} className="text-amber-500" />;
            case 'Plattform': return <Layers size={16} className="text-blue-500" />;
            case 'Ekonomi': return <Circle size={16} className="text-green-500" />;
            case 'Garage': return <Database size={16} className="text-slate-500" />;
            default: return <PenTool size={16} className="text-slate-400" />;
        }
    }

    return (
        <div className="min-h-screen bg-nordic-ice p-6 pb-24">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={onClose} className="p-3 bg-white rounded-xl shadow-sm hover:bg-slate-50 text-slate-500 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="font-serif font-bold text-3xl text-nordic-charcoal">Produkt-Roadmap</h1>
                        <p className="text-slate-500">Visionen för The VanPlan. Uppdateras löpande.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {ROADMAP_FEATURES.map(f => (
                        <div 
                            key={f.id} 
                            className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden ${
                                f.status === 'done' ? 'border-teal-100/50' : 
                                f.status === 'in-progress' ? 'border-amber-200 shadow-md transform scale-[1.01]' : 
                                'border-slate-100 opacity-90'
                            }`}
                        >
                            <div 
                                onClick={() => toggleExpand(f.id)}
                                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${
                                        f.status === 'done' ? 'bg-teal-50 text-teal-600' :
                                        f.status === 'in-progress' ? 'bg-amber-50 text-amber-600' :
                                        'bg-slate-50 text-slate-400'
                                    }`}>
                                        {f.id}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <CategoryIcon category={f.category} />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{f.category}</span>
                                        </div>
                                        <h3 className={`font-bold text-nordic-charcoal ${f.status === 'planned' ? 'text-slate-500' : ''}`}>{f.title}</h3>
                                        <div className="flex gap-2 mt-1">
                                            <StatusBadge status={f.status} />
                                            {expandedId !== f.id && <span className="text-xs text-slate-400 truncate max-w-[200px] hidden sm:inline border-l border-slate-200 pl-2 ml-1">{f.description}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-slate-300">
                                    {expandedId === f.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            {expandedId === f.id && (
                                <div className="p-6 pt-0 bg-slate-50/30 border-t border-slate-50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Beskrivning</h4>
                                            <p className="text-sm text-slate-600 mb-4">{f.description}</p>
                                            
                                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Syfte (Varför?)</h4>
                                            <p className="text-sm text-slate-600 italic border-l-2 border-teal-200 pl-3">"{f.purpose}"</p>
                                        </div>
                                        
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Status & Checklista</h4>
                                            <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-2 shadow-sm">
                                                {f.checklist.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-3">
                                                        {item.completed ? (
                                                            <CheckCircle2 size={16} className="text-teal-500" />
                                                        ) : (
                                                            <Circle size={16} className="text-slate-300" />
                                                        )}
                                                        <span className={`text-sm ${item.completed ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>{item.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                                                <Beaker size={14} />
                                                <span>Teknik: <span className="font-mono text-slate-600">{f.tech}</span></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                
                <div className="mt-12 text-center pb-8">
                    <p className="text-slate-400 text-sm">Totalt {ROADMAP_FEATURES.length} funktioner definierade.</p>
                    <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden max-w-xs mx-auto">
                        <div 
                            className="bg-teal-500 h-full transition-all duration-1000" 
                            style={{ width: `${(ROADMAP_FEATURES.filter(f => f.status === 'done').length / ROADMAP_FEATURES.length) * 100}%` }}
                        ></div>
                    </div>
                    <p className="text-teal-600 text-xs font-bold mt-1">
                        {Math.round((ROADMAP_FEATURES.filter(f => f.status === 'done').length / ROADMAP_FEATURES.length) * 100)}% Klart
                    </p>
                </div>
            </div>
        </div>
    );
};

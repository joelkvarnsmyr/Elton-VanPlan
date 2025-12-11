
import React, { useState, useEffect } from 'react';
import { configService } from '../services/configService';
import { FeatureFlags } from '../constants';
import { PROMPT_VERSIONS } from '../prompts';
import { X, Save, RotateCcw, AlertTriangle } from 'lucide-react';

interface DevToolsProps {
    onClose: () => void;
}

export const DevTools: React.FC<DevToolsProps> = ({ onClose }) => {
    const [flags, setFlags] = useState<FeatureFlags>(configService.getFlags());
    const [activePrompt, setActivePrompt] = useState(configService.getActivePromptVersion());

    const handleToggle = (key: keyof FeatureFlags) => {
        const newVal = !flags[key];
        setFlags(prev => ({ ...prev, [key]: newVal }));
        configService.setFlag(key, newVal);
    };

    const handlePromptChange = (version: string) => {
        setActivePrompt(version);
        configService.setActivePromptVersion(version);
    };

    const handleReload = () => {
        window.location.reload();
    };

    return (
        <div className="fixed inset-0 bg-nordic-charcoal/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-nordic-dark-surface w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-fade-in border-4 border-amber-400">
                <div className="bg-amber-400 p-4 flex justify-between items-center text-nordic-charcoal">
                    <h2 className="font-bold font-mono text-lg flex items-center gap-2">
                        <AlertTriangle size={20} /> DEVELOPER TOOLS
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    
                    {/* Prompt Versioning */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">AI Personality (Prompt Version)</h3>
                        <div className="space-y-2">
                            {Object.entries(PROMPT_VERSIONS).map(([key, data]) => (
                                <button
                                    key={key}
                                    onClick={() => handlePromptChange(key)}
                                    className={`w-full text-left p-3 rounded-xl border flex justify-between items-center transition-all ${
                                        activePrompt === key 
                                        ? 'bg-amber-50 border-amber-400 text-amber-900' 
                                        : 'bg-white dark:bg-nordic-dark-bg border-slate-200 dark:border-nordic-charcoal opacity-60 hover:opacity-100'
                                    }`}
                                >
                                    <span className="font-bold">{data.label}</span>
                                    {activePrompt === key && <span className="text-xs bg-amber-200 px-2 py-1 rounded text-amber-900 font-bold">ACTIVE</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Feature Flags */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Feature Flags</h3>
                        <div className="space-y-3">
                            {Object.entries(flags).map(([key, enabled]) => (
                                <div key={key} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-nordic-dark-bg rounded-xl border border-slate-100 dark:border-nordic-charcoal">
                                    <span className="text-sm font-mono text-nordic-charcoal dark:text-nordic-ice">{key}</span>
                                    <button 
                                        onClick={() => handleToggle(key as keyof FeatureFlags)}
                                        className={`w-12 h-6 rounded-full p-1 transition-colors ${enabled ? 'bg-green-500' : 'bg-slate-300'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${enabled ? 'translate-x-6' : ''}`}></div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-nordic-charcoal">
                        <button 
                            onClick={handleReload}
                            className="w-full py-3 bg-nordic-charcoal text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800"
                        >
                            <RotateCcw size={18} /> Reload App to Apply
                        </button>
                        <p className="text-center text-xs text-slate-400 mt-2">Changes are saved to LocalStorage.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

import React from 'react';
import { X, CheckCircle2, Circle, Clock, Beaker, Target, ExternalLink, Github, Calendar, AlertTriangle } from 'lucide-react';
import { Feature } from '@/data/roadmapData';

interface RoadmapModalProps {
    feature: Feature;
    onClose: () => void;
}

export const RoadmapModal: React.FC<RoadmapModalProps> = ({ feature, onClose }) => {
    const completedTasks = feature.checklist.filter(item => item.completed).length;
    const totalTasks = feature.checklist.length;
    const progress = (completedTasks / totalTasks) * 100;

    const getStatusConfig = (status: string) => {
        if (status === 'done') return {
            bg: 'bg-teal-50',
            text: 'text-teal-700',
            badge: 'bg-teal-100 text-teal-800 border-teal-300'
        };
        if (status === 'in-progress') return {
            bg: 'bg-amber-50',
            text: 'text-amber-700',
            badge: 'bg-amber-100 text-amber-800 border-amber-300'
        };
        return {
            bg: 'bg-slate-50',
            text: 'text-slate-600',
            badge: 'bg-slate-100 text-slate-700 border-slate-300'
        };
    };

    const statusConfig = getStatusConfig(feature.status);
    const techArray = Array.isArray(feature.tech) ? feature.tech : feature.tech.split('+').map(t => t.trim());

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-nordic-dark-surface w-full max-w-4xl rounded-3xl shadow-2xl my-8 animate-fade-in">
                {/* Header */}
                <div className={`${statusConfig.bg} p-6 border-b border-slate-200 dark:border-nordic-charcoal rounded-t-3xl relative`}>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/50 rounded-full transition-colors"
                    >
                        <X size={24} className="text-slate-500" />
                    </button>

                    <div className="flex items-start gap-4 mb-4 pr-12">
                        <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center
                            font-bold text-lg shadow-lg border-2
                            ${statusConfig.bg} ${statusConfig.text} border-white
                        `}>
                            #{feature.id}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`
                                    px-3 py-1 rounded-full text-xs font-bold uppercase border
                                    ${statusConfig.badge}
                                `}>
                                    {feature.status === 'done' ? '✅ Lanserad' :
                                     feature.status === 'in-progress' ? '🚧 Pågår' :
                                     '📅 Planerad'}
                                </span>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-white px-2 py-1 rounded-md">
                                    {feature.category}
                                </span>
                                {feature.priority && (
                                    <span className={`
                                        text-xs font-bold uppercase px-2 py-1 rounded-md
                                        ${feature.priority === 'high' ? 'bg-rose-100 text-rose-700' :
                                          feature.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                                          'bg-gray-100 text-gray-600'}
                                    `}>
                                        {feature.priority}
                                    </span>
                                )}
                            </div>
                            <h2 className="font-serif font-bold text-3xl text-nordic-charcoal dark:text-nordic-ice mb-2">
                                {feature.title}
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300">
                                {feature.description}
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="bg-white/50 rounded-xl p-3">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold uppercase text-slate-500">
                                Framsteg
                            </span>
                            <span className="text-sm font-bold text-slate-700">
                                {completedTasks} av {totalTasks} klara
                            </span>
                        </div>
                        <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${
                                    feature.status === 'done' ? 'bg-teal-500' :
                                    feature.status === 'in-progress' ? 'bg-amber-500' :
                                    'bg-slate-400'
                                }`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Checklist & Purpose */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Purpose */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Target size={18} className="text-teal-600" />
                                    <h3 className="font-bold text-lg text-nordic-charcoal dark:text-nordic-ice">
                                        Syfte & Vision
                                    </h3>
                                </div>
                                <div className="bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-500 p-4 rounded-r-xl">
                                    <p className="text-slate-700 dark:text-slate-200 italic">
                                        "{feature.purpose}"
                                    </p>
                                </div>
                            </div>

                            {/* Detailed Description */}
                            {feature.detailedDescription && (
                                <div>
                                    <h3 className="font-bold text-lg text-nordic-charcoal dark:text-nordic-ice mb-3">
                                        Detaljerad Beskrivning
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                        {feature.detailedDescription}
                                    </p>
                                </div>
                            )}

                            {/* Checklist */}
                            <div>
                                <h3 className="font-bold text-lg text-nordic-charcoal dark:text-nordic-ice mb-3">
                                    Checklista & Milstolpar
                                </h3>
                                <div className="bg-white dark:bg-nordic-charcoal rounded-xl border border-slate-200 dark:border-nordic-charcoal p-4 space-y-3">
                                    {feature.checklist.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className={`
                                                flex items-start gap-3 p-3 rounded-lg transition-all
                                                ${item.completed ? 'bg-teal-50 dark:bg-teal-900/20' :
                                                  item.inProgress ? 'bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200' :
                                                  'bg-slate-50 dark:bg-slate-800'}
                                            `}
                                        >
                                            {item.completed ? (
                                                <CheckCircle2 size={20} className="text-teal-500 mt-0.5 shrink-0" />
                                            ) : item.inProgress ? (
                                                <Clock size={20} className="text-amber-500 mt-0.5 shrink-0 animate-pulse" />
                                            ) : (
                                                <Circle size={20} className="text-slate-300 mt-0.5 shrink-0" />
                                            )}
                                            <div className="flex-1">
                                                <span className={`
                                                    text-sm font-medium
                                                    ${item.completed ? 'text-slate-700 dark:text-slate-200' :
                                                      item.inProgress ? 'text-amber-800 dark:text-amber-200' :
                                                      'text-slate-400 dark:text-slate-500'}
                                                `}>
                                                    {item.label}
                                                </span>
                                                {item.completedAt && (
                                                    <div className="text-xs text-slate-400 mt-1">
                                                        Klart: {item.completedAt}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Metadata */}
                        <div className="space-y-6">
                            {/* Tech Stack */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Beaker size={18} className="text-blue-600" />
                                    <h3 className="font-bold text-lg text-nordic-charcoal dark:text-nordic-ice">
                                        Tech Stack
                                    </h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {techArray.map((tech, idx) => (
                                        <span
                                            key={idx}
                                            className="inline-block px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-medium text-blue-700 dark:text-blue-300"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Estimated Completion */}
                            {feature.estimatedCompletion && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Calendar size={18} className="text-purple-600" />
                                        <h3 className="font-bold text-lg text-nordic-charcoal dark:text-nordic-ice">
                                            Estimerad Lansering
                                        </h3>
                                    </div>
                                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                                        <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                                            {feature.estimatedCompletion}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Tags */}
                            {feature.tags && feature.tags.length > 0 && (
                                <div>
                                    <h3 className="font-bold text-sm text-slate-400 uppercase mb-2">
                                        Tags
                                    </h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {feature.tags.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs text-slate-600 dark:text-slate-300"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Links */}
                            <div className="space-y-2">
                                {feature.demoUrl && (
                                    <a
                                        href={feature.demoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg hover:bg-teal-100 transition-colors"
                                    >
                                        <ExternalLink size={16} className="text-teal-600" />
                                        <span className="text-sm font-medium text-teal-700 dark:text-teal-300">
                                            Live Demo
                                        </span>
                                    </a>
                                )}
                                {feature.githubIssue && (
                                    <a
                                        href={feature.githubIssue}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                                    >
                                        <Github size={16} className="text-slate-600" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            GitHub Issue
                                        </span>
                                    </a>
                                )}
                            </div>

                            {/* Warning for Planned Features */}
                            {feature.status === 'planned' && (
                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
                                    <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                                    <p className="text-xs text-amber-700 dark:text-amber-300">
                                        Denna feature är planerad men ej påbörjad. Datum och specifikationer kan ändras.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 dark:border-nordic-charcoal bg-slate-50 dark:bg-nordic-charcoal/50 rounded-b-3xl">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-nordic-charcoal dark:bg-teal-600 text-white font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-teal-700 transition-colors"
                    >
                        Stäng
                    </button>
                </div>
            </div>
        </div>
    );
};


import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { KnowledgeArticle } from '../types';
import { BookOpen, FileText, X, ArrowLeft, Search } from 'lucide-react';
import { KNOWLEDGE_ARTICLES } from '../constants'; // Globala artiklar

interface ResourcesProps {
    projectArticles?: KnowledgeArticle[];
}

export const Resources: React.FC<ResourcesProps> = ({ projectArticles = [] }) => {
    const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
    const [filter, setFilter] = useState('');

    // Combine project-specific articles (AI-generated reports) with global knowledge base
    const allArticles = [...(projectArticles || []), ...KNOWLEDGE_ARTICLES];

    const filteredArticles = allArticles.filter(a => 
        a.title.toLowerCase().includes(filter.toLowerCase()) || 
        a.tags.some(t => t.toLowerCase().includes(filter.toLowerCase()))
    );

    if (selectedArticle) {
        return (
            <div className="fixed inset-0 bg-white dark:bg-nordic-dark-surface z-50 overflow-y-auto animate-fade-in">
                <div className="max-w-3xl mx-auto p-6 pb-20">
                    <button 
                        onClick={() => setSelectedArticle(null)}
                        className="mb-6 p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-nordic-charcoal rounded-full flex items-center gap-2 transition-colors"
                    >
                        <ArrowLeft size={20} /> <span className="font-bold text-sm">Tillbaka till biblioteket</span>
                    </button>

                    <article className="prose prose-lg dark:prose-invert max-w-none">
                        <div className="mb-8 border-b border-slate-100 dark:border-nordic-charcoal pb-8">
                            <h1 className="font-serif font-bold text-4xl text-nordic-charcoal dark:text-nordic-ice mb-4">{selectedArticle.title}</h1>
                            <div className="flex gap-2 mb-6">
                                {selectedArticle.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-xs font-bold uppercase tracking-wider rounded-full">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <p className="text-xl text-slate-500 dark:text-nordic-dark-muted leading-relaxed font-serif italic">
                                {selectedArticle.summary}
                            </p>
                        </div>
                        
                        <ReactMarkdown 
                            components={{
                                h1: ({node, ...props}) => <h2 className="text-2xl font-bold text-nordic-charcoal dark:text-nordic-ice mt-8 mb-4 border-l-4 border-teal-500 pl-4" {...props} />,
                                h2: ({node, ...props}) => <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mt-6 mb-3" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc list-outside ml-6 space-y-2 my-4 text-slate-600 dark:text-slate-300" {...props} />,
                                ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-6 space-y-2 my-4 text-slate-600 dark:text-slate-300" {...props} />,
                                li: ({node, ...props}) => <li className="pl-1 marker:text-teal-500" {...props} />,
                                p: ({node, ...props}) => <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed" {...props} />,
                                strong: ({node, ...props}) => <strong className="font-bold text-nordic-charcoal dark:text-white" {...props} />,
                                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-teal-200 bg-teal-50/50 dark:bg-teal-900/10 p-4 my-6 italic text-slate-600 dark:text-slate-400 rounded-r-xl" {...props} />,
                                table: ({node, ...props}) => <div className="overflow-x-auto my-6 rounded-xl border border-slate-200 dark:border-nordic-charcoal"><table className="w-full text-left text-sm" {...props} /></div>,
                                th: ({node, ...props}) => <th className="bg-slate-50 dark:bg-nordic-charcoal p-3 font-bold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-nordic-dark-bg" {...props} />,
                                td: ({node, ...props}) => <td className="p-3 border-b border-slate-100 dark:border-nordic-dark-bg text-slate-600 dark:text-slate-400" {...props} />,
                            }}
                        >
                            {selectedArticle.content}
                        </ReactMarkdown>
                    </article>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-24 animate-fade-in">
            <div className="bg-gradient-to-r from-nordic-ice to-white dark:from-nordic-charcoal dark:to-nordic-dark-surface p-8 rounded-3xl border border-nordic-ice dark:border-nordic-dark-bg shadow-sm">
                <h3 className="font-serif font-bold text-2xl text-nordic-charcoal dark:text-nordic-ice mb-2 flex items-center gap-3">
                    <BookOpen className="text-teal-600" /> Kunskapsbanken
                </h3>
                <p className="text-slate-600 dark:text-nordic-dark-muted mb-6">
                    Här samlas tekniska rapporter, guider och analyser. Både globala fakta och unika rapporter som Elton skrivit om ditt projekt.
                </p>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Sök bland artiklar..." 
                        className="w-full p-4 pl-12 bg-white dark:bg-nordic-dark-bg border border-slate-200 dark:border-nordic-charcoal rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredArticles.length === 0 ? (
                    <div className="col-span-full text-center py-12 opacity-50">
                        <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                        <p>Inga artiklar hittades.</p>
                    </div>
                ) : (
                    filteredArticles.map((article, idx) => (
                        <div 
                            key={article.id + idx} 
                            onClick={() => setSelectedArticle(article)}
                            className="bg-white dark:bg-nordic-dark-surface p-6 rounded-2xl border border-nordic-ice dark:border-nordic-dark-bg hover:shadow-lg hover:border-teal-200 transition-all cursor-pointer group flex flex-col justify-between h-full"
                        >
                            <div>
                                <div className="flex gap-2 mb-3">
                                    {article.tags.slice(0, 2).map(tag => (
                                        <span key={tag} className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 dark:bg-teal-900/20 px-2 py-1 rounded-md">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <h4 className="font-serif font-bold text-xl text-nordic-charcoal dark:text-nordic-ice mb-2 group-hover:text-teal-700 transition-colors">
                                    {article.title}
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-nordic-dark-muted line-clamp-3 leading-relaxed">
                                    {article.summary}
                                </p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-50 dark:border-nordic-charcoal flex justify-between items-center">
                                <span className="text-xs text-slate-400 font-medium">Läs rapport</span>
                                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-nordic-charcoal flex items-center justify-center text-slate-400 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                                    <ArrowLeft size={16} className="rotate-180" />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

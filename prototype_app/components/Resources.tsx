
import React, { useState } from 'react';
import { RESOURCE_LINKS, PARTS_HUNTING_TIPS, KNOWLEDGE_ARTICLES } from '../constants';
import { ExternalLink, Search, BookOpen, ShoppingBag, Globe, AlertCircle, FileText, X, Phone, MapPin } from 'lucide-react';
import { KnowledgeArticle } from '../types';

export const Resources: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
        
      {/* Intro */}
      <div className="bg-white dark:bg-nordic-dark-surface p-8 rounded-3xl border border-nordic-ice dark:border-nordic-dark-bg shadow-sm">
        <h3 className="font-serif font-bold text-2xl text-nordic-charcoal dark:text-nordic-ice mb-2">Resurs-Hubb</h3>
        <p className="text-slate-600 dark:text-nordic-dark-muted">
            Att äga en gammal LT31 handlar 90% om att veta *var* man hittar delar och information.
        </p>
      </div>

      {/* Knowledge Base Section */}
      <div className="space-y-4">
        <h3 className="font-serif font-bold text-xl text-nordic-charcoal dark:text-nordic-ice px-2">Kunskapsbank (Fördjupning)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {KNOWLEDGE_ARTICLES.map((article) => (
                <button 
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className="text-left bg-nordic-ice dark:bg-nordic-charcoal/50 p-6 rounded-3xl border border-transparent hover:border-teal-300 dark:hover:border-teal-700 transition-all group"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <FileText className="text-teal-600 dark:text-teal-400" size={24} />
                        <span className="bg-white dark:bg-nordic-dark-surface px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">
                            Rapport
                        </span>
                    </div>
                    <h4 className="font-serif font-bold text-lg text-nordic-charcoal dark:text-nordic-ice mb-2 group-hover:text-teal-700 dark:group-hover:text-teal-400">
                        {article.title}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-nordic-dark-muted line-clamp-3">
                        {article.summary}
                    </p>
                    <div className="mt-4 flex gap-2">
                        {article.tags.map(tag => (
                            <span key={tag} className="text-xs text-slate-400 font-medium">#{tag}</span>
                        ))}
                    </div>
                </button>
            ))}
        </div>
      </div>

      {/* Links Grid */}
      <div className="space-y-4">
        <h3 className="font-serif font-bold text-xl text-nordic-charcoal dark:text-nordic-ice px-2">Externa Länkar</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {RESOURCE_LINKS.map((link, idx) => (
                <a 
                    key={idx} 
                    href={link.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="group bg-white dark:bg-nordic-dark-surface p-6 rounded-3xl border border-nordic-ice dark:border-nordic-dark-bg hover:border-teal-300 dark:hover:border-teal-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full"
                >
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <span className="bg-nordic-ice dark:bg-nordic-charcoal text-nordic-charcoal dark:text-nordic-ice px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                {link.category}
                            </span>
                            <ExternalLink size={18} className="text-slate-300 group-hover:text-teal-500 transition-colors" />
                        </div>
                        <h4 className="font-serif font-bold text-xl text-nordic-charcoal dark:text-nordic-ice mb-2 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                            {link.title}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-nordic-dark-muted leading-relaxed">
                            {link.description}
                        </p>
                    </div>
                </a>
            ))}
        </div>
      </div>

      {/* Parts Hunting Tips */}
      <div className="bg-nordic-charcoal text-white rounded-3xl p-8 shadow-lg relative overflow-hidden">
         <div className="absolute top-0 right-0 p-32 bg-teal-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
         <h3 className="font-serif font-bold text-2xl mb-6 relative z-10 flex items-center gap-2">
            <Search className="text-teal-400" /> Proffstips för Deljakt
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {PARTS_HUNTING_TIPS.map((tip, idx) => (
                <div key={idx} className="flex gap-4 items-start bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="bg-teal-500/20 text-teal-200 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">
                        {idx + 1}
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{tip}</p>
                </div>
            ))}
         </div>
      </div>

      {/* Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-nordic-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-nordic-dark-surface w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 dark:border-nordic-dark-bg flex justify-between items-start bg-nordic-ice/30 dark:bg-nordic-charcoal/30">
                    <div>
                        <span className="text-teal-600 font-bold text-xs uppercase tracking-wider mb-2 block">
                            {selectedArticle.tags.join(' • ')}
                        </span>
                        <h2 className="text-2xl font-serif font-bold text-nordic-charcoal dark:text-nordic-ice leading-tight">
                            {selectedArticle.title}
                        </h2>
                    </div>
                    <button 
                        onClick={() => setSelectedArticle(null)}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-nordic-charcoal rounded-full transition-colors"
                    >
                        <X size={24} className="text-slate-500 dark:text-slate-400" />
                    </button>
                </div>
                <div className="p-8 overflow-y-auto">
                    <article className="prose prose-slate dark:prose-invert max-w-none">
                        <div dangerouslySetInnerHTML={{ 
                            __html: selectedArticle.content
                                .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-serif font-bold mb-4 text-nordic-charcoal dark:text-nordic-ice">$1</h1>')
                                .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3 text-teal-700 dark:text-teal-400 border-b border-slate-100 dark:border-slate-800 pb-2">$1</h2>')
                                .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2 text-slate-700 dark:text-slate-200">$1</h3>')
                                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-nordic-charcoal dark:text-white">$1</strong>')
                                .replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc marker:text-teal-500">$1</li>')
                                .replace(/\n/g, '<br/>')
                        }} />
                    </article>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

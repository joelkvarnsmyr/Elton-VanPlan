
import React, { useMemo, useState, useEffect } from 'react';
import { Project, TaskStatus } from '@/types/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Coins, CheckCircle2, Wallet, Calendar, MapPin, Flag, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import { Resources } from './Resources';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

interface DashboardProps {
  project: Project;
  onPhaseClick?: (phase: string) => void;
}

const COLORS = {
  pink: '#F4CFDF',
  blue: '#D9E4EC',
  green: '#E0E8CB',
  charcoal: '#463F3A',
  slate: '#8A817C',
  ice: '#FAF7F5'
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 0 }).format(amount);
};

export const Dashboard: React.FC<DashboardProps> = ({ project, onPhaseClick }) => {
  const { tasks, vehicleData } = project;
  
  // Section Ordering State
  const [sectionOrder, setSectionOrder] = useState<string[]>(() => {
      const saved = localStorage.getItem('elton-dashboard-order');
      return saved ? JSON.parse(saved) : ['stats', 'timeline', 'budget', 'phases', 'resources'];
  });

  useEffect(() => {
      localStorage.setItem('elton-dashboard-order', JSON.stringify(sectionOrder));
  }, [sectionOrder]);

  const moveSection = (section: string, direction: 'up' | 'down') => {
      const idx = sectionOrder.indexOf(section);
      if (idx === -1) return;
      if (direction === 'up' && idx === 0) return;
      if (direction === 'down' && idx === sectionOrder.length - 1) return;

      const newOrder = [...sectionOrder];
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
      setSectionOrder(newOrder);
  };

  const stats = useMemo(() => {
    const totalMin = tasks.reduce((sum, t) => sum + (t.estimatedCostMin || 0), 0);
    const totalMax = tasks.reduce((sum, t) => sum + (t.estimatedCostMax || 0), 0);
    const spent = tasks.reduce((sum, t) => sum + (t.actualCost || 0), 0);
    const completed = tasks.filter(t => t.status === TaskStatus.DONE).length;
    const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
    const remainingBudget = (totalMax + totalMin) / 2 - spent;

    return { totalMin, totalMax, spent, progress, completed, total: tasks.length, remainingBudget };
  }, [tasks]);

  const chartData = useMemo(() => {
    // Handle case where phase might be undefined or empty
    const phases = Array.from(new Set(tasks.map(t => t.phase || 'Okänd Fas')));
    return phases.map(phase => {
      const phaseTasks = tasks.filter(t => (t.phase || 'Okänd Fas') === phase);
      return {
        name: (phase as string).split(':')[0],
        est: phaseTasks.reduce((sum, t) => sum + ((t.estimatedCostMax || 0) + (t.estimatedCostMin || 0))/2, 0),
        spent: phaseTasks.reduce((sum, t) => sum + (t.actualCost || 0), 0)
      };
    });
  }, [tasks]);

  const timelineData = useMemo(() => {
    // Safe access to vehicleData properties with fallbacks
    const prodYear = vehicleData?.prodYear ? String(vehicleData.prodYear) : '-';
    const regDate = vehicleData?.regDate || '-';
    const createdDate = project.created ? format(new Date(project.created), 'd MMM yyyy', { locale: sv }) : '-';

    const historyEvents = [
        {
            date: prodYear,
            title: 'Tillverkad',
            description: `${vehicleData?.make || 'Okänd'} ${vehicleData?.model || 'Fordon'}`,
            type: 'history',
            icon: Calendar
        },
        {
            date: regDate,
            title: 'I Trafik',
            description: 'Första gången på väg',
            type: 'history',
            icon: MapPin
        },
        {
            date: createdDate,
            title: 'Projektstart',
            description: project.name,
            type: 'milestone',
            icon: Flag
        }
    ];

    const completedTasks = tasks
        .filter(t => t.status === TaskStatus.DONE)
        .slice(0, 5) 
        .map(t => ({
            date: 'Klar', 
            title: t.title,
            description: (t.phase || 'Okänd').split(':')[0],
            type: 'task',
            icon: CheckCircle2
        }));

    return [...historyEvents, ...completedTasks];
  }, [tasks, vehicleData, project]);

  const SectionHeader = ({ title, id }: { title: string, id: string }) => (
      <div className="flex justify-between items-center mb-4 group">
          <h3 className="font-serif font-bold text-xl text-nordic-charcoal dark:text-nordic-ice">{title}</h3>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => moveSection(id, 'up')} className="p-1 hover:bg-slate-100 dark:hover:bg-nordic-charcoal rounded"><ArrowUp size={14}/></button>
              <button onClick={() => moveSection(id, 'down')} className="p-1 hover:bg-slate-100 dark:hover:bg-nordic-charcoal rounded"><ArrowDown size={14}/></button>
          </div>
      </div>
  );

  const StatCard = ({ title, value, subtext, icon: Icon, color }: any) => (
    <div className="bg-white dark:bg-nordic-dark-surface p-6 rounded-3xl shadow-sm border border-nordic-ice dark:border-nordic-dark-bg flex items-center space-x-4 transition-all hover:shadow-md h-full">
      <div className={`p-4 rounded-2xl ${color} dark:bg-opacity-20`}>
        <Icon size={24} className="text-nordic-charcoal dark:text-nordic-ice opacity-80" />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{title}</p>
        <h3 className="text-2xl font-serif font-bold text-nordic-charcoal dark:text-nordic-ice">{value}</h3>
        {subtext && <p className="text-xs text-slate-500 dark:text-nordic-dark-muted mt-1">{subtext}</p>}
      </div>
    </div>
  );

  const renderSection = (id: string) => {
      switch(id) {
          case 'stats':
              return (
                <div key="stats" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard 
                    title="Total Budget" 
                    value={`${formatCurrency(stats.totalMin)} - ${formatCurrency(stats.totalMax)}`}
                    subtext="Uppskattat spann"
                    icon={Wallet}
                    color="bg-nordic-blue"
                    />
                    <StatCard 
                    title="Spenderat" 
                    value={formatCurrency(stats.spent)}
                    subtext={`Kvar av snittbudget: ${formatCurrency(stats.remainingBudget)}`}
                    icon={Coins}
                    color="bg-nordic-pink"
                    />
                    <StatCard 
                    title="Färdigt" 
                    value={`${stats.progress}%`}
                    subtext={`${stats.completed} av ${stats.total} uppgifter klara`}
                    icon={CheckCircle2}
                    color="bg-nordic-green"
                    />
                </div>
              );
          case 'timeline':
              return (
                <div key="timeline" className="bg-white dark:bg-nordic-dark-surface p-8 rounded-3xl shadow-sm border border-nordic-ice dark:border-nordic-dark-bg overflow-hidden">
                    <SectionHeader title="Tidslinje & Resa" id="timeline" />
                    <div className="relative">
                        <div className="absolute top-[24px] left-0 w-full h-1 bg-gradient-to-r from-nordic-ice via-nordic-blue/30 to-nordic-ice dark:from-nordic-dark-bg dark:via-nordic-charcoal dark:to-nordic-dark-bg rounded-full"></div>
                        <div className="flex overflow-x-auto pb-6 space-x-12 px-4 scrollbar-thin scrollbar-thumb-nordic-blue/50 scrollbar-track-transparent snap-x">
                            {timelineData.map((event, idx) => (
                                <div key={idx} className="relative flex flex-col items-center min-w-[160px] snap-center group">
                                    <div className={`w-12 h-12 rounded-full border-4 border-white dark:border-nordic-dark-surface shadow-sm flex items-center justify-center mb-4 z-10 transition-transform duration-300 group-hover:scale-110 ${
                                        event.type === 'history' ? 'bg-slate-100 dark:bg-nordic-charcoal text-slate-400' :
                                        event.type === 'milestone' ? 'bg-nordic-pink dark:bg-pink-900/40 text-rose-800 dark:text-rose-200' :
                                        'bg-nordic-green dark:bg-green-900/40 text-green-800 dark:text-green-200'
                                    }`}>
                                        <event.icon size={20} />
                                    </div>
                                    <div className="text-center transition-opacity duration-300 group-hover:opacity-100">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">{event.date}</span>
                                        <h4 className="font-bold text-nordic-charcoal dark:text-nordic-ice text-sm leading-tight mb-1">{event.title}</h4>
                                        <p className="text-xs text-slate-500 dark:text-nordic-dark-muted max-w-[140px] mx-auto leading-relaxed">{event.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
              );
          case 'budget':
              return (
                <div key="budget" className="bg-white dark:bg-nordic-dark-surface p-8 rounded-3xl shadow-sm border border-nordic-ice dark:border-nordic-dark-bg">
                    <SectionHeader title="Ekonomi per Fas" id="budget" />
                    <div style={{ width: '100%', height: 320, minHeight: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} barGap={-20}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#8A817C', fontSize: 12}} dy={10} />
                            <YAxis hide />
                            <Tooltip 
                                cursor={{fill: 'rgba(200,200,200,0.1)'}} 
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }} 
                                formatter={(value: number) => formatCurrency(value)}
                            />
                            <Bar dataKey="est" name="Estimat" fill={COLORS.ice} radius={[8, 8, 8, 8]} barSize={48} className="dark:fill-nordic-charcoal" />
                            <Bar dataKey="spent" name="Utfall" fill={COLORS.charcoal} radius={[8, 8, 8, 8]} barSize={24} className="dark:fill-teal-600" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
              );
          case 'phases':
              return (
                <div key="phases" className="grid grid-cols-1 gap-4">
                    <SectionHeader title="Status per Fas" id="phases" />
                    {chartData.map((data, idx) => (
                        <button 
                            key={idx} 
                            onClick={() => onPhaseClick && onPhaseClick(data.name)}
                            className="bg-white dark:bg-nordic-dark-surface p-5 rounded-2xl border border-nordic-ice dark:border-nordic-dark-bg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-nordic-charcoal/50 transition-colors w-full group text-left cursor-pointer shadow-sm hover:shadow-md"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-nordic-ice dark:bg-nordic-charcoal flex items-center justify-center font-serif font-bold text-slate-600 dark:text-nordic-ice group-hover:scale-110 transition-transform">
                                    {idx + 0}
                                </div>
                                <div>
                                    <h4 className="font-bold text-nordic-charcoal dark:text-nordic-ice flex items-center gap-2">
                                        {data.name} 
                                        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-teal-500" />
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-nordic-dark-muted">{formatCurrency(data.spent)} spenderat</p>
                                </div>
                            </div>
                            <div className="w-32 h-2 bg-nordic-ice dark:bg-nordic-charcoal rounded-full overflow-hidden">
                                <div className="h-full bg-teal-500 rounded-full" style={{ width: `${Math.min((data.spent / (data.est || 1)) * 100, 100)}%` }}></div>
                            </div>
                        </button>
                    ))}
                </div>
              );
          case 'resources':
              return (
                  <div key="resources" className="pt-4">
                      <SectionHeader title="Resurser" id="resources" />
                      <Resources projectArticles={project.knowledgeArticles} />
                  </div>
              );
          default:
              return null;
      }
  };

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      {sectionOrder.map(sectionId => renderSection(sectionId))}
    </div>
  );
};

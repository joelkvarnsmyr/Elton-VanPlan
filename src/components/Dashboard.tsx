import React, { useMemo, useState, useEffect } from 'react';
import { TaskStatus, KnowledgeArticle } from '@/types/types';
import { Coins, CheckCircle2, Wallet, Calendar, MapPin, Flag } from 'lucide-react';
import { Resources } from './Resources';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { getKnowledgeBase } from '@/services/db';
import { ProjectFocus } from './ProjectFocus';
import { ProjectRoadmap } from './ProjectRoadmap';
import { useProject } from '@/contexts';

interface DashboardProps {
  onPhaseClick?: (phase: string) => void;
  onViewTask: (taskId: string) => void;
  onViewShopping: () => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 0 }).format(amount);
};

export const Dashboard: React.FC<DashboardProps> = ({ onPhaseClick, onViewTask, onViewShopping }) => {
  const { activeProject, tasks, vehicleData } = useProject();

  if (!activeProject) return null;

  // Load knowledge articles from sub-collection
  const [knowledgeArticles, setKnowledgeArticles] = useState<KnowledgeArticle[]>([]);

  useEffect(() => {
    const loadKnowledgeBase = async () => {
      try {
        const data = await getKnowledgeBase(activeProject.id);
        setKnowledgeArticles(data);
      } catch (error) {
        console.error('Failed to load knowledge base:', error);
      }
    };
    loadKnowledgeBase();
  }, [activeProject.id]);

  const stats = useMemo(() => {
    const totalMin = tasks.reduce((sum, t) => sum + (t.estimatedCostMin || 0), 0);
    const totalMax = tasks.reduce((sum, t) => sum + (t.estimatedCostMax || 0), 0);
    const spent = tasks.reduce((sum, t) => sum + (t.actualCost || 0), 0);
    const completed = tasks.filter(t => t.status === TaskStatus.DONE).length;
    const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
    const remainingBudget = (totalMax + totalMin) / 2 - spent;

    return { totalMin, totalMax, spent, progress, completed, total: tasks.length, remainingBudget };
  }, [tasks]);

  const timelineData = useMemo(() => {
    // Safe access to vehicleData properties with fallbacks
    const prodYear = vehicleData?.prodYear ? String(vehicleData.prodYear) : '-';
    const regDate = vehicleData?.regDate || '-';
    const createdDate = activeProject.created ? format(new Date(activeProject.created), 'd MMM yyyy', { locale: sv }) : '-';

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
        description: activeProject.name,
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
  }, [tasks, vehicleData, activeProject]);

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

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      <ProjectFocus
        project={activeProject}
        onViewTask={onViewTask}
        onViewShopping={onViewShopping}
      />

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* ROADMAP - THE NARRATIVE JOURNEY */}
      <ProjectRoadmap tasks={tasks} onPhaseClick={onPhaseClick} />

      {/* RESOURCES */}
      <div className="pt-4">
        <h3 className="font-serif font-bold text-xl text-nordic-charcoal dark:text-nordic-ice mb-4">Resurser</h3>
        <Resources projectArticles={knowledgeArticles} />
      </div>

      {/* TIMELINE (History) - Moved to bottom as supplementary info */}
      <div className="bg-white dark:bg-nordic-dark-surface p-8 rounded-3xl shadow-sm border border-nordic-ice dark:border-nordic-dark-bg overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
        <h3 className="font-serif font-bold text-xl text-nordic-charcoal dark:text-nordic-ice mb-4">Historik</h3>
        <div className="relative">
          <div className="absolute top-[24px] left-0 w-full h-1 bg-gradient-to-r from-nordic-ice via-nordic-blue/30 to-nordic-ice dark:from-nordic-dark-bg dark:via-nordic-charcoal dark:to-nordic-dark-bg rounded-full"></div>
          <div className="flex overflow-x-auto pb-6 space-x-12 px-4 scrollbar-thin scrollbar-thumb-nordic-blue/50 scrollbar-track-transparent snap-x">
            {timelineData.map((event, idx) => (
              <div key={idx} className="relative flex flex-col items-center min-w-[160px] snap-center group">
                <div className={`w-12 h-12 rounded-full border-4 border-white dark:border-nordic-dark-surface shadow-sm flex items-center justify-center mb-4 z-10 transition-transform duration-300 group-hover:scale-110 ${event.type === 'history' ? 'bg-slate-100 dark:bg-nordic-charcoal text-slate-400' :
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
    </div>
  );
};

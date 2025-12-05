import React, { useMemo } from 'react';
import { Task, TaskStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Coins, CheckCircle2, TrendingUp, Wallet, Calendar, MapPin, Flag, ArrowRight } from 'lucide-react';
import { VEHICLE_DATA } from '../constants';

interface DashboardProps {
  tasks: Task[];
}

// Updated warm pastel palette
const COLORS = {
  pink: '#F4CFDF',
  blue: '#D9E4EC',
  green: '#E0E8CB',
  charcoal: '#463F3A',
  slate: '#8A817C',
  ice: '#FAF7F5'
};

export const Dashboard: React.FC<DashboardProps> = ({ tasks }) => {
  
  const stats = useMemo(() => {
    const totalMin = tasks.reduce((sum, t) => sum + t.estimatedCostMin, 0);
    const totalMax = tasks.reduce((sum, t) => sum + t.estimatedCostMax, 0);
    const spent = tasks.reduce((sum, t) => sum + t.actualCost, 0);
    const completed = tasks.filter(t => t.status === TaskStatus.DONE).length;
    const progress = Math.round((completed / tasks.length) * 100);
    const remainingBudget = (totalMax + totalMin) / 2 - spent;

    return { totalMin, totalMax, spent, progress, completed, total: tasks.length, remainingBudget };
  }, [tasks]);

  const chartData = useMemo(() => {
    const phases = Array.from(new Set(tasks.map(t => t.phase)));
    return phases.map(phase => {
      const phaseTasks = tasks.filter(t => t.phase === phase);
      return {
        name: (phase as string).split(':')[0],
        est: phaseTasks.reduce((sum, t) => sum + (t.estimatedCostMax + t.estimatedCostMin)/2, 0),
        spent: phaseTasks.reduce((sum, t) => sum + t.actualCost, 0)
      };
    });
  }, [tasks]);

  const timelineData = useMemo(() => {
    const historyEvents = [
        {
            date: '1976',
            title: 'Tillverkad',
            description: 'Elton byggs i Tyskland',
            type: 'history',
            icon: Calendar
        },
        {
            date: VEHICLE_DATA.regDate,
            title: 'I Trafik',
            description: 'Första gången på väg',
            type: 'history',
            icon: MapPin
        },
        {
            date: '2023',
            title: 'Ägarbyte',
            description: 'Historiskt ägarbyte',
            type: 'history',
            icon: UsersIcon
        },
        {
            date: '2025',
            title: 'Projektstart',
            description: 'Hanna Erixon tar över',
            type: 'milestone',
            icon: Flag
        }
    ];

    const completedTasks = tasks
        .filter(t => t.status === TaskStatus.DONE)
        .map(t => ({
            date: 'Klart',
            title: t.title,
            description: t.phase.split(':')[0],
            type: 'task',
            icon: CheckCircle2
        }));

    return [...historyEvents, ...completedTasks];
  }, [tasks]);

  const StatCard = ({ title, value, subtext, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-nordic-ice flex items-center space-x-4 transition-all hover:shadow-md">
      <div className={`p-4 rounded-2xl ${color}`}>
        <Icon size={24} className="text-nordic-charcoal opacity-80" />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{title}</p>
        <h3 className="text-2xl font-serif font-bold text-nordic-charcoal">{value}</h3>
        {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      {/* Key Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Budget" 
          value={`${stats.totalMin.toLocaleString()} - ${stats.totalMax.toLocaleString()} kr`}
          subtext="Uppskattat spann"
          icon={Wallet}
          color="bg-nordic-blue"
        />
        <StatCard 
          title="Spenderat" 
          value={`${stats.spent.toLocaleString()} kr`}
          subtext={`Kvar av snittbudget: ${stats.remainingBudget.toLocaleString()} kr`}
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

      {/* Horizontal Timeline */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-nordic-ice overflow-hidden">
        <h3 className="font-serif font-bold text-xl text-nordic-charcoal mb-8 flex items-center gap-2">
            <span>Tidslinje & Resa</span>
            <span className="text-xs font-sans font-normal text-slate-400 bg-slate-100 px-2 py-1 rounded-full">Scrolla i sidled →</span>
        </h3>
        <div className="relative">
            {/* Horizontal Line Background */}
            <div className="absolute top-[24px] left-0 w-full h-1 bg-gradient-to-r from-nordic-ice via-nordic-blue/30 to-nordic-ice rounded-full"></div>
            
            <div className="flex overflow-x-auto pb-6 space-x-12 px-4 scrollbar-thin scrollbar-thumb-nordic-blue/50 scrollbar-track-transparent snap-x">
                {timelineData.map((event, idx) => (
                    <div key={idx} className="relative flex flex-col items-center min-w-[160px] snap-center group">
                        <div className={`w-12 h-12 rounded-full border-4 border-white shadow-sm flex items-center justify-center mb-4 z-10 transition-transform duration-300 group-hover:scale-110 ${
                            event.type === 'history' ? 'bg-slate-100 text-slate-400' :
                            event.type === 'milestone' ? 'bg-nordic-pink text-rose-800' :
                            'bg-nordic-green text-green-800'
                        }`}>
                            <event.icon size={20} />
                        </div>
                        <div className="text-center transition-opacity duration-300 group-hover:opacity-100">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">{event.date}</span>
                            <h4 className="font-bold text-nordic-charcoal text-sm leading-tight mb-1">{event.title}</h4>
                            <p className="text-xs text-slate-500 max-w-[140px] mx-auto leading-relaxed">{event.description}</p>
                        </div>
                    </div>
                ))}
                
                {/* Future Placeholder */}
                <div className="relative flex flex-col items-center min-w-[160px] snap-center opacity-40">
                        <div className="w-12 h-12 rounded-full border-4 border-white bg-slate-50 border-dashed border-slate-300 flex items-center justify-center mb-4 z-10">
                        <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                        </div>
                        <div className="text-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-1 block">Framtid</span>
                        <h4 className="font-bold text-slate-400 text-sm leading-tight mb-1">Äventyret</h4>
                        </div>
                </div>
            </div>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-nordic-ice">
         <div className="flex items-center justify-between mb-8">
           <div>
             <h3 className="font-serif font-bold text-xl text-nordic-charcoal">Ekonomi per Fas</h3>
             <p className="text-sm text-slate-500">Jämförelse mellan estimat och utfall</p>
           </div>
           <div className="flex gap-4 text-xs font-medium">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-nordic-ice"></div>
                <span>Estimat</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-nordic-charcoal"></div>
                <span>Utfall</span>
              </div>
           </div>
         </div>
         
         <div className="h-80 w-full">
           <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={-20}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: COLORS.slate, fontSize: 12}} 
                dy={10}
              />
              <YAxis 
                hide 
              />
              <Tooltip 
                cursor={{fill: '#F8FAFC'}}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
              />
              {/* Ghost Shadow (Estimate) */}
              <Bar dataKey="est" name="Estimat" fill={COLORS.ice} radius={[8, 8, 8, 8]} barSize={48} />
              {/* Actual Spend */}
              <Bar dataKey="spent" name="Utfall" fill={COLORS.charcoal} radius={[8, 8, 8, 8]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
         </div>
      </div>

      {/* Phase Progress List */}
      <div className="grid grid-cols-1 gap-4">
          <h3 className="font-serif font-bold text-xl text-nordic-charcoal px-2">Status per Fas</h3>
          {chartData.map((data, idx) => {
             const isComplete = data.est > 0 && data.spent >= data.est; 
             return (
               <div key={idx} className="bg-white p-5 rounded-2xl border border-nordic-ice flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-nordic-ice flex items-center justify-center font-serif font-bold text-slate-600">
                        {idx + 0}
                     </div>
                     <div>
                        <h4 className="font-bold text-nordic-charcoal">{data.name}</h4>
                        <p className="text-xs text-slate-500">{data.spent.toLocaleString()} kr spenderat</p>
                     </div>
                  </div>
                  
                  <div className="w-32 h-2 bg-nordic-ice rounded-full overflow-hidden">
                     <div 
                       className="h-full bg-teal-500 rounded-full" 
                       style={{ width: `${Math.min((data.spent / (data.est || 1)) * 100, 100)}%` }}
                     ></div>
                  </div>
               </div>
             )
          })}
      </div>
    </div>
  );
};

// Helper icon
const UsersIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
);

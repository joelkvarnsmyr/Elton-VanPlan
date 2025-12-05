import React, { useState } from 'react';
import { Task, Phase, TaskStatus } from '../types';
import { ChevronDown, ChevronRight, Check, AlertCircle, MessageSquare, Paperclip, Link as LinkIcon } from 'lucide-react';
import { TaskDetailModal } from './TaskDetailModal';

interface TaskBoardProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onUpdateTask }) => {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(Phase.ACUTE);
  const [activeFilter, setActiveFilter] = useState<Phase | 'ALL'>('ALL');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const togglePhase = (phase: string) => {
    setExpandedPhase(expandedPhase === phase ? null : phase);
  };

  const phases = Object.values(Phase);
  const filteredPhases = activeFilter === 'ALL' ? phases : [activeFilter];

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.DONE: return 'bg-nordic-green text-green-900 border-green-200'; // Sage Green
      case TaskStatus.IN_PROGRESS: return 'bg-nordic-blue text-blue-900 border-blue-200'; // Ice Blue
      case TaskStatus.TODO: return 'bg-nordic-pink text-rose-900 border-rose-200'; // Dusty Pink
      default: return 'bg-slate-100';
    }
  };

  const handleStatusChange = (task: Task) => {
    const nextStatus = task.status === TaskStatus.TODO 
      ? TaskStatus.IN_PROGRESS 
      : task.status === TaskStatus.IN_PROGRESS 
        ? TaskStatus.DONE 
        : TaskStatus.TODO;
    
    onUpdateTask({ ...task, status: nextStatus });
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Phase Filter Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        <button 
           onClick={() => setActiveFilter('ALL')}
           className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeFilter === 'ALL' ? 'bg-nordic-charcoal text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
        >
          Alla Faser
        </button>
        {phases.map(phase => (
          <button 
             key={phase}
             onClick={() => setActiveFilter(phase)}
             className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeFilter === phase ? 'bg-nordic-charcoal text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
          >
            {phase.split(':')[0]}
          </button>
        ))}
      </div>

      {filteredPhases.map((phase) => {
        const phaseTasks = tasks.filter(t => t.phase === phase);
        const isExpanded = expandedPhase === phase || filteredPhases.length === 1;
        
        return (
          <div key={phase} className="bg-white rounded-3xl border border-nordic-ice shadow-sm overflow-hidden transition-all duration-500 ease-in-out">
            <button 
              onClick={() => togglePhase(phase)}
              className="w-full flex items-center justify-between p-6 bg-white hover:bg-nordic-ice/30 transition-colors"
            >
              <div className="flex items-center space-x-4">
                 <div className={`p-2.5 rounded-xl transition-colors ${isExpanded ? 'bg-nordic-charcoal text-white' : 'bg-nordic-ice text-slate-500'}`}>
                    {isExpanded ? <ChevronDown size={20}/> : <ChevronRight size={20}/>}
                 </div>
                 <div className="text-left">
                    <h3 className="font-serif font-bold text-xl text-nordic-charcoal">{phase}</h3>
                    <div className="flex items-center space-x-2 text-sm text-slate-500 mt-1">
                      <span className="bg-nordic-green/50 px-2 py-0.5 rounded-full text-xs text-green-900 font-medium">
                        {phaseTasks.filter(t=>t.status===TaskStatus.DONE).length} Klara
                      </span>
                      <span>•</span>
                      <span>{phaseTasks.length} Totalt</span>
                    </div>
                 </div>
              </div>
            </button>
            
            {isExpanded && (
              <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 bg-nordic-ice/20 border-t border-nordic-ice">
                <div className="h-2 col-span-full"></div> {/* Spacer */}
                {phaseTasks.map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => setSelectedTask(task)}
                    className={`group relative p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between cursor-pointer ${
                        task.status === TaskStatus.DONE ? 'bg-white border-slate-100 opacity-70 hover:opacity-100' : 'bg-white border-slate-200 shadow-sm'
                    }`}
                  >
                    <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                          {task.tags.includes('Kritisk') && (
                            <span className="text-rose-500 animate-pulse">
                              <AlertCircle size={16} />
                            </span>
                          )}
                        </div>
                        
                        <h4 className={`font-bold text-lg mb-2 ${task.status === TaskStatus.DONE ? 'text-slate-500 line-through decoration-2 decoration-slate-300' : 'text-nordic-charcoal'}`}>
                          {task.title}
                        </h4>
                        <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">{task.description}</p>
                    </div>

                    <div className="flex flex-col gap-3 mt-2 pt-4 border-t border-slate-50">
                        {/* Indicators for attachments/comments */}
                        <div className="flex gap-3 text-slate-400">
                             {(task.comments?.length > 0) && (
                                <div className="flex items-center gap-1 text-xs">
                                    <MessageSquare size={14} />
                                    <span>{task.comments.length}</span>
                                </div>
                             )}
                             {(task.attachments?.length > 0) && (
                                <div className="flex items-center gap-1 text-xs">
                                    <Paperclip size={14} />
                                    <span>{task.attachments.length}</span>
                                </div>
                             )}
                             {(task.links?.length > 0) && (
                                <div className="flex items-center gap-1 text-xs">
                                    <LinkIcon size={14} />
                                    <span>{task.links.length}</span>
                                </div>
                             )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase text-slate-400 font-bold">Estimat</span>
                                <span className="text-sm font-mono text-slate-600">{task.estimatedCostMin}-{task.estimatedCostMax} kr</span>
                            </div>
                            
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleStatusChange(task); }}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                task.status === TaskStatus.DONE 
                                    ? 'bg-nordic-green text-green-800 scale-110 shadow-inner' 
                                    : 'bg-slate-100 text-slate-400 hover:bg-nordic-blue hover:text-blue-800 hover:scale-110'
                                }`}
                            >
                                <Check size={20} strokeWidth={task.status === TaskStatus.DONE ? 3 : 2} />
                            </button>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {selectedTask && (
        <TaskDetailModal 
            task={selectedTask} 
            onUpdate={(updated) => {
                onUpdateTask(updated);
                setSelectedTask(updated); // Keep modal open with fresh data
            }}
            onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};
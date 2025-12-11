import React from 'react';
import { CheckCircle2, Circle, Clock, Construction, Zap, Layers, Database, PenTool, Wrench, DollarSign, BookOpen, AlertCircle, GripVertical } from 'lucide-react';
import { Feature } from '@/data/roadmapData';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface RoadmapCardProps {
    feature: Feature;
    onClick: () => void;
    isDraggable?: boolean;
}

export const RoadmapCard: React.FC<RoadmapCardProps> = ({ feature, onClick, isDraggable = false }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: feature.id.toString(),
        disabled: !isDraggable
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const getCategoryIcon = (category: string) => {
        switch(category) {
            case 'AI Core': return <Zap size={16} className="text-amber-500" />;
            case 'Plattform': return <Layers size={16} className="text-blue-500" />;
            case 'Ekonomi': return <DollarSign size={16} className="text-green-500" />;
            case 'Garage': return <Wrench size={16} className="text-slate-500" />;
            case 'Kunskap': return <BookOpen size={16} className="text-purple-500" />;
            case 'Data': return <Database size={16} className="text-indigo-500" />;
            case 'Infrastruktur': return <Layers size={16} className="text-teal-500" />;
            case 'Projektledning': return <AlertCircle size={16} className="text-orange-500" />;
            case 'Strategi': return <PenTool size={16} className="text-pink-500" />;
            default: return <PenTool size={16} className="text-slate-400" />;
        }
    };

    const getStatusConfig = (status: string) => {
        if (status === 'done') return {
            bg: 'bg-teal-50',
            border: 'border-teal-200',
            text: 'text-teal-700',
            badge: 'bg-teal-100 text-teal-800 border-teal-200',
            icon: <CheckCircle2 size={12} />,
            label: 'Lanserad'
        };
        if (status === 'in-progress') return {
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            text: 'text-amber-700',
            badge: 'bg-amber-100 text-amber-800 border-amber-200',
            icon: <Construction size={12} />,
            label: 'Pågår'
        };
        return {
            bg: 'bg-slate-50',
            border: 'border-slate-200',
            text: 'text-slate-600',
            badge: 'bg-slate-100 text-slate-600 border-slate-200',
            icon: <Circle size={12} />,
            label: 'Planerad'
        };
    };

    const statusConfig = getStatusConfig(feature.status);
    const completedTasks = feature.checklist.filter(item => item.completed).length;
    const totalTasks = feature.checklist.length;
    const progress = (completedTasks / totalTasks) * 100;

    // Parse tech string or array
    const techArray = Array.isArray(feature.tech) ? feature.tech : [feature.tech];
    const displayTechs = techArray.slice(0, 2); // Show max 2 tech tags
    const moreTechs = techArray.length - 2;

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={onClick}
            className={`
                ${statusConfig.bg} ${statusConfig.border}
                border-2 rounded-2xl p-5
                cursor-pointer transition-all duration-300
                hover:scale-[1.02] hover:shadow-xl
                ${feature.status === 'in-progress' ? 'ring-2 ring-amber-300/50' : ''}
                ${isDragging ? 'shadow-2xl z-50' : ''}
            `}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                {isDraggable && (
                    <button
                        className="mr-2 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 transition-colors"
                        {...attributes}
                        {...listeners}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <GripVertical size={18} />
                    </button>
                )}
                <div className="flex items-center gap-2">
                    <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center
                        font-bold text-xs shadow-sm
                        ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}
                    `}>
                        #{feature.id}
                    </div>
                    <div className="flex items-center gap-1.5">
                        {getCategoryIcon(feature.category)}
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {feature.category}
                        </span>
                    </div>
                </div>
                <span className={`
                    inline-flex items-center gap-1 px-2 py-1
                    text-[10px] font-bold uppercase rounded-md border
                    ${statusConfig.badge}
                `}>
                    {statusConfig.icon}
                    {statusConfig.label}
                </span>
            </div>

            {/* Title & Description */}
            <h3 className="font-bold text-lg text-nordic-charcoal mb-2 line-clamp-2">
                {feature.title}
            </h3>
            <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                {feature.description}
            </p>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                        Progress
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                        {completedTasks}/{totalTasks}
                    </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
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

            {/* Tech Tags */}
            <div className="flex flex-wrap gap-1.5 mb-3">
                {displayTechs.map((tech, idx) => (
                    <span
                        key={idx}
                        className="inline-block px-2 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-medium text-slate-600"
                    >
                        {tech}
                    </span>
                ))}
                {moreTechs > 0 && (
                    <span className="inline-block px-2 py-1 bg-slate-100 border border-slate-200 rounded-md text-[10px] font-bold text-slate-500">
                        +{moreTechs}
                    </span>
                )}
            </div>

            {/* Priority Badge (if exists) */}
            {feature.priority && (
                <div className="flex items-center gap-1.5 mt-2">
                    <span className={`
                        text-[9px] font-bold uppercase px-2 py-0.5 rounded
                        ${feature.priority === 'high' ? 'bg-rose-100 text-rose-700' :
                          feature.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'}
                    `}>
                        {feature.priority === 'high' ? '⬆️ High' :
                         feature.priority === 'medium' ? '➡️ Medium' :
                         '⬇️ Low'}
                    </span>
                    {feature.estimatedCompletion && (
                        <span className="text-[9px] text-slate-400 flex items-center gap-1">
                            <Clock size={10} />
                            {feature.estimatedCompletion}
                        </span>
                    )}
                </div>
            )}

            {/* Checklist Preview (Expandable section - shown on hover) */}
            <div className="mt-3 pt-3 border-t border-slate-200/50">
                <div className="flex items-center gap-2">
                    {feature.checklist.slice(0, 5).map((item, idx) => (
                        item.completed ? (
                            <CheckCircle2 key={idx} size={14} className="text-teal-500" />
                        ) : item.inProgress ? (
                            <Clock key={idx} size={14} className="text-amber-500 animate-pulse" />
                        ) : (
                            <Circle key={idx} size={14} className="text-slate-300" />
                        )
                    ))}
                    {feature.checklist.length > 5 && (
                        <span className="text-[10px] text-slate-400">
                            +{feature.checklist.length - 5}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

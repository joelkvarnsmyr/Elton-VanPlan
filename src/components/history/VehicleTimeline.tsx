import React from 'react';
import { VehicleHistoryEvent } from '@/types/vehicle-history-types';
import { Calendar, User, Search, FileText, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

interface VehicleTimelineProps {
    events: VehicleHistoryEvent[];
}

export const VehicleTimeline: React.FC<VehicleTimelineProps> = ({ events }) => {
    if (!events || events.length === 0) return null;

    // Sort descending (newest first)
    const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const getIcon = (type: string) => {
        switch (type) {
            case 'owner_change': return User;
            case 'inspection': return CheckCircle;
            case 'registration': return FileText;
            case 'deregistration': return AlertTriangle;
            case 'advertisement': return Search;
            default: return Info;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'owner_change': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
            case 'inspection': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'registration': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
            case 'deregistration': return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
            case 'advertisement': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
            default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    return (
        <div className="bg-white dark:bg-nordic-dark-surface p-6 rounded-3xl border border-nordic-ice dark:border-nordic-dark-bg shadow-sm">
            <h3 className="font-serif font-bold text-lg text-nordic-charcoal dark:text-nordic-ice mb-6">Fordonshistorik</h3>

            <div className="relative border-l-2 border-slate-100 dark:border-nordic-dark-bg ml-3 space-y-8">
                {sortedEvents.map((event, idx) => {
                    const Icon = getIcon(event.type);
                    return (
                        <div key={event.id || idx} className="relative pl-8">
                            {/* Dot / Icon */}
                            <div className={`absolute -left-[19px] p-2 rounded-full border-4 border-white dark:border-nordic-dark-surface ${getColor(event.type)}`}>
                                <Icon size={14} />
                            </div>

                            {/* Content */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                                        {format(new Date(event.date), 'd MMM yyyy', { locale: sv })}
                                    </span>
                                    <h4 className="font-bold text-nordic-charcoal dark:text-nordic-ice text-base">{event.title}</h4>
                                    {event.description && <p className="text-sm text-slate-500 dark:text-nordic-dark-muted mt-1">{event.description}</p>}
                                    {event.location && <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><Info size={10} /> {event.location}</p>}
                                </div>

                                <div className="text-right mt-2 sm:mt-0">
                                    {event.mileage && (
                                        <div className="text-sm font-mono font-bold text-teal-600 dark:text-teal-400">
                                            {event.mileage} mil
                                        </div>
                                    )}
                                    {event.price && (
                                        <div className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400">
                                            {event.price.toLocaleString()} kr
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 text-center">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Totalt {events.length} händelser</p>
            </div>
        </div>
    );
};

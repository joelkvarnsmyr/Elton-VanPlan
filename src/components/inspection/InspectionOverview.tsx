import React from 'react';
import { DetailedInspection, DetailedInspectionArea } from '@/types/types';
import { AlertTriangle, CheckCircle, Wrench } from 'lucide-react';

interface InspectionOverviewProps {
    inspection: DetailedInspection;
    onAreaClick?: (areaId: number) => void;
}

export const InspectionOverview: React.FC<InspectionOverviewProps> = ({
    inspection,
    onAreaClick
}) => {
    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'CRITICAL': return 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-800';
            case 'HIGH': return 'bg-orange-100 dark:bg-orange-900/20 border-orange-300 dark:border-orange-800';
            case 'MEDIUM': return 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-800';
            default: return 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700';
        }
    };

    const getActionButtonColor = (priority?: string) => {
        switch (priority) {
            case 'CRITICAL': return 'bg-red-600 hover:bg-red-700 text-white';
            case 'HIGH': return 'bg-orange-600 hover:bg-orange-700 text-white';
            case 'MEDIUM': return 'bg-yellow-600 hover:bg-yellow-700 text-white';
            default: return 'bg-slate-600 hover:bg-slate-700 text-white';
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-4">
            {/* Header */}
            <div className="bg-white dark:bg-nordic-dark-surface rounded-2xl shadow-sm border border-slate-200 dark:border-nordic-charcoal p-6">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-bold text-nordic-charcoal dark:text-nordic-ice">
                        Inspektion
                    </h1>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                        {inspection.inspectors.join(', ')}
                    </div>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                    Resultat från genomgång {new Date(inspection.date).toLocaleDateString('sv-SE')}
                </p>

                {/* Statistics */}
                <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-nordic-charcoal">
                        <div className="text-2xl font-bold text-nordic-charcoal dark:text-nordic-ice">
                            {inspection.statistics.total}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Totalt</div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
                        <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                            {inspection.statistics.negative}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Anmärkningar</div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                        <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                            {inspection.statistics.positive}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Positivt</div>
                    </div>
                </div>
            </div>

            {/* Area Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inspection.areas.map((area) => (
                    <div
                        key={area.areaId}
                        onClick={() => onAreaClick?.(area.areaId)}
                        className={`
              rounded-2xl shadow-sm border p-5 cursor-pointer
              transition-all hover:shadow-md hover:-translate-y-0.5
              ${getPriorityColor(area.actionPriority)}
            `}
                    >
                        {/* Area Header */}
                        <div className="flex items-start justify-between mb-3">
                            <h3 className="font-bold text-lg text-nordic-charcoal dark:text-nordic-ice">
                                {area.name}
                            </h3>
                            {area.actionPriority === 'CRITICAL' && (
                                <AlertTriangle className="text-red-600 dark:text-red-400" size={20} />
                            )}
                        </div>

                        {/* Action Button */}
                        {area.actionLabel && (
                            <div className="mb-4">
                                <span className={`
                  inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide
                  ${getActionButtonColor(area.actionPriority)}
                `}>
                                    {area.actionLabel}
                                </span>
                            </div>
                        )}

                        {/* Findings Summary */}
                        <div className="space-y-3">
                            {/* Anmärkningar */}
                            {area.summary && area.summary.negative > 0 && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm">
                                        <AlertTriangle size={16} className="text-red-600 dark:text-red-400" />
                                        <span className="text-slate-700 dark:text-slate-200 font-medium">
                                            ANMÄRKNINGAR
                                        </span>
                                    </div>
                                    <span className="text-lg font-bold text-red-700 dark:text-red-400">
                                        {area.summary.negative}
                                    </span>
                                </div>
                            )}

                            {/* List top findings */}
                            <div className="space-y-1">
                                {area.findings
                                    .filter(f => f.category === 'Anmärkning')
                                    .slice(0, 3)
                                    .map((finding, idx) => (
                                        <div key={finding.id} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                                            <span className="text-slate-400">—</span>
                                            <span className="line-clamp-1">{finding.type}</span>
                                        </div>
                                    ))}
                                {area.summary && area.summary.negative > 3 && (
                                    <div className="text-xs text-slate-500 dark:text-slate-500 italic">
                                        +{area.summary.negative - 3} fler...
                                    </div>
                                )}
                            </div>

                            {/* Positivt */}
                            {area.summary && area.summary.positive > 0 && (
                                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-2 text-sm">
                                        <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                                        <span className="text-slate-700 dark:text-slate-200">POSITIVT</span>
                                    </div>
                                    <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                                        {area.summary.positive}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Click hint */}
                        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Wrench size={12} />
                                Klicka för detaljer
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InspectionOverview;

import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle, ExternalLink, Wrench, MessageCircle } from 'lucide-react';
import { DetailedInspectionArea, DetailedInspectionFinding, Task, VehicleData } from '@/types/types';
import ContextualChat from '../ContextualChat';

interface InspectionDetailProps {
    area: DetailedInspectionArea;
    tasks?: Task[]; // All tasks for linking
    vehicleData: VehicleData; // Needed for chat context
    projectId: string;
    onClose: () => void;
    onConvertToTask?: (finding: DetailedInspectionFinding) => void;
    onViewTask?: (taskId: string) => void;
}

export const InspectionDetail: React.FC<InspectionDetailProps> = ({
    area,
    tasks = [],
    vehicleData,
    projectId,
    onClose,
    onConvertToTask,
    onViewTask
}) => {
    const [selectedFindingForChat, setSelectedFindingForChat] = useState<DetailedInspectionFinding | null>(null);

    const negativeFindings = area.findings.filter(f => f.category === 'Anmärkning');
    const positiveFindings = area.findings.filter(f => f.category === 'Positivt');

    const getLinkedTasks = (finding: DetailedInspectionFinding): Task[] => {
        if (!finding.linkedTaskIds || finding.linkedTaskIds.length === 0) return [];
        return tasks.filter(task => finding.linkedTaskIds?.includes(task.id));
    };

    const getSeverityIcon = (severity?: string) => {
        switch (severity) {
            case 'CRITICAL':
                return <AlertTriangle className="text-red-600" size={16} />;
            case 'HIGH':
                return <AlertTriangle className="text-orange-600" size={16} />;
            case 'MEDIUM':
                return <AlertTriangle className="text-yellow-600" size={16} />;
            default:
                return <span className="text-slate-400">•</span>;
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-nordic-dark-surface rounded-2xl shadow-xl border border-slate-200 dark:border-nordic-charcoal overflow-hidden flex flex-col">

                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-nordic-charcoal">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-nordic-charcoal dark:text-nordic-ice">
                                {area.name}
                            </h2>
                            {area.actionLabel && (
                                <span className={`
                inline-block mt-2 px-3 py-1 rounded-lg text-xs font-bold uppercase
                ${area.actionPriority === 'CRITICAL' ? 'bg-red-600 text-white' :
                                        area.actionPriority === 'HIGH' ? 'bg-orange-600 text-white' :
                                            area.actionPriority === 'MEDIUM' ? 'bg-yellow-600 text-white' :
                                                'bg-slate-600 text-white'}
              `}>
                                    {area.actionLabel}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-nordic-charcoal rounded-lg transition-colors"
                        >
                            <X size={20} className="text-slate-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">

                        {/* Statistics */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                                    {area.summary?.negative || 0}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">Anmärkningar</div>
                            </div>
                            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                                    {area.summary?.positive || 0}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">Positivt</div>
                            </div>
                        </div>

                        {/* Negative Findings */}
                        {negativeFindings.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-semibold text-lg text-nordic-charcoal dark:text-nordic-ice flex items-center gap-2">
                                    <AlertTriangle size={18} className="text-red-600" />
                                    Anmärkningar ({negativeFindings.length})
                                </h3>

                                <div className="space-y-2">
                                    {negativeFindings.map((finding) => {
                                        const linkedTasks = getLinkedTasks(finding);

                                        return (
                                            <div
                                                key={finding.id}
                                                className="p-4 rounded-xl bg-slate-50 dark:bg-nordic-charcoal border border-slate-200 dark:border-slate-700"
                                            >
                                                <div className="flex items-start gap-2">
                                                    {getSeverityIcon(finding.severity)}
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div>
                                                                <span className="font-medium text-slate-700 dark:text-slate-200">
                                                                    {finding.type}
                                                                </span>
                                                                <span className="ml-2 text-xs text-slate-500">ID {finding.id}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => setSelectedFindingForChat(finding)}
                                                                className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
                                                                title="Fråga Elton om detta"
                                                            >
                                                                <MessageCircle size={16} />
                                                            </button>
                                                        </div>

                                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                                            {finding.description}
                                                        </p>

                                                        {finding.position && (
                                                            <p className="mt-1 text-xs text-slate-500">
                                                                <strong>Plats:</strong> {finding.position}
                                                            </p>
                                                        )}

                                                        {finding.action && (
                                                            <div className="mt-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                                                    <strong>Åtgärd:</strong> {finding.action}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Linked Tasks */}
                                                        {linkedTasks.length > 0 && (
                                                            <div className="mt-3 space-y-1">
                                                                {linkedTasks.map(task => (
                                                                    <button
                                                                        key={task.id}
                                                                        onClick={() => onViewTask?.(task.id)}
                                                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors w-full text-left"
                                                                    >
                                                                        <Wrench size={14} className="text-teal-600 dark:text-teal-400" />
                                                                        <span className="text-xs flex-1 text-teal-700 dark:text-teal-300 font-medium">
                                                                            {task.title}
                                                                        </span>
                                                                        <ExternalLink size={12} className="text-teal-600" />
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Convert to Task */}
                                                        {linkedTasks.length === 0 && onConvertToTask && (
                                                            <button
                                                                onClick={() => onConvertToTask(finding)}
                                                                className="mt-2 px-3 py-1.5 text-xs rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                                            >
                                                                Skapa uppgift
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Positive Findings */}
                        {positiveFindings.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-semibold text-lg text-nordic-charcoal dark:text-nordic-ice flex items-center gap-2">
                                    <CheckCircle size={18} className="text-green-600" />
                                    Positivt ({positiveFindings.length})
                                </h3>

                                <div className="space-y-2">
                                    {positiveFindings.map((finding) => (
                                        <div
                                            key={finding.id}
                                            className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                                        >
                                            <div className="flex items-start gap-2">
                                                <CheckCircle size={16} className="text-green-600 dark:text-green-400 mt-0.5" />
                                                <div>
                                                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                                        {finding.type}
                                                    </span>
                                                    <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                                                        {finding.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-200 dark:border-nordic-charcoal flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl bg-nordic-charcoal dark:bg-teal-600 text-white hover:bg-slate-800 dark:hover:bg-teal-700 transition-colors"
                        >
                            Stäng
                        </button>
                    </div>
                </div>
            </div>
            {selectedFindingForChat && (
                <ContextualChat
                    context={{
                        type: 'inspection_finding',
                        inspectionFinding: selectedFindingForChat,
                        inspectionArea: area,
                        vehicleData: vehicleData,
                    }}
                    projectId={projectId}
                    onClose={() => setSelectedFindingForChat(null)}
                />
            )}
        </>
    );
};

export default InspectionDetail;

import React, { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Loader2, ShieldAlert, CheckCircle, Database, Hammer } from 'lucide-react';
import { Task, TaskStatus } from '@/types/types';
import { updateTask } from '@/services/db';

export const DevDashboardPage = () => {
    const { activeProject } = useProject();
    const [loading, setLoading] = useState(false);
    const [auditResult, setAuditResult] = useState<any>(null);

    if (!activeProject) {
        return <div className="p-8">No active project.</div>;
    }

    const runAudit = async () => {
        setLoading(true);
        setAuditResult(null);
        try {
            const tasks = activeProject.tasks || [];
            const shopping = activeProject.shoppingItems || [];

            const noPhase = tasks.filter(t => !t.phase);
            const invalidStatus = tasks.filter(t => !Object.values(TaskStatus).includes(t.status));
            const orphanShopping = shopping.filter(s => s.linkedTaskId && !tasks.find(t => t.id === s.linkedTaskId));

            setAuditResult({
                taskCount: tasks.length,
                shoppingCount: shopping.length,
                issues: {
                    noPhase: noPhase.length,
                    invalidStatus: invalidStatus.length,
                    orphanShopping: orphanShopping.length
                },
                issueDetails: {
                    noPhase, invalidStatus
                }
            });
        } catch (e) {
            console.error(e);
        }
        setLoading(false);

        // Simulate API call delay
        await new Promise(r => setTimeout(r, 500));
    };

    const fixPhases = async () => {
        if (!auditResult?.issueDetails?.noPhase) return;
        setLoading(true);
        try {
            for (const task of auditResult.issueDetails.noPhase) {
                await updateTask(activeProject.id, task.id, { ...task, phase: 'Fas 0: Inköp & Analys' });
            }
            await runAudit(); // re-run
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 pb-32">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-serif font-bold text-nordic-charcoal dark:text-nordic-ice">Dev Dashboard 🛠️</h1>
                <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    Project: {activeProject.id}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* DATA AUDIT CARD */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-semibold flex items-center gap-2"><Database size={20} /> Data Audit</h3>
                        <p className="text-sm text-slate-500">Check for integrity issues in current project tasks.</p>
                    </div>
                    <div className="p-6 space-y-4">
                        <button
                            onClick={runAudit}
                            disabled={loading}
                            className="w-full flex items-center justify-center px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" /> : <ShieldAlert className="mr-2" />}
                            Run Audit
                        </button>

                        {auditResult && (
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg space-y-2 text-sm font-mono border border-slate-200 dark:border-slate-800">
                                <div className="flex justify-between">
                                    <span>Tasks:</span> <span>{auditResult.taskCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shopping Items:</span> <span>{auditResult.shoppingCount}</span>
                                </div>
                                <hr className="border-slate-200 dark:border-slate-800 my-2" />
                                <div className="text-rose-600 dark:text-rose-400 font-bold">Issues Found:</div>
                                <div className="flex justify-between">
                                    <span>Missing Phase:</span>
                                    <span className={auditResult.issues.noPhase > 0 ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                                        {auditResult.issues.noPhase}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Orphan Shopping Links:</span>
                                    <span className={auditResult.issues.orphanShopping > 0 ? "text-yellow-600 font-bold" : "text-green-600 font-bold"}>
                                        {auditResult.issues.orphanShopping}
                                    </span>
                                </div>

                                {auditResult.issues.noPhase > 0 && (
                                    <button
                                        onClick={fixPhases}
                                        className="w-full mt-4 flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                        <Hammer className="mr-2 h-4 w-4" /> Fix Missing Phases (Set to Phase 0)
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Placeholder Card */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 opacity-50">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-semibold">Inspection Fixer</h3>
                        <p className="text-sm text-slate-500">Coming soon...</p>
                    </div>
                    <div className="p-6">
                        <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg">
                            <span className="text-slate-400">Tool inactive</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

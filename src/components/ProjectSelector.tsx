
import React, { useState } from 'react';
import { Project, UserProfile, VehicleData, Task, TaskStatus, CostType, Phase, Priority, PROJECT_PHASES, ProjectType } from '@/types/types';
import { Plus, Car, ChevronRight, LogOut, Lock, Loader2, Sparkles, Search, CheckCircle2, Image as ImageIcon, Trash2, Mail, Check, X } from 'lucide-react';
import { generateProjectProfile, generateVehicleIcon } from '@/services/geminiService';
import { EMPTY_PROJECT_TEMPLATE } from '@/constants/constants';
import { acceptProjectInvite, cancelInvite } from '@/services/db';
import { OnboardingWizard, OnboardingData } from './OnboardingWizard';
import { CarLogo } from './CarLogo';

interface ProjectSelectorProps {
    user: UserProfile;
    projects: Project[];
    onSelectProject: (projectId: string) => void;
    onCreateProject: (project: Partial<Project>) => void; 
    onLogout: () => void;
    onDeleteProject?: (id: string) => void;
    onSeed?: () => void;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({ user, projects, onSelectProject, onCreateProject, onLogout, onDeleteProject, onSeed }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [processingInvite, setProcessingInvite] = useState<string | null>(null);

    // Filter projects
    const invitedProjects = projects.filter(p => p.invitedEmails?.includes(user.email));
    const myProjects = projects.filter(p => !p.invitedEmails?.includes(user.email));

    const handleAcceptInvite = async (project: Project) => {
        setProcessingInvite(project.id);
        try {
            await acceptProjectInvite(project.id, user.uid, user.email);
            // We need to reload projects here ideally, but the parent App handles the state update via auth subscription or we could trigger a callback.
            // Since App listens to DB changes (wait, it doesn't listen to collection changes, only auth).
            // App needs to know to reload.
            // WORKAROUND: Force a reload via window.location.reload() or calling onSelectProject with a special flag? 
            // Better: The App component should pass a reload function.
            // But since we are inside a "Smart" component now, let's just wait a bit and hope the user refreshes or clicks something.
            // Actually, for MVP, reloading the page is a safe bet to sync everything.
            window.location.reload(); 
        } catch (error) {
            console.error("Failed to accept invite", error);
            alert("Kunde inte gå med i projektet.");
        }
        setProcessingInvite(null);
    };

    const handleDeclineInvite = async (project: Project) => {
        if(!confirm("Vill du avböja inbjudan?")) return;
        setProcessingInvite(project.id);
        try {
            await cancelInvite(project.id, user.email);
            window.location.reload();
        } catch (error) {
            console.error(error);
        }
        setProcessingInvite(null);
    };

    const handleOnboardingComplete = async (data: OnboardingData) => {
        try {
            // Use AI data from wizard (already fetched in STEG 2)
            const aiData = data.aiData || {};
            const customIcon = data.generatedIcon || undefined;

            let cleanName = aiData.projectName || data.vehicleDescription;
            if (cleanName && (cleanName.length > 30 || cleanName.includes('http'))) {
                cleanName = cleanName.split(',')[0].replace(/https?:\/\/\S+/g, '').trim();
            }
            if (!cleanName) cleanName = "Nytt Projekt";

            // Prepare Knowledge Articles
            const knowledgeArticles = [];
            if (aiData.analysisReport) {
                knowledgeArticles.push({
                    id: 'initial-analysis',
                    title: aiData.analysisReport.title || 'Initial Fordonsanalys',
                    summary: aiData.analysisReport.summary || 'AI-genererad rapport vid projektstart.',
                    content: aiData.analysisReport.content || '',
                    tags: ['Analys', 'Historik', 'AI']
                });
            }

            const newProjectTemplate: Partial<Project> = {
                name: cleanName,
                type: data.projectType,
                nickname: data.nickname,
                customIcon: customIcon,
                vehicleData: {
                    ...EMPTY_PROJECT_TEMPLATE.vehicleData,
                    ...aiData.vehicleData,
                    regNo: aiData.vehicleData?.regNo || '???'
                } as VehicleData,
                knowledgeArticles: knowledgeArticles,
                tasks: (aiData.initialTasks as any[] || []).map(t => ({
                    ...t,
                    status: TaskStatus.TODO,
                    actualCost: 0,
                    weightKg: 0,
                    costType: CostType.OPERATION,
                    phase: t.phase || PROJECT_PHASES[data.projectType][0],
                    priority: t.priority || Priority.MEDIUM,
                    difficultyLevel: t.difficultyLevel,
                    requiredTools: t.requiredTools,
                    tags: ['AI-Genererad'],
                    links: [],
                    comments: [],
                    attachments: [],
                    subtasks: t.subtasks?.map((st: any) => ({ ...st, id: Math.random().toString(36).substr(2, 9), completed: false })) || []
                }))
            };

            onCreateProject(newProjectTemplate);
            setIsCreating(false);

        } catch (error) {
            console.error("Failed to create project", error);
            alert("Kunde inte skapa projektet. Försök igen.");
        }
    };

    return (
        <div className="min-h-screen bg-nordic-ice p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="font-serif font-bold text-3xl text-nordic-charcoal">Välkommen, {user.name}</h1>
                        <p className="text-slate-500">Välj ett fordon att jobba med</p>
                    </div>
                    <div className="flex gap-2">
                        {onSeed && (
                            <button onClick={onSeed} className="p-3 bg-white rounded-xl shadow-sm text-slate-400 hover:text-teal-600 transition-colors" title="Återställ Demo">
                                <Sparkles size={20} />
                            </button>
                        )}
                        <button onClick={onLogout} className="p-3 bg-white rounded-xl shadow-sm text-slate-400 hover:text-rose-500 transition-colors">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                {/* INVITES SECTION */}
                {invitedProjects.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Inbjudningar</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {invitedProjects.map(project => (
                                <div key={project.id} className="bg-white rounded-[32px] p-6 shadow-xl shadow-teal-500/10 border-2 border-teal-500/20 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-teal-500 text-white px-4 py-1 rounded-bl-2xl text-xs font-bold">
                                        INBJUDAN
                                    </div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-teal-600">
                                            <Mail size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-serif font-bold text-xl text-nordic-charcoal">{project.name}</h3>
                                            <p className="text-sm text-slate-500">Från: {project.ownerEmail}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <button 
                                            onClick={() => handleAcceptInvite(project)}
                                            disabled={!!processingInvite}
                                            className="flex-1 bg-teal-500 text-white py-2 rounded-xl font-bold text-sm hover:bg-teal-600 transition-colors flex items-center justify-center gap-2"
                                        >
                                            {processingInvite === project.id ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                                            Gå med
                                        </button>
                                        <button 
                                            onClick={() => handleDeclineInvite(project)}
                                            disabled={!!processingInvite}
                                            className="px-4 bg-slate-100 text-slate-500 py-2 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Create New Card */}
                    <div className="bg-white/50 border-2 border-dashed border-slate-300 rounded-[32px] p-8 flex flex-col items-center justify-center text-center hover:bg-white hover:border-teal-400 hover:shadow-lg transition-all cursor-pointer group min-h-[250px]" onClick={() => setIsCreating(true)}>
                        <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mb-4 group-hover:scale-110 transition-transform">
                            <Plus size={32} />
                        </div>
                        <h3 className="font-bold text-lg text-nordic-charcoal">Nytt Projekt</h3>
                        <p className="text-sm text-slate-500">Lägg till en ny van</p>
                    </div>

                    {/* Project Cards */}
                    {myProjects.map(project => (
                        <div 
                            key={project.id} 
                            onClick={() => onSelectProject(project.id)}
                            className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/50 border border-white hover:border-teal-200 hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden group min-h-[250px] flex flex-col justify-between"
                        >
                            {project.isDemo && (
                                <div className="absolute top-4 right-4 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                    <Lock size={10} /> Demo
                                </div>
                            )}

                            {!project.isDemo && project.ownerId !== user.uid && (
                                <div className="absolute top-4 right-4 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                    Team
                                </div>
                            )}
                            
                            {!project.isDemo && onDeleteProject && project.ownerId === user.uid && (
                                <button 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        onDeleteProject(project.id); 
                                    }}
                                    className="absolute top-4 right-4 p-2 bg-white rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 shadow-sm transition-all z-10 opacity-0 group-hover:opacity-100"
                                    title="Radera projekt"
                                >
                                    <Trash2 size={16} /> 
                                </button>
                            )}
                            
                            <div>
                                <div className="w-16 h-16 bg-nordic-charcoal text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg overflow-hidden border border-slate-100 p-2">
                                    {project.customIcon ? (
                                        project.customIcon.startsWith('<svg') ? (
                                            <div dangerouslySetInnerHTML={{ __html: project.customIcon }} className="w-full h-full" />
                                        ) : (
                                            <img src={`data:image/png;base64,${project.customIcon}`} alt="Icon" className="w-full h-full object-contain" />
                                        )
                                    ) : (
                                        <CarLogo
                                            make={project.vehicleData?.make || 'Unknown'}
                                            size={32}
                                            className="text-white"
                                        />
                                    )}
                                </div>
                                <h3 className="font-serif font-bold text-2xl text-nordic-charcoal mb-1 line-clamp-2">{project.name}</h3>
                                <p className="text-slate-500 text-sm">{project.vehicleData.model} ({project.vehicleData.year})</p>
                            </div>

                            <div className="flex justify-between items-end mt-8">
                                <div className="flex gap-2">
                                    <span className="bg-slate-50 px-3 py-1 rounded-lg text-xs font-bold text-slate-600 border border-slate-100">
                                        {project.tasks?.filter(t => t.status !== 'Klart').length || 0} Att göra
                                    </span>
                                    <span className="bg-slate-50 px-3 py-1 rounded-lg text-xs font-bold text-slate-600 border border-slate-100">
                                        {project.shoppingItems?.filter(i => !i.checked).length || 0} Att köpa
                                    </span>
                                </div>
                                <div className="w-10 h-10 bg-nordic-ice rounded-full flex items-center justify-center text-nordic-charcoal group-hover:bg-teal-500 group-hover:text-white transition-colors">
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Onboarding Wizard */}
            {isCreating && (
                <OnboardingWizard
                    onComplete={handleOnboardingComplete}
                    onCancel={() => setIsCreating(false)}
                />
            )}
        </div>
    );
};

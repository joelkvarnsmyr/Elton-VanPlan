import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useProjectFromUrl } from '@/hooks/useProjectFromUrl';
import { UserProfile } from '@/types/types';
import { CarLogo } from '../CarLogo';
import {
    LayoutDashboard,
    CheckSquare,
    MessageSquareMore,
    ShoppingBag,
    Wrench,
    ClipboardList,
    Lock,
    Loader2
} from 'lucide-react';
import { subscribeToProjectFull } from '@/services/db';

interface ProjectLayoutProps {
    currentUser: UserProfile;
}

export const ProjectLayout: React.FC<ProjectLayoutProps> = ({ currentUser }) => {
    const { project, isLoading, error } = useProjectFromUrl();
    const location = useLocation();
    const navigate = useNavigate();

    // Real-time subscription to project updates
    useEffect(() => {
        if (!project?.id) return;

        console.log('🔴 Setting up real-time listeners for project:', project.id);

        const unsubscribe = subscribeToProjectFull(project.id, (updatedProject) => {
            if (updatedProject) {
                console.log('📡 Real-time update received:', updatedProject.name);
                // Note: We can't update the project state here directly since it's managed by the hook
                // The parent App component will handle this via its own subscription
            }
        });

        return () => {
            console.log('🔴 Cleaning up real-time listeners');
            unsubscribe();
        };
    }, [project?.id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-nordic-ice dark:bg-nordic-dark-bg flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-slate-400 text-4xl" />
                    <p className="text-slate-500 font-medium">Laddar projekt...</p>
                </div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-screen bg-nordic-ice dark:bg-nordic-dark-bg flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="text-rose-500 text-5xl">⚠️</div>
                    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">
                        {error || 'Projektet kunde inte laddas'}
                    </h2>
                    <button
                        onClick={() => navigate('/projects')}
                        className="px-6 py-3 bg-nordic-charcoal text-white rounded-xl hover:bg-slate-800 transition-colors"
                    >
                        Tillbaka till projekt
                    </button>
                </div>
            </div>
        );
    }

    const isActive = (path: string) => {
        const currentPath = location.pathname;
        if (path === `/project/${project.id}`) {
            return currentPath === path;
        }
        return currentPath.startsWith(path);
    };

    const NavButton = ({ to, icon: Icon, label, count }: any) => {
        const active = isActive(to);
        return (
            <Link
                to={to}
                data-testid={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`relative flex flex-col items-center justify-center w-14 h-14 sm:w-24 sm:h-16 rounded-xl transition-all duration-300 ${active
                        ? 'bg-nordic-charcoal dark:bg-teal-600 text-white shadow-lg scale-105'
                        : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-nordic-dark-bg'
                    }`}
            >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} className="mb-1" />
                <span className="text-[9px] sm:text-[10px] font-medium">{label}</span>
                {count > 0 && (
                    <span className="absolute top-1 right-3 sm:right-5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                        {count}
                    </span>
                )}
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-nordic-ice dark:bg-nordic-dark-bg text-slate-800 dark:text-nordic-ice">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Project Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex items-center justify-center p-1 overflow-hidden rounded-full bg-white dark:bg-nordic-charcoal shadow-sm border border-slate-100 dark:border-nordic-charcoal">
                            {project.customIcon ? (
                                <img
                                    src={`data:image/png;base64,${project.customIcon}`}
                                    alt="Project Icon"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <CarLogo make={project.vehicleData?.make || 'Unknown'} size={32} />
                            )}
                        </div>
                        <div>
                            <h1 className="font-serif font-bold text-2xl tracking-tight text-nordic-charcoal dark:text-nordic-ice">
                                {project.name}
                            </h1>
                            <p className="text-xs font-medium text-slate-500 dark:text-teal-400 uppercase tracking-widest flex items-center gap-1">
                                {project.isDemo && <Lock size={10} />} {project.vehicleData.model}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="pb-28 sm:pb-0">
                    <Outlet context={{ project, currentUser }} />
                </div>

                {/* Bottom Navigation */}
                <div className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-auto bg-white/70 dark:bg-nordic-charcoal/80 backdrop-blur-md border border-slate-200/50 dark:border-nordic-dark-bg p-2 rounded-2xl shadow-2xl flex justify-between sm:justify-center sm:gap-2 z-40">
                    <NavButton
                        to={`/project/${project.id}`}
                        icon={LayoutDashboard}
                        label="Översikt"
                        count={0}
                    />
                    <NavButton
                        to={`/project/${project.id}/tasks`}
                        icon={CheckSquare}
                        label="Att Göra"
                        count={project.tasks.filter((t) => t.status !== 'Klart').length}
                    />
                    <NavButton
                        to={`/project/${project.id}/shopping`}
                        icon={ShoppingBag}
                        label="Handla"
                        count={project.shoppingItems.filter((i) => !i.checked).length}
                    />
                    <NavButton
                        to={`/project/${project.id}/inspection`}
                        icon={ClipboardList}
                        label="Inspektion"
                        count={0}
                    />
                    <NavButton
                        to={`/project/${project.id}/specs`}
                        icon={Wrench}
                        label="Verkstad"
                        count={0}
                    />
                    <NavButton
                        to={`/project/${project.id}/ai`}
                        icon={MessageSquareMore}
                        label="Elton AI"
                        count={0}
                    />
                </div>
            </div>
        </div>
    );
};

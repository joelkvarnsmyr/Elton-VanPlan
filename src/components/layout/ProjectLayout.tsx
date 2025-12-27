
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, useParams } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, MessageSquareMore, Wrench, ShoppingBag, ClipboardList, Fuel, BookOpen, Users, LogOut, ChevronLeft, Database, Sun, Moon, Save, Sparkles, Lock, Zap } from 'lucide-react';
import { useProject, useUser } from '@/contexts';
import { ChatProvider } from '@/context/ChatContext';
import { UnifiedChatInterface } from '../chat/UnifiedChatInterface';
import { MagicImport } from '../MagicImport';
import { ProjectMembers } from '../ProjectMembers';
import { FuelLog } from '../FuelLog';
import { ServiceBook } from '../ServiceBook';
import { CarLogo } from '../CarLogo';
import { TestScraper } from '../TestScraper';
import { Project } from '@/types/types';
import { getProject, getTasks, getShoppingItems } from '@/services/db';

interface ProjectLayoutProps {
    currentUser: any; // Using any to avoid complex type matching for now, ideally UserProfile
}

export const ProjectLayout: React.FC<ProjectLayoutProps> = ({ currentUser }) => {
    const { activeProject, setActiveProject, showToast, tasks, shoppingItems, updateProjectMetadata, addTask } = useProject();
    const { updateProfile, logout } = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    const { projectId } = useParams<{ projectId: string }>();

    // Deep Link Hydration
    React.useEffect(() => {
        const hydrateProject = async () => {
            if (!projectId) return;

            // If we already have the correct project loaded, do nothing
            if (activeProject && activeProject.id === projectId) return;

            console.log('🔄 Hydrating project from URL:', projectId);
            try {
                const projData = await getProject(projectId);
                if (projData) {
                    const [tasks, shopping] = await Promise.all([
                        getTasks(projectId),
                        getShoppingItems(projectId),
                    ]);
                    setActiveProject({ ...projData, tasks: tasks || [], shoppingItems: shopping || [] });
                } else {
                    showToast('Kunde inte hitta projektet', 'error');
                    navigate('/projects');
                }
            } catch (error) {
                console.error('Failed to hydrate project:', error);
                showToast('Kunde inte ladda projektdata', 'error');
                navigate('/projects');
            }
        };

        hydrateProject();
    }, [projectId, activeProject, setActiveProject, navigate, showToast]);

    const [isMagicImportOpen, setIsMagicImportOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showMembers, setShowMembers] = useState(false);
    const [showFuelLog, setShowFuelLog] = useState(false);
    const [showServiceBook, setShowServiceBook] = useState(false);
    const [editName, setEditName] = useState(currentUser?.name || '');
    const [editSkillLevel, setEditSkillLevel] = useState<'beginner' | 'intermediate' | 'expert'>('intermediate');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showScraper, setShowScraper] = useState(false);

    // Derive current view from path
    const currentPath = location.pathname.split('/').pop() || 'dashboard';

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleUpdateName = async () => {
        if (!currentUser || !editName.trim()) return;
        try {
            await updateProfile({ name: editName });
            showToast("Namn uppdaterat!");
        } catch (e) {
            showToast("Kunde inte spara namn", "error");
        }
    };

    const handleUpdateSkillLevel = async () => {
        if (!currentUser) return;
        try {
            await updateProfile({ skillLevel: editSkillLevel });
            showToast("Erfarenhetsnivå uppdaterad!");
        } catch (e) {
            showToast("Kunde inte spara erfarenhetsnivå", "error");
        }
    };

    const NavButton = ({ to, icon: Icon, label, count }: any) => {
        const isActive = location.pathname.includes(to);
        return (
            <button
                data-testid={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => navigate(to)}
                className={`relative flex flex-col items-center justify-center w-14 h-14 sm:w-24 sm:h-16 rounded-xl transition-all duration-300 ${isActive ? 'bg-nordic-charcoal dark:bg-teal-600 text-white shadow-lg scale-105' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-nordic-dark-bg'}`}
            >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="mb-1" />
                <span className="text-[9px] sm:text-[10px] font-medium">{label}</span>
                {count > 0 && <span className="absolute top-1 right-3 sm:right-5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full">{count}</span>}
            </button>
        );
    };

    if (!activeProject) return <div className="p-8 text-center">Laddar projekt...</div>;

    if (showScraper) {
        return <TestScraper onClose={() => setShowScraper(false)} />;
    }

    return (
        <ChatProvider initialProjectId={activeProject.id}>
            <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-nordic-dark-bg text-nordic-ice' : 'bg-nordic-ice text-slate-800'}`}>
                <UnifiedChatInterface mode="floating" />
                {/* HEADER */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 flex items-center justify-center p-1 overflow-hidden rounded-full bg-white dark:bg-nordic-charcoal shadow-sm border border-slate-100 dark:border-nordic-charcoal">
                                {activeProject.customIcon ? (
                                    <img src={`data:image/png;base64,${activeProject.customIcon}`} alt="Project Icon" className="w-full h-full object-cover" />
                                ) : (
                                    <CarLogo
                                        make={activeProject.vehicleData?.make || 'Unknown'}
                                        size={32}
                                    />
                                )}
                            </div>
                            <div>
                                <h1 className="font-serif font-bold text-2xl tracking-tight text-nordic-charcoal dark:text-nordic-ice">{activeProject.name}</h1>
                                <p className="text-xs font-medium text-slate-500 dark:text-teal-400 uppercase tracking-widest flex items-center gap-1">{activeProject.isDemo && <Lock size={10} />} {activeProject.vehicleData.model}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setShowFuelLog(true)} className="hidden sm:block p-3 rounded-xl bg-white dark:bg-nordic-charcoal shadow-sm text-slate-400 hover:text-nordic-charcoal dark:hover:text-white transition-colors" title="Bränslelogg">
                                <Fuel size={18} />
                            </button>
                            <button onClick={() => setShowServiceBook(true)} className="hidden sm:block p-3 rounded-xl bg-white dark:bg-nordic-charcoal shadow-sm text-slate-400 hover:text-nordic-charcoal dark:hover:text-white transition-colors" title="Servicebok">
                                <BookOpen size={18} />
                            </button>
                            <button onClick={() => setShowMembers(true)} className="p-3 rounded-xl bg-white dark:bg-nordic-charcoal shadow-sm text-slate-400 hover:text-nordic-charcoal dark:hover:text-white transition-colors" title="Team & Medlemmar">
                                <Users size={18} />
                            </button>

                            <div className="relative">
                                <button onClick={() => setShowSettings(!showSettings)} className="p-3 rounded-xl bg-white dark:bg-nordic-charcoal shadow-sm text-slate-400 hover:text-nordic-charcoal dark:hover:text-white transition-colors">
                                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-xs font-bold text-teal-700">{currentUser?.name?.charAt(0).toUpperCase()}</div>
                                </button>
                                {showSettings && (
                                    <div className="absolute right-0 top-14 w-72 bg-white dark:bg-nordic-dark-surface rounded-2xl shadow-xl border border-nordic-ice dark:border-nordic-charcoal p-4 z-50 animate-fade-in">
                                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-nordic-charcoal">
                                            <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-lg">
                                                {currentUser?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="overflow-hidden flex-1">
                                                <p className="font-bold text-sm text-nordic-charcoal dark:text-nordic-ice truncate">{currentUser?.name}</p>
                                                <p className="text-xs text-slate-400 truncate">{currentUser?.email}</p>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label htmlFor="settings-name" className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Ditt namn</label>
                                            <div className="flex gap-2">
                                                <input
                                                    id="settings-name"
                                                    className="flex-1 p-2 bg-slate-50 dark:bg-nordic-dark-bg border border-slate-200 dark:border-nordic-charcoal rounded-lg text-sm dark:text-white"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                />
                                                <button onClick={handleUpdateName} aria-label="Spara namn" className="p-2 bg-nordic-charcoal text-white rounded-lg hover:bg-slate-800">
                                                    <Save size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        <button onClick={() => { setActiveProject(null); setShowSettings(false); navigate('/projects'); }} className="w-full flex items-center gap-2 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-nordic-charcoal/50 text-sm font-medium text-nordic-charcoal dark:text-nordic-ice transition-colors mb-2 border-b border-slate-100 dark:border-nordic-charcoal">
                                            <ChevronLeft size={16} /> Byt Projekt
                                        </button>
                                        <button onClick={() => { setShowScraper(true); setShowSettings(false); }} className="w-full flex items-center gap-2 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-nordic-charcoal/50 text-sm font-medium text-nordic-charcoal dark:text-nordic-ice transition-colors mb-2">
                                            <Database size={16} /> Testa Scraper
                                        </button>
                                        <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full flex items-center gap-2 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-nordic-charcoal/50 text-sm font-medium text-nordic-charcoal dark:text-nordic-ice transition-colors mb-2">
                                            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />} {isDarkMode ? 'Ljust Läge' : 'Mörkt Läge'}
                                        </button>
                                        <div className="h-px bg-slate-100 dark:bg-nordic-charcoal my-2"></div>
                                        <button onClick={handleLogout} className="w-full flex items-center gap-2 p-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/50 rounded-xl text-sm font-bold">
                                            <LogOut size={16} /> Logga ut
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button onClick={() => setIsMagicImportOpen(true)} className="p-3 rounded-xl bg-nordic-charcoal dark:bg-teal-600 shadow-sm text-white hover:bg-slate-800 dark:hover:bg-teal-700 transition-colors flex items-center gap-2">
                                <Sparkles size={18} /><span className="hidden sm:inline font-medium">Magic Import</span>
                            </button>
                        </div>
                    </div>

                    {/* CONTENT */}
                    <div className="pb-28 sm:pb-0">
                        <Outlet />
                    </div>

                    {/* NAVIGATION */}
                    <div className={`fixed bottom-4 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-auto bg-white/70 dark:bg-nordic-charcoal/80 backdrop-blur-md border border-slate-200/50 dark:border-nordic-dark-bg p-2 rounded-2xl shadow-2xl flex justify-between sm:justify-center sm:gap-2 z-40`}>
                        <NavButton to="." icon={LayoutDashboard} label="Översikt" />
                        <NavButton to="tasks" icon={CheckSquare} label="Att Göra" count={tasks.filter(t => t.status !== 'Klart').length} />
                        <NavButton to="shopping" icon={ShoppingBag} label="Handla" count={shoppingItems.filter(i => !i.checked).length} />
                        <NavButton to="inspection" icon={ClipboardList} label="Inspektion" />
                        <NavButton to="specs" icon={Wrench} label="Verkstad" />
                        <NavButton to="electrical" icon={Zap} label="Elsystem" />
                        <NavButton to="ai" icon={MessageSquareMore} label="Elton AI" />
                    </div>
                </div>

                {/* MODALS */}
                {isMagicImportOpen && (
                    <div className="fixed inset-0 bg-nordic-charcoal/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="w-full max-w-2xl">
                            <MagicImport
                                onAddTasks={async (newTasks) => {
                                    try {
                                        // Use 'addTask' from the hook destructured at the top of the component
                                        // But wait, the hook destructuring at line 19 didn't include addTask.
                                        // I need to add it there first.
                                        // For now, let's assume I'll add it there.
                                        for (const task of newTasks) {
                                            await addTask(task);
                                        }
                                        showToast(`${newTasks.length} uppgifter tillades!`);
                                        setIsMagicImportOpen(false);
                                    } catch (e) {
                                        console.error("Failed to add tasks via magic import", e);
                                        showToast("Kunde inte lägga till uppgifter", "error");
                                    }
                                }}
                                onClose={() => setIsMagicImportOpen(false)}
                            />
                        </div>
                    </div>
                )}

                {/* We need to pass the handleAddTasks equivalent to MagicImport. 
          The ProjectContext doesn't expose a batch addTasks. 
          I should probably update ProjectContext or just loop here.
       */}

                {showMembers && currentUser && activeProject && (
                    <ProjectMembers
                        project={activeProject}
                        currentUserEmail={currentUser.email}
                        onClose={() => setShowMembers(false)}
                        onUpdate={async () => {
                            // The context subscription handles updates, so we might not need to manually reload,
                            // but ProjectMembers calls updateProject in DB.
                            // We can leverage context update via subscription.
                        }}
                    />
                )}

                {showFuelLog && activeProject && (
                    <FuelLog
                        project={activeProject}
                        onClose={() => setShowFuelLog(false)}
                        onUpdate={async () => showToast("Bränslelogg uppdaterad!")}
                    />
                )}

                {showServiceBook && activeProject && (
                    <ServiceBook
                        project={activeProject}
                        onClose={() => setShowServiceBook(false)}
                        onUpdate={async () => showToast("Servicebok uppdaterad!")}
                    />
                )}

            </div>
        </ChatProvider>
    );
};

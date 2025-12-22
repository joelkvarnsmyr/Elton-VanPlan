
import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { TaskBoard } from './components/TaskBoard';
import { AIAssistant } from './components/AIAssistant';
import { MagicImport } from './components/MagicImport';
import { VehicleSpecs } from './components/VehicleSpecs';
import { ShoppingList } from './components/ShoppingList';
import { WaitlistLanding } from './components/WaitlistLanding';
import { WaitlistLandingB } from './components/WaitlistLandingB';
import { ProjectSelector } from './components/ProjectSelector';
import { ProjectMembers } from './components/ProjectMembers';
import { Roadmap } from './components/Roadmap';
import { FuelLog } from './components/FuelLog';
import { ServiceBook } from './components/ServiceBook';
import { TestScraper } from './components/TestScraper';
import { InspectionPage } from './components/inspection/InspectionPage';
import { Task, Project, TaskStatus, VehicleData } from '@/types/types';
import { LayoutDashboard, CheckSquare, MessageSquareMore, Sparkles, Sun, Moon, Wrench, ShoppingBag, Lock, Loader2, Database, LogOut, Save, ChevronLeft, Map, Users, Fuel, BookOpen, ClipboardList } from 'lucide-react';

// CONTEXTS
import { UserProvider, ProjectProvider, useUser, useProject } from './contexts';

// FIREBASE IMPORTS
import { completeLogin } from './services/auth';
import { uploadReceipt } from './services/storage';
import {
  forceSeedProject,
  getProject,
  getProjectsForUser,
  createProject,
  deleteProjectFull,
  getTasks,
  addTask,
  getShoppingItems,
  updateProject
} from './services/db';
import { CarLogo } from './components/CarLogo';
import { parseTasksFromInput } from './services/geminiService';

const EltonLogo = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" id="Lager_1" data-name="Lager 1" viewBox="0 0 500 316.64" className={className}>
    <defs><style>{`.cls-5{fill:#d0ae78}`}</style></defs>
    <path d="M7.94 178.22c1.56-7.91 12.9-28.48 17.16-36.76 9.17-17.81 19.54-37.58 29.61-54.79 12.15-20.77 36.94-38.69 56.46-52.73 7.3-5.25 18.27-14.09 26.72-16.16 24.16-5.9 57.64-6.25 82.76-7 65.56-1.95 131.38 1.01 196.89 4.02 7.97.37 18.57-.41 26.2.59 1.25.16.88 1.26 1.42 1.39 2.12.49 4.86-.99 7.28-.73 1.27.14.64 1.28 1.93 1.46 4.86.65 6.52-1.9 11.71 1.01 3.55 1.99 2.7 2.82 3.86 5.49.36.82 1.35.78 1.44.95.12.24-.4 2.74.06 4.22.35 1.14 1.22 1.02 1.5 1.92 1.06 3.4 1.87 7.72 2.53 10.31 2.55 10.03 4.76 20.15 6.75 30.3-.88.06-1.8-.09-2.68 0-.54.05-1.86-.12-2.01 0l-1.34.67c-.44-.03-.9.02-1.34 0-.89-.03-1.79 0-2.68 0-2.93-.01-5.75.58-8.04.67-5.31.2-11.32.67-16.41.67h-19.43c-1.16 0-4.3 1.12-6.03 1.2-2.74.12-6.77-1.65-9.71.14-1.34-.01-2.68.02-4.02 0-3.52-.06-6.57.63-9.69.7-6.34.13-12.94-.66-19.12.64-5.6-.57-11.22.5-16.75.67-47.27 1.42-94.51 4.38-141.65 6.73-9.89.49-19.95-.17-29.84.64-.44 5.22 2.55 4.21 6.7 4.02-4.64 11.79-8.57 24.14-12.25 36.32-2.61 8.61-9.85 29.43-10.44 37.12-.78 10.01 1.45 25.01 1.92 35.43.09 2.1 0 4.23-.03 6.32l-17.08 2.08c-.71.21-2.31-.5-2.31-1.04v-10.72c0-.47-1.12-.9-1.68-1-4.09-.75-10.87.27-15.43.03-42.79-2.26-86.81-10.62-129.31-16.12-2.29-.84-1.88 1.38-3.63 1.35ZM207.56 15.45c-3.3-.52-5.87 2.14-8.35 4.03-12.81 9.78-26.89 21.89-39.22 32.46-3.01 2.58-6.15 5.32-8.7 8.38 3.69.67 5.06-.66 7.68-2.69 14.85-11.53 29.98-25.56 44.57-37.82 1.29-1.08 3.73-2.69 4.01-4.36Z" className="cls-5" />
  </svg>
);

const AppContent = () => {
  const { currentUser, isLoading: userLoading, updateProfile, logout } = useUser();
  const { activeProject, setActiveProject, showToast } = useProject();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'tasks' | 'ai' | 'specs' | 'shopping' | 'roadmap' | 'scraper' | 'inspection'>('dashboard');
  const [isMagicImportOpen, setIsMagicImportOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activePhaseFilter, setActivePhaseFilter] = useState<string>('ALL');
  const [showSettings, setShowSettings] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showFuelLog, setShowFuelLog] = useState(false);
  const [showServiceBook, setShowServiceBook] = useState(false);
  const [editName, setEditName] = useState('');
  const [editSkillLevel, setEditSkillLevel] = useState<'beginner' | 'intermediate' | 'expert'>('intermediate');
  const [taskToView, setTaskToView] = useState<string | null>(null);

  const loadUserProjects = async () => {
    if (!currentUser) return;
    console.log('🔍 Loading projects for user:', currentUser.uid, currentUser.email);
    setIsLoading(true);
    try {
      const userProjects = await getProjectsForUser(currentUser.uid, currentUser.email);
      console.log('✅ Found projects:', userProjects.length);
      setProjects(userProjects);
      if (userProjects.length === 0) {
        setActiveProject(null);
      }
    } catch (err) {
      console.error("❌ Error loading projects:", err);
      showToast("Kunde inte ladda projekt", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    completeLogin().then(result => {
      if (result.success) showToast("Inloggad!");
    });
  }, []);

  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name);
      setEditSkillLevel(currentUser.skillLevel || 'intermediate');
      loadUserProjects();
    } else {
      setActiveProject(null);
      setProjects([]);
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const handleLogout = async () => {
    await logout();
    setShowSettings(false);
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

  const selectProject = async (projectId: string) => {
    setIsLoading(true);
    try {
      const projData = await getProject(projectId);
      if (projData) {
        const [tasks, shopping] = await Promise.all([getTasks(projectId), getShoppingItems(projectId)]);
        setActiveProject({ ...projData, tasks: tasks || [], shoppingItems: shopping || [] });
        setCurrentView('dashboard');
      } else {
        showToast("Kunde inte hitta projektet", "error");
      }
    } catch (err) {
      console.error("Error loading project details:", err);
      showToast("Kunde inte ladda projektdata", "error");
    }
    setIsLoading(false);
  };

  const handleCreateProject = async (projectTemplate: Partial<Project>) => {
    if (!currentUser) return;
    setIsLoading(true);

    try {
      const templateWithNotes = projectTemplate as any;
      if (templateWithNotes.additionalNotes) {
        showToast("🔍 Analyserar dina anteckningar med AI...");
        const extraData = await parseTasksFromInput(
          templateWithNotes.additionalNotes,
          undefined,
          projectTemplate.vehicleData as VehicleData
        );

        if (extraData.tasks && extraData.tasks.length > 0) {
          const newTasks = extraData.tasks.map(t => ({
            ...t,
            id: `note-task-${Date.now()}-${Math.random()}`,
            status: 'Att göra' as TaskStatus,
            phase: t.phase || 'Fas 0: Inköp & Analys',
            priority: 'Hög' as any,
            estimatedCostMin: t.estimatedCostMin || 0,
            estimatedCostMax: t.estimatedCostMax || 0,
            actualCost: 0,
            dependencies: [],
            created: new Date().toISOString()
          }));

          projectTemplate.tasks = [
            ...(projectTemplate.tasks || []),
            ...newTasks
          ] as Task[];
        }
      }

      const newProject = await createProject(
        projectTemplate.name || 'Nytt Projekt',
        projectTemplate.vehicleData?.model || 'Okänd',
        currentUser.uid,
        currentUser.email!,
        projectTemplate
      );

      await new Promise(resolve => setTimeout(resolve, 1000));
      await loadUserProjects();
      await selectProject(newProject.id);
      showToast("Nytt projekt skapat!");
    } catch (error: any) {
      console.error("❌ Failed to create project:", error);
      if (error.code === 'permission-denied') {
        showToast("Åtkomst nekad. Kontrollera behörigheter.", "error");
      } else {
        showToast("Kunde inte skapa projekt", "error");
      }
    }
    setIsLoading(false);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Är du säker på att du vill radera projektet? Detta går inte att ångra.")) return;

    try {
      await deleteProjectFull(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      showToast("Projekt raderat");
    } catch (error) {
      console.error("Error deleting project:", error);
      showToast("Kunde inte radera projektet", "error");
    }
  };

  const handleForceSeed = async () => {
    if (!currentUser) return;
    if (!confirm("Varning! Detta kommer att skapa ett nytt demonstrationsprojekt 'Elton'. Är du säker?")) return;
    setIsLoading(true);
    try {
      await forceSeedProject(currentUser.email!, currentUser.uid);
      await loadUserProjects();
      showToast("Demoprojekt 'Elton' skapat!");
    } catch (e) {
      console.error(e);
      showToast("Kunde inte skapa demoprojekt", "error");
    }
    setIsLoading(false);
  };

  const handleAddTasks = async (newTasks: Omit<Task, 'id'>[]) => {
    if (!activeProject) return;
    try {
      const addedTasks: Task[] = [];
      for (const t of newTasks) {
        const result = await addTask(activeProject.id, t);
        addedTasks.push(result);
      }
      setActiveProject({ ...activeProject, tasks: [...activeProject.tasks, ...addedTasks] });
      setIsMagicImportOpen(false);
      showToast(`${newTasks.length} uppgifter sparade!`);
    } catch (e) {
      showToast("Fel vid sparande av uppgifter", "error");
    }
  };

  const handleUploadReceipt = async (itemId: string, file: File) => {
    if (!activeProject || !currentUser) return;
    try {
      const downloadURL = await uploadReceipt(file, currentUser.uid, activeProject.id, itemId);
      const itemToUpdate = activeProject.shoppingItems.find(i => i.id === itemId);
      if (itemToUpdate) {
        const { updateShoppingItem } = useProject();
        const updatedItem = { ...itemToUpdate, receiptUrl: downloadURL };
        await updateShoppingItem(updatedItem);
        showToast("Kvitto uppladdat!");
      }
    } catch (error) {
      console.error("Error uploading receipt:", error);
      showToast("Kunde inte ladda upp kvitto", "error");
    }
  };

  if (userLoading || (isLoading && !activeProject)) {
    return (
      <div className="min-h-screen bg-nordic-ice dark:bg-nordic-dark-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-slate-400 text-4xl" />
          <p className="text-slate-500 font-medium">Hämtar dina projekt...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    const path = window.location.pathname;
    if (path === '/landing-b') {
      return <WaitlistLandingB />;
    }
    return <WaitlistLanding />;
  }

  if (currentView === 'roadmap') {
    return <Roadmap onClose={() => {
      if (activeProject) setCurrentView('dashboard');
      else setActiveProject(null);
    }} />;
  }

  if (!activeProject) {
    return (
      <ProjectSelector
        user={currentUser}
        projects={projects}
        onSelectProject={selectProject}
        onCreateProject={handleCreateProject}
        onLogout={handleLogout}
        onSeed={handleForceSeed}
        onDeleteProject={handleDeleteProject}
      />
    );
  }

  const NavButton = ({ active, onClick, icon: Icon, label, count }: any) => (
    <button data-testid={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`} onClick={onClick} className={`relative flex flex-col items-center justify-center w-14 h-14 sm:w-24 sm:h-16 rounded-xl transition-all duration-300 ${active ? 'bg-nordic-charcoal dark:bg-teal-600 text-white shadow-lg scale-105' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-nordic-dark-bg'}`}>
      <Icon size={20} strokeWidth={active ? 2.5 : 2} className="mb-1" />
      <span className="text-[9px] sm:text-[10px] font-medium">{label}</span>
      {count > 0 && <span className="absolute top-1 right-3 sm:right-5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full">{count}</span>}
    </button>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-nordic-dark-bg text-nordic-ice' : 'bg-nordic-ice text-slate-800'}`}>
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
                <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-xs font-bold text-teal-700">{currentUser.name.charAt(0).toUpperCase()}</div>
              </button>
              {showSettings && (
                <div className="absolute right-0 top-14 w-72 bg-white dark:bg-nordic-dark-surface rounded-2xl shadow-xl border border-nordic-ice dark:border-nordic-charcoal p-4 z-50 animate-fade-in">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-nordic-charcoal">
                    <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-lg">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden flex-1">
                      <p className="font-bold text-sm text-nordic-charcoal dark:text-nordic-ice truncate">{currentUser.name}</p>
                      <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Ditt namn</label>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 p-2 bg-slate-50 dark:bg-nordic-dark-bg border border-slate-200 dark:border-nordic-charcoal rounded-lg text-sm dark:text-white"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                      <button onClick={handleUpdateName} className="p-2 bg-nordic-charcoal text-white rounded-lg hover:bg-slate-800">
                        <Save size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Mekanisk erfarenhet</label>
                    <div className="flex gap-2">
                      <select
                        value={editSkillLevel}
                        onChange={(e) => setEditSkillLevel(e.target.value as 'beginner' | 'intermediate' | 'expert')}
                        className="flex-1 p-2 bg-slate-50 dark:bg-nordic-dark-bg border border-slate-200 dark:border-nordic-charcoal rounded-lg text-sm dark:text-white"
                      >
                        <option value="beginner">Nybörjare</option>
                        <option value="intermediate">Mellanhand</option>
                        <option value="expert">Expert</option>
                      </select>
                      <button onClick={handleUpdateSkillLevel} className="p-2 bg-nordic-charcoal text-white rounded-lg hover:bg-slate-800">
                        <Save size={14} />
                      </button>
                    </div>
                  </div>

                  <button onClick={() => { setActiveProject(null); setShowSettings(false); }} className="w-full flex items-center gap-2 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-nordic-charcoal/50 text-sm font-medium text-nordic-charcoal dark:text-nordic-ice transition-colors mb-2 border-b border-slate-100 dark:border-nordic-charcoal">
                    <ChevronLeft size={16} /> Byt Projekt
                  </button>
                  <button onClick={() => { setCurrentView('scraper'); setShowSettings(false); }} className="w-full flex items-center gap-2 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-nordic-charcoal/50 text-sm font-medium text-nordic-charcoal dark:text-nordic-ice transition-colors mb-2">
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
        <div className="pb-28 sm:pb-0">
          {currentView === 'dashboard' && <Dashboard onPhaseClick={(p) => { setActivePhaseFilter(p); setCurrentView('tasks'); }} onViewTask={(taskId) => { setTaskToView(taskId); setCurrentView('tasks'); }} onViewShopping={() => setCurrentView('shopping')} />}
          {currentView === 'tasks' && <TaskBoard initialFilter={activePhaseFilter as any} initialSelectedTaskId={taskToView} />}
          {currentView === 'ai' && <AIAssistant onClose={() => setCurrentView('dashboard')} />}
          {currentView === 'specs' && <VehicleSpecs />}
          {currentView === 'shopping' && <ShoppingList onUploadReceipt={handleUploadReceipt} />}
          {currentView === 'inspection' && activeProject.inspections && activeProject.inspections.length > 0 && <InspectionPage inspection={activeProject.inspections[0] as any} tasks={activeProject.tasks} onViewTask={(taskId) => { setCurrentView('tasks'); }} />}
          {currentView === 'scraper' && <TestScraper onClose={() => setCurrentView('dashboard')} />}
        </div>

        {currentView === 'dashboard' && (
          <div className="text-center mt-12 pb-24 opacity-60 hover:opacity-100 transition-opacity">
            <button
              onClick={() => setCurrentView('roadmap')}
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-teal-600 transition-colors px-4 py-2"
            >
              <Map size={14} />
              <span>Utforska The VanPlan Roadmap</span>
            </button>
          </div>
        )}

        {currentView !== 'ai' && (
          <div className={`fixed bottom-4 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-auto bg-white/70 dark:bg-nordic-charcoal/80 backdrop-blur-md border border-slate-200/50 dark:border-nordic-dark-bg p-2 rounded-2xl shadow-2xl flex justify-between sm:justify-center sm:gap-2 z-40`}>
            <NavButton active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} icon={LayoutDashboard} label="Översikt" />
            <NavButton active={currentView === 'tasks'} onClick={() => { setCurrentView('tasks'); setActivePhaseFilter('ALL'); }} icon={CheckSquare} label="Att Göra" count={activeProject.tasks.filter(t => t.status !== 'Klart').length} />
            <NavButton active={currentView === 'shopping'} onClick={() => setCurrentView('shopping')} icon={ShoppingBag} label="Handla" count={activeProject.shoppingItems.filter(i => !i.checked).length} />
            <NavButton active={currentView === 'inspection'} onClick={() => setCurrentView('inspection')} icon={ClipboardList} label="Inspektion" />
            <NavButton active={currentView === 'specs'} onClick={() => setCurrentView('specs')} icon={Wrench} label="Verkstad" />
            <NavButton active={false} onClick={() => setCurrentView('ai')} icon={MessageSquareMore} label="Elton AI" />
          </div>
        )}
      </div>
      {isMagicImportOpen && <div className="fixed inset-0 bg-nordic-charcoal/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"><div className="w-full max-w-2xl"><MagicImport onAddTasks={(t) => handleAddTasks(t as any)} onClose={() => setIsMagicImportOpen(false)} /></div></div>}
      {
        showMembers && currentUser && activeProject && (
          <ProjectMembers
            project={activeProject}
            currentUserEmail={currentUser.email}
            onClose={() => setShowMembers(false)}
            onUpdate={async () => {
              const updatedProject = await getProject(activeProject.id);
              if (updatedProject) {
                setActiveProject({ ...activeProject, ...updatedProject });
              }
              await loadUserProjects();
            }}
          />
        )
      }
      {
        showFuelLog && activeProject && (
          <FuelLog
            project={activeProject}
            onClose={() => setShowFuelLog(false)}
            onUpdate={async () => {
              showToast("Bränslelogg uppdaterad!");
            }}
          />
        )
      }
      {
        showServiceBook && activeProject && (
          <ServiceBook
            project={activeProject}
            onClose={() => setShowServiceBook(false)}
            onUpdate={async () => {
              showToast("Servicebok uppdaterad!");
            }}
          />
        )
      }
    </div >
  );
};

export const App = () => (
  <UserProvider>
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  </UserProvider>
);

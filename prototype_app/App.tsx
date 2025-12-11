
import React, { useState, useEffect } from 'react';
import { AuthLanding } from './components/AuthLanding';
import { ProjectSelector } from './components/ProjectSelector';
import { Dashboard } from './components/Dashboard';
import { TaskBoard } from './components/TaskBoard';
import { VehicleSpecs } from './components/VehicleSpecs';
import { ShoppingList } from './components/ShoppingList';
import { AIAssistant } from './components/AIAssistant';
import { MagicImport } from './components/MagicImport';
import { Roadmap } from './components/Roadmap';
import { DevTools } from './components/DevTools';
import { Project, UserProfile, Task, ShoppingItem, FuelLogItem, ServiceItem, KnowledgeArticle, VehicleData } from './types';
import { DEMO_PROJECT, TEMPLATES } from './constants';
import { db } from './services/db'; // IMPORT DB SERVICE
import { LayoutDashboard, CheckSquare, Wrench, ShoppingBag, Sparkles, Settings, LogOut, Menu, X, Download, Upload, Map, CircleUser, ChevronDown, Terminal } from 'lucide-react';

export const App = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'tasks' | 'specs' | 'shopping' | 'roadmap'>('dashboard');
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isMagicImportOpen, setIsMagicImportOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);
  const [taskFilter, setTaskFilter] = useState<string | 'ALL'>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- DATA LOADING & AUTH ---

  useEffect(() => {
    // Subscribe to auth changes
    const unsubscribe = db.onUserChange(async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
            // Load projects when user logs in
            const userProjects = await db.getProjects(currentUser.id);
            setProjects(userProjects);
        } else {
            setProjects([]);
            setActiveProjectId(null);
        }
    });
    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3000);
  };

  const activeProject = activeProjectId === DEMO_PROJECT.id 
    ? DEMO_PROJECT 
    : projects.find(p => p.id === activeProjectId);

  // --- ACTIONS ---

  const handleLogin = async () => {
      const u = await db.login();
      if (u) {
          setUser(u); // Triggers the useEffect above
      }
  };

  const handleLogout = async () => {
      await db.logout();
      setUser(null);
      setIsProfileMenuOpen(false);
  };

  const handleDemo = () => {
      // Demo is client-side only state
      const demoUser = { id: 'demo', name: 'Gäst', email: 'demo@elton.se' };
      setUser(demoUser);
      setActiveProjectId(DEMO_PROJECT.id);
  };

  const saveProjectState = async (updatedProject: Project) => {
      // Helper to save state
      if (updatedProject.id === DEMO_PROJECT.id) return; // Don't save changes to demo
      
      // Update local state for immediate UI feedback
      setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
      
      // Persist to DB
      if (user) {
          await db.saveProject(user.id, updatedProject);
      }
  };

  const handleCreateProject = async (project: Project) => {
      if (user) {
          await db.saveProject(user.id, project);
          setProjects(prev => [...prev, project]);
          setActiveProjectId(project.id);
          showToast('Projekt skapat! 🚐');
      }
  };

  const handleDeleteProject = async (id: string) => {
      if (user) {
          await db.deleteProject(user.id, id);
          setProjects(prev => prev.filter(p => p.id !== id));
          if (activeProjectId === id) setActiveProjectId(null);
          showToast('Projekt raderat.');
      }
  };

  // --- SUB-COMPONENT HANDLERS ---

  const handleUpdateTask = (task: Task) => {
      if (!activeProject) return;
      const updatedTasks = activeProject.tasks.map(t => t.id === task.id ? task : t);
      saveProjectState({ ...activeProject, tasks: updatedTasks, lastModified: new Date().toISOString() });
  };

  const handleDeleteTask = (taskId: string) => {
      if (!activeProject) return;
      const updatedTasks = activeProject.tasks.filter(t => t.id !== taskId);
      saveProjectState({ ...activeProject, tasks: updatedTasks, lastModified: new Date().toISOString() });
      showToast('Uppgift raderad.');
  }

  const handleAddTasks = (newTasks: Task[]) => {
      if (!activeProject) return;
      saveProjectState({ 
          ...activeProject, 
          tasks: [...activeProject.tasks, ...newTasks],
          lastModified: new Date().toISOString()
      });
      showToast(`${newTasks.length} uppgifter tillagda!`);
  };

  const handleUpdateShoppingItem = (item: ShoppingItem) => {
      if (!activeProject) return;
      // Also update linked tasks if actual cost changed
      let updatedTasks = activeProject.tasks;
      if (item.linkedTaskId && item.actualCost) {
          const task = activeProject.tasks.find(t => t.id === item.linkedTaskId);
          if (task) {
             const itemsForTask = activeProject.shoppingItems.filter(i => i.linkedTaskId === task.id && i.id !== item.id);
             const totalReceipts = itemsForTask.reduce((sum, i) => sum + (i.actualCost || 0), 0) + item.actualCost;
             updatedTasks = activeProject.tasks.map(t => t.id === task.id ? { ...t, actualCost: totalReceipts } : t);
          }
      }

      const updatedItems = activeProject.shoppingItems.map(i => i.id === item.id ? item : i);
      saveProjectState({ ...activeProject, shoppingItems: updatedItems, tasks: updatedTasks });
  };

  const handleAddShoppingItem = (item: ShoppingItem) => {
      if (!activeProject) return;
      saveProjectState({ ...activeProject, shoppingItems: [...activeProject.shoppingItems, item] });
      showToast('Tillagt i inköpslistan 🛒');
  };

  const handleDeleteShoppingItem = (id: string) => {
      if (!activeProject) return;
      saveProjectState({ ...activeProject, shoppingItems: activeProject.shoppingItems.filter(i => i.id !== id) });
      showToast('Vara raderad.');
  };

  const handleToggleShoppingItem = (id: string) => {
      if (!activeProject) return;
      const updatedItems = activeProject.shoppingItems.map(i => i.id === id ? { ...i, checked: !i.checked } : i);
      saveProjectState({ ...activeProject, shoppingItems: updatedItems });
  };

  const handleUpdateServiceLog = (log: ServiceItem[]) => {
      if (!activeProject) return;
      saveProjectState({ ...activeProject, serviceLog: log });
  };

  const handleUpdateFuelLog = (log: FuelLogItem[]) => {
      if (!activeProject) return;
      saveProjectState({ ...activeProject, fuelLog: log });
  };

  const handleUpdateVehicleData = (data: VehicleData) => {
      if (!activeProject) return;
      saveProjectState({ ...activeProject, vehicleData: data });
      showToast('Fordonsdata uppdaterad! 🚙');
  };

  const handleCreateArticle = (article: KnowledgeArticle) => {
      if (!activeProject) return;
      const updatedArticles = [...(activeProject.knowledgeArticles || []), article];
      saveProjectState({ ...activeProject, knowledgeArticles: updatedArticles });
      showToast('Ny artikel sparad i Kunskapsbanken! 📚');
  };

  // --- IMPORT / EXPORT ---
  const exportData = () => {
      if (!activeProject) return;
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeProject));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `${activeProject.name.replace(/\s+/g, '_')}_backup.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileReader = new FileReader();
      if (e.target.files && e.target.files[0]) {
          fileReader.readAsText(e.target.files[0], "UTF-8");
          fileReader.onload = async (event) => {
              try {
                  const importedProject = JSON.parse(event.target?.result as string) as Project;
                  if (importedProject.id && importedProject.tasks) {
                      // Import as a NEW project to avoid ID collisions
                      const newProject = {
                          ...importedProject,
                          id: Math.random().toString(36).substr(2, 9),
                          name: `${importedProject.name} (Import)`
                      };
                      await handleCreateProject(newProject);
                      showToast('Projekt importerat! 🎉');
                  }
              } catch (err) {
                  alert("Kunde inte läsa filen. Är det en giltig VanPlan-backup?");
              }
          };
      }
  };

  const toggleDarkMode = () => {
      document.documentElement.classList.toggle('dark');
  };

  // --- RENDER ---

  if (!user) {
      return <AuthLanding onLogin={handleLogin} onDemo={handleDemo} />;
  }

  if (!activeProject) {
      return (
        <ProjectSelector 
            user={user} 
            projects={projects} 
            onSelectProject={setActiveProjectId} 
            onCreateProject={handleCreateProject}
            onLogout={handleLogout}
            onDeleteProject={handleDeleteProject}
        />
      );
  }

  return (
    <div className="min-h-screen bg-nordic-ice flex flex-col md:flex-row overflow-hidden font-sans text-nordic-charcoal">
        
        {/* Toast Notification */}
        {toastMessage && (
            <div className="fixed bottom-6 right-6 bg-nordic-charcoal text-white px-4 py-3 rounded-xl shadow-lg z-50 animate-fade-in flex items-center gap-2">
                <Sparkles size={16} className="text-teal-400" />
                <span className="text-sm font-bold">{toastMessage}</span>
            </div>
        )}

        {/* Mobile Header */}
        <div className="md:hidden bg-white dark:bg-nordic-dark-surface p-4 flex justify-between items-center shadow-sm z-20 border-b border-slate-100 dark:border-nordic-charcoal">
            <div className="flex items-center gap-2">
                {activeProject.customIcon && (
                    <div className="w-8 h-8 rounded-lg overflow-hidden">
                        <img src={`data:image/png;base64,${activeProject.customIcon}`} className="w-full h-full object-cover" />
                    </div>
                )}
                <h1 className="font-serif font-bold text-lg dark:text-nordic-ice">{activeProject.name}</h1>
            </div>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="dark:text-white">
                {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className={`fixed inset-0 bg-nordic-charcoal text-white z-30 transition-transform duration-300 md:relative md:translate-x-0 md:w-64 md:flex flex-col p-6 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center gap-3 mb-10 cursor-pointer" onClick={() => setActiveProjectId(null)}>
                <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center font-serif font-bold text-xl overflow-hidden shrink-0">
                    {activeProject.customIcon ? (
                        <img src={`data:image/png;base64,${activeProject.customIcon}`} alt="Icon" className="w-full h-full object-cover" />
                    ) : (
                        "V"
                    )}
                </div>
                <div className="overflow-hidden">
                    <h2 className="font-bold leading-tight truncate">{activeProject.name}</h2>
                    <p className="text-xs text-slate-400 truncate">{activeProject.vehicleData.regNo}</p>
                </div>
            </div>

            <div className="space-y-2 flex-1">
                <button onClick={() => { setCurrentView('dashboard'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${currentView === 'dashboard' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                    <LayoutDashboard size={20} />
                    <span className="font-medium">Översikt</span>
                </button>
                <button onClick={() => { setCurrentView('tasks'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${currentView === 'tasks' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                    <CheckSquare size={20} />
                    <span className="font-medium">Planering</span>
                </button>
                <button onClick={() => { setCurrentView('shopping'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${currentView === 'shopping' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                    <ShoppingBag size={20} />
                    <span className="font-medium">Inköp</span>
                </button>
                <button onClick={() => { setCurrentView('specs'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${currentView === 'specs' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                    <Wrench size={20} />
                    <span className="font-medium">Garage & Data</span>
                </button>
                <button onClick={() => { setCurrentView('roadmap'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${currentView === 'roadmap' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                    <Map size={20} />
                    <span className="font-medium">Roadmap</span>
                </button>
            </div>

            <div className="pt-6 border-t border-slate-700">
                 <div className="relative">
                    <button 
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center overflow-hidden">
                            {user.avatar ? <img src={user.avatar} className="w-full h-full" /> : <CircleUser />}
                        </div>
                        <div className="text-left flex-1 overflow-hidden">
                            <p className="text-sm font-bold truncate">{user.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">Inställningar</p>
                        </div>
                        <ChevronDown size={16} />
                    </button>

                    {isProfileMenuOpen && (
                        <div className="absolute bottom-full left-0 w-full mb-2 bg-slate-800 rounded-xl shadow-xl border border-slate-700 overflow-hidden animate-fade-in">
                            <button onClick={() => { setIsDevToolsOpen(true); setIsProfileMenuOpen(false); }} className="w-full text-left p-3 text-sm text-amber-400 hover:bg-slate-700 hover:text-white flex gap-2">
                                <Terminal size={16} /> Dev Tools
                            </button>
                            <div className="h-px bg-slate-700 my-1"></div>
                            <button onClick={() => setActiveProjectId(null)} className="w-full text-left p-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex gap-2">
                                <Map size={16} /> Byt Projekt
                            </button>
                            <button onClick={toggleDarkMode} className="w-full text-left p-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex gap-2">
                                <Settings size={16} /> Mörkt Läge
                            </button>
                            <div className="h-px bg-slate-700 my-1"></div>
                            <button onClick={exportData} className="w-full text-left p-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex gap-2">
                                <Download size={16} /> Spara Backup
                            </button>
                            <label className="w-full text-left p-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex gap-2 cursor-pointer">
                                <Upload size={16} /> Återställ Backup
                                <input type="file" className="hidden" onChange={importData} accept=".json" />
                            </label>
                            <div className="h-px bg-slate-700 my-1"></div>
                            <button onClick={handleLogout} className="w-full text-left p-3 text-sm text-rose-400 hover:bg-rose-900/20 hover:text-rose-300 flex gap-2">
                                <LogOut size={16} /> Logga ut
                            </button>
                        </div>
                    )}
                 </div>
            </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 h-[calc(100vh-64px)] md:h-screen overflow-hidden flex flex-col relative bg-nordic-ice dark:bg-nordic-dark-bg transition-colors">
            
            {/* Desktop Header */}
            <div className="p-6 pb-2 hidden md:flex justify-between items-center">
                <div>
                    <h1 className="font-serif font-bold text-2xl text-nordic-charcoal dark:text-nordic-ice">VanPlan</h1>
                    <p className="text-sm text-slate-500 dark:text-nordic-dark-muted flex items-center gap-2">
                        {activeProject.isDemo ? <span className="bg-amber-100 text-amber-800 px-2 rounded text-[10px] font-bold">DEMO</span> : null}
                        {activeProject.name}
                    </p>
                </div>
                
                <div className="flex gap-3">
                    {currentView === 'tasks' && (
                         <button 
                            onClick={() => setIsMagicImportOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-nordic-dark-surface text-nordic-charcoal dark:text-nordic-ice rounded-xl shadow-sm hover:bg-teal-50 dark:hover:bg-teal-900/20 border border-slate-100 dark:border-nordic-charcoal transition-all font-medium text-sm"
                         >
                            <Sparkles size={16} className="text-teal-500" /> Magic Import
                         </button>
                    )}
                    <button 
                        onClick={() => setIsAIOpen(!isAIOpen)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-sm transition-all font-medium text-sm ${isAIOpen ? 'bg-nordic-charcoal text-white dark:bg-teal-600' : 'bg-white dark:bg-nordic-dark-surface text-nordic-charcoal dark:text-nordic-ice border border-slate-100 dark:border-nordic-charcoal hover:bg-slate-50 dark:hover:bg-nordic-charcoal'}`}
                    >
                        <Sparkles size={16} className={isAIOpen ? 'text-teal-400' : 'text-nordic-charcoal dark:text-teal-500'} /> 
                        {isAIOpen ? 'Dölj Elton' : 'Fråga Elton'}
                    </button>
                </div>
            </div>

            {/* Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-6 pt-2">
                <div className="flex gap-6 h-full flex-col lg:flex-row">
                    
                    {/* Primary View */}
                    <div className={`flex-1 min-w-0 transition-all duration-300 ${isAIOpen ? 'lg:max-w-[60%]' : 'w-full'}`}>
                        {currentView === 'dashboard' && (
                            <Dashboard project={activeProject} onPhaseClick={(phase) => { setTaskFilter(phase); setCurrentView('tasks'); }} />
                        )}
                        {currentView === 'tasks' && (
                            <TaskBoard 
                                project={activeProject}
                                tasks={activeProject.tasks}
                                shoppingItems={activeProject.shoppingItems}
                                vehicleData={activeProject.vehicleData}
                                onUpdateTask={handleUpdateTask}
                                initialFilter={taskFilter}
                            />
                        )}
                        {currentView === 'shopping' && (
                            <ShoppingList 
                                items={activeProject.shoppingItems}
                                tasks={activeProject.tasks}
                                onToggle={handleToggleShoppingItem}
                                onAdd={handleAddShoppingItem}
                                onUpdate={handleUpdateShoppingItem}
                                onDelete={handleDeleteShoppingItem}
                            />
                        )}
                        {currentView === 'specs' && (
                            <VehicleSpecs 
                                vehicleData={activeProject.vehicleData}
                                tasks={activeProject.tasks}
                                serviceLog={activeProject.serviceLog}
                                fuelLog={activeProject.fuelLog}
                                onUpdateServiceLog={handleUpdateServiceLog}
                                onUpdateFuelLog={handleUpdateFuelLog}
                                onUpdateVehicleData={handleUpdateVehicleData}
                            />
                        )}
                        {currentView === 'roadmap' && (
                            <Roadmap onClose={() => setCurrentView('dashboard')} />
                        )}
                    </div>

                    {/* AI Sidebar */}
                    {isAIOpen && (
                        <div className="lg:w-[400px] shrink-0 h-full">
                            <AIAssistant 
                                vehicleData={activeProject.vehicleData}
                                tasks={activeProject.tasks}
                                shoppingItems={activeProject.shoppingItems}
                                onAddTask={handleAddTasks}
                                onUpdateTask={handleUpdateTask}
                                onDeleteTask={handleDeleteTask}
                                onAddShoppingItem={handleAddShoppingItem}
                                onUpdateShoppingItem={handleUpdateShoppingItem}
                                onDeleteShoppingItem={handleDeleteShoppingItem}
                                onClose={() => setIsAIOpen(false)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </main>

        {/* Modals */}
        {isMagicImportOpen && (
            <div className="fixed inset-0 bg-nordic-charcoal/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-lg">
                    <MagicImport 
                        onAddTasks={(tasks) => { handleAddTasks(tasks); setIsMagicImportOpen(false); }}
                        onClose={() => setIsMagicImportOpen(false)}
                    />
                </div>
            </div>
        )}

        {isDevToolsOpen && (
            <DevTools onClose={() => setIsDevToolsOpen(false)} />
        )}

    </div>
  );
};
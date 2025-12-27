import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Contexts
import { UserProvider, ProjectProvider, useUser, useProject } from './contexts';

// Services
import { completeLogin } from './services/auth';
import {
  forceSeedProject,
  getProject,
  getProjectsForUser,
  createProject,
  deleteProjectFull,
  getTasks,
  addTask,
  getShoppingItems,
} from './services/db';
import { parseTasksFromInput } from './services/geminiService';

// Components
import { WaitlistLanding } from './components/WaitlistLanding';
import { WaitlistLandingB } from './components/WaitlistLandingB';
import { WaitlistLandingC } from './components/WaitlistLandingC';
import { WaitlistLandingD } from './components/WaitlistLandingD';
import { OnboardingChat } from './components/OnboardingChat';
import { UnifiedChatInterface } from './components/chat/UnifiedChatInterface';
import { Roadmap } from './components/Roadmap';
import { ProjectSelectorPage } from './components/pages/ProjectSelectorPage';
import { ProjectLayout } from './components/layout/ProjectLayout';
import { DashboardPage } from './components/pages/DashboardPage';
import { TaskBoardPage } from './components/pages/TaskBoardPage';
import { ShoppingListPage } from './components/pages/ShoppingListPage';
import { VehicleSpecsPage } from './components/pages/VehicleSpecsPage';
import { AIAssistantPage } from './components/pages/AIAssistantPage';
import { InspectionPageWrapper } from './components/pages/InspectionPageWrapper';
import { DevDashboardPage } from './components/pages/DevDashboardPage';
import { ElectricalSystemPage } from './components/pages/ElectricalSystemPage';

// Types
import { Project, Task, TaskStatus, VehicleData } from '@/types/types';

const AppContent = () => {
  const { currentUser, isLoading: userLoading, logout } = useUser();
  const { activeProject, setActiveProject, showToast } = useProject();
  const navigate = useNavigate();
  const location = useLocation();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

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
      console.error('❌ Error loading projects:', err);
      showToast('Kunde inte ladda projekt', 'error');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    completeLogin().then((result) => {
      if (result.success) showToast('Inloggad!');
    });
  }, []);

  useEffect(() => {
    if (currentUser) {
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

  const selectProject = async (projectId: string) => {
    setIsLoading(true);
    try {
      const projData = await getProject(projectId);
      if (projData) {
        const [tasks, shopping] = await Promise.all([
          getTasks(projectId),
          getShoppingItems(projectId),
        ]);
        setActiveProject({ ...projData, tasks: tasks || [], shoppingItems: shopping || [] });
        navigate(`/project/${projectId}`);
      } else {
        showToast('Kunde inte hitta projektet', 'error');
      }
    } catch (err) {
      console.error('Error loading project details:', err);
      showToast('Kunde inte ladda projektdata', 'error');
    }
    setIsLoading(false);
  };

  const handleCreateProject = async (projectTemplate: Partial<Project>) => {
    if (!currentUser) return;
    setIsLoading(true);

    try {
      // Parse additional notes if they exist
      const templateWithNotes = projectTemplate as any;
      if (templateWithNotes.additionalNotes) {
        showToast('🔍 Analyserar dina anteckningar med AI...');
        const extraData = await parseTasksFromInput(
          templateWithNotes.additionalNotes,
          undefined,
          projectTemplate.vehicleData as VehicleData
        );

        if (extraData.tasks && extraData.tasks.length > 0) {
          const newTasks = extraData.tasks.map((t) => ({
            ...t,
            id: `note-task-${Date.now()}-${Math.random()}`,
            status: 'Att göra' as TaskStatus,
            phase: t.phase || 'Fas 0: Inköp & Analys',
            priority: 'Hög' as any,
            estimatedCostMin: t.estimatedCostMin || 0,
            estimatedCostMax: t.estimatedCostMax || 0,
            actualCost: 0,
            dependencies: [],
            created: new Date().toISOString(),
          }));

          projectTemplate.tasks = [...(projectTemplate.tasks || []), ...newTasks] as Task[];
        }
      }

      const newProject = await createProject(
        projectTemplate.name || 'Nytt Projekt',
        projectTemplate.vehicleData?.model || 'Okänd',
        currentUser.uid,
        currentUser.email!,
        projectTemplate
      );

      await new Promise((resolve) => setTimeout(resolve, 1000));
      await loadUserProjects();
      await selectProject(newProject.id);
      showToast('Nytt projekt skapat!');
    } catch (error: any) {
      console.error('❌ Failed to create project:', error);
      if (error.code === 'permission-denied') {
        showToast('Åtkomst nekad. Kontrollera behörigheter.', 'error');
      } else {
        showToast('Kunde inte skapa projekt', 'error');
      }
    }
    setIsLoading(false);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Är du säker på att du vill radera projektet? Detta går inte att ångra.'))
      return;

    try {
      await deleteProjectFull(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      showToast('Projekt raderat');
    } catch (error) {
      console.error('Error deleting project:', error);
      showToast('Kunde inte radera projektet', 'error');
    }
  };

  const handleForceSeed = async () => {
    if (!currentUser) return;
    if (
      !confirm(
        "Varning! Detta kommer att skapa ett nytt demonstrationsprojekt 'Elton'. Är du säker?"
      )
    )
      return;
    setIsLoading(true);
    try {
      await forceSeedProject(currentUser.email!, currentUser.uid);
      await loadUserProjects();
      showToast("Demoprojekt 'Elton' skapat!");
    } catch (e) {
      console.error(e);
      showToast('Kunde inte skapa demoprojekt', 'error');
    }
    setIsLoading(false);
  };

  const handleCreateV2Project = async (
    vehicleData: VehicleData,
    imageBase64?: string,
    vehicleDescription?: string,
    aiData?: any
  ): Promise<string> => {
    if (!currentUser) throw new Error('No user');
    setIsLoading(true);

    try {
      const { createV2Project } = await import('./services/projectSetupService');

      const newProject = await createV2Project(
        vehicleDescription || vehicleData.model,
        aiData || {},
        currentUser.uid,
        currentUser.email!,
        imageBase64
      );

      await loadUserProjects();
      setActiveProject(newProject);
      navigate(`/project/${newProject.id}/setup`);
      showToast('Projekt skapat! Dags att chatta med Elton.');
      return newProject.id;

    } catch (error) {
      console.error('Failed to create V2 project:', error);
      showToast('Kunde inte skapa projektet', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  if (userLoading || isLoading) {
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
    return (
      <Routes>
        <Route path="/" element={<WaitlistLanding />} />
        <Route path="/b" element={<WaitlistLandingB />} />
        <Route path="/c" element={<WaitlistLandingC />} />
        <Route path="/d" element={<WaitlistLandingD />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Roadmap */}
      <Route path="/roadmap" element={<Roadmap onClose={() => navigate(-1)} />} />

      {/* Project Selector */}
      <Route
        path="/projects"
        element={
          <ProjectSelectorPage
            user={currentUser}
            projects={projects}
            onSelectProject={selectProject}
            onCreateProject={handleCreateProject}
            onDeleteProject={handleDeleteProject}
            onLogout={logout}
            onSeed={handleForceSeed}
            onCreateV2Project={handleCreateV2Project}
          />
        }
      />

      {/* Project Routes */}
      <Route path="/project/:projectId" element={<ProjectLayout currentUser={currentUser} />}>
        <Route index element={<DashboardPage />} />
        <Route path="tasks" element={<TaskBoardPage />} />
        <Route path="shopping" element={<ShoppingListPage />} />
        <Route path="specs" element={<VehicleSpecsPage />} />
        <Route path="ai" element={<AIAssistantPage />} />
        <Route path="inspection" element={<InspectionPageWrapper />} />
        <Route path="electrical" element={<ElectricalSystemPage />} />
        <Route path="dev" element={<DevDashboardPage />} />
        <Route
          path="setup"
          element={
            <UnifiedChatInterface
              mode="embedded"
              onClose={() => { }} // No close action needed for embedded
            />
          }
        />
      </Route>

      {/* Default redirects */}
      <Route path="/" element={<Navigate to="/projects" replace />} />
      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Routes>
  );
};

export const App = () => {
  return (
    <UserProvider>
      <ProjectProvider>
        <AppContent />
      </ProjectProvider>
    </UserProvider>
  );
};

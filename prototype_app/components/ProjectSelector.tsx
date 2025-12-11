
import React, { useState } from 'react';
import { Project, UserProfile, VehicleData, Task, TaskStatus, CostType, ProjectType } from '../types';
import { Plus, Car, ChevronRight, LogOut, Lock, Loader2, Sparkles, Search, FileText, CheckCircle2, Image as ImageIcon, Trash2, Hammer, Wrench, PenTool } from 'lucide-react';
import { generateProjectProfile, generateVehicleIcon } from '../services/geminiService';
import { EMPTY_PROJECT_TEMPLATE, TEMPLATES } from '../constants';

interface ProjectSelectorProps {
    user: UserProfile;
    projects: Project[];
    onSelectProject: (projectId: string) => void;
    onCreateProject: (project: Project) => void;
    onLogout: () => void;
    onDeleteProject?: (id: string) => void;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({ user, projects, onSelectProject, onCreateProject, onLogout, onDeleteProject }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [vehicleDesc, setVehicleDesc] = useState('');
    const [isResearching, setIsResearching] = useState(false);
    const [researchStep, setResearchStep] = useState(0);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [projectType, setProjectType] = useState<ProjectType>('renovation');

    const steps = [
        "🔍 Analyserar fordonsmodell & Regnr...",
        "⚙️ Hämtar tekniska specifikationer (Transportstyrelsen)...",
        "📖 Letar efter vanliga fel & manualer...",
        "📝 Skapar serviceplan & uppgifter...",
        "🎨 Målar fordonets porträtt (AI-ikon)...",
        "🚐 Färdigställer ditt garage..."
    ];

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreate = async () => {
        if (!vehicleDesc.trim() && !selectedImage) return;
        
        setIsResearching(true);
        
        const stepInterval = setInterval(() => {
            setResearchStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
        }, 3000);

        try {
            const base64Data = selectedImage ? selectedImage.split(',')[1] : undefined;

            // 1. CALL AI DEEP RESEARCH
            const aiDataPromise = generateProjectProfile(vehicleDesc, base64Data);
            
            // 2. CALL AI ICON GENERATION
            const iconPromise = base64Data ? generateVehicleIcon(base64Data) : Promise.resolve(null);

            const [aiData, customIcon] = await Promise.all([aiDataPromise, iconPromise]);
            
            clearInterval(stepInterval);

            // Clean Name
            let cleanName = aiData.projectName || vehicleDesc;
            if (cleanName && (cleanName.length > 30 || cleanName.includes('http'))) {
                cleanName = cleanName.split(',')[0].replace(/https?:\/\/\S+/g, '').trim();
            }
            if (!cleanName) cleanName = "Nytt Projekt";

            // Get default phases for type
            const template = TEMPLATES[projectType];

            const newProject: Project = {
                ...EMPTY_PROJECT_TEMPLATE,
                id: Math.random().toString(36).substr(2, 9),
                name: cleanName,
                type: projectType,
                phases: template.phases,
                customIcon: customIcon || undefined,
                vehicleData: {
                    ...EMPTY_PROJECT_TEMPLATE.vehicleData,
                    ...aiData.vehicleData,
                    regNo: aiData.vehicleData?.regNo || '???' 
                } as VehicleData,
                tasks: (aiData.initialTasks as any[] || []).map(t => ({
                    ...t,
                    id: Math.random().toString(36).substr(2, 9),
                    status: TaskStatus.TODO,
                    actualCost: 0,
                    weightKg: 0,
                    costType: CostType.OPERATION,
                    phase: t.phase || template.phases[0], // Use first phase of selected type if AI is confused
                    priority: t.priority || 'Medel',
                    tags: ['AI-Genererad'],
                    links: [],
                    comments: [],
                    attachments: [],
                    subtasks: t.subtasks?.map((st: any) => ({ ...st, id: Math.random().toString(36).substr(2, 9), completed: false })) || []
                })),
                shoppingItems: [],
                serviceLog: [],
                fuelLog: [],
                created: new Date().toISOString(),
                lastModified: new Date().toISOString()
            };

            onCreateProject(newProject);
            setIsCreating(false);
            setVehicleDesc('');
            setSelectedImage(null);
            setIsResearching(false);
            setResearchStep(0);

        } catch (error) {
            console.error("Failed to create project", error);
            setIsResearching(false);
            clearInterval(stepInterval);
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
                    <button onClick={onLogout} className="p-3 bg-white rounded-xl shadow-sm text-slate-400 hover:text-rose-500 transition-colors">
                        <LogOut size={20} />
                    </button>
                </div>

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
                    {projects.map(project => (
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
                            
                            {!project.isDemo && onDeleteProject && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); if(confirm('Radera projekt?')) onDeleteProject(project.id); }}
                                    className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors z-10"
                                >
                                    <Trash2 size={14} /> 
                                </button>
                            )}
                            
                            <div>
                                <div className="w-16 h-16 bg-nordic-charcoal text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg overflow-hidden">
                                    {project.customIcon ? (
                                        <img src={`data:image/png;base64,${project.customIcon}`} alt="Icon" className="w-full h-full object-cover" />
                                    ) : (
                                        <Car size={32} />
                                    )}
                                </div>
                                <h3 className="font-serif font-bold text-2xl text-nordic-charcoal mb-1 line-clamp-2">{project.name}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] uppercase font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">{project.type}</span>
                                    <p className="text-slate-500 text-sm">{project.vehicleData.model} ({project.vehicleData.year})</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-end mt-8">
                                <div className="flex gap-2">
                                    <span className="bg-slate-50 px-3 py-1 rounded-lg text-xs font-bold text-slate-600 border border-slate-100">
                                        {project.tasks?.filter(t => t.status !== 'Klart').length || 0} Att göra
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

            {/* Create Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-nordic-charcoal/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-lg p-8 rounded-[40px] shadow-2xl animate-fade-in relative overflow-hidden h-[90vh] overflow-y-auto">
                        
                        {!isResearching ? (
                            <>
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mx-auto mb-4">
                                        <Sparkles size={32} />
                                    </div>
                                    <h2 className="font-serif font-bold text-3xl text-nordic-charcoal mb-2">Starta nytt projekt</h2>
                                    <p className="text-slate-500">Berätta om ditt fordon</p>
                                </div>

                                <div className="space-y-6">
                                    {/* Project Type Selection */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-3 ml-1">Vad är målet?</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            <button 
                                                onClick={() => setProjectType('renovation')}
                                                className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${projectType === 'renovation' ? 'border-teal-500 bg-teal-50 text-teal-800' : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                            >
                                                <Wrench size={24} />
                                                <span className="text-xs font-bold">Renovering</span>
                                            </button>
                                            <button 
                                                onClick={() => setProjectType('conversion')}
                                                className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${projectType === 'conversion' ? 'border-teal-500 bg-teal-50 text-teal-800' : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                            >
                                                <Hammer size={24} />
                                                <span className="text-xs font-bold">Nybygge</span>
                                            </button>
                                            <button 
                                                onClick={() => setProjectType('maintenance')}
                                                className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${projectType === 'maintenance' ? 'border-teal-500 bg-teal-50 text-teal-800' : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                            >
                                                <PenTool size={24} />
                                                <span className="text-xs font-bold">Förvaltning</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Fordonsbeskrivning, Länk eller Regnr</label>
                                        <textarea 
                                            className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all min-h-[100px] text-lg text-nordic-charcoal placeholder:text-slate-300"
                                            placeholder="t.ex. 'JSN398' eller 'Mercedes Sprinter 2014'..."
                                            value={vehicleDesc}
                                            onChange={e => setVehicleDesc(e.target.value)}
                                        />
                                    </div>

                                    <label className="flex items-center space-x-3 cursor-pointer p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 hover:border-teal-400 hover:bg-teal-50 transition-all">
                                        <div className="p-2 bg-white rounded-xl text-slate-400">
                                            <ImageIcon size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <span className="block text-sm font-bold text-nordic-charcoal">Ladda upp bild</span>
                                            <span className="text-xs text-slate-400">Elton kan läsa av regplåten & skapa en ikon</span>
                                        </div>
                                        {selectedImage && <CheckCircle2 size={20} className="text-green-500" />}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                    </label>
                                    
                                    <div className="bg-amber-50 p-4 rounded-2xl flex gap-3 text-amber-800 text-sm border border-amber-100">
                                        <Search className="shrink-0" size={20} />
                                        <p><strong>Elton AI</strong> söker upp teknisk data (Biluppgifter.se/Car.info) och skapar en serviceplan.</p>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button onClick={() => setIsCreating(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors">Avbryt</button>
                                        <button 
                                            onClick={handleCreate} 
                                            disabled={!vehicleDesc.trim() && !selectedImage}
                                            className="flex-[2] py-4 bg-nordic-charcoal text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                                        >
                                            <Sparkles size={20} /> Starta Research
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <div className="relative w-20 h-20 mx-auto mb-6">
                                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center text-teal-600">
                                        <Search size={24} />
                                    </div>
                                </div>
                                <h3 className="font-serif font-bold text-2xl text-nordic-charcoal mb-2">Research pågår...</h3>
                                <p className="text-slate-400 text-sm mb-8">Elton skapar din plan för {projectType === 'renovation' ? 'renovering' : projectType === 'conversion' ? 'nybygge' : 'förvaltning'}...</p>

                                <div className="space-y-3 text-left max-w-xs mx-auto">
                                    {steps.map((step, idx) => (
                                        <div key={idx} className={`flex items-center gap-3 transition-all duration-500 ${idx <= researchStep ? 'opacity-100' : 'opacity-30 translate-y-2'}`}>
                                            {idx < researchStep ? (
                                                <CheckCircle2 size={20} className="text-green-500" />
                                            ) : idx === researchStep ? (
                                                <Loader2 size={20} className="text-teal-500 animate-spin" />
                                            ) : (
                                                <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                                            )}
                                            <span className={`font-medium ${idx === researchStep ? 'text-teal-700' : 'text-slate-600'}`}>{step}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

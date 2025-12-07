
import React, { useState } from 'react';
import { Project, UserProfile } from '../types';
import { Plus, Car, ChevronRight, LogOut, Lock } from 'lucide-react';

interface ProjectSelectorProps {
    user: UserProfile;
    projects: Project[];
    onSelectProject: (projectId: string) => void;
    onCreateProject: (name: string, model: string) => void;
    onLogout: () => void;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({ user, projects, onSelectProject, onCreateProject, onLogout }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newModel, setNewModel] = useState('');

    const handleCreate = () => {
        if (newName && newModel) {
            onCreateProject(newName, newModel);
            setIsCreating(false);
            setNewName('');
            setNewModel('');
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
                            
                            <div>
                                <div className="w-14 h-14 bg-nordic-charcoal text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                    <Car size={28} />
                                </div>
                                <h3 className="font-serif font-bold text-2xl text-nordic-charcoal mb-1">{project.name}</h3>
                                <p className="text-slate-500 text-sm">{project.vehicleData.model} ({project.vehicleData.year})</p>
                            </div>

                            <div className="flex justify-between items-end mt-8">
                                <div className="flex gap-2">
                                    <span className="bg-slate-50 px-3 py-1 rounded-lg text-xs font-bold text-slate-600 border border-slate-100">
                                        {project.tasks.filter(t => t.status !== 'Klart').length} Att göra
                                    </span>
                                    <span className="bg-slate-50 px-3 py-1 rounded-lg text-xs font-bold text-slate-600 border border-slate-100">
                                        {project.shoppingItems.filter(i => !i.checked).length} Att köpa
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
                    <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl animate-fade-in">
                        <h2 className="font-serif font-bold text-2xl text-nordic-charcoal mb-6">Starta nytt projekt</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Namn på bilen</label>
                                <input 
                                    className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                                    placeholder="t.ex. Bettan"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Modell & År</label>
                                <input 
                                    className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                                    placeholder="t.ex. VW Crafter 2018"
                                    value={newModel}
                                    onChange={e => setNewModel(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setIsCreating(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl">Avbryt</button>
                                <button onClick={handleCreate} className="flex-1 py-3 bg-nordic-charcoal text-white font-bold rounded-xl hover:bg-slate-800">Skapa</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

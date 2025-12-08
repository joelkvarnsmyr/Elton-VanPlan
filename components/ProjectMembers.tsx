
import React, { useState } from 'react';
import { Project } from '../types';
import { inviteUserToProject, removeMemberFromProject, cancelInvite } from '../services/db';
import { X, UserPlus, Mail, Shield, UserX, Loader2 } from 'lucide-react';

interface ProjectMembersProps {
    project: Project;
    currentUserEmail: string;
    onClose: () => void;
    onUpdate: () => void; // Refresh project data
}

export const ProjectMembers: React.FC<ProjectMembersProps> = ({ project, currentUserEmail, onClose, onUpdate }) => {
    const [inviteEmail, setInviteEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInvite = async () => {
        if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
            setError("Ange en giltig e-postadress.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await inviteUserToProject(project.id, inviteEmail.trim());
            setInviteEmail('');
            onUpdate();
        } catch (e) {
            console.error(e);
            setError("Kunde inte skicka inbjudan. Kontrollera att du har behörighet.");
        }
        setIsLoading(false);
    };

    const handleRemoveMember = async (userId: string) => {
        if (!confirm("Är du säker på att du vill ta bort denna medlem?")) return;
        setIsLoading(true);
        try {
            await removeMemberFromProject(project.id, userId);
            onUpdate();
        } catch (e) {
            setError("Kunde inte ta bort medlem.");
        }
        setIsLoading(false);
    };

    const handleCancelInvite = async (email: string) => {
        setIsLoading(true);
        try {
            await cancelInvite(project.id, email);
            onUpdate();
        } catch (e) {
            setError("Kunde inte avbryta inbjudan.");
        }
        setIsLoading(false);
    };

    const isOwner = project.ownerEmail === currentUserEmail;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-nordic-dark-surface w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-nordic-charcoal">
                <div className="p-6 border-b border-slate-100 dark:border-nordic-charcoal flex justify-between items-center">
                    <h2 className="text-xl font-serif font-bold text-nordic-charcoal dark:text-nordic-ice">Team & Medlemmar</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    {/* OWNER */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Ägare</h3>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50">
                            <div className="w-10 h-10 rounded-full bg-amber-200 dark:bg-amber-700 flex items-center justify-center text-amber-800 dark:text-amber-100 font-bold">
                                {project.ownerEmail.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-nordic-charcoal dark:text-nordic-ice">Projektägare</p>
                                <p className="text-xs text-slate-500 truncate">{project.ownerEmail}</p>
                            </div>
                            <Shield size={16} className="text-amber-500" />
                        </div>
                    </div>

                    {/* MEMBERS */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Medlemmar ({project.members?.length || 0})</h3>
                        <div className="space-y-2">
                            {project.members && project.members.length > 0 ? (
                                project.members.map(memberId => (
                                    <div key={memberId} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-nordic-charcoal/50">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold">
                                            ?
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-nordic-charcoal dark:text-nordic-ice">Medlem</p>
                                            <p className="text-xs text-slate-400 text-xs">ID: {memberId.substring(0,8)}...</p>
                                        </div>
                                        {isOwner && (
                                            <button onClick={() => handleRemoveMember(memberId)} className="p-2 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg">
                                                <UserX size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 italic">Inga medlemmar än.</p>
                            )}
                        </div>
                    </div>

                    {/* INVITES */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Väntande Inbjudningar ({project.invitedEmails?.length || 0})</h3>
                        <div className="space-y-2">
                             {project.invitedEmails && project.invitedEmails.map(email => (
                                <div key={email} className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                        <Mail size={16} />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm font-medium text-nordic-charcoal dark:text-nordic-ice truncate">{email}</p>
                                        <p className="text-xs text-slate-400">Väntar på svar...</p>
                                    </div>
                                    {isOwner && (
                                        <button onClick={() => handleCancelInvite(email)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg">
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                             ))}
                        </div>
                    </div>

                    {/* INVITE FORM */}
                    {isOwner && (
                        <div className="pt-4 border-t border-slate-100 dark:border-nordic-charcoal">
                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Bjud in ny medlem</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input 
                                        type="email"
                                        className="w-full pl-10 p-3 bg-slate-50 dark:bg-nordic-dark-bg border border-slate-200 dark:border-nordic-charcoal rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
                                        placeholder="epost@exempel.se"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                                    />
                                </div>
                                <button 
                                    onClick={handleInvite} 
                                    disabled={isLoading || !inviteEmail}
                                    className="bg-nordic-charcoal dark:bg-teal-600 text-white px-4 rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-teal-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                                    <span className="hidden sm:inline">Bjud in</span>
                                </button>
                            </div>
                            {error && <p className="text-xs text-rose-500 mt-2">{error}</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

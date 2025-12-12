
import React, { useState } from 'react';
import { Mail, Check, Eye, Loader2, Lock, ArrowRight, User, Wrench } from 'lucide-react';
import { sendLoginLink, loginWithPassword, registerWithPassword } from '@/services/auth';
import { updateUserProfile } from '@/services/db'; // Import this to save name
import { UserSkillLevel } from '@/types/types';
import clsx from 'clsx'; 

interface AuthLandingProps {
    onDemo: () => void;
}

type AuthMode = 'magic-link' | 'login' | 'register';

export const AuthLanding: React.FC<AuthLandingProps> = ({ onDemo }) => {
    const [mode, setMode] = useState<AuthMode>('magic-link');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState(''); // New state for name
    const [skillLevel, setSkillLevel] = useState<UserSkillLevel>('intermediate'); // Default to intermediate

    const [isSending, setIsSending] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!email) return;
        setError(null);
        setIsSending(true);
        
        try {
            if (mode === 'magic-link') {
                const result = await sendLoginLink(email);
                if (result.success) setEmailSent(true);
                else setError(result.error || 'Kunde inte skicka länk.');
            } 
            else if (mode === 'login') {
                const result = await loginWithPassword(email, password);
                if (!result.success) setError(result.error || 'Inloggning misslyckades.');
            } 
            else if (mode === 'register') {
                if (!name.trim()) {
                    setError("Vänligen ange ditt namn.");
                    setIsSending(false);
                    return;
                }
                const result = await registerWithPassword(email, password);
                if (result.success && result.user) {
                    // Save the name and skill level to Firestore immediately
                    await updateUserProfile(result.user.uid, {
                        name: name,
                        email: email,
                        skillLevel: skillLevel
                    });
                } else {
                    setError(result.error || 'Registrering misslyckades.');
                }
            }
        } catch (e) {
            setError('Ett oväntat fel uppstod.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-nordic-ice flex flex-col items-center justify-center p-6 relative overflow-hidden">
            
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-100 rounded-full blur-[100px] opacity-50"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-100 rounded-full blur-[100px] opacity-50"></div>

            <div className="max-w-md w-full bg-white/80 backdrop-blur-xl p-8 rounded-[40px] shadow-2xl border border-white z-10 relative transition-all duration-300">
                
                <div className="text-center mb-8">
                    <h1 className="font-serif font-bold text-4xl text-nordic-charcoal mb-2">The VanPlan</h1>
                    <p className="text-slate-500 text-sm tracking-wide uppercase">Ditt digitala garage</p>
                </div>

                {!emailSent ? (
                    <div className="space-y-4">
                        
                        {/* Tabs */}
                        <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                            <button 
                                onClick={() => { setMode('magic-link'); setError(null); }}
                                className={clsx("flex-1 py-2 text-xs font-bold rounded-lg transition-all", mode === 'magic-link' ? "bg-white text-nordic-charcoal shadow-sm" : "text-slate-400 hover:text-slate-600")}
                            >
                                Magisk Länk
                            </button>
                            <button 
                                onClick={() => { setMode('login'); setError(null); }}
                                className={clsx("flex-1 py-2 text-xs font-bold rounded-lg transition-all", mode !== 'magic-link' ? "bg-white text-nordic-charcoal shadow-sm" : "text-slate-400 hover:text-slate-600")}
                            >
                                Lösenord
                            </button>
                        </div>

                        <div className="text-center mb-4">
                            <h2 className="text-lg font-bold text-nordic-charcoal">
                                {mode === 'magic-link' && 'Lösenordsfri inloggning'}
                                {mode === 'login' && 'Logga in'}
                                {mode === 'register' && 'Välkommen! Vad heter du?'}
                            </h2>
                            <p className="text-xs text-slate-500">
                                {mode === 'magic-link' && 'Vi skickar en inloggningslänk till din e-post.'}
                                {mode === 'login' && 'Logga in med ditt lösenord.'}
                                {mode === 'register' && 'Skapa ett konto för att komma igång.'}
                            </p>
                        </div>

                        <div className="space-y-3">
                            {mode === 'register' && (
                                <>
                                    <div className="relative animate-fade-in">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Ditt namn"
                                            className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-nordic-charcoal transition-all"
                                        />
                                    </div>
                                    <div className="relative animate-fade-in">
                                        <Wrench className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <select
                                            value={skillLevel}
                                            onChange={(e) => setSkillLevel(e.target.value as UserSkillLevel)}
                                            className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-nordic-charcoal transition-all appearance-none"
                                        >
                                            <option value="beginner">Nybörjare - Jag har ingen erfarenhet</option>
                                            <option value="intermediate">Mellanhand - Jag kan enklare reparationer</option>
                                            <option value="expert">Expert - Jag är en erfaren mekaniker</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="din@epost.se"
                                    className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-nordic-charcoal transition-all"
                                />
                            </div>
                            
                            {mode !== 'magic-link' && (
                                <div className="relative animate-fade-in">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input 
                                        type="password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Lösenord"
                                        className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-nordic-charcoal transition-all"
                                    />
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl animate-fade-in">
                                <p className="text-xs text-rose-600 font-medium text-center">{error}</p>
                            </div>
                        )}

                        <button 
                            onClick={handleSubmit}
                            disabled={isSending || !email || (mode !== 'magic-link' && !password)}
                            className="w-full py-4 bg-nordic-charcoal text-white font-bold rounded-2xl shadow-lg shadow-slate-300 hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                        >
                            {isSending ? <Loader2 className="animate-spin" size={18} /> : (mode === 'magic-link' ? <Mail size={18} /> : <ArrowRight size={18} />)} 
                            {isSending ? 'Arbetar...' : (mode === 'magic-link' ? 'Skicka länk' : (mode === 'login' ? 'Logga in' : 'Skapa konto'))}
                        </button>

                        {mode !== 'magic-link' && (
                            <div className="text-center mt-2">
                                <button 
                                    onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
                                    className="text-xs text-slate-400 hover:text-teal-600 font-medium transition-colors"
                                >
                                    {mode === 'login' ? 'Inget konto? Registrera dig här.' : 'Har du redan konto? Logga in.'}
                                </button>
                            </div>
                        )}

                        <div className="relative my-8 text-center">
                            <div className="h-px bg-slate-200 w-full absolute top-1/2"></div>
                            <span className="bg-white px-3 text-xs text-slate-400 relative z-10 font-medium">ELLER</span>
                        </div>

                        <button 
                            onClick={onDemo}
                            className="w-full py-4 bg-teal-50 text-teal-800 font-bold rounded-2xl border border-teal-100 hover:bg-teal-100 transition-colors flex items-center justify-center gap-2"
                        >
                            <Eye size={18} /> Visa Demo (Elton)
                        </button>
                    </div>
                ) : (
                    <div className="text-center space-y-6 py-8 animate-fade-in">
                        <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <Check size={40} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-nordic-charcoal mb-2">Länk skickad!</h2>
                            <p className="text-slate-500">Vi har skickat ett mail till <span className="font-bold text-nordic-charcoal">{email}</span>.</p>
                            <p className="text-slate-500 text-sm mt-2">Klicka på länken i mailet för att logga in. Du kan stänga denna flik om du öppnar länken på samma enhet.</p>
                        </div>
                        <button 
                            onClick={() => setEmailSent(false)}
                            className="text-sm text-slate-400 hover:text-nordic-charcoal underline"
                        >
                            Skickade jag fel adress?
                        </button>
                    </div>
                )}

                <p className="text-center text-[10px] text-slate-400 mt-8">
                    © 2025 The VanPlan. Autentisering via Google Firebase.
                </p>
            </div>
        </div>
    );
};

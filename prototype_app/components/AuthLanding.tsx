
import React from 'react';
import { ArrowRight, Lock, Key, Eye } from 'lucide-react';

interface AuthLandingProps {
    onLogin: () => void;
    onDemo: () => void;
}

export const AuthLanding: React.FC<AuthLandingProps> = ({ onLogin, onDemo }) => {
    return (
        <div className="min-h-screen bg-nordic-ice flex flex-col items-center justify-center p-6 relative overflow-hidden">
            
            {/* Background blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-100 rounded-full blur-[100px] opacity-50"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-100 rounded-full blur-[100px] opacity-50"></div>

            <div className="max-w-md w-full bg-white/80 backdrop-blur-xl p-8 rounded-[40px] shadow-2xl border border-white z-10 relative">
                
                <div className="text-center mb-10">
                    <h1 className="font-serif font-bold text-4xl text-nordic-charcoal mb-2">The VanPlan</h1>
                    <p className="text-slate-500 text-sm tracking-wide uppercase">Ditt digitala garage</p>
                </div>

                <div className="space-y-4">
                    <div className="bg-white p-1 rounded-2xl border border-slate-100 shadow-inner flex mb-6">
                        <button className="flex-1 py-3 text-sm font-bold text-nordic-charcoal bg-nordic-ice rounded-xl shadow-sm transition-all">Logga in</button>
                        <button className="flex-1 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all">Skapa konto</button>
                    </div>

                    <div className="space-y-3">
                        <div className="relative">
                            <input 
                                type="email" 
                                placeholder="E-post"
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-nordic-charcoal"
                            />
                        </div>
                        <div className="relative">
                            <input 
                                type="password" 
                                placeholder="Lösenord"
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-nordic-charcoal"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={onLogin}
                        className="w-full py-4 bg-nordic-charcoal text-white font-bold rounded-2xl shadow-lg shadow-slate-300 hover:bg-slate-800 transition-transform active:scale-95 flex items-center justify-center gap-2 mt-4"
                    >
                        <Key size={18} /> Öppna Garaget
                    </button>

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

                <p className="text-center text-[10px] text-slate-400 mt-8">
                    © 2025 The VanPlan. All data lagras lokalt i din webbläsare.
                </p>
            </div>
        </div>
    );
};

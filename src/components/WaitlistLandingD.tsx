import React, { useState } from 'react';
import {
    Check, Loader2, ArrowRight, CheckCircle2, X, Sparkles, Wrench,
    Camera, FileText, MapPin, Calendar, Database, Users,
    Cloud, TrendingUp, BookOpen, Zap, GraduationCap, Star,
    Shield, ChevronRight, Menu
} from 'lucide-react';
import { addToWaitlist } from '@/services/db';
import { AuthLanding } from './AuthLanding';
import darkLogo from '@/assets/dark_logo.svg';
import hanna1 from '@/assets/hanna1.png'; // We might use this differently
import { FeedbackModal } from './modals/FeedbackModal';
import { PolicyModal } from './modals/PolicyModal';

export const WaitlistLandingD: React.FC = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [queuePosition, setQueuePosition] = useState<number | null>(null);
    const [showLogin, setShowLogin] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [showPolicy, setShowPolicy] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes('@')) {
            setError('Vänligen ange en giltig e-postadress');
            return;
        }

        setError(null);
        setIsSubmitting(true);

        try {
            const result = await addToWaitlist(email, { name: name.trim() || undefined });

            if (result.success) {
                setSubmitted(true);
                setQueuePosition(result.position || null);
            } else {
                setError(result.error || 'Ett fel uppstod. Försök igen.');
            }
        } catch (err) {
            setError('Ett oväntat fel uppstod. Försök igen senare.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-6 font-sans">
                <div className="max-w-xl w-full bg-white p-12 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-stone-100 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 to-emerald-500"></div>
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-emerald-50/50">
                        <CheckCircle2 size={40} className="text-emerald-600" strokeWidth={2} />
                    </div>

                    <h1 className="font-serif font-bold text-4xl text-stone-900 mb-4 tracking-tight">
                        Du är med! 🎉
                    </h1>

                    <p className="text-stone-600 text-lg mb-8 leading-relaxed">
                        Tack {name || email.split('@')[0]}! Du har tagit första steget mot ett smidigare vanlife-byggande.
                    </p>

                    {queuePosition !== null && (
                        <div className="bg-stone-50 rounded-2xl p-8 mb-8 border border-stone-100">
                            <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-3">DIN PLATS I KÖN</p>
                            <p className="text-5xl font-serif font-bold text-stone-800 tracking-tighter">#{queuePosition}</p>
                        </div>
                    )}

                    <p className="text-stone-500 text-sm mb-8">
                        Vi hör av oss till <span className="font-semibold text-stone-800 border-b border-stone-200 pb-0.5">{email}</span> så snart vi släpper in nya användare.
                    </p>

                    <button
                        onClick={() => setSubmitted(false)}
                        className="text-stone-400 hover:text-stone-600 text-sm font-medium transition-colors flex items-center justify-center gap-2 mx-auto group"
                    >
                        <ArrowRight size={16} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                        Tillbaka till startsidan
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFCF8] font-sans text-stone-900 selection:bg-teal-100 selection:text-teal-900">
            {/* Header */}
            <nav className="fixed w-full z-50 bg-[#FDFCF8]/80 backdrop-blur-md border-b border-stone-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={darkLogo} alt="VanPlan" className="h-8 w-auto opacity-90" />
                        <span className="bg-stone-100 text-stone-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Beta</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setShowLogin(true)}
                            className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
                        >
                            Logga in
                        </button>
                        <button
                            onClick={() => document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })}
                            className="hidden sm:block bg-stone-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-stone-800 transition-all hover:scale-[1.02] shadow-lg shadow-stone-900/10"
                        >
                            Gå med i kön
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-48 pb-32 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in">
                            <Sparkles size={12} />
                            <span>Ordning och reda på bygget</span>
                        </div>

                        <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-medium tracking-tight leading-[1.05] mb-8 text-stone-900">
                            Allt om din bil.<br />
                            <span className="text-teal-600 block mt-2">I fickan.</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-stone-600 max-w-2xl leading-relaxed font-light mb-12">
                            Manualer, mått och att-göra-listor på samma ställe. Så du kan fokusera på att förbättra din bil, istället för att leta papper.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <button
                                onClick={() => document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })}
                                className="bg-stone-900 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-stone-800 transition-all hover:scale-[1.02] shadow-xl shadow-stone-900/20 flex items-center gap-2 group"
                            >
                                Kom igång gratis

                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <div className="flex items-center gap-4 text-sm text-stone-500 px-4">
                                <div className="flex -space-x-2">
                                    {["MJ", "AL", "KA", "RB"].map((initials, i) => (
                                        <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-stone-200 flex items-center justify-center text-[10px] font-bold text-stone-500`}>
                                            {initials}
                                        </div>
                                    ))}
                                </div>
                                <p>Gå med 120+ andra byggare</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Abstract decorative elements instead of full bg image */}
                {/* Abstract decorative elements instead of full bg image */}
                <div className="absolute top-0 right-0 w-full h-full z-0 opacity-40 pointer-events-none overflow-hidden">
                    <div className="absolute top-[10%] -right-[20%] md:top-[20%] md:right-[10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-gradient-to-br from-teal-100/50 to-orange-100/50 rounded-full blur-[80px] md:blur-[120px]"></div>
                    <div className="absolute top-[30%] -right-[10%] md:top-[40%] md:right-[30%] w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-purple-100/50 rounded-full blur-[60px] md:blur-[100px]"></div>
                </div>
            </header>

            {/* Bento Grid Features */}
            <section className="py-24 px-6 bg-white rounded-t-[3rem] border-t border-stone-100 relative z-20 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.03)]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20 animate-fade-in-up">
                        <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-6">En pärm för allt</h2>
                        <p className="text-xl text-stone-500 font-light max-w-2xl mx-auto">
                            Din smarta följeslagare i garaget.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">
                        {/* Featured Large Card */}
                        <div className="md:col-span-2 lg:col-span-2 row-span-2 bg-[#F5F5F4] rounded-[2rem] p-10 flex flex-col justify-between hover:shadow-xl transition-shadow group overflow-hidden relative">
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
                                    <Cloud className="text-stone-900" size={28} strokeWidth={1.5} />
                                </div>
                                <h3 className="font-serif text-3xl text-stone-900 mb-4">Din digitala servicebok</h3>
                                <p className="text-stone-600 text-lg leading-relaxed max-w-sm">
                                    Spar kvitton, besiktningspapper och instruktionsböcker. Allt blir sökbart direkt. Behöver du veta däcktrycket eller färgkoden? Fråga bara appen.
                                </p>
                            </div>
                            <div className="absolute right-[-20px] bottom-[-20px] w-64 h-64 bg-white/50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-orange-50 rounded-[2rem] p-8 hover:shadow-lg transition-shadow border border-orange-100/50">
                            <Database className="text-orange-600 mb-6" size={32} strokeWidth={1.5} />
                            <h3 className="font-bold text-lg text-stone-900 mb-2">Hitta saker lätt</h3>
                            <p className="text-sm text-stone-600">Var lade du den där säkringen? Fota och spara så vet du alltid var grejerna finns.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-teal-50 rounded-[2rem] p-8 hover:shadow-lg transition-shadow border border-teal-100/50">
                            <Wrench className="text-teal-600 mb-6" size={32} strokeWidth={1.5} />
                            <h3 className="font-bold text-lg text-stone-900 mb-2">Mekhjälp</h3>
                            <p className="text-sm text-stone-600">Osäker på hur man byter olja? Appen läser manualen åt dig och förklarar på ren svenska.</p>
                        </div>

                        {/* Feature 4 (Tall) */}
                        <div className="md:col-span-1 row-span-2 bg-stone-900 rounded-[2rem] p-8 text-white flex flex-col justify-between relative overflow-hidden group">
                            <div className="relative z-10">
                                <Zap className="text-yellow-400 mb-6" size={32} strokeWidth={1.5} />
                                <h3 className="font-serif text-2xl mb-4">Problem längs vägen?</h3>
                                <p className="text-stone-400 text-sm leading-relaxed mb-8">
                                    Konstigt ljud i motorn eller lampa som lyser? Beskriv problemet så hjälper vi dig hitta felet innan du ringer bärgaren.
                                </p>
                                <button className="text-xs font-bold uppercase tracking-wider text-white border border-white/20 px-4 py-2 rounded-full hover:bg-white/10 transition-colors">
                                    Se demon
                                </button>
                            </div>
                            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-transparent to-black/20 pointer-events-none"></div>
                        </div>

                        {/* Feature 5 */}
                        <div className="bg-purple-50 rounded-[2rem] p-8 hover:shadow-lg transition-shadow border border-purple-100/50">
                            <Users className="text-purple-600 mb-6" size={32} strokeWidth={1.5} />
                            <h3 className="font-bold text-lg text-stone-900 mb-2">Bygg tillsammans</h3>
                            <p className="text-sm text-stone-600">Bygger ni i par? Bjud in din partner så har båda koll på inköpslistan i affären.</p>
                        </div>

                        {/* Feature 6 */}
                        <div className="lg:col-span-2 bg-white border border-stone-200 rounded-[2rem] p-8 flex items-center gap-8 hover:border-stone-300 transition-colors">
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-stone-900 mb-2">Bättre värde den dagen du säljer</h3>
                                <p className="text-sm text-stone-600">En bil med komplett historik och dokumentatison är värd mer. Vi hjälper dig spara allt automatiskt.</p>
                            </div>
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                                <TrendingUp className="text-blue-600" size={24} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Target Audience Tabs Style */}
            <section className="py-24 px-6 bg-[#FDFCF8] relative">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="flex-1">
                            <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-8 leading-tight">
                                Designad för dig, oavsett kunskapsnivå.
                            </h2>
                            <p className="text-xl text-stone-500 font-light mb-12">
                                Från första gången du håller i en skiftnyckel till ditt tionde bygge.
                            </p>

                            <div className="space-y-6">
                                <div className="group cursor-pointer">
                                    <h3 className="text-xl font-bold text-stone-900 mb-2 flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-sm font-serif">1</span>
                                        Drömmaren
                                    </h3>
                                    <p className="text-stone-600 pl-11 border-l-2 border-stone-100 group-hover:border-rose-200 transition-colors pl-4">
                                        Vi översätter verkstadsspråk till ren svenska och guidar dig tryggt framåt.
                                    </p>
                                </div>
                                <div className="group cursor-pointer">
                                    <h3 className="text-xl font-bold text-stone-900 mb-2 flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-sm font-serif">2</span>
                                        Fixaren
                                    </h3>
                                    <p className="text-stone-600 pl-11 border-l-2 border-stone-100 group-hover:border-teal-200 transition-colors pl-4">
                                        Få överblick direkt. Inköpslistor som skapar sig själva och en budget som håller.
                                    </p>
                                </div>
                                <div className="group cursor-pointer">
                                    <h3 className="text-xl font-bold text-stone-900 mb-2 flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-serif">3</span>
                                        Proffset
                                    </h3>
                                    <p className="text-stone-600 pl-11 border-l-2 border-stone-100 group-hover:border-indigo-200 transition-colors pl-4">
                                        Dokumentera varje skruv för att maxa värdet inför framtida försäljning.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 relative">
                            <div className="aspect-square bg-stone-100 rounded-[3rem] overflow-hidden relative">
                                <img src={hanna1} alt="Van Life" className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 transition-all duration-700" />
                                <div className="absolute inset-0 bg-stone-900/10"></div>
                            </div>
                            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl max-w-xs animate-bounce-slow">
                                <div className="flex gap-1 text-yellow-500 mb-2">
                                    <Star size={14} fill="currentColor" />
                                    <Star size={14} fill="currentColor" />
                                    <Star size={14} fill="currentColor" />
                                    <Star size={14} fill="currentColor" />
                                    <Star size={14} fill="currentColor" />
                                </div>
                                <p className="text-sm font-medium text-stone-800 italic">
                                    "Utan VanPlan hade vi aldrig blivit klara. Nu rullar vi!"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Clean CTA Section */}
            <section id="signup" className="py-24 px-6 bg-stone-900 text-white rounded-t-[3rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-900/20 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="max-w-xl mx-auto text-center relative z-10">
                    <h2 className="font-serif text-5xl md:text-6xl mb-8 leading-tight">
                        Redo att starta?
                    </h2>
                    <p className="text-lg text-stone-400 mb-12 font-light">
                        Bli en av de första att testa VanPlan och ta kontroll över ditt drömprojekt. 100% gratis under betan.
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="din@epost.se"
                            required
                            className="flex-1 bg-white/10 border border-white/10 rounded-full px-6 py-4 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500 backdrop-blur-sm transition-all"
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting || !email}
                            className="bg-teal-500 text-white px-8 py-4 rounded-full font-medium hover:bg-teal-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/20 whitespace-nowrap"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Gå med nu"}
                        </button>
                    </form>

                    <p className="mt-8 text-xs text-stone-500">
                        Genom att gå med godkänner du våra villkor. Inget spam, vi lovar.
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-stone-950 text-stone-500 py-12 px-6 border-t border-stone-800/50">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-xs">
                    <p>© 2025 VanPlan. Byggt med ❤️</p>
                    <div className="flex gap-8">
                        <button onClick={() => setShowFeedback(true)} className="hover:text-stone-300 transition-colors">Rapportera fel</button>
                        <button onClick={() => setShowPolicy(true)} className="hover:text-stone-300 transition-colors">Villkor & Policy</button>
                    </div>
                </div>
            </footer>

            {/* Modals */}
            {showLogin && (
                <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="relative w-full max-w-5xl max-h-[90vh] overflow-auto bg-white rounded-[2rem] shadow-2xl animate-fade-in-up">
                        <button
                            onClick={() => setShowLogin(false)}
                            className="absolute top-6 right-6 z-10 p-2 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors focus:ring-2 focus:ring-stone-200 outline-none"
                            aria-label="Stäng"
                        >
                            <X size={20} className="text-stone-600" />
                        </button>
                        <AuthLanding onDemo={() => setShowLogin(false)} />
                    </div>
                </div>
            )}

            {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
            {showPolicy && <PolicyModal onClose={() => setShowPolicy(false)} />}
        </div>
    );
};

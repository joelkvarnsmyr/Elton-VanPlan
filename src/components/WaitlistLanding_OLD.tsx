import React, { useState } from 'react';
import { Check, Loader2, ArrowRight, CheckCircle2, X, Sparkles, Wrench, Camera, MessageSquare, ShoppingCart, FileText, MapPin, Calendar, Database, Users, Cloud, TrendingUp, BookOpen, Zap, GraduationCap, Github, Heart } from 'lucide-react';
import { addToWaitlist } from '@/services/db';
import { AuthLanding } from './AuthLanding';
import eltonLogo from '@/assets/eltonlogo.svg';
import hanna1 from '@/assets/hanna1.png';
import hanna2 from '@/assets/hanna2.png';
import { FeedbackModal } from './modals/FeedbackModal';
import { PolicyModal } from './modals/PolicyModal';

export const WaitlistLanding: React.FC = () => {
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
            <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
                <div className="max-w-xl w-full bg-white p-12 rounded-[2rem] shadow-xl shadow-stone-200/50 border border-stone-100 text-center">
                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={32} className="text-green-600" strokeWidth={2} />
                    </div>

                    <h1 className="font-serif font-medium text-3xl text-stone-800 mb-2">
                        Du är med! 🎉
                    </h1>

                    <p className="text-stone-600 text-lg mb-4">
                        Tack {name || email.split('@')[0]}!
                    </p>

                    {queuePosition !== null && (
                        <div className="bg-stone-50 rounded-2xl p-6 mb-6">
                            <p className="text-xs text-stone-500 uppercase tracking-wide font-medium mb-2">Din plats i kön</p>
                            <p className="text-4xl font-serif font-bold text-stone-800">#{queuePosition}</p>
                        </div>
                    )}

                    <p className="text-stone-500 text-sm">
                        Vi hör av oss till <span className="font-medium text-stone-700">{email}</span> när det är din tur.
                    </p>
                    <button onClick={() => setSubmitted(false)} className="mt-8 text-sm text-stone-400 hover:text-stone-600">
                        Tillbaka till startsidan
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 font-sans selection:bg-rose-100 selection:text-rose-900">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-stone-100/50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-orange-300 rounded-lg flex items-center justify-center shadow-sm">
                            <Heart className="text-white" size={16} fill="currentColor" />
                        </div>
                        <h1 className="font-serif font-bold text-xl text-stone-800 tracking-tight">The VanPlan</h1>
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-stone-100 text-stone-500 rounded-full">
                            Beta
                        </span>
                    </div>
                    <button
                        onClick={() => setShowLogin(true)}
                        className="px-5 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-full transition-all"
                    >
                        Logga in
                    </button>
                </div>
            </header>

            {/* HERO-SEKTION with Background Image */}
            <section className="relative min-h-[90vh] flex items-center justify-center pt-20 px-6 overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={hanna1}
                        alt="Background of van life journey"
                        className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/40 to-stone-50"></div>
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10 mt-10">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-rose-50 text-rose-600 text-sm font-medium mb-6 border border-rose-100 shadow-sm animate-fade-in-up">
                        ✨ Gör drömmen till verklighet
                    </span>

                    <h2 className="text-5xl md:text-7xl font-serif font-medium text-stone-900 mb-8 tracking-tight leading-[1.1] drop-shadow-sm">
                        Resan är målet.<br />
                        <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-400">Vi hjälper dig på vägen.</span>
                    </h2>

                    <p className="text-xl md:text-2xl text-stone-600 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
                        Din digitala kompis för vanlife-bygget. Mjuka värden möter hård fakta – från inspiration till besiktning.
                    </p>

                    <div className="max-w-md mx-auto">
                        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl p-2 pl-6 rounded-full shadow-2xl shadow-stone-200/50 border border-white flex items-center gap-2 transition-all hover:scale-[1.01] focus-within:ring-4 focus-within:ring-rose-500/10">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="din@epost.se"
                                required
                                className="flex-1 bg-transparent border-none focus:ring-0 text-stone-800 placeholder-stone-400 py-3 text-lg outline-none"
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting || !email}
                                className="px-8 py-4 bg-stone-800 hover:bg-stone-900 text-white font-medium rounded-full transition-all active:scale-[0.95] flex items-center gap-2 disabled:opacity-50 text-lg shadow-lg shadow-stone-900/10"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Gå med"}
                            </button>
                        </form>
                        <p className="text-xs text-stone-500 mt-4 font-medium tracking-wide uppercase">
                            Gå med 120+ andra drömmare i kön
                        </p>
                    </div>
                </div>
            </section>

            {/* MÅLGRUPPER (Nivåer) */}
            <section className="px-6 py-24 bg-stone-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h3 className="text-3xl md:text-4xl font-serif text-stone-800 mb-4">
                            För dig, oavsett var du är i resan
                        </h3>
                        <p className="text-lg text-stone-600 max-w-2xl mx-auto font-light">
                            Inga förkunskaper krävs. Bara en vilja att skapa.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Nybörjare */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100 hover:shadow-xl hover:shadow-rose-100/50 transition-all hover:-translate-y-1">
                            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
                                <Sparkles size={28} strokeWidth={1.5} />
                            </div>
                            <h4 className="text-2xl font-serif text-stone-800 mb-3">Drömmaren</h4>
                            <p className="text-stone-600 leading-relaxed mb-4">
                                Aldrig hållit i en skiftnyckel? Ingen fara. Vi översätter verkstadsspråk till ren svenska och guidar dig tryggt framåt.
                            </p>
                            <span className="text-sm font-medium text-rose-500">Perfekt för nybörjare</span>
                        </div>

                        {/* Hemmamekaniker */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100 hover:shadow-xl hover:shadow-teal-100/50 transition-all hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-6">
                                    <Wrench size={28} strokeWidth={1.5} />
                                </div>
                                <h4 className="text-2xl font-serif text-stone-800 mb-3">Fixaren</h4>
                                <p className="text-stone-600 leading-relaxed mb-4">
                                    Få struktur på kaoset. Inköpslistor som skapar sig själva och en budget som faktiskt håller.
                                </p>
                                <span className="text-sm font-medium text-teal-600">För dig som vill ha ordning</span>
                            </div>
                        </div>

                        {/* Expert */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100 hover:shadow-xl hover:shadow-amber-100/50 transition-all hover:-translate-y-1">
                            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                                <Zap size={28} strokeWidth={1.5} />
                            </div>
                            <h4 className="text-2xl font-serif text-stone-800 mb-3">Proffset</h4>
                            <p className="text-stone-600 leading-relaxed mb-4">
                                Dokumentera varje skruv för att maxa värdet. Din digitala servicebok som imponerar på både köpare och besiktning.
                            </p>
                            <span className="text-sm font-medium text-amber-600">Maximalt värde</span>
                        </div>
                    </div>
                </div>
            </section>



            {/* VÅR HISTORIA - Bildfokus */}
            <section className="px-6 py-24 bg-white overflow-hidden">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-rose-500 font-medium tracking-wider text-sm uppercase mb-2 block">Vår Resa</span>
                        <h3 className="text-3xl md:text-5xl font-serif text-stone-800 mb-6">
                            Från rostig dröm till äventyr
                        </h3>
                        <p className="text-xl text-stone-600 max-w-2xl mx-auto font-light">
                            När vi köpte vår LT31 visste vi ingenting. Nu vet vi att allt går att lösa – med lite hjälp.
                        </p>
                    </div>

                    <div className="relative rounded-[3rem] overflow-hidden shadow-2xl shadow-stone-200 aspect-[16/9] group">
                        <img
                            src={hanna2}
                            alt="Hanna och Vanen"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-10">
                            <p className="text-white font-serif text-2xl md:text-3xl italic">
                                "Vi skapade VanPlan för att vi behövde den själva."
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FUNKTIONER (Problem & Lösning) - Full list with colors */}
            <section className="px-6 py-24 bg-stone-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <h3 className="text-3xl md:text-5xl font-serif text-stone-800 mb-6">
                            Allt du behöver för bygget <span className="italic text-teal-600">&</span> livet på vägen
                        </h3>
                        <p className="text-xl text-stone-600 max-w-2xl mx-auto font-light">
                            AI-driven projektledning som förstår just din bil.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={<Camera className="text-white" size={24} />}
                            title="Automatisk fordonsdata"
                            description="Ta kort på registreringsskylten eller ange regnummer – vi hämtar automatiskt alla fordonsdata: modell, årsmodell, vikt, tekniska specifikationer."
                            color="indigo"
                        />
                        <FeatureCard
                            icon={<Sparkles className="text-white" size={24} />}
                            title="AI skriver om uppgifter"
                            description="Från 'BYTA OLJA' till 'Vill du prova byta olja själv? Då behöver du det här...' AI skapar begripliga checklistor steg för steg."
                            color="purple"
                        />
                        <FeatureCard
                            icon={<Camera className="text-white" size={24} />}
                            title="Köpbesiktning med AI"
                            description="Ska köpa bil? Få modell-specifik checklista. Fotografera rost, motor – AI analyserar och varnar för dolda problem."
                            color="rose"
                        />
                        <FeatureCard
                            icon={<FileText className="text-white" size={24} />}
                            title="Scanna kvitton automatiskt"
                            description="Fotografera kvitton från bildelar. AI läser produktnamn, pris och datum – allt sparas automatiskt i budgeten."
                            color="emerald"
                        />
                        <FeatureCard
                            icon={<Calendar className="text-white" size={24} />}
                            title="Säsongspåminnelser"
                            description="Vinterförvaring? Vårcheck? AI skapar checklistor baserat på din bil och klimat. Missa aldrig viktiga datum."
                            color="cyan"
                        />
                        <FeatureCard
                            icon={<BookOpen className="text-white" size={24} />}
                            title="AI som lär sig din bil"
                            description="Ladda upp verkstadshandbok – AI indexerar den och svarar på frågor specifikt för din modell och årsmodell."
                            color="amber"
                        />
                        <FeatureCard
                            icon={<ShoppingCart className="text-white" size={24} />}
                            title="Smarta inköpslistor"
                            description="AI föreslår exakt vilka delar du behöver baserat på din bil och projekt. Håll koll på budget vs faktisk kostnad."
                            color="teal"
                        />
                        <FeatureCard
                            icon={<MapPin className="text-white" size={24} />}
                            title="Hitta rätt verkstad"
                            description="Få förslag på lokala verkstäder specialiserade på just din bilmodell. Spara kontakter och tidigare service."
                            color="indigo"
                        />
                        <FeatureCard
                            icon={<TrendingUp className="text-white" size={24} />}
                            title="Tidslinje & Fasplanering"
                            description="Dela upp projektet i faser. AI identifierar beroenden – vad måste göras först, vad kan vänta."
                            color="purple"
                        />
                        <FeatureCard
                            icon={<Database className="text-white" size={24} />}
                            title="Komplett servicehistorik"
                            description="Dokumentera varje byte av komponent, varje service, varje milsten. Öka fordonets värde med komplett historik."
                            color="rose"
                        />
                        <FeatureCard
                            icon={<Users className="text-white" size={24} />}
                            title="Samarbeta i realtid"
                            description="Bjud in partner, vänner eller din verkstad till projektet. Alla ser samma info, kommenterar och uppdaterar."
                            color="emerald"
                        />
                        <FeatureCard
                            icon={<Cloud className="text-white" size={24} />}
                            title="Alltid säkert i molnet"
                            description="All data backupas automatiskt. Tappa telefonen? Inga problem – logga in på ny enhet och fortsätt där du var."
                            color="cyan"
                        />
                        <FeatureCard
                            icon={<Zap className="text-white" size={24} />}
                            title="Nödsituation? Inga problem"
                            description="Fastnat i Danmark? Ta bild på problemet, fråga Elton AI. Ladda upp försäkringsavtal – AI berättar om skadan täcks."
                            color="amber"
                        />
                        <FeatureCard
                            icon={<GraduationCap className="text-white" size={24} />}
                            title="Forskningsbaserad projektmetodik"
                            description="Smarta mål, tydliga uppgifter. AI identifierar beroenden så du gör rätt saker i rätt ordning."
                            color="teal"
                        />
                        <FeatureCard
                            icon={<TrendingUp className="text-white" size={24} />}
                            title="Dokumentation ökar värdet"
                            description="När du säljer kan du visa komplett historik: varje byte, kvitton, milstolpar. Det inger förtroende och motiverar högre pris."
                            color="blue"
                        />
                    </div>
                </div>
            </section>

            {/* CTA FOOTER - Clean & Simple */}
            <section className="px-6 py-24 bg-white border-t border-stone-100">
                <div className="max-w-2xl mx-auto text-center">
                    <h3 className="text-4xl font-serif text-stone-800 mb-6">
                        Börja din resa här
                    </h3>
                    <p className="text-lg text-stone-600 mb-10 font-light">
                        Väntelistan är öppen. Kostnadsfritt under betan.
                    </p>

                    <form onSubmit={handleSubmit} className="bg-stone-50 p-2 pl-4 rounded-full shadow-lg shadow-stone-100 border border-stone-100 flex items-center gap-2 transition-all focus-within:ring-4 focus-within:ring-rose-500/10 max-w-md mx-auto">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="din@epost.se"
                            required
                            className="flex-1 bg-transparent border-none focus:ring-0 text-stone-800 placeholder-stone-400 py-3"
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting || !email}
                            className="px-8 py-3 bg-stone-800 hover:bg-stone-700 text-white font-medium rounded-full transition-all active:scale-[0.98] flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Skriv upp mig"}
                        </button>
                    </form>

                    <div className="mt-16 pt-8 border-t border-stone-50 flex justify-center gap-8">
                        <button onClick={() => setShowFeedback(true)} className="text-xs text-stone-400 hover:text-stone-600 transition-colors flex items-center gap-2">
                            Rapportera fel
                        </button>
                        <button onClick={() => setShowPolicy(true)} className="text-xs text-stone-400 hover:text-stone-600 transition-colors flex items-center gap-2">
                            Villkor
                        </button>
                    </div>
                    <p className="text-[10px] text-stone-300 mt-4 text-center">© 2025 The VanPlan</p>
                </div>
            </section>

            {/* MODALS */}
            {showLogin && (
                <div className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="relative w-full max-w-6xl max-h-[90vh] overflow-auto bg-white rounded-[2rem] shadow-2xl">
                        <button onClick={() => setShowLogin(false)} className="absolute top-6 right-6 z-10 p-2 bg-white hover:bg-stone-50 rounded-full shadow-sm transition-all border border-stone-100">
                            <X size={24} className="text-stone-500" />
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

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: 'teal' | 'rose' | 'indigo' | 'amber' | 'emerald' | 'purple' | 'cyan' | 'blue';
    fullWidth?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, color, fullWidth }) => {
    const colorClasses = {
        teal: 'bg-teal-500 shadow-teal-200',
        rose: 'bg-rose-500 shadow-rose-200',
        indigo: 'bg-indigo-500 shadow-indigo-200',
        amber: 'bg-amber-500 shadow-amber-200',
        emerald: 'bg-emerald-500 shadow-emerald-200',
        purple: 'bg-purple-500 shadow-purple-200',
        cyan: 'bg-cyan-500 shadow-cyan-200',
        blue: 'bg-blue-500 shadow-blue-200'
    };

    return (
        <div className={`p-8 rounded-3xl bg-white border border-stone-100 hover:shadow-xl hover:shadow-stone-100 transition-all hover:-translate-y-1 ${fullWidth ? 'md:col-span-2 lg:col-span-3 lg:flex lg:items-center lg:gap-8' : ''}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${colorClasses[color]} ${fullWidth ? 'lg:mb-0 lg:flex-shrink-0' : ''}`}>
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-xl text-stone-900 mb-3">{title}</h4>
                <p className="text-stone-600 leading-relaxed font-light">{description}</p>
            </div>
        </div>
    );
};

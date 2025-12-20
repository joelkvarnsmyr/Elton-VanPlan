import React, { useState } from 'react';
import { Check, Loader2, ArrowRight, CheckCircle2, X, Sparkles, Wrench, Camera, MessageSquare, ShoppingCart, FileText, MapPin, Calendar, Database, Users, Cloud, TrendingUp, BookOpen, Zap, GraduationCap, Heart, ListChecks } from 'lucide-react';
import { addToWaitlist } from '@/services/db';
import { AuthLanding } from './AuthLanding';
import eltonLogo from '@/assets/eltonlogo.svg';

export const WaitlistLanding: React.FC = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [queuePosition, setQueuePosition] = useState<number | null>(null);
    const [showLogin, setShowLogin] = useState(false);

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
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-6">
                <div className="max-w-xl w-full bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={32} className="text-emerald-600" strokeWidth={2} />
                    </div>

                    <h1 className="font-semibold text-2xl text-slate-900 mb-2">
                        Du är med! 🎉
                    </h1>

                    <p className="text-slate-600 text-base mb-4">
                        Tack {name || email.split('@')[0]}!
                    </p>

                    {queuePosition !== null && (
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 mb-6">
                            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-2">Din position</p>
                            <p className="text-4xl font-bold text-slate-900">#{queuePosition}</p>
                        </div>
                    )}

                    <p className="text-slate-500 text-sm">
                        Vi hör av oss till <span className="font-medium text-slate-700">{email}</span> när det är din tur.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header with The VanPlan + Wrench Logo */}
            <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Wrench className="text-slate-800" size={24} strokeWidth={2.5} />
                        <h1 className="font-bold text-xl text-slate-900">The VanPlan</h1>
                        <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 bg-rose-100 text-rose-700 rounded-md">
                            Experiment
                        </span>
                    </div>
                    <button
                        onClick={() => setShowLogin(true)}
                        className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        Logga in
                    </button>
                </div>
            </header>

            {/* Hero - Gradient Style */}
            <section className="bg-gradient-to-br from-rose-50 via-white to-teal-50 px-6 py-24 md:py-32">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight leading-[1.1]">
                        Hela din resa,<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-rose-600">smart dokumenterad</span>
                    </h2>

                    <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
                        För van, husbil, campervan eller skåpbil. Bygg om, förvalta eller bara håll koll. VanPlan har AI-verktyg för både stora projekt och vardagligt underhåll.
                    </p>

                    <div className="max-w-md mx-auto">
                        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl shadow-lg border border-slate-200">
                            <div className="space-y-3 mb-4">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="din@epost.se"
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-900 placeholder-slate-400"
                                />

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ditt namn (valfritt)"
                                    className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-900 placeholder-slate-400"
                                />
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 rounded-xl">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting || !email}
                                className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/20"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Registrerar...
                                    </>
                                ) : (
                                    <>
                                        Gå med i väntelistan
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Skill Levels */}
            <section className="px-6 py-20 bg-white border-t border-slate-100">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            För alla, oavsett erfarenhet
                        </h3>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            VanPlan anpassar sig efter din nivå
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-rose-50 to-white p-8 rounded-2xl border border-rose-100">
                            <GraduationCap className="text-rose-600 mb-4" size={32} />
                            <h4 className="text-xl font-semibold text-slate-900 mb-3">Nybörjare</h4>
                            <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                                Aldrig mekat? Perfekt. AI guidar dig steg för steg och skriver om "BYTA OLJA" till begripliga checklistor.
                            </p>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li className="flex items-start gap-2">
                                    <Check size={16} className="text-rose-500 mt-0.5 flex-shrink-0" />
                                    <span>Steg-för-steg instruktioner</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check size={16} className="text-rose-500 mt-0.5 flex-shrink-0" />
                                    <span>AI förklarar alla termer</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check size={16} className="text-rose-500 mt-0.5 flex-shrink-0" />
                                    <span>Hitta lokala verkstäder</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-50 to-white p-8 rounded-2xl border border-emerald-100">
                            <Wrench className="text-emerald-600 mb-4" size={32} />
                            <h4 className="text-xl font-semibold text-slate-900 mb-3">Hemmamekaniker</h4>
                            <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                                Kan byta olja? Bra! VanPlan hjälper dig ta nästa steg med smarta verktyg.
                            </p>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li className="flex items-start gap-2">
                                    <Check size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                                    <span>Automatiska inköpslistor</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                                    <span>AI hittar rätt bildelar</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                                    <span>Spåra kostnader vs budget</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-white p-8 rounded-2xl border border-amber-100">
                            <Zap className="text-amber-600 mb-4" size={32} />
                            <h4 className="text-xl font-semibold text-slate-900 mb-3">Expert</h4>
                            <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                                Erfaren mekaniker? Använd VanPlan som din digitala verkstad.
                            </p>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li className="flex items-start gap-2">
                                    <Check size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                                    <span>Detaljerad dokumentation</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                                    <span>Öka fordonets värde</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                                    <span>Samarbeta med team</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Story - With Elton Logo */}
            <section className="px-6 py-20 bg-gradient-to-br from-slate-50 to-white border-t border-slate-100">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <img src={eltonLogo} alt="Elton" className="h-12 w-auto opacity-90" />
                        <span className="text-sm font-medium uppercase tracking-wider text-slate-400">Vår Historia</span>
                    </div>

                    <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                        "Köpte en campervan från '76 och visste knappt var motorhuven satt"
                    </h3>

                    <div className="space-y-4 text-lg text-slate-600 leading-relaxed">
                        <p>
                            Drömmen? Episk roadtrip genom Europa. Verkligheten? En rostig VW från 1976 som lät
                            som en kaffebryggare när man startade den. Vi hade <span className="text-slate-900 font-medium">noll koll</span> på bilar.
                        </p>

                        <p>
                            Frågorna bara växte: <em className="text-slate-700">"Vad är egentligen en tändstift? Varför läcker det olja?
                                Finns det ens reservdelar till en '76:a?"</em>
                        </p>

                        <p className="border-l-4 border-teal-300 pl-6 italic text-slate-700 bg-teal-50/50 py-4 rounded-r-xl">
                            Kvitton överallt. Bilder i telefonen. Anteckningar på servettkuvert.
                            Verkstadsmannens mobilnummer på en lapp någonstans. <span className="font-medium">Helt kaos.</span>
                        </p>

                        <p>
                            Så vi skapade VanPlan för vår egen överlevnad. En plats där <strong className="text-slate-900">AI:n läser
                                din manual</strong> och svarar på "vad-är-det-här-för-skruv"-frågor. Där alla kvitton, foton
                            och milstolpar samlas.
                        </p>

                        <p className="text-slate-900 font-semibold text-xl">
                            Idag rullar vår '76:a som en dröm 🚐✨
                        </p>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="px-6 py-20 bg-white border-t border-slate-100">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            För projekt <span className="text-slate-400">&</span> förvaltning
                        </h3>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            AI hjälper dig med allt från köpbesiktning till säsongsservice
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={<Camera className="text-teal-600" size={24} />}
                            title="Automatisk fordonsdata"
                            description="Ta kort på registreringsskylten eller ange regnummer – vi hämtar automatiskt alla fordonsdata: modell, årsmodell, vikt, tekniska specifikationer."
                            color="teal"
                        />

                        <FeatureCard
                            icon={<ListChecks className="text-rose-600" size={24} />}
                            title="AI skriver om uppgifter"
                            description="Från 'BYTA OLJA' till 'Vill du prova byta olja själv? Då behöver du det här...' AI skapar begripliga checklistor steg för steg."
                            color="rose"
                        />

                        <FeatureCard
                            icon={<CheckCircle2 className="text-indigo-600" size={24} />}
                            title="Köpbesiktning med AI"
                            description="Ska köpa bil? Få modell-specifik checklista. Fotografera rost, motor – AI analyserar och varnar för dolda problem."
                            color="indigo"
                        />

                        <FeatureCard
                            icon={<FileText className="text-amber-600" size={24} />}
                            title="Scanna kvitton automatiskt"
                            description="Fotografera kvitton från bildelar. AI läser produktnamn, pris och datum – allt sparas automatiskt i budgeten."
                            color="amber"
                        />

                        <FeatureCard
                            icon={<Calendar className="text-emerald-600" size={24} />}
                            title="Säsongspåminnelser"
                            description="Vinterförvaring? Vårcheck? AI skapar checklistor baserat på din bil och klimat. Missa aldrig viktiga datum."
                            color="emerald"
                        />

                        <FeatureCard
                            icon={<MessageSquare className="text-purple-600" size={24} />}
                            title="AI som lär sig din bil"
                            description="Ladda upp verkstadshandbok – AI indexerar den och svarar på frågor specifikt för din modell och årsmodell."
                            color="purple"
                        />

                        <FeatureCard
                            icon={<ShoppingCart className="text-teal-600" size={24} />}
                            title="Smarta inköpslistor"
                            description="AI föreslår exakt vilka delar du behöver baserat på din bil och projekt. Håll koll på budget vs faktisk kostnad."
                            color="teal"
                        />

                        <FeatureCard
                            icon={<MapPin className="text-rose-600" size={24} />}
                            title="Hitta rätt verkstad"
                            description="Få förslag på lokala verkstäder specialiserade på just din bilmodell. Spara kontakter och tidigare service."
                            color="rose"
                        />

                        <FeatureCard
                            icon={<TrendingUp className="text-indigo-600" size={24} />}
                            title="Tidslinje & Fasplanering"
                            description="Dela upp projektet i faser. AI identifierar beroenden – vad måste göras först, vad kan vänta."
                            color="indigo"
                        />

                        <FeatureCard
                            icon={<Database className="text-amber-600" size={24} />}
                            title="Komplett servicehistorik"
                            description="Dokumentera varje byte av komponent, varje service, varje milsten. Öka fordonets värde med komplett historik."
                            color="amber"
                        />

                        <FeatureCard
                            icon={<Users className="text-emerald-600" size={24} />}
                            title="Samarbeta i realtid"
                            description="Bjud in partner, vänner eller din verkstad till projektet. Alla ser samma info, kommenterar och uppdaterar."
                            color="emerald"
                        />

                        <FeatureCard
                            icon={<Cloud className="text-purple-600" size={24} />}
                            title="Alltid säkert i molnet"
                            description="All data backupas automatiskt. Tappa telefonen? Inga problem – logga in på ny enhet och fortsätt där du var."
                            color="purple"
                        />

                        <FeatureCard
                            icon={<Zap className="text-teal-600" size={24} />}
                            title="Nödsituation? Inga problem"
                            description="Fastnat i Danmark? Ta bild på problemet, fråga Elton AI. Ladda upp försäkringsavtal – AI berättar om skadan täcks."
                            color="teal"
                        />

                        <FeatureCard
                            icon={<BookOpen className="text-rose-600" size={24} />}
                            title="Forskningsbaserad projektmetodik"
                            description="Smarta mål, tydliga uppgit fter. AI identifierar beroenden så du gör rätt saker i rätt ordning."
                            color="rose"
                        />
                    </div>
                </div>
            </section>

            {/* Value Prop - Dark */}
            <section className="px-6 py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-t border-slate-800">
                <div className="max-w-3xl mx-auto text-center">
                    <TrendingUp className="mx-auto mb-6 text-teal-400" size={48} />
                    <h3 className="text-3xl md:text-4xl font-bold mb-6">
                        Dokumentation ökar värdet
                    </h3>
                    <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                        När du säljer kan du visa komplett historik: varje byte, kvitton, milstolpar.
                        Det inger förtroende och motiverar högre pris.
                    </p>
                    <p className="text-teal-400 font-semibold text-lg">
                        VanPlan är din investering i framtiden
                    </p>
                </div>
            </section>

            {/* Final CTA */}
            <section className="px-6 py-20 bg-gradient-to-br from-rose-50 to-white border-t border-slate-100">
                <div className="max-w-2xl mx-auto text-center">
                    <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        Redo att börja?
                    </h3>
                    <p className="text-lg text-slate-600 mb-8">
                        Gå med i väntelistan och bli en av de första att testa VanPlan
                    </p>

                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 max-w-md mx-auto">
                        <div className="space-y-3 mb-4">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="din@epost.se"
                                required
                                className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-900 placeholder-slate-400"
                            />

                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ditt namn (valfritt)"
                                className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-slate-900 placeholder-slate-400"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !email}
                            className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-teal-500/20"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Registrerar...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={18} />
                                    Gå med nu
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-100 bg-white px-6 py-8">
                <div className="max-w-6xl mx-auto text-center">
                    <p className="text-sm text-slate-500">
                        Byggt med ❤️ av ett par som älskar fordon (och lärde sig meka på vägen)
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                        © 2025 The VanPlan
                    </p>
                </div>
            </footer>

            {/* Login Modal */}
            {showLogin && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="relative w-full max-w-6xl max-h-[90vh] overflow-auto bg-white rounded-2xl shadow-2xl">
                        <button
                            onClick={() => setShowLogin(false)}
                            className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all"
                            aria-label="Stäng"
                        >
                            <X size={24} className="text-slate-700" />
                        </button>
                        <AuthLanding onDemo={() => setShowLogin(false)} />
                    </div>
                </div>
            )}
        </div>
    );
};

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: 'teal' | 'rose' | 'indigo' | 'amber' | 'emerald' | 'purple';
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, color }) => {
    const colorClasses = {
        teal: 'bg-teal-50 border-teal-100 hover:border-teal-200 hover:shadow-teal-100',
        rose: 'bg-rose-50 border-rose-100 hover:border-rose-200 hover:shadow-rose-100',
        indigo: 'bg-indigo-50 border-indigo-100 hover:border-indigo-200 hover:shadow-indigo-100',
        amber: 'bg-amber-50 border-amber-100 hover:border-amber-200 hover:shadow-amber-100',
        emerald: 'bg-emerald-50 border-emerald-100 hover:border-emerald-200 hover:shadow-emerald-100',
        purple: 'bg-purple-50 border-purple-100 hover:border-purple-200 hover:shadow-purple-100'
    };

    return (
        <div className={`p-6 rounded-2xl border transition-all hover:shadow-lg ${colorClasses[color]}`}>
            <div className="mb-4">{icon}</div>
            <h4 className="font-bold text-lg text-slate-900 mb-2">{title}</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
        </div>
    );
};

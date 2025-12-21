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
            {/* Header - More visible */}
            <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white border-b border-stone-200 shadow-sm">
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
                        {/* Nybörjare - Pink/Rose */}
                        <div className="bg-gradient-to-br from-pink-100 to-rose-100 p-8 rounded-[2rem] shadow-lg hover:shadow-2xl hover:shadow-rose-200/50 transition-all hover:-translate-y-1 border border-rose-200/50">
                            <div className="w-14 h-14 bg-white/80 backdrop-blur text-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-md">
                                <Sparkles size={28} strokeWidth={2} />
                            </div>
                            <h4 className="text-2xl font-serif font-bold text-stone-900 mb-3">Drömmaren</h4>
                            <p className="text-stone-700 leading-relaxed mb-4">
                                Aldrig hållit i en skiftnyckel? Ingen fara. Vi översätter verkstadsspråk till ren svenska och guidar dig tryggt framåt.
                            </p>
                            <span className="text-sm font-bold text-rose-700">Perfekt för nybörjare</span>
                        </div>

                        {/* Hemmamekaniker - Green/Teal */}
                        <div className="bg-gradient-to-br from-green-100 to-teal-100 p-8 rounded-[2rem] shadow-lg hover:shadow-2xl hover:shadow-teal-200/50 transition-all hover:-translate-y-1 border border-teal-200/50">
                            <div className="w-14 h-14 bg-white/80 backdrop-blur text-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-md">
                                <Wrench size={28} strokeWidth={2} />
                            </div>
                            <h4 className="text-2xl font-serif font-bold text-stone-900 mb-3">Fixaren</h4>
                            <p className="text-stone-700 leading-relaxed mb-4">
                                Få struktur på kaoset. Inköpslistor som skapar sig själva och en budget som faktiskt håller.
                            </p>
                            <span className="text-sm font-bold text-teal-700">För dig som vill ha ordning</span>
                        </div>

                        {/* Expert - Blue/Cyan */}
                        <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-8 rounded-[2rem] shadow-lg hover:shadow-2xl hover:shadow-cyan-200/50 transition-all hover:-translate-y-1 border border-cyan-200/50">
                            <div className="w-14 h-14 bg-white/80 backdrop-blur text-cyan-600 rounded-2xl flex items-center justify-center mb-6 shadow-md">
                                <Zap size={28} strokeWidth={2} />
                            </div>
                            <h4 className="text-2xl font-serif font-bold text-stone-900 mb-3">Proffset</h4>
                            <p className="text-stone-700 leading-relaxed mb-4">
                                Dokumentera varje skruv för att maxa värdet. Din digitala servicebok som imponerar på både köpare och besiktning.
                            </p>
                            <span className="text-sm font-bold text-cyan-700">Maximalt värde</span>
                        </div>
                    </div>
                </div>
            </section>



            {/* VÅR HISTORIA - Text with Elton logo, NO IMAGE */}
            <section className="px-6 py-24 bg-gradient-to-b from-white to-stone-50 overflow-hidden">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <img src={eltonLogo} alt="Elton" className="h-12 w-auto opacity-80" />
                            <span className="text-rose-500 font-medium tracking-wider text-sm uppercase">Vår Resa</span>
                        </div>
                        <h3 className="text-3xl md:text-5xl font-serif text-stone-800 mb-6">
                            Från rosthål till <span className="text-rose-500">rullande frihet</span>
                        </h3>
                    </div>

                    <div className="space-y-6 text-lg text-stone-700 leading-relaxed">
                        <p>
                            Vad händer när en 25-årig husbilsdröm krockar med en gammal skåpbil, där den ena av oss ser inredningsmagi och den andra ser mekaniska måsten? Vi möttes i en gemensam längtan, men glappet mellan vision och verklighet kändes lika stort som hålet i bilens rostiga balk.
                        </p>
                        <p>
                            Utan en tydlig karta insåg vi snabbt att vi skulle gå vilse bland kablar och isolering. Därför skapade vi VanPlan.
                        </p>
                        <p className="border-l-4 border-rose-300 pl-6 italic text-stone-800 bg-rose-50/30 py-4 rounded-r-2xl">
                            Det blev vår gemensamma tolk som översätter tekniskt kaos till en tydlig, visuell struktur där vi kan mötas.
                        </p>
                        <p>
                            Det hjälper oss att bryta ner det omöjliga berget till hanterbara steg och ger en tydlig strategi, så att man vågar ta sig an jobbet med självförtroende oavsett kunskapsnivå. VanPlan är kartan som gör att du går från att drömma på Pinterest till att faktiskt vrida om nyckeln – oavsett om du är proffs eller aldrig hållit i en skiftnyckel förut. Vi gör drömmen genomförbar, en skruv i taget.
                        </p>

                        {/* Signatures */}
                        <div className="flex items-center justify-center gap-12 pt-8 mt-8 border-t border-stone-200">
                            <div className="text-center">
                                <p className="text-4xl text-stone-600 mb-1" style={{ fontFamily: "'Dancing Script', cursive" }}>Joel</p>
                                <p className="text-xs text-stone-400 uppercase tracking-wider">Teknik & Struktur</p>
                            </div>
                            <div className="w-px h-12 bg-stone-200"></div>
                            <div className="text-center">
                                <p className="text-4xl text-stone-600 mb-1" style={{ fontFamily: "'Pacifico', cursive" }}>Hanna</p>
                                <p className="text-xs text-stone-400 uppercase tracking-wider">Design & Vision</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FUNKTIONER - Apple-Inspired Layout */}

            {/* HERO FEATURE 1: Elton som projektledare */}
            <section className="px-6 py-32 bg-gradient-to-br from-purple-50 via-white to-rose-50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-purple-600 font-semibold text-sm uppercase tracking-wider mb-4 block">Din Elton-projektledare</span>
                            <h3 className="text-5xl md:text-6xl font-serif font-bold text-stone-900 mb-6 leading-tight">
                                Från köpbesiktning till färdig camper.
                            </h3>
                            <p className="text-xl text-stone-600 mb-8 leading-relaxed">
                                Fota rostangreppet eller motorn – Elton analyserar, varnar för fallgropar och skapar en steg-för-steg-plan för hur du fixar det. Som att ha en erfaren mekaniker i fickan.
                            </p>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2 text-stone-700">
                                    <CheckCircle2 className="text-purple-500" size={20} />
                                    <span className="text-sm font-medium">Bilspecifika råd</span>
                                </div>
                                <div className="flex items-center gap-2 text-stone-700">
                                    <CheckCircle2 className="text-purple-500" size={20} />
                                    <span className="text-sm font-medium">Steg-för-steg</span>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-square bg-gradient-to-br from-purple-100 to-rose-100 rounded-[3rem] flex items-center justify-center shadow-2xl shadow-purple-200/50">
                                <BookOpen className="text-purple-400" size={120} strokeWidth={1} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* TWO-COLUMN SPOTLIGHT */}
            <section className="px-6 py-24 bg-white">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">
                    {/* Automatisk fordonsdata */}
                    <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 rounded-[3rem] p-12 hover:shadow-2xl hover:shadow-indigo-100 transition-all">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                            <Camera className="text-indigo-600" size={32} />
                        </div>
                        <h4 className="text-3xl font-serif font-bold text-stone-900 mb-4">
                            Automatisk fordonsdata
                        </h4>
                        <p className="text-lg text-stone-700 leading-relaxed mb-6">
                            Ta kort på registreringsskylten eller ange regnummer – vi hämtar automatiskt alla fordonsdata: modell, årsmodell, vikt, tekniska specifikationer.
                        </p>
                        <p className="text-sm text-indigo-600 font-semibold">Elton vet direkt om du har en LT31 från '76 eller en modern Sprinter →</p>
                    </div>

                    {/* Scanna kvitton */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-[3rem] p-12 hover:shadow-2xl hover:shadow-emerald-100 transition-all">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                            <FileText className="text-emerald-600" size={32} />
                        </div>
                        <h4 className="text-3xl font-serif font-bold text-stone-900 mb-4">
                            Scanna kvitton automatiskt
                        </h4>
                        <p className="text-lg text-stone-700 leading-relaxed mb-6">
                            Fotografera kvitton från bildelar. Elton läser produktnamn, pris och datum – allt sparas automatiskt i budgeten.
                        </p>
                        <p className="text-sm text-emerald-600 font-semibold">Sluta leta kvitton i handskfacket →</p>
                    </div>
                </div>
            </section>

            {/* SPOTLIGHT STORY: Köpbesiktning */}
            <section className="px-6 py-32 bg-stone-50 overflow-hidden">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="relative order-2 lg:order-1">
                            <div className="aspect-[4/3] bg-gradient-to-br from-rose-100 to-orange-100 rounded-[3rem] flex items-center justify-center shadow-2xl shadow-rose-200/50">
                                <Camera className="text-rose-400" size={100} strokeWidth={1} />
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <span className="text-rose-600 font-semibold text-sm uppercase tracking-wider mb-4 block">Köpbesiktning</span>
                            <h3 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6 leading-tight">
                                Undvik dyra misstag innan du köper.
                            </h3>
                            <p className="text-xl text-stone-600 mb-8 leading-relaxed">
                                Ska köpa bil? Få modell-specifik checklista. Fotografera rost, motor – Elton analyserar och varnar för dolda problem.
                            </p>
                            <p className="text-stone-500 italic">
                                "Elton upptäckte rostskador som skulle kostat 50 000 kr att laga. Jag tackade nej till köpet."
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SUPPORTING FEATURES GRID */}
            <section className="px-6 py-24 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h3 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-4">
                            Och mycket mer.
                        </h3>
                        <p className="text-xl text-stone-600 max-w-2xl mx-auto">
                            Allt du behöver för att lyckas med ditt projekt.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <CompactFeatureCard
                            icon={<Sparkles className="text-purple-600" size={24} />}
                            title="Elton skriver om uppgifter"
                            description="Från 'BYTA OLJA' till begripliga steg-för-steg checklistor."
                        />
                        <CompactFeatureCard
                            icon={<Calendar className="text-cyan-600" size={24} />}
                            title="Säsongspåminnelser"
                            description="Vinterförvaring? Vårcheck? Elton skapar checklistor baserat på din bil."
                        />
                        <CompactFeatureCard
                            icon={<BookOpen className="text-amber-600" size={24} />}
                            title="Elton lär sig din bil"
                            description="Ladda upp verkstadshandbok – Elton svarar på frågor om din modell."
                        />
                        <CompactFeatureCard
                            icon={<ShoppingCart className="text-teal-600" size={24} />}
                            title="Smarta inköpslistor"
                            description="Elton föreslår exakt vilka delar du behöver för ditt projekt."
                        />
                        <CompactFeatureCard
                            icon={<MapPin className="text-indigo-600" size={24} />}
                            title="Hitta rätt verkstad"
                            description="Förslag på lokala verkstäder specialiserade på din bilmodell."
                        />
                        <CompactFeatureCard
                            icon={<TrendingUp className="text-purple-600" size={24} />}
                            title="Tidslinje & Fasplanering"
                            description="Elton identifierar beroenden – vad måste göras först."
                        />
                        <CompactFeatureCard
                            icon={<Cloud className="text-cyan-600" size={24} />}
                            title="Alltid säkert i molnet"
                            description="All data backupas automatiskt. Tappa telefonen? Inga problem."
                        />
                        <CompactFeatureCard
                            icon={<GraduationCap className="text-teal-600" size={24} />}
                            title="Forskningsbaserad metodik"
                            description="Smarta mål, tydliga uppgifter i rätt ordning."
                        />
                    </div>
                </div>
            </section>

            {/* FINAL SPOTLIGHT: Samarbeta & Servicehistorik */}
            <section className="px-6 py-32 bg-gradient-to-br from-stone-50 to-rose-50">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
                    {/* Samarbeta */}
                    <div className="bg-white rounded-[3rem] p-12 shadow-xl shadow-stone-200/50">
                        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6">
                            <Users className="text-rose-600" size={32} />
                        </div>
                        <h4 className="text-3xl font-serif font-bold text-stone-900 mb-4">
                            Samarbeta i realtid
                        </h4>
                        <p className="text-lg text-stone-700 leading-relaxed mb-6">
                            Bjud in partner, vänner eller din verkstad till projektet. Alla ser samma info, kommenterar och uppdaterar.
                        </p>
                        <div className="flex items-center gap-3 text-sm text-stone-600">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full bg-rose-200 border-2 border-white"></div>
                                <div className="w-8 h-8 rounded-full bg-teal-200 border-2 border-white"></div>
                                <div className="w-8 h-8 rounded-full bg-amber-200 border-2 border-white"></div>
                            </div>
                            <span className="font-medium">Bygg tillsammans</span>
                        </div>
                    </div>

                    {/* Servicehistorik */}
                    <div className="bg-white rounded-[3rem] p-12 shadow-xl shadow-stone-200/50">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                            <Database className="text-blue-600" size={32} />
                        </div>
                        <h4 className="text-3xl font-serif font-bold text-stone-900 mb-4">
                            Komplett servicehistorik
                        </h4>
                        <p className="text-lg text-stone-700 leading-relaxed mb-6">
                            Dokumentera varje byte av komponent, varje service, varje milsten. Öka fordonets värde med komplett historik.
                        </p>
                        <p className="text-sm text-blue-600 font-semibold">
                            Maximera försäljningspriset med professionell dokumentation →
                        </p>
                    </div>
                </div>
            </section>

            {/* EMERGENCY FEATURE - Full Width Banner */}
            <section className="px-6 py-20 bg-gradient-to-r from-amber-500 to-orange-500">
                <div className="max-w-5xl mx-auto text-center text-white">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Zap className="text-white" size={32} />
                    </div>
                    <h4 className="text-4xl font-serif font-bold mb-4">
                        Nödsituation? Inga problem.
                    </h4>
                    <p className="text-xl opacity-90 max-w-2xl mx-auto">
                        Fastnat i Danmark? Ta bild på problemet, fråga Elton. Ladda upp försäkringsavtal – Elton berättar om skadan täcks.
                    </p>
                </div>
            </section>

            {/* CTA FOOTER */}
            <section className="px-6 py-24 bg-white border-t border-stone-100">
                <div className="max-w-2xl mx-auto text-center">
                    <h3 className="text-4xl font-serif text-stone-800 mb-6">
                        Redo att starta motorn?
                    </h3>
                    <p className="text-lg text-stone-600 mb-10 font-light">
                        Bli en av de första att testa VanPlan och ta kontroll över ditt drömprojekt.
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
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Gå med nu"}
                        </button>
                    </form>

                    <p className="text-sm text-stone-500 mt-12 mb-4">
                        Byggt med ❤️ av ett par som vägrade låta rosten krossa drömmen (och lärde sig meka på vägen).
                    </p>
                    <p className="text-xs text-stone-300">© 2025 The VanPlan</p>

                    <div className="mt-8 pt-8 border-t border-stone-50 flex justify-center gap-8">
                        <button onClick={() => setShowFeedback(true)} className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
                            Rapportera fel
                        </button>
                        <button onClick={() => setShowPolicy(true)} className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
                            Villkor
                        </button>
                    </div>
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

interface CompactFeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const CompactFeatureCard: React.FC<CompactFeatureCardProps> = ({ icon, title, description }) => {
    return (
        <div className="bg-stone-50 rounded-2xl p-6 hover:bg-white hover:shadow-lg transition-all">
            <div className="mb-4">
                {icon}
            </div>
            <h5 className="font-bold text-lg text-stone-900 mb-2">{title}</h5>
            <p className="text-sm text-stone-600 leading-relaxed">{description}</p>
        </div>
    );
};

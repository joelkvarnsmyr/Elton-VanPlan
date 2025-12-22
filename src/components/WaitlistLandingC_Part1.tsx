import React, { useState, useEffect } from 'react';
import { Check, Loader2, X, CheckCircle2, ChevronDown, Shield, Users, TrendingUp, Clock, DollarSign, AlertCircle, Sparkles, Zap, Target, Award, Heart, Star, ArrowRight, Play, Timer } from 'lucide-react';
import { addToWaitlist } from '@/services/db';
import { AuthLanding } from './AuthLanding';
import darkLogo from '@/assets/dark_logo.svg';

// Simulated recent signups for live activity feed
const RECENT_SIGNUPS = [
    { name: 'Anna', city: 'Stockholm', time: 2 },
    { name: 'Erik', city: 'Göteborg', time: 5 },
    { name: 'Maria', city: 'Malmö', time: 8 },
    { name: 'Johan', city: 'Uppsala', time: 12 },
    { name: 'Lisa', city: 'Lund', time: 15 },
];

export const WaitlistLandingC: React.FC = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [queuePosition, setQueuePosition] = useState<number | null>(null);
    const [showLogin, setShowLogin] = useState(false);
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const [currentSignupIndex, setCurrentSignupIndex] = useState(0);

    // Countdown timer (7 days from now)
    const [timeLeft, setTimeLeft] = useState({
        days: 6,
        hours: 23,
        minutes: 45,
        seconds: 30
    });

    // Rotate through recent signups
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSignupIndex((prev) => (prev + 1) % RECENT_SIGNUPS.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Countdown timer
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                let { days, hours, minutes, seconds } = prev;

                if (seconds > 0) {
                    seconds--;
                } else if (minutes > 0) {
                    minutes--;
                    seconds = 59;
                } else if (hours > 0) {
                    hours--;
                    minutes = 59;
                    seconds = 59;
                } else if (days > 0) {
                    days--;
                    hours = 23;
                    minutes = 59;
                    seconds = 59;
                }

                return { days, hours, minutes, seconds };
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

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

    if (showLogin) {
        return <AuthLanding />;
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-rose-50 to-orange-50 flex items-center justify-center p-6">
                <div className="max-w-xl w-full bg-white p-12 rounded-[2rem] shadow-2xl border border-white text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <CheckCircle2 size={40} className="text-white" strokeWidth={2.5} />
                    </div>

                    <h1 className="font-serif font-bold text-4xl text-stone-900 mb-3">
                        🎉 Välkommen ombord!
                    </h1>

                    <p className="text-stone-600 text-xl mb-6">
                        Tack {name || email.split('@')[0]}!
                    </p>

                    {queuePosition !== null && (
                        <div className="bg-gradient-to-br from-purple-50 to-rose-50 rounded-3xl p-8 mb-6 border border-purple-100">
                            <p className="text-sm text-purple-600 uppercase tracking-wide font-bold mb-3">Din plats i kön</p>
                            <p className="text-6xl font-serif font-bold bg-gradient-to-r from-purple-600 to-rose-600 bg-clip-text text-transparent">
                                #{queuePosition}
                            </p>
                            <p className="text-sm text-stone-500 mt-3">av 120 exklusiva platser</p>
                        </div>
                    )}

                    <div className="bg-stone-50 rounded-2xl p-6 mb-6">
                        <h3 className="font-bold text-stone-900 mb-3">Vad händer nu?</h3>
                        <ul className="text-left space-y-2 text-sm text-stone-600">
                            <li className="flex items-start gap-2">
                                <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                                <span>Vi skickar ett välkomstmail till <strong>{email}</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                                <span>Du får tidig tillgång när vi lanserar</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                                <span>Livstids early-bird pris garanterat</span>
                            </li>
                        </ul>
                    </div>

                    <button
                        onClick={() => setSubmitted(false)}
                        className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
                    >
                        Tillbaka till startsidan
                    </button>
                </div>
            </div>
        );
    }

    const currentSignup = RECENT_SIGNUPS[currentSignupIndex];

    return (
        <div className="min-h-screen bg-white">
            {/* Header with Scarcity Badge */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={darkLogo} alt="VanPlan" className="h-10 w-auto" />
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-stone-100 text-stone-500 rounded-full">
                            Beta
                        </span>
                    </div>

                    {/* Scarcity Badge */}
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-full">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-bold text-red-700">Endast 50 platser kvar</span>
                    </div>

                    <button
                        onClick={() => setShowLogin(true)}
                        className="px-5 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-full transition-all"
                    >
                        Logga in
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-purple-50 via-white to-rose-50 relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-200 rounded-full blur-3xl opacity-20"></div>

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-purple-200 rounded-full mb-6 shadow-sm">
                        <Sparkles className="text-purple-600" size={16} />
                        <span className="text-sm font-medium text-purple-900">Gå från kaos till camper på 90 dagar</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-serif font-bold text-stone-900 mb-6 leading-tight">
                        Din husbilsdröm.<br />
                        <span className="bg-gradient-to-r from-purple-600 via-rose-600 to-orange-600 bg-clip-text text-transparent">
                            Vår plan.
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-stone-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                        VanPlan är den enda plattformen som kombinerar <strong>AI-assistans</strong>, <strong>smart budgetering</strong> och <strong>community-support</strong> för din husbilsresa.
                    </p>

                    {/* Email Capture */}
                    <div className="max-w-lg mx-auto mb-8">
                        <form onSubmit={handleSubmit} className="bg-white p-2 pl-6 rounded-full shadow-2xl shadow-purple-200/50 border-2 border-purple-100 flex items-center gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="din@epost.se"
                                required
                                className="flex-1 bg-transparent border-none focus:ring-0 text-stone-800 placeholder-stone-400 py-4 text-lg outline-none"
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting || !email}
                                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 text-white font-bold rounded-full transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 text-lg shadow-lg"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>
                                        Säkra min plats
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>

                        {error && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                                <X className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Trust Signals */}
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-stone-600 mb-6">
                        <div className="flex items-center gap-2">
                            <Users size={18} className="text-purple-600" />
                            <span><strong>120+</strong> byggare</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Star size={18} className="text-yellow-500 fill-yellow-500" />
                            <span><strong>4.8</strong> betyg</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield size={18} className="text-green-600" />
                            <span><strong>Gratis</strong> beta</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={18} className="text-emerald-600" />
                            <span><strong>Ingen</strong> bindningstid</span>
                        </div>
                    </div>

                    {/* Live Activity Feed */}
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur-sm border border-green-200 rounded-full shadow-lg animate-fade-in">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-rose-400 border-2 border-white"></div>
                            ))}
                        </div>
                        <div className="text-sm">
                            <span className="font-bold text-green-700">{currentSignup.name}</span>
                            <span className="text-stone-600"> från {currentSignup.city} gick med för </span>
                            <span className="font-bold text-green-700">{currentSignup.time} min</span>
                            <span className="text-stone-600"> sedan</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof Scrolling Bar */}
            <section className="py-6 bg-gradient-to-r from-purple-600 via-rose-600 to-orange-600 overflow-hidden">
                <div className="flex items-center gap-12 animate-scroll-left whitespace-nowrap">
                    {[...Array(3)].map((_, setIndex) => (
                        <React.Fragment key={setIndex}>
                            <div className="flex items-center gap-2 text-white">
                                <Star className="fill-white" size={20} />
                                <span className="font-medium">"Bästa verktyget jag använt" - Anna</span>
                            </div>
                            <div className="flex items-center gap-2 text-white">
                                <Star className="fill-white" size={20} />
                                <span className="font-medium">"Sparade 50 000 kr" - Erik</span>
                            </div>
                            <div className="flex items-center gap-2 text-white">
                                <Star className="fill-white" size={20} />
                                <span className="font-medium">"Slutförde på 3 månader" - Maria</span>
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </section>

            {/* The Problem - Visual Storytelling */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-center text-stone-900 mb-4">
                        Känner du igen dig?
                    </h2>
                    <p className="text-center text-stone-600 text-lg mb-16 max-w-2xl mx-auto">
                        Tusentals husb ilsbyggare står inför samma utmaningar varje dag
                    </p>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="text-red-600" size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-stone-900 mb-3">Du har drömmen...</h3>
                            <p className="text-stone-600 leading-relaxed">
                                En frihetskänsla på hjul. Äventyr utan gränser. Men var börjar man?
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <DollarSign className="text-orange-600" size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-stone-900 mb-3">Men inte planen...</h3>
                            <p className="text-stone-600 leading-relaxed">
                                Kvitton överallt. Budget som spårar ur. Ingen aning om vad nästa steg är.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Clock className="text-amber-600" size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-stone-900 mb-3">Och tiden rinner ut...</h3>
                            <p className="text-stone-600 leading-relaxed">
                                Månader blir år. Projektet står still. Drömmen känns längre bort än någonsin.
                            </p>
                        </div>
                    </div>

                    <div className="text-center mt-16">
                        <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-50 to-rose-50 border-2 border-purple-200 rounded-full">
                            <Sparkles className="text-purple-600" size={24} />
                            <span className="text-xl font-bold text-purple-900">Det finns ett bättre sätt</span>
                            <ArrowRight className="text-purple-600" size={24} />
                        </div>
                    </div>
                </div>
            </section>

            {/* The Transformation */}
            <section className="py-20 px-6 bg-gradient-to-b from-white to-stone-50">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-center text-stone-900 mb-16">
                        Transformationen
                    </h2>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Before */}
                        <div className="space-y-6">
                            <div className="inline-block px-4 py-2 bg-red-100 text-red-700 font-bold rounded-full text-sm">
                                Före VanPlan
                            </div>
                            <div className="space-y-4">
                                {[
                                    { icon: X, text: 'Kaos & stress', color: 'text-red-600' },
                                    { icon: X, text: 'Osäkerhet & tvivel', color: 'text-red-600' },
                                    { icon: X, text: 'Budgetöverskridning', color: 'text-red-600' },
                                    { icon: X, text: 'Ensam & vilse', color: 'text-red-600' },
                                    { icon: X, text: '6-12 månader', color: 'text-red-600' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-100">
                                        <item.icon className={item.color} size={24} />
                                        <span className="text-stone-700 font-medium">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* After */}
                        <div className="space-y-6">
                            <div className="inline-block px-4 py-2 bg-green-100 text-green-700 font-bold rounded-full text-sm">
                                Efter VanPlan
                            </div>
                            <div className="space-y-4">
                                {[
                                    { icon: Check, text: 'Struktur & lugn', color: 'text-green-600' },
                                    { icon: Check, text: 'Självförtroende & klarhet', color: 'text-green-600' },
                                    { icon: Check, text: 'Budget under kontroll', color: 'text-green-600' },
                                    { icon: Check, text: 'Community & stöd', color: 'text-green-600' },
                                    { icon: Check, text: '3 månader i snitt', color: 'text-green-600' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl border border-green-100">
                                        <item.icon className={item.color} size={24} />
                                        <span className="text-stone-700 font-medium">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works - 3 Steps */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-center text-stone-900 mb-4">
                        Så enkelt är det
                    </h2>
                    <p className="text-center text-stone-600 text-lg mb-16">
                        Tre steg från dröm till verklighet
                    </p>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: '1',
                                icon: Sparkles,
                                title: 'Berätta om din dröm',
                                description: 'Elton skapar din personliga plan baserat på din bil, budget och tidslinje',
                                color: 'from-purple-500 to-purple-600'
                            },
                            {
                                step: '2',
                                icon: Target,
                                title: 'Följ steg-för-steg',
                                description: 'Aldrig osäker på vad som är nästa. Checklistor, guider och AI-support hela vägen',
                                color: 'from-rose-500 to-rose-600'
                            },
                            {
                                step: '3',
                                icon: Award,
                                title: 'Fira färdig camper',
                                description: '90 dagar från start till äventyr. Dokumenterat, budgeterat, perfekt',
                                color: 'from-orange-500 to-orange-600'
                            },
                        ].map((item, i) => (
                            <div key={i} className="relative">
                                <div className={`absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg`}>
                                    {item.step}
                                </div>
                                <div className="bg-gradient-to-br from-stone-50 to-white p-8 pt-12 rounded-3xl border border-stone-200 h-full">
                                    <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-6`}>
                                        <item.icon className="text-white" size={28} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-stone-900 mb-3">{item.title}</h3>
                                    <p className="text-stone-600 leading-relaxed">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Continued in next part... */}
            <style>{`
                @keyframes scroll-left {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.333%); }
                }
                .animate-scroll-left {
                    animation: scroll-left 20s linear infinite;
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }
            `}</style>
        </div>
    );
};

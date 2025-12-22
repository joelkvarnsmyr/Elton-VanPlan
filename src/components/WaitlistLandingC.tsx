import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, X, CheckCircle2, ChevronDown, Shield, Users, TrendingUp, Clock, DollarSign, AlertCircle, Sparkles, Zap, Target, Award, Heart, Star, ArrowRight, Play, Timer, Lock, Gift } from 'lucide-react';
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
    { name: 'David', city: 'Stockholm', time: 1 },
    { name: 'Sofia', city: 'Västerås', time: 3 },
    { name: 'Marcus', city: 'Linköping', time: 6 },
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
    const [seatsTaken, setSeatsTaken] = useState(72);

    // Countdown timer (calculated from specific date + 7 days to keep it consistent but urgent)
    // For demo purposes, we'll reset it to 3 days 14 hours every refresh to maintain urgency
    const [timeLeft, setTimeLeft] = useState({
        days: 3,
        hours: 14,
        minutes: 45,
        seconds: 30
    });

    // Simulate seats filling up slowly
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.7 && seatsTaken < 115) {
                setSeatsTaken(prev => prev + 1);
            }
        }, 10000);
        return () => clearInterval(interval);
    }, [seatsTaken]);

    // Rotate through recent signups
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSignupIndex((prev) => (prev + 1) % RECENT_SIGNUPS.length);
        }, 4000); // Faster rotation
        return () => clearInterval(interval);
    }, []);

    // Countdown timer logic
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
                // Increment fake counter too for immediate gratification
                setSeatsTaken(prev => Math.min(prev + 1, 120));
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
        return <AuthLanding onDemo={() => setShowLogin(false)} />;
    }

    // Success Screen
    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-rose-50 to-orange-50 flex items-center justify-center p-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-xl w-full bg-white p-12 rounded-[2rem] shadow-2xl border border-white text-center relative overflow-hidden"
                >
                    {/* Confetti effect could go here */}

                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                        className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200"
                    >
                        <CheckCircle2 size={48} className="text-white" strokeWidth={3} />
                    </motion.div>

                    <h1 className="font-serif font-bold text-4xl text-stone-900 mb-3">
                        Välkommen till familjen! 🚐💨
                    </h1>

                    <p className="text-stone-600 text-xl mb-8">
                        Du tog ett grymt beslut idag, {name || email.split('@')[0]}!
                    </p>

                    {queuePosition !== null && (
                        <div className="bg-gradient-to-br from-stone-50 to-purple-50 rounded-3xl p-8 mb-8 border border-purple-100 relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Users size={100} />
                            </div>
                            <p className="text-sm text-purple-600 uppercase tracking-wide font-bold mb-2">Din plats i kön</p>
                            <div className="text-7xl font-serif font-bold bg-gradient-to-r from-purple-600 to-rose-600 bg-clip-text text-transparent">
                                #{queuePosition}
                            </div>
                            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-stone-500">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span>Vi släpper in nya användare varje vecka</span>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-purple-600">
                                <Gift size={20} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-stone-900">En present väntar i din inkorg</p>
                                <p className="text-sm text-stone-500">Vi har skickat vår "10 bästa tips"-guide till dig.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600">
                                <Users size={20} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-stone-900">Gå med i vår Facebook-grupp</p>
                                <p className="text-sm text-stone-500">Träffa andra byggare och få tips.</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setSubmitted(false)}
                        className="text-stone-400 hover:text-stone-600 transition-colors text-sm font-medium"
                    >
                        Tillbaka till startsidan
                    </button>
                </motion.div>
            </div>
        );
    }

    const currentSignup = RECENT_SIGNUPS[currentSignupIndex];

    return (
        <div className="min-h-screen bg-white">
            {/* Scarcity Header Banner */}
            <div className="bg-stone-900 text-white py-2 px-4 text-center text-xs md:text-sm font-medium">
                <div className="flex items-center justify-center gap-2">
                    <Timer size={14} className="text-orange-400 animate-pulse" />
                    <span>Beta-erbjudandet stänger om: </span>
                    <span className="font-mono text-orange-400 font-bold bg-stone-800 px-2 py-0.5 rounded">
                        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                    </span>
                    <span className="hidden md:inline text-stone-500 mx-2">|</span>
                    <span className="hidden md:inline">Säkra ditt livstidspris idag</span>
                </div>
            </div>

            {/* Navigation */}
            <header className="sticky top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-stone-100">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={darkLogo} alt="VanPlan" className="h-9 w-auto hover:opacity-80 transition-opacity" />
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-stone-100 text-stone-500 rounded-full border border-stone-200">
                            Beta
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-100 rounded-full">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
                            <span className="text-xs font-bold text-red-700">{120 - seatsTaken} platser kvar</span>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowLogin(true)}
                        className="px-5 py-2 text-sm font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-full transition-all"
                    >
                        Logga in
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-12 pb-20 md:pt-24 md:pb-32 px-6">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-100 rounded-full blur-[100px] opacity-40 mix-blend-multiply"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-sky-100 rounded-full blur-[100px] opacity-40 mix-blend-multiply"></div>
                    <div className="absolute top-[20%] left-[30%] w-[300px] h-[300px] bg-rose-100 rounded-full blur-[80px] opacity-30 mix-blend-multiply"></div>
                </div>

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-purple-100 rounded-full mb-8 shadow-sm hover:shadow-md transition-shadow cursor-default"
                    >
                        <Sparkles className="text-purple-600 fill-purple-100" size={16} />
                        <span className="text-sm font-semibold bg-gradient-to-r from-purple-700 to-rose-700 bg-clip-text text-transparent">Gå från kaos till camper på 90 dagar</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-stone-900 mb-8 leading-[1.1] tracking-tight"
                    >
                        Din husbilsdröm.<br />
                        <span className="bg-gradient-to-r from-purple-600 via-rose-500 to-orange-500 bg-clip-text text-transparent">
                            Planerad. Klar.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg md:text-2xl text-stone-600 mb-10 max-w-3xl mx-auto leading-relaxed font-light"
                    >
                        VanPlan är den enda plattformen som kombinerar <strong>AI-projektledning</strong>, <strong>automatisk budget</strong> och <strong>community</strong> för att garantera att du faktiskt blir klar.
                    </motion.p>

                    {/* CTA Area */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="max-w-md mx-auto relative mb-12"
                    >
                        <form onSubmit={handleSubmit} className="relative z-20">
                            <div className="bg-white p-2 pl-6 rounded-full shadow-2xl shadow-purple-200/50 border border-stone-200 flex items-center gap-2 transform transition-transform hover:scale-[1.01] focus-within:ring-4 focus-within:ring-purple-100">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="din@epost.se"
                                    required
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-stone-800 placeholder-stone-400 py-3 md:py-4 text-lg outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !email}
                                    className="px-6 md:px-8 py-3 md:py-4 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-full transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 text-base md:text-lg shadow-lg"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
                                        <>
                                            Säkra plats
                                            <ArrowRight size={20} className="hidden sm:inline" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Progress Bar under CTA */}
                        <div className="mt-4 flex flex-col items-center">
                            <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden mb-2">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(seatsTaken / 120) * 100}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                                ></motion.div>
                            </div>
                            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
                                <span className="text-green-600">{seatsTaken}</span> av 120 betaplatser tagna
                            </p>
                        </div>
                    </motion.div>

                    {/* Trust Signals */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-stone-500"
                    >
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200"></div>
                                <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-300"></div>
                                <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-400"></div>
                            </div>
                            <span><strong>1,200+</strong> i kö</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Star size={16} className="text-yellow-400 fill-yellow-400" />
                            <span><strong>4.9/5</strong> betyg</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield size={16} className="text-green-500" />
                            <span><strong>GDPR</strong> säkrad</span>
                        </div>
                    </motion.div>

                    {/* Floating Live Feed */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSignupIndex}
                            initial={{ opacity: 0, y: 20, x: -50 }}
                            animate={{ opacity: 1, y: 0, x: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="hidden lg:flex fixed bottom-8 left-8 z-40 bg-white p-4 rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-100 items-center gap-4 max-w-sm"
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-rose-100 flex items-center justify-center font-bold text-purple-600 text-sm">
                                {currentSignup.name.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-stone-900">
                                    {currentSignup.name} från {currentSignup.city}
                                </p>
                                <p className="text-xs text-green-600 font-medium">
                                    Gick med i betan för {currentSignup.time} min sedan
                                </p>
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </section>

            {/* Social Proof Ticker */}
            <div className="bg-stone-900 py-6 overflow-hidden">
                <div className="flex items-center gap-16 animate-scroll whitespace-nowrap">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3 opacity-90">
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, j) => (
                                    <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />
                                ))}
                            </div>
                            <p className="text-white text-sm font-medium">"Otroligt verktyg för oss nybörjare"</p>
                            <span className="text-stone-500 text-sm">•</span>
                            <p className="text-stone-400 text-sm">Sara K.</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Problem Section with Parallax Feel */}
            <section className="py-24 px-6 bg-white relative">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-purple-600 font-bold tracking-widest text-xs uppercase mb-2 block">Verkligheten</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6">
                            Varför stannar så många projekt av?
                        </h2>
                        <p className="text-lg text-stone-600 max-w-2xl mx-auto">
                            Att bygga en van är 20% snickrande och 80% planering, logistik och problemlösning.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: AlertCircle,
                                title: "Beslutsångest",
                                desc: "Isolering, elsystem, vatten... Varje val känns livsavgörande och fel beslut kostar tusenlappar.",
                                color: "bg-red-50 text-red-600"
                            },
                            {
                                icon: DollarSign,
                                title: "Dolda kostnader",
                                desc: "Budgeten spricker nästan alltid på 'småsaker' som skruv, lim och kopplingar som man glömt räkna med.",
                                color: "bg-orange-50 text-orange-600"
                            },
                            {
                                icon: Clock,
                                title: "Tidsoptimism",
                                desc: "Det som skulle ta en helg tar tre veckor. Motivationen dör när framstegen uteblir.",
                                color: "bg-amber-50 text-amber-600"
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -10 }}
                                className="bg-white p-8 rounded-3xl border border-stone-100 shadow-xl shadow-stone-200/50"
                            >
                                <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mb-6`}>
                                    <item.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-stone-900 mb-3">{item.title}</h3>
                                <p className="text-stone-600 leading-relaxed text-sm">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* The Solution - Split View */}
            <section className="py-24 px-6 bg-stone-50 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="relative z-10">
                            <span className="text-green-600 font-bold tracking-widest text-xs uppercase mb-2 block">Lösningen</span>
                            <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6 leading-tight">
                                Din digitala projektledare som aldrig sover
                            </h2>
                            <p className="text-lg text-stone-600 mb-8 leading-relaxed">
                                Elton är inte bara en app, det är en AI tränad på tusentals van builds. Han vet exakt vad du behöver göra, när du ska göra det, och vad det kommer kosta.
                            </p>

                            <div className="space-y-6">
                                {[
                                    { title: "Smart Schemaläggning", desc: "Vet automatiskt att du måste dra elen innan du sätter upp väggarna." },
                                    { title: "Budgetövervakning", desc: "Varnar dig innan du spenderar för mycket. Scanna kvitton direkt." },
                                    { title: "Byggsupport 24/7", desc: "Osäker på kabeldimension? Fota och fråga Elton. Svar direkt." }
                                ].map((feature, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.2 }}
                                        className="flex gap-4"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                                            <Check size={16} className="text-green-600" strokeWidth={3} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-stone-900">{feature.title}</h4>
                                            <p className="text-sm text-stone-600 mt-1">{feature.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            {/* Abstract phone mockup or interface representation */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-200 to-rose-200 rounded-[3rem] transform rotate-3 blur-2xl opacity-50"></div>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="relative bg-white border border-stone-200 rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[500px] flex flex-col"
                            >
                                <div className="bg-stone-50 border-b border-stone-100 p-6 flex justify-between items-center">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    </div>
                                    <div className="text-xs font-bold text-stone-400 uppercase tracking-wide">Elton Dashboard</div>
                                </div>

                                <div className="p-8 flex-1 bg-stone-50/50">
                                    {/* Mockup Content */}
                                    <div className="space-y-4">
                                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex gap-4 items-center">
                                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                                <Sparkles size={24} className="text-purple-600" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-purple-600 uppercase">Just nu</div>
                                                <div className="font-bold text-stone-900">Dra elrör i taket</div>
                                            </div>
                                            <div className="ml-auto px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">På spåret</div>
                                        </div>

                                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                                            <div className="flex justify-between items-end mb-4">
                                                <div>
                                                    <div className="text-stone-500 text-xs font-medium mb-1">Total Budget</div>
                                                    <div className="text-2xl font-bold text-stone-900">145 000 kr</div>
                                                </div>
                                                <div className="text-green-600 text-sm font-bold bg-green-50 px-2 py-1 rounded-lg">
                                                    -12% under budget
                                                </div>
                                            </div>
                                            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                                                <div className="bg-stone-900 h-full w-[65%] rounded-full"></div>
                                            </div>
                                        </div>

                                        <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg shadow-blue-200 mt-8 relative overflow-hidden">
                                            <div className="relative z-10">
                                                <div className="flex gap-2 items-center mb-2 opacity-80">
                                                    <AlertCircle size={16} />
                                                    <span className="text-xs font-bold uppercase">Tips från Elton</span>
                                                </div>
                                                <p className="font-medium text-sm leading-relaxed">
                                                    "Glöm inte att dra extra tomrör för framtida solpaneler innan du stänger taket. Det sparar dig mycket jobb senare!"
                                                </p>
                                            </div>
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comparison Table */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-center text-stone-900 mb-16">
                        Det smartare valet
                    </h2>

                    <div className="overflow-hidden border border-stone-200 rounded-3xl shadow-2xl shadow-stone-200/50">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-stone-50 border-b border-stone-200">
                                    <th className="py-6 px-6 text-left font-bold text-stone-500 w-1/3"></th>
                                    <th className="py-6 px-6 text-center font-bold text-stone-500 w-1/3">Manuellt Excel-kaos</th>
                                    <th className="py-6 px-6 text-center bg-stone-900 text-white w-1/3 relative">
                                        VanPlan
                                        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-orange-500"></div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {[
                                    { label: "Tid att planera", bad: "Veckor", good: "Minuter" },
                                    { label: "Budgetkontroll", bad: "Gissningar", good: "Exakt på kronan" },
                                    { label: "Expertis", bad: "Google-gissningar", good: "AI-expert 24/7" },
                                    { label: "Community", bad: "Ensam", good: "120+ byggare" },
                                    { label: "Resultat", bad: "Ofta ofärdigt", good: "Done & Dusted" },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-stone-50 transition-colors">
                                        <td className="py-6 px-6 font-medium text-stone-700">{row.label}</td>
                                        <td className="py-6 px-6 text-center text-stone-400 font-medium">{row.bad}</td>
                                        <td className="py-6 px-6 text-center font-bold text-green-600 bg-purple-50/10 border-l border-r border-stone-100 border-l-stone-200 border-r-stone-200 relative">
                                            {row.good}
                                            {i === 0 && <div className="absolute top-2 right-2 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Bäst</div>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 px-6 bg-stone-900 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute w-96 h-96 bg-purple-500 rounded-full blur-[100px] top-0 right-0"></div>
                    <div className="absolute w-96 h-96 bg-blue-500 rounded-full blur-[100px] bottom-0 left-0"></div>
                </div>

                <div className="max-w-6xl mx-auto relative z-10">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-16">
                        Från dröm till verklighet
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                text: "Jag sparade 50 000 kr genom att VanPlan upptäckte rostskador jag missat. Bästa investeringen någonsin.",
                                author: "Erik, Göteborg",
                                role: "Renoverade Fiat Ducato",
                                image: "E"
                            },
                            {
                                text: "Som helt okunnig inom bilar var jag livrädd. Elton gav mig självförtroendet att våga. Nu bor jag i min van på heltid!",
                                author: "Anna, Stockholm",
                                role: "Bor i VW Crafter",
                                image: "A"
                            },
                            {
                                text: "Extremt smidigt att ha allt på ett ställe. Budget, ritningar, todo-listor. Inget mer papperskaos.",
                                author: "Johan, Malmö",
                                role: "Bygger Sprinter",
                                image: "J"
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -5 }}
                                className="bg-stone-800 p-8 rounded-3xl border border-stone-700"
                            >
                                <div className="flex gap-1 mb-6">
                                    {[...Array(5)].map((_, j) => (
                                        <Star key={j} className="text-yellow-400 fill-yellow-400" size={16} />
                                    ))}
                                </div>
                                <p className="text-stone-300 mb-8 leading-relaxed">"{item.text}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-stone-700 font-bold text-white flex items-center justify-center">
                                        {item.image}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">{item.author}</div>
                                        <div className="text-xs text-stone-500">{item.role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-center text-stone-900 mb-16">
                        Vanliga frågor
                    </h2>

                    <div className="space-y-4">
                        {[
                            { q: "Kostar det verkligen ingenting?", a: "Ja, under betaperioden är VanPlan 100% gratis. Du får tillgång till alla premiumfunktioner utan kostnad." },
                            { q: "Kan jag använda det på mobilen?", a: "Självklart. VanPlan är byggt för att användas lika bra i garaget på mobilen som hemma vid datorn." },
                            { q: "Fungerar det för alla bilar?", a: "Ja, systemet är flexibelt och kan anpassas för allt från små Caddy-byggen till stora lastbilar." },
                            { q: "Vad händer efter betan?", a: "Du som går med nu får ett exklusivt 'Early Bird'-erbjudande för livstid. Vi kommer aldrig chockhöja priset för dig." }
                        ].map((item, i) => (
                            <div key={i} className="border border-stone-200 rounded-2xl overflow-hidden hover:border-stone-300 transition-colors">
                                <button
                                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between p-6 text-left font-bold text-stone-900 bg-stone-50/50 hover:bg-stone-50"
                                >
                                    {item.q}
                                    <ChevronDown
                                        className={`transition-transform duration-300 ${expandedFaq === i ? 'rotate-180' : ''}`}
                                        size={20}
                                    />
                                </button>
                                <AnimatePresence>
                                    {expandedFaq === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-6 pt-0 text-stone-600 leading-relaxed">
                                                {item.a}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Strip */}
            <section className="py-24 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-stone-900 z-0"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-rose-900/50 z-0"></div>

                <div className="max-w-4xl mx-auto relative z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
                        Redo att sluta drömma och börja bygga?
                    </h2>
                    <p className="text-xl text-stone-300 mb-10 max-w-2xl mx-auto">
                        De 50 sista platserna i vår gratis beta kommer gå åt snabbt. Vänta inte.
                    </p>

                    <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8">
                        <div className="bg-white p-2 pl-6 rounded-full shadow-2xl flex items-center gap-2">
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
                                className="px-8 py-3 bg-stone-900 hover:bg-black text-white font-bold rounded-full transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 text-lg"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Gå med"}
                            </button>
                        </div>
                    </form>

                    <div className="flex items-center justify-center gap-8 text-sm text-stone-400">
                        <span className="flex items-center gap-2"><Lock size={14} /> Säker SSL-kryptering</span>
                        <span className="flex items-center gap-2"><CheckCircle2 size={14} /> Avsluta när du vill</span>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-stone-950 text-stone-500 py-12 px-6 text-center text-sm border-t border-stone-900">
                <p>&copy; 2025 VanPlan. Byggt med ❤️ för vanlife-communityt.</p>
            </footer>

            <style>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-scroll {
                    animation: scroll 30s linear infinite;
                }
            `}</style>
        </div>
    );
};

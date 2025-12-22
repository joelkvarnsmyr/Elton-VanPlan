import React, { useState } from 'react';
import { Check, Loader2, X, CheckCircle2, ChevronDown, Shield, Users, TrendingUp, Clock, DollarSign, AlertCircle, Wrench, Calculator, FileText, Camera, Sparkles, Zap } from 'lucide-react';
import { addToWaitlist } from '@/services/db';
import { AuthLanding } from './AuthLanding';
import darkLogo from '@/assets/dark_logo.svg';

export const WaitlistLandingB: React.FC = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [queuePosition, setQueuePosition] = useState<number | null>(null);
    const [showLogin, setShowLogin] = useState(false);
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

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
        return <AuthLanding onBack={() => setShowLogin(false)} />;
    }

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
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-stone-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={darkLogo} alt="VanPlan" className="h-10 w-auto" />
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

            {/* Hero Section - Problem-First */}
            <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-stone-50 to-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-serif font-bold text-stone-900 mb-6 leading-tight">
                        Fastnat i husbilsrenoveringen?
                    </h1>
                    <p className="text-xl md:text-2xl text-stone-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                        VanPlan ger dig struktur, budget och AI-assistans för att slutföra ditt projekt – utan kaos.
                    </p>

                    {/* Email Capture - Above Fold */}
                    <div className="max-w-md mx-auto mb-8">
                        <form onSubmit={handleSubmit} className="bg-white p-2 pl-6 rounded-full shadow-xl shadow-stone-200/50 border border-stone-200 flex items-center gap-2">
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
                                className="px-8 py-4 bg-stone-800 hover:bg-stone-900 text-white font-medium rounded-full transition-all active:scale-[0.95] flex items-center gap-2 disabled:opacity-50 text-lg shadow-lg"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Gå med"}
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
                    <div className="flex items-center justify-center gap-8 text-sm text-stone-600">
                        <div className="flex items-center gap-2">
                            <Users size={18} className="text-stone-400" />
                            <span>120+ användare</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield size={18} className="text-stone-400" />
                            <span>Gratis beta</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={18} className="text-green-500" />
                            <span>Ingen bindningstid</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Problem Section */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-center text-stone-900 mb-4">
                        Känner du igen dig?
                    </h2>
                    <p className="text-center text-stone-600 mb-16 max-w-2xl mx-auto">
                        De vanligaste utmaningarna vi hör från husb ilsbyggare:
                    </p>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Problem 1 */}
                        <div className="bg-stone-50 p-8 rounded-3xl border border-stone-100">
                            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
                                <AlertCircle className="text-red-600" size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-stone-900 mb-3">Tappar översikten</h3>
                            <p className="text-stone-600 leading-relaxed">
                                "Jag vet inte vad som ska göras först. Ska jag börja med el eller isolering? Vad kostar det egentligen?"
                            </p>
                        </div>

                        {/* Problem 2 */}
                        <div className="bg-stone-50 p-8 rounded-3xl border border-stone-100">
                            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                                <DollarSign className="text-orange-600" size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-stone-900 mb-3">Budgeten spårar ur</h3>
                            <p className="text-stone-600 leading-relaxed">
                                "Kvitton överallt, glömmer vad jag köpt, vet inte hur mycket jag spenderat. Projektet blir dyrare än planerat."
                            </p>
                        </div>

                        {/* Problem 3 */}
                        <div className="bg-stone-50 p-8 rounded-3xl border border-stone-100">
                            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                                <Clock className="text-amber-600" size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-stone-900 mb-3">Vet inte var jag ska börja</h3>
                            <p className="text-stone-600 leading-relaxed">
                                "Aldrig renoverat förut. Vilka verktyg behöver jag? Hur vet jag om bilen är värd att köpa?"
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Solution Section */}
            <section className="py-20 px-6 bg-gradient-to-b from-white to-stone-50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-center text-stone-900 mb-4">
                        VanPlan löser detta
                    </h2>
                    <p className="text-center text-stone-600 mb-16 max-w-2xl mx-auto">
                        Allt du behöver för att ta din husbilsdröm från kaos till verklighet
                    </p>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Solution 1 */}
                        <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm hover:shadow-lg transition-shadow">
                            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                                <Sparkles className="text-purple-600" size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-stone-900 mb-3">Elton - Din AI-projektledare</h3>
                            <p className="text-stone-600 leading-relaxed mb-4">
                                Fota problemet, få lösningen. Elton analyserar, skapar steg-för-steg-planer och varnar för fallgropar.
                            </p>
                            <ul className="space-y-2 text-sm text-stone-600">
                                <li className="flex items-start gap-2">
                                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                                    <span>Bilspecifika råd baserat på din modell</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                                    <span>Köpbesiktning med AI-analys</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                                    <span>Svar på alla dina frågor 24/7</span>
                                </li>
                            </ul>
                        </div>

                        {/* Solution 2 */}
                        <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm hover:shadow-lg transition-shadow">
                            <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center mb-6">
                                <Calculator className="text-teal-600" size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-stone-900 mb-3">Smart budgethantering</h3>
                            <p className="text-stone-600 leading-relaxed mb-4">
                                Scanna kvitton, spåra utgifter, se exakt vad projektet kostar i realtid.
                            </p>
                            <ul className="space-y-2 text-sm text-stone-600">
                                <li className="flex items-start gap-2">
                                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                                    <span>Automatisk kvittoscanning</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                                    <span>Kategorisering av utgifter</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                                    <span>Budgetvarningar och prognoser</span>
                                </li>
                            </ul>
                        </div>

                        {/* Solution 3 */}
                        <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm hover:shadow-lg transition-shadow">
                            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                                <FileText className="text-indigo-600" size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-stone-900 mb-3">Steg-för-steg-guider</h3>
                            <p className="text-stone-600 leading-relaxed mb-4">
                                Tydliga checklistor, fasplanering och beroenden. Vet alltid vad som ska göras härnäst.
                            </p>
                            <ul className="space-y-2 text-sm text-stone-600">
                                <li className="flex items-start gap-2">
                                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                                    <span>Automatiska uppgifter baserat på din bil</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                                    <span>Identifierar vad som måste göras först</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                                    <span>Tidslinje och milstolpar</span>
                                </li>
                            </ul>
                        </div>

                        {/* Solution 4 */}
                        <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm hover:shadow-lg transition-shadow">
                            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                                <Camera className="text-emerald-600" size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-stone-900 mb-3">Komplett dokumentation</h3>
                            <p className="text-stone-600 leading-relaxed mb-4">
                                Bygg upp en professionell servicehistorik som ökar bilens värde vid försäljning.
                            </p>
                            <ul className="space-y-2 text-sm text-stone-600">
                                <li className="flex items-start gap-2">
                                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                                    <span>Foto-dokumentation av varje steg</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                                    <span>Digital servicebok</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                                    <span>Öka försäljningsvärdet</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comparison Table */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-center text-stone-900 mb-4">
                        Varför VanPlan?
                    </h2>
                    <p className="text-center text-stone-600 mb-12">
                        Jämför med andra alternativ
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b-2 border-stone-200">
                                    <th className="text-left py-4 px-6 font-semibold text-stone-900">Funktion</th>
                                    <th className="text-center py-4 px-6 font-semibold text-purple-600">VanPlan</th>
                                    <th className="text-center py-4 px-6 font-semibold text-stone-500">Manuellt</th>
                                    <th className="text-center py-4 px-6 font-semibold text-stone-500">Generiska verktyg</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-stone-100">
                                    <td className="py-4 px-6 text-stone-700">AI-assistent för husbil</td>
                                    <td className="text-center py-4 px-6"><Check className="inline text-green-500" size={24} /></td>
                                    <td className="text-center py-4 px-6"><X className="inline text-red-400" size={24} /></td>
                                    <td className="text-center py-4 px-6"><X className="inline text-red-400" size={24} /></td>
                                </tr>
                                <tr className="border-b border-stone-100 bg-stone-50">
                                    <td className="py-4 px-6 text-stone-700">Automatisk fordonsdata</td>
                                    <td className="text-center py-4 px-6"><Check className="inline text-green-500" size={24} /></td>
                                    <td className="text-center py-4 px-6"><X className="inline text-red-400" size={24} /></td>
                                    <td className="text-center py-4 px-6"><X className="inline text-red-400" size={24} /></td>
                                </tr>
                                <tr className="border-b border-stone-100">
                                    <td className="py-4 px-6 text-stone-700">Budgetspårning</td>
                                    <td className="text-center py-4 px-6"><Check className="inline text-green-500" size={24} /></td>
                                    <td className="text-center py-4 px-6"><span className="text-stone-400">~</span></td>
                                    <td className="text-center py-4 px-6"><Check className="inline text-green-500" size={24} /></td>
                                </tr>
                                <tr className="border-b border-stone-100 bg-stone-50">
                                    <td className="py-4 px-6 text-stone-700">Kvittoscanning</td>
                                    <td className="text-center py-4 px-6"><Check className="inline text-green-500" size={24} /></td>
                                    <td className="text-center py-4 px-6"><X className="inline text-red-400" size={24} /></td>
                                    <td className="text-center py-4 px-6"><span className="text-stone-400">~</span></td>
                                </tr>
                                <tr className="border-b border-stone-100">
                                    <td className="py-4 px-6 text-stone-700">Köpbesiktning med AI</td>
                                    <td className="text-center py-4 px-6"><Check className="inline text-green-500" size={24} /></td>
                                    <td className="text-center py-4 px-6"><X className="inline text-red-400" size={24} /></td>
                                    <td className="text-center py-4 px-6"><X className="inline text-red-400" size={24} /></td>
                                </tr>
                                <tr className="border-b border-stone-100 bg-stone-50">
                                    <td className="py-4 px-6 text-stone-700">Servicehistorik</td>
                                    <td className="text-center py-4 px-6"><Check className="inline text-green-500" size={24} /></td>
                                    <td className="text-center py-4 px-6"><span className="text-stone-400">~</span></td>
                                    <td className="text-center py-4 px-6"><X className="inline text-red-400" size={24} /></td>
                                </tr>
                                <tr className="bg-purple-50">
                                    <td className="py-4 px-6 font-bold text-stone-900">Pris (beta)</td>
                                    <td className="text-center py-4 px-6 font-bold text-purple-600">Gratis</td>
                                    <td className="text-center py-4 px-6 text-stone-500">Gratis</td>
                                    <td className="text-center py-4 px-6 text-stone-500">~200 kr/mån</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="py-20 px-6 bg-stone-50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-center text-stone-900 mb-4">
                        Vad säger användarna?
                    </h2>
                    <p className="text-center text-stone-600 mb-12">
                        Verkliga resultat från beta-testare
                    </p>

                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        {/* Testimonial 1 */}
                        <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
                            <div className="flex items-center gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className="text-yellow-400">★</span>
                                ))}
                            </div>
                            <p className="text-stone-700 mb-4 italic">
                                "Elton upptäckte rostskador som skulle ha kostat 50 000 kr att laga. Jag tackade nej till köpet och hittade en bättre bil."
                            </p>
                            <p className="text-sm text-stone-500">— Anna, Stockholm</p>
                        </div>

                        {/* Testimonial 2 */}
                        <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
                            <div className="flex items-center gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className="text-yellow-400">★</span>
                                ))}
                            </div>
                            <p className="text-stone-700 mb-4 italic">
                                "Budgetfunktionen sparade mig från att spendera för mycket. Kunde se exakt var pengarna gick och justera i tid."
                            </p>
                            <p className="text-sm text-stone-500">— Erik, Göteborg</p>
                        </div>

                        {/* Testimonial 3 */}
                        <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
                            <div className="flex items-center gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className="text-yellow-400">★</span>
                                ))}
                            </div>
                            <p className="text-stone-700 mb-4 italic">
                                "Som nybörjare var jag helt vilse. VanPlan gav mig en tydlig plan och självförtroende att börja."
                            </p>
                            <p className="text-sm text-stone-500">— Maria, Malmö</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-purple-600 mb-2">120+</div>
                            <div className="text-stone-600">Aktiva användare</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-purple-600 mb-2">4.8/5</div>
                            <div className="text-stone-600">Genomsnittligt betyg</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-purple-600 mb-2">50 000 kr</div>
                            <div className="text-stone-600">Genomsnittlig besparing</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-center text-stone-900 mb-4">
                        Vanliga frågor
                    </h2>
                    <p className="text-center text-stone-600 mb-12">
                        Allt du behöver veta om VanPlan
                    </p>

                    <div className="space-y-4">
                        {[
                            {
                                q: "Vad kostar VanPlan?",
                                a: "Under beta-fasen är VanPlan helt gratis. När vi lanserar kommer vi erbjuda en prisvärd prenumeration, men alla beta-användare får specialerbjudande."
                            },
                            {
                                q: "Fungerar det för alla bilmodeller?",
                                a: "Ja! VanPlan fungerar för alla typer av husbilar, skåpbilar och campervans. Elton har kunskap om tusentals modeller och kan ge specifika råd för just din bil."
                            },
                            {
                                q: "Måste jag vara teknisk för att använda VanPlan?",
                                a: "Absolut inte! VanPlan är byggt för alla nivåer - från nybörjare till erfarna byggare. Elton översätter tekniskt språk till begriplig svenska."
                            },
                            {
                                q: "Hur fungerar AI-assistenten?",
                                a: "Elton är tränad på husbilsrenovering och kan svara på frågor, analysera bilder, skapa planer och ge råd 24/7. Precis som att ha en erfaren mekaniker tillgänglig hela tiden."
                            },
                            {
                                q: "Kan jag samarbeta med andra?",
                                a: "Ja! Du kan bjuda in partner, vänner eller din verkstad till projektet. Alla ser samma information och kan uppdatera i realtid."
                            },
                            {
                                q: "Vad händer med min data?",
                                a: "All data krypteras och backupas automatiskt. Du äger din data och kan exportera eller radera den när som helst."
                            }
                        ].map((faq, index) => (
                            <div key={index} className="border border-stone-200 rounded-2xl overflow-hidden">
                                <button
                                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-stone-50 transition-colors"
                                >
                                    <span className="font-semibold text-stone-900">{faq.q}</span>
                                    <ChevronDown
                                        className={`text-stone-400 transition-transform ${expandedFaq === index ? 'rotate-180' : ''}`}
                                        size={20}
                                    />
                                </button>
                                {expandedFaq === index && (
                                    <div className="px-6 pb-4 text-stone-600">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 px-6 bg-gradient-to-br from-purple-50 via-rose-50 to-orange-50">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6">
                        Redo att börja?
                    </h2>
                    <p className="text-xl text-stone-600 mb-8">
                        Gå med i väntelistan och bli en av de första att testa VanPlan
                    </p>

                    <div className="max-w-md mx-auto mb-6">
                        <form onSubmit={handleSubmit} className="bg-white p-2 pl-6 rounded-full shadow-xl shadow-stone-200/50 border border-white flex items-center gap-2">
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
                                className="px-8 py-4 bg-stone-800 hover:bg-stone-900 text-white font-medium rounded-full transition-all active:scale-[0.95] flex items-center gap-2 disabled:opacity-50 text-lg shadow-lg"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Gå med nu"}
                            </button>
                        </form>

                        {error && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                                <X className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}
                    </div>

                    <p className="text-sm text-stone-500">
                        🔒 Ingen bindningstid • Avsluta när som helst • Dina uppgifter är säkra
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 bg-stone-900 text-white">
                <div className="max-w-6xl mx-auto text-center">
                    <p className="text-stone-400 text-sm">
                        © 2025 VanPlan. Alla rättigheter förbehållna.
                    </p>
                </div>
            </footer>
        </div>
    );
};

import React, { useState } from 'react';
import { ProjectType, UserSkillLevel } from '@/types/types';
import { Sparkles, Wrench, Hammer, Leaf, Award, User, Zap, CheckCircle2, Loader2, Search, ImageIcon, Trash2, Edit3, ChevronLeft, AlertTriangle } from 'lucide-react';
import { performDeepResearch } from '@/services/aiProxyService';
import { generateVehicleIcon } from '@/services/geminiService';
import { useToasts, ToastContainer } from './Toast';
import type { AIProvider } from '@/services/aiService';
import { ACTIVE_PROMPTS } from '@/config/prompts';

interface OnboardingWizardProps {
    onComplete: (data: OnboardingData) => void;
    onCancel: () => void;
}

export interface OnboardingData {
    projectType: ProjectType;
    userSkillLevel: UserSkillLevel;
    vehicleDescription: string;
    imageBase64?: string;
    nickname?: string;
    additionalNotes?: string;
    aiData?: any; // Full AI response from Cloud Functions Deep Research
    generatedIcon?: string | null; // Generated vehicle icon
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, onCancel }) => {
    const { toasts, removeToast, success, warning, error, info } = useToasts();

    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [isResearching, setIsResearching] = useState(false);
    const [researchStep, setResearchStep] = useState(0);

    // Form data
    const [projectType, setProjectType] = useState<ProjectType | null>(null);
    const [userSkillLevel, setUserSkillLevel] = useState<UserSkillLevel | null>(null);
    const [vehicleDesc, setVehicleDesc] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [nickname, setNickname] = useState('');
    const [additionalNotes, setAdditionalNotes] = useState('');

    // AI suggestions (kommer från STEG 2)
    const [aiSuggestions, setAiSuggestions] = useState<any>(null);
    const [aiProvider, setAiProvider] = useState<AIProvider | null>(null);
    const [aiErrors, setAiErrors] = useState<any[]>([]);

    const researchSteps = [
        "🔍 Analyserar fordonsmodell & RegNr...",
        "⚙️ Hämtar tekniska specifikationer...",
        "📖 Letar efter modell-specifik information...",
        "📝 Skapar projektplan baserat på dina val...",
        "🎨 Genererar ikon...",
        "✅ Färdigställer projektet..."
    ];

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleStep1Continue = () => {
        if (projectType && userSkillLevel) {
            setStep(2);
            // STEG 2 startar automatiskt research om vehicleDesc finns
            if (vehicleDesc.trim() || selectedImage) {
                startResearch();
            }
        }
    };

    const startResearch = async () => {
        setIsResearching(true);

        const stepInterval = setInterval(() => {
            setResearchStep(prev => (prev < researchSteps.length - 1 ? prev + 1 : prev));
        }, 2500);

        try {
            const base64Data = selectedImage ? selectedImage.split(',')[1] : undefined;

            // Get prompts for Deep Research
            const vehicleDataStr = JSON.stringify({ description: vehicleDesc });
            const detectivePrompt = ACTIVE_PROMPTS.agents.detective.text(vehicleDataStr);
            const plannerPrompt = ACTIVE_PROMPTS.agents.planner.text(vehicleDataStr, projectType, userSkillLevel);

            // Run AI analysis via Cloud Functions and icon generation in parallel
            const [aiDataResult, iconResult] = await Promise.allSettled([
                performDeepResearch(
                    vehicleDesc,
                    base64Data,
                    projectType || 'renovation',
                    userSkillLevel || 'intermediate',
                    detectivePrompt,
                    plannerPrompt
                ),
                base64Data ? generateVehicleIcon(base64Data, 2) : Promise.resolve(null)
            ]);

            clearInterval(stepInterval);

            const rawAiData = aiDataResult.status === 'fulfilled' ? aiDataResult.value : { error: 'AI-tjänster otillgängliga' };
            const iconData = iconResult.status === 'fulfilled' ? iconResult.value : null;

            // Map Cloud Functions response to expected format
            const aiData = {
                vehicleData: rawAiData.vehicleData,
                projectName: rawAiData.projectName,
                aiProvider: rawAiData.provider as AIProvider, // Map 'provider' to 'aiProvider'
                error: rawAiData.error,
                initialTasks: rawAiData.initialTasks,
                analysisReport: rawAiData.analysisReport
            };

            // Track which AI provider was used
            if (aiData.aiProvider) {
                setAiProvider(aiData.aiProvider);

                // Show toast based on provider
                if (aiData.aiProvider === 'gemini') {
                    success('✅ Fordonsdata hämtad med Google Gemini');
                } else if (aiData.aiProvider === 'grok') {
                    warning('⚡ Gemini otillgänglig, använder xAI Grok istället');
                } else if (aiData.aiProvider === 'fallback') {
                    error('⚠️ AI-tjänster otillgängliga, använder standarddata');
                }
            }

            // Handle errors if AI failed
            if (aiData.error) {
                warning(`⚠️ ${aiData.error}`);
            }

            // Set AI suggestions for STEG 3
            setAiSuggestions({
                detectedMake: aiData.vehicleData?.make || '',
                detectedModel: aiData.vehicleData?.model || '',
                detectedYear: aiData.vehicleData?.year || '',
                suggestedName: aiData.projectName || vehicleDesc,
                icon: iconData,
                fullAiData: aiData, // Save full data to pass to parent
                aiProvider: aiData.aiProvider, // Track which AI was used
                hasErrors: !!aiData.error
            });

            setIsResearching(false);
            setStep(3);

        } catch (error) {
            console.error('Research failed:', error);
            clearInterval(stepInterval);
            setIsResearching(false);
            alert('Kunde inte hämta fordonsdata. Försök igen.');
            setStep(1); // Go back to step 1
        }
    };

    const handleComplete = () => {
        if (!projectType || !userSkillLevel) return;

        onComplete({
            projectType,
            userSkillLevel,
            vehicleDescription: vehicleDesc,
            imageBase64: selectedImage?.split(',')[1],
            nickname: nickname.trim() || undefined,
            additionalNotes: additionalNotes.trim() || undefined,
            aiData: aiSuggestions?.fullAiData,
            generatedIcon: aiSuggestions?.icon
        });
    };

    return (
        <>
            <ToastContainer toasts={toasts} onRemove={removeToast} />
            <div className="fixed inset-0 bg-nordic-charcoal/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white w-full max-w-2xl p-8 rounded-[40px] shadow-2xl animate-fade-in relative overflow-hidden max-h-[90vh] overflow-y-auto">

                {/* Progress indicator */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-400'}`}>1</div>
                    <div className={`w-16 h-1 ${step >= 2 ? 'bg-teal-500' : 'bg-slate-200'}`}></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-400'}`}>2</div>
                    <div className={`w-16 h-1 ${step >= 3 ? 'bg-teal-500' : 'bg-slate-200'}`}></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 3 ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-400'}`}>3</div>
                </div>

                {/* STEG 1: Projekttyp + Kunskapsnivå */}
                {step === 1 && (
                    <>
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mx-auto mb-4">
                                <Sparkles size={32} />
                            </div>
                            <h2 className="font-serif font-bold text-3xl text-nordic-charcoal mb-2">Starta nytt projekt</h2>
                            <p className="text-slate-500">Berätta om ditt fordon</p>
                        </div>

                        <div className="space-y-8">
                            {/* Projekttyp */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-4 ml-1">Vad är målet?</label>
                                <div className="grid grid-cols-3 gap-4">
                                    <button
                                        onClick={() => setProjectType('renovation')}
                                        className={`p-6 rounded-2xl border-2 transition-all ${projectType === 'renovation' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-teal-200'}`}
                                    >
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                                            <Wrench size={24} className={projectType === 'renovation' ? 'text-teal-600' : 'text-slate-400'} />
                                        </div>
                                        <h3 className="font-bold text-sm text-nordic-charcoal mb-1">Renovering</h3>
                                        <p className="text-xs text-slate-500">Restaurera & Laga</p>
                                    </button>

                                    <button
                                        onClick={() => setProjectType('conversion')}
                                        className={`p-6 rounded-2xl border-2 transition-all ${projectType === 'conversion' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-teal-200'}`}
                                    >
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                                            <Hammer size={24} className={projectType === 'conversion' ? 'text-teal-600' : 'text-slate-400'} />
                                        </div>
                                        <h3 className="font-bold text-sm text-nordic-charcoal mb-1">Ombyggnad</h3>
                                        <p className="text-xs text-slate-500">Van → Camper</p>
                                    </button>

                                    <button
                                        onClick={() => setProjectType('maintenance')}
                                        className={`p-6 rounded-2xl border-2 transition-all ${projectType === 'maintenance' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-teal-200'}`}
                                    >
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                                            <Leaf size={24} className={projectType === 'maintenance' ? 'text-teal-600' : 'text-slate-400'} />
                                        </div>
                                        <h3 className="font-bold text-sm text-nordic-charcoal mb-1">Förvaltning</h3>
                                        <p className="text-xs text-slate-500">Underhålla & Service</p>
                                    </button>
                                </div>
                            </div>

                            {/* Kunskapsnivå */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-4 ml-1">Din erfarenhet av bilmekanik</label>
                                <div className="grid grid-cols-3 gap-4">
                                    <button
                                        onClick={() => setUserSkillLevel('beginner')}
                                        className={`p-6 rounded-2xl border-2 transition-all ${userSkillLevel === 'beginner' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-teal-200'}`}
                                    >
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                                            <User size={24} className={userSkillLevel === 'beginner' ? 'text-teal-600' : 'text-slate-400'} />
                                        </div>
                                        <h3 className="font-bold text-sm text-nordic-charcoal mb-1">Nybörjare</h3>
                                        <p className="text-xs text-slate-500">"Aldrig fixat"</p>
                                    </button>

                                    <button
                                        onClick={() => setUserSkillLevel('intermediate')}
                                        className={`p-6 rounded-2xl border-2 transition-all ${userSkillLevel === 'intermediate' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-teal-200'}`}
                                    >
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                                            <Zap size={24} className={userSkillLevel === 'intermediate' ? 'text-teal-600' : 'text-slate-400'} />
                                        </div>
                                        <h3 className="font-bold text-sm text-nordic-charcoal mb-1">Hemmameck</h3>
                                        <p className="text-xs text-slate-500">"Gör själv"</p>
                                    </button>

                                    <button
                                        onClick={() => setUserSkillLevel('expert')}
                                        className={`p-6 rounded-2xl border-2 transition-all ${userSkillLevel === 'expert' ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-teal-200'}`}
                                    >
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                                            <Award size={24} className={userSkillLevel === 'expert' ? 'text-teal-600' : 'text-slate-400'} />
                                        </div>
                                        <h3 className="font-bold text-sm text-nordic-charcoal mb-1">Certifierad</h3>
                                        <p className="text-xs text-slate-500">"Proffsig"</p>
                                    </button>
                                </div>
                                {userSkillLevel && (
                                    <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                        <p className="text-sm text-blue-800">
                                            <strong>💬 Detta påverkar:</strong>
                                            {userSkillLevel === 'beginner' && " Elton ger detaljerade guider, förklarar termer, och rekommenderar verkstad för svåra uppgifter."}
                                            {userSkillLevel === 'intermediate' && " Elton ger balanserade tips och föreslår både DIY och verkstad beroende på svårighet."}
                                            {userSkillLevel === 'expert' && " Elton ger kortfattad teknisk info och antar att du vet vad du gör."}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Fordonsbeskrivning */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Fordonsbeskrivning, Länk eller RegNr</label>
                                <textarea
                                    className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all min-h-[100px] text-lg text-nordic-charcoal placeholder:text-slate-300"
                                    placeholder="t.ex. 'ABC123' eller 'Volvo 240 1988'..."
                                    value={vehicleDesc}
                                    onChange={e => setVehicleDesc(e.target.value)}
                                />
                            </div>

                            {/* Bild upload */}
                            <div className="space-y-3">
                                <label className="flex items-center space-x-3 cursor-pointer p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 hover:border-teal-400 hover:bg-teal-50 transition-all">
                                    <div className="p-2 bg-white rounded-xl text-slate-400">
                                        <ImageIcon size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <span className="block text-sm font-bold text-nordic-charcoal">Ladda upp bild (valfritt)</span>
                                        <span className="text-xs text-slate-400">Elton läser av RegNr och skapar en ikon</span>
                                    </div>
                                    {selectedImage && <CheckCircle2 size={20} className="text-green-500" />}
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                </label>

                                {selectedImage && (
                                    <div className="relative p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                        <div className="flex items-center gap-3">
                                            <img src={selectedImage} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-slate-200" />
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-nordic-charcoal">Bild uppladdad</p>
                                                <p className="text-xs text-slate-400">Imagen 3.0 kommer skapa en ikon</p>
                                            </div>
                                            <button onClick={() => setSelectedImage(null)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Knappar */}
                            <div className="flex gap-3 pt-4">
                                <button onClick={onCancel} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors">
                                    Avbryt
                                </button>
                                <button
                                    onClick={handleStep1Continue}
                                    disabled={!projectType || !userSkillLevel || (!vehicleDesc.trim() && !selectedImage)}
                                    className="flex-[2] py-4 bg-nordic-charcoal text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                                >
                                    <Search size={20} /> Starta Research
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* STEG 2: Research (Loading) */}
                {step === 2 && isResearching && (
                    <div className="text-center py-8">
                        <div className="relative w-20 h-20 mx-auto mb-6">
                            <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-teal-600">
                                <Search size={24} />
                            </div>
                        </div>
                        <h3 className="font-serif font-bold text-2xl text-nordic-charcoal mb-2">Research pågår...</h3>
                        <p className="text-slate-400 text-sm mb-8">Elton analyserar ditt {projectType === 'renovation' ? 'renoverings' : projectType === 'conversion' ? 'ombyggnads' : 'underhålls'}-projekt</p>

                        <div className="space-y-3 text-left max-w-sm mx-auto">
                            {researchSteps.map((stepText, idx) => (
                                <div key={idx} className={`flex items-center gap-3 transition-all duration-500 ${idx <= researchStep ? 'opacity-100' : 'opacity-30 translate-y-2'}`}>
                                    {idx < researchStep ? (
                                        <CheckCircle2 size={20} className="text-green-500" />
                                    ) : idx === researchStep ? (
                                        <Loader2 size={20} className="text-teal-500 animate-spin" />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                                    )}
                                    <span className={`font-medium text-sm ${idx === researchStep ? 'text-teal-700' : 'text-slate-600'}`}>{stepText}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEG 3: Granska & Komplettera */}
                {step === 3 && (
                    <>
                        <div className="text-center mb-6">
                            <h2 className="font-serif font-bold text-2xl text-nordic-charcoal mb-1">Granska & Komplettera</h2>
                            <p className="text-slate-500">Justera det som behövs innan projektet skapas</p>
                        </div>

                        <div className="space-y-6">
                            {/* Projektnamn */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Projektnamn</label>
                                <input
                                    type="text"
                                    value={vehicleDesc}
                                    onChange={e => setVehicleDesc(e.target.value)}
                                    className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-lg text-nordic-charcoal"
                                />
                                {aiSuggestions?.suggestedName && (
                                    <p className="text-xs text-slate-400 mt-2 ml-1">💡 AI-förslag: "{aiSuggestions.suggestedName}"</p>
                                )}
                            </div>

                            {/* Smeknamn */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Smeknamn (valfritt)</label>
                                <input
                                    type="text"
                                    value={nickname}
                                    onChange={e => setNickname(e.target.value)}
                                    placeholder="t.ex. 'Pärlan', 'Besten', 'Veteranen'..."
                                    className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-lg text-nordic-charcoal placeholder:text-slate-300"
                                />
                                <p className="text-xs text-slate-500 mt-2 ml-1">💬 Detta blir Eltons personlighet när ni chattar!</p>
                            </div>

                            {/* Fria anteckningar */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Fria anteckningar (valfritt)</label>
                                <textarea
                                    value={additionalNotes}
                                    onChange={e => setAdditionalNotes(e.target.value)}
                                    placeholder="T.ex. 'Har bytt kamrem 2023', 'Lite rost i höger bakskärm', 'Motorn går bra men avgassystemet är rostigt'..."
                                    className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all min-h-[120px] text-lg text-nordic-charcoal placeholder:text-slate-300"
                                />
                                <p className="text-xs text-slate-500 mt-2 ml-1">💬 Detta skickas till AI:n som kontext för att skapa bättre uppgifter</p>
                            </div>

                            {/* Info om vad som händer */}
                            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-6">
                                <h4 className="font-bold text-sm text-teal-900 mb-3">🤖 Elton kommer att:</h4>
                                <ul className="space-y-2 text-sm text-teal-800">
                                    <li className="flex gap-2">
                                        <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                                        <span>Skapa en projektplan baserat på <strong>{projectType === 'renovation' ? 'renovering' : projectType === 'conversion' ? 'ombyggnad' : 'underhåll'}</strong></span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                                        <span>Anpassa kommunikation efter din erfarenhet (<strong>{userSkillLevel === 'beginner' ? 'Nybörjare' : userSkillLevel === 'intermediate' ? 'Hemmameck' : 'Certifierad'}</strong>)</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                                        <span>Föreslå uppgifter du kan göra själv vs. leja ut till verkstad</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                                        <span>Finnas där för att chatta och hjälpa dig planera mer i detalj</span>
                                    </li>
                                </ul>

                                {/* Show which AI was used */}
                                {aiSuggestions?.aiProvider && (
                                    <div className="mt-4 pt-4 border-t border-teal-200">
                                        <div className="flex items-start gap-2">
                                            {aiSuggestions.aiProvider === 'gemini' && <Sparkles size={14} className="text-teal-600 shrink-0 mt-0.5" />}
                                            {aiSuggestions.aiProvider === 'grok' && <Zap size={14} className="text-purple-600 shrink-0 mt-0.5" />}
                                            {aiSuggestions.aiProvider === 'fallback' && <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />}
                                            <div>
                                                <p className="text-xs font-medium text-teal-700">
                                                    {aiSuggestions.aiProvider === 'gemini' && 'Powered by Google Gemini'}
                                                    {aiSuggestions.aiProvider === 'grok' && 'Powered by xAI Grok'}
                                                    {aiSuggestions.aiProvider === 'fallback' && 'Standarddata används'}
                                                </p>
                                                {aiSuggestions.hasErrors && (
                                                    <p className="text-xs text-amber-600 mt-1">
                                                        Data kan vara inkomplett - kontrollera fordonsinformation
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Knappar */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-6 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors flex items-center gap-2"
                                >
                                    <ChevronLeft size={20} /> Tillbaka
                                </button>
                                <button
                                    onClick={handleComplete}
                                    className="flex-1 py-4 bg-teal-500 text-white font-bold rounded-2xl hover:bg-teal-600 transition-all shadow-lg shadow-teal-200 flex items-center justify-center gap-2"
                                >
                                    <Sparkles size={20} /> Skapa Projekt!
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
            </div>
        </>
    );
};

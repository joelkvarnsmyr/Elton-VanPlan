
import React, { useState } from 'react';
import { Sparkles, Search, ImageIcon, Trash2, CheckCircle2, Loader2, Info } from 'lucide-react';
import { generateProjectProfile, generateVehicleIcon } from '@/services/geminiService';
import { useToasts, ToastContainer } from './Toast';
import type { AIProvider } from '@/services/aiService';

interface OnboardingWizardV2Props {
    onComplete: (data: OnboardingV2Data) => void;
    onCancel: () => void;
}

export interface OnboardingV2Data {
    vehicleDescription: string;
    imageBase64?: string;
    aiData?: any; // Full AI response from generateProjectProfile
    generatedIcon?: string | null; // Generated vehicle icon
}

const Disclaimer = () => (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl p-4 mt-6">
        <div className="flex items-start gap-3">
            <Info size={20} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
                <h4 className="font-bold text-blue-800 dark:text-blue-300">Ett litet meddelande från verkstan:</h4>
                <p className="text-sm text-blue-700 dark:text-blue-400/80 mt-1">Elton gör sitt bästa för att hämta korrekt data, men ibland kan det smyga sig in ett fel. Dubbelkolla alltid kritisk information! Om du hittar något som inte stämmer, blir vi superglada om du rapporterar det till oss. Tillsammans gör vi Elton smartare!</p>
            </div>
        </div>
    </div>
);

export const OnboardingWizardV2: React.FC<OnboardingWizardV2Props> = ({ onComplete, onCancel }) => {
    const { toasts, removeToast, error } = useToasts();

    const [isResearching, setIsResearching] = useState(false);
    const [researchStep, setResearchStep] = useState(0);

    // Form data
    const [vehicleDesc, setVehicleDesc] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const researchSteps = [
        "🔍 Analyserar fordonsmodell & RegNr...",
        "⚙️ Hämtar tekniska specifikationer...",
        "📖 Letar efter modell-specifik information...",
        "📝 Skapar grundstruktur...",
        "🎨 Genererar ikon...",
        "✅ Förbereder Elton..."
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

    const handleStart = async () => {
        if (!vehicleDesc.trim() && !selectedImage) return;

        setIsResearching(true);
        setResearchStep(0);

        // Slow down the progress to match realistic AI timing (Deep Research takes ~30-60s)
        const stepInterval = setInterval(() => {
            setResearchStep(prev => {
                if (prev >= researchSteps.length - 2) {
                    return 2; // Loop back to "Letar information..."
                }
                return prev + 1;
            });
        }, 5000); // 5 seconds per step

        try {
            const base64Data = selectedImage ? selectedImage.split(',')[1] : undefined;

            // Use 'renovation' as default type just for research purposes
            const [aiDataResult, iconResult] = await Promise.allSettled([
                generateProjectProfile(vehicleDesc, base64Data, 'renovation'),
                base64Data ? generateVehicleIcon({ imageBase64: base64Data }, 2) : Promise.resolve(null)
            ]);

            clearInterval(stepInterval);
            setResearchStep(researchSteps.length - 1); // Jump to "Done"

            // Give the user a moment to see the "Done" state
            await new Promise(resolve => setTimeout(resolve, 800));

            const aiData = aiDataResult.status === 'fulfilled' ? aiDataResult.value : {};

            // Handle errors if AI failed (critical failure)
            if (aiData.error && !aiData.vehicleData?.make) {
                throw new Error(aiData.error);
            }

            // Remove hardcoded phases/tasks if any, since we want to create them in chat
            if (aiData.initialTasks) aiData.initialTasks = [];

            // Complete immediately
            onComplete({
                vehicleDescription: vehicleDesc,
                imageBase64: base64Data,
                aiData: aiData,
                generatedIcon: iconResult.status === 'fulfilled' ? iconResult.value : null
            });

        } catch (err: any) {
            console.error('Research failed:', err);
            clearInterval(stepInterval);
            setIsResearching(false);
            error('Hoppsan! Något gick fel. Försök igen eller fyll i manuellt.');
        }
    };

    return (
        <>
            <ToastContainer toasts={toasts} onRemove={removeToast} />
            <div className="fixed inset-0 bg-nordic-charcoal/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white w-full max-w-2xl p-8 rounded-[40px] shadow-2xl animate-fade-in relative overflow-hidden max-h-[90vh] overflow-y-auto">

                    {/* Content */}
                    {!isResearching ? (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mx-auto mb-4">
                                    <Sparkles size={32} />
                                </div>
                                <h2 className="font-serif font-bold text-3xl text-nordic-charcoal mb-2">Vad jobbar vi med?</h2>
                                <p className="text-slate-500">Beskriv ditt fordon så hjälper Elton dig igång</p>
                            </div>

                            <div className="space-y-8">
                                {/* Fordonsbeskrivning */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Fordonsbeskrivning, Länk eller RegNr</label>
                                    <textarea
                                        className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all min-h-[100px] text-lg text-nordic-charcoal placeholder:text-slate-300"
                                        placeholder="t.ex. 'ABC123' eller 'Volvo 240 1988'..."
                                        value={vehicleDesc}
                                        onChange={e => setVehicleDesc(e.target.value)}
                                        autoFocus
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
                                            <span className="text-xs text-slate-400">Hjälper Elton identifiera modellen</span>
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
                                                    <p className="text-xs text-slate-400">Vi använder denna för analys</p>
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
                                        onClick={handleStart}
                                        disabled={!vehicleDesc.trim() && !selectedImage}
                                        className="flex-[2] py-4 bg-nordic-charcoal text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                                    >
                                        <Search size={20} /> Starta
                                    </button>
                                </div>

                                <Disclaimer />
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="relative w-20 h-20 mx-auto mb-6">
                                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center text-teal-600">
                                    <Search size={24} />
                                </div>
                            </div>
                            <h3 className="font-serif font-bold text-2xl text-nordic-charcoal mb-2">Analyserar fordonet...</h3>
                            <p className="text-slate-400 text-sm mb-8">Elton samlar information för att kunna hjälpa dig</p>

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
                </div>
            </div>
        </>
    );
};

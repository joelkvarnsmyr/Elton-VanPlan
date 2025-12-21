import React from 'react';
import { X, Shield, Lock, FileText } from 'lucide-react';

interface PolicyModalProps {
    onClose: () => void;
    activeTab?: 'gdpr' | 'terms';
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ onClose, activeTab = 'gdpr' }) => {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0">
                    <div className="flex items-center gap-2">
                        <Shield className="text-slate-700" size={20} />
                        <h3 className="font-bold text-slate-800">Integritet & Villkor</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors" aria-label="Stäng">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto prose prose-slate max-w-none">
                    <section className="mb-8">
                        <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 mb-4">
                            <Lock className="text-teal-600" size={24} />
                            Personuppgiftspolicy (GDPR)
                        </h2>
                        <p className="text-slate-600 mb-4">
                            Din integritet är viktig för oss på The VanPlan. Denna policy beskriver hur vi samlar in, använder och skyddar dina personuppgifter.
                        </p>

                        <h4 className="font-semibold text-slate-900 mt-6 mb-2">Vad vi samlar in</h4>
                        <ul className="list-disc pl-5 text-slate-600 space-y-1">
                            <li>E-postadress (för väntelista och inloggning)</li>
                            <li>Namn (frivilligt)</li>
                            <li>Information om ditt fordon (som du själv lägger in)</li>
                            <li>Feedback och supportärenden</li>
                        </ul>

                        <h4 className="font-semibold text-slate-900 mt-6 mb-2">Hur vi använder datan</h4>
                        <p className="text-slate-600 mb-4">
                            Vi använder informationen för att tillhandahålla tjänsten, förbättra användarupplevelsen och kommunicera med dig om uppdateringar. Vi säljer <strong>aldrig</strong> dina uppgifter till tredje part.
                        </p>

                        <h4 className="font-semibold text-slate-900 mt-6 mb-2">Dina rättigheter</h4>
                        <p className="text-slate-600 mb-4">
                            Enligt GDPR har du rätt att begära utdrag av din data, få den rättad, eller raderad ("rätten att bli bortglömd"). Kontakta oss via feedback-formuläret om du vill utöva dessa rättigheter.
                        </p>
                    </section>

                    <div className="border-t border-slate-100 my-8"></div>

                    <section>
                        <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 mb-4">
                            <FileText className="text-teal-600" size={24} />
                            Användarvillkor
                        </h2>
                        <p className="text-slate-600 mb-4">
                            VanPlan befinner sig i en <strong>experimentell fas (Beta)</strong>. Genom att använda tjänsten godkänner du följande:
                        </p>

                        <ol className="list-decimal pl-5 text-slate-600 space-y-2">
                            <li>
                                <strong>Ingen garanti:</strong> Tjänsten tillhandahålls i befintligt skick. Vi reserverar oss för eventuella tekniska fel eller databortfall, även om vi gör vårt yttersta för att skydda din data.
                            </li>
                            <li>
                                <strong>AI-rådgivning:</strong> Tjänsten använder Artificiell Intelligens för att ge råd om mekanik och byggnation. Dessa råd ska ses som <em>vägledande</em>. Dubbelkolla alltid kritiska moment mot en officiell verkstadshandbok eller konsultera en fackman. Vi ansvarar inte för skador som uppstår till följd av felaktig tillämpning av råd.
                            </li>
                            <li>
                                <strong>Rättvis användning:</strong> Du får inte använda tjänsten för att sprida skadlig kod, spam eller olagligt innehåll.
                            </li>
                        </ol>
                    </section>
                </div>
            </div>
        </div>
    );
};

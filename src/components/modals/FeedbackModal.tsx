import React, { useState } from 'react';
import { X, MessageSquare, Bug, Lightbulb, Send, Loader2, Check } from 'lucide-react';
import { db } from '@/services/db';
import { collection, addDoc } from 'firebase/firestore';

interface FeedbackModalProps {
    onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose }) => {
    const [type, setType] = useState<'bug' | 'feature' | 'other'>('bug');
    const [description, setDescription] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await addDoc(collection(db, 'feedback'), {
                type,
                description,
                email: email || 'anonymous',
                timestamp: new Date().toISOString(),
                status: 'new',
                userAgent: navigator.userAgent
            });
            setSubmitted(true);
            setTimeout(() => {
                onClose();
            }, 2500);
        } catch (err) {
            console.error(err);
            setError('Kunde inte skicka feedback. Försök igen senare.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="text-green-600" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Tack för din feedback!</h3>
                    <p className="text-slate-600">Vi uppskattar din hjälp att göra VanPlan bättre.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="text-slate-700" size={20} />
                        <h3 className="font-bold text-slate-800">Skicka Feedback</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors" aria-label="Stäng">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">Vad gäller det?</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setType('bug')}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${type === 'bug'
                                        ? 'border-rose-500 bg-rose-50 text-rose-700'
                                        : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                                        }`}
                                >
                                    <Bug size={24} />
                                    <span className="font-semibold text-sm">Rapportera fel</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('feature')}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${type === 'feature'
                                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                                        : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'
                                        }`}
                                >
                                    <Lightbulb size={24} />
                                    <span className="font-semibold text-sm">Önskemål / Idé</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Beskrivning</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                rows={4}
                                placeholder={type === 'bug' ? "Vad hände? Hur kan vi återskapa felet?" : "Beskriv din idé..."}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-slate-400 text-slate-800"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">E-post (valfritt)</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Om du vill att vi återkommer"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-slate-400 text-slate-800"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-lg">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting || !description.trim()}
                            className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            Skicka
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

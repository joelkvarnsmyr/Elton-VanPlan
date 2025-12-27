/**
 * LiveInspector - Live voice-guided vehicle inspection
 * 
 * Uses Gemini Live API for real-time audio conversation with AI.
 * Guides user through inspection zones with follow-up questions.
 * Outputs structured DetailedInspection format.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import {
    Mic, MicOff, Video, VideoOff, PhoneOff, Loader2,
    ClipboardCheck, ChevronRight, Check, AlertTriangle,
    Map, Save, Pause, Play
} from 'lucide-react';
import { Project } from '@/types/types';
import type { DetailedInspection, DetailedInspectionArea, DetailedInspectionFinding } from '@/types/inspection';
import { v4 as uuidv4 } from 'uuid';

interface LiveInspectorProps {
    project: Project;
    onClose: () => void;
    onInspectionComplete: (inspection: DetailedInspection) => void;
}

/**
 * Standard inspection zones based on manual inspection template
 */
const INSPECTION_ZONES = [
    { id: 1, name: 'Taket', icon: '🏠', tips: ['Titta efter sprickor', 'Kolla tätningar', 'Notera eventuell rost'] },
    { id: 2, name: 'Vänster sida', icon: '⬅️', tips: ['Förardörr', 'Karosseri', 'Hjulhus'] },
    { id: 3, name: 'Baksidan', icon: '🔙', tips: ['Bakdörrar/lucka', 'Belysning', 'Stötfångare'] },
    { id: 4, name: 'Höger sida', icon: '➡️', tips: ['Passagerarsida', 'Skjutdörr', 'Karosseri'] },
    { id: 5, name: 'Framsidan', icon: '🚗', tips: ['Motorhuv', 'Grill', 'Strålkastare'] },
    { id: 6, name: 'Underrede', icon: '🔧', tips: ['Balkar', 'Avgassystem', 'Bränsletank'] },
    { id: 7, name: 'Motor', icon: '⚙️', tips: ['Vätskenivåer', 'Slangar', 'Motorljud'] },
    { id: 8, name: 'Elsystem', icon: '⚡', tips: ['Batteri', 'Kablar', 'Lampor'] },
    { id: 9, name: 'Interiör', icon: '🪑', tips: ['Säten', 'Instrumentpanel', 'Golv'] },
];

// Audio Utils
function base64ToUint8Array(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

const INSPECTOR_SYSTEM_PROMPT = `Du är ELTON, en erfaren mekaniker som guidar användaren genom en fordonsbesiktning.

DIN ROLL:
- Vägled användaren genom varje område av bilen
- Ställ FÖLJDFRÅGOR för att få detaljerad information
- Bekräfta vad du förstått
- Kategorisera fynd som "Anmärkning" eller "Positivt"

INSPEKTIONSTEKNIK:
1. Be användaren beskriva vad de ser
2. Ställ specifika följdfrågor: "Finns det bubblor under lacken?", "Känns det mjukt när du trycker?"
3. Bekräfta allvarlighetsgrad
4. Gå vidare till nästa punkt

VIKTIGA FÖLJDFRÅGOR:
- Rost: "Är det ytrost eller känns det genomgående?"
- Sprickor: "Är det i lacken eller går det djupare?"
- Läckage: "Vilken färg har vätskan? Känner du någon lukt?"
- Ljud: "Kommer det från motorn eller längre bak?"

SVARA ALLTID PÅ SVENSKA.
Var kortfattad - max 2-3 meningar per svar i live-konversation.
När användaren beskriver ett fynd, bekräfta det och fråga om detaljer.

NUVARANDE ZON: {ZONE_NAME}
TIPS FÖR DENNA ZON: {ZONE_TIPS}
`;

export const LiveInspector: React.FC<LiveInspectorProps> = ({
    project,
    onClose,
    onInspectionComplete
}) => {
    // Connection state
    const [isConnected, setIsConnected] = useState(false);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [volumeLevel, setVolumeLevel] = useState(0);
    const [statusMessage, setStatusMessage] = useState("Förbereder inspektion...");

    // Inspection state
    const [currentZoneIndex, setCurrentZoneIndex] = useState(0);
    const [completedZones, setCompletedZones] = useState<number[]>([]);
    const [findings, setFindings] = useState<DetailedInspectionFinding[]>([]);
    const [showZoneSelector, setShowZoneSelector] = useState(true);
    const [transcript, setTranscript] = useState<string[]>([]);

    const currentZone = INSPECTION_ZONES[currentZoneIndex];

    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const audioQueueRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const videoIntervalRef = useRef<number | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const sessionRef = useRef<any>(null);

    const startSession = useCallback(async () => {
        try {
            const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
            if (!apiKey) {
                setStatusMessage("API-nyckel saknas. Kontakta administratör.");
                return;
            }

            const ai = new GoogleGenAI({ apiKey });
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            mediaStreamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                videoRef.current.muted = true;
            }

            // Build zone-specific prompt
            const zonePrompt = INSPECTOR_SYSTEM_PROMPT
                .replace('{ZONE_NAME}', currentZone.name)
                .replace('{ZONE_TIPS}', currentZone.tips.join(', '));

            const fullSystemInstruction = `${zonePrompt}

FORDON: ${project.vehicleData.make} ${project.vehicleData.model} (${project.vehicleData.year})

INSTRUKTIONER FÖR LIVE-LÄGE:
1. Svara kortfattat (max 2-3 meningar)
2. Om kameran är på, referera till vad du ser
3. Ställ följdfrågor för att förstå problem bättre
4. När ett område är klart, säg "Vi kan gå vidare till nästa område"
`;

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.0-flash-exp',
                config: {
                    responseModalities: [Modality.AUDIO],
                    systemInstruction: fullSystemInstruction,
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
                    }
                },
                callbacks: {
                    onopen: () => {
                        setIsConnected(true);
                        setStatusMessage(`Inspekterar: ${currentZone.name}`);
                        setupAudioInput(stream, sessionPromise);
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        handleServerMessage(msg);
                    },
                    onclose: () => {
                        setIsConnected(false);
                    },
                    onerror: (err) => {
                        console.error("Live Error", err);
                        setStatusMessage("Anslutningsfel. Försök igen.");
                    }
                }
            });

            sessionRef.current = sessionPromise;

        } catch (err) {
            console.error("Failed to start session:", err);
            setStatusMessage("Kunde inte starta. Kolla behörigheter.");
        }
    }, [currentZone, project]);

    const setupAudioInput = (stream: MediaStream, sessionPromise: Promise<any>) => {
        if (!audioContextRef.current) return;

        const inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const source = inputContext.createMediaStreamSource(stream);
        const processor = inputContext.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = (e) => {
            if (!isMicOn || isPaused) return;

            const inputData = e.inputBuffer.getChannelData(0);

            let sum = 0;
            for (let i = 0; i < inputData.length; i++) {
                sum += inputData[i] * inputData[i];
            }
            setVolumeLevel(Math.sqrt(sum / inputData.length));

            const pcmData = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
                const s = Math.max(-1, Math.min(1, inputData[i]));
                pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }

            const base64Audio = arrayBufferToBase64(pcmData.buffer);

            sessionPromise.then(session => {
                session.sendRealtimeInput({
                    media: {
                        mimeType: 'audio/pcm;rate=16000',
                        data: base64Audio
                    }
                });
            });
        };

        source.connect(processor);
        processor.connect(inputContext.destination);

        inputSourceRef.current = source;
        processorRef.current = processor;
    };

    const handleServerMessage = async (message: LiveServerMessage) => {
        const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
        if (audioData && audioContextRef.current) {
            const ctx = audioContextRef.current;
            const audioBytes = base64ToUint8Array(audioData);

            const float32Data = new Float32Array(audioBytes.length / 2);
            const dataView = new DataView(audioBytes.buffer);

            for (let i = 0; i < float32Data.length; i++) {
                const int16 = dataView.getInt16(i * 2, true);
                float32Data[i] = int16 / 32768.0;
            }

            const audioBuffer = ctx.createBuffer(1, float32Data.length, 24000);
            audioBuffer.getChannelData(0).set(float32Data);

            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);

            const now = ctx.currentTime;
            const start = Math.max(now, nextStartTimeRef.current);
            source.start(start);
            nextStartTimeRef.current = start + audioBuffer.duration;

            audioQueueRef.current.add(source);
            source.onended = () => audioQueueRef.current.delete(source);
        }
    };

    const stopSession = useCallback(() => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (processorRef.current) processorRef.current.disconnect();
        if (inputSourceRef.current) inputSourceRef.current.disconnect();
        if (audioContextRef.current) audioContextRef.current.close();
        if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);

        setIsConnected(false);
    }, []);

    // Start session when zone changes
    useEffect(() => {
        if (!showZoneSelector) {
            startSession();
        }
        return () => stopSession();
    }, [currentZoneIndex, showZoneSelector, startSession, stopSession]);

    // Video frame sending
    useEffect(() => {
        if (isVideoOn && isConnected && !isPaused) {
            videoIntervalRef.current = window.setInterval(() => {
                if (!canvasRef.current || !videoRef.current) return;

                const ctx = canvasRef.current.getContext('2d');
                if (ctx && videoRef.current.videoWidth) {
                    canvasRef.current.width = videoRef.current.videoWidth / 4;
                    canvasRef.current.height = videoRef.current.videoHeight / 4;
                    ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

                    const base64Image = canvasRef.current.toDataURL('image/jpeg', 0.5).split(',')[1];

                    if (sessionRef.current) {
                        sessionRef.current.then((session: any) => {
                            session.sendRealtimeInput({
                                media: { mimeType: 'image/jpeg', data: base64Image }
                            });
                        });
                    }
                }
            }, 1000);
        } else {
            if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
        }
        return () => {
            if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
        };
    }, [isVideoOn, isConnected, isPaused]);

    const handleNextZone = () => {
        setCompletedZones(prev => [...prev, currentZoneIndex]);
        stopSession();

        if (currentZoneIndex < INSPECTION_ZONES.length - 1) {
            setCurrentZoneIndex(prev => prev + 1);
        } else {
            // All zones complete - generate inspection report
            handleCompleteInspection();
        }
    };

    const handleCompleteInspection = () => {
        const areas: DetailedInspectionArea[] = INSPECTION_ZONES.map((zone, index) => ({
            areaId: zone.id,
            name: zone.name,
            findings: findings.filter(f => f.id.toString().startsWith(`${zone.id}-`)),
            summary: {
                negative: findings.filter(f => f.id.toString().startsWith(`${zone.id}-`) && f.category === 'Anmärkning').length,
                positive: findings.filter(f => f.id.toString().startsWith(`${zone.id}-`) && f.category === 'Positivt').length
            }
        }));

        const inspection: DetailedInspection = {
            id: uuidv4(),
            projectId: project.id,
            date: new Date().toISOString().split('T')[0],
            inspectors: ['Live-inspektion med Elton'],
            type: 'Röstguidad inspektion',
            areas,
            statistics: {
                total: findings.length,
                negative: findings.filter(f => f.category === 'Anmärkning').length,
                positive: findings.filter(f => f.category === 'Positivt').length
            }
        };

        onInspectionComplete(inspection);
    };

    // Zone selector view
    if (showZoneSelector) {
        return (
            <div className="fixed inset-0 z-50 bg-nordic-charcoal flex flex-col">
                <div className="p-6 border-b border-nordic-dark-surface">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-white font-serif font-bold text-2xl flex items-center gap-3">
                                <ClipboardCheck className="text-teal-400" size={28} />
                                Live Inspektion
                            </h1>
                            <p className="text-slate-400 mt-1">
                                {project.vehicleData.make} {project.vehicleData.model} ({project.vehicleData.year})
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 bg-nordic-dark-surface rounded-full text-slate-400 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <h2 className="text-white font-bold mb-4">Välj startområde</h2>
                    <div className="grid grid-cols-1 gap-3">
                        {INSPECTION_ZONES.map((zone, index) => (
                            <button
                                key={zone.id}
                                onClick={() => {
                                    setCurrentZoneIndex(index);
                                    setShowZoneSelector(false);
                                }}
                                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${completedZones.includes(index)
                                        ? 'bg-teal-900/30 border-teal-600 text-teal-300'
                                        : 'bg-nordic-dark-surface border-nordic-charcoal text-white hover:border-teal-500'
                                    }`}
                            >
                                <span className="text-2xl">{zone.icon}</span>
                                <div className="flex-1 text-left">
                                    <span className="font-bold block">{zone.name}</span>
                                    <span className="text-xs text-slate-400">{zone.tips.join(' • ')}</span>
                                </div>
                                {completedZones.includes(index) ? (
                                    <Check className="text-teal-400" size={20} />
                                ) : (
                                    <ChevronRight className="text-slate-500" size={20} />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {completedZones.length > 0 && (
                    <div className="p-6 border-t border-nordic-dark-surface">
                        <button
                            onClick={handleCompleteInspection}
                            className="w-full py-4 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-500 transition-colors flex items-center justify-center gap-2"
                        >
                            <Save size={20} />
                            Avsluta inspektion ({completedZones.length}/{INSPECTION_ZONES.length} områden)
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // Live inspection view
    return (
        <div className="fixed inset-0 z-50 bg-nordic-charcoal flex flex-col">
            <canvas ref={canvasRef} className="hidden" />

            {/* Header with zone info */}
            <div className="bg-nordic-dark-surface p-4 border-b border-nordic-charcoal">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{currentZone.icon}</span>
                        <div>
                            <h2 className="text-white font-bold">{currentZone.name}</h2>
                            <p className="text-xs text-slate-400">
                                Område {currentZoneIndex + 1} av {INSPECTION_ZONES.length}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowZoneSelector(true)}
                        className="p-2 bg-nordic-charcoal rounded-full text-slate-400 hover:text-white"
                    >
                        <Map size={20} />
                    </button>
                </div>

                {/* Tips */}
                <div className="mt-3 flex flex-wrap gap-2">
                    {currentZone.tips.map((tip, i) => (
                        <span key={i} className="px-2 py-1 bg-nordic-charcoal rounded-full text-xs text-slate-300">
                            {tip}
                        </span>
                    ))}
                </div>
            </div>

            {/* Video/Audio visualization */}
            <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                {isVideoOn ? (
                    <video
                        ref={videoRef}
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                        muted
                        playsInline
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-nordic-charcoal to-black flex items-center justify-center">
                        <div className="relative">
                            <div
                                className="w-40 h-40 bg-teal-600 rounded-full blur-[50px] transition-all duration-100 ease-out absolute top-1/2 left-1/2"
                                style={{ transform: `translate(-50%, -50%) scale(${1 + volumeLevel * 3})` }}
                            />
                            <div className="w-32 h-32 bg-nordic-dark-surface rounded-full flex items-center justify-center relative z-10 border-4 border-teal-500 shadow-2xl">
                                <ClipboardCheck size={48} className={`text-teal-500 ${isConnected ? 'animate-pulse' : ''}`} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Status */}
                <div className="absolute top-6 left-0 right-0 flex justify-center z-10">
                    <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/10">
                        {isConnected ? (
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        ) : (
                            <Loader2 size={14} className="text-amber-500 animate-spin" />
                        )}
                        <span className="text-white text-xs font-medium">{statusMessage}</span>
                    </div>
                </div>

                {/* Findings count */}
                {findings.length > 0 && (
                    <div className="absolute bottom-6 left-6 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                        <span className="text-white text-sm font-medium">
                            {findings.length} fynd registrerade
                        </span>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="bg-nordic-dark-surface p-6 pb-8 border-t border-nordic-charcoal">
                <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
                    <button
                        onClick={() => setIsVideoOn(!isVideoOn)}
                        className={`p-4 rounded-full transition-all ${isVideoOn ? 'bg-white text-nordic-charcoal' : 'bg-nordic-charcoal text-white hover:bg-slate-700'}`}
                    >
                        {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
                    </button>

                    <button
                        onClick={() => setIsPaused(!isPaused)}
                        className={`p-4 rounded-full transition-all ${isPaused ? 'bg-amber-500 text-white' : 'bg-nordic-charcoal text-white hover:bg-slate-700'}`}
                    >
                        {isPaused ? <Play size={24} /> : <Pause size={24} />}
                    </button>

                    <button
                        onClick={handleNextZone}
                        className="px-6 py-4 bg-teal-600 rounded-full text-white font-bold hover:bg-teal-500 transition-all flex items-center gap-2"
                    >
                        Nästa område
                        <ChevronRight size={20} />
                    </button>

                    <button
                        onClick={() => setIsMicOn(!isMicOn)}
                        className={`p-4 rounded-full transition-all ${isMicOn ? 'bg-white text-nordic-charcoal' : 'bg-nordic-charcoal text-rose-500 hover:bg-slate-700'}`}
                    >
                        {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
                    </button>

                    <button
                        onClick={onClose}
                        className="p-4 bg-rose-500 rounded-full text-white hover:bg-rose-600 transition-all"
                    >
                        <PhoneOff size={24} />
                    </button>
                </div>

                <p className="text-center text-slate-500 text-xs mt-4">
                    Prata med Elton om vad du ser. Han ställer följdfrågor för att förstå bättre.
                </p>
            </div>
        </div>
    );
};

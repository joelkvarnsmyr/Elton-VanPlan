
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Activity, Loader2, Settings, Check, X, Stethoscope } from 'lucide-react';
import { tools } from '../services/geminiService';
import { ACTIVE_PROMPTS } from '../config/prompts'; 

interface LiveEltonProps {
  onClose: () => void;
}

const PERSONAS = [
  { 
    id: 'dalmal', 
    label: 'Dala-Elton (Original)', 
    desc: 'Trygg, gubbig & bred Dalmål', 
    voiceName: 'Fenrir'
  },
  { 
    id: 'gotlandska', 
    label: 'Gotlands-Elton', 
    desc: 'Släpig, melodiös & "Raukar-lugn"', 
    voiceName: 'Charon'
  },
  { 
    id: 'rikssvenska', 
    label: 'Riks-Elton', 
    desc: 'Tydlig, modern & neutral', 
    voiceName: 'Puck'
  },
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
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export const LiveElton: React.FC<LiveEltonProps> = ({ onClose }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0); 
  const [statusMessage, setStatusMessage] = useState("Värmer upp motorn...");
  const [showSettings, setShowSettings] = useState(false);
  const [currentPersonaId, setCurrentPersonaId] = useState<'dalmal'|'gotlandska'|'rikssvenska'>('dalmal');
  const [isDiagnosticMode, setIsDiagnosticMode] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Refs for audio handling
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioQueueRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  // Refs for video handling
  const videoIntervalRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Gemini Client
  const sessionRef = useRef<any>(null);

  useEffect(() => {
    const persona = PERSONAS.find(p => p.id === currentPersonaId) || PERSONAS[0];
    startSession(persona, isDiagnosticMode);
    return () => stopSession();
  }, [isDiagnosticMode]); 

  const handlePersonaChange = (personaId: string) => {
      if (personaId === currentPersonaId) return;
      // @ts-ignore
      setCurrentPersonaId(personaId);
      setShowSettings(false);
      restartSession();
  };

  const restartSession = () => {
      stopSession();
      const persona = PERSONAS.find(p => p.id === currentPersonaId) || PERSONAS[0];
      setStatusMessage("Startar om...");
      setTimeout(() => startSession(persona, isDiagnosticMode), 500);
  };

  const startSession = async (persona: typeof PERSONAS[0], diagnostic: boolean) => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      if (!apiKey) {
          setStatusMessage("Ingen API-nyckel hittades.");
          return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // Initialize Audio Contexts
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      // Start Microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      mediaStreamRef.current = stream;
      
      // Setup Video Preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        videoRef.current.muted = true;
      }

      // GET INSTRUCTIONS FROM CONFIG
      const personaInstruction = ACTIVE_PROMPTS.getPersona(persona.id as any);
      const diagnosticInstruction = diagnostic ? ACTIVE_PROMPTS.getDiagnosticPrompt() : "";
      
      const fullSystemInstruction = `${ACTIVE_PROMPTS.baseSystemPrompt}
      
      === LIVE MODE INSTRUCTIONS ===
      ${personaInstruction}
      ${diagnosticInstruction}
      
      Allmänna regler:
      1. Svara kortfattat (max 2-3 meningar), det är ett samtal.
      2. Du ser vad användaren ser om kameran är på.
      `;

      // Connect to Gemini Live
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.0-flash-exp', 
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: fullSystemInstruction,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: persona.voiceName } } 
          },
          tools: tools
        },
        callbacks: {
          onopen: () => {
            console.log("Connected to Elton Live");
            setIsConnected(true);
            setStatusMessage(diagnostic ? "Lyssnar på motorn..." : `Ansluten! Pratar ${persona.label}.`);
            setupAudioInput(stream, sessionPromise);
          },
          onmessage: async (msg: LiveServerMessage) => {
            handleServerMessage(msg);
          },
          onclose: () => {
            console.log("Disconnected");
            setIsConnected(false);
          },
          onerror: (err) => {
            console.error("Live Error", err);
            setStatusMessage("Motorstopp (Fel i anslutningen)");
          }
        }
      });

      sessionRef.current = sessionPromise;

    } catch (err) {
      console.error("Failed to start session:", err);
      setStatusMessage("Kunde inte starta. Kolla behörigheter.");
    }
  };

  const setupAudioInput = (stream: MediaStream, sessionPromise: Promise<any>) => {
    if (!audioContextRef.current) return;

    const inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const source = inputContext.createMediaStreamSource(stream);
    const processor = inputContext.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (e) => {
      if (!isMicOn) return; 

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

  useEffect(() => {
    if (isVideoOn && isConnected) {
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
  }, [isVideoOn, isConnected]);

  const stopSession = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (processorRef.current) {
      processorRef.current.disconnect();
    }
    
    if (inputSourceRef.current) {
      inputSourceRef.current.disconnect();
    }

    if (audioContextRef.current) {
        audioContextRef.current.close();
    }
    
    setIsConnected(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-nordic-charcoal flex flex-col animate-fade-in font-sans">
      <canvas ref={canvasRef} className="hidden" />

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
                 <div className={`w-40 h-40 bg-teal-600 rounded-full blur-[50px] transition-all duration-100 ease-out absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`} 
                      style={{ transform: `translate(-50%, -50%) scale(${1 + volumeLevel * 3})` }}></div>
                 <div className={`w-32 h-32 bg-nordic-dark-surface rounded-full flex items-center justify-center relative z-10 border-4 ${isDiagnosticMode ? 'border-amber-500' : 'border-nordic-charcoal'} shadow-2xl`}>
                    {isDiagnosticMode ? <Stethoscope size={48} className="text-amber-500 animate-pulse" /> : <Activity size={48} className={`text-teal-500 ${isConnected ? 'animate-pulse' : ''}`} />}
                 </div>
              </div>
           </div>
        )}

        <div className="absolute top-10 left-0 right-0 flex justify-center z-10">
            <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/10 shadow-lg">
                {isConnected ? (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                ) : (
                    <Loader2 size={14} className="text-amber-500 animate-spin" />
                )}
                <span className="text-white text-xs font-medium tracking-wide">{statusMessage}</span>
            </div>
        </div>

        {showSettings && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex items-center justify-center p-6">
                <div className="bg-nordic-dark-surface w-full max-w-sm rounded-3xl border border-nordic-charcoal p-6 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-white font-serif font-bold text-xl">Välj Dialekt</h3>
                        <button onClick={() => setShowSettings(false)} className="p-2 bg-nordic-charcoal rounded-full text-slate-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {PERSONAS.map(p => (
                            <button 
                                key={p.id}
                                onClick={() => handlePersonaChange(p.id)}
                                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                                    currentPersonaId === p.id 
                                    ? 'bg-teal-600 border-teal-500 text-white' 
                                    : 'bg-nordic-charcoal border-transparent text-slate-300 hover:bg-slate-800'
                                }`}
                            >
                                <div className="text-left">
                                    <span className="block font-bold text-sm">{p.label}</span>
                                    <span className="block text-xs opacity-70">{p.desc}</span>
                                </div>
                                {currentPersonaId === p.id && <Check size={18} />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>

      <div className="bg-nordic-dark-surface p-8 pb-12 border-t border-nordic-charcoal relative z-10">
         <div className="flex items-center justify-center gap-6 max-w-md mx-auto">
            
            <button 
                onClick={() => setIsDiagnosticMode(!isDiagnosticMode)}
                className={`p-4 rounded-full transition-all ${isDiagnosticMode ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-nordic-charcoal text-slate-400 hover:bg-slate-700'}`}
                title="Ljud-Doktorn (Motor-diagnostik)"
            >
                <Stethoscope size={24} />
            </button>

            <button 
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-4 rounded-full transition-all ${isVideoOn ? 'bg-white text-nordic-charcoal' : 'bg-nordic-charcoal text-white hover:bg-slate-700'}`}
            >
                {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
            </button>

            <button 
                onClick={onClose}
                className="p-6 bg-rose-500 rounded-full text-white hover:bg-rose-600 hover:scale-105 transition-all shadow-lg shadow-rose-500/30"
            >
                <PhoneOff size={32} />
            </button>

            <button 
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-4 rounded-full transition-all ${isMicOn ? 'bg-white text-nordic-charcoal' : 'bg-nordic-charcoal text-rose-500 hover:bg-slate-700'}`}
            >
                {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
            </button>

         </div>
         
         <button 
            onClick={() => setShowSettings(true)}
            className="absolute right-8 top-1/2 -translate-y-1/2 p-3 text-slate-500 hover:text-white transition-colors"
         >
             <Settings size={20} />
         </button>

         <p className="text-center text-slate-500 text-xs mt-6">
            Elton "ser" via din kamera om du slår på den.
         </p>
      </div>
    </div>
  );
};

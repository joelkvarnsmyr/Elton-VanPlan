
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Activity, Loader2, Settings, Check, X, Stethoscope } from 'lucide-react';
import { tools } from '@/services/geminiService';
import { useVehiclePersonality } from '@/hooks/useVehiclePersonality';
import { getAllDialects } from '@/config/dialects';
import { DialectId } from '@/services/promptBuilder';
import { Project } from '@/types/types';

interface LiveEltonProps {
  project: Project;
  onClose: () => void;
}

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

export const LiveElton: React.FC<LiveEltonProps> = ({ project, onClose }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Värmer upp motorn...");
  const [showSettings, setShowSettings] = useState(false);
  const [currentDialectId, setCurrentDialectId] = useState<DialectId>('dalmal');
  const [isDiagnosticMode, setIsDiagnosticMode] = useState(false);

  // Get all available dialects for UI
  const availableDialects = getAllDialects();

  // Build vehicle personality using our new hook
  const personality = useVehiclePersonality({
    vehicleData: project.vehicleData,
    projectName: project.name,
    dialectId: currentDialectId,
    diagnosticMode: isDiagnosticMode
  });

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
    startSession();
    return () => stopSession();
  }, [isDiagnosticMode, currentDialectId]);

  const handleDialectChange = (dialectId: DialectId) => {
      if (dialectId === currentDialectId) return;
      setCurrentDialectId(dialectId);
      setShowSettings(false);
      // Session will restart automatically via useEffect dependency
  };

  const startSession = async () => {
    try {
      // TODO: LiveElton uses Gemini Live API with WebRTC which requires direct API key access.
      // This needs to be refactored to use a secure token-based authentication flow.
      // See: https://cloud.google.com/gemini/docs/live-api for secure implementation patterns.
      // For now, this feature should be disabled in production until properly secured.
      const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
      if (!apiKey) {
          setStatusMessage("Live Elton är inte konfigurerad. Kontakta administratör.");
          console.warn("LiveElton: API key not configured. This feature needs secure token-based auth.");
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

      // BUILD DYNAMIC SYSTEM INSTRUCTION using our new personality hook
      const fullSystemInstruction = `${personality.systemPrompt}

=== LIVE MODE RULES ===
1. Svara kortfattat (max 2-3 meningar), det är ett samtal i realtid.
2. Du ser vad användaren ser om kameran är på - referera till det du ser.
3. Om ljudkvaliteten är dålig, be användaren komma närmare mikrofonen.
${isDiagnosticMode ? '4. LYSSNA NOGA på motorljudet och ge en sannolikhetsbedömning (0-100%) för olika orsaker.' : ''}
      `;

      // Connect to Gemini Live
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.0-flash-exp',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: fullSystemInstruction,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: personality.voiceName } }
          },
          tools: tools
        },
        callbacks: {
          onopen: () => {
            console.log("Connected to Live Mode:", personality.aiName);
            setIsConnected(true);
            const modeText = isDiagnosticMode ? "Lyssnar på motorn..." : `Ansluten! ${personality.dialectLabel}`;
            setStatusMessage(modeText);
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
    <div data-testid="live-elton-container" className="fixed inset-0 z-50 bg-nordic-charcoal flex flex-col animate-fade-in font-sans">
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
                <span data-testid="status-message" className="text-white text-xs font-medium tracking-wide">{statusMessage}</span>
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
                        {availableDialects.map(dialect => (
                            <button
                                key={dialect.id}
                                onClick={() => handleDialectChange(dialect.id)}
                                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                                    currentDialectId === dialect.id
                                    ? 'bg-teal-600 border-teal-500 text-white'
                                    : 'bg-nordic-charcoal border-transparent text-slate-300 hover:bg-slate-800'
                                }`}
                            >
                                <div className="text-left">
                                    <span className="block font-bold text-sm">{dialect.label}</span>
                                    <span className="block text-xs opacity-70">{dialect.description}</span>
                                </div>
                                {currentDialectId === dialect.id && <Check size={18} />}
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
                data-testid="diagnostic-toggle"
                onClick={() => setIsDiagnosticMode(!isDiagnosticMode)}
                className={`p-4 rounded-full transition-all ${isDiagnosticMode ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-nordic-charcoal text-slate-400 hover:bg-slate-700'}`}
                title="Ljud-Doktorn (Motor-diagnostik)"
            >
                <Stethoscope size={24} />
            </button>

            <button
                data-testid="video-toggle"
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-4 rounded-full transition-all ${isVideoOn ? 'bg-white text-nordic-charcoal' : 'bg-nordic-charcoal text-white hover:bg-slate-700'}`}
            >
                {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
            </button>

            <button
                data-testid="hang-up-button"
                onClick={onClose}
                className="p-6 bg-rose-500 rounded-full text-white hover:bg-rose-600 hover:scale-105 transition-all shadow-lg shadow-rose-500/30"
            >
                <PhoneOff size={32} />
            </button>

            <button
                data-testid="mic-toggle"
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-4 rounded-full transition-all ${isMicOn ? 'bg-white text-nordic-charcoal' : 'bg-nordic-charcoal text-rose-500 hover:bg-slate-700'}`}
            >
                {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
            </button>

         </div>
         
         <button
            data-testid="settings-button"
            onClick={() => setShowSettings(true)}
            className="absolute right-8 top-1/2 -translate-y-1/2 p-3 text-slate-500 hover:text-white transition-colors"
         >
             <Settings size={20} />
         </button>

         <p className="text-center text-slate-500 text-xs mt-6">
            {personality.aiName} "ser" via din kamera om du slår på den.
         </p>
      </div>
    </div>
  );
};

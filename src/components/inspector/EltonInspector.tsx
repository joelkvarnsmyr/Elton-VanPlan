import React, { useRef, useState } from 'react';
import { Scan, Camera, Mic, X, AlertCircle, Radio, Upload, FileAudio } from 'lucide-react';
import { Project, Task, InspectionFinding } from '@/types/types';
import { uploadInspectionAudio, uploadInspectionImage } from '@/services/storage';
import { analyzeInspectionEvidence } from '@/services/firebaseAI';
import { convertFindingToTask } from '@/services/inspectionMapping';
import { transcribeVoiceInspection, generateStrategicDecisions } from '@/services/voiceInspectionService';
import { LiveInspector } from './LiveInspector';
import type { DetailedInspection } from '@/types/inspection';

export interface EltonInspectorProps {
  project: Project;
  onAddTask?: (tasks: Task[]) => void;
  onPostAssistantMessage?: (markdown: string) => void;
  onInspectionComplete?: (inspection: DetailedInspection) => void;
}

type InspectorMode = 'menu' | 'single' | 'live' | 'import';

export const EltonInspector: React.FC<EltonInspectorProps> = ({
  project,
  onAddTask,
  onPostAssistantMessage,
  onInspectionComplete
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<InspectorMode>('menu');
  const [zone, setZone] = useState<'EXTERIOR' | 'ENGINE' | 'UNDERCARRIAGE' | 'INTERIOR'>('EXTERIOR');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [finding, setFinding] = useState<InspectionFinding | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const voiceImportRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setMode('menu');
    setZone('EXTERIOR');
    setImageBase64(null);
    setAudioFile(null);
    setFinding(null);
    setIsLoading(false);
    setError(null);
    setImportProgress(null);
  };

  const close = () => {
    setIsOpen(false);
    reset();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImageBase64(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAudioFile(file);
  };

  const handleVoiceImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setError(null);
      setImportProgress('Laddar upp ljudfil...');

      setImportProgress('Transkriberar och strukturerar inspektion...');
      const result = await transcribeVoiceInspection(file, project.id);

      setImportProgress('Genererar strategiska beslut...');
      const decisions = await generateStrategicDecisions(result.inspection);

      setImportProgress(null);

      // Notify completion
      const summaryLines = [
        `## Röstinspektion importerad`,
        `**${result.inspection.statistics.total} fynd** över ${result.inspection.areas.length} områden`,
        `- ${result.inspection.statistics.negative} anmärkningar`,
        `- ${result.inspection.statistics.positive} positiva observationer`,
        '',
        result.warnings.length > 0 ? `### Varningar\n${result.warnings.map(w => `⚠️ ${w.content}`).join('\n')}` : ''
      ].filter(Boolean);

      onPostAssistantMessage?.(summaryLines.join('\n'));
      onInspectionComplete?.(result.inspection);
      close();

    } catch (err: any) {
      console.error('Voice import failed:', err);
      setError(err?.message || 'Kunde inte importera röstinspektionen');
      setImportProgress(null);
    } finally {
      setIsLoading(false);
    }
  };

  const analyze = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!imageBase64 && !audioFile) {
        setError('Lägg till en bild eller en ljudfil för att analysera.');
        setIsLoading(false);
        return;
      }

      let imageUrl: string | undefined;
      let audioUrl: string | undefined;

      if (imageBase64) {
        imageUrl = await uploadInspectionImage(imageBase64, project.id);
      }
      if (audioFile) {
        audioUrl = await uploadInspectionAudio(audioFile, project.id);
      }

      const res = await analyzeInspectionEvidence(project.id, zone as 'EXTERIOR' | 'ENGINE' | 'UNDERCARRIAGE' | 'INTERIOR', { imageUrl, audioUrl });
      // Add required properties for InspectionFinding
      const completeFinding: InspectionFinding = {
        ...res,
        id: `insp-${Date.now()}`,
        date: new Date().toISOString(),
      };
      setFinding(completeFinding);

      const summaryLines = [
        `Elton Inspector – resultat`,
        `Zon: ${completeFinding.category}`,
        `Allvarlighet: ${completeFinding.severity} (${completeFinding.confidence}%)`,
        `Diagnos: ${completeFinding.aiDiagnosis}`,
        imageUrl ? `Bild: ${imageUrl}` : undefined,
        audioUrl ? `Ljud: ${audioUrl}` : undefined,
      ].filter(Boolean);

      onPostAssistantMessage?.(summaryLines.join('\n'));
    } catch (e: any) {
      console.error('Inspector analysis failed:', e);
      setError(e?.message || 'Kunde inte analysera media');
    } finally {
      setIsLoading(false);
    }
  };

  const createTaskFromFinding = () => {
    if (!finding || !onAddTask) return;
    const task = convertFindingToTask(finding);
    onAddTask([task]);
    onPostAssistantMessage?.(`Skapade uppgift från Elton Inspector:\n- ${task.title}`);
  };

  const handleLiveInspectionComplete = (inspection: DetailedInspection) => {
    onInspectionComplete?.(inspection);
    onPostAssistantMessage?.(`## Live-inspektion klar\n**${inspection.statistics.total} fynd** registrerade över ${inspection.areas.length} områden.`);
    close();
  };

  // Live inspection mode
  if (mode === 'live') {
    return (
      <LiveInspector
        project={project}
        onClose={close}
        onInspectionComplete={handleLiveInspectionComplete}
      />
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors shadow-sm"
        title="Elton Inspector"
      >
        <Scan size={18} />
        <span className="text-xs font-bold hidden sm:inline">Inspector</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-xl bg-white dark:bg-nordic-dark-surface rounded-2xl shadow-xl border border-slate-200 dark:border-nordic-charcoal p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-50 dark:bg-nordic-charcoal rounded-lg"><Scan size={18} className="text-teal-600" /></div>
                <h3 className="font-semibold text-nordic-charcoal dark:text-nordic-ice">Elton Inspector</h3>
              </div>
              <button onClick={close} className="p-2 hover:bg-slate-100 dark:hover:bg-nordic-charcoal rounded-lg"><X size={16} /></button>
            </div>

            {/* Mode Selection Menu */}
            {mode === 'menu' && (
              <div className="space-y-3">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Välj hur du vill genomföra inspektionen:
                </p>

                <button
                  onClick={() => setMode('live')}
                  className="w-full p-4 rounded-xl border-2 border-teal-500 bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors flex items-center gap-4"
                >
                  <div className="p-3 bg-teal-600 rounded-xl text-white">
                    <Radio size={24} />
                  </div>
                  <div className="text-left flex-1">
                    <span className="font-bold text-teal-700 dark:text-teal-300 block">Live Inspektion</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Prata med Elton medan du går runt bilen. Han ställer följdfrågor.
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => voiceImportRef.current?.click()}
                  disabled={isLoading}
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-nordic-charcoal hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors flex items-center gap-4"
                >
                  <div className="p-3 bg-amber-500 rounded-xl text-white">
                    <FileAudio size={24} />
                  </div>
                  <div className="text-left flex-1">
                    <span className="font-bold text-slate-700 dark:text-slate-200 block">
                      {isLoading ? importProgress || 'Importerar...' : 'Importera röstinspelning'}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Ladda upp en befintlig .m4a eller .mp3 fil
                    </span>
                  </div>
                </button>
                <input
                  ref={voiceImportRef}
                  type="file"
                  accept="audio/*,.m4a,.mp3,.wav"
                  className="hidden"
                  onChange={handleVoiceImport}
                />

                <button
                  onClick={() => setMode('single')}
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-nordic-charcoal hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-4"
                >
                  <div className="p-3 bg-blue-500 rounded-xl text-white">
                    <Camera size={24} />
                  </div>
                  <div className="text-left flex-1">
                    <span className="font-bold text-slate-700 dark:text-slate-200 block">Snabbanalys</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Analysera en enskild bild eller ljudfil
                    </span>
                  </div>
                </button>

                {error && (
                  <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
                    <AlertCircle size={16} /><span>{error}</span>
                  </div>
                )}
              </div>
            )}

            {/* Single Image/Audio Analysis Mode */}
            {mode === 'single' && (
              <div className="space-y-3">
                <button onClick={() => setMode('menu')} className="text-xs text-teal-600 hover:underline mb-2">
                  ← Tillbaka till meny
                </button>

                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-300">Zon</label>
                  <div className="mt-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['EXTERIOR', 'ENGINE', 'UNDERCARRIAGE', 'INTERIOR'] as const).map(z => (
                      <button
                        key={z}
                        onClick={() => setZone(z)}
                        className={`px-3 py-2 rounded-xl border text-sm ${zone === z ? 'bg-teal-600 text-white border-teal-600' : 'bg-white dark:bg-nordic-charcoal text-slate-700 dark:text-slate-200 border-slate-200 dark:border-nordic-charcoal'}`}
                      >
                        {z}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-nordic-charcoal">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Bild</span>
                      <button onClick={() => imageInputRef.current?.click()} className="px-2 py-1 text-xs rounded-lg bg-slate-100 dark:bg-nordic-charcoal hover:bg-slate-200 dark:hover:bg-nordic-dark-bg flex items-center gap-1"><Camera size={14} />Välj</button>
                      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                    </div>
                    {imageBase64 ? (
                      <img src={imageBase64} alt="Vald bild" className="mt-2 rounded-lg border border-white/10" />
                    ) : (
                      <p className="mt-2 text-xs text-slate-500">Ingen bild vald</p>
                    )}
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-nordic-charcoal">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Ljud</span>
                      <button onClick={() => audioInputRef.current?.click()} className="px-2 py-1 text-xs rounded-lg bg-slate-100 dark:bg-nordic-charcoal hover:bg-slate-200 dark:hover:bg-nordic-dark-bg flex items-center gap-1"><Mic size={14} />Välj</button>
                      <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={handleAudioSelect} />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{audioFile ? audioFile.name : 'Ingen ljudfil vald'}</p>
                  </div>
                </div>

                {error && (
                  <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm flex items-center gap-2"><AlertCircle size={16} /><span>{error}</span></div>
                )}

                <div className="flex items-center justify-end gap-2">
                  <button onClick={close} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-nordic-charcoal hover:bg-slate-200 dark:hover:bg-nordic-dark-bg">Stäng</button>
                  <button onClick={analyze} disabled={isLoading} className="px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-60">{isLoading ? 'Analyserar...' : 'Analysera'}</button>
                </div>

                {finding && (
                  <div className="mt-3 p-3 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-900/20">
                    <p className="text-sm text-slate-700 dark:text-slate-200"><strong>Zon:</strong> {finding.category}</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200"><strong>Allvarlighet:</strong> {finding.severity} ({finding.confidence}%)</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap mt-1">{finding.aiDiagnosis}</p>
                    <div className="mt-2 flex items-center justify-end">
                      <button onClick={createTaskFromFinding} className="px-4 py-2 rounded-xl bg-nordic-charcoal dark:bg-teal-600 text-white hover:bg-slate-800 dark:hover:bg-teal-700">Konvertera till uppgift</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default EltonInspector;


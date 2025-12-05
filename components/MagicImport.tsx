import React, { useState } from 'react';
import { parseTasksFromInput } from '../services/geminiService';
import { Task, TaskStatus } from '../types';
import { Sparkles, Image as ImageIcon, ArrowRight, Loader2, Plus, X } from 'lucide-react';

interface MagicImportProps {
  onAddTasks: (tasks: Task[]) => void;
  onClose: () => void;
}

export const MagicImport: React.FC<MagicImportProps> = ({ onAddTasks, onClose }) => {
  const [textInput, setTextInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<Task[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  const handleAnalyze = async () => {
    if (!textInput && !selectedImage) return;
    
    setIsAnalyzing(true);
    // Strip header from base64 if present
    const base64Data = selectedImage ? selectedImage.split(',')[1] : undefined;
    
    const tasks = await parseTasksFromInput(textInput, base64Data);
    setGeneratedTasks(tasks as Task[]);
    setIsAnalyzing(false);
  };

  const handleConfirm = () => {
    onAddTasks(generatedTasks);
    setGeneratedTasks([]);
    setTextInput('');
    setSelectedImage(null);
    onClose();
  };

  return (
    <div className="bg-white rounded-3xl border border-nordic-slate/10 shadow-xl overflow-hidden animate-fade-in relative">
      <div className="bg-gradient-to-r from-nordic-ice to-white p-6 border-b border-nordic-slate/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white rounded-xl shadow-sm text-teal-600">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-nordic-charcoal">The Magic Import</h2>
            <p className="text-sm text-nordic-slate">Klistra in anteckningar eller ladda upp kvitton</p>
          </div>
        </div>
        <button 
            onClick={onClose}
            className="p-2 -mr-2 text-nordic-slate hover:bg-black/5 rounded-full transition-colors"
        >
            <X size={24} />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {generatedTasks.length === 0 ? (
          <div className="space-y-4">
             <textarea
              className="w-full p-4 rounded-xl bg-nordic-ice/30 border border-nordic-slate/20 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all min-h-[150px] placeholder:text-nordic-slate/50"
              placeholder="Ex: Behöver köpa 4st Nokian däck, kostar ca 5000kr. Måste också fixa rost i balken (akut!)..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
            
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer px-4 py-2 rounded-xl hover:bg-nordic-ice transition-colors text-nordic-slate text-sm font-medium">
                <ImageIcon size={18} />
                <span>Ladda upp bild</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              {selectedImage && <span className="text-xs text-green-600 font-medium">Bild vald ✓</span>}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (!textInput && !selectedImage)}
              className="w-full py-4 bg-nordic-charcoal text-white rounded-xl font-medium hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>AI Analyserar...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Skapa Uppgifter</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-medium text-nordic-slate">Förslag på uppgifter:</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {generatedTasks.map((task, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-nordic-slate/10 bg-white shadow-sm flex items-start gap-4">
                  <div className={`p-2 rounded-lg mt-1 shrink-0 ${
                    task.costType === 'Investering' ? 'bg-nordic-green' : 'bg-nordic-pink'
                  }`}>
                    {task.costType === 'Investering' ? 'INV' : 'DRIFT'}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-nordic-charcoal">{task.title}</h4>
                    <p className="text-sm text-nordic-slate mb-2">{task.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="bg-nordic-ice px-2 py-1 rounded-md text-slate-600">{task.phase}</span>
                      <span className="bg-nordic-ice px-2 py-1 rounded-md text-slate-600">{task.estimatedCostMin}-{task.estimatedCostMax} kr</span>
                      {task.weightKg > 0 && <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded-md">{task.weightKg} kg</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex space-x-3 pt-4">
               <button 
                onClick={() => setGeneratedTasks([])}
                className="flex-1 py-3 px-4 rounded-xl border border-nordic-slate/20 text-nordic-slate hover:bg-slate-50 font-medium"
               >
                 Avbryt
               </button>
               <button 
                onClick={handleConfirm}
                className="flex-1 py-3 px-4 rounded-xl bg-nordic-charcoal text-white hover:bg-slate-800 font-medium flex items-center justify-center space-x-2 shadow-lg shadow-slate-200"
               >
                 <Plus size={18} />
                 <span>Lägg till allt</span>
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
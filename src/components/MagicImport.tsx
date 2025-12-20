
import React, { useState } from 'react';
import { parseTasksFromInput } from '@/services/geminiService';
import { parseProjectData, mergeProjectData } from '@/services/projectImportService';
import { Task, TaskStatus, ShoppingItem, CostType, Priority, KnowledgeArticle, Project } from '@/types/types';
import { Sparkles, Image as ImageIcon, ArrowRight, Loader2, Plus, X, Receipt, AlertCircle, FileJson, Database } from 'lucide-react';
import { extractReceiptData, receiptItemsToShoppingItems } from '@/services/ocrService';
import { v4 as uuidv4 } from 'uuid';

interface MagicImportProps {
  project?: Project; // Optional: if provided, can merge full project data
  onAddTasks: (tasks: Task[]) => void;
  onAddShoppingItems?: (items: Partial<ShoppingItem>[]) => void;
  onUpdateProject?: (updates: Partial<Project>) => void; // For full project imports
  onClose: () => void;
}

export const MagicImport: React.FC<MagicImportProps> = ({ project, onAddTasks, onAddShoppingItems, onUpdateProject, onClose }) => {
  const [textInput, setTextInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<Task[]>([]);
  const [generatedShoppingItems, setGeneratedShoppingItems] = useState<Partial<ShoppingItem>[]>([]);
  const [generatedKnowledgeArticles, setGeneratedKnowledgeArticles] = useState<KnowledgeArticle[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [imageType, setImageType] = useState<'task' | 'receipt' | 'project'>('task');
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Limit to 10 images max
    if (files.length + selectedImages.length > 10) {
      setError('Max 10 bilder åt gången');
      return;
    }

    // Validate each file
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} är för stor (max 5MB per bild)`);
        return;
      }
    }

    // Read all files
    const readers = files.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Kunde inte läsa bilden'));
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers)
      .then(results => {
        setSelectedImages(prev => [...prev, ...results]);
        setError(null);
      })
      .catch(() => {
        setError('Kunde inte läsa bilderna');
      });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const convertToFullTask = (partial: Partial<Task>): Task => {
    return {
      id: uuidv4(),
      title: partial.title || 'Ny uppgift',
      description: partial.description || '',
      status: TaskStatus.TODO,
      phase: partial.phase || 'Fas 1: Akut',
      priority: partial.priority || Priority.MEDIUM,
      estimatedCostMin: partial.estimatedCostMin || 0,
      estimatedCostMax: partial.estimatedCostMax || partial.estimatedCostMin || 0,
      actualCost: 0,
      weightKg: partial.weightKg || 0,
      costType: partial.costType || CostType.OPERATION,
      tags: partial.tags || [],
      links: [],
      comments: [],
      attachments: [],
      subtasks: partial.subtasks?.map(st => ({
        id: uuidv4(),
        title: typeof st === 'string' ? st : st.title || '',
        completed: false
      })) || [],
      difficultyLevel: partial.difficultyLevel,
      requiredTools: partial.requiredTools
    };
  };

  const handleAnalyze = async () => {
    if (!textInput && selectedImages.length === 0) {
      setError('Skriv in text eller ladda upp en bild');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    // Extract base64 data from all images (remove data:image/...;base64, prefix)
    const base64DataArray = selectedImages.map(img => img.split(',')[1]);

    try {
      if (imageType === 'receipt' && selectedImages.length > 0) {
        // Receipt OCR - process all receipts
        const allItems: Partial<ShoppingItem>[] = [];

        for (const base64Data of base64DataArray) {
          const receiptData = await extractReceiptData(base64Data);
          if (receiptData.success && receiptData.items.length > 0) {
            const items = receiptItemsToShoppingItems(receiptData.items);
            allItems.push(...items);
          }
        }

        if (allItems.length > 0) {
          setGeneratedShoppingItems(allItems);
        } else {
          setError('Kunde inte läsa kvittona. Försök med bättre belysning eller tydligare bilder!');
        }
      } else if (imageType === 'project' && project && onUpdateProject) {
        // Full project import (only first image for now, can be enhanced later)
        const importedData = await parseProjectData(textInput, base64DataArray[0]);

        // Store imported data
        if (importedData.tasks && importedData.tasks.length > 0) {
          setGeneratedTasks(importedData.tasks);
        }
        if (importedData.shoppingItems && importedData.shoppingItems.length > 0) {
          setGeneratedShoppingItems(importedData.shoppingItems);
        }
        if (importedData.knowledgeArticles && importedData.knowledgeArticles.length > 0) {
          setGeneratedKnowledgeArticles(importedData.knowledgeArticles);
        }

        // If we got full project data, show success
        if (importedData.vehicleData || importedData.knowledgeArticles || importedData.tasks) {
          // Success - data will be merged on confirm
        } else {
          setError('Kunde inte hitta projektdata i texten/bilden.');
        }
      } else {
        // Simple task generation with multiple images
        const { tasks } = await parseTasksFromInput(textInput, base64DataArray);

        if (!tasks || tasks.length === 0) {
          setError('Kunde inte hitta några uppgifter i texten/bilden. Försök vara mer specifik.');
          setIsAnalyzing(false);
          return;
        }

        const fullTasks = tasks.map(convertToFullTask);
        setGeneratedTasks(fullTasks);
      }
    } catch (e: any) {
      console.error('Analysis failed:', e);
      setError(`Fel vid analys: ${e.message || 'Något gick fel. Försök igen.'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirm = async () => {
    // Handle full project import
    if (imageType === 'project' && project && onUpdateProject) {
      const base64Data = selectedImages.length > 0 ? selectedImages[0].split(',')[1] : undefined;
      const importedData = await parseProjectData(textInput, base64Data);
      const updates = mergeProjectData(project, importedData);
      onUpdateProject(updates);
    }

    // Handle tasks
    if (generatedTasks.length > 0) {
      onAddTasks(generatedTasks);
      setGeneratedTasks([]);
    }

    // Handle shopping items
    if (generatedShoppingItems.length > 0 && onAddShoppingItems) {
      onAddShoppingItems(generatedShoppingItems);
      setGeneratedShoppingItems([]);
    }

    // Clear state
    setGeneratedKnowledgeArticles([]);
    setTextInput('');
    setSelectedImages([]);
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

      {error && (
        <div className="bg-red-50 border-b border-red-200 p-3 mx-6 mt-4 rounded-xl flex items-center gap-2 text-red-700">
          <AlertCircle size={18} />
          <span className="text-sm flex-1">{error}</span>
          <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 rounded">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="p-6 space-y-6">
        {generatedTasks.length === 0 && generatedShoppingItems.length === 0 && generatedKnowledgeArticles.length === 0 ? (
          <div className="space-y-4">
            {/* Image Type Selector */}
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-nordic-dark-bg rounded-xl">
              <button
                onClick={() => setImageType('task')}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-xs transition-all ${imageType === 'task'
                  ? 'bg-white dark:bg-nordic-charcoal text-nordic-charcoal dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                <Sparkles size={14} className="inline mr-1" />
                Uppgifter
              </button>
              <button
                onClick={() => setImageType('receipt')}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-xs transition-all ${imageType === 'receipt'
                  ? 'bg-white dark:bg-nordic-charcoal text-nordic-charcoal dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                <Receipt size={14} className="inline mr-1" />
                Kvitton
              </button>
              {project && onUpdateProject && (
                <button
                  onClick={() => setImageType('project')}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium text-xs transition-all ${imageType === 'project'
                    ? 'bg-white dark:bg-nordic-charcoal text-nordic-charcoal dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  <Database size={14} className="inline mr-1" />
                  Projekt Data
                </button>
              )}
            </div>

            <textarea
              className="w-full p-4 rounded-xl bg-nordic-ice/30 border border-nordic-slate/20 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all min-h-[150px] placeholder:text-nordic-slate/50"
              placeholder={
                imageType === 'receipt'
                  ? 'Eller ladda upp kvitto...'
                  : imageType === 'project'
                    ? 'Klistra in JSON data eller dela text/bild med projektinformation (motorspec, kunskapsbas, uppgifter, etc)...'
                    : 'Ex: Behöver köpa 4st Nokian däck, kostar ca 5000kr. Måste också fixa rost i balken (akut!)...'
              }
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={imageType === 'receipt'}
            />

            {/* Image previews */}
            {selectedImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {selectedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Bild ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-nordic-slate/20"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Ta bort bild"
                    >
                      <X size={14} />
                    </button>
                    <span className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                      {index + 1}/{selectedImages.length}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer px-4 py-2 rounded-xl hover:bg-nordic-ice transition-colors text-nordic-slate text-sm font-medium">
                {imageType === 'receipt' ? <Receipt size={18} /> : <ImageIcon size={18} />}
                <span>Ladda upp {imageType === 'receipt' ? 'kvitto' : 'bild'}{selectedImages.length > 0 ? `er (${selectedImages.length})` : ''}</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
              </label>
              {selectedImages.length > 0 && <span className="text-xs text-green-600 font-medium">{selectedImages.length} bild{selectedImages.length > 1 ? 'er' : ''} vald{selectedImages.length > 1 ? 'a' : ''} ✓</span>}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (!textInput && selectedImages.length === 0)}
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
            {generatedTasks.length > 0 && (
              <>
                <h3 className="font-medium text-nordic-slate">Förslag på uppgifter:</h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {generatedTasks.map((task, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-nordic-slate/10 bg-white shadow-sm flex items-start gap-4">
                      <div className={`p-2 rounded-lg mt-1 shrink-0 ${task.costType === 'Investering' ? 'bg-nordic-green' : 'bg-nordic-pink'
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
              </>
            )}

            {generatedShoppingItems.length > 0 && (
              <>
                <h3 className="font-medium text-nordic-slate">Inköp från kvitto:</h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {generatedShoppingItems.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-green-200 bg-green-50 shadow-sm flex items-center gap-4">
                      <Receipt size={24} className="text-green-600" />
                      <div className="flex-1">
                        <h4 className="font-bold text-nordic-charcoal">{item.name}</h4>
                        <div className="flex gap-4 text-sm text-slate-600 mt-1">
                          <span>Antal: {item.quantity}</span>
                          <span className="font-bold text-green-700">{item.actualCost} kr</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => {
                  setGeneratedTasks([]);
                  setGeneratedShoppingItems([]);
                }}
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

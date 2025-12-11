/**
 * Quick Vehicle Add Component
 *
 * Allows users to quickly add a vehicle by:
 * 1. Registration number (automatic data fetch)
 * 2. Take photo of license plate (OCR)
 * 3. Paste Blocket URL
 * 4. Manual entry
 */

import React, { useState } from 'react';
import { VehicleData } from '@/types/types';
import {
  fetchVehicleByRegNo,
  validateSwedishRegNo,
  formatRegNo,
  parseBlocketAd,
  extractRegNoFromImage,
  getMockVehicleData
} from '@/services/vehicleDataService';
import {
  generateExpertAnalysis,
  generateMaintenanceData
} from '@/services/expertAnalysisService';
import {
  Search,
  Camera,
  Link as LinkIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  X
} from 'lucide-react';

interface QuickVehicleAddProps {
  onVehicleDataReady: (data: Partial<VehicleData>) => void;
  onCancel: () => void;
}

type SearchMethod = 'regno' | 'image' | 'blocket' | 'manual';
type SearchState = 'idle' | 'searching' | 'success' | 'error';

export const QuickVehicleAdd: React.FC<QuickVehicleAddProps> = ({
  onVehicleDataReady,
  onCancel
}) => {
  const [method, setMethod] = useState<SearchMethod>('regno');
  const [regNo, setRegNo] = useState('');
  const [blocketUrl, setBlocketUrl] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [state, setState] = useState<SearchState>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [foundData, setFoundData] = useState<Partial<VehicleData> | null>(null);
  const [isGeneratingExpertAnalysis, setIsGeneratingExpertAnalysis] = useState(false);

  // ===========================
  // REG NUMBER SEARCH
  // ===========================

  const handleRegNoSearch = async () => {
    if (!regNo.trim()) return;

    if (!validateSwedishRegNo(regNo)) {
      setState('error');
      setStatusMessage('Ogiltigt registreringsnummer. Format: ABC123 eller ABC12D');
      return;
    }

    setState('searching');
    setStatusMessage('Söker fordonsdata...');

    try {
      // For demo purposes, use mock data (replace with real API when available)
      const result = await fetchVehicleByRegNo(regNo);

      if (result.success && result.data) {
        setFoundData(result.data);
        setState('success');
        setStatusMessage(`Data hämtad från ${result.source === 'cache' ? 'cache' : 'register'}!`);
      } else {
        // Use mock data for development
        const mockData = getMockVehicleData(regNo);
        setFoundData(mockData);
        setState('success');
        setStatusMessage('Demo: Använder exempeldata. API-integration kommer snart!');
      }
    } catch (error) {
      setState('error');
      setStatusMessage('Kunde inte hämta fordonsdata. Försök igen.');
      console.error(error);
    }
  };

  // ===========================
  // IMAGE OCR SEARCH
  // ===========================

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);

      setState('searching');
      setStatusMessage('Läser registreringsnummer från bild...');

      try {
        const extractedRegNo = await extractRegNoFromImage(base64.split(',')[1]);

        if (extractedRegNo) {
          setRegNo(extractedRegNo);
          setState('idle');
          setStatusMessage('');
          // Automatically search
          await handleRegNoSearch();
        } else {
          setState('error');
          setStatusMessage('Kunde inte läsa regnummer från bilden. OCR kommer snart!');
        }
      } catch (error) {
        setState('error');
        setStatusMessage('Bildanalys misslyckades.');
        console.error(error);
      }
    };
    reader.readAsDataURL(file);
  };

  // ===========================
  // BLOCKET URL PARSING
  // ===========================

  const handleBlocketSearch = async () => {
    if (!blocketUrl.trim()) return;

    setState('searching');
    setStatusMessage('Läser Blocket-annons...');

    try {
      const result = await parseBlocketAd(blocketUrl);

      if (result.success && result.data) {
        setFoundData(result.data);
        setState('success');
        setStatusMessage('Data extraherad från annons!');
      } else {
        setState('error');
        setStatusMessage(result.error || 'Kunde inte läsa annonsen.');
      }
    } catch (error) {
      setState('error');
      setStatusMessage('Blocket-parsing misslyckades.');
      console.error(error);
    }
  };

  // ===========================
  // GENERATE EXPERT ANALYSIS
  // ===========================

  const handleEnrichWithExpertAnalysis = async () => {
    if (!foundData || !foundData.make || !foundData.model) return;

    setIsGeneratingExpertAnalysis(true);
    setStatusMessage('AI genererar expertanalys...');

    try {
      const [expertAnalysis, maintenanceData] = await Promise.all([
        generateExpertAnalysis(
          foundData.make,
          foundData.model,
          foundData.year || new Date().getFullYear(),
          foundData.engine?.code
        ),
        generateMaintenanceData(
          foundData.make,
          foundData.model,
          foundData.year || new Date().getFullYear(),
          foundData.engine?.volume
        )
      ]);

      const enrichedData = {
        ...foundData,
        expertAnalysis,
        maintenance: maintenanceData
      };

      setFoundData(enrichedData);
      setStatusMessage('Expertanalys klar!');
      setIsGeneratingExpertAnalysis(false);

      // Automatically proceed after 1 second
      setTimeout(() => {
        onVehicleDataReady(enrichedData);
      }, 1000);

    } catch (error) {
      console.error('Expert analysis failed:', error);
      setStatusMessage('Expertanalys misslyckades. Fortsätter ändå...');
      setIsGeneratingExpertAnalysis(false);

      // Still proceed with basic data
      setTimeout(() => {
        onVehicleDataReady(foundData);
      }, 1000);
    }
  };

  // ===========================
  // RENDER
  // ===========================

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-nordic-dark-surface rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Lägg till Fordon</h2>
              <p className="text-sm text-teal-100">Automatisk datahämtning med AI</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Method Selector */}
        <div className="p-6 border-b border-slate-200 dark:border-nordic-dark-bg">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setMethod('regno')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                method === 'regno'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 dark:bg-nordic-dark-bg text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Search size={18} />
              Regnummer
            </button>
            <button
              onClick={() => setMethod('image')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                method === 'image'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 dark:bg-nordic-dark-bg text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Camera size={18} />
              Ta Bild
            </button>
            <button
              onClick={() => setMethod('blocket')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                method === 'blocket'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 dark:bg-nordic-dark-bg text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <LinkIcon size={18} />
              Blocket
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-4">

          {/* Registration Number */}
          {method === 'regno' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Registreringsnummer
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && handleRegNoSearch()}
                    placeholder="ABC123"
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-nordic-dark-bg bg-white dark:bg-nordic-charcoal text-lg font-mono focus:border-teal-500 focus:outline-none"
                    maxLength={6}
                  />
                  <button
                    onClick={handleRegNoSearch}
                    disabled={state === 'searching' || !regNo.trim()}
                    className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {state === 'searching' ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Söker...
                      </>
                    ) : (
                      <>
                        <Search size={20} />
                        Sök
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Format: ABC123 (gammalt) eller ABC12D (nytt)
                </p>
              </div>
            </div>
          )}

          {/* Image Upload */}
          {method === 'image' && (
            <div className="space-y-4">
              <label className="block">
                <div className="border-2 border-dashed border-slate-300 dark:border-nordic-dark-bg rounded-xl p-8 text-center cursor-pointer hover:border-teal-500 transition-colors">
                  <Camera size={48} className="mx-auto mb-4 text-slate-400" />
                  <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Ta eller ladda upp bild på registreringsskylt
                  </p>
                  <p className="text-sm text-slate-500">OCR läser automatiskt regnummret</p>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </label>
              {selectedImage && (
                <div className="relative">
                  <img
                    src={selectedImage}
                    alt="License plate"
                    className="w-full rounded-xl max-h-64 object-contain"
                  />
                </div>
              )}
            </div>
          )}

          {/* Blocket URL */}
          {method === 'blocket' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Blocket-länk
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={blocketUrl}
                    onChange={(e) => setBlocketUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleBlocketSearch()}
                    placeholder="https://www.blocket.se/annons/..."
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-nordic-dark-bg bg-white dark:bg-nordic-charcoal focus:border-teal-500 focus:outline-none"
                  />
                  <button
                    onClick={handleBlocketSearch}
                    disabled={state === 'searching' || !blocketUrl.trim()}
                    className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {state === 'searching' ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Läser...
                      </>
                    ) : (
                      <>
                        <LinkIcon size={20} />
                        Läs annons
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`flex items-center gap-3 p-4 rounded-xl ${
                state === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : state === 'error'
                  ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400'
                  : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
              }`}
            >
              {state === 'searching' && <Loader2 size={20} className="animate-spin" />}
              {state === 'success' && <CheckCircle2 size={20} />}
              {state === 'error' && <AlertCircle size={20} />}
              <p className="text-sm font-medium">{statusMessage}</p>
            </div>
          )}

          {/* Found Data Preview */}
          {foundData && state === 'success' && (
            <div className="bg-slate-50 dark:bg-nordic-dark-bg rounded-xl p-6 space-y-4">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                Hittade Fordonsdata
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Regnummer:</span>
                  <p className="font-bold">{foundData.regNo}</p>
                </div>
                <div>
                  <span className="text-slate-500">Märke & Modell:</span>
                  <p className="font-bold">{foundData.make} {foundData.model}</p>
                </div>
                <div>
                  <span className="text-slate-500">Årsmodell:</span>
                  <p className="font-bold">{foundData.year}</p>
                </div>
                <div>
                  <span className="text-slate-500">Bränsle:</span>
                  <p className="font-bold">{foundData.engine?.fuel || '—'}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleEnrichWithExpertAnalysis}
                  disabled={isGeneratingExpertAnalysis}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isGeneratingExpertAnalysis ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      AI Analyserar...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      Enricha med AI-Analys
                    </>
                  )}
                </button>
                <button
                  onClick={() => onVehicleDataReady(foundData)}
                  className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 flex items-center gap-2"
                >
                  <CheckCircle2 size={20} />
                  Använd Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

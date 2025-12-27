import React, { useState, useCallback, useRef } from 'react';
import { Plus, Trash2, ZoomIn, ZoomOut, RotateCcw, Save } from 'lucide-react';
import { useProject } from '@/contexts';
import {
    ElectricalSystem,
    ElectricalComponent,
    ElectricalConnection,
    EnergyScenario,
    DEFAULT_COMPONENT_TEMPLATES,
    DEFAULT_SCENARIOS,
    createComponent,
    createConnection,
    createEmptySystem,
    ComponentTemplate,
} from '@/types/electrical';
import { ComponentLibrary } from './ComponentLibrary';
import { ScenarioSelector } from './ScenarioSelector';
import { ElectricalCanvas } from './ElectricalCanvas';
import { SourceIndicators } from './SourceIndicators';

/**
 * Electrical System Builder
 * 
 * Interactive visual editor for building and visualizing campervan electrical systems.
 * Features drag-and-drop components, animated power flows, and scenario simulation.
 */
export const ElectricalSystemBuilder: React.FC = () => {
    const { activeProject, showToast } = useProject();

    // Initialize from project or create empty system
    const [system, setSystem] = useState<ElectricalSystem>(() => {
        return (activeProject as any)?.electricalSystem || createEmptySystem();
    });

    const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
    const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState(false);

    // Canvas controls
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });

    // Handle dropping a component from the library
    const handleDropComponent = useCallback((template: ComponentTemplate, position: { x: number; y: number }) => {
        const newComponent = createComponent(template, position);
        setSystem(prev => ({
            ...prev,
            components: [...prev.components, newComponent],
            lastModified: new Date().toISOString(),
        }));
        setIsDirty(true);
    }, []);

    // Handle moving a component
    const handleMoveComponent = useCallback((componentId: string, newPosition: { x: number; y: number }) => {
        setSystem(prev => ({
            ...prev,
            components: prev.components.map(c =>
                c.id === componentId ? { ...c, position: newPosition } : c
            ),
            lastModified: new Date().toISOString(),
        }));
        setIsDirty(true);
    }, []);

    // Handle deleting a component
    const handleDeleteComponent = useCallback((componentId: string) => {
        setSystem(prev => ({
            ...prev,
            components: prev.components.filter(c => c.id !== componentId),
            connections: prev.connections.filter(
                conn => conn.fromId !== componentId && conn.toId !== componentId
            ),
            lastModified: new Date().toISOString(),
        }));
        setSelectedComponentId(null);
        setIsDirty(true);
    }, []);

    // Handle starting a connection
    const handleStartConnection = useCallback((componentId: string) => {
        if (connectingFrom === null) {
            setConnectingFrom(componentId);
        } else if (connectingFrom !== componentId) {
            // Create the connection
            const newConnection = createConnection(connectingFrom, componentId);
            setSystem(prev => ({
                ...prev,
                connections: [...prev.connections, newConnection],
                lastModified: new Date().toISOString(),
            }));
            setConnectingFrom(null);
            setIsDirty(true);
        } else {
            // Clicked same component, cancel
            setConnectingFrom(null);
        }
    }, [connectingFrom]);

    // Handle deleting a connection
    const handleDeleteConnection = useCallback((connectionId: string) => {
        setSystem(prev => ({
            ...prev,
            connections: prev.connections.filter(c => c.id !== connectionId),
            lastModified: new Date().toISOString(),
        }));
        setIsDirty(true);
    }, []);

    // Handle scenario change
    const handleScenarioChange = useCallback((scenario: EnergyScenario) => {
        setSystem(prev => ({
            ...prev,
            activeScenario: scenario,
            lastModified: new Date().toISOString(),
        }));
        setIsDirty(true);
    }, []);

    // Handle updating a component's basic info
    const handleUpdateComponent = useCallback((componentId: string, updates: Partial<ElectricalComponent>) => {
        setSystem(prev => ({
            ...prev,
            components: prev.components.map(c =>
                c.id === componentId ? { ...c, ...updates } : c
            ),
            lastModified: new Date().toISOString(),
        }));
        setIsDirty(true);
    }, []);

    // Handle updating a component's specs
    const handleUpdateComponentSpecs = useCallback((componentId: string, specUpdates: Partial<{ voltage: number; capacity: number; power: number; maxCurrent: number }>) => {
        setSystem(prev => ({
            ...prev,
            components: prev.components.map(c =>
                c.id === componentId ? {
                    ...c,
                    specs: { ...c.specs, ...specUpdates }
                } : c
            ),
            lastModified: new Date().toISOString(),
        }));
        setIsDirty(true);
    }, []);

    // Handle adding component to shopping list
    const handleAddToShoppingList = useCallback((component: ElectricalComponent) => {
        // Create a shopping item from the component
        const itemName = component.brand && component.model
            ? `${component.brand} ${component.model}`
            : component.name;

        const estimatedCost = component.type === 'battery'
            ? (component.specs?.capacity || 100) * 30  // ~30 SEK per Ah for LiFePO4
            : component.type === 'solar_panel'
                ? (component.specs?.power || 200) * 8      // ~8 SEK per W
                : component.type === 'inverter'
                    ? (component.specs?.power || 1000) * 4     // ~4 SEK per W
                    : 2000; // Default 2000 SEK

        // Show toast and potentially add to DB (would need service integration)
        showToast?.(`Lagt till "${itemName}" i inköpslistan`, 'success');
        console.log('Add to shopping list:', {
            name: itemName,
            category: 'El - Victron',
            estimatedCost,
            url: component.purchaseUrl,
            linkedElectricalComponentId: component.id
        });
    }, [showToast]);

    // Handle save
    const handleSave = useCallback(async () => {
        if (!activeProject) return;

        try {
            // TODO: Add proper Firestore field for electrical system
            // For now, store in localStorage as a temporary solution
            const storageKey = `vanplan-electrical-${activeProject.id}`;
            localStorage.setItem(storageKey, JSON.stringify(system));
            showToast('Elsystem sparat!');
            setIsDirty(false);
        } catch (error) {
            console.error('Failed to save electrical system:', error);
            showToast('Kunde inte spara elsystemet', 'error');
        }
    }, [activeProject, system, showToast]);

    // Handle reset
    const handleReset = useCallback(() => {
        if (window.confirm('Är du säker på att du vill återställa elsystemet? Alla ändringar försvinner.')) {
            setSystem(createEmptySystem());
            setSelectedComponentId(null);
            setConnectingFrom(null);
            setIsDirty(false);
        }
    }, []);

    // Get selected component
    const selectedComponent = system.components.find(c => c.id === selectedComponentId);

    // Get current scenario config
    const currentScenario = DEFAULT_SCENARIOS.find(s => s.id === system.activeScenario) || DEFAULT_SCENARIOS[0];

    return (
        <div className="flex flex-col h-[calc(100vh-200px)] min-h-[600px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden border border-slate-700">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                        <span className="text-xl">⚡</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Elsystem</h2>
                        <p className="text-xs text-slate-400">Interaktiv visualisering</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-amber-400">☀️</span>
                        <span className="text-slate-300">{system.stats?.solarPower || 0}W</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-teal-400">⚡</span>
                        <span className="text-slate-300">{system.stats?.loadPower || 0}W</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-green-400">🔋</span>
                        <span className="text-slate-300">{system.stats?.batteryPercent || 100}%</span>
                        <span className="text-xs text-slate-500">
                            ({system.stats?.batteryState === 'charging' ? 'Laddar' :
                                system.stats?.batteryState === 'discharging' ? 'Förbrukar' : 'Vilar'})
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setZoom(z => Math.min(z + 0.1, 2))}
                        className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                        title="Zooma in"
                    >
                        <ZoomIn size={18} />
                    </button>
                    <button
                        onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}
                        className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                        title="Zooma ut"
                    >
                        <ZoomOut size={18} />
                    </button>
                    <button
                        onClick={handleReset}
                        className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                        title="Återställ"
                    >
                        <RotateCcw size={18} />
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!isDirty}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isDirty
                            ? 'bg-teal-600 text-white hover:bg-teal-500'
                            : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        <Save size={18} />
                        Spara
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Component Library */}
                <ComponentLibrary
                    templates={DEFAULT_COMPONENT_TEMPLATES}
                    onDragStart={(template) => {
                        // Handle drag start - will be used by canvas
                    }}
                />

                {/* Canvas */}
                <div className="flex-1 relative">
                    <ElectricalCanvas
                        system={system}
                        zoom={zoom}
                        pan={pan}
                        selectedComponentId={selectedComponentId}
                        connectingFrom={connectingFrom}
                        currentScenario={currentScenario}
                        onSelectComponent={setSelectedComponentId}
                        onMoveComponent={handleMoveComponent}
                        onDropComponent={handleDropComponent}
                        onStartConnection={handleStartConnection}
                        onDeleteConnection={handleDeleteConnection}
                        onPanChange={setPan}
                    />

                    {/* Source Indicators (left side) */}
                    <SourceIndicators
                        activeScenario={system.activeScenario}
                        onScenarioClick={handleScenarioChange}
                    />

                    {/* Connection mode indicator */}
                    {connectingFrom && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-teal-600 text-white rounded-full text-sm font-medium shadow-lg animate-pulse">
                            Klicka på en komponent för att ansluta
                        </div>
                    )}
                </div>

                {/* Right Sidebar - Component Editor */}
                {selectedComponent && (
                    <div className="w-72 p-4 border-l border-slate-700 bg-slate-800/50 overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-white">{selectedComponent.name}</h3>
                            <button
                                onClick={() => handleDeleteComponent(selectedComponent.id)}
                                className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                title="Ta bort"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-3 text-sm mb-4">
                            <div>
                                <label className="block text-slate-400 text-xs mb-1">Märke</label>
                                <input
                                    type="text"
                                    value={selectedComponent.brand || ''}
                                    onChange={(e) => handleUpdateComponent(selectedComponent.id, { brand: e.target.value })}
                                    placeholder="t.ex. Victron"
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-teal-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-xs mb-1">Modell</label>
                                <input
                                    type="text"
                                    value={selectedComponent.model || ''}
                                    onChange={(e) => handleUpdateComponent(selectedComponent.id, { model: e.target.value })}
                                    placeholder="t.ex. SmartSolar MPPT 100/30"
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-teal-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Specs Section */}
                        <div className="border-t border-slate-700 pt-4 mb-4">
                            <h4 className="text-slate-300 text-xs font-semibold uppercase mb-3">Specifikationer</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {selectedComponent.type === 'battery' && (
                                    <>
                                        <div>
                                            <label className="block text-slate-500 text-xs mb-1">Kapacitet (Ah)</label>
                                            <input
                                                type="number"
                                                value={selectedComponent.specs?.capacity || ''}
                                                onChange={(e) => handleUpdateComponentSpecs(selectedComponent.id, { capacity: parseInt(e.target.value) || 0 })}
                                                className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:border-teal-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-500 text-xs mb-1">Spänning (V)</label>
                                            <input
                                                type="number"
                                                value={selectedComponent.specs?.voltage || 12}
                                                onChange={(e) => handleUpdateComponentSpecs(selectedComponent.id, { voltage: parseInt(e.target.value) || 12 })}
                                                className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:border-teal-500 focus:outline-none"
                                            />
                                        </div>
                                    </>
                                )}
                                {(selectedComponent.type === 'solar_panel' || selectedComponent.type === 'inverter') && (
                                    <div className="col-span-2">
                                        <label className="block text-slate-500 text-xs mb-1">Effekt (W)</label>
                                        <input
                                            type="number"
                                            value={selectedComponent.specs?.power || ''}
                                            onChange={(e) => handleUpdateComponentSpecs(selectedComponent.id, { power: parseInt(e.target.value) || 0 })}
                                            className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:border-teal-500 focus:outline-none"
                                        />
                                    </div>
                                )}
                                {(selectedComponent.type === 'mppt' || selectedComponent.type === 'dc_dc') && (
                                    <div className="col-span-2">
                                        <label className="block text-slate-500 text-xs mb-1">Max ström (A)</label>
                                        <input
                                            type="number"
                                            value={selectedComponent.specs?.maxCurrent || ''}
                                            onChange={(e) => handleUpdateComponentSpecs(selectedComponent.id, { maxCurrent: parseInt(e.target.value) || 0 })}
                                            className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:border-teal-500 focus:outline-none"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Product Links */}
                        <div className="border-t border-slate-700 pt-4 mb-4">
                            <h4 className="text-slate-300 text-xs font-semibold uppercase mb-3">Produktlänkar</h4>
                            <div className="space-y-2">
                                <div>
                                    <label className="block text-slate-500 text-xs mb-1">Produktsida</label>
                                    <input
                                        type="url"
                                        value={selectedComponent.productUrl || ''}
                                        onChange={(e) => handleUpdateComponent(selectedComponent.id, { productUrl: e.target.value })}
                                        placeholder="https://..."
                                        className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:border-teal-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-500 text-xs mb-1">Köp här</label>
                                    <input
                                        type="url"
                                        value={selectedComponent.purchaseUrl || ''}
                                        onChange={(e) => handleUpdateComponent(selectedComponent.id, { purchaseUrl: e.target.value })}
                                        placeholder="https://..."
                                        className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:border-teal-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Cable Dimensions - show connections from/to this component */}
                        {(() => {
                            const connectedCables = system.connections.filter(
                                c => c.fromId === selectedComponent.id || c.toId === selectedComponent.id
                            );
                            if (connectedCables.length === 0) return null;

                            return (
                                <div className="border-t border-slate-700 pt-4 mb-4">
                                    <h4 className="text-slate-300 text-xs font-semibold uppercase mb-3">Kabeldimensioner</h4>
                                    <div className="space-y-2">
                                        {connectedCables.map(cable => {
                                            const otherComponent = system.components.find(
                                                c => c.id === (cable.fromId === selectedComponent.id ? cable.toId : cable.fromId)
                                            );
                                            const isOutgoing = cable.fromId === selectedComponent.id;

                                            // Suggest cable size based on current/power
                                            const suggestedSize = cable.voltage === 230 ? '2.5mm²' :
                                                (selectedComponent.specs?.maxCurrent || 0) > 50 ? '25mm²' :
                                                    (selectedComponent.specs?.maxCurrent || 0) > 30 ? '16mm²' :
                                                        (selectedComponent.specs?.maxCurrent || 0) > 15 ? '10mm²' : '6mm²';

                                            return (
                                                <div key={cable.id} className="flex items-center gap-2 p-2 bg-slate-700/50 rounded-lg">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-xs text-slate-400 truncate">
                                                            {isOutgoing ? '→' : '←'} {otherComponent?.name || 'Okänd'}
                                                        </div>
                                                        <div className="text-[10px] text-slate-500">
                                                            {cable.voltage}V • Förslag: {suggestedSize}
                                                        </div>
                                                    </div>
                                                    <select
                                                        value={cable.cableSize || ''}
                                                        title="Välj kabeldimension"
                                                        aria-label={`Kabeldimension till ${otherComponent?.name || 'anslutning'}`}
                                                        onChange={(e) => {
                                                            setSystem(prev => ({
                                                                ...prev,
                                                                connections: prev.connections.map(c =>
                                                                    c.id === cable.id ? { ...c, cableSize: e.target.value } : c
                                                                ),
                                                                lastModified: new Date().toISOString(),
                                                            }));
                                                            setIsDirty(true);
                                                        }}
                                                        className="w-20 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-xs focus:border-teal-500 focus:outline-none"
                                                    >
                                                        <option value="">-</option>
                                                        <option value="1.5mm²">1.5mm²</option>
                                                        <option value="2.5mm²">2.5mm²</option>
                                                        <option value="4mm²">4mm²</option>
                                                        <option value="6mm²">6mm²</option>
                                                        <option value="10mm²">10mm²</option>
                                                        <option value="16mm²">16mm²</option>
                                                        <option value="25mm²">25mm²</option>
                                                        <option value="35mm²">35mm²</option>
                                                        <option value="50mm²">50mm²</option>
                                                    </select>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Action Buttons */}
                        <div className="space-y-2">
                            <button
                                onClick={() => handleStartConnection(selectedComponent.id)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                            >
                                <Plus size={16} />
                                Anslut till...
                            </button>
                            <button
                                onClick={() => handleAddToShoppingList(selectedComponent)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition-colors"
                            >
                                <Plus size={16} />
                                Lägg till i inköpslista
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Bar - Scenario Selector */}
            <ScenarioSelector
                scenarios={DEFAULT_SCENARIOS}
                activeScenario={system.activeScenario}
                onScenarioChange={handleScenarioChange}
            />
        </div>
    );
};

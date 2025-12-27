import React, { useRef, useState, useCallback } from 'react';
import {
    ElectricalSystem,
    ElectricalComponent,
    ElectricalConnection,
    ScenarioConfig,
    ComponentTemplate,
} from '@/types/electrical';
import { AnimatedConnection } from './AnimatedConnection';

interface ElectricalCanvasProps {
    system: ElectricalSystem;
    zoom: number;
    pan: { x: number; y: number };
    selectedComponentId: string | null;
    connectingFrom: string | null;
    currentScenario: ScenarioConfig;
    onSelectComponent: (id: string | null) => void;
    onMoveComponent: (id: string, position: { x: number; y: number }) => void;
    onDropComponent: (template: ComponentTemplate, position: { x: number; y: number }) => void;
    onStartConnection: (id: string) => void;
    onDeleteConnection: (id: string) => void;
    onPanChange: (pan: { x: number; y: number }) => void;
}

/**
 * Electrical Canvas
 * 
 * The main canvas area where components are placed and connected.
 * Features drag-and-drop, pan/zoom, and animated SVG connections.
 */
export const ElectricalCanvas: React.FC<ElectricalCanvasProps> = ({
    system,
    zoom,
    pan,
    selectedComponentId,
    connectingFrom,
    currentScenario,
    onSelectComponent,
    onMoveComponent,
    onDropComponent,
    onStartConnection,
    onDeleteConnection,
    onPanChange,
}) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });

    // Get canvas-relative position from mouse event
    const getCanvasPosition = useCallback((e: React.MouseEvent) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left - pan.x) / zoom,
            y: (e.clientY - rect.top - pan.y) / zoom,
        };
    }, [pan, zoom]);

    // Handle drop from component library
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const templateJson = e.dataTransfer.getData('application/json');
        if (!templateJson) return;

        try {
            const template = JSON.parse(templateJson) as ComponentTemplate;
            const position = getCanvasPosition(e as any);
            onDropComponent(template, position);
        } catch (err) {
            console.error('Failed to parse dropped component:', err);
        }
    }, [getCanvasPosition, onDropComponent]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }, []);

    // Handle component drag
    const handleComponentMouseDown = useCallback((e: React.MouseEvent, component: ElectricalComponent) => {
        e.stopPropagation();
        if (e.button !== 0) return; // Left click only

        setDraggingId(component.id);
        setDragOffset({
            x: e.clientX - component.position.x * zoom - pan.x,
            y: e.clientY - component.position.y * zoom - pan.y,
        });
        onSelectComponent(component.id);
    }, [zoom, pan, onSelectComponent]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (draggingId) {
            const newX = (e.clientX - dragOffset.x - pan.x) / zoom;
            const newY = (e.clientY - dragOffset.y - pan.y) / zoom;
            onMoveComponent(draggingId, { x: newX, y: newY });
        } else if (isPanning) {
            onPanChange({
                x: e.clientX - panStart.x,
                y: e.clientY - panStart.y,
            });
        }
    }, [draggingId, dragOffset, pan, zoom, isPanning, panStart, onMoveComponent, onPanChange]);

    const handleMouseUp = useCallback(() => {
        setDraggingId(null);
        setIsPanning(false);
    }, []);

    // Handle canvas pan
    const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
            // Middle click or shift+left click to pan
            setIsPanning(true);
            setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        } else if (e.button === 0) {
            // Left click on empty space deselects
            onSelectComponent(null);
        }
    }, [pan, onSelectComponent]);

    // Handle double click to connect
    const handleComponentDoubleClick = useCallback((componentId: string) => {
        onStartConnection(componentId);
    }, [onStartConnection]);

    // Get component center position for connection drawing
    const getComponentCenter = (component: ElectricalComponent) => ({
        x: component.position.x + 60, // Half of component width (120px)
        y: component.position.y + 45, // Half of component height (90px)
    });

    // Component render
    const renderComponent = (component: ElectricalComponent) => {
        const isSelected = component.id === selectedComponentId;
        const isConnecting = component.id === connectingFrom;
        const isConnectTarget = connectingFrom !== null && component.id !== connectingFrom;

        return (
            <div
                key={component.id}
                className={`absolute w-[120px] h-[90px] rounded-xl cursor-move transition-shadow select-none
          ${isSelected ? 'ring-2 ring-teal-500 shadow-lg shadow-teal-500/20' : ''}
          ${isConnecting ? 'ring-2 ring-amber-500 animate-pulse' : ''}
          ${isConnectTarget ? 'hover:ring-2 hover:ring-teal-400' : ''}
          bg-slate-800 border border-slate-600 hover:border-slate-500
        `}
                style={{
                    left: component.position.x,
                    top: component.position.y,
                }}
                onMouseDown={(e) => handleComponentMouseDown(e, component)}
                onDoubleClick={() => handleComponentDoubleClick(component.id)}
            >
                {/* Component Icon */}
                <div className="h-[60px] flex items-center justify-center text-3xl">
                    {component.icon || '⚡'}
                </div>

                {/* Component Name */}
                <div className="px-2 py-1 bg-slate-700/80 rounded-b-xl">
                    <p className="text-xs font-medium text-white text-center truncate">
                        {component.name}
                    </p>
                </div>

                {/* Status indicator */}
                {component.brand && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            ref={canvasRef}
            className="w-full h-full relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
            style={{ cursor: isPanning ? 'grabbing' : draggingId ? 'grabbing' : 'default' }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Grid Pattern */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-500" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Connections Layer (SVG) */}
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: '0 0',
                }}
            >
                {system.connections.map(connection => {
                    const fromComponent = system.components.find(c => c.id === connection.fromId);
                    const toComponent = system.components.find(c => c.id === connection.toId);

                    if (!fromComponent || !toComponent) return null;

                    const from = getComponentCenter(fromComponent);
                    const to = getComponentCenter(toComponent);

                    return (
                        <AnimatedConnection
                            key={connection.id}
                            connection={connection}
                            from={from}
                            to={to}
                            fromComponent={fromComponent}
                            toComponent={toComponent}
                            scenario={currentScenario}
                            isSelected={false}
                            isActive={true}
                            onClick={() => onDeleteConnection(connection.id)}
                        />
                    );
                })}
            </svg>

            {/* Components Layer */}
            <div
                className="absolute inset-0"
                style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: '0 0',
                }}
            >
                {system.components.map(renderComponent)}
            </div>

            {/* Empty State */}
            {system.components.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <div className="text-6xl mb-4 opacity-50">⚡</div>
                        <p className="text-slate-400 text-lg mb-2">Dra komponenter hit</p>
                        <p className="text-slate-500 text-sm">
                            Börja med att dra en solpanel eller batteri från sidopanelen
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

import React from 'react';
import { ElectricalComponent, EnergyScenario } from '@/types/electrical';
import { Battery, BatteryCharging, BatteryWarning } from 'lucide-react';

interface ComponentNodeProps {
    component: ElectricalComponent;
    isSelected: boolean;
    isConnecting: boolean;
    isConnectTarget: boolean;
    batteryPercent?: number;
    batteryState?: 'charging' | 'discharging' | 'idle';
    activeScenario: EnergyScenario;
    onMouseDown: (e: React.MouseEvent) => void;
    onDoubleClick: () => void;
}

/**
 * Get component-specific styling based on type and scenario
 */
function getComponentStyle(
    type: string,
    scenario: EnergyScenario
): { borderColor: string; glowColor: string; isActive: boolean } {
    // Solar panel active in solar scenario
    if (type === 'solar_panel' && scenario === 'solar') {
        return { borderColor: '#fbbf24', glowColor: '#f59e0b', isActive: true };
    }
    // Alternator/Generator active in driving scenario
    if ((type === 'alternator' || type === 'dc_dc') && scenario === 'driving') {
        return { borderColor: '#10b981', glowColor: '#059669', isActive: true };
    }
    // Shore power active in shore scenario
    if ((type === 'shore_power' || type === 'inverter') && scenario === 'shore') {
        return { borderColor: '#60a5fa', glowColor: '#3b82f6', isActive: true };
    }
    // Battery always shows some activity
    if (type === 'battery') {
        if (scenario === 'night') {
            return { borderColor: '#f87171', glowColor: '#ef4444', isActive: true }; // Discharging
        }
        return { borderColor: '#10b981', glowColor: '#059669', isActive: true }; // Charging
    }
    // Consumers show activity in night mode
    if ((type === 'consumer_12v' || type === 'consumer_230v') && scenario === 'night') {
        return { borderColor: '#f87171', glowColor: '#ef4444', isActive: true };
    }

    return { borderColor: '#475569', glowColor: 'transparent', isActive: false };
}

/**
 * Component Node
 * 
 * Enhanced visual component with:
 * - Battery SOC bar
 * - Scenario-aware styling
 * - Status indicator dots
 * - Glow effects when active
 */
export const ComponentNode: React.FC<ComponentNodeProps> = ({
    component,
    isSelected,
    isConnecting,
    isConnectTarget,
    batteryPercent = 100,
    batteryState = 'idle',
    activeScenario,
    onMouseDown,
    onDoubleClick,
}) => {
    const style = getComponentStyle(component.type, activeScenario);
    const isBattery = component.type === 'battery';

    // Battery color based on percentage
    const getBatteryColor = () => {
        if (batteryPercent > 60) return '#22c55e'; // Green
        if (batteryPercent > 30) return '#eab308'; // Yellow
        return '#ef4444'; // Red
    };

    return (
        <div
            className={`
        absolute w-[120px] rounded-xl cursor-move transition-all duration-300 select-none
        ${isSelected ? 'ring-2 ring-teal-500 shadow-lg shadow-teal-500/30 scale-105' : ''}
        ${isConnecting ? 'ring-2 ring-amber-500 animate-pulse' : ''}
        ${isConnectTarget ? 'hover:ring-2 hover:ring-teal-400' : ''}
        bg-slate-800 border-2
      `}
            style={{
                left: component.position.x,
                top: component.position.y,
                borderColor: style.isActive ? style.borderColor : '#475569',
                boxShadow: style.isActive ? `0 0 20px ${style.glowColor}40` : 'none',
            }}
            onMouseDown={onMouseDown}
            onDoubleClick={onDoubleClick}
        >
            {/* Component Icon */}
            <div className="h-[60px] flex items-center justify-center text-3xl relative">
                {component.customImage ? (
                    <img
                        src={`data:image/png;base64,${component.customImage}`}
                        alt={component.name}
                        className="w-16 h-16 object-contain"
                    />
                ) : (
                    <span className="drop-shadow-lg">{component.icon || '⚡'}</span>
                )}

                {/* Active indicator glow */}
                {style.isActive && (
                    <div
                        className="absolute inset-0 rounded-t-xl opacity-20"
                        style={{
                            background: `radial-gradient(circle at center, ${style.glowColor} 0%, transparent 70%)`
                        }}
                    />
                )}
            </div>

            {/* Component Name */}
            <div className="px-2 py-1.5 bg-slate-700/80 rounded-b-xl">
                <p className="text-[11px] font-medium text-white text-center truncate">
                    {component.name}
                </p>
            </div>

            {/* Battery SOC Bar (only for battery type) */}
            {isBattery && (
                <div className="absolute -bottom-3 left-2 right-2">
                    <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-600">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${batteryPercent}%`,
                                backgroundColor: getBatteryColor(),
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Status indicator dots */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                {component.brand && (
                    <>
                        <span
                            className={`w-2 h-2 rounded-full transition-colors ${style.isActive ? 'animate-pulse' : ''
                                }`}
                            style={{ backgroundColor: style.isActive ? style.borderColor : '#64748b' }}
                        />
                        <span className="w-2 h-2 rounded-full bg-slate-600" />
                    </>
                )}
            </div>

            {/* Consumer label (for 12V/230V consumers) */}
            {(component.type === 'consumer_12v' || component.type === 'consumer_230v') && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                            backgroundColor: component.type === 'consumer_230v' ? '#3b82f620' : '#ef444420',
                            color: component.type === 'consumer_230v' ? '#60a5fa' : '#f87171',
                        }}
                    >
                        {component.type === 'consumer_230v' ? '230V' : '12V'} Förbrukare
                    </span>
                </div>
            )}
        </div>
    );
};

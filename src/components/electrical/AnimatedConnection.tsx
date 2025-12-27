import React from 'react';
import {
    ElectricalConnection,
    ScenarioConfig,
    EnergyScenario,
    ElectricalComponent,
    ElectricalComponentType
} from '@/types/electrical';

interface AnimatedConnectionProps {
    connection: ElectricalConnection;
    from: { x: number; y: number };
    to: { x: number; y: number };
    fromComponent?: ElectricalComponent;
    toComponent?: ElectricalComponent;
    scenario: ScenarioConfig;
    isSelected: boolean;
    isActive: boolean; // Whether this connection has power flowing
    onClick?: () => void;
}

/**
 * Calculate if a connection should be active and its flow direction
 * based on the current scenario and component types.
 */
function getFlowState(
    fromType: ElectricalComponentType | undefined,
    toType: ElectricalComponentType | undefined,
    scenario: EnergyScenario
): { isActive: boolean; reversed: boolean } {
    // Solar scenario: solar_panel -> mppt -> battery -> consumers
    if (scenario === 'solar') {
        if (fromType === 'solar_panel') return { isActive: true, reversed: false };
        if (fromType === 'mppt' && toType === 'battery') return { isActive: true, reversed: false };
        if (fromType === 'mppt' && toType === 'distributor') return { isActive: true, reversed: false };
        if (fromType === 'battery' || fromType === 'distributor') {
            if (toType === 'consumer_12v' || toType === 'consumer_230v') return { isActive: true, reversed: false };
        }
    }

    // Driving scenario: alternator -> dc_dc -> battery (NO shore_power!)
    if (scenario === 'driving') {
        // Shore power is NOT active when driving
        if (fromType === 'shore_power' || toType === 'shore_power') {
            return { isActive: false, reversed: false };
        }
        if (fromType === 'alternator') return { isActive: true, reversed: false };
        if (fromType === 'dc_dc' && (toType === 'battery' || toType === 'distributor')) {
            return { isActive: true, reversed: false };
        }
        // Battery to distributor or inverter
        if (fromType === 'battery' && (toType === 'distributor' || toType === 'inverter')) {
            return { isActive: true, reversed: false };
        }
        // Distributor to consumers
        if (fromType === 'distributor' && (toType === 'consumer_12v' || toType === 'inverter')) {
            return { isActive: true, reversed: false };
        }
        // Inverter to 230V consumers (AC power while driving from battery)
        if (fromType === 'inverter' && toType === 'consumer_230v') {
            return { isActive: true, reversed: false };
        }
        if (fromType === 'battery' && (toType === 'consumer_12v' || toType === 'consumer_230v')) {
            return { isActive: true, reversed: false };
        }
    }

    // Shore power scenario: shore_power -> inverter -> battery
    if (scenario === 'shore') {
        if (fromType === 'shore_power') return { isActive: true, reversed: false };
        if (fromType === 'inverter' && (toType === 'battery' || toType === 'distributor')) {
            return { isActive: true, reversed: false };
        }
        if (fromType === 'battery' && (toType === 'consumer_12v' || toType === 'consumer_230v')) {
            return { isActive: true, reversed: false };
        }
    }

    // Night scenario: battery -> consumers only (no charging)
    if (scenario === 'night') {
        if (fromType === 'battery' || fromType === 'distributor') {
            if (toType === 'consumer_12v' || toType === 'consumer_230v' || toType === 'inverter') {
                return { isActive: true, reversed: false };
            }
        }
        if (fromType === 'inverter' && toType === 'consumer_230v') {
            return { isActive: true, reversed: false };
        }
    }

    // Data connections are always active (for Cerbo GX)
    if (fromType === 'monitor' || toType === 'monitor') {
        return { isActive: true, reversed: false };
    }

    return { isActive: false, reversed: false };
}

/**
 * Get color scheme based on connection type and voltage
 * Yellow: Solar (high voltage from panels)
 * Red: 12V DC
 * Blue: 230V AC
 * Green/Teal: Data/Communication
 */
function getConnectionColors(
    type: string,
    voltage: number,
    fromType?: ElectricalComponentType,
    toType?: ElectricalComponentType
): { stroke: string; glow: string; dashArray: string } {
    // Data connections (green/teal)
    if (type === 'data' || fromType === 'monitor' || toType === 'monitor') {
        return { stroke: '#2dd4bf', glow: '#14b8a6', dashArray: '4 6' };
    }

    // Solar input (yellow/amber) - from solar panel to MPPT
    if (fromType === 'solar_panel' || (voltage > 12 && voltage < 100)) {
        return { stroke: '#fbbf24', glow: '#f59e0b', dashArray: '8 6' };
    }

    // 230V AC (blue) - shore_power, inverter output, or 230V consumers
    if (voltage === 230 || type === 'ac' || fromType === 'shore_power' ||
        (fromType === 'inverter' && toType === 'consumer_230v') ||
        toType === 'consumer_230v') {
        return { stroke: '#60a5fa', glow: '#3b82f6', dashArray: '6 8' };
    }

    // 12V DC (red) - default for most connections
    if (voltage === 12 || type === 'dc_positive') {
        return { stroke: '#f87171', glow: '#ef4444', dashArray: '10 5' };
    }

    // 24V DC (orange)
    if (voltage === 24) {
        return { stroke: '#fb923c', glow: '#f97316', dashArray: '10 5' };
    }

    // 48V DC (purple)
    if (voltage === 48) {
        return { stroke: '#a78bfa', glow: '#8b5cf6', dashArray: '10 5' };
    }

    // Default red
    return { stroke: '#f87171', glow: '#ef4444', dashArray: '10 5' };
}

/**
 * Animated Connection
 * 
 * SVG line with animated power flow effect.
 * Colors: Yellow (solar), Red (12V DC), Blue (230V AC), Green (data)
 * Animation direction based on power flow in current scenario.
 */
export const AnimatedConnection: React.FC<AnimatedConnectionProps> = ({
    connection,
    from,
    to,
    fromComponent,
    toComponent,
    scenario,
    isSelected,
    isActive: externalIsActive,
    onClick,
}) => {
    // Get flow state based on component types and scenario
    const flowState = getFlowState(
        fromComponent?.type,
        toComponent?.type,
        scenario.id
    );

    // Use external isActive if provided, otherwise calculate
    const isConnectionActive = externalIsActive !== undefined ? externalIsActive : flowState.isActive;

    // Calculate control points for curved line
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    // Offset for curve (perpendicular to line)
    const curveAmount = Math.min(length * 0.15, 40);
    const perpX = -dy / length;
    const perpY = dx / length;
    const cx = midX + perpX * curveAmount;
    const cy = midY + perpY * curveAmount;

    // Path for the connection
    const path = `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;

    // Get colors based on connection properties
    const colors = getConnectionColors(
        connection.type,
        connection.voltage,
        fromComponent?.type,
        toComponent?.type
    );

    // Animation direction
    const shouldReverse = flowState.reversed || scenario.flowDirection === 'discharge';
    const animationDirection = shouldReverse ? 'reverse' : 'normal';
    // Slower, smoother animation (2s instead of 0.5s)
    const animationDuration = isConnectionActive ? '2s' : '4s';

    // Unique ID for this connection's animation
    const animId = `flow-${connection.id}`;

    return (
        <g
            className="cursor-pointer group"
            onClick={onClick}
            style={{ opacity: isConnectionActive ? 1 : 0.3 }}
        >
            {/* Glow effect (background) */}
            <path
                d={path}
                fill="none"
                stroke={colors.glow}
                strokeWidth={isSelected ? 10 : 8}
                strokeLinecap="round"
                opacity={isConnectionActive ? 0.4 : 0.1}
                className="transition-all duration-300"
            />

            {/* Main line with animation */}
            <path
                d={path}
                fill="none"
                stroke={colors.stroke}
                strokeWidth={isSelected ? 4 : 3}
                strokeLinecap="round"
                strokeDasharray={colors.dashArray}
                className="transition-all duration-300"
                style={{
                    animation: isConnectionActive
                        ? `${animId} ${animationDuration} linear infinite ${animationDirection}`
                        : 'none',
                }}
            />

            {/* Connection label */}
            {connection.label && (
                <text
                    x={midX}
                    y={midY - 15}
                    textAnchor="middle"
                    className="fill-white text-[11px] font-medium"
                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
                >
                    {connection.label}
                </text>
            )}

            {/* Voltage label (on hover) */}
            <text
                x={midX}
                y={midY + 20}
                textAnchor="middle"
                className="fill-slate-400 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
            >
                {connection.voltage}V
            </text>

            {/* CSS Animation - smoother with ease-in-out */}
            <style>{`
        @keyframes ${animId} {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -30;
          }
        }
      `}</style>
        </g>
    );
};

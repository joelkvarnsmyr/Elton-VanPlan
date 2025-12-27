import React from 'react';
import { EnergyScenario } from '@/types/electrical';
import { Sun, Car, Plug, Moon } from 'lucide-react';

interface SourceIndicatorsProps {
    activeScenario: EnergyScenario;
    onScenarioClick?: (scenario: EnergyScenario) => void;
}

interface SourceItemProps {
    icon: React.ReactNode;
    label: string;
    scenario: EnergyScenario;
    isActive: boolean;
    color: string;
    glowColor: string;
    onClick?: () => void;
}

const SourceItem: React.FC<SourceItemProps> = ({
    icon,
    label,
    isActive,
    color,
    glowColor,
    onClick,
}) => (
    <button
        onClick={onClick}
        className={`
      relative flex flex-col items-center gap-2 p-3 rounded-xl
      transition-all duration-300 group
      ${isActive
                ? 'bg-slate-700/50 scale-105'
                : 'bg-transparent hover:bg-slate-800/50'
            }
    `}
    >
        {/* Glow effect when active */}
        {isActive && (
            <div
                className="absolute inset-0 rounded-xl opacity-30 blur-xl transition-all"
                style={{ backgroundColor: glowColor }}
            />
        )}

        {/* Icon circle */}
        <div
            className={`
        relative w-12 h-12 rounded-full flex items-center justify-center
        transition-all duration-300 border-2
        ${isActive
                    ? 'border-current shadow-lg'
                    : 'border-slate-600 opacity-50'
                }
      `}
            style={{
                color: isActive ? color : '#64748b',
                boxShadow: isActive ? `0 0 20px ${glowColor}40` : 'none'
            }}
        >
            {icon}

            {/* Pulsing dot when active */}
            {isActive && (
                <span
                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
                    style={{ backgroundColor: color }}
                />
            )}
        </div>

        {/* Label */}
        <span
            className={`
        text-[10px] font-bold uppercase tracking-wider
        transition-colors duration-300
        ${isActive ? 'text-white' : 'text-slate-500'}
      `}
        >
            {label}
        </span>
    </button>
);

/**
 * Source Indicators
 * 
 * Left sidebar showing power sources (Solar, Generator, Shore Power)
 * with glowing indicators when active based on current scenario.
 */
export const SourceIndicators: React.FC<SourceIndicatorsProps> = ({
    activeScenario,
    onScenarioClick,
}) => {
    const sources = [
        {
            id: 'solar' as EnergyScenario,
            label: 'SOLCELLER',
            icon: <Sun size={24} />,
            color: '#fbbf24',
            glowColor: '#f59e0b',
            activeIn: ['solar'],
        },
        {
            id: 'driving' as EnergyScenario,
            label: 'GENERATOR',
            icon: <Car size={24} />,
            color: '#10b981',
            glowColor: '#059669',
            activeIn: ['driving'],
        },
        {
            id: 'shore' as EnergyScenario,
            label: 'LANDSTRÖM',
            icon: <Plug size={24} />,
            color: '#60a5fa',
            glowColor: '#3b82f6',
            activeIn: ['shore'],
        },
    ];

    return (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10">
            {sources.map((source) => (
                <SourceItem
                    key={source.id}
                    icon={source.icon}
                    label={source.label}
                    scenario={source.id}
                    isActive={source.activeIn.includes(activeScenario)}
                    color={source.color}
                    glowColor={source.glowColor}
                    onClick={() => onScenarioClick?.(source.id)}
                />
            ))}
        </div>
    );
};

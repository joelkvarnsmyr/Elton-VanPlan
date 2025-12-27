import React from 'react';
import { ScenarioConfig, EnergyScenario } from '@/types/electrical';

interface ScenarioSelectorProps {
    scenarios: ScenarioConfig[];
    activeScenario: EnergyScenario;
    onScenarioChange: (scenario: EnergyScenario) => void;
}

/**
 * Scenario Selector
 * 
 * Bottom toolbar for selecting energy flow scenarios.
 * Each scenario shows different power flow animations.
 */
export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
    scenarios,
    activeScenario,
    onScenarioChange,
}) => {
    return (
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-700 bg-slate-800/50">
            {/* Scenario Buttons */}
            <div className="flex items-center gap-2">
                {scenarios.map(scenario => {
                    const isActive = scenario.id === activeScenario;
                    return (
                        <button
                            key={scenario.id}
                            onClick={() => onScenarioChange(scenario.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all ${isActive
                                    ? 'bg-slate-700 text-white shadow-lg border border-slate-600'
                                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300 border border-transparent'
                                }`}
                        >
                            <span className="text-lg">{scenario.icon}</span>
                            <span>{scenario.name}</span>
                        </button>
                    );
                })}
            </div>

            {/* Toggle switches for loads */}
            <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-sm text-slate-400">230V Last</span>
                    <div className="relative">
                        <input
                            type="checkbox"
                            defaultChecked
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-blue-600 transition-colors"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                    </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-sm text-slate-400">12V Last</span>
                    <div className="relative">
                        <input
                            type="checkbox"
                            defaultChecked
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-red-600 transition-colors"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                    </div>
                </label>
            </div>
        </div>
    );
};

import React from 'react';
import { ComponentTemplate } from '@/types/electrical';

interface ComponentLibraryProps {
    templates: ComponentTemplate[];
    onDragStart?: (template: ComponentTemplate) => void;
}

/**
 * Component Library
 * 
 * Sidebar with draggable electrical component templates.
 * Organized by category: Sources, Chargers, Storage, Consumers.
 */
export const ComponentLibrary: React.FC<ComponentLibraryProps> = ({
    templates,
    onDragStart,
}) => {
    // Group templates by category
    const sources = templates.filter(t =>
        ['solar_panel', 'shore_power', 'alternator'].includes(t.type)
    );
    const chargers = templates.filter(t =>
        ['mppt', 'dc_dc', 'inverter'].includes(t.type)
    );
    const storage = templates.filter(t =>
        ['battery', 'distributor', 'monitor'].includes(t.type)
    );
    const consumers = templates.filter(t =>
        ['consumer_12v', 'consumer_230v'].includes(t.type)
    );

    const handleDragStart = (e: React.DragEvent, template: ComponentTemplate) => {
        e.dataTransfer.setData('application/json', JSON.stringify(template));
        e.dataTransfer.effectAllowed = 'copy';
        onDragStart?.(template);
    };

    const ComponentItem: React.FC<{ template: ComponentTemplate }> = ({ template }) => (
        <div
            draggable
            onDragStart={(e) => handleDragStart(e, template)}
            className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-xl cursor-grab hover:bg-slate-700 transition-all hover:scale-105 active:cursor-grabbing border border-transparent hover:border-slate-600"
        >
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-xl">
                {template.icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{template.name}</p>
                {template.brand && (
                    <p className="text-xs text-slate-400 truncate">{template.brand}</p>
                )}
            </div>
        </div>
    );

    const CategorySection: React.FC<{ title: string; items: ComponentTemplate[]; color: string }> = ({
        title,
        items,
        color
    }) => (
        <div className="mb-4">
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${color}`}>
                {title}
            </h4>
            <div className="space-y-2">
                {items.map(template => (
                    <ComponentItem key={template.type} template={template} />
                ))}
            </div>
        </div>
    );

    return (
        <div className="w-56 p-4 border-r border-slate-700 bg-slate-800/50 overflow-y-auto">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <span>📦</span> Komponenter
            </h3>

            <p className="text-xs text-slate-400 mb-4">
                Dra komponenter till ytan för att bygga ditt elsystem
            </p>

            <CategorySection
                title="Energikällor"
                items={sources}
                color="text-amber-400"
            />

            <CategorySection
                title="Laddare & Omvandlare"
                items={chargers}
                color="text-blue-400"
            />

            <CategorySection
                title="Lagring & Distribution"
                items={storage}
                color="text-green-400"
            />

            <CategorySection
                title="Förbrukare"
                items={consumers}
                color="text-rose-400"
            />
        </div>
    );
};

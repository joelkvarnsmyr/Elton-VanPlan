import React, { useState, useMemo } from 'react';
import { ArrowLeft, Target, TrendingUp, Clock, Package } from 'lucide-react';
import { ROADMAP_FEATURES, Feature } from '@/data/roadmapData';
import { RoadmapCard } from './RoadmapCard';
import { RoadmapModal } from './RoadmapModal';
import { RoadmapFilters, ViewMode, StatusFilter, SortBy } from './RoadmapFilters';
import { DndContext, DragEndEvent, DragOverlay, DragOverEvent, closestCorners, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

// Droppable Column wrapper
const DroppableColumn: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className={`transition-all ${isOver ? 'ring-2 ring-teal-500 ring-opacity-50' : ''}`}>
            {children}
        </div>
    );
};

export const Roadmap: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('kanban');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<SortBy>('id');
    const [searchQuery, setSearchQuery] = useState('');
    const [features, setFeatures] = useState<Feature[]>(ROADMAP_FEATURES);
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // Get unique categories
    const categories = useMemo(() => {
        return Array.from(new Set(features.map(f => f.category)));
    }, [features]);

    // Filter and sort features
    const filteredAndSortedFeatures = useMemo(() => {
        let filtered = features;

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(f => f.status === statusFilter);
        }

        // Apply category filter
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(f => f.category === categoryFilter);
        }

        // Apply search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(f =>
                f.title.toLowerCase().includes(query) ||
                f.description.toLowerCase().includes(query) ||
                f.purpose.toLowerCase().includes(query) ||
                (typeof f.tech === 'string' ? f.tech.toLowerCase().includes(query) : f.tech.some(t => t.toLowerCase().includes(query)))
            );
        }

        // Sort
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'progress':
                    const progressA = (a.checklist.filter(c => c.completed).length / a.checklist.length);
                    const progressB = (b.checklist.filter(c => c.completed).length / b.checklist.length);
                    return progressB - progressA;
                case 'status':
                    const statusOrder = { 'in-progress': 0, 'planned': 1, 'done': 2 };
                    return statusOrder[a.status] - statusOrder[b.status];
                case 'category':
                    return a.category.localeCompare(b.category);
                case 'id':
                default:
                    return a.id - b.id;
            }
        });

        return sorted;
    }, [features, statusFilter, categoryFilter, searchQuery, sortBy]);

    // Separate by status for Kanban view
    const doneFeatures = filteredAndSortedFeatures.filter(f => f.status === 'done');
    const inProgressFeatures = filteredAndSortedFeatures.filter(f => f.status === 'in-progress');
    const plannedFeatures = filteredAndSortedFeatures.filter(f => f.status === 'planned');

    // Calculate stats
    const totalFeatures = features.length;
    const doneCount = features.filter(f => f.status === 'done').length;
    const inProgressCount = features.filter(f => f.status === 'in-progress').length;
    const plannedCount = features.filter(f => f.status === 'planned').length;
    const completionPercentage = Math.round((doneCount / totalFeatures) * 100);

    // Drag handlers
    const handleDragStart = (event: DragEndEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const featureId = parseInt(active.id as string);
        const targetStatus = over.id as 'planned' | 'in-progress' | 'done';

        // Don't allow dragging 'done' features
        const draggedFeature = features.find(f => f.id === featureId);
        if (!draggedFeature || draggedFeature.status === 'done') return;

        // Update feature status
        setFeatures(prev =>
            prev.map(f =>
                f.id === featureId
                    ? { ...f, status: targetStatus }
                    : f
            )
        );
    };

    const activeFeature = activeId ? features.find(f => f.id.toString() === activeId) : null;

    return (
        <div className="min-h-screen bg-nordic-ice dark:bg-nordic-dark-bg p-4 sm:p-6 pb-24">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={onClose}
                        className="p-3 bg-white dark:bg-nordic-dark-surface rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-nordic-charcoal text-slate-500 dark:text-slate-400 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="font-serif font-bold text-3xl text-nordic-charcoal dark:text-nordic-ice">
                            Produkt-Roadmap
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Visionen för The VanPlan. Uppdateras löpande.
                        </p>
                    </div>
                </div>

                {/* Stats Dashboard */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-nordic-dark-surface rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-nordic-charcoal">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                                <Package size={20} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-nordic-charcoal dark:text-nordic-ice">
                                    {totalFeatures}
                                </p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Totalt Features
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-nordic-dark-surface rounded-2xl p-4 shadow-sm border border-teal-100 dark:border-teal-900/50">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-teal-50 dark:bg-teal-900/20 rounded-full flex items-center justify-center">
                                <Target size={20} className="text-teal-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-teal-600">
                                    {doneCount}
                                </p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Lanserade
                                </p>
                            </div>
                        </div>
                        <div className="w-full bg-teal-100 dark:bg-teal-900/30 h-1.5 rounded-full overflow-hidden">
                            <div
                                className="bg-teal-500 h-full transition-all duration-1000"
                                style={{ width: `${completionPercentage}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-nordic-dark-surface rounded-2xl p-4 shadow-sm border border-amber-100 dark:border-amber-900/50">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
                                <TrendingUp size={20} className="text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-amber-600">
                                    {inProgressCount}
                                </p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Pågår
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-nordic-dark-surface rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-nordic-charcoal">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                <Clock size={20} className="text-slate-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-600 dark:text-slate-300">
                                    {plannedCount}
                                </p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Planerade
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <RoadmapFilters
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    categoryFilter={categoryFilter}
                    onCategoryFilterChange={setCategoryFilter}
                    sortBy={sortBy}
                    onSortByChange={setSortBy}
                    searchQuery={searchQuery}
                    onSearchQueryChange={setSearchQuery}
                    categories={categories}
                />

                {/* Content */}
                {viewMode === 'kanban' ? (
                    /* Kanban View */
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Planerad Column */}
                            <DroppableColumn id="planned">
                                <SortableContext
                                    id="planned"
                                    items={plannedFeatures.map(f => f.id.toString())}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="bg-white dark:bg-nordic-dark-surface rounded-2xl p-4 border border-slate-200 dark:border-nordic-charcoal"
                                    >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                            <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                                            Planerad
                                        </h3>
                                        <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400">
                                            {plannedFeatures.length}
                                        </span>
                                    </div>
                                    <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto pr-2 min-h-[200px]">
                                        {plannedFeatures.map(feature => (
                                            <RoadmapCard
                                                key={feature.id}
                                                feature={feature}
                                                onClick={() => setSelectedFeature(feature)}
                                                isDraggable={true}
                                            />
                                        ))}
                                        {plannedFeatures.length === 0 && (
                                            <p className="text-center text-slate-400 text-sm py-8">
                                                Inga planerade features
                                            </p>
                                        )}
                                    </div>
                                </div>
                                </SortableContext>
                            </DroppableColumn>

                            {/* Pågår Column */}
                            <DroppableColumn id="in-progress">
                                <SortableContext
                                    id="in-progress"
                                    items={inProgressFeatures.map(f => f.id.toString())}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="bg-white dark:bg-nordic-dark-surface rounded-2xl p-4 border border-amber-200 dark:border-amber-900/50"
                                    >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-2">
                                            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                                            Pågår
                                        </h3>
                                        <span className="text-xs font-bold px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-700 dark:text-amber-300">
                                            {inProgressFeatures.length}
                                        </span>
                                    </div>
                                    <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto pr-2 min-h-[200px]">
                                        {inProgressFeatures.map(feature => (
                                            <RoadmapCard
                                                key={feature.id}
                                                feature={feature}
                                                onClick={() => setSelectedFeature(feature)}
                                                isDraggable={true}
                                            />
                                        ))}
                                        {inProgressFeatures.length === 0 && (
                                            <p className="text-center text-slate-400 text-sm py-8">
                                                Inga pågående features
                                            </p>
                                        )}
                                    </div>
                                </div>
                                </SortableContext>
                            </DroppableColumn>

                            {/* Lanserad Column */}
                            <DroppableColumn id="done">
                                <SortableContext
                                    id="done"
                                    items={doneFeatures.map(f => f.id.toString())}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="bg-white dark:bg-nordic-dark-surface rounded-2xl p-4 border border-teal-200 dark:border-teal-900/50"
                                    >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-teal-700 dark:text-teal-300 flex items-center gap-2">
                                            <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                                            Lanserad
                                        </h3>
                                        <span className="text-xs font-bold px-2 py-1 bg-teal-100 dark:bg-teal-900/30 rounded-full text-teal-700 dark:text-teal-300">
                                            {doneFeatures.length}
                                        </span>
                                    </div>
                                    <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto pr-2 min-h-[200px]">
                                        {doneFeatures.map(feature => (
                                            <RoadmapCard
                                                key={feature.id}
                                                feature={feature}
                                                onClick={() => setSelectedFeature(feature)}
                                                isDraggable={false}
                                            />
                                        ))}
                                        {doneFeatures.length === 0 && (
                                            <p className="text-center text-slate-400 text-sm py-8">
                                                Inga lanserade features
                                            </p>
                                        )}
                                    </div>
                                </div>
                                </SortableContext>
                            </DroppableColumn>
                        </div>

                        <DragOverlay>
                            {activeFeature ? (
                                <div className="rotate-3 scale-105">
                                    <RoadmapCard
                                        feature={activeFeature}
                                        onClick={() => {}}
                                        isDraggable={false}
                                    />
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                ) : (
                    /* List View */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredAndSortedFeatures.map(feature => (
                            <RoadmapCard
                                key={feature.id}
                                feature={feature}
                                onClick={() => setSelectedFeature(feature)}
                            />
                        ))}
                        {filteredAndSortedFeatures.length === 0 && (
                            <div className="col-span-full text-center py-12">
                                <p className="text-slate-400 text-lg">Inga features matchar dina filter</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Progress Bar at Bottom */}
                <div className="mt-12 text-center pb-8">
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">
                        Total Framsteg
                    </p>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-4 rounded-full overflow-hidden max-w-xl mx-auto">
                        <div
                            className="bg-gradient-to-r from-teal-500 to-teal-600 h-full transition-all duration-1000 flex items-center justify-center"
                            style={{ width: `${completionPercentage}%` }}
                        >
                            <span className="text-xs font-bold text-white">
                                {completionPercentage}%
                            </span>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                        {doneCount} av {totalFeatures} features lanserade
                    </p>
                </div>
            </div>

            {/* Modal */}
            {selectedFeature && (
                <RoadmapModal
                    feature={selectedFeature}
                    onClose={() => setSelectedFeature(null)}
                />
            )}
        </div>
    );
};

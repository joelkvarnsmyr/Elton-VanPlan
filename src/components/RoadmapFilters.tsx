import React from 'react';
import { Filter, LayoutGrid, List, Search, X, TrendingUp, CheckCircle2, Construction, Circle } from 'lucide-react';

export type ViewMode = 'kanban' | 'list';
export type StatusFilter = 'all' | 'done' | 'in-progress' | 'planned';
export type SortBy = 'id' | 'progress' | 'status' | 'category';

interface RoadmapFiltersProps {
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    statusFilter: StatusFilter;
    onStatusFilterChange: (status: StatusFilter) => void;
    categoryFilter: string;
    onCategoryFilterChange: (category: string) => void;
    sortBy: SortBy;
    onSortByChange: (sort: SortBy) => void;
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    categories: string[];
}

export const RoadmapFilters: React.FC<RoadmapFiltersProps> = ({
    viewMode,
    onViewModeChange,
    statusFilter,
    onStatusFilterChange,
    categoryFilter,
    onCategoryFilterChange,
    sortBy,
    onSortByChange,
    searchQuery,
    onSearchQueryChange,
    categories
}) => {
    const statusOptions: { value: StatusFilter; label: string; icon: React.ReactNode; color: string }[] = [
        { value: 'all', label: 'Alla', icon: <Filter size={14} />, color: 'slate' },
        { value: 'done', label: 'Lanserad', icon: <CheckCircle2 size={14} />, color: 'teal' },
        { value: 'in-progress', label: 'Pågår', icon: <Construction size={14} />, color: 'amber' },
        { value: 'planned', label: 'Planerad', icon: <Circle size={14} />, color: 'slate' }
    ];

    const sortOptions: { value: SortBy; label: string }[] = [
        { value: 'id', label: 'ID' },
        { value: 'progress', label: 'Framsteg' },
        { value: 'status', label: 'Status' },
        { value: 'category', label: 'Kategori' }
    ];

    return (
        <div className="bg-white dark:bg-nordic-dark-surface rounded-2xl shadow-sm border border-slate-200 dark:border-nordic-charcoal p-4 mb-6">
            {/* Top Row - View Mode & Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                {/* View Mode Toggle */}
                <div className="flex bg-slate-100 dark:bg-nordic-charcoal rounded-lg p-1">
                    <button
                        onClick={() => onViewModeChange('kanban')}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all
                            ${viewMode === 'kanban'
                                ? 'bg-white dark:bg-nordic-dark-bg shadow-sm text-nordic-charcoal dark:text-nordic-ice'
                                : 'text-slate-500 hover:text-slate-700'}
                        `}
                    >
                        <LayoutGrid size={16} />
                        <span className="hidden sm:inline">Kanban</span>
                    </button>
                    <button
                        onClick={() => onViewModeChange('list')}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all
                            ${viewMode === 'list'
                                ? 'bg-white dark:bg-nordic-dark-bg shadow-sm text-nordic-charcoal dark:text-nordic-ice'
                                : 'text-slate-500 hover:text-slate-700'}
                        `}
                    >
                        <List size={16} />
                        <span className="hidden sm:inline">Lista</span>
                    </button>
                </div>

                {/* Search */}
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Sök features..."
                        value={searchQuery}
                        onChange={(e) => onSearchQueryChange(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-nordic-charcoal border border-slate-200 dark:border-nordic-charcoal rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => onSearchQueryChange('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Bottom Row - Filters & Sort */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Status Filter */}
                <div className="flex flex-wrap gap-2">
                    {statusOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => onStatusFilterChange(option.value)}
                            className={`
                                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                                ${statusFilter === option.value
                                    ? `bg-${option.color}-100 dark:bg-${option.color}-900/30 text-${option.color}-700 dark:text-${option.color}-300 border-${option.color}-300 dark:border-${option.color}-700`
                                    : 'bg-slate-50 dark:bg-nordic-charcoal text-slate-600 dark:text-slate-400 border-slate-200 dark:border-nordic-charcoal hover:bg-slate-100'}
                            `}
                        >
                            {option.icon}
                            <span>{option.label}</span>
                        </button>
                    ))}
                </div>

                {/* Category Filter */}
                <div className="flex-1 flex flex-wrap gap-2">
                    <button
                        onClick={() => onCategoryFilterChange('all')}
                        className={`
                            px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                            ${categoryFilter === 'all'
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                                : 'bg-slate-50 dark:bg-nordic-charcoal text-slate-600 dark:text-slate-400 border-slate-200 dark:border-nordic-charcoal hover:bg-slate-100'}
                        `}
                    >
                        Alla kategorier
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => onCategoryFilterChange(category)}
                            className={`
                                px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                                ${categoryFilter === category
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                                    : 'bg-slate-50 dark:bg-nordic-charcoal text-slate-600 dark:text-slate-400 border-slate-200 dark:border-nordic-charcoal hover:bg-slate-100'}
                            `}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Sort By */}
                <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-slate-400" />
                    <select
                        value={sortBy}
                        onChange={(e) => onSortByChange(e.target.value as SortBy)}
                        className="px-3 py-1.5 bg-slate-50 dark:bg-nordic-charcoal border border-slate-200 dark:border-nordic-charcoal rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        {sortOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                Sortera: {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

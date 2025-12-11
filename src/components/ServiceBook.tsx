import React, { useState, useMemo, useEffect } from 'react';
import { X, Wrench, Plus, Calendar, User, AlertCircle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { ServiceItem, Project } from '@/types/types';
import { getServiceLog, addServiceEntry, deleteServiceEntry } from '@/services/db';

interface ServiceBookProps {
    project: Project;
    onClose: () => void;
    onUpdate?: () => void;
}

export const ServiceBook: React.FC<ServiceBookProps> = ({ project, onClose, onUpdate }) => {
    const [serviceLog, setServiceLog] = useState<ServiceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        description: '',
        mileage: '',
        performer: '',
        type: 'Service' as ServiceItem['type']
    });

    // Load service log from sub-collection
    useEffect(() => {
        const loadServiceLog = async () => {
            setLoading(true);
            try {
                const data = await getServiceLog(project.id);
                setServiceLog(data);
            } catch (error) {
                console.error('Failed to load service log:', error);
            } finally {
                setLoading(false);
            }
        };
        loadServiceLog();
    }, [project.id]);

    const sortedServiceLog = useMemo(() => {
        return [...serviceLog].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }, [serviceLog]);

    // Group by year for timeline view
    const servicesByYear = useMemo(() => {
        const grouped: { [year: string]: ServiceItem[] } = {};
        sortedServiceLog.forEach(service => {
            const year = new Date(service.date).getFullYear().toString();
            if (!grouped[year]) grouped[year] = [];
            grouped[year].push(service);
        });
        return grouped;
    }, [sortedServiceLog]);

    // Calculate stats
    const stats = useMemo(() => {
        const now = new Date();
        const lastService = sortedServiceLog.find(s => s.type === 'Service');
        const lastInspection = sortedServiceLog.find(s => s.type === 'Besiktning');

        let daysSinceLastService = 0;
        if (lastService) {
            daysSinceLastService = Math.floor((now.getTime() - new Date(lastService.date).getTime()) / (1000 * 60 * 60 * 24));
        }

        let daysUntilNextInspection = 0;
        if (project.vehicleData?.inspection?.next) {
            const nextInspectionDate = new Date(project.vehicleData.inspection.next);
            daysUntilNextInspection = Math.floor((nextInspectionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        }

        return {
            totalServices: sortedServiceLog.filter(s => s.type === 'Service').length,
            totalRepairs: sortedServiceLog.filter(s => s.type === 'Reparation').length,
            totalInspections: sortedServiceLog.filter(s => s.type === 'Besiktning').length,
            daysSinceLastService,
            daysUntilNextInspection,
            lastServiceDate: lastService?.date || null,
            lastInspectionDate: lastInspection?.date || null
        };
    }, [sortedServiceLog, project.vehicleData]);

    const getTypeIcon = (type: ServiceItem['type']) => {
        switch (type) {
            case 'Service': return <Wrench size={16} className="text-blue-500" />;
            case 'Reparation': return <AlertCircle size={16} className="text-orange-500" />;
            case 'Besiktning': return <CheckCircle2 size={16} className="text-teal-500" />;
            default: return <Calendar size={16} className="text-slate-500" />;
        }
    };

    const getTypeColor = (type: ServiceItem['type']) => {
        switch (type) {
            case 'Service': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Reparation': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'Besiktning': return 'bg-teal-100 text-teal-700 border-teal-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const newEntry = await addServiceEntry(project.id, {
                date: formData.date,
                description: formData.description,
                mileage: formData.mileage,
                performer: formData.performer,
                type: formData.type
            });

            setServiceLog([...serviceLog, newEntry]);
            onUpdate?.();

            setFormData({
                date: new Date().toISOString().split('T')[0],
            description: '',
            mileage: '',
            performer: '',
            type: 'Service'
        });
        setShowAddForm(false);
        } catch (error) {
            console.error('Failed to add service entry:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteServiceEntry(project.id, id);
            setServiceLog(serviceLog.filter(entry => entry.id !== id));
            onUpdate?.();
        } catch (error) {
            console.error('Failed to delete service entry:', error);
        }
    };

    // Service reminder logic
    const serviceReminder = useMemo(() => {
        if (stats.daysSinceLastService === 0) return null;
        if (stats.daysSinceLastService > 365) {
            return {
                severity: 'high',
                message: `Det har gått ${Math.floor(stats.daysSinceLastService / 365)} år sedan senaste servicen!`,
                icon: <AlertCircle size={18} className="text-red-500" />
            };
        }
        if (stats.daysSinceLastService > 180) {
            return {
                severity: 'medium',
                message: `Dags för service snart? (${stats.daysSinceLastService} dagar sedan senast)`,
                icon: <Clock size={18} className="text-orange-500" />
            };
        }
        return null;
    }, [stats.daysSinceLastService]);

    const inspectionReminder = useMemo(() => {
        if (stats.daysUntilNextInspection <= 0) {
            return {
                severity: 'high',
                message: 'Besiktning försenad!',
                icon: <AlertCircle size={18} className="text-red-500" />
            };
        }
        if (stats.daysUntilNextInspection <= 30) {
            return {
                severity: 'medium',
                message: `Besiktning om ${stats.daysUntilNextInspection} dagar`,
                icon: <Clock size={18} className="text-orange-500" />
            };
        }
        if (stats.daysUntilNextInspection <= 60) {
            return {
                severity: 'low',
                message: `Besiktning om ${stats.daysUntilNextInspection} dagar`,
                icon: <CheckCircle2 size={18} className="text-teal-500" />
            };
        }
        return null;
    }, [stats.daysUntilNextInspection]);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-nordic-dark-surface rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                <Wrench size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Servicebok</h2>
                                <p className="text-teal-100 text-sm">Service, reparationer & besiktningar</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <Wrench size={16} className="text-teal-200" />
                                <p className="text-xs text-teal-200">Service</p>
                            </div>
                            <p className="text-2xl font-bold">{stats.totalServices}</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertCircle size={16} className="text-teal-200" />
                                <p className="text-xs text-teal-200">Reparationer</p>
                            </div>
                            <p className="text-2xl font-bold">{stats.totalRepairs}</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <CheckCircle2 size={16} className="text-teal-200" />
                                <p className="text-xs text-teal-200">Besiktningar</p>
                            </div>
                            <p className="text-2xl font-bold">{stats.totalInspections}</p>
                        </div>
                    </div>

                    {/* Reminders */}
                    <div className="space-y-2">
                        {serviceReminder && (
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                                serviceReminder.severity === 'high' ? 'bg-red-500/20' : 'bg-orange-500/20'
                            }`}>
                                {serviceReminder.icon}
                                <span className="text-sm font-medium">{serviceReminder.message}</span>
                            </div>
                        )}
                        {inspectionReminder && (
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                                inspectionReminder.severity === 'high' ? 'bg-red-500/20' :
                                inspectionReminder.severity === 'medium' ? 'bg-orange-500/20' :
                                'bg-teal-500/20'
                            }`}>
                                {inspectionReminder.icon}
                                <span className="text-sm font-medium">{inspectionReminder.message}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
                    {/* Add Button */}
                    {!showAddForm && (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="w-full mb-4 p-4 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                            <Plus size={20} />
                            Lägg till service/reparation
                        </button>
                    )}

                    {/* Add Form */}
                    {showAddForm && (
                        <form onSubmit={handleSubmit} className="mb-6 bg-slate-50 dark:bg-nordic-charcoal rounded-2xl p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Typ
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as ServiceItem['type'] })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-nordic-charcoal rounded-lg bg-white dark:bg-nordic-dark-bg"
                                        required
                                    >
                                        <option value="Service">Service</option>
                                        <option value="Reparation">Reparation</option>
                                        <option value="Besiktning">Besiktning</option>
                                        <option value="Övrigt">Övrigt</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Datum
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-nordic-charcoal rounded-lg bg-white dark:bg-nordic-dark-bg"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Mätarställning (km)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.mileage}
                                        onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-nordic-charcoal rounded-lg bg-white dark:bg-nordic-dark-bg"
                                        placeholder="12345"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Utförare
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.performer}
                                        onChange={(e) => setFormData({ ...formData, performer: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-nordic-charcoal rounded-lg bg-white dark:bg-nordic-dark-bg"
                                        placeholder="Verkstad AB / Eget"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Beskrivning
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-nordic-charcoal rounded-lg bg-white dark:bg-nordic-dark-bg"
                                        rows={3}
                                        placeholder="Bytte olja, filter, bromsbelägg..."
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors"
                                >
                                    Spara
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-nordic-dark-bg dark:hover:bg-nordic-charcoal text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
                                >
                                    Avbryt
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Timeline View */}
                    {sortedServiceLog.length === 0 ? (
                        <div className="text-center py-12">
                            <Wrench size={48} className="mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500 dark:text-slate-400">
                                Ingen servicehistorik registrerad än
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.keys(servicesByYear).sort((a, b) => parseInt(b) - parseInt(a)).map(year => (
                                <div key={year}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
                                            <span className="font-bold text-teal-700 dark:text-teal-300">{year}</span>
                                        </div>
                                        <div className="flex-1 h-px bg-slate-200 dark:bg-nordic-charcoal"></div>
                                    </div>

                                    <div className="space-y-3 ml-6 border-l-2 border-slate-200 dark:border-nordic-charcoal pl-6">
                                        {servicesByYear[year].map((service) => (
                                            <div
                                                key={service.id}
                                                className="relative bg-white dark:bg-nordic-dark-bg border border-slate-200 dark:border-nordic-charcoal rounded-xl p-4 hover:shadow-md transition-shadow"
                                            >
                                                <div className="absolute -left-[29px] top-6 w-4 h-4 bg-teal-500 rounded-full border-4 border-white dark:border-nordic-dark-surface"></div>

                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-md border ${getTypeColor(service.type)}`}>
                                                                {getTypeIcon(service.type)}
                                                                {service.type}
                                                            </span>
                                                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                                                {service.date}
                                                            </span>
                                                        </div>
                                                        <p className="font-bold text-nordic-charcoal dark:text-nordic-ice mb-1">
                                                            {service.description}
                                                        </p>
                                                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                                                            <span className="flex items-center gap-1">
                                                                <TrendingUp size={14} />
                                                                {service.mileage} km
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <User size={14} />
                                                                {service.performer}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDelete(service.id)}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

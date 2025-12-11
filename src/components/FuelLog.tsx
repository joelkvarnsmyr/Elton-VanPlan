import React, { useState, useMemo } from 'react';
import { X, Fuel, TrendingUp, TrendingDown, Plus, Calendar, DollarSign, Activity } from 'lucide-react';
import { FuelLogItem, Project } from '@/types/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FuelLogProps {
    project: Project;
    onClose: () => void;
    onUpdate: (updatedFuelLog: FuelLogItem[]) => void;
}

export const FuelLog: React.FC<FuelLogProps> = ({ project, onClose, onUpdate }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        mileage: '',
        liters: '',
        pricePerLiter: '',
        fullTank: true
    });

    const sortedFuelLog = useMemo(() => {
        return [...(project.fuelLog || [])].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }, [project.fuelLog]);

    // Calculate consumption (L/100km) between full tanks
    const consumptionData = useMemo(() => {
        const data: { date: string; consumption: number; cost: number }[] = [];
        const fullTankEntries = sortedFuelLog.filter(e => e.fullTank).reverse();

        for (let i = 1; i < fullTankEntries.length; i++) {
            const current = fullTankEntries[i];
            const previous = fullTankEntries[i - 1];
            const distance = current.mileage - previous.mileage;

            if (distance > 0) {
                const consumption = (current.liters / distance) * 100;
                data.push({
                    date: current.date,
                    consumption: Math.round(consumption * 10) / 10,
                    cost: current.totalCost
                });
            }
        }

        return data.reverse();
    }, [sortedFuelLog]);

    // Calculate stats
    const stats = useMemo(() => {
        if (sortedFuelLog.length === 0) return { avgConsumption: 0, totalCost: 0, totalLiters: 0, avgCostPerLiter: 0 };

        const totalCost = sortedFuelLog.reduce((sum, entry) => sum + entry.totalCost, 0);
        const totalLiters = sortedFuelLog.reduce((sum, entry) => sum + entry.liters, 0);
        const avgConsumption = consumptionData.length > 0
            ? consumptionData.reduce((sum, d) => sum + d.consumption, 0) / consumptionData.length
            : 0;
        const avgCostPerLiter = totalLiters > 0 ? totalCost / totalLiters : 0;

        return {
            avgConsumption: Math.round(avgConsumption * 10) / 10,
            totalCost: Math.round(totalCost),
            totalLiters: Math.round(totalLiters),
            avgCostPerLiter: Math.round(avgCostPerLiter * 100) / 100
        };
    }, [sortedFuelLog, consumptionData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newEntry: FuelLogItem = {
            id: `fuel_${Date.now()}`,
            date: formData.date,
            mileage: parseInt(formData.mileage),
            liters: parseFloat(formData.liters),
            pricePerLiter: parseFloat(formData.pricePerLiter),
            totalCost: parseFloat(formData.liters) * parseFloat(formData.pricePerLiter),
            fullTank: formData.fullTank
        };

        const updatedFuelLog = [...(project.fuelLog || []), newEntry];
        onUpdate(updatedFuelLog);

        setFormData({
            date: new Date().toISOString().split('T')[0],
            mileage: '',
            liters: '',
            pricePerLiter: '',
            fullTank: true
        });
        setShowAddForm(false);
    };

    const handleDelete = (id: string) => {
        const updatedFuelLog = (project.fuelLog || []).filter(entry => entry.id !== id);
        onUpdate(updatedFuelLog);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-nordic-dark-surface rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                <Fuel size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Bränslelogg</h2>
                                <p className="text-blue-100 text-sm">Spåra förbrukning och kostnader</p>
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
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <Activity size={16} className="text-blue-200" />
                                <p className="text-xs text-blue-200">Snittförbrukning</p>
                            </div>
                            <p className="text-2xl font-bold">{stats.avgConsumption}</p>
                            <p className="text-xs text-blue-200">L/100km</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <DollarSign size={16} className="text-blue-200" />
                                <p className="text-xs text-blue-200">Total kostnad</p>
                            </div>
                            <p className="text-2xl font-bold">{stats.totalCost}</p>
                            <p className="text-xs text-blue-200">kr</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <Fuel size={16} className="text-blue-200" />
                                <p className="text-xs text-blue-200">Totalt tankad</p>
                            </div>
                            <p className="text-2xl font-bold">{stats.totalLiters}</p>
                            <p className="text-xs text-blue-200">liter</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp size={16} className="text-blue-200" />
                                <p className="text-xs text-blue-200">Snittpris</p>
                            </div>
                            <p className="text-2xl font-bold">{stats.avgCostPerLiter}</p>
                            <p className="text-xs text-blue-200">kr/L</p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
                    {/* Chart */}
                    {consumptionData.length > 1 && (
                        <div className="mb-6 bg-slate-50 dark:bg-nordic-charcoal rounded-2xl p-4">
                            <h3 className="font-bold text-nordic-charcoal dark:text-nordic-ice mb-3 flex items-center gap-2">
                                <TrendingUp size={18} className="text-blue-500" />
                                Förbrukningstrend
                            </h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={consumptionData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 12 }}
                                        stroke="#64748b"
                                    />
                                    <YAxis
                                        tick={{ fontSize: 12 }}
                                        stroke="#64748b"
                                        label={{ value: 'L/100km', angle: -90, position: 'insideLeft' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="consumption"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        dot={{ fill: '#3b82f6', r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Add Button */}
                    {!showAddForm && (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="w-full mb-4 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                            <Plus size={20} />
                            Lägg till tankning
                        </button>
                    )}

                    {/* Add Form */}
                    {showAddForm && (
                        <form onSubmit={handleSubmit} className="mb-6 bg-slate-50 dark:bg-nordic-charcoal rounded-2xl p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Datum
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-nordic-charcoal rounded-lg"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Mätarställning (km)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.mileage}
                                        onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-nordic-charcoal rounded-lg"
                                        placeholder="12345"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Liter
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.liters}
                                        onChange={(e) => setFormData({ ...formData, liters: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-nordic-charcoal rounded-lg"
                                        placeholder="45.5"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Pris per liter (kr)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.pricePerLiter}
                                        onChange={(e) => setFormData({ ...formData, pricePerLiter: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-nordic-charcoal rounded-lg"
                                        placeholder="18.95"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.fullTank}
                                        onChange={(e) => setFormData({ ...formData, fullTank: e.target.checked })}
                                        className="w-4 h-4 text-blue-500"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">
                                        Full tank (krävs för förbrukningsberäkning)
                                    </span>
                                </label>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
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

                    {/* Fuel Log List */}
                    <div className="space-y-2">
                        {sortedFuelLog.length === 0 ? (
                            <div className="text-center py-12">
                                <Fuel size={48} className="mx-auto text-slate-300 mb-3" />
                                <p className="text-slate-500 dark:text-slate-400">
                                    Inga tankningar registrerade än
                                </p>
                            </div>
                        ) : (
                            sortedFuelLog.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="bg-white dark:bg-nordic-dark-bg border border-slate-200 dark:border-nordic-charcoal rounded-xl p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                    entry.fullTank ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                    <Fuel size={20} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-nordic-charcoal dark:text-nordic-ice">
                                                            {entry.liters} L
                                                        </p>
                                                        {entry.fullTank && (
                                                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                                                                Full tank
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                                        <Calendar size={14} />
                                                        {entry.date} · {entry.mileage.toLocaleString()} km
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm ml-13">
                                                <span className="text-slate-600 dark:text-slate-400">
                                                    {entry.pricePerLiter.toFixed(2)} kr/L
                                                </span>
                                                <span className="font-bold text-nordic-charcoal dark:text-nordic-ice">
                                                    {entry.totalCost.toFixed(2)} kr
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(entry.id)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

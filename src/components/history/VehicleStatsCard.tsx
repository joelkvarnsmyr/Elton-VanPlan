import React from 'react';
import { VehicleStatistics } from '@/types/vehicle-history-types';
import { Users, AlertCircle, Info } from 'lucide-react';

interface VehicleStatsCardProps {
    stats: VehicleStatistics;
}

export const VehicleStatsCard: React.FC<VehicleStatsCardProps> = ({ stats }) => {
    if (!stats) return null;

    return (
        <div className="bg-white dark:bg-nordic-dark-surface p-6 rounded-3xl border border-nordic-ice dark:border-nordic-dark-bg shadow-sm h-full">
            <h3 className="font-serif font-bold text-lg text-nordic-charcoal dark:text-nordic-ice mb-4 flex items-center gap-2">
                <Users size={20} className="text-teal-600" /> Modellstatistik
            </h3>

            <div className="space-y-4">
                <div className="p-4 bg-teal-50 dark:bg-teal-900/10 rounded-2xl flex justify-between items-center">
                    <div>
                        <p className="text-xs font-bold text-teal-800 dark:text-teal-400 uppercase tracking-wider">Antal i Sverige</p>
                        <p className="text-2xl font-bold text-teal-900 dark:text-teal-300">{stats.totalInSweden}</p>
                    </div>
                    <div className="h-10 w-10 bg-teal-200 dark:bg-teal-800 rounded-full flex items-center justify-center text-teal-700 dark:text-teal-200 font-bold text-sm">
                        Total
                    </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex justify-between items-center">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Med samma motor</p>
                        <p className="text-xl font-bold text-slate-700 dark:text-slate-300">{stats.sameEngineType}</p>
                    </div>
                    <Info size={20} className="text-slate-400" />
                </div>

                <div className="text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p>Modell: {stats.model}</p>
                    <p>Uppdaterad: {stats.lastUpdated}</p>
                </div>
            </div>
        </div>
    );
};

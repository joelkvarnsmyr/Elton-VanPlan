import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { MileageReading } from '@/types/vehicle-history-types';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

interface MileageChartProps {
    data: MileageReading[];
}

export const MileageChart: React.FC<MileageChartProps> = ({ data }) => {
    if (!data || data.length === 0) return null;

    // Sort by date
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate slope (avg mil/year) for the last 5 years or all data
    // Simple calc: (last - first) / years
    const first = sortedData[0];
    const last = sortedData[sortedData.length - 1];
    const yearsDiff = (new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24 * 365);
    const avgMilPerYear = yearsDiff > 0 ? Math.round((last.mileage - first.mileage) / yearsDiff) : 0;

    // Prepare data for recharts
    const chartData = sortedData.map(d => ({
        ...d,
        year: new Date(d.date).getFullYear(),
        shortDate: format(new Date(d.date), 'MMM yy', { locale: sv })
    }));

    return (
        <div className="bg-white dark:bg-nordic-dark-surface p-6 rounded-3xl border border-nordic-ice dark:border-nordic-dark-bg shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-serif font-bold text-lg text-nordic-charcoal dark:text-nordic-ice">Mätarställning</h3>
                    <p className="text-sm text-slate-500 dark:text-nordic-dark-muted">Historisk utveckling</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-mono font-bold text-teal-600">{last.mileage} mil</p>
                    <p className="text-xs text-slate-400">~{avgMilPerYear} mil/år</p>
                </div>
            </div>

            <div className="h-[250px] w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorMileage" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis
                            dataKey="shortDate"
                            stroke="#94A3B8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#94A3B8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            labelStyle={{ color: '#64748B', fontWeight: 'bold' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="mileage"
                            stroke="#0d9488"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorMileage)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 text-xs text-center text-amber-600/70 bg-amber-50 dark:bg-amber-900/10 p-2 rounded-lg">
                ⚠️ OBS: 5-siffrig mätare. Siffrorna visar mätarställning, ej totalsträcka.
            </div>
        </div>
    );
};

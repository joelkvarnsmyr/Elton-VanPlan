import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PriceHistoryPoint } from '@/types/vehicle-history-types';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

interface PriceHistoryChartProps {
    data: PriceHistoryPoint[];
}

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ data }) => {
    if (!data || data.length === 0) return null;

    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latestPrice = sortedData[sortedData.length - 1];

    const chartData = sortedData.map(d => ({
        ...d,
        formattedDate: format(new Date(d.date), 'MMM yyyy', { locale: sv }),
        price: d.estimatedPrice
    }));

    return (
        <div className="bg-white dark:bg-nordic-dark-surface p-6 rounded-3xl border border-nordic-ice dark:border-nordic-dark-bg shadow-sm h-full">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="font-serif font-bold text-lg text-nordic-charcoal dark:text-nordic-ice">Prishistorik</h3>
                    <p className="text-sm text-slate-500 dark:text-nordic-dark-muted">Annonserade priser</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-mono font-bold text-amber-600">{latestPrice.estimatedPrice.toLocaleString()} kr</p>
                    <p className="text-xs text-slate-400">{format(new Date(latestPrice.date), 'MMM yyyy')}</p>
                </div>
            </div>

            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis
                            dataKey="formattedDate"
                            stroke="#94A3B8"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#94A3B8"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => `${val / 1000}k`}
                        />
                        <Tooltip
                            cursor={{ fill: '#f1f5f9' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            labelStyle={{ color: '#64748B', fontWeight: 'bold' }}
                            formatter={(value: number) => [`${value.toLocaleString()} kr`, 'Pris']}
                        />
                        <Bar
                            dataKey="price"
                            fill="#d97706"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={50}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

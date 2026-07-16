'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface RevenueChartProps {
    data: {
        date: string;
        revenue: number;
        orders: number;
    }[];
    timeframe: number;
    onTimeframeChange: (days: number) => void;
}

export default function RevenueChart({ data, timeframe, onTimeframeChange }: RevenueChartProps) {
    // Format date to short format (e.g., "Jan 23")
    const formattedData = data.map(item => ({
        ...item,
        dateFormatted: new Date(item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        })
    }));

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumSignificantDigits: 3
        }).format(value);
    };

    return (
        <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Revenue Trend</h3>
                <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-white/5">
                    {[7, 30, 90, 365].map((days) => (
                        <button
                            key={days}
                            onClick={() => onTimeframeChange(days)}
                            className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider transition-all ${timeframe === days
                                ? 'bg-blue-600 text-white shadow'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {days === 365 ? '1Y' : `${days}D`}
                        </button>
                    ))}
                </div>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={formattedData}
                        margin={{
                            top: 10,
                            right: 10,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis
                            dataKey="dateFormatted"
                            stroke="#9ca3af"
                            tick={{ fill: '#9ca3af' }}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={30}
                        />
                        <YAxis
                            stroke="#9ca3af"
                            tick={{ fill: '#9ca3af' }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `₦${value / 1000}k`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0f172a',
                                borderColor: '#1e293b',
                                borderRadius: '0.5rem',
                                color: '#fff'
                            }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value: number | undefined) => [
                                value !== undefined
                                    ? new Intl.NumberFormat('en-NG', {
                                        style: 'currency',
                                        currency: 'NGN'
                                    }).format(value)
                                    : 'N/A',
                                'Revenue'
                            ]}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

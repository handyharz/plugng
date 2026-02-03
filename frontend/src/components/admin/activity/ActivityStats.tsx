'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { Activity, Zap } from 'lucide-react';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'];

interface ActivityStatsProps {
    stats: {
        byType: Array<{ _id: string; count: number }>;
        byDate: Array<{ _id: string; count: number }>;
    };
}

export default function ActivityStats({ stats }: ActivityStatsProps) {
    if (!stats?.byDate?.length && !stats?.byType?.length) {
        return null;
    }

    const totalActions = stats.byType.reduce((acc, curr) => acc + curr.count, 0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Activity Volume Chart */}
            <div className="lg:col-span-2 bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />

                <div className="flex items-center justify-between mb-6 relative z-10">
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1">Activity Volume</h3>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Actions over time</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                        <Activity className="w-4 h-4 text-indigo-500" />
                    </div>
                </div>

                <div className="h-[200px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.byDate}>
                            <defs>
                                <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.3} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <XAxis
                                dataKey="_id"
                                stroke="#64748b"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            />
                            <YAxis
                                stroke="#64748b"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    padding: '8px 12px'
                                }}
                                itemStyle={{ color: '#ffffff', fontSize: '12px', fontWeight: 700 }}
                                labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                                cursor={{ fill: '#ffffff05' }}
                            />
                            <Bar
                                dataKey="count"
                                fill="url(#activityGradient)"
                                radius={[4, 4, 0, 0]}
                                barSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Action Distribution */}
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -ml-32 -mb-32 pointer-events-none" />

                <div className="flex items-center justify-between mb-6 relative z-10">
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1">Action Types</h3>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Distribution</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                        <Zap className="w-4 h-4 text-emerald-500" />
                    </div>
                </div>

                <div className="h-[200px] w-full relative z-10 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={stats.byType}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="count"
                                stroke="none"
                            >
                                {stats.byType.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    padding: '8px 12px'
                                }}
                                itemStyle={{ color: '#ffffff', fontSize: '12px', fontWeight: 700 }}
                                labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-black text-white">{totalActions}</span>
                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Total</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

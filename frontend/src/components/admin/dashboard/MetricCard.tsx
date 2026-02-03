'use client';

import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon: LucideIcon;
    iconColor?: string;
}

export default function MetricCard({
    title,
    value,
    change,
    changeType = 'neutral',
    icon: Icon,
    iconColor = 'text-blue-500'
}: MetricCardProps) {
    const changeColors = {
        positive: 'text-green-500',
        negative: 'text-red-500',
        neutral: 'text-slate-400'
    };

    return (
        <div className="bg-slate-900 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                        {title}
                    </p>
                    <p className="text-3xl font-bold text-white mt-2">
                        {value}
                    </p>
                    {change && (
                        <p className={`text-sm font-medium mt-2 ${changeColors[changeType]}`}>
                            {change}
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-lg bg-white/5 ${iconColor}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
}

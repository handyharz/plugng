'use client';

import { ArrowRight, FileJson } from 'lucide-react';

interface ChangeDiffViewerProps {
    changes: any;
    details?: string;
}

export default function ChangeDiffViewer({ changes, details }: ChangeDiffViewerProps) {
    if (!changes && !details) return null;

    // Direct changes object matching { before, after } structure
    const hasBeforeAfter = changes && typeof changes === 'object' && ('before' in changes || 'after' in changes);

    if (hasBeforeAfter) {
        return (
            <div className="mt-4 bg-black/30 rounded-xl p-4 border border-white/5 font-mono text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Before State */}
                    {changes.before && (
                        <div className="space-y-2">
                            <span className="text-red-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                Previous Value
                            </span>
                            <pre className="bg-red-500/5 text-red-200/80 p-3 rounded-lg overflow-x-auto border border-red-500/10">
                                {JSON.stringify(changes.before, null, 2)}
                            </pre>
                        </div>
                    )}

                    {/* After State */}
                    {changes.after && (
                        <div className="space-y-2">
                            <span className="text-emerald-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                New Value
                            </span>
                            <pre className="bg-emerald-500/5 text-emerald-200/80 p-3 rounded-lg overflow-x-auto border border-emerald-500/10">
                                {JSON.stringify(changes.after, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Fallback for simple key-value changes or just JSON dump
    if (changes && typeof changes === 'object' && Object.keys(changes).length > 0) {
        return (
            <div className="mt-4 bg-black/30 rounded-xl p-4 border border-white/5 font-mono text-xs">
                <div className="flex items-center gap-2 mb-2 text-slate-400">
                    <FileJson className="w-3.5 h-3.5" />
                    <span className="uppercase text-[10px] font-bold tracking-wider">Change Metadata</span>
                </div>
                <pre className="bg-slate-800/50 text-slate-300 p-3 rounded-lg overflow-x-auto border border-white/5">
                    {JSON.stringify(changes, null, 2)}
                </pre>
            </div>
        );
    }

    return null;
}

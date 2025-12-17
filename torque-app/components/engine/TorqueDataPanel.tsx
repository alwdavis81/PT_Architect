"use client";

import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Point {
    rpm: number;
    ratio: number;
}

interface TorqueDataPanelProps {
    points: Point[];
    setPoints: (points: Point[]) => void;
}

export function TorqueDataPanel({ points, setPoints }: TorqueDataPanelProps) {

    const handleChange = (index: number, field: keyof Point, value: string) => {
        const numVal = parseFloat(value);
        // Allow saving even if NaN temporarily? No, input type number handles validity mostly.
        const newPoints = [...points];
        newPoints[index] = { ...newPoints[index], [field]: isNaN(numVal) ? 0 : numVal };
        // Should sort? Maybe not while editing.
        setPoints(newPoints);
    };

    const removePoint = (index: number) => {
        if (points.length <= 2) return; // Prevent deleting all points
        const newPoints = points.filter((_, i) => i !== index);
        setPoints(newPoints);
    };

    const addPoint = () => {
        // intelligent add: find max rpm add 100?
        const maxRpm = Math.max(...points.map(p => p.rpm), 0);
        setPoints([...points, { rpm: maxRpm + 200, ratio: 0.5 }]);
    };

    return (
        <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950/30">
            <div className="overflow-y-auto flex-1 p-2">
                <table className="w-full text-sm">
                    <thead className="text-xs text-muted-foreground bg-zinc-100 dark:bg-zinc-900/50 sticky top-0 z-10">
                        <tr>
                            <th className="px-2 py-2 text-left">RPM</th>
                            <th className="px-2 py-2 text-left">Ratio (0-1)</th>
                            <th className="w-8"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {points.map((point, idx) => (
                            <tr key={idx} className="group hover:bg-zinc-100 dark:hover:bg-zinc-900/40 transition-colors">
                                <td className="p-2">
                                    <input
                                        type="number"
                                        value={point.rpm}
                                        onChange={(e) => handleChange(idx, "rpm", e.target.value)}
                                        className="w-full bg-transparent border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-accent rounded px-2 py-1 outline-none font-mono text-zinc-900 dark:text-zinc-300"
                                    />
                                </td>
                                <td className="p-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="1.5"
                                        value={point.ratio}
                                        onChange={(e) => handleChange(idx, "ratio", e.target.value)}
                                        className={cn(
                                            "w-full bg-transparent border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-accent rounded px-2 py-1 outline-none font-mono",
                                            point.ratio > 1 ? "text-amber-600 dark:text-amber-500" : "text-zinc-900 dark:text-zinc-300"
                                        )}
                                    />
                                </td>
                                <td className="p-2 text-center">
                                    <button
                                        onClick={() => removePoint(idx)}
                                        className="text-zinc-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Remove point"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-border bg-card">
                <button
                    onClick={addPoint}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-accent hover:text-accent transition-all hover:bg-accent/5 text-sm"
                >
                    <Plus className="w-4 h-4" /> Add RPM Point
                </button>
            </div>
        </div>
    );
}

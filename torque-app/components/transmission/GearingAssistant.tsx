"use client";

import { useState, useEffect } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { suggestOptimalDiff } from "@/lib/transmissionUtils";

interface Gear {
    name: string;
    ratio: number;
}

interface GearingAssistantProps {
    gears: Gear[];
    tireDiameter: number;
    currentDiff: number;
    onApplyDiff: (diff: number) => void;
    defaultTargetRpm?: number;
}

export function GearingAssistant({ gears, tireDiameter, currentDiff, onApplyDiff, defaultTargetRpm = 1300 }: GearingAssistantProps) {
    const [targetSpeed, setTargetSpeed] = useState(65);
    const [targetRpm, setTargetRpm] = useState(defaultTargetRpm);

    // Sync with engine when it changes
    useEffect(() => {
        setTargetRpm(defaultTargetRpm);
    }, [defaultTargetRpm]);

    const fwdGears = gears.filter(g => g.ratio > 0).sort((a, b) => a.ratio - b.ratio);
    const topGear = fwdGears[0]; // Lowest ratio is highest gear

    const suggestedDiff = topGear
        ? suggestOptimalDiff(targetSpeed, targetRpm, topGear.ratio, tireDiameter)
        : 0;

    return (
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
            <h3 className="text-emerald-500 font-semibold flex items-center gap-2 mb-3 text-sm">
                <Sparkles className="w-4 h-4" /> Gearing Assistant
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="text-[10px] text-zinc-500 uppercase mb-1 block">Cruise Speed (MPH)</label>
                    <input
                        type="number"
                        value={targetSpeed}
                        onChange={(e) => setTargetSpeed(parseFloat(e.target.value))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-sm outline-none focus:border-emerald-500 transition-colors"
                    />
                </div>
                <div>
                    <label className="text-[10px] text-zinc-500 uppercase mb-1 block">Target RPM</label>
                    <input
                        type="number"
                        value={targetRpm}
                        onChange={(e) => setTargetRpm(parseFloat(e.target.value))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-sm outline-none focus:border-emerald-500 transition-colors"
                    />
                </div>
            </div>

            <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800 flex items-center justify-between">
                <div>
                    <div className="text-[10px] text-zinc-500 uppercase">Recommended Diff</div>
                    <div className="text-xl font-mono font-bold text-emerald-400">
                        {suggestedDiff > 0 ? suggestedDiff.toFixed(2) : "N/A"}
                    </div>
                </div>
                <button
                    onClick={() => onApplyDiff(parseFloat(suggestedDiff.toFixed(2)))}
                    disabled={!suggestedDiff || suggestedDiff === currentDiff}
                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:bg-zinc-800 text-white rounded text-xs font-medium transition-all"
                >
                    Apply <ArrowRight className="w-3 h-3" />
                </button>
            </div>

            <p className="text-[10px] text-zinc-500 mt-3 leading-tight">
                Calculates the final drive ratio needed to hit {targetSpeed} MPH at {targetRpm} RPM in your highest gear ({topGear?.name || "?"} at {topGear?.ratio || "?"}).
            </p>
        </div>
    );
}

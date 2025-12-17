"use client";

import { Activity, Settings2 } from "lucide-react";

export interface ExtendedEngineSpecs {
    // Limits
    rpmLimit: number; // Governor
    rpmLimitNeutral: number;
    rpmIdle: number;

    // Brake
    engineBrake: number; // Strength e.g. 2.0
    engineBrakeDownshift: boolean; // 0 or 1
    engineBrakePositions: number; // 3

    // Ranges
    rpmRangeLowGear: { min: number; max: number };
    rpmRangeHighGear: { min: number; max: number };
    rpmRangePower?: { min: number; max: number };
    rpmRangeEngineBrake: { min: number; max: number };
}

interface AdvancedSpecsPanelProps {
    specs: ExtendedEngineSpecs;
    setSpecs: (specs: ExtendedEngineSpecs) => void;
    curvePoints: { rpm: number; ratio: number }[];
}

export function AdvancedSpecsPanel({ specs, setSpecs, curvePoints }: AdvancedSpecsPanelProps) {

    const updateField = (field: keyof ExtendedEngineSpecs, val: any) => {
        setSpecs({ ...specs, [field]: val });
    };

    const updateRange = (field: "rpmRangeLowGear" | "rpmRangeHighGear" | "rpmRangeEngineBrake" | "rpmRangePower", type: "min" | "max", val: number) => {
        setSpecs({
            ...specs,
            [field]: { ...specs[field], [type]: val }
        });
    };

    const autoAdjustRanges = () => {
        const idle = specs.rpmIdle;
        const limit = specs.rpmLimit;

        // Smart Analysis: Find the Torque Plateau (ratio >= 0.98)
        let peakStart = 1100; // Fallback
        let peakEnd = 1600;   // Fallback

        if (curvePoints.length > 0) {
            // Sort just in case
            const sorted = [...curvePoints].sort((a, b) => a.rpm - b.rpm);

            // Find start of peak (first point >= 0.98)
            const startNode = sorted.find(p => p.ratio >= 0.98);
            if (startNode) peakStart = startNode.rpm;

            // Find end of peak (last point >= 0.98)
            const endNode = [...sorted].reverse().find(p => p.ratio >= 0.98);
            if (endNode) peakEnd = endNode.rpm;
        }

        setSpecs({
            ...specs,
            // Low Gear: Wide band. From just above idle to slightly past peak.
            // e.g. 800 - 1700
            rpmRangeLowGear: { min: idle + 200, max: peakEnd + 200 },

            // High Gear: The "Sweet Spot". Stay in peak torque.
            // e.g. 1100 - 1600
            rpmRangeHighGear: { min: peakStart, max: peakEnd },

            // Power Range: From end of torque peak to Governor (Horsepower band)
            rpmRangePower: { min: peakEnd, max: limit - 200 },

            // Brake: Engine friction high at high RPM
            rpmRangeEngineBrake: { min: limit - 800, max: limit + 100 }
        });
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2 text-zinc-700 dark:text-zinc-200">
                    <Settings2 className="w-5 h-5 text-accent" /> Advanced Tuning
                </h3>
                <button
                    onClick={autoAdjustRanges}
                    className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 rounded-md hover:bg-sky-200 dark:hover:bg-sky-900/50 transition-colors border border-sky-200 dark:border-sky-800"
                >
                    <Activity className="w-3 h-3" /> Auto-Adjust Ranges
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* RPM Limits */}
                <div className="space-y-4">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">RPM Limits</h4>
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Idle RPM</label>
                            <input
                                type="number"
                                value={specs.rpmIdle}
                                onChange={(e) => updateField("rpmIdle", parseInt(e.target.value))}
                                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-accent outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Limit (Load)</label>
                            <input
                                type="number"
                                value={specs.rpmLimit}
                                onChange={(e) => updateField("rpmLimit", parseInt(e.target.value))}
                                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-accent outline-none font-bold text-red-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Limit (Neutral)</label>
                            <input
                                type="number"
                                value={specs.rpmLimitNeutral}
                                onChange={(e) => updateField("rpmLimitNeutral", parseInt(e.target.value))}
                                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-accent outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Engine Brake */}
                <div className="space-y-4">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-3 h-3" /> Engine Brake
                    </h4>
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Brake Strength</label>
                            <input
                                type="number"
                                step="0.1"
                                value={specs.engineBrake}
                                onChange={(e) => updateField("engineBrake", parseFloat(e.target.value))}
                                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-accent outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Positions</label>
                            <input
                                type="number"
                                value={specs.engineBrakePositions}
                                onChange={(e) => updateField("engineBrakePositions", parseInt(e.target.value))}
                                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-accent outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                            <input
                                type="checkbox"
                                checked={specs.engineBrakeDownshift}
                                onChange={(e) => updateField("engineBrakeDownshift", e.target.checked)}
                                className="w-4 h-4 rounded border-zinc-300 text-accent focus:ring-accent"
                            />
                            <label className="text-sm text-zinc-700 dark:text-zinc-300">Allow Downshift</label>
                        </div>
                    </div>
                </div>

                {/* Smart RPM Ranges */}
                <div className="space-y-4">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Operation Ranges</h4>

                    {/* Low Gear */}
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded border border-zinc-200 dark:border-zinc-800">
                        <label className="text-xs text-zinc-500 mb-2 block">Low Gear Range</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={specs.rpmRangeLowGear.min}
                                onChange={(e) => updateRange("rpmRangeLowGear", "min", parseInt(e.target.value))}
                                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-sm outline-none"
                                placeholder="Min"
                            />
                            <span className="text-zinc-400">-</span>
                            <input
                                type="number"
                                value={specs.rpmRangeLowGear.max}
                                onChange={(e) => updateRange("rpmRangeLowGear", "max", parseInt(e.target.value))}
                                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-sm outline-none"
                                placeholder="Max"
                            />
                        </div>
                    </div>

                    {/* High Gear */}
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded border border-zinc-200 dark:border-zinc-800">
                        <label className="text-xs text-zinc-500 mb-2 block">High Gear Range</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={specs.rpmRangeHighGear.min}
                                onChange={(e) => updateRange("rpmRangeHighGear", "min", parseInt(e.target.value))}
                                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-sm outline-none"
                                placeholder="Min"
                            />
                            <span className="text-zinc-400">-</span>
                            <input
                                type="number"
                                value={specs.rpmRangeHighGear.max}
                                onChange={(e) => updateRange("rpmRangeHighGear", "max", parseInt(e.target.value))}
                                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-sm outline-none"
                                placeholder="Max"
                            />
                        </div>
                    </div>

                    {/* Power Range */}
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded border border-zinc-200 dark:border-zinc-800">
                        <label className="text-xs text-zinc-500 mb-2 block">Power Range</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={specs.rpmRangePower?.min ?? 1000}
                                onChange={(e) => updateRange("rpmRangePower", "min", parseInt(e.target.value))}
                                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-sm outline-none"
                                placeholder="Min"
                            />
                            <span className="text-zinc-400">-</span>
                            <input
                                type="number"
                                value={specs.rpmRangePower?.max ?? 2000}
                                onChange={(e) => updateRange("rpmRangePower", "max", parseInt(e.target.value))}
                                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-sm outline-none"
                                placeholder="Max"
                            />
                        </div>
                    </div>

                    {/* Brake Range */}
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded border border-zinc-200 dark:border-zinc-800">
                        <label className="text-xs text-zinc-500 mb-2 block">Engine Brake Range</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={specs.rpmRangeEngineBrake.min}
                                onChange={(e) => updateRange("rpmRangeEngineBrake", "min", parseInt(e.target.value))}
                                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-sm outline-none"
                                placeholder="Min"
                            />
                            <span className="text-zinc-400">-</span>
                            <input
                                type="number"
                                value={specs.rpmRangeEngineBrake.max}
                                onChange={(e) => updateRange("rpmRangeEngineBrake", "max", parseInt(e.target.value))}
                                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-sm outline-none"
                                placeholder="Max"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

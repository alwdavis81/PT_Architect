"use client";

import { Settings2, Sparkles } from "lucide-react";
import { TRANSMISSION_PRESETS } from "@/lib/presets";

interface TransSpecs {
    name: string;
    price: number;
    unlockLevel: number;
    diffRatio: number;
    retarder: number; // 0 to 3+
    rpmLimit: number; // For visualization only usually, but good to set bounds
    tireDiameter: number;
    truckInternalName: string;
}

interface TransmissionSpecsPanelProps {
    specs: TransSpecs;
    setSpecs: (specs: TransSpecs) => void;
    onLoadPreset: (id: string) => void;
}

export function TransmissionSpecsPanel({ specs, setSpecs, onLoadPreset }: TransmissionSpecsPanelProps) {

    const updateField = (field: keyof TransSpecs, val: string | number) => {
        setSpecs({ ...specs, [field]: val });
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Quick Start Template */}
            <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <div>
                        <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider block">Quick Start</span>
                        <p className="text-[10px] text-zinc-400">Load verified ratios for Eaton, Allison, etc.</p>
                    </div>
                </div>
                <select
                    className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 rounded text-xs font-medium px-3 py-1.5 outline-none cursor-pointer w-[240px]"
                    onChange={(e) => {
                        if (e.target.value) onLoadPreset(e.target.value);
                        e.target.value = "";
                    }}
                >
                    <option value="">Select Transmission Template...</option>
                    {TRANSMISSION_PRESETS.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex flex-wrap gap-8 items-start">
                {/* File Metadata */}
                <div className="space-y-4 min-w-[200px]">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Definition Data</h4>
                    <div className="grid grid-cols-1 gap-3">
                        <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Internal Name</label>
                            <input
                                type="text"
                                value={specs.name}
                                onChange={(e) => updateField("name", e.target.value)}
                                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-accent outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Truck Internal Name (e.g. peterbilt.389)</label>
                            <input
                                type="text"
                                placeholder="Optional"
                                value={specs.truckInternalName || ""}
                                onChange={(e) => updateField("truckInternalName", e.target.value)}
                                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-accent outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Price</label>
                                <input
                                    type="number"
                                    value={specs.price}
                                    onChange={(e) => updateField("price", parseFloat(e.target.value))}
                                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-accent outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Unlock Lvl</label>
                                <input
                                    type="number"
                                    value={specs.unlockLevel}
                                    onChange={(e) => updateField("unlockLevel", parseFloat(e.target.value))}
                                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-accent outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-px bg-zinc-800 self-stretch hidden md:block"></div>

                {/* Mechanical Specs */}
                <div className="space-y-4 flex-1">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Settings2 className="w-4 h-4" /> Mechanics
                    </h4>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Final Drive (Diff)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={specs.diffRatio}
                                onChange={(e) => updateField("diffRatio", parseFloat(e.target.value))}
                                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-accent outline-none font-mono text-emerald-600 dark:text-emerald-400"
                            />
                            <div className="mt-2 flex flex-col gap-1">
                                <span className="text-[10px] text-zinc-600 uppercase">Presets</span>
                                <div className="flex flex-wrap gap-1">
                                    {[2.64, 3.25, 3.55, 3.70, 4.11].map(ratio => (
                                        <button
                                            key={ratio}
                                            onClick={() => updateField("diffRatio", ratio)}
                                            className="text-[10px] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                                        >
                                            {ratio}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Retarder Steps</label>
                            <input
                                type="number"
                                value={specs.retarder}
                                onChange={(e) => updateField("retarder", parseFloat(e.target.value))}
                                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-accent outline-none font-mono"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-zinc-500 mb-1 block">RPM Limit (Visual)</label>
                            <input
                                type="number"
                                value={specs.rpmLimit}
                                onChange={(e) => updateField("rpmLimit", parseFloat(e.target.value))}
                                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-accent outline-none font-mono text-red-600 dark:text-red-400"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-zinc-500 mb-1 block">Tire Diam. (in)</label>
                            <input
                                type="number"
                                step="0.5"
                                value={specs.tireDiameter}
                                onChange={(e) => updateField("tireDiameter", parseFloat(e.target.value))}
                                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-accent outline-none font-mono"
                            />
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-2">
                        * Tire Diameter is for graph visualization only. Game physics depend on wheel accessories.
                        41.5" is standard 11R22.5.
                    </p>
                </div>
            </div>
        </div>
    );
}

"use client";

import { Calculator, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import { SOUND_LIBRARY } from "@/lib/sounds";
import { ENGINE_PRESETS } from "@/lib/presets";

import { calculateTorqueNm, getRecommendedTorqueLbFt, ftLbToNm, nmToFtLb } from "@/lib/engineUtils";

export interface EngineSpecs {
    id?: string; // Internal engine ID (e.g. cat_3408.kenworth.w900.engine)
    name: string;
    price: number;
    unlockLevel: number;
    targetHp: number;
    targetRpms: number;
    torqueVal: number;
    useImperial: boolean;
    truckInternalName?: string;
    defaults?: string[]; // Sound links
}

interface EngineSpecsPanelProps {
    specs: EngineSpecs;
    setSpecs: (specs: EngineSpecs) => void;
    onGenerateSmartCurve?: () => void;
    onLoadPreset: (id: string) => void;
}

export function EngineSpecsPanel({ specs, setSpecs, onGenerateSmartCurve, onLoadPreset }: EngineSpecsPanelProps) {

    const handleCalculateTorque = () => {
        const torqueNm = calculateTorqueNm(specs.targetHp, specs.targetRpms);

        setSpecs({
            ...specs,
            torqueVal: torqueNm
        });
    };

    const updateField = (field: keyof EngineSpecs, val: string | number | boolean) => {
        setSpecs({ ...specs, [field]: val });
    };

    return (
        <div className="flex flex-wrap gap-8 items-start">
            {/* Quick Start Template */}
            <div className="w-full -mt-2 mb-2 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Quick Start</span>
                    <p className="text-xs text-zinc-400">Load a verified real-world engine configuration.</p>
                </div>
                <select
                    className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 rounded text-xs font-medium px-3 py-1.5 outline-none cursor-pointer w-[200px]"
                    onChange={(e) => {
                        if (e.target.value) onLoadPreset(e.target.value);
                        e.target.value = "";
                    }}
                >
                    <option value="">Select Template...</option>
                    {ENGINE_PRESETS.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.name} ({p.targetHp}HP)
                        </option>
                    ))}
                </select>
            </div>

            {/* Meta Specs */}
            <div className="space-y-4 min-w-[200px]">
                <h4 className="text-sm font-semibold text-zinc-600 dark:text-muted-foreground uppercase tracking-wider">File Metadata</h4>

                <div className="grid grid-cols-1 gap-3">
                    <div>
                        <label className="text-xs text-zinc-500 mb-1 block">Internal Engine Name</label>
                        <input
                            type="text"
                            value={specs.name}
                            onChange={(e) => updateField("name", e.target.value)}
                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-accent outline-none"
                        />
                    </div>

                    {/* Sound Selector */}
                    <div>
                        <label className="text-xs text-zinc-500 mb-1 flex items-center justify-between">
                            Sound Profile
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded">BCS Custom Engines</span>
                        </label>
                        <select
                            value={SOUND_LIBRARY.find(s => specs.defaults?.some(d => d.includes(s.fileName)))?.id || ""}
                            onChange={(e) => {
                                const newSound = SOUND_LIBRARY.find(s => s.id === e.target.value);
                                if (!newSound) {
                                    if (e.target.value === "") {
                                        const clean = (specs.defaults || []).filter(d => !d.trim().startsWith("@include"));
                                        setSpecs({ ...specs, defaults: clean });
                                    }
                                    return;
                                }

                                const newInclude = `@include "${newSound.fileName}"`;
                                let newDefaults = specs.defaults ? [...specs.defaults] : [];
                                newDefaults = newDefaults.filter(d => !d.trim().startsWith("@include"));
                                newDefaults.push(newInclude);

                                setSpecs({ ...specs, defaults: newDefaults });
                            }}
                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-accent outline-none"
                        >
                            <option value="">(No Sound / Custom)</option>
                            {SOUND_LIBRARY.map(sound => (
                                <option key={sound.id} value={sound.id}>
                                    {sound.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-[10px] text-zinc-400 mt-1">
                            Requires compatible sound mod (BCS Custom Engines). Links sound assets automatically.
                        </p>
                    </div>

                    <div>
                        <label className="text-xs text-zinc-500 mb-1 flex items-center justify-between">
                            <span>Truck Internal Name <span className="text-zinc-400 font-normal">(Optional)</span></span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="e.g. peterbilt.389v2"
                                value={specs.truckInternalName || ""}
                                onChange={(e) => updateField("truckInternalName", e.target.value)}
                                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-accent outline-none pr-6"
                            />
                            {/* Quick Lookup Dropdown */}
                            <select
                                className="absolute right-1 top-1.5 bottom-1.5 w-4 opacity-0 cursor-pointer"
                                onChange={(e) => {
                                    if (e.target.value) updateField("truckInternalName", e.target.value);
                                }}
                                value=""
                            >
                                <option value="" disabled>Select Common Truck...</option>
                                <optgroup label="SCS Default">
                                    <option value="peterbilt.389">Peterbilt 389</option>
                                    <option value="kenworth.w900">Kenworth W900</option>
                                    <option value="peterbilt.579">Peterbilt 579</option>
                                    <option value="kenworth.t680">Kenworth T680</option>
                                    <option value="mack.anthem">Mack Anthem</option>
                                    <option value="volvo.vnl">Volvo VNL</option>
                                    <option value="westernstar.49x">Western Star 49X</option>
                                    <option value="freightliner.cascadia">Freightliner Cascadia</option>
                                </optgroup>
                                <optgroup label="Popular Mods">
                                    <option value="pete.jc">Ruda: Peterbilt 389 Glider</option>
                                    <option value="kw.w900">Ruda: Kenworth W900</option>
                                    <option value="kenworth.k100e_of">Overfloater: K100E</option>
                                </optgroup>
                            </select>
                            <div className="absolute right-2 top-2.5 pointer-events-none text-zinc-500">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </div>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-1">
                            Required for paid mods. <span className="text-zinc-500 italic">Try the dropdown arrow ↗</span>
                        </p>
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
                            <label className="text-xs text-zinc-500 mb-1 block">Unlock Level</label>
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

            {/* Calculator Section */}
            <div className="space-y-4 flex-1">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                    <span>Power & Torque</span>
                    <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded p-0.5 border border-zinc-200 dark:border-zinc-800">
                        <button
                            onClick={() => updateField("useImperial", true)}
                            className={`text-[10px] px-2 py-0.5 rounded ${specs.useImperial ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
                        >
                            Imperial
                        </button>
                        <button
                            onClick={() => updateField("useImperial", false)}
                            className={`text-[10px] px-2 py-0.5 rounded ${!specs.useImperial ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
                        >
                            Metric
                        </button>
                    </div>
                </h4>

                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[140px]">
                        <label className="text-xs text-zinc-500 mb-1 block">Target Horsepower</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={specs.targetHp}
                                onChange={(e) => updateField("targetHp", parseFloat(e.target.value))}
                                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-accent outline-none pr-8 font-mono text-amber-600 dark:text-amber-500"
                            />
                            <span className="absolute right-3 top-2 text-xs text-zinc-600">HP</span>
                        </div>
                        {specs.targetHp > 300 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {getRecommendedTorqueLbFt(specs.targetHp).map((rec) => {
                                    const targetNm = Math.round(ftLbToNm(rec));
                                    const isSelected = Math.abs(targetNm - specs.torqueVal) <= 1;

                                    return (
                                        <button
                                            key={rec}
                                            onClick={() => {
                                                setSpecs({ ...specs, torqueVal: targetNm });
                                                // If we had a callback for smart curve generation, we might want to trigger it or let user do it manually.
                                            }}
                                            className={cn(
                                                "text-[10px] px-2 py-0.5 rounded transition-colors border",
                                                isSelected
                                                    ? "bg-emerald-500 text-white border-emerald-600 font-medium"
                                                    : "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-200 dark:hover:bg-emerald-500/20"
                                            )}
                                        >
                                            Use {rec} lb-ft
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-[140px]">
                        <label className="text-xs text-zinc-500 mb-1 block">@ RPM</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={specs.targetRpms}
                                onChange={(e) => updateField("targetRpms", parseFloat(e.target.value))}
                                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-accent outline-none pr-8 font-mono"
                            />
                            <span className="absolute right-3 top-2 text-xs text-zinc-600">RPM</span>
                        </div>
                    </div>

                    <div className="flex-1 min-w-[200px]">
                        <label className="text-xs text-zinc-500 mb-1 block invisible">Actions</label>
                        <div className="flex gap-2 w-full">
                            <button
                                onClick={handleCalculateTorque}
                                className="flex-1 flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded px-2 py-2 text-xs font-medium transition-colors h-[38px] whitespace-nowrap"
                                title="Calculate Peak Torque from Target HP"
                            >
                                <Calculator className="w-3.5 h-3.5" /> Calc Torque
                            </button>
                            <button
                                onClick={() => onGenerateSmartCurve?.()}
                                className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded px-2 py-2 text-xs font-medium transition-colors h-[38px] shadow-lg shadow-indigo-900/20 whitespace-nowrap"
                                title="Generate a torque curve that holds peak torque then drops to hit exactly Target HP"
                            >
                                <Gauge className="w-3.5 h-3.5" /> Smart Curve
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-accent/10 rounded-full text-accent hidden sm:block">
                            <Gauge className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-zinc-500 mb-1">
                                {specs.useImperial ? "Peak Torque (lb·ft)" : "Peak Torque (N·m)"}
                            </div>
                            <div className="relative max-w-[200px]">
                                <input
                                    type="number"
                                    value={specs.useImperial ? Math.round(nmToFtLb(specs.torqueVal)) : specs.torqueVal}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        if (isNaN(val)) return;
                                        if (specs.useImperial) {
                                            // Input is lb-ft, convert to Nm
                                            updateField("torqueVal", Math.round(ftLbToNm(val)));
                                        } else {
                                            // Input is Nm, direct update
                                            updateField("torqueVal", val);
                                        }
                                    }}
                                    className="text-xl font-mono font-bold text-accent bg-transparent border-b border-zinc-700 focus:border-accent outline-none w-full"
                                />
                                <span className="absolute right-0 top-1 text-sm font-normal text-zinc-500 pointer-events-none">
                                    {specs.useImperial ? "lb·ft" : "N·m"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="text-right border-l border-zinc-800 pl-4 min-w-[100px]">
                        <div className="text-xs text-zinc-500">
                            {specs.useImperial ? "Metric Approx" : "Imperial Approx"}
                        </div>
                        <div className="text-sm font-mono text-zinc-300">
                            {specs.useImperial ? (
                                <>
                                    {specs.torqueVal} <span className="text-xs text-zinc-500">N·m</span>
                                </>
                            ) : (
                                <>
                                    {Math.round(nmToFtLb(specs.torqueVal))} <span className="text-xs text-zinc-500">ft·lb</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}

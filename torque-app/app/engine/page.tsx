"use client";

import { useState } from "react";
import { Save, RefreshCw, Settings, FileText, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModLibrary } from "@/components/ModLibrary";
import { TorqueCurveChart } from "@/components/engine/TorqueCurveChart";
import { TorqueDataPanel } from "@/components/engine/TorqueDataPanel";
import { EngineSpecsPanel } from "@/components/engine/EngineSpecsPanel";
import { AdvancedSpecsPanel, ExtendedEngineSpecs } from "@/components/engine/AdvancedSpecsPanel";
import { ExportModal } from "@/components/ExportModal";
import { ImportModal } from "@/components/ImportModal";
import { parseEngineSii } from "@/lib/siiParser";
import { patchEngineSii } from "@/lib/siiPatcher";
import { usePowertrain } from "@/context/PowertrainContext";

import { ENGINE_PRESETS } from "@/lib/presets";

// Default curve for a typical heavy duty diesel engine (SCS style)
// Normalized: 1.0 is peak torque.
const DEFAULT_CURVE = [
    { rpm: 300, ratio: 0 },
    { rpm: 440, ratio: 0.5 },
    { rpm: 1000, ratio: 1 },
    { rpm: 1100, ratio: 1 },
    { rpm: 1400, ratio: 1 },
    { rpm: 1900, ratio: 0.77 },
    { rpm: 2400, ratio: 0.5 },
    { rpm: 2600, ratio: 0 },
];

export default function EngineEditor() {
    const {
        engine: engineSpecs,
        setEngine: setEngineSpecs,
        engineCurve: curvePoints,
        setEngineCurve: setCurvePoints
    } = usePowertrain();

    const [originalContent, setOriginalContent] = useState<string | null>(null);
    const [showLibrary, setShowLibrary] = useState(false);

    // Modal State
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [exportCode, setExportCode] = useState("");

    const handleLoadPreset = (presetId: string) => {
        const preset = ENGINE_PRESETS.find(p => p.id === presetId);
        if (!preset) return;

        // Merge logic:
        // We overwrite physical specs and sound defaults.
        // We PRESERVE the current Truck ID (so it stays compatible with the selected truck).
        setEngineSpecs(prev => ({
            ...prev,
            ...preset,
            // Keep user's context
            truckInternalName: prev.truckInternalName,
            // If we are "tuning" an existing file (originalContent exists), maybe keep ID?
            // If "New", use preset ID?
            // Let's keep the ID strategy dynamic:
            // If originalContent, keep prev.id. If not, maybe use preset.id base?
            id: originalContent ? prev.id : undefined,
        }));

        // If preset has curves, might need to set them? 
        // Current presets rely on Smart Curve generation mostly, but we can trigger it.
        // For now, let's reset curve to default or triggers smart curve update in useEffect?
        // Simpler: Just set a default curve or let user click Smart Curve.
        // Actually, let's trigger Smart Curve logic immediately after setting state? 
        // React state is async. 
        // Better: Reset to default curve visually so they know to regenerate?
        setCurvePoints(DEFAULT_CURVE);
    };

    const handleSmartCurve = () => {
        // Logic: 
        // 1. We have Peak Torque (specs.torqueVal)
        // 2. We have Target HP (specs.targetHp) at Target RPM (specs.targetRpms)
        // 3. We want a curve that holds 1.0 ratio as long as possible, then drops.

        // Basic Physics: HP = (Torque * RPM) / 5252
        // Max Allowed Torque at any RPM = (TargetHP * 5252) / RPM

        const points = [];
        const peakTorque = engineSpecs.torqueVal;

        // Define key RPM points
        const rpms = [300, 600, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2400, 2600];

        for (const rpm of rpms) {
            let ratio = 0;

            // Idle / Low RPM ramp up
            if (rpm < 1000) {
                // Linear ramp from 0 at 300 to 1 at 1000? 
                // Let's use standard SCS ramp behavior
                if (rpm === 300) ratio = 0;
                else if (rpm === 440) ratio = 0.5; // typical
                else if (rpm === 600) ratio = 0.7; // idle
                else ratio = 0.9 + ((rpm - 600) / 400) * 0.1;
            } else {
                // High RPM Physics Check
                // What is the max torque allowed at this RPM to stay under Target HP?
                const maxTorqueAllowed = (engineSpecs.targetHp * 5252) / rpm;

                if (maxTorqueAllowed >= peakTorque) {
                    // We can hold full torque
                    ratio = 1.0;
                } else {
                    // We must throttle back
                    ratio = maxTorqueAllowed / peakTorque;
                }
            }

            // Clamp
            if (ratio > 1) ratio = 1;
            if (ratio < 0) ratio = 0;

            points.push({ rpm, ratio: Number(ratio.toFixed(3)) });
        }

        setCurvePoints(points);
    };

    const generateSii = () => {
        let sii = "";

        if (originalContent) {
            // Round-Trip Mode: Update original content via Patching
            sii = patchEngineSii(originalContent, engineSpecs, curvePoints);
        } else {
            // New File Logic
            const hp = engineSpecs.targetHp;
            const kw = Math.round(hp * 0.7457);
            const lbft = Math.round(engineSpecs.torqueVal * 0.73756);
            const nm = engineSpecs.torqueVal;

            const rangeMin = 1200;
            const rangeMax = 1600;

            const baseId = engineSpecs.name.toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").replace(/_$/, "");

            // Gogglez Safety Logic
            let safeBaseId = baseId.replace(/(\d{4,})/g, (match) => {
                const num = parseInt(match);
                if (num >= 1000) return (num / 1000).toFixed(1).replace('.', 'k');
                return match;
            });

            const truckPart = engineSpecs.truckInternalName && engineSpecs.truckInternalName.trim() ? `.${engineSpecs.truckInternalName.trim()}` : "";
            const finalId = `${safeBaseId}${truckPart}.engine`;

            const infoRangeMin = engineSpecs.rpmRangePower?.min || 1200;
            const infoRangeMax = engineSpecs.rpmRangePower?.max || 1600;

            sii = "SiiNunit\n{\n";
            sii += `accessory_engine_data : ${finalId}\n{\n`;
            sii += `\tname: "${engineSpecs.name.toUpperCase()} Tuned"\n`;
            sii += `\tprice: ${engineSpecs.price}\n`;
            sii += `\tunlock: ${engineSpecs.unlockLevel}\n`;
            sii += `\ticon: "engine_01"\n`;
            sii += `\tinfo[]: "${hp} @@hp@@ (${kw} @@kw@@)"\n`;
            sii += `\tinfo[]: "${lbft} @@lb_ft@@ (${nm} @@nm@@)"\n`;
            sii += `\tinfo[]: "${infoRangeMin}-${infoRangeMax} @@rpm@@"\n\n`;

            sii += `\t# Engine Specs\n`;
            sii += `\ttorque: ${engineSpecs.torqueVal}\n`;
            sii += `\tvolume: 15.2\n\n`;

            sii += `\t# RPM Data\n`;
            sii += `\trpm_idle: ${engineSpecs.rpmIdle}\n`;
            sii += `\trpm_limit: ${engineSpecs.rpmLimit}\n`;
            sii += `\trpm_limit_neutral: ${engineSpecs.rpmLimitNeutral}\n`;
            sii += `\trpm_range_low_gear: (${engineSpecs.rpmRangeLowGear.min}, ${engineSpecs.rpmRangeLowGear.max})\n`;
            sii += `\trpm_range_high_gear: (${engineSpecs.rpmRangeHighGear.min}, ${engineSpecs.rpmRangeHighGear.max})\n`;
            if (engineSpecs.rpmRangePower) {
                sii += `\trpm_range_power: (${engineSpecs.rpmRangePower.min}, ${engineSpecs.rpmRangePower.max})\n`;
            }
            sii += `\trpm_range_engine_brake: (${engineSpecs.rpmRangeEngineBrake.min}, ${engineSpecs.rpmRangeEngineBrake.max})\n\n`;

            sii += `\t# Torque Curves\n`;
            curvePoints.sort((a, b) => a.rpm - b.rpm).forEach(pt => {
                sii += `\ttorque_curve[]: (${pt.rpm}, ${pt.ratio})\n`;
            });

            sii += `\n\t# Engine Brake data\n`;
            sii += `\tengine_brake: ${engineSpecs.engineBrake.toFixed(1)}\n`;
            sii += `\tengine_brake_downshift: ${engineSpecs.engineBrakeDownshift ? 1 : 0}\n`;
            sii += `\tengine_brake_positions: ${engineSpecs.engineBrakePositions}\n`;

            // NEW: Write Defaults / Includes
            if (engineSpecs.defaults && engineSpecs.defaults.length > 0) {
                sii += `\n\t# Sound & Assets\n`;
                engineSpecs.defaults.forEach((def: string) => {
                    // Check if it's already a directive like @include
                    if (def.trim().startsWith('@')) {
                        sii += `\t${def}\n`;
                    } else {
                        sii += `\tdefaults[]: "${def}"\n`;
                    }
                });
            }

            sii += "}\n}";
        }

        setExportCode(sii);
        setIsExportOpen(true);
    };

    const handleImport = (content: string) => {
        try {
            const data = parseEngineSii(content);
            if (data) {
                setOriginalContent(content); // Store raw file for round-trip

                // Helper to use new value if defined, else keep previous
                // We use strict undefined check so 0 is valid
                const val = <T,>(newVal: T | undefined, prevVal: T) => newVal !== undefined ? newVal : prevVal;

                setEngineSpecs(prev => ({
                    ...prev,
                    id: val(data.id, prev.id), // Persist ID
                    name: val(data.name, prev.name),
                    truckInternalName: val(data.truckInternalName, prev.truckInternalName), // Use extracted truck name
                    targetHp: val(data.targetHp, prev.targetHp),
                    targetRpms: val(data.targetRpms, prev.targetRpms),
                    price: val(data.price, prev.price),
                    unlockLevel: val(data.unlockLevel, prev.unlockLevel),
                    torqueVal: val(data.torque, prev.torqueVal),

                    rpmLimit: val(data.rpmLimit, prev.rpmLimit),
                    rpmLimitNeutral: val(data.rpmLimitNeutral, prev.rpmLimitNeutral), // FIXED: was prev.rpmLimit
                    rpmIdle: val(data.rpmIdle, prev.rpmIdle),

                    engineBrake: val(data.engineBrake, prev.engineBrake),
                    engineBrakeDownshift: data.engineBrakeDownshift !== undefined ? data.engineBrakeDownshift === 1 : prev.engineBrakeDownshift,
                    engineBrakePositions: val(data.engineBrakePositions, prev.engineBrakePositions),

                    rpmRangeLowGear: val(data.rpmRangeLowGear, prev.rpmRangeLowGear),
                    rpmRangeHighGear: val(data.rpmRangeHighGear, prev.rpmRangeHighGear),
                    rpmRangeEngineBrake: val(data.rpmRangeEngineBrake, prev.rpmRangeEngineBrake),
                    rpmRangePower: val(data.rpmRangePower, prev.rpmRangePower),
                    defaults: data.defaults, // Pass sound links
                }));

                if (data.curvePoints.length > 0) {
                    setCurvePoints(data.curvePoints.sort((a, b) => a.rpm - b.rpm));
                }
            } else {
                alert("Could not parse engine data. Check the file format.");
            }
        } catch (err) {
            console.error("Import failed:", err);
            alert("An error occurred while importing. Please check console for details.");
        }
    };

    const handleLibrarySelect = (content: string, filename: string, truckId?: string) => {
        handleImport(content);
        if (truckId && truckId !== "Uncategorized") {
            setEngineSpecs(prev => ({ ...prev, truckInternalName: truckId }));
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
            {/* Library Sidebar */}
            {showLibrary && (
                <ModLibrary onSelectEngine={handleLibrarySelect} />
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
                <header className="flex items-center justify-between shrink-0 p-6 border-b border-border bg-background z-10">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Engine Editor</h1>
                        <p className="text-muted-foreground">Design torque curves and generate .sii definitions</p>
                    </div>
                    <div className="flex gap-2">
                        {/* Buttons */}
                        <button
                            onClick={() => setShowLibrary(!showLibrary)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors border",
                                showLibrary ? "bg-accent text-white border-accent" : "bg-zinc-800 hover:bg-zinc-700 text-white border-transparent"
                            )}
                        >
                            <Package className="w-4 h-4" /> {showLibrary ? "Hide Library" : "Mod Library"}
                        </button>
                        <button
                            onClick={() => setIsImportOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md text-sm font-medium transition-colors"
                        >
                            Import .sii
                        </button>
                        <button
                            onClick={() => {
                                setEngineSpecs(prev => ({ ...prev, name: "New Engine", torqueVal: 2000, targetHp: 600 }));
                                setCurvePoints(DEFAULT_CURVE);
                                setOriginalContent(null);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md text-sm font-medium transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" /> Reset
                        </button>
                        <button
                            onClick={generateSii}
                            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-sky-600 text-white rounded-md text-sm font-medium transition-colors shadow-lg shadow-sky-900/20"
                        >
                            <Save className="w-4 h-4" /> Export .sii
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-12 gap-6 max-w-[1600px] mx-auto">
                        {/* Left Panel: Chart & Data Visuals */}
                        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                            {/* Chart Container */}
                            <div className="flex-none bg-card border border-border rounded-xl p-4 flex flex-col min-h-[400px]">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold flex items-center gap-2">
                                        <Settings className="w-4 h-4 text-accent" /> Torque & Power Curve
                                    </h2>
                                    <div className="flex gap-2 text-xs">
                                        <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">Y-Axis: Normalized Ratio</span>
                                        <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">X-Axis: RPM</span>
                                    </div>
                                </div>
                                <TorqueCurveChart data={curvePoints} specs={engineSpecs} />
                            </div>

                            {/* Basic Specs */}
                            <div className="bg-card border border-border rounded-xl p-6">
                                <EngineSpecsPanel
                                    specs={engineSpecs}
                                    setSpecs={setEngineSpecs}
                                    onGenerateSmartCurve={handleSmartCurve} // Passed here
                                    onLoadPreset={handleLoadPreset}
                                />
                            </div>

                            {/* Advanced Specs */}
                            <div className="bg-card border border-border rounded-xl p-6">
                                <AdvancedSpecsPanel
                                    specs={engineSpecs as ExtendedEngineSpecs}
                                    setSpecs={(adv) => setEngineSpecs(prev => ({ ...prev, ...adv }))}
                                    curvePoints={curvePoints}
                                />
                            </div>
                        </div>

                        {/* Right Panel: Data Table & Output */}
                        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                            <div className="bg-card border border-border rounded-xl p-0 overflow-hidden flex flex-col sticky top-0">
                                <div className="p-4 border-b border-border bg-zinc-900/50">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-emerald-500" /> Curve Points
                                    </h3>
                                </div>
                                <TorqueDataPanel points={curvePoints} setPoints={setCurvePoints} />
                            </div>
                        </div>
                    </div>
                </div>

                <ExportModal
                    isOpen={isExportOpen}
                    onClose={() => setIsExportOpen(false)}
                    title="Engine Definition (.sii)"
                    code={exportCode}
                    filename={`${engineSpecs.name.replace(/\s+/g, '_')}.sii`}
                    metadata={{
                        truckInternalName: engineSpecs.truckInternalName,
                        componentName: engineSpecs.name,
                        type: 'engine'
                    }}
                />

                <ImportModal
                    isOpen={isImportOpen}
                    onClose={() => setIsImportOpen(false)}
                    onImport={handleImport}
                    title="Import Engine Sii"
                />
            </div>
        </div>
    );
}

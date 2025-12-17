"use client";

import { useState } from "react";
import { Save, RefreshCw, GitGraph, FileText } from "lucide-react";
import { SpeedRpmChart } from "@/components/transmission/SpeedRpmChart";
import { GearRatioTable } from "@/components/transmission/GearRatioTable";
import { TransmissionSpecsPanel } from "@/components/transmission/TransmissionSpecsPanel";
import { GearingAssistant } from "@/components/transmission/GearingAssistant";
import { ExportModal } from "@/components/ExportModal";
import { ImportModal } from "@/components/ImportModal";
import { parseTransmissionSii } from "@/lib/siiParser";
import { generateTransmissionSii } from "@/lib/transmissionSiiGenerator";
import { usePowertrain } from "@/context/PowertrainContext";
import { TRANSMISSION_PRESETS } from "@/lib/presets";

const DEFAULT_GEARS = [
    { name: "Rev", ratio: -14.56 },
    { name: "1", ratio: 12.57 }, { name: "2", ratio: 9.71 },
    { name: "3", ratio: 7.37 }, { name: "4", ratio: 5.66 },
    { name: "5", ratio: 4.49 }, { name: "6", ratio: 3.43 },
    { name: "7", ratio: 2.61 }, { name: "8", ratio: 1.99 },
    { name: "9", ratio: 1.48 }, { name: "10", ratio: 1.00 }
];

export default function TransmissionEditor() {
    const {
        engine,
        transmission: specs,
        setTransmission: setSpecs,
        gears,
        setGears
    } = usePowertrain();

    const handleLoadPreset = (presetId: string) => {
        const preset = TRANSMISSION_PRESETS.find(p => p.id === presetId);
        if (!preset) return;

        setSpecs(prev => ({
            ...prev,
            ...preset,
            // Preserve truck context
            truckInternalName: prev.truckInternalName,
        }));

        setGears(preset.gears);
    };

    // Modal State
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [exportCode, setExportCode] = useState("");

    const handleGenerateSii = () => {
        const sii = generateTransmissionSii({
            ...specs,
            gears
        }, specs.name);

        setExportCode(sii);
        setIsExportOpen(true);
    };

    const handleImport = (content: string) => {
        const data = parseTransmissionSii(content);
        if (data) {
            setSpecs(prev => ({
                ...prev,
                price: data.price || prev.price,
                unlockLevel: data.unlockLevel || prev.unlockLevel,
                diffRatio: data.diffRatio || prev.diffRatio,
                retarder: data.retarder || prev.retarder,
            }));

            if (data.gears.length > 0) {
                setGears(data.gears);
            }
        }
    };

    return (
        <div className="flex flex-col h-full gap-6">
            <header className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Transmission Designer</h1>
                    <p className="text-muted-foreground">Visualize gear splits and final drive ratios</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsImportOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md text-sm font-medium transition-colors"
                    >
                        Import .sii
                    </button>
                    <button
                        onClick={() => setSpecs({ ...specs, diffRatio: 3.55, tireDiameter: 41.5 })}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md text-sm font-medium transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" /> Reset
                    </button>
                    <button
                        onClick={handleGenerateSii}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-sm font-medium transition-colors shadow-lg shadow-emerald-900/20"
                    >
                        <Save className="w-4 h-4" /> Export .sii
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
                {/* Left Panel: Chart & Specs */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 min-h-0">
                    {/* Chart Container */}
                    <div className="flex-1 bg-card border border-border rounded-xl p-4 flex flex-col min-h-[400px]">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <GitGraph className="w-4 h-4 text-emerald-500" /> Speed vs RPM
                            </h2>
                            <div className="flex gap-2 text-xs">
                                <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">Y-Axis: RPM</span>
                                <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">X-Axis: Speed (MPH)</span>
                            </div>
                        </div>
                        <SpeedRpmChart
                            gears={gears}
                            diffRatio={specs.diffRatio}
                            tireDiameter={specs.tireDiameter}
                            rpmLimit={engine.rpmLimit || specs.rpmLimit}
                            enginePowerRange={engine.rpmRangePower}
                        />
                    </div>

                    {/* Specs Panel */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <TransmissionSpecsPanel specs={specs} setSpecs={setSpecs} onLoadPreset={handleLoadPreset} />
                    </div>
                </div>

                {/* Right Panel: Gear Table */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 min-h-0 overflow-y-auto">
                    <div className="bg-card border border-border rounded-xl p-0 overflow-hidden flex flex-col h-full">
                        <div className="p-4 border-b border-border bg-zinc-900/50">
                            <h3 className="font-semibold flex items-center gap-2">
                                <FileText className="w-4 h-4 text-emerald-500" /> Gear Ratios
                            </h3>
                        </div>
                        <GearRatioTable gears={gears} setGears={setGears} />
                    </div>

                    <GearingAssistant
                        gears={gears}
                        tireDiameter={specs.tireDiameter}
                        currentDiff={specs.diffRatio}
                        onApplyDiff={(diff) => setSpecs({ ...specs, diffRatio: diff })}
                        defaultTargetRpm={engine.rpmRangeHighGear?.min || 1300}
                    />
                </div>
            </div>

            <ExportModal
                isOpen={isExportOpen}
                onClose={() => setIsExportOpen(false)}
                title="Transmission Definition (.sii)"
                code={exportCode}
                filename={`${specs.name}.sii`}
                metadata={{
                    truckInternalName: specs.truckInternalName,
                    componentName: specs.name,
                    type: 'transmission'
                }}
            />

            <ImportModal
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                onImport={handleImport}
                title="Import Transmission Sii"
            />
        </div>
    );
}

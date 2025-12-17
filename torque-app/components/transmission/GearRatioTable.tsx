"use client";

import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Gear {
    name: string;
    ratio: number;
}

interface GearRatioTableProps {
    gears: Gear[];
    setGears: (gears: Gear[]) => void;
}

// Preset configurations
const PRESETS = {
    "10_speed": [
        { name: "Rev", ratio: -14.56 },
        { name: "1", ratio: 12.57 }, { name: "2", ratio: 9.71 },
        { name: "3", ratio: 7.37 }, { name: "4", ratio: 5.66 },
        { name: "5", ratio: 4.49 }, { name: "6", ratio: 3.43 },
        { name: "7", ratio: 2.61 }, { name: "8", ratio: 1.99 },
        { name: "9", ratio: 1.48 }, { name: "10", ratio: 1.00 } // Direct drive 10sp
    ],
    "13_speed": [
        { name: "R1", ratio: -13.28 }, { name: "R2", ratio: -3.61 },
        { name: "L", ratio: 12.25 },
        { name: "1", ratio: 8.51 }, { name: "2", ratio: 6.05 },
        { name: "3", ratio: 4.38 }, { name: "4", ratio: 3.20 },
        { name: "5L", ratio: 2.29 }, { name: "5H", ratio: 1.95 },
        { name: "6L", ratio: 1.62 }, { name: "6H", ratio: 1.38 },
        { name: "7L", ratio: 1.17 }, { name: "7H", ratio: 1.00 },
        { name: "8L", ratio: 0.86 }, { name: "8H", ratio: 0.73 }
    ],
    "18_speed": [
        { name: "R1", ratio: -13.03 }, { name: "R2", ratio: -3.45 },
        // 18 speed usually has Lo-Lo, Lo-Hi, then 1L-4H split
        { name: "LL", ratio: 14.40 }, { name: "LH", ratio: 12.29 },
        { name: "1L", ratio: 8.51 }, { name: "1H", ratio: 7.26 },
        { name: "2L", ratio: 6.05 }, { name: "2H", ratio: 5.16 },
        { name: "3L", ratio: 4.38 }, { name: "3H", ratio: 3.74 },
        { name: "4L", ratio: 3.20 }, { name: "4H", ratio: 2.73 },
        { name: "5L", ratio: 2.29 }, { name: "5H", ratio: 1.95 },
        { name: "6L", ratio: 1.62 }, { name: "6H", ratio: 1.38 },
        { name: "7L", ratio: 1.17 }, { name: "7H", ratio: 1.00 },
        { name: "8L", ratio: 0.86 }, { name: "8H", ratio: 0.73 }
    ]
};

export function GearRatioTable({ gears, setGears }: GearRatioTableProps) {

    const handleChange = (index: number, field: keyof Gear, value: string) => {
        const newGears = [...gears];
        if (field === "ratio") {
            const num = parseFloat(value);
            newGears[index] = { ...newGears[index], ratio: isNaN(num) ? 0 : num };
        } else {
            newGears[index] = { ...newGears[index], name: value };
        }
        setGears(newGears);
    };

    const removeGear = (index: number) => {
        setGears(gears.filter((_, i) => i !== index));
    };

    const addGear = () => {
        setGears([...gears, { name: `G${gears.length}`, ratio: 1.00 }]);
    };

    const loadPreset = (type: keyof typeof PRESETS) => {
        setGears([...PRESETS[type]]);
    };

    return (
        <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950/30">
            <div className="p-3 border-b border-border bg-zinc-100 dark:bg-zinc-900/50 flex gap-2 overflow-x-auto">
                <button onClick={() => loadPreset("10_speed")} className="text-xs px-2 py-1 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded text-zinc-700 dark:text-zinc-300 transition-colors">Load 10-Spd</button>
                <button onClick={() => loadPreset("13_speed")} className="text-xs px-2 py-1 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded text-zinc-700 dark:text-zinc-300 transition-colors">Load 13-Spd</button>
                <button onClick={() => loadPreset("18_speed")} className="text-xs px-2 py-1 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded text-zinc-700 dark:text-zinc-300 transition-colors">Load 18-Spd</button>
            </div>

            <div className="overflow-y-auto flex-1 p-2">
                <table className="w-full text-sm">
                    <thead className="text-xs text-muted-foreground bg-zinc-100 dark:bg-zinc-900/50 sticky top-0 z-10">
                        <tr>
                            <th className="px-2 py-2 text-left">Gear Name</th>
                            <th className="px-2 py-2 text-left">Ratio</th>
                            <th className="w-8"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {gears.map((gear, idx) => (
                            <tr key={idx} className="group hover:bg-zinc-100 dark:hover:bg-zinc-900/40 transition-colors">
                                <td className="p-2">
                                    <input
                                        type="text"
                                        value={gear.name}
                                        onChange={(e) => handleChange(idx, "name", e.target.value)}
                                        className="w-full bg-transparent border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-accent rounded px-2 py-1 outline-none text-zinc-900 dark:text-zinc-300"
                                    />
                                </td>
                                <td className="p-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={gear.ratio}
                                        onChange={(e) => handleChange(idx, "ratio", e.target.value)}
                                        className={cn(
                                            "w-full bg-transparent border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-accent rounded px-2 py-1 outline-none font-mono",
                                            gear.ratio < 0 ? "text-red-500 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                                        )}
                                    />
                                </td>
                                <td className="p-2 text-center">
                                    <button
                                        onClick={() => removeGear(idx)}
                                        className="text-zinc-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
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
                    onClick={addGear}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-accent hover:text-accent transition-all hover:bg-accent/5 text-sm"
                >
                    <Plus className="w-4 h-4" /> Add Gear
                </button>
            </div>
        </div>
    );
}

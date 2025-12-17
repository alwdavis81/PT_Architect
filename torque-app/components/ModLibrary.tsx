"use client";

import { useState, useCallback, useMemo } from "react";
import JSZip from "jszip";
import { FolderOpen, Package, Search, ChevronRight, FileText, Loader2, Truck, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModLibraryProps {
    onSelectEngine: (content: string, filename: string) => void;
}

interface EngineEntry {
    path: string;
    filename: string;
    name: string; // From the file content if possible, else filename
    truck: string; // The parent truck folder name
    content: string;
}

export function ModLibrary({ onSelectEngine }: ModLibraryProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [engines, setEngines] = useState<EngineEntry[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [dragging, setDragging] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [selectedTruck, setSelectedTruck] = useState<string | null>(null);

    const processFile = async (file: File) => {
        setIsLoading(true);
        setFileName(file.name);
        setEngines([]); // Clear previous
        setSelectedTruck(null); // Reset view

        try {
            const zip = new JSZip();
            const contents = await zip.loadAsync(file);
            const foundEngines: EngineEntry[] = [];
            const promises: Promise<void>[] = [];

            contents.forEach((relativePath, zipEntry) => {
                if (zipEntry.dir) return;
                // Basic filter: must be .sii
                if (!relativePath.endsWith(".sii")) return;

                // Path Regex: def/vehicle/truck/<TRUCK_NAME>/engine/<FILE>
                const match = relativePath.match(/def\/vehicle\/truck\/([^/]+)\/engine\//);
                if (!match) return; // Not an engine file in the expected structure

                const truckName = match[1];

                const p = async () => {
                    try {
                        const text = await zipEntry.async("string");
                        // Check if it's an engine file
                        if (text.includes("accessory_engine_data")) {
                            // Extract Name for display
                            const nameMatch = text.match(/name\s*:\s*"([^"]+)"/);
                            let displayName = nameMatch ? nameMatch[1] : relativePath.split('/').pop() || "Unknown";

                            foundEngines.push({
                                path: relativePath,
                                filename: relativePath.split('/').pop() || "unknown.sii",
                                name: displayName,
                                truck: truckName,
                                content: text
                            });
                        }
                    } catch (e) {
                        console.warn("Failed to read entry:", relativePath);
                    }
                };
                promises.push(p());
            });

            await Promise.all(promises);

            // Sort by truck then by name
            foundEngines.sort((a, b) => a.truck.localeCompare(b.truck) || a.name.localeCompare(b.name));
            setEngines(foundEngines);

        } catch (err) {
            console.error("Failed to load mod file:", err);
            alert("Failed to read the mod file. Ensure it is a valid ZIP/SCS archive.");
        } finally {
            setIsLoading(false);
        }
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    }, []);

    // Grouping Logic
    const trucks = useMemo(() => {
        const unique = new Set(engines.map(e => e.truck));
        return Array.from(unique).sort();
    }, [engines]);

    const filteredTrucks = trucks.filter(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const displayedEngines = useMemo(() => {
        if (!selectedTruck) return [];
        return engines.filter(e =>
            e.truck === selectedTruck &&
            (e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.filename.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [engines, selectedTruck, searchTerm]);


    return (
        <div className="flex flex-col h-full bg-zinc-900 border-r border-zinc-800 w-80 shrink-0">
            {/* Header / Drop Zone */}
            <div
                className={cn(
                    "p-4 border-b border-zinc-800 transition-colors",
                    dragging ? "bg-blue-500/20" : "bg-zinc-900"
                )}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
            >
                <div className="flex items-center gap-2 mb-2 text-zinc-100 font-semibold">
                    <Package className="w-5 h-5 text-accent" /> Mod Library
                </div>

                {!fileName ? (
                    <div className="border border-dashed border-zinc-700 rounded p-4 text-center text-xs text-zinc-500 hover:bg-zinc-800/50 transition-colors cursor-pointer relative">
                        Drag .scs / .zip here
                        <input
                            type="file"
                            accept=".scs,.zip"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => {
                                if (e.target.files?.[0]) processFile(e.target.files[0]);
                            }}
                        />
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <div className="text-xs text-green-400 font-mono truncate flex items-center gap-1 max-w-[180px]">
                            <FolderOpen className="w-3 h-3" /> {fileName}
                        </div>
                        <button
                            onClick={() => { setFileName(null); setEngines([]); setSelectedTruck(null); }}
                            className="text-[10px] text-zinc-500 hover:text-white underline"
                        >
                            Clear
                        </button>
                    </div>
                )}
            </div>

            {/* Navigation Header (if deeply nested) */}
            {selectedTruck && (
                <div className="p-2 border-b border-zinc-800 flex items-center gap-2 bg-zinc-800/30">
                    <button
                        onClick={() => setSelectedTruck(null)}
                        className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="font-semibold text-sm text-zinc-200 truncate">
                        {selectedTruck}
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="p-3 border-b border-zinc-800">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder={selectedTruck ? "Search engines..." : "Search trucks..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 pl-9 text-xs text-zinc-300 focus:border-accent outline-none"
                    />
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-40 text-zinc-500 animate-pulse gap-2 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" /> Scanning...
                    </div>
                ) : engines.length === 0 && fileName ? (
                    <div className="p-8 text-center text-xs text-zinc-600">
                        No valid engines found. <br /> Check folder structure.
                    </div>
                ) : !fileName ? (
                    <div className="p-8 text-center text-xs text-zinc-600">
                        Drop a file to start.
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-800/50">
                        {/* Truck List View */}
                        {!selectedTruck && filteredTrucks.map((truck) => (
                            <button
                                key={truck}
                                onClick={() => { setSelectedTruck(truck); setSearchTerm(""); }}
                                className="w-full text-left px-4 py-3 hover:bg-zinc-800/50 transition-colors group flex items-center gap-3"
                            >
                                <Truck className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" />
                                <div className="text-sm text-zinc-300 font-medium truncate group-hover:text-white flex-1">
                                    {truck}
                                </div>
                                <div className="text-[10px] text-zinc-600">
                                    {engines.filter(e => e.truck === truck).length}
                                </div>
                                <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-500" />
                            </button>
                        ))}

                        {/* Engine List View */}
                        {selectedTruck && displayedEngines.map((engine, i) => (
                            <button
                                key={i}
                                onClick={() => onSelectEngine(engine.content, engine.filename)}
                                className="w-full text-left px-4 py-3 hover:bg-zinc-800/50 transition-colors group flex items-start gap-3"
                            >
                                <FileText className="w-4 h-4 text-zinc-600 group-hover:text-accent mt-0.5" />
                                <div className="min-w-0">
                                    <div className="text-sm text-zinc-300 font-medium truncate group-hover:text-white">
                                        {engine.name}
                                    </div>
                                    <div className="text-[10px] text-zinc-600 truncate font-mono">
                                        {engine.filename}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-2 border-t border-zinc-800 text-[10px] text-zinc-600 text-center">
                {selectedTruck ? `${displayedEngines.length} engines` : `${trucks.length} trucks`}
            </div>
        </div>
    );
}

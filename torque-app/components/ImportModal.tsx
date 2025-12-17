"use client";

import { X, Upload, AlertTriangle, FileText } from "lucide-react";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (content: string) => void;
    title: string;
}

export function ImportModal({ isOpen, onClose, onImport, title }: ImportModalProps) {
    const [content, setContent] = useState("");
    const [error, setError] = useState("");
    const [isDragging, setIsDragging] = useState(false);



    const handleImport = () => {
        if (!content.trim()) {
            setError("Please paste some content first.");
            return;
        }
        // Basic validation to see if it looks like SiiNunit
        if (!content.includes("SiiNunit") && !content.includes("accessory_")) {
            setError("This doesn't look like a valid .sii file (missing SiiNunit block).");
            // We let them proceed anyway in case they just pasted the inner block
        }

        onImport(content);
        setContent("");
        setError("");
        onClose();
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            if (!file.name.endsWith('.sii') && !file.name.endsWith('.txt')) {
                setError("Please select a .sii or .txt file.");
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target?.result as string;
                setContent(text);
                setError("");
            };
            reader.readAsText(file);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl flex flex-col shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                    <h3 className="text-lg font-bold text-zinc-100">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 flex flex-col gap-4">
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={cn(
                            "bg-blue-500/10 border-2 border-dashed rounded-md p-6 text-center transition-all duration-200 cursor-pointer",
                            isDragging ? "border-blue-400 bg-blue-500/20 scale-[0.99]" : "border-blue-500/20 hover:border-blue-500/40"
                        )}
                    >
                        <div className="flex flex-col items-center gap-2 pointer-events-none">
                            <Upload className={cn("w-8 h-8 mb-2", isDragging ? "text-blue-300" : "text-blue-500")} />
                            <p className="text-sm font-medium text-blue-200">
                                Drag & Drop your <code>.sii</code> file here
                            </p>
                            <p className="text-xs text-blue-400/70">
                                or paste content below manually
                            </p>
                        </div>
                    </div>

                    <div className="relative">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-48 bg-zinc-950 border border-zinc-800 rounded-md p-3 font-mono text-xs text-zinc-300 focus:border-accent outline-none ml-0 pt-8 resize-none"
                            placeholder="SiiNunit { ... }"
                        />
                        <div className="absolute top-2 left-3 text-xs text-zinc-600 flex items-center gap-1.5 pointer-events-none select-none">
                            <FileText className="w-3 h-3" /> File Content
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-400 text-sm flex items-center gap-2 bg-red-500/10 p-2 rounded border border-red-500/20">
                            <AlertTriangle className="w-4 h-4" /> {error}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={!content.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md text-sm font-medium transition-colors shadow-lg shadow-emerald-900/20"
                    >
                        Import Data
                    </button>
                </div>
            </div>
        </div>
    );
}

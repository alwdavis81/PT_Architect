"use client";

import { X, Copy, Check, Download, AlertCircle, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { generateScsBlob } from "@/lib/scsGenerator";

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    code: string;
    filename: string;
    metadata?: {
        truckInternalName: string;
        engineName: string;
    };
}

export function ExportModal({ isOpen, onClose, title, code, filename, metadata }: ExportModalProps) {
    const [localCode, setLocalCode] = useState(code);
    const [copied, setCopied] = useState(false);
    const [isPackaging, setIsPackaging] = useState(false);

    useEffect(() => {
        setLocalCode(code);
    }, [code]);

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(localCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([localCode], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDownloadScs = async () => {
        setIsPackaging(true);
        try {
            const blob = await generateScsBlob({
                engineCode: localCode,
                filename: filename,
                truckInternalName: metadata?.truckInternalName || "peterbilt.389",
                modName: `${metadata?.engineName || "Custom Engine"} (Tuned)`,
                author: "Torque Architect"
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            // Name the archive nicely
            const safeName = (metadata?.engineName || "engine").toLowerCase().replace(/[^a-z0-9]/g, "_");
            a.download = `zeemod_${safeName}.scs`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Failed to package mod:", err);
            alert("Failed to create .scs file.");
        } finally {
            setIsPackaging(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-800 shrink-0">
                    <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                        {title}
                        {metadata?.truckInternalName && (
                            <span className="text-xs font-normal bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                                for {metadata.truckInternalName}
                            </span>
                        )}
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="text-zinc-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 overflow-hidden relative group">
                    <textarea
                        value={localCode}
                        onChange={(e) => setLocalCode(e.target.value)}
                        className="w-full h-full p-4 bg-zinc-950 font-mono text-sm text-emerald-400 focus:outline-none resize-none leading-relaxed"
                        spellCheck={false}
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-1.5 rounded text-xs text-zinc-400 pointer-events-none">
                        Editable Preview
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900 rounded-b-xl shrink-0">
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-zinc-800 text-zinc-300 transition-colors text-sm font-medium border border-transparent hover:border-zinc-700"
                    >
                        {copied ? <span className="text-emerald-500 flex items-center gap-2"><Check className="w-4 h-4" /> Copied!</span> : <><Copy className="w-4 h-4" /> Copy Text</>}
                    </button>

                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-zinc-800 text-zinc-300 transition-colors text-sm font-medium border border-zinc-700"
                    >
                        <Download className="w-4 h-4" /> Download .sii
                    </button>

                    <button
                        onClick={handleDownloadScs}
                        disabled={isPackaging}
                        className="flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition-colors text-sm font-medium shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-wait"
                    >
                        <Package className="w-4 h-4" />
                        {isPackaging ? "Packaging..." : "Export as Mod (.scs)"}
                    </button>
                </div>
            </div>
        </div>
    );
}

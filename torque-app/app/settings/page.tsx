"use client";

import { useState, useEffect } from "react";
import { Save, User, Scale, RotateCcw, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [scsAuthor, setScsAuthor] = useState("Anonymous");
    const [defaultUnit, setDefaultUnit] = useState("imperial");
    const [saved, setSaved] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const storedAuthor = localStorage.getItem("pt_architect_author");
        const storedUnit = localStorage.getItem("pt_architect_unit");

        if (storedAuthor) setScsAuthor(storedAuthor);
        if (storedUnit) setDefaultUnit(storedUnit);
    }, []);

    const handleSave = () => {
        localStorage.setItem("pt_architect_author", scsAuthor);
        localStorage.setItem("pt_architect_unit", defaultUnit);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Settings</h1>
                <p className="text-zinc-400">Configure your workspace defaults and export preferences.</p>
            </header>

            <div className="grid gap-8">
                {/* Export Preferences */}
                <section className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-accent/10 rounded-lg text-accent">
                            <User className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Export Identity</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Mod Author Name</label>
                            <input
                                type="text"
                                value={scsAuthor}
                                onChange={(e) => setScsAuthor(e.target.value)}
                                className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded px-4 py-2 text-white focus:border-accent outline-none transition-colors"
                                placeholder="e.g. Zeemods"
                            />
                            <p className="text-xs text-zinc-500 mt-2">
                                This name will be included as a comment header in your generated .sii files.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Theme Preferences */}
                <section className="bg-zinc-900/50 dark:bg-zinc-900/50 bg-white border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 transition-colors">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                            <Moon className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Appearance</h2>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Interface Theme</label>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setTheme("dark")}
                                className={`flex-1 max-w-[200px] px-4 py-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 ${theme === "dark"
                                    ? "bg-accent/10 border-accent text-accent"
                                    : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                                    }`}
                            >
                                <Moon className="w-4 h-4" /> Dark Mode
                            </button>
                            <button
                                onClick={() => setTheme("light")}
                                className={`flex-1 max-w-[200px] px-4 py-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 ${theme === "light"
                                    ? "bg-accent/10 border-accent text-accent"
                                    : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                                    }`}
                            >
                                <Sun className="w-4 h-4" /> Light Mode
                            </button>
                        </div>
                    </div>
                </section>

                {/* Unit Preferences */}
                <section className="bg-zinc-900/50 dark:bg-zinc-900/50 bg-white border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 transition-colors">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                            <Scale className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Measurement Units</h2>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Default System</label>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setDefaultUnit("imperial")}
                                className={`flex-1 max-w-[200px] px-4 py-3 rounded-lg border text-sm font-medium transition-all ${defaultUnit === "imperial"
                                    ? "bg-accent/10 border-accent text-accent"
                                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
                                    }`}
                            >
                                Imperial (HP / ft-lb)
                            </button>
                            <button
                                onClick={() => setDefaultUnit("metric")}
                                className={`flex-1 max-w-[200px] px-4 py-3 rounded-lg border text-sm font-medium transition-all ${defaultUnit === "metric"
                                    ? "bg-accent/10 border-accent text-accent"
                                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"
                                    }`}
                            >
                                Metric (PS / N·m)
                            </button>
                        </div>
                        <p className="text-xs text-zinc-500">
                            This sets the default toggle state for new sessions. You can still switch manually in the editor.
                        </p>
                    </div>
                </section>

                {/* Save Action */}
                <div className="flex items-center justify-end gap-4 pt-4">
                    {saved && <span className="text-sm text-emerald-400 animate-pulse">Configuration Saved!</span>}
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
                    >
                        <Save className="w-4 h-4" /> Save Changes
                    </button>
                </div>
            </div>

            {/* Application Info Footer */}
            <div className="mt-12 border-t border-zinc-800 pt-8 flex items-center justify-between text-zinc-600 text-sm">
                <div>
                    <span className="font-semibold text-zinc-500">Powertrain Architect</span> v1.0.0
                </div>
                <button
                    onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                    }}
                    className="flex items-center gap-2 hover:text-red-400 transition-colors"
                >
                    <RotateCcw className="w-3 h-3" /> Reset App Data
                </button>
            </div>
        </div>
    );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Gauge,
    Settings2,
    Menu,
    Zap,
    GitGraph,
    Info
} from "lucide-react";

import { AppLogo } from "@/components/AppLogo";
import { usePowertrain } from "@/context/PowertrainContext";

const NAV_ITEMS = [
    {
        title: "Dashboard",
        href: "/",
        icon: Gauge,
    },
    {
        title: "Engine Editor",
        href: "/engine",
        icon: Zap,
    },
    {
        title: "Transmission",
        href: "/transmission",
        icon: GitGraph,
    },
    {
        title: "Settings", // Maybe for user prefs like Units default
        href: "/settings",
        icon: Settings2,
    },
    {
        title: "Legal Info",
        href: "/legal",
        icon: Info,
    },
];

export function AppSidebar() {
    const pathname = usePathname();
    const { engine } = usePowertrain();

    return (
        <aside className="w-64 border-r border-border bg-card flex flex-col h-full shrink-0">
            <div className="h-16 flex items-center px-6 border-b border-border">
                <div className="mr-3">
                    <AppLogo />
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-lg tracking-tight">PT Architect</span>
                    <span className="text-[10px] text-zinc-500 -mt-1 uppercase tracking-widest font-semibold">Pro Series</span>
                </div>
            </div>

            <div className="flex-1 py-6 px-3 space-y-1">
                <div className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Tools
                </div>
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-accent/10 text-accent"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.title}
                        </Link>
                    );
                })}

                {engine.truckInternalName && (
                    <div className="mt-8 px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-lg mx-2">
                        <div className="text-[10px] text-zinc-500 uppercase mb-1">Active Target</div>
                        <div className="text-xs font-mono text-emerald-500 truncate">{engine.truckInternalName}</div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-border bg-muted/20">
                <div className="text-[10px] text-muted-foreground flex justify-between items-center">
                    <span>v1.1.0-alpha</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
            </div>
        </aside>
    );
}

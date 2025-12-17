"use client";

import Link from "next/link";
import { Zap, GitGraph, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col justify-center items-center">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-4 text-white">Welcome to Powertrain Architect</h1>
        <p className="text-zinc-400 text-xl max-w-2xl mx-auto">
          The ultimate development environment for scientifically accurate ATS/ETS2 powertrain components.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ToolCard
          href="/engine"
          title="Engine Editor"
          description="Design custom torque curves, calculate horsepower, and generate engine definition files."
          icon={Zap}
          color="text-amber-500"
        />
        <ToolCard
          href="/transmission"
          title="Transmission Designer" // "Designer" sounds creative
          description="Visualize gear ratios, speed-to-RPM charts, and build complex transmission specs."
          icon={GitGraph}
          color="text-emerald-500"
        />
      </div>
    </div>
  );
}

function ToolCard({
  href,
  title,
  description,
  icon: Icon,
  color
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Link href={href}>
      <div
        className="h-full p-8 rounded-xl border border-border bg-card hover:bg-zinc-900 transition-all hover:scale-[1.02] active:scale-[0.98] duration-200 group cursor-pointer relative overflow-hidden"
      >
        <div className={`mb-6 p-4 rounded-full bg-zinc-950 w-fit border border-border ${color}`}>
          <Icon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-3 group-hover:text-accent transition-colors">{title}</h2>
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
          {description}
        </p>

        <div className="flex items-center text-sm font-medium text-accent opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
          Open Tool <ArrowRight className="ml-2 w-4 h-4" />
        </div>
      </div>
    </Link>
  )
}

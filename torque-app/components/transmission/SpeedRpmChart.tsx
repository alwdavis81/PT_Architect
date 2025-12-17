"use client";

import { useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from "recharts";
import { calculateRpm, calculateSpeed } from "@/lib/transmissionUtils";

interface Gear {
    name: string;
    ratio: number;
}

interface SpeedRpmChartProps {
    gears: Gear[];
    diffRatio: number;
    tireDiameter: number; // inches
    rpmLimit: number; // e.g., 2100
}

export function SpeedRpmChart({ gears, diffRatio, tireDiameter, rpmLimit }: SpeedRpmChartProps) {

    // Calculate Speed (MPH) for a given RPM
    // Speed = (RPM * TireCircumference) / (GearRatio * FinalDrive * Conversion)
    // TireCirc (miles) = (Diameter * PI) / 63360
    // Speed (MPH) = (RPM * 60 * TireCirc_miles) ... wait.
    // Standard Formula: MPH = (RPM * TireDiameter_inches) / (GearRatio * FinalDrive * 336)

    const chartData = useMemo(() => {
        // We want to plot lines. Recharts LineChart usually takes an array of objects where X is shared.
        // If we want multiple lines with different X-ranges (gears end at different speeds), it's tricky in Recharts 
        // without creating a union of all possible speeds.

        // Approach: Create a set of data points from 0 to Max Speed perceived.
        // Max speed at highest gear (lowest ratio > 0) at Max RPM.

        // Filter only forward gears
        const fwdGears = gears.filter(g => g.ratio > 0).sort((a, b) => b.ratio - a.ratio);
        if (fwdGears.length === 0) return [];

        const topGear = fwdGears[fwdGears.length - 1];
        const maxSpeedAtLimit = calculateSpeed(rpmLimit + 500, topGear.ratio, diffRatio, tireDiameter);

        // Generate ~20 points along the X axis (Speed)
        const points = [];
        const step = 2; // more resolution
        for (let speed = 0; speed <= Math.ceil(maxSpeedAtLimit) + 2; speed += step) {
            const point: any = { speed };

            fwdGears.forEach(gear => {
                const rpm = calculateRpm(speed, gear.ratio, diffRatio, tireDiameter);

                // Only plot if RPM is reasonable
                if (rpm <= rpmLimit + 400 && rpm >= 400) {
                    point[gear.name] = Math.round(rpm);
                } else {
                    point[gear.name] = null;
                }
            });
            points.push(point);
        }
        return points;
    }, [gears, diffRatio, tireDiameter, rpmLimit]);

    const fwdGears = gears.filter(g => g.ratio > 0);
    const colors = ["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981", "#06b6d4", "#3b82f6", "#8b5cf6", "#d946ef", "#f43f5e"]; // 10 base colors
    // Function to cycle colors
    const getColor = (idx: number) => colors[idx % colors.length];

    return (
        <div className="w-full h-full min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis
                        dataKey="speed"
                        label={{ value: "Speed (MPH)", position: "insideBottom", offset: -5, fill: "#666" }}
                        stroke="#666"
                        type="number"
                    />
                    <YAxis
                        label={{ value: "Engine RPM", angle: -90, position: "insideLeft", fill: "#666" }}
                        stroke="#666"
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", color: "#fff" }}
                        itemStyle={{ color: "#fff" }}
                        labelStyle={{ color: "#aaa" }}
                        formatter={(value: any, name: any) => [`${value} RPM`, `Gear ${name}`]}
                    />

                    <ReferenceLine y={rpmLimit} stroke="red" strokeDasharray="3 3" label={{ position: 'top', value: 'RPM Limit', fill: 'red', fontSize: 12 }} />

                    {fwdGears.map((gear, idx) => (
                        <Line
                            key={gear.name}
                            type="monotone"
                            dataKey={gear.name}
                            stroke={getColor(idx)}
                            strokeWidth={2}
                            dot={false}
                            connectNulls={false}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

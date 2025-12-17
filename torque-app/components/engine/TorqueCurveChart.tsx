"use client";

import { useMemo } from "react";
import {
    ComposedChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area
} from "recharts";

interface TorqueCurveChartProps {
    data: { rpm: number; ratio: number }[];
    specs: {
        torqueVal: number; // in N*m usually, or input unit
        useImperial: boolean;
    };
}

export function TorqueCurveChart({ data, specs }: TorqueCurveChartProps) {
    const chartData = useMemo(() => {
        // Sort by RPM just in case
        const sorted = [...data].sort((a, b) => a.rpm - b.rpm);

        // Interpolation or Step? SCS uses linear interpolation between points.
        // We want to generate a dense array for smoother "Curve" look if we want, 
        // or just plot the points. Plotting points is safer to show where the definitions are.

        return sorted.map((pt) => {
            // ratio * max_torque
            const torqueNm = pt.ratio * specs.torqueVal;

            // Convert to ft-lb if needed for display
            const torqueDisplay = specs.useImperial
                ? torqueNm * 0.73756
                : torqueNm;

            // HP Calculation
            // HP = (Torque_ftlb * RPM) / 5252
            const torqueFtLb = torqueNm * 0.73756;
            const hp = (torqueFtLb * pt.rpm) / 5252;

            return {
                rpm: pt.rpm,
                ratio: pt.ratio,
                torque: Math.round(torqueDisplay),
                hp: Math.round(hp),
            };
        });
    }, [data, specs]);

    const unitLabel = specs.useImperial ? "ft·lb" : "N·m";

    return (
        <div className="w-full h-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis
                        dataKey="rpm"
                        label={{ value: "RPM", position: "insideBottomRight", offset: -10, fill: "#666" }}
                        stroke="#666"
                        type="number"
                        domain={['dataMin', 'dataMax']}
                        tickCount={8}
                    />
                    {/* Y Axis for Torque */}
                    <YAxis
                        yAxisId="torque"
                        stroke="#0ea5e9"
                        label={{ value: `Torque (${unitLabel})`, angle: -90, position: "insideLeft", fill: "#0ea5e9" }}
                    />
                    {/* Y Axis for HP */}
                    <YAxis
                        yAxisId="hp"
                        orientation="right"
                        stroke="#f59e0b"
                        label={{ value: "Horsepower (HP)", angle: 90, position: "insideRight", fill: "#f59e0b" }}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", color: "#fff" }}
                        itemStyle={{ color: "#fff" }}
                    />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />

                    {/* Torque Line */}
                    <Area
                        yAxisId="torque"
                        type="monotone"
                        dataKey="torque"
                        name={`Torque (${unitLabel})`}
                        stroke="#0ea5e9"
                        fill="#0ea5e9"
                        fillOpacity={0.1}
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#0ea5e9", strokeWidth: 0 }}
                        activeDot={{ r: 6 }}
                    />

                    {/* HP Line */}
                    <Line
                        yAxisId="hp"
                        type="monotone"
                        dataKey="hp"
                        name="Horsepower"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        dot={false}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}

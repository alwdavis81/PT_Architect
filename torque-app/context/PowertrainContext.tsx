"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

// Types from our components
export interface Gear {
    name: string;
    ratio: number;
}

export interface EngineSpecs {
    id?: string;
    name: string;
    truckInternalName: string;
    price: number;
    unlockLevel: number;
    targetHp: number;
    targetRpms: number;
    torqueVal: number;
    useImperial: boolean;
    rpmLimit: number;
    rpmLimitNeutral: number;
    rpmIdle: number;
    engineBrake: number;
    engineBrakeDownshift: boolean;
    engineBrakePositions: number;
    rpmRangeLowGear: { min: number; max: number };
    rpmRangeHighGear: { min: number; max: number };
    rpmRangeEngineBrake: { min: number; max: number };
    rpmRangePower: { min: number; max: number };
    defaults?: string[];
}

export interface TransmissionSpecs {
    name: string;
    price: number;
    unlockLevel: number;
    diffRatio: number;
    retarder: number;
    rpmLimit: number;
    tireDiameter: number;
    truckInternalName: string;
}

interface PowertrainContextType {
    engine: EngineSpecs;
    setEngine: React.Dispatch<React.SetStateAction<EngineSpecs>>;
    engineCurve: { rpm: number; ratio: number }[];
    setEngineCurve: React.Dispatch<React.SetStateAction<{ rpm: number; ratio: number }[]>>;

    transmission: TransmissionSpecs;
    setTransmission: React.Dispatch<React.SetStateAction<TransmissionSpecs>>;
    gears: Gear[];
    setGears: React.Dispatch<React.SetStateAction<Gear[]>>;
}

const DEFAULT_ENGINE_CURVE = [
    { rpm: 300, ratio: 0 },
    { rpm: 440, ratio: 0.5 },
    { rpm: 1000, ratio: 1 },
    { rpm: 1100, ratio: 1 },
    { rpm: 1400, ratio: 1 },
    { rpm: 1900, ratio: 0.77 },
    { rpm: 2400, ratio: 0.5 },
    { rpm: 2600, ratio: 0 },
];

const DEFAULT_GEARS = [
    { name: "Rev", ratio: -14.56 },
    { name: "1", ratio: 12.57 }, { name: "2", ratio: 9.71 },
    { name: "3", ratio: 7.37 }, { name: "4", ratio: 5.66 },
    { name: "5", ratio: 4.49 }, { name: "6", ratio: 3.43 },
    { name: "7", ratio: 2.61 }, { name: "8", ratio: 1.99 },
    { name: "9", ratio: 1.48 }, { name: "10", ratio: 1.00 }
];

const PowertrainContext = createContext<PowertrainContextType | undefined>(undefined);

export function PowertrainProvider({ children }: { children: React.ReactNode }) {
    const [engine, setEngine] = useState<EngineSpecs>({
        name: "c15_tuned",
        truckInternalName: "",
        price: 25000,
        unlockLevel: 10,
        targetHp: 600,
        targetRpms: 1800,
        torqueVal: 2050,
        useImperial: true,
        rpmLimit: 2400,
        rpmLimitNeutral: 2400,
        rpmIdle: 600,
        engineBrake: 2.0,
        engineBrakeDownshift: false,
        engineBrakePositions: 3,
        rpmRangeLowGear: { min: 900, max: 1500 },
        rpmRangeHighGear: { min: 1100, max: 1500 },
        rpmRangeEngineBrake: { min: 1500, max: 2500 },
        rpmRangePower: { min: 1200, max: 1900 },
        defaults: []
    });

    const [engineCurve, setEngineCurve] = useState(DEFAULT_ENGINE_CURVE);

    const [transmission, setTransmission] = useState<TransmissionSpecs>({
        name: "eat_10_speed",
        price: 12000,
        unlockLevel: 0,
        diffRatio: 3.55,
        retarder: 0,
        rpmLimit: 2100,
        tireDiameter: 41.5,
        truckInternalName: ""
    });

    const [gears, setGears] = useState(DEFAULT_GEARS);

    // Sync Truck ID between components if changed in one
    useEffect(() => {
        if (engine.truckInternalName && engine.truckInternalName !== transmission.truckInternalName) {
            setTransmission(prev => ({ ...prev, truckInternalName: engine.truckInternalName }));
        }
    }, [engine.truckInternalName]);

    useEffect(() => {
        if (transmission.truckInternalName && transmission.truckInternalName !== engine.truckInternalName) {
            setEngine(prev => ({ ...prev, truckInternalName: transmission.truckInternalName }));
        }
    }, [transmission.truckInternalName]);

    return (
        <PowertrainContext.Provider value={{
            engine, setEngine,
            engineCurve, setEngineCurve,
            transmission, setTransmission,
            gears, setGears
        }}>
            {children}
        </PowertrainContext.Provider>
    );
}

export function usePowertrain() {
    const context = useContext(PowertrainContext);
    if (context === undefined) {
        throw new Error('usePowertrain must be used within a PowertrainProvider');
    }
    return context;
}

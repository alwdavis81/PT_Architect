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
    gears: Gear[];
}

import { EngineSpecs } from "@/components/engine/EngineSpecsPanel";
import { ExtendedEngineSpecs } from "@/components/engine/AdvancedSpecsPanel";
import { Gear, TransmissionSpecs } from "@/context/PowertrainContext";

// Combine Basic and Advanced specs
type EnginePreset = EngineSpecs & ExtendedEngineSpecs & {
    id: string; // ID for the preset selection
    defaults: string[]; // Sound / Include links
};

export const ENGINE_PRESETS: EnginePreset[] = [
    {
        id: "cat_c15_600",
        name: "CAT C15 600",
        targetHp: 600,
        targetRpms: 1800,
        torqueVal: 2779, // 2050 lb-ft
        useImperial: true,
        price: 25000,
        unlockLevel: 10,
        defaults: ['@include "sound_cat_c15.sui"'],
        rpmIdle: 600,
        rpmLimit: 2100,
        rpmLimitNeutral: 2100,
        engineBrake: 2.0,
        engineBrakeDownshift: false,
        engineBrakePositions: 3,
        rpmRangeLowGear: { min: 900, max: 1500 },
        rpmRangeHighGear: { min: 1100, max: 1500 },
        rpmRangePower: { min: 1200, max: 1900 },
        rpmRangeEngineBrake: { min: 1500, max: 2500 }
    },
    {
        id: "cummins_isx15_600",
        name: "Cummins ISX15 600",
        targetHp: 600,
        targetRpms: 1800,
        torqueVal: 2779, // 2050 lb-ft
        useImperial: true,
        price: 24000,
        unlockLevel: 10,
        defaults: ['@include "sound_isx15.sui"'],
        rpmIdle: 600,
        rpmLimit: 2100,
        rpmLimitNeutral: 2100,
        engineBrake: 2.0,
        engineBrakeDownshift: false,
        engineBrakePositions: 3,
        rpmRangeLowGear: { min: 900, max: 1500 },
        rpmRangeHighGear: { min: 1100, max: 1500 },
        rpmRangePower: { min: 1200, max: 1900 },
        rpmRangeEngineBrake: { min: 1500, max: 2500 }
    },
    {
        id: "cummins_n14_525",
        name: "Cummins N14 525",
        targetHp: 525,
        targetRpms: 1600,
        torqueVal: 2508, // 1850 lb-ft
        useImperial: true,
        price: 23000,
        unlockLevel: 8,
        defaults: ['@include "sound_n14.sui"'],
        rpmIdle: 650,
        rpmLimit: 2100,
        rpmLimitNeutral: 2100,
        engineBrake: 2.0,
        engineBrakeDownshift: false,
        engineBrakePositions: 3,
        rpmRangeLowGear: { min: 1000, max: 1600 },
        rpmRangeHighGear: { min: 1100, max: 1600 },
        rpmRangePower: { min: 1300, max: 1900 },
        rpmRangeEngineBrake: { min: 1500, max: 2500 }
    },
    {
        id: "detroit_dd60_515",
        name: "Detroit DD60 515",
        targetHp: 515,
        targetRpms: 1800,
        torqueVal: 2237, // 1650 lb-ft
        useImperial: true,
        price: 21000,
        unlockLevel: 6,
        defaults: ['@include "sound_dd60.sui"'],
        rpmIdle: 600,
        rpmLimit: 2100,
        rpmLimitNeutral: 2100,
        engineBrake: 2.0,
        engineBrakeDownshift: false,
        engineBrakePositions: 3,
        rpmRangeLowGear: { min: 900, max: 1500 },
        rpmRangeHighGear: { min: 1100, max: 1500 },
        rpmRangePower: { min: 1200, max: 1900 },
        rpmRangeEngineBrake: { min: 1500, max: 2500 }
    },
    {
        id: "mack_mp8_505",
        name: "Mack MP8 505",
        targetHp: 505,
        targetRpms: 1500,
        torqueVal: 2522, // 1860 lb-ft
        useImperial: true,
        price: 19000,
        unlockLevel: 5,
        defaults: ['@include "sound_mp8d.sui"'],
        rpmIdle: 600,
        rpmLimit: 2100,
        rpmLimitNeutral: 2100,
        engineBrake: 2.0,
        engineBrakeDownshift: false,
        engineBrakePositions: 3,
        rpmRangeLowGear: { min: 900, max: 1500 },
        rpmRangeHighGear: { min: 1000, max: 1400 },
        rpmRangePower: { min: 1100, max: 1800 },
        rpmRangeEngineBrake: { min: 1500, max: 2500 }
    },
    {
        id: "paccar_mx13_510",
        name: "Paccar MX-13 510",
        targetHp: 510,
        targetRpms: 1700,
        torqueVal: 2508, // 1850 lb-ft
        useImperial: true,
        price: 18000,
        unlockLevel: 4,
        defaults: ['@include "sound_mx13.sui"'],
        rpmIdle: 600,
        rpmLimit: 2200,
        rpmLimitNeutral: 2200,
        engineBrake: 2.0,
        engineBrakeDownshift: false,
        engineBrakePositions: 3,
        rpmRangeLowGear: { min: 900, max: 1500 },
        rpmRangeHighGear: { min: 1100, max: 1500 },
        rpmRangePower: { min: 1200, max: 1900 },
        rpmRangeEngineBrake: { min: 1500, max: 2500 }
    }
];

export interface TransmissionPreset extends TransmissionSpecs {
    id: string;
    gears: Gear[];
}

export const TRANSMISSION_PRESETS: TransmissionPreset[] = [
    {
        id: "eaton_10_speed",
        name: "Eaton Fuller 10-Speed",
        price: 12000,
        unlockLevel: 0,
        diffRatio: 3.55,
        retarder: 0,
        rpmLimit: 2100,
        tireDiameter: 41.5,
        truckInternalName: "",
        gears: [
            { name: "Rev", ratio: -14.56 },
            { name: "1", ratio: 12.80 }, { name: "2", ratio: 9.38 },
            { name: "3", ratio: 6.94 }, { name: "4", ratio: 5.17 },
            { name: "5", ratio: 3.83 }, { name: "6", ratio: 2.74 },
            { name: "7", ratio: 2.01 }, { name: "8", ratio: 1.49 },
            { name: "9", ratio: 1.11 }, { name: "10", ratio: 0.81 }
        ]
    },
    {
        id: "eaton_13_speed",
        name: "Eaton Fuller 13-Speed (Overdrive)",
        price: 15400,
        unlockLevel: 6,
        diffRatio: 3.25,
        retarder: 0,
        rpmLimit: 2100,
        tireDiameter: 41.5,
        truckInternalName: "",
        gears: [
            { name: "Rev 1", ratio: -11.60 }, { name: "Rev 2", ratio: -3.51 },
            { name: "L", ratio: 12.31 },
            { name: "1", ratio: 8.64 }, { name: "2", ratio: 6.11 },
            { name: "3", ratio: 4.43 }, { name: "4", ratio: 3.23 },
            { name: "5L", ratio: 2.31 }, { name: "5H", ratio: 1.95 },
            { name: "6L", ratio: 1.62 }, { name: "6H", ratio: 1.38 },
            { name: "7L", ratio: 1.17 }, { name: "7H", ratio: 1.00 },
            { name: "8L", ratio: 0.86 }, { name: "8H", ratio: 0.73 }
        ]
    },
    {
        id: "eaton_18_speed",
        name: "Eaton Fuller 18-Speed",
        price: 18500,
        unlockLevel: 12,
        diffRatio: 3.73,
        retarder: 0,
        rpmLimit: 2100,
        tireDiameter: 41.5,
        truckInternalName: "",
        gears: [
            { name: "Rev 1L", ratio: -15.06 }, { name: "Rev 1H", ratio: -12.85 },
            { name: "Rev 2L", ratio: -4.03 }, { name: "Rev 2H", ratio: -3.42 },
            { name: "LL", ratio: 14.40 }, { name: "LH", ratio: 12.29 },
            { name: "1L", ratio: 10.62 }, { name: "1H", ratio: 9.06 },
            { name: "2L", ratio: 7.91 }, { name: "2H", ratio: 6.75 },
            { name: "3L", ratio: 6.01 }, { name: "3H", ratio: 5.12 },
            { name: "4L", ratio: 4.38 }, { name: "4H", ratio: 3.74 },
            { name: "5L", ratio: 3.20 }, { name: "5H", ratio: 2.73 },
            { name: "6L", ratio: 2.41 }, { name: "6H", ratio: 2.05 },
            { name: "7L", ratio: 1.81 }, { name: "7H", ratio: 1.54 },
            { name: "8L", ratio: 1.17 }, { name: "8H", ratio: 1.00 },
            { name: "9L", ratio: 0.86 }, { name: "9H", ratio: 0.73 }
        ]
    },
    {
        id: "allison_6_speed",
        name: "Allison 4500 RDS (6-Speed Auto)",
        price: 13500,
        unlockLevel: 4,
        diffRatio: 4.10,
        retarder: 0,
        rpmLimit: 2200,
        tireDiameter: 41.5,
        truckInternalName: "",
        gears: [
            { name: "Rev", ratio: -4.80 },
            { name: "1", ratio: 4.70 },
            { name: "2", ratio: 2.21 },
            { name: "3", ratio: 1.53 },
            { name: "4", ratio: 1.00 },
            { name: "5", ratio: 0.76 },
            { name: "6", ratio: 0.67 }
        ]
    }
];

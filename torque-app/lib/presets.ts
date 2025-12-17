import { EngineSpecs } from "@/components/engine/EngineSpecsPanel";
import { ExtendedEngineSpecs } from "@/components/engine/AdvancedSpecsPanel";

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

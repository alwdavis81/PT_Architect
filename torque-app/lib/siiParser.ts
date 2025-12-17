export interface ParsedEngineData {
    id?: string;
    name?: string;
    truckInternalName?: string;
    targetHp?: number;
    targetRpms?: number;
    price?: number;
    unlockLevel?: number;
    torque?: number;
    rpmLimit?: number;
    rpmLimitNeutral?: number;
    rpmIdle?: number;
    // Ranges
    rpmRangeLowGear?: { min: number; max: number };
    rpmRangeHighGear?: { min: number; max: number };
    rpmRangePower?: { min: number; max: number };
    rpmRangeEngineBrake?: { min: number; max: number };
    // Brake
    engineBrake?: number;
    engineBrakeDownshift?: number; // boolean really (0/1)
    engineBrakePositions?: number;

    curvePoints: { rpm: number; ratio: number }[];
    defaults?: string[]; // Sound references found in file
}

export interface ParsedTransmissionData {
    name?: string;
    price?: number;
    unlockLevel?: number;
    diffRatio?: number;
    retarder?: number;
    gears: { name: string; ratio: number }[];
}

export const parseEngineSii = (content: string): ParsedEngineData | null => {
    try {
        const data: ParsedEngineData = { curvePoints: [] };

        // Helper for simple integers
        const getInt = (regex: RegExp) => {
            const m = content.match(regex);
            return m ? parseInt(m[1]) : undefined;
        };
        // Helper for floats
        const getFloat = (regex: RegExp) => {
            const m = content.match(regex);
            return m ? parseFloat(m[1]) : undefined;
        };
        // Helper for Ranges (1000, 2000)
        const getRange = (regex: RegExp) => {
            const m = content.match(regex);
            if (m) return { min: parseInt(m[1]), max: parseInt(m[2]) };
            return undefined;
        };

        // Extract ID: accessory_engine_data : some.id.here
        const idMatch = content.match(/accessory_engine_data\s*:\s*([^\s{]+)/);
        if (idMatch) data.id = idMatch[1].trim();

        const nameMatch = content.match(/name\s*:\s*"([^"]+)"/);
        if (nameMatch) data.name = nameMatch[1];

        // Helper to find info values
        const hpMatch = content.match(/info\[\].*?"(\d+)\s*@@hp@@/);
        if (hpMatch) data.targetHp = parseInt(hpMatch[1]);

        const rpmMatch = content.match(/info\[\].*?"\d*-?(\d+)\s*@@rpm@@/);
        if (rpmMatch) data.targetRpms = parseInt(rpmMatch[1]);

        data.price = getInt(/price\s*:\s*(\d+)/);
        data.unlockLevel = getInt(/unlock\s*:\s*(\d+)/);
        data.torque = getInt(/torque\s*:\s*(\d+)/);

        data.rpmLimit = getInt(/rpm_limit\s*:\s*(\d+)/);
        data.rpmLimitNeutral = getInt(/rpm_limit_neutral\s*:\s*(\d+)/);
        data.rpmIdle = getInt(/rpm_idle\s*:\s*(\d+)/);

        data.engineBrake = getFloat(/engine_brake\s*:\s*([0-9.]+)/);
        data.engineBrakeDownshift = getInt(/engine_brake_downshift\s*:\s*(\d+)/);
        data.engineBrakePositions = getInt(/engine_brake_positions\s*:\s*(\d+)/);

        data.rpmRangeLowGear = getRange(/rpm_range_low_gear\s*:\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/);
        data.rpmRangeHighGear = getRange(/rpm_range_high_gear\s*:\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/);
        data.rpmRangePower = getRange(/rpm_range_power\s*:\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/);
        data.rpmRangeEngineBrake = getRange(/rpm_range_engine_brake\s*:\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/);

        // Extract torque curve points
        const curveRegex = /torque_curve\[\]\s*:\s*\(\s*(\d+)\s*,\s*([0-9.]+)\s*\)/g;
        let match;
        while ((match = curveRegex.exec(content)) !== null) {
            data.curvePoints.push({
                rpm: parseInt(match[1]),
                ratio: parseFloat(match[2]),
            });
        }

        // Extract defaults[] (Sound Links)
        const defaultsRegex = /^\s*defaults\[\]:\s*"([^"]+)"/gm;
        while ((match = defaultsRegex.exec(content)) !== null) {
            if (!data.defaults) data.defaults = [];
            data.defaults.push(match[1]);
        }

        // Extract @include (Sound Links)
        const includeRegex = /^\s*@include\s+"([^"]+)"/gm;
        while ((match = includeRegex.exec(content)) !== null) {
            if (!data.defaults) data.defaults = [];
            data.defaults.push(`@include "${match[1]}"`);
        }

        return data;
    } catch (e) {
        console.error("Failed to parse .sii file", e);
        return null;
    }
};

export const parseTransmissionSii = (content: string): ParsedTransmissionData | null => {
    try {
        const data: ParsedTransmissionData = { gears: [] };

        // Simple fields
        const priceMatch = content.match(/price\s*:\s*(\d+)/);
        if (priceMatch) data.price = parseInt(priceMatch[1]);

        const unlockMatch = content.match(/unlock\s*:\s*(\d+)/);
        if (unlockMatch) data.unlockLevel = parseInt(unlockMatch[1]);

        const diffMatch = content.match(/differential_ratio\s*:\s*([0-9.]+)/);
        if (diffMatch) data.diffRatio = parseFloat(diffMatch[1]);

        const retarderMatch = content.match(/retarder\s*:\s*(\d+)/);
        if (retarderMatch) data.retarder = parseInt(retarderMatch[1]);

        // Extract Gears
        // ratios_reverse[0]: -14.56 or ratios_forward[0]: 12.57
        // We need to capture the index to guess order, or just push them.

        // Reverse
        const revRegex = /ratios_reverse\[\d+\]\s*:\s*(-?[0-9.]+)/g;
        let rMatch;
        let revCounter = 1;
        while ((rMatch = revRegex.exec(content)) !== null) {
            data.gears.push({ name: `R${revCounter++}`, ratio: parseFloat(rMatch[1]) });
        }

        // Forward
        const fwdRegex = /ratios_forward\[\d+\]\s*:\s*([0-9.]+)/g;
        let fMatch;
        let fwdCounter = 1;
        while ((fMatch = fwdRegex.exec(content)) !== null) {
            data.gears.push({ name: `${fwdCounter++}`, ratio: parseFloat(fMatch[1]) });
        }

        return data;

    } catch (e) {
        console.error("Failed to parse transmission .sii", e);
        return null;
    }
}

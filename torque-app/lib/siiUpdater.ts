import { ParsedEngineData } from "./siiParser";

// Helper to escape regex special characters in keys if needed (rare for simple keys)
const createRegex = (key: string) => new RegExp(`^(\\s*${key}\\s*:\\s*)([^#\\n]+)(.*)$`, "gm");

interface ExtendedEngineSpecs {
    name: string;
    price: number;
    unlockLevel: number;
    torqueVal: number;
    rpmLimit: number;
    rpmLimitNeutral: number;
    rpmIdle: number;
    engineBrake: number;
    engineBrakeDownshift: boolean;
    engineBrakePositions: number;
    rpmRangeLowGear: { min: number; max: number };
    rpmRangeHighGear: { min: number; max: number };
    rpmRangePower?: { min: number; max: number };
    rpmRangeEngineBrake: { min: number; max: number };
    targetHp: number;
    truckInternalName?: string;
}

export const updateSiiContent = (
    originalContent: string,
    specs: ExtendedEngineSpecs,
    curvePoints: { rpm: number; ratio: number }[]
): string => {
    let content = originalContent;

    // Helper to replace a line value preserving indentation and comments
    // Matches start of line + whitespace + key + : + value
    const replaceField = (key: string, value: string | number) => {
        // Regex: 
        // Group 1: (^ + indentation + key + :)
        // Group 2: (value) -> consume until whitespace or comment or newline
        // Note: value might be quoted string or number
        const regex = new RegExp(`(^\\s*${key}\\s*:\\s*)(("[^"]*"|[^\\s#]+))`, "gm");

        if (content.match(regex)) {
            content = content.replace(regex, `$1${value}`);
        }
    };

    const replaceRange = (key: string, range: { min: number, max: number }) => {
        const regex = new RegExp(`(^\\s*${key}\\s*:\\s*)(\\([\\d,\\s]+\\))`, "gm");
        if (content.match(regex)) {
            content = content.replace(regex, `$1(${range.min}, ${range.max})`);
        }
    }

    // --- Basic Fields ---
    // Fix: Prevent "Tuned Tuned" if name already has it
    const cleanName = specs.name.replace(/\s*[Tt]uned\s*$/, "");
    replaceField("name", `"${cleanName.toUpperCase()} Tuned"`);

    // Fix: Update the accessory ID to match the new name while PRESERVING suffixes
    // Example: Original "2ws_700.zcustom_01.engine" -> New "2ws_1005.zcustom_01.engine"

    // 1. Generate new base ID from name (e.g. "2ws_1005")
    let newBaseId = cleanName.toLowerCase().replace(/[^a-z0-9_]/g, "_");

    // Safety: "Gogglez Protocol" - Convert 4-digit numbers to 'k' notation to avoid game limits
    // e.g. "1005" -> "1k05", "1500" -> "1k5"
    newBaseId = newBaseId.replace(/(\d{4,})/g, (match) => {
        const num = parseInt(match);
        if (num >= 1000) {
            // Simplified Safety: Just cap it or use K notation aggressively 
            return (num / 1000).toFixed(1).replace('.', 'k'); // 1005 -> 1k0, 1500 -> 1k5
        }
        return match;
    });

    // Remove trailing underscores from messy replace
    newBaseId = newBaseId.replace(/_+/g, "_").replace(/_$/, "");

    const idRegex = /(^\s*accessory_engine_data\s*:\s*)([^\s{]+)/m;
    const match = content.match(idRegex);

    if (match) {
        const originalId = match[2];
        let newId = `${newBaseId}.engine`; // Default fallback
        const parts = originalId.split('.');

        if (specs.truckInternalName && specs.truckInternalName.trim() !== "") {
            // Workflow: "Gogglez Binding" -> [base].[truck_name].engine
            // Example: 2ws_1k0.peterbilt.389v2.engine
            newId = `${newBaseId}.${specs.truckInternalName.trim()}.engine`;
        } else {
            // Fallback: Try to preserve existing suffix if no explicit truck name provided
            if (parts.length > 2) {
                // has middle parts like [base].[suffix].[engine]
                // We keep everything from index 1 onwards
                const suffix = parts.slice(1).join('.');
                newId = `${newBaseId}.${suffix}`;
            } else if (parts.length === 2 && parts[1] !== 'engine') {
                // [base].[something_else]
                newId = `${newBaseId}.${parts[1]}`;
            }
        }

        content = content.replace(idRegex, `$1${newId}`);
    }

    replaceField("price", specs.price);
    replaceField("unlock", specs.unlockLevel);
    replaceField("torque", specs.torqueVal);

    // --- RPM Data ---
    replaceField("rpm_limit", specs.rpmLimit);
    replaceField("rpm_limit_neutral", specs.rpmLimitNeutral);
    replaceField("rpm_idle", specs.rpmIdle);

    // --- Brake Data ---
    replaceField("engine_brake", specs.engineBrake.toFixed(1));
    replaceField("engine_brake_downshift", specs.engineBrakeDownshift ? 1 : 0);
    replaceField("engine_brake_positions", specs.engineBrakePositions);

    // --- Ranges ---
    replaceRange("rpm_range_low_gear", specs.rpmRangeLowGear);
    replaceRange("rpm_range_high_gear", specs.rpmRangeHighGear);
    replaceRange("rpm_range_engine_brake", specs.rpmRangeEngineBrake);

    if (specs.rpmRangePower) {
        replaceRange("rpm_range_power", specs.rpmRangePower);
    }

    // --- Info Strings ---
    // Remove existing info[] lines safely
    content = content.replace(/^\s*info\[\].*(\r?\n|$)/gm, "");

    // Calculate new values
    const hp = specs.targetHp;
    const kw = Math.round(hp * 0.7457);
    const lbft = Math.round(specs.torqueVal * 0.73756);
    const nm = specs.torqueVal;

    // Determine indentation
    const indentMatch = content.match(/^(\s*)name:/m);
    const indent = indentMatch ? indentMatch[1] : "\t";

    const newInfo = [
        `${indent}info[]: "${hp} @@hp@@ (${kw} @@kw@@)"`,
        `${indent}info[]: "${lbft} @@lb_ft@@ (${nm} @@nm@@)"`,
        `${indent}info[]: "1200-1600 @@rpm@@"`
    ].join("\n");

    // Insert after icon or name
    if (content.match(/^\s*icon:/m)) {
        content = content.replace(/(^\s*icon:.*$)/m, `$1\n${newInfo}`);
    } else {
        content = content.replace(/(^\s*name:.*$)/m, `$1\n${newInfo}`);
    }

    // --- Torque Curves ---
    // 1. Identify indentation from first curve line if possible
    const curveLineRegex = /^\s*torque_curve\[\].*$/gm;
    let curveIndent = indent;
    const firstCurve = curveLineRegex.exec(content);
    if (firstCurve) {
        const w = firstCurve[0].match(/^(\s*)/);
        if (w) curveIndent = w[1];
    }

    // 2. Generate new block
    // Reset regex index for safety
    curveLineRegex.lastIndex = 0;

    const sortedPoints = [...curvePoints].sort((a, b) => a.rpm - b.rpm);
    const newCurveBlock = sortedPoints.map(pt => `${curveIndent}torque_curve[]: (${pt.rpm}, ${pt.ratio})`).join("\n");

    // 3. Replace lines
    // Strategy: Replace first line with MARKER, delete others.
    let inserted = false;
    content = content.replace(curveLineRegex, (match) => {
        if (!inserted) {
            inserted = true;
            return "__CURVE_MARKER__";
        }
        return ""; // Delete subsequent lines
    });

    if (inserted) {
        content = content.replace("__CURVE_MARKER__", newCurveBlock);
    }

    // Clean up excessive blank lines
    content = content.replace(/(\r?\n\s*){3,}/g, "\n\n");

    return content;
};

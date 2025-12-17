
import { EngineSpecs } from "@/components/engine/EngineSpecsPanel";
import { ExtendedEngineSpecs } from "@/components/engine/AdvancedSpecsPanel";

// We need to support both standard EngineSpecs and ExtendedEngineSpecs
// Ideally we unify these types, but for now we'll accept a superset
type PatchSource = Partial<ExtendedEngineSpecs> & EngineSpecs;

interface CurvePoint {
    rpm: number;
    ratio: number;
}

/**
 * Patches an existing .sii file content with new engine specifications.
 * Uses Regex to preserve comments, indentation, and structure.
 */
export const patchEngineSii = (
    originalContent: string,
    specs: PatchSource,
    curvePoints: CurvePoint[]
): string => {
    let content = originalContent;

    // --- Helper: Replace simple key: value fields ---
    const replaceField = (key: string, value: string | number) => {
        // Regex looks for:
        // Group 1: Start of line + whitespace + key + : + whitespace
        // Group 2: The value (quoted string or non-whitespace/non-comment characters)
        // It stops before a comment (#) or newline
        const regex = new RegExp(`(^\\s*${key}\\s*:\\s*)(("[^"]*")|([^\\s#]+))`, "gm");

        if (content.match(regex)) {
            content = content.replace(regex, `$1${value}`);
        }
    };

    // --- Helper: Replace ID in "accessory_engine_data : ID" ---
    const patchAccessoryId = () => {
        // If we have a specific ID we want to enforce (from import), use it.
        // Otherwise generate one.
        const idRegex = /(^\s*accessory_engine_data\s*:\s*)([^\s{]+)/m;

        if (specs.id) {
            // If the user hasn't explicitly cleared/changed the internal name logic presumably,
            // we should trust the imported ID to keep it stable.
            if (content.match(idRegex)) {
                content = content.replace(idRegex, `$1${specs.id}`);
                return;
            }
        }

        if (!specs.name) return;

        // Clean name and create base ID
        const cleanName = specs.name.replace(/\s*[Tt]uned\s*$/, "").trim();
        let newBaseId = cleanName.toLowerCase().replace(/[^a-z0-9_]/g, "_");

        // Gogglez Safety: 4+ digit numbers -> k notation
        newBaseId = newBaseId.replace(/(\d{4,})/g, (match) => {
            const num = parseInt(match);
            if (num >= 1000) return (num / 1000).toFixed(1).replace('.', 'k');
            return match;
        });
        newBaseId = newBaseId.replace(/_+/g, "_").replace(/_$/, "");

        const match = content.match(idRegex);
        if (match) {
            const originalId = match[2];
            let newId = `${newBaseId}.engine`; // Default

            // Logic: Try to inject into [base].[truck].[engine]
            if (specs.truckInternalName && specs.truckInternalName.trim()) {
                newId = `${newBaseId}.${specs.truckInternalName.trim()}.engine`;
            } else {
                // Preserve suffix if it exists
                const parts = originalId.split('.');
                if (parts.length >= 2) {
                    const suffix = parts.slice(1).join('.');
                    newId = `${newBaseId}.${suffix}`;
                }
            }
            content = content.replace(idRegex, `$1${newId}`);
        }
    };

    // --- Helper: Replace Torque Curve ---
    const patchTorqueCurve = () => {
        const sortedPoints = [...curvePoints].sort((a, b) => a.rpm - b.rpm);

        // Find indentation from first existing curve point
        const curveRegex = /^(\s*)torque_curve\[\].*$/m;
        const match = content.match(curveRegex);
        // Sanitize indent: Remove newlines, just keep horizontal whitespace (tabs/spaces)
        const indent = match ? match[1].replace(/[\r\n]/g, "") : "\t";

        // Generate new block
        const newBlock = sortedPoints
            .map(pt => `${indent}torque_curve[]: (${pt.rpm}, ${pt.ratio})`)
            .join("\n");

        // Strategy: 
        // 1. Find the first torque_curve line.
        // 2. Find the last torque_curve line (could be contiguous or separated by comments, but usually contiguous).
        // For simplicity/robustness: We replace the *entire block* of torque_curve lines.

        // We'll replace the *first* occurrence with a MARKER, and remove all subsequent occurrences
        // Then replace MARKER with new block.

        let found = false;
        content = content.replace(/^(\s*)torque_curve\[\].*(\r?\n|$)/gm, (m) => {
            if (!found) {
                found = true;
                return "__CURVE_MARKER__\n"; // Keep one newline
            }
            return ""; // Remove others
        });

        if (found) {
            content = content.replace("__CURVE_MARKER__", newBlock);
        } else {
            // If no curves existed, append to end of block (risky, but better than nothing)
            // Ideally finding "}" at very end and inserting before it
            // For now, let's assume valid file has at least ONE curve or we skip
        }
    };

    // --- Helper: Patch Ranges ---
    const patchRange = (key: string, range?: { min: number, max: number }) => {
        if (!range) return;
        const regex = new RegExp(`(^\\s*${key}\\s*:\\s*)(\\([\\d,\\s]+\\))`, "gm");
        content = content.replace(regex, `$1(${range.min}, ${range.max})`);
    };

    // --- Execution ---

    // 1. ID
    patchAccessoryId();

    // 2. Core Strings
    if (specs.name) {
        const displayName = specs.name.replace(/\s*[Tt]uned\s*$/, "").toUpperCase() + " Tuned";
        replaceField("name", `"${displayName}"`);
    }

    if (specs.price) replaceField("price", specs.price);
    if (specs.unlockLevel) replaceField("unlock", specs.unlockLevel);

    // 3. Info Strings (The tricky part)
    // We want to update the "info[]" lines.
    // Usually: 
    // info[]: "500 @@hp@@ (373 @@kw@@)"
    // info[]: "1850 @@lb_ft@@ (2508 @@nm@@)"
    // info[]: "1200-1600 @@rpm@@"

    // Strategy: Remove all existing info[] lines and re-inject them after 'icon:' or 'name:'
    const hp = specs.targetHp;
    const kw = Math.round(hp * 0.7457);
    const lbft = Math.round(specs.torqueVal * 0.73756); // approx
    const nm = specs.torqueVal;

    // Find indent
    const nameMatch = content.match(/^(\s*)name:/m);
    const indent = nameMatch ? nameMatch[1] : "\t";

    const newInfoBlock = [
        `${indent}info[]: "${hp} @@hp@@ (${kw} @@kw@@)"`,
        `${indent}info[]: "${lbft} @@lb_ft@@ (${nm} @@nm@@)"`,
        `${indent}info[]: "1200-1600 @@rpm@@"` // Harcoded range for now, could be dynamic
    ].join("\n");

    // Remove old info[]
    content = content.replace(/^\s*info\[\].*(\r?\n|$)/gm, "");

    // Inject new (after icon, or if missing, after name)
    if (content.match(/^\s*icon:/m)) {
        content = content.replace(/(^\s*icon:.*$)/m, `$1\n${newInfoBlock}`);
    } else {
        content = content.replace(/(^\s*name:.*$)/m, `$1\n${newInfoBlock}`);
    }

    // 4. Specs
    replaceField("torque", specs.torqueVal);
    // Note: volume is not editable in UI yet, preserve original

    if (specs.rpmIdle) replaceField("rpm_idle", specs.rpmIdle);
    if (specs.rpmLimit) replaceField("rpm_limit", specs.rpmLimit);
    if (specs.rpmLimitNeutral) replaceField("rpm_limit_neutral", specs.rpmLimitNeutral);

    if (specs.engineBrake) replaceField("engine_brake", specs.engineBrake.toFixed(1));
    if (specs.engineBrakeDownshift !== undefined) replaceField("engine_brake_downshift", specs.engineBrakeDownshift ? 1 : 0);
    if (specs.engineBrakePositions) replaceField("engine_brake_positions", specs.engineBrakePositions);

    // 5. Ranges
    patchRange("rpm_range_low_gear", specs.rpmRangeLowGear);
    patchRange("rpm_range_high_gear", specs.rpmRangeHighGear);
    patchRange("rpm_range_engine_brake", specs.rpmRangeEngineBrake);
    patchRange("rpm_range_power", specs.rpmRangePower);

    // 6. Curve
    patchTorqueCurve();

    // Cleanup excessive newlines
    content = content.replace(/\n{3,}/g, "\n\n");

    return content;
};

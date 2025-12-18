
export const patchEngineSii = (originalContent: string, specs: any, curvePoints: { rpm: number; ratio: number }[]): string => {
    // 1. Determine Line Endings
    const nl = originalContent.includes('\r\n') ? '\r\n' : '\n';

    // 2. Isolate the accessory_engine_data block
    // We want to find the start of 'accessory_engine_data' and the corresponding closing '}'
    const blockStartRegex = /accessory_engine_data\s*:\s*([^\s{]+)\s*\{/i;
    const match = originalContent.match(blockStartRegex);

    if (!match) return originalContent; // Not found

    const startIdx = match.index!;
    // Find the matching closing brace for this block
    let openBraces = 0;
    let endIdx = -1;
    let foundStart = false;

    for (let i = startIdx; i < originalContent.length; i++) {
        if (originalContent[i] === '{') {
            openBraces++;
            foundStart = true;
        } else if (originalContent[i] === '}') {
            openBraces--;
            if (foundStart && openBraces === 0) {
                endIdx = i;
                break;
            }
        }
    }

    if (endIdx === -1) return originalContent;

    const beforeBlock = originalContent.substring(0, startIdx);
    let blockContent = originalContent.substring(startIdx, endIdx + 1);
    const afterBlock = originalContent.substring(endIdx + 1);

    // 3. Helper to update a single value while preserving format/comments
    const updateKey = (content: string, key: string, newValue: string | number) => {
        const regex = new RegExp(`^(\\s*)${key}\\s*:\\s*([^\\n\\r]+)(.*)$`, 'im');
        if (regex.test(content)) {
            return content.replace(regex, `$1${key}: ${newValue}$3`);
        } else {
            // Add it before the closing brace if missing, trying to match indentation
            const lines = content.split(/\r?\n/);
            const indentMatch = content.match(/^(\s+)/m);
            const indent = indentMatch ? indentMatch[1] : '\t';
            const closingBraceIdx = lines.findLastIndex(l => l.includes('}'));
            if (closingBraceIdx !== -1) {
                lines.splice(closingBraceIdx, 0, `${indent}${key}: ${newValue}`);
            }
            return lines.join(nl);
        }
    };

    // 4. Update basic keys in blockContent
    blockContent = updateKey(blockContent, 'name', `"${specs.name.toUpperCase()} Tuned"`);
    blockContent = updateKey(blockContent, 'price', specs.price);
    blockContent = updateKey(blockContent, 'unlock', specs.unlockLevel);
    blockContent = updateKey(blockContent, 'torque', specs.torqueVal);
    blockContent = updateKey(blockContent, 'rpm_idle', specs.rpmIdle);
    blockContent = updateKey(blockContent, 'rpm_limit', specs.rpmLimit);
    blockContent = updateKey(blockContent, 'rpm_limit_neutral', specs.rpmLimitNeutral);
    blockContent = updateKey(blockContent, 'engine_brake', specs.engineBrake.toFixed(1));
    blockContent = updateKey(blockContent, 'engine_brake_downshift', specs.engineBrakeDownshift ? 1 : 0);
    blockContent = updateKey(blockContent, 'engine_brake_positions', specs.engineBrakePositions);

    // Update Ranges
    blockContent = updateKey(blockContent, 'rpm_range_low_gear', `(${specs.rpmRangeLowGear.min}, ${specs.rpmRangeLowGear.max})`);
    blockContent = updateKey(blockContent, 'rpm_range_high_gear', `(${specs.rpmRangeHighGear.min}, ${specs.rpmRangeHighGear.max})`);
    blockContent = updateKey(blockContent, 'rpm_range_engine_brake', `(${specs.rpmRangeEngineBrake.min}, ${specs.rpmRangeEngineBrake.max})`);

    if (specs.rpmRangePower) {
        blockContent = updateKey(blockContent, 'rpm_range_power', `(${specs.rpmRangePower.min}, ${specs.rpmRangePower.max})`);
    }

    // 5. Update info[] strings (special handling)
    const hp = specs.targetHp;
    const kw = Math.round(hp * 0.7457);
    const lbft = Math.round(specs.torqueVal * 0.73756);
    const nm = Math.round(specs.torqueVal);
    const rangeMin = specs.rpmRangePower?.min || 1200;
    const rangeMax = specs.rpmRangePower?.max || 1600;

    const hpString = `"${hp} @@hp@@ (${kw} @@kw@@)"`;
    const tqString = `"${lbft} @@lb_ft@@ (${nm} @@nm@@)"`;
    const rpmString = `"${rangeMin}-${rangeMax} @@rpm@@"`;

    // Target the specific info lines
    // This is naive and assumes standard order, but safe enough if we match text
    blockContent = blockContent.replace(/info\[\]\s*:\s*"[^"]+@@hp@@[^"]+"/, `info[]: ${hpString}`);
    blockContent = blockContent.replace(/info\[\]\s*:\s*"[^"]+@@lb_ft@@[^"]+"/, `info[]: ${tqString}`);
    blockContent = blockContent.replace(/info\[\]\s*:\s*"[^"]+-(?:[0-9]+)\s*@@rpm@@[^"]+"/, `info[]: ${rpmString}`);

    // 6. Update Torque Curves (Rebuild entire section)
    const curveRegex = /(\s*)torque_curve\[\]\s*:\s*\([^)]+\)[\r\n]*/gi;
    const firstCurveMatch = blockContent.match(curveRegex);
    const indent = firstCurveMatch ? firstCurveMatch[0].match(/^\s*/)?.[0] || '\t' : '\t';

    // Sort and format new curve
    const sortedPoints = [...curvePoints].sort((a, b) => a.rpm - b.rpm);
    const newCurveLines = sortedPoints.map(p => `${indent}torque_curve[]: (${p.rpm}, ${p.ratio})`).join(nl) + nl;

    if (firstCurveMatch) {
        // Find the start of the first curve and end of the last consecutive one
        const matches = [...blockContent.matchAll(curveRegex)];
        const start = matches[0].index!;
        const end = matches[matches.length - 1].index! + matches[matches.length - 1][0].length;
        blockContent = blockContent.substring(0, start) + newCurveLines + blockContent.substring(end);
    } else {
        // Append before last closing brace
        const lines = blockContent.split(/\r?\n/);
        const closingBraceIdx = lines.findLastIndex(l => l.includes('}'));
        if (closingBraceIdx !== -1) {
            lines.splice(closingBraceIdx, 0, newCurveLines);
        }
        blockContent = lines.join(nl);
    }

    // 7. Reassemble
    let finalContent = beforeBlock + blockContent + afterBlock;

    // Final Cleanup (Consecutive newlines)
    const doubleNl = nl + nl;
    const tripleNl = nl + nl + nl;
    while (finalContent.includes(tripleNl)) {
        finalContent = finalContent.split(tripleNl).join(doubleNl);
    }

    return finalContent;
};

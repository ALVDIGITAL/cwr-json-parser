"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRecordLine = parseRecordLine;
const prefix_1 = require("./prefix");
const recordDefinitions_1 = require("../types/recordDefinitions");
/**
 * Parse a single CWR line into a normalized record object:
 * {
 *   type: 'NWR',
 *   fields: [
 *     { label, value, mandatory, type },
 *     ...
 *   ]
 * }
 */
function parseRecordLine(line) {
    const type = (0, prefix_1.getRecordType)(line);
    const def = recordDefinitions_1.recordDefinitions[type];
    if (!def) {
        // Unknown record → fallback: treat entire line as raw
        const rawBody = line.substring(3);
        return {
            type,
            fields: [
                {
                    label: "RecordType",
                    value: type,
                    displayValue: type,
                    mandatory: false
                },
                {
                    label: "Raw",
                    value: rawBody,
                    displayValue: rawBody.trim().length === 0 ? '' : rawBody,
                    mandatory: false
                }
            ]
        };
    }
    const fields = [];
    for (const f of def) {
        const startIndex = f.start - 1; // spec starts at 1
        const endIndex = startIndex + f.length;
        const raw = line.substring(startIndex, endIndex);
        const isBlank = raw.trim().length === 0;
        const displayValue = isBlank ? '..' : raw.trimEnd();
        fields.push({
            label: f.label,
            value: raw, // exact slice; no trimming/munging
            displayValue,
            mandatory: f.mandatory,
            type: f.type,
            start: f.start,
            length: f.length,
            rev3: 'rev3' in f ? Boolean(f.rev3) : false
        });
    }
    return { type, fields };
}
//# sourceMappingURL=recordParser.js.map
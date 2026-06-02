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
export declare function parseRecordLine(line: string): {
    type: string;
    fields: {
        label: string;
        value: string;
        displayValue: string;
        mandatory: boolean;
    }[];
} | {
    type: string;
    fields: {
        label: string;
        value: string;
        displayValue: string;
        mandatory: boolean;
        type: string;
        start: number;
        length: number;
        rev3: boolean;
    }[];
};
//# sourceMappingURL=recordParser.d.ts.map
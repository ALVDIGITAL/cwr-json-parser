export declare function detectWorkRecordType(lines: string[]): string;
export declare function splitIntoWorkBlocks(rawText: string): {
    hdr: string | null;
    workRecordType: string;
    blocks: string[][];
};
export declare function extractFirstWorkPreview(rawText: string): {
    workRecordType: string;
    preview: string;
    lines: never[];
    additional: number;
    hdr?: undefined;
    orderValidation?: undefined;
    sequenceValidation?: undefined;
} | {
    hdr: string;
    workRecordType: string;
    lines: string[];
    additional: number;
    orderValidation: {
        ok: boolean;
        problems: string[];
    };
    sequenceValidation: {
        ok: boolean;
        problems: string[];
    };
    preview?: undefined;
};
//# sourceMappingURL=blockExtractor.d.ts.map
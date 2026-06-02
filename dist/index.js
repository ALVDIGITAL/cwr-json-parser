"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCwrEdi = exports.validateCwrSequence = exports.validateCwrRecordOrder = exports.validateCwrFilename = exports.validateParsedCwr = exports.validateCwrJson = void 0;
exports.parseCwr = parseCwr;
const canonicalMapper_1 = require("./cwr-sdk/mapper/canonicalMapper");
const schemaV1_1 = require("./cwr-sdk/mapper/schemas/schemaV1");
const blockExtractor_1 = require("./cwr-sdk/parser/blockExtractor");
var schemaValidation_1 = require("./validation/schemaValidation");
Object.defineProperty(exports, "validateCwrJson", { enumerable: true, get: function () { return schemaValidation_1.validateCwrJson; } });
Object.defineProperty(exports, "validateParsedCwr", { enumerable: true, get: function () { return schemaValidation_1.validateParsedCwr; } });
var fileValidation_1 = require("./validation/fileValidation");
Object.defineProperty(exports, "validateCwrFilename", { enumerable: true, get: function () { return fileValidation_1.validateCwrFilename; } });
Object.defineProperty(exports, "validateCwrRecordOrder", { enumerable: true, get: function () { return fileValidation_1.validateCwrRecordOrder; } });
Object.defineProperty(exports, "validateCwrSequence", { enumerable: true, get: function () { return fileValidation_1.validateCwrSequence; } });
Object.defineProperty(exports, "validateCwrEdi", { enumerable: true, get: function () { return fileValidation_1.validateCwrEdi; } });
function parseAllWorks(raw) {
    const { hdr, blocks } = (0, blockExtractor_1.splitIntoWorkBlocks)(raw);
    if (blocks.length === 0) {
        return (0, canonicalMapper_1.toCanonical)({ lines: [] });
    }
    const works = [];
    let header;
    for (let i = 0; i < blocks.length; i++) {
        const lines = hdr && i > 0 ? [hdr, ...blocks[i]] : blocks[i];
        const parsed = (0, canonicalMapper_1.toCanonical)({ lines });
        if (i === 0)
            header = parsed.header;
        works.push(...parsed.works);
    }
    return { header, works };
}
/**
 * Parse CWR file contents into CWR-JSON Schema v1.0 output.
 *
 * @param cwrContent - Full CWR file text (UTF-8). In the browser use `await file.text()`;
 *   in Node use `fs.readFileSync(path, 'utf8')` or `buffer.toString('utf8')`.
 */
function parseCwr(cwrContent) {
    if (typeof cwrContent !== 'string') {
        throw new TypeError('parseCwr expects a string containing CWR file contents');
    }
    return schemaV1_1.schemaV1.convert(parseAllWorks(cwrContent));
}
//# sourceMappingURL=index.js.map
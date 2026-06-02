"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCwrJson = validateCwrJson;
exports.validateParsedCwr = validateParsedCwr;
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const schemaAssetMap_1 = require("../cwr-sdk/json-schemas/schemaAssetMap");
const DEFAULT_SCHEMA_ID = 'cwr-json-v1-0';
const ajv = new ajv_1.default({ allErrors: true, strict: false, verbose: true });
(0, ajv_formats_1.default)(ajv);
const validatorCache = new Map();
function normalizeErrors(errors) {
    if (!errors?.length)
        return [];
    return errors.map((err, index) => formatAjvError(err, index + 1));
}
function formatValue(value) {
    if (value === null)
        return 'null';
    if (typeof value === 'string')
        return `"${value}"`;
    if (Array.isArray(value))
        return `[array(${value.length})]`;
    if (typeof value === 'object')
        return '[object]';
    return String(value);
}
function formatPath(path) {
    return path.length ? path : '/';
}
function escapeJsonPointerSegment(segment) {
    return segment.replace(/~/g, '~0').replace(/\//g, '~1');
}
function appendPathSegment(basePath, segment) {
    const normalized = formatPath(basePath);
    const escaped = escapeJsonPointerSegment(segment);
    return normalized === '/' ? `/${escaped}` : `${normalized}/${escaped}`;
}
function getExpectedHint(err) {
    if (err.keyword === 'type' && typeof err.params === 'object' && err.params && 'type' in err.params) {
        return `expected type ${err.params.type}`;
    }
    if (err.keyword === 'required' && typeof err.params === 'object' && err.params && 'missingProperty' in err.params) {
        return `expected required property ${err.params.missingProperty}`;
    }
    if (err.keyword === 'additionalProperties' &&
        typeof err.params === 'object' &&
        err.params &&
        'additionalProperty' in err.params) {
        return `unexpected property ${err.params.additionalProperty}`;
    }
    return null;
}
function formatAjvError(err, order) {
    let path = formatPath(err.instancePath);
    if (err.keyword === 'required' && typeof err.params === 'object' && err.params && 'missingProperty' in err.params) {
        path = appendPathSegment(path, String(err.params.missingProperty));
    }
    const expectedHint = getExpectedHint(err);
    const keyword = err.keyword ? ` [${err.keyword}]` : '';
    const message = err.message || 'invalid value';
    if (expectedHint) {
        return `${order}. ${path}${keyword}: ${message}; ${expectedHint}`;
    }
    return `${order}. ${path}${keyword}: ${message}`;
}
function getValidator(schemaId = DEFAULT_SCHEMA_ID) {
    const cached = validatorCache.get(schemaId);
    if (cached)
        return cached;
    const validator = ajv.compile((0, schemaAssetMap_1.getSchemaAsset)(schemaId));
    validatorCache.set(schemaId, validator);
    return validator;
}
/**
 * Validate parsed CWR-JSON (Schema v1.0 output) against the bundled JSON Schema.
 */
function validateCwrJson(payload, mode = 'strict', schemaId = DEFAULT_SCHEMA_ID) {
    try {
        const validator = getValidator(schemaId);
        const valid = Boolean(validator(payload));
        const errors = normalizeErrors(validator.errors);
        if (mode === 'advisory') {
            return { valid: true, errors };
        }
        return { valid, errors };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
            valid: false,
            errors: [`/: validation setup error - ${message}`],
        };
    }
}
/** Type guard helper: parse output is expected to satisfy SchemaV1Output. */
function validateParsedCwr(payload, mode = 'strict') {
    return validateCwrJson(payload, mode);
}
//# sourceMappingURL=schemaValidation.js.map
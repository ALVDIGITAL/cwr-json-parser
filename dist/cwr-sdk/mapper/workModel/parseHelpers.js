"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lineToObj = lineToObj;
exports.parseShares = parseShares;
exports.normalizePartyKey = normalizePartyKey;
exports.normalizeSequenceKey = normalizeSequenceKey;
exports.isPublisherOwnEligible = isPublisherOwnEligible;
const recordParser_1 = require("../../parser/recordParser");
function lineToObj(line) {
    const parsed = (0, recordParser_1.parseRecordLine)(line);
    const fields = parsed?.fields || parsed;
    if (!Array.isArray(fields))
        return {};
    return fields.reduce((acc, f) => {
        acc[f.label] = (f.value ?? '').trim();
        return acc;
    }, {});
}
function parseShares(obj, prKey, mrKey, srKey, defaultSociety) {
    const shares = [];
    const toVal = (v) => {
        if (!v || !v.trim())
            return undefined;
        const num = parseFloat(v) / 100;
        return parseFloat(num.toFixed(2));
    };
    const pushShare = (rightsType, val) => {
        if (val !== undefined && !Number.isNaN(val)) {
            shares.push({ rightsType, value: val, society: defaultSociety });
        }
    };
    pushShare('pr', toVal(obj[prKey]));
    pushShare('mr', toVal(obj[mrKey]));
    pushShare('sr', toVal(obj[srKey]));
    return shares;
}
function normalizePartyKey(value) {
    return (value || '').trim().replace(/^0+/, '');
}
function normalizeSequenceKey(seq) {
    const raw = (seq || '').trim();
    if (!raw)
        return '';
    const n = parseInt(raw, 10);
    if (Number.isNaN(n))
        return raw;
    return String(n).padStart(2, '0');
}
function isPublisherOwnEligible(role) {
    return (role || '').trim() === 'E';
}
//# sourceMappingURL=parseHelpers.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCwrFilename = validateCwrFilename;
function validateCwrFilename(name) {
    // Convention: CWyynnnnsss_rrr.Vxx
    // - yy: year (2 digits)
    // - nnnn: sequence (4 digits; legacy was 2 digits)
    // - sss/rrr: sender/receiver (2-3 alnum for publisher OR exactly 3 digits for society)
    // - Vxx: version (2 digits)
    //
    // This app also allows generic `.cwr` filenames for local testing.
    if (/\.cwr$/i.test(name))
        return null;
    const re = /^CW(\d{2})(\d{2}|\d{4})([A-Z0-9]{2,3})_([A-Z0-9]{2,3})\.V(\d{2})$/i;
    if (!re.test(name)) {
        return `Invalid filename. Expected convention: CWyynnnnsss_rrr.Vxx (e.g. CW250312BOU_000.V21). Got: "${name}".`;
    }
    return null;
}
//# sourceMappingURL=filenameValidator.js.map
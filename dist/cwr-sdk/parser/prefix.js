"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecordType = getRecordType;
function getRecordType(line) {
    // First 3 chars always record type
    return line.substring(0, 3);
}
//# sourceMappingURL=prefix.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCanonicalFromLines = exports.projectCanonicalFromModel = exports.buildWorkModel = void 0;
exports.toCanonical = toCanonical;
const projectCanonical_1 = require("./workModel/projectCanonical");
var buildWorkModel_1 = require("./workModel/buildWorkModel");
Object.defineProperty(exports, "buildWorkModel", { enumerable: true, get: function () { return buildWorkModel_1.buildWorkModel; } });
var projectCanonical_2 = require("./workModel/projectCanonical");
Object.defineProperty(exports, "projectCanonicalFromModel", { enumerable: true, get: function () { return projectCanonical_2.projectCanonicalFromModel; } });
Object.defineProperty(exports, "toCanonicalFromLines", { enumerable: true, get: function () { return projectCanonical_2.toCanonicalFromLines; } });
function toCanonical(previewData) {
    const { lines = [] } = previewData || {};
    return (0, projectCanonical_1.toCanonicalFromLines)(lines);
}
//# sourceMappingURL=canonicalMapper.js.map
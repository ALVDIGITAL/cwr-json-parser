"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemaAssetMap = void 0;
exports.getSchemaAsset = getSchemaAsset;
const cwr_json_schema_v1_0_schema_json_1 = __importDefault(require("../json-schemas/cwr-json-schema-v1.0.schema.json"));
/**
 * Unified V1 schema asset (merged canonical + V1 output contract).
 */
exports.schemaAssetMap = {
    'cwr-json-v1-0': cwr_json_schema_v1_0_schema_json_1.default
};
function getSchemaAsset(schemaId) {
    const schema = exports.schemaAssetMap[schemaId];
    if (!schema) {
        throw new Error(`Missing generated schema asset for id: ${schemaId}`);
    }
    return schema;
}
//# sourceMappingURL=schemaAssetMap.js.map
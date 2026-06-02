import type { SchemaV1Output } from './cwr-sdk/types/cwr';
export type { SchemaV1Output, SchemaV1WorkOutput, SchemaV1Messages, HdrRecord, Participant, Recording, WorkTitle, WorkIdentifier, } from './cwr-sdk/types/cwr';
export type { ValidationMode, ValidationResult, CwrEdiValidationOptions, CwrEdiValidationResult, } from './validation/types';
export { validateCwrJson, validateParsedCwr, } from './validation/schemaValidation';
export { validateCwrFilename, validateCwrRecordOrder, validateCwrSequence, validateCwrEdi, } from './validation/fileValidation';
/**
 * Parse CWR file contents into CWR-JSON Schema v1.0 output.
 *
 * @param cwrContent - Full CWR file text (UTF-8). In the browser use `await file.text()`;
 *   in Node use `fs.readFileSync(path, 'utf8')` or `buffer.toString('utf8')`.
 */
export declare function parseCwr(cwrContent: string): SchemaV1Output;
//# sourceMappingURL=index.d.ts.map
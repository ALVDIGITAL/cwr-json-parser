import { toCanonical } from './cwr-sdk/mapper/canonicalMapper';
import { schemaV1 } from './cwr-sdk/mapper/schemas/schemaV1';
import { splitIntoWorkBlocks } from './cwr-sdk/parser/blockExtractor';
import type { ParsedCwrFile, SchemaV1Output } from './cwr-sdk/types/cwr';

export type {
  SchemaV1Output,
  SchemaV1WorkOutput,
  SchemaV1Messages,
  HdrRecord,
  Participant,
  Recording,
  WorkTitle,
  WorkIdentifier,
} from './cwr-sdk/types/cwr';

export type {
  ValidationMode,
  ValidationResult,
  ValidationOptions,
  CwrEdiValidationOptions,
  CwrEdiValidationResult,
} from './validation/types';

export {
  validateCwrJson,
  validateParsedCwr,
  normalizeCwrJson,
  formatIswcForValidation,
} from './validation/schemaValidation';
export type { NormalizeCwrJsonResult } from './validation/normalizeCwrJson';

export {
  validateCwrFilename,
  validateCwrRecordOrder,
  validateCwrSequence,
  validateCwrEdi,
} from './validation/fileValidation';

function parseAllWorks(raw: string): ParsedCwrFile {
  const { hdr, blocks } = splitIntoWorkBlocks(raw);
  if (blocks.length === 0) {
    return toCanonical({ lines: [] });
  }

  const works: ParsedCwrFile['works'] = [];
  let header: ParsedCwrFile['header'];

  for (let i = 0; i < blocks.length; i++) {
    const lines = hdr && i > 0 ? [hdr, ...blocks[i]] : blocks[i];
    const parsed = toCanonical({ lines });
    if (i === 0) header = parsed.header;
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
export function parseCwr(cwrContent: string): SchemaV1Output {
  if (typeof cwrContent !== 'string') {
    throw new TypeError('parseCwr expects a string containing CWR file contents');
  }
  return schemaV1.convert(parseAllWorks(cwrContent));
}

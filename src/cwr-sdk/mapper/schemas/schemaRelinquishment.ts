import { ParsedCwrFile } from '../../types/cwr';
import type { CwrJsonSchema } from '../schemaTypes';

export interface SchemaRelinquishmentWorkOutput {
  messages: Record<string, unknown>;
  flags?: Record<string, unknown>;
  titles?: unknown[];
  identifiers?: unknown[];
  parties?: unknown[];
  recordings?: unknown[];
}

export interface SchemaRelinquishmentOutput {
  header?: Record<string, unknown>;
  works: SchemaRelinquishmentWorkOutput[];
}

export const schemaRelinquishment: CwrJsonSchema<SchemaRelinquishmentOutput> = {
  id: 'cwr-json-schema-relinquishment',
  label: 'CWR-JSON / Relinquishment Schema',
  description: 'Schema A extended with CWR 3.x relinquishment support. Demonstrates when an E publisher stops representing a writer for specific rights and territories, with optional Post-Term Collection date.',
  version: '0.1.0',
  jsonSchema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://example.org/cwr-json/schema-relinquishment.json',
    title: 'CWR-JSON Relinquishment Schema',
    type: 'object',
    properties: {
      header: { type: 'object' },
      works: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            envelope: {
              type: 'object',
              properties: {
                schema: { type: 'string' },
                schemaDescription: { type: 'string' }
              }
            },
            titles: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  value: { type: 'string' },
                  type: { type: 'string' },
                  language: { type: 'string' }
                },
                required: ['value']
              }
            },
            identifiers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  source: { type: 'string' },
                  value: { type: 'string' }
                },
                required: ['source', 'value']
              }
            },
            parties: { type: 'array' },
            recordings: { type: 'array' }
          },
          required: []
        }
      }
    },
    required: ['works']
  },
  convert(parsed: ParsedCwrFile): SchemaRelinquishmentOutput {
    const output: SchemaRelinquishmentOutput = {
      header: parsed.header as Record<string, unknown>,
      works: []
    };

    for (const work of parsed.works) {
      output.works.push({
        messages: {
          ...work.messages,
          schema: this.label,
          schemaDescription: this.description
        },
        flags: work.flags,
        titles: work.titles,
        identifiers: work.identifiers,
        parties: work.parties,        // ownership hierarchy with relinquishment on E publishers
        recordings: work.recordings
      });
    }

    return output;
  }
};

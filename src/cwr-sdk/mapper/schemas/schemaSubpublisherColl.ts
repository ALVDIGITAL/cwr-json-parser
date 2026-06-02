import { ParsedCwrFile } from '../../types/cwr';
import type { CwrJsonSchema } from '../schemaTypes';

export interface SchemaSubpublisherCollWorkOutput {
  messages: Record<string, unknown>;
  flags?: Record<string, unknown>;
  titles?: unknown[];
  identifiers?: unknown[];
  parties?: unknown[];
  recordings?: unknown[];
}

export interface SchemaSubpublisherCollOutput {
  header?: Record<string, unknown>;
  works: SchemaSubpublisherCollWorkOutput[];
}

export const schemaSubpublisherColl: CwrJsonSchema<SchemaSubpublisherCollOutput> = {
  id: 'subpublisher-coll',
  label: 'Subpublisher COLL',
  description: 'Subpublisher-focused representation using party hierarchy without a separate collection node.',
  version: '1.0.0',
  jsonSchema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://example.org/cwr-json/subpublisher-coll.json',
    title: 'Subpublisher COLL Schema',
    type: 'object',
    properties: {
      header: { type: 'object' },
      works: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            messages: { type: 'object' },
            titles: { type: 'array' },
            identifiers: { type: 'array' },
            flags: { type: 'object' },
            parties: { type: 'array' },
            recordings: { type: 'array' }
          }
        }
      }
    },
    required: ['works']
  },
  convert(parsed: ParsedCwrFile): SchemaSubpublisherCollOutput {
    const output: SchemaSubpublisherCollOutput = {
      header: parsed.header as Record<string, unknown>,
      works: []
    };

    for (const work of parsed.works) {
      const transformed: SchemaSubpublisherCollWorkOutput = {
        messages: {
          ...work.messages,
          schema: this.label,
          schemaDescription: this.description
        },
        flags: work.flags,
        titles: work.titles,
        identifiers: work.identifiers,
        parties: work.parties,
        recordings: work.recordings
      };

      output.works.push(transformed);
    }

    return output;
  }
};


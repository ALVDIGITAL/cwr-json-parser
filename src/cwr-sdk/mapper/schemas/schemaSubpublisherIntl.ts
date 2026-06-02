import { ParsedCwrFile } from '../../types/cwr';
import type { CwrJsonSchema } from '../schemaTypes';

export interface SchemaSubpublisherIntlWorkOutput {
  messages: Record<string, unknown>;
  flags?: Record<string, unknown>;
  titles?: unknown[];
  identifiers?: unknown[];
  recordings?: unknown[];
  intl?: { interestedParties: unknown[] };
}

export interface SchemaSubpublisherIntlOutput {
  header?: Record<string, unknown>;
  works: SchemaSubpublisherIntlWorkOutput[];
}

export const schemaSubpublisherIntl: CwrJsonSchema<SchemaSubpublisherIntlOutput> = {
  id: 'subpublisher-intl',
  label: 'Subpublisher INTL',
  description: 'International territory ownership data for original publisher to subpublisher exchange. Uses INTL node to represent cross-border licensing arrangements with complete ownership chains.',
  version: '1.0.0',
  jsonSchema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://example.org/cwr-json/subpublisher-intl.json',
    title: 'Subpublisher INTL Schema',
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
            intl: { type: 'object' },
            recordings: { type: 'array' }
          }
        }
      }
    },
    required: ['works']
  },
  convert(parsed: ParsedCwrFile): SchemaSubpublisherIntlOutput {
    const output: SchemaSubpublisherIntlOutput = {
      header: parsed.header as Record<string, unknown>,
      works: []
    };

    for (const work of parsed.works) {
      const transformed: SchemaSubpublisherIntlWorkOutput = {
        messages: {
          ...work.messages,
          schema: this.label,
          schemaDescription: this.description
        },
        flags: work.flags,
        titles: work.titles,
        identifiers: work.identifiers,
        recordings: work.recordings
      };

      // Intl node: same structure as own, just different name
      if (work.parties) {
        transformed.intl = {
          interestedParties: work.parties
        };
      }

      output.works.push(transformed);
    }

    return output;
  }
};


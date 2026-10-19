import type { ParsedCwrFile, SchemaV1Output } from '../../types/cwr';
import type { CwrJsonSchema } from '../schemaTypes';

export const schemaV1: CwrJsonSchema<SchemaV1Output> = {
  id: 'cwr-json-v1-0',
  label: 'CWR-JSON Schema v1.0',
  description: 'Complete canonical representation with both ownership and collection data. This schema preserves all CWR semantics including hierarchical ownership chains and territorial collection splits.',
  version: '1.0.1',
  jsonSchema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://example.org/cwr-json/schema-v1.0.json',
    title: 'CWR-JSON Schema v1.0',
    type: 'object',
    properties: {
      header: { type: 'object' },
      works: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
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
                oneOf: [
                  {
                    type: 'object',
                    required: ['iswc'],
                    properties: { iswc: { type: 'array', items: { type: 'string' }, minItems: 1 } }
                  },
                  {
                    type: 'object',
                    properties: {
                      type: { type: 'string' },
                      value: { type: 'string' },
                      source: {
                        type: 'object',
                        properties: {
                          type: { type: 'string' },
                          value: { type: 'string' },
                          name: { type: 'string' }
                        },
                        required: ['type', 'value']
                      }
                    },
                    required: ['type', 'value']
                  }
                ]
              }
            },
            messages: { type: 'object' },
            flags: { type: 'object' },
            parties: { type: 'array', items: { type: 'object' } },
            recordings: { type: 'array' }
          },
          required: []
        }
      }
    },
    required: ['works']
  },
  convert(parsed: ParsedCwrFile): SchemaV1Output {
    const output: SchemaV1Output = {
      header: parsed.header,
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
        parties: work.parties,
        recordings: work.recordings
      });
    }

    return output;
  }
};




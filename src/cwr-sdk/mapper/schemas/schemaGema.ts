import { ParsedCwrFile } from '../../types/cwr';
import type { CwrJsonSchema } from '../schemaTypes';

export interface SchemaGemaWorkOutput {
  messages: Record<string, unknown>;
  flags?: Record<string, unknown>;
  titles?: unknown[];
  identifiers?: unknown[];
  recordings?: unknown[];
  societySpecific: {
    cisacCode: string;
    cisacName: string;
    roleSplit: { music: number; text: number };
  };
  parties?: unknown;
}

export interface SchemaGemaOutput {
  header?: Record<string, unknown>;
  works: SchemaGemaWorkOutput[];
}

export const schemaGema: CwrJsonSchema<SchemaGemaOutput> = {
  id: 'gema-role-split',
  label: 'GEMA Schema',
  description: 'Publisher-specific role split parsing including ARI record data. Designed for society-specific reporting with predefined music/text role split percentages and ownership hierarchy.',
  version: '1.0.0',
  jsonSchema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://example.org/cwr-json/gema-role-split.json',
    title: 'GEMA Schema',
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
            societySpecific: {
              type: 'object',
              properties: {
                cisacCode: { type: 'string' },
                cisacName: { type: 'string' },
                roleSplit: {
                  type: 'object',
                  properties: {
                    music: { type: 'number' },
                    text: { type: 'number' }
                  }
                }
              }
            },
            recordings: { type: 'array' }
          }
        }
      }
    },
    required: ['works']
  },
  convert(parsed: ParsedCwrFile): SchemaGemaOutput {
    const output: SchemaGemaOutput = {
      header: parsed.header as Record<string, unknown>,
      works: []
    };

    for (const work of parsed.works) {
      const transformed: SchemaGemaWorkOutput = {
        messages: {
          ...work.messages,
          schema: this.label,
          schemaDescription: this.description
        },
        flags: work.flags,
        titles: work.titles,
        identifiers: work.identifiers,
        recordings: work.recordings,
        societySpecific: {
          cisacCode: '',
          cisacName: '',
          roleSplit: {
            music: 0,
            text: 0
          }
        }
      };

      // SocietySpecific node at work level
      const societyInfo = (work.messages?.societySpecific || {}) as Record<string, string>;
      transformed.societySpecific = {
        cisacCode: societyInfo.cisacCode || '035',
        cisacName: societyInfo.cisacName || 'GEMA',
        roleSplit: {
          music: 50.0,
          text: 50.0
        }
      };

      // Keep chains node with writers
      if (work.parties) {
        transformed.parties = work.parties;
      }

      output.works.push(transformed);
    }

    return output;
  }
};


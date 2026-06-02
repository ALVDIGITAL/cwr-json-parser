import { ParsedCwrFile } from '../../types/cwr';
import type { CwrJsonSchema } from '../schemaTypes';

export interface SchemaIntlNamesWorkOutput {
  messages: Record<string, unknown>;
  flags?: Record<string, unknown>;
  titles?: unknown[];
  identifiers?: unknown[];
  parties: unknown[];
}

export interface SchemaIntlNamesOutput {
  header?: Record<string, unknown>;
  works: SchemaIntlNamesWorkOutput[];
}

export const schemaIntlNames: CwrJsonSchema<SchemaIntlNamesOutput> = {
  id: 'cwr-json-schema-intl',
  label: 'CWR-JSON / UTF-8 International Names',
  description: 'Demonstrates UTF-8 support for non-Roman alphabet titles and names using NAT, NWN, NOW, and NPN records. This schema shows how CWR-JSON handles Japanese, Chinese, Korean, Arabic, and other non-Latin scripts natively.',
  version: '0.1.0',
  jsonSchema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://example.org/cwr-json/schema-intl.json',
    title: 'CWR-JSON Schema - UTF-8 International Names',
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
            identifiers: { type: 'array' },
            messages: { type: 'object' },
            flags: { type: 'object' },
            parties: { type: 'array' }
          }
        }
      }
    },
    required: ['works']
  },

  // Note: Using an arrow function for 'convert' allows 'this' to bind properly
  // if you are relying on 'this.label' inside the method.
  convert(parsed: ParsedCwrFile): SchemaIntlNamesOutput {
    const output: SchemaIntlNamesOutput = {
      header: parsed.header as Record<string, unknown>,
      works: []
    };

    // 1. FIXED: Pass a 'visited' Set to track circular references and prevent stack overflows.
    const transformParticipant = (p: any, visited = new Set()): any => {
      if (!p || visited.has(p)) return undefined; // Break circular loops
      visited.add(p);

      const result: any = {
        role: p.role,
        name: p.name,
        ipi: p.ipi,
        partyId: p.partyId
      };

      // Safer checks to explicitly handle boolean false or empty strings
      if (p.controlled !== undefined) result.controlled = p.controlled;
      if (p.nameDomestic !== undefined) result.nameDomestic = p.nameDomestic;
      if (p.nameScript !== undefined) result.nameScript = p.nameScript;
      if (p.shares?.length) result.shares = p.shares;

      if (p.representedBy?.length) {
        result.representedBy = p.representedBy
          .map((rep: any) => transformParticipant(rep, visited))
          .filter(Boolean); // Strip out any undefined values returned by the circular check
      }

      return result;
    };

    for (const work of parsed.works) {
      const parties: Record<string, unknown> = {};

      if (work.parties) {
        // Initialize a new Set for each new hierarchy tree to allow legitimate duplicate entities across different branches
        parties.parties = work.parties.map((w: any) => transformParticipant(w, new Set()));
      }

      output.works.push({
        messages: {
          ...work.messages,
          schema: this.label,
          schemaDescription: this.description
        },
        flags: work.flags,
        titles: work.titles,
        identifiers: work.identifiers,
        parties: parties.parties as unknown[]
      });
    }

    return output;
  }
};

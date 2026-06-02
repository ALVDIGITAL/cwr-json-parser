import { ParsedCwrFile } from '../../types/cwr';
import type { CwrJsonSchema } from '../schemaTypes';

export interface SchemaCWorkOutput {
  messages: Record<string, unknown>;
  flags?: Record<string, unknown>;
  titles?: unknown[];
  identifiers?: unknown[];
  parties: { interestedParties?: unknown[] };
  recordings?: unknown[];
}

export interface SchemaCOutput {
  header?: Record<string, unknown>;
  works: SchemaCWorkOutput[];
}

export const schemaC: CwrJsonSchema<SchemaCOutput> = {
  id: 'cwr-json-schema-c',
  label: 'CWR-JSON / Schema C',
  description: 'Party-focused representation with ownership hierarchy showing OWN share types.',
  version: '0.1.0',
  jsonSchema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://example.org/cwr-json/schema-c.json',
    title: 'CWR-JSON Schema C',
    type: 'object',
    properties: {
      header: { type: 'object' },
      works: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            messages: { type: 'object' },
            flags: { type: 'object' },
            titles: { type: 'array' },
            identifiers: { type: 'array' },
            parties: {
              type: 'object',
              description: 'Ownership hierarchy with OWN share types',
              properties: {
                interestedParties: { type: 'array' }
              }
            },
            recordings: { type: 'array' }
          }
        }
      }
    },
    required: ['works']
  },
  convert(parsed: ParsedCwrFile): SchemaCOutput {
    const output: SchemaCOutput = {
      header: parsed.header as Record<string, unknown>,
      works: []
    };

    for (const work of parsed.works) {
      // Deep clone ownership to avoid mutating original
      const parties = { interestedParties: JSON.parse(JSON.stringify(work.parties || [])) };

      // Add shareType: "own" to shares, but remove shares entirely for SE and AM roles
      const addOwnShareType = (participant: any) => {
        const role = participant.role?.toUpperCase?.() || '';
        // SE and AM don't get "own" shares - they only get "coll" shares from SPT
        if (role === 'SE' || role === 'AM') {
          participant.shares = []; // Clear own shares, will be filled with coll shares later
        } else if (participant.shares && Array.isArray(participant.shares)) {
          participant.shares = participant.shares.map((s: any) => ({
            ...s,
            shareType: 'own'
          }));
        }
        if (participant.representedBy && Array.isArray(participant.representedBy)) {
          participant.representedBy.forEach(addOwnShareType);
        }
      };

      if (Array.isArray(parties.interestedParties)) {
        parties.interestedParties.forEach(addOwnShareType);
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
        parties,
        recordings: work.recordings
      });
    }

    return output;
  }
};

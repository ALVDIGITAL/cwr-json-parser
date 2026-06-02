import { ParsedCwrFile } from '../../types/cwr';
import type { CwrJsonSchema } from '../schemaTypes';

export interface SchemaAckMessage {
  type: string;
  value: string;
}

export interface SchemaAckIdentifier {
  source: string;
  value: string;
}

export interface SchemaAckWorkOutput {
  messages: Record<string, unknown>;
  flags?: Record<string, unknown>;
  titles?: unknown[];
  identifiers: SchemaAckIdentifier[];
  parties?: unknown;
  recordings?: unknown[];
}

export interface SchemaAckOutput {
  header?: Record<string, unknown>;
  works: SchemaAckWorkOutput[];
}

export const schemaAck: CwrJsonSchema<SchemaAckOutput> = {
  id: 'ack-acknowledgement',
  label: 'ACK Acknowledgement',
  description: 'Schema A-like response extended with society warning messages and an acknowledgement identifier per work.',
  version: '1.0.0',
  jsonSchema: {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://example.org/cwr-json/ack-acknowledgement.json',
    title: 'ACK Acknowledgement Schema',
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
                schemaDescription: { type: 'string' },
                messages: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string' },
                      value: { type: 'string' }
                    }
                  }
                }
              }
            },
            titles: { type: 'array' },
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
            flags: { type: 'object' },
            parties: { type: 'object' },
            recordings: { type: 'array' }
          }
        }
      }
    },
    required: ['works']
  },
  convert(parsed: ParsedCwrFile): SchemaAckOutput {
    const output: SchemaAckOutput = {
      header: parsed.header as Record<string, unknown>,
      works: []
    };

    for (const work of parsed.works) {
      const rawMessages = Array.isArray(work.messages?.msgs)
        ? work.messages.msgs
        : [];
      const envelopeMessages: SchemaAckMessage[] = rawMessages.length
        ? rawMessages.map((w: any) => ({
            type: w.status || w.type || 'status',
            value: w.message || w.value || 'Accepted as is'
          }))
        : [
            {
              type: 'status',
              value: 'Accepted as is'
            }
          ];
      const identifiers: SchemaAckIdentifier[] = Array.isArray(work.identifiers) ? [...work.identifiers] : [];
      identifiers.push({
        source: '035',
        value: '3987389-001'
      });

      output.works.push({
        messages: {
          ...work.messages,
          schema: this.label,
          schemaDescription: this.description,
          ackMessages: envelopeMessages
        },
        flags: work.flags,
        titles: work.titles,
        identifiers,
        parties: work.parties,
        recordings: work.recordings
      });
    }

    return output;
  }
};


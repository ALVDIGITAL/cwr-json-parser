"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemaA = void 0;
exports.schemaA = {
    id: 'cwr-json-schema-a',
    label: 'CWR-JSON / Schema A (Principles Draft)',
    description: 'Complete canonical representation with both ownership and collection data. This schema preserves all CWR semantics including hierarchical ownership chains and territorial collection splits.',
    version: '0.1.0',
    jsonSchema: {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        $id: 'https://example.org/cwr-json/schema-a.json',
        title: 'CWR-JSON Schema A',
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
                                type: 'object',
                                properties: {
                                    source: { type: 'string' }, // e.g., iswc, submitterWorkNumber, proprietary
                                    value: { type: 'string' }
                                },
                                required: ['source', 'value']
                            }
                        },
                        messages: { type: 'object' },
                        flags: { type: 'object' },
                        parties: { type: 'object' },
                        recordings: { type: 'array' },
                        participants: { type: 'array' }
                    },
                    required: []
                }
            }
        },
        required: ['works']
    },
    convert(parsed) {
        const output = {
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
//# sourceMappingURL=schemaA.js.map
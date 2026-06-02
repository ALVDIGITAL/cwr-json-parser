"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemaAck = void 0;
exports.schemaAck = {
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
    convert(parsed) {
        const output = {
            header: parsed.header,
            works: []
        };
        for (const work of parsed.works) {
            const rawMessages = Array.isArray(work.messages?.msgs)
                ? work.messages.msgs
                : [];
            const envelopeMessages = rawMessages.length
                ? rawMessages.map((w) => ({
                    type: w.status || w.type || 'status',
                    value: w.message || w.value || 'Accepted as is'
                }))
                : [
                    {
                        type: 'status',
                        value: 'Accepted as is'
                    }
                ];
            const identifiers = Array.isArray(work.identifiers) ? [...work.identifiers] : [];
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
//# sourceMappingURL=schemaAck.js.map
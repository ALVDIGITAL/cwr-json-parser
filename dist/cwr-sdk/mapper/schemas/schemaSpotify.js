"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemaSpotify = void 0;
exports.schemaSpotify = {
    id: 'spotify-publishing',
    label: 'Spotify for Publishing',
    description: 'MANU view for Spotify: interested parties only, no publishers, no subpublishers, and no share percentages.',
    version: '1.0.0',
    jsonSchema: {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        $id: 'https://example.org/cwr-json/spotify-publishing.json',
        title: 'Spotify Publishing Schema',
        type: 'object',
        properties: {
            header: { type: 'object' },
            works: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        envelope: { type: 'object' },
                        titles: { type: 'array' },
                        identifiers: { type: 'array' },
                        flags: { type: 'object' },
                        manu: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    role: { type: 'string' },
                                    name: { type: 'string' },
                                    ipi: { type: 'string' },
                                    partyId: { type: 'string' },
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
    convert(parsed) {
        const output = {
            header: parsed.header,
            works: []
        };
        for (const work of parsed.works) {
            const transformed = {
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
            const manuEntries = [];
            if (work.parties) {
                for (const writer of work.parties) {
                    const role = writer.role?.toUpperCase?.();
                    const isWriter = role === 'C' || role === 'A' || role === 'AR' || role === 'CA';
                    if (isWriter) {
                        const entry = {
                            role: writer.role,
                            name: writer.name,
                            ipi: writer.ipi,
                            partyId: writer.partyId
                        };
                        manuEntries.push(entry);
                    }
                }
            }
            if (manuEntries.length > 0) {
                transformed.manu = manuEntries;
            }
            output.works.push(transformed);
        }
        return output;
    }
};
//# sourceMappingURL=schemaSpotify.js.map
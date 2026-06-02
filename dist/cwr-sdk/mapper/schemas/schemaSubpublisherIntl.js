"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemaSubpublisherIntl = void 0;
exports.schemaSubpublisherIntl = {
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
//# sourceMappingURL=schemaSubpublisherIntl.js.map
import { IJSONSchema } from 'vs/base/common/jsonSchema';

export function SchemaMap(description: string, type: IJSONSchema | string): IJSONSchema {
	if (typeof type === 'string') {
		return {
			type: 'object',
			description,
			patternProperties: {
				'.{1,}': { type },
			},
		};
	} else {
		return {
			type: 'object',
			description,
			patternProperties: {
				'.{1,}': type,
			},
		};
	}
}

export function SchemaArray(description: string, type: IJSONSchema | string): IJSONSchema {
	if (typeof type === 'string') {
		return {
			type: 'array',
			description,
			items: {
				type,
			},
		};
	} else {
		return {
			type: 'array',
			description,
			items: type,
		};
	}
}

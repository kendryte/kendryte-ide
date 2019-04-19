import { IJSONSchema, IJSONSchemaMap } from 'vs/base/common/jsonSchema';
import { localize } from 'vs/nls';

export const FLASH_CONFIG_FILE_NAME = 'kendryte-package.json';

const flashSchemaId = 'vscode://schemas/flasher';

export interface IFlashManagerConfigJson {
	baseAddress: string;
	totalSize: number;
	downloadSections: IFlashSection[];
}

export type IFlashManagerConfigJsonReadonly = Readonly<{
	baseAddress: string;
	totalSize: number;
	downloadSections: ReadonlyArray<IFlashSection>;
}>;

export interface IFlashSection {
	name: string;
	address: string;
	autoAddress: boolean;
	filename: string;
}

const downloadSectionProps: IJSONSchemaMap = {
	name: {
		type: 'string',
		description: 'Name of this file, can reference from C code',
		pattern: '^[a-zA-Z0-9_]+$',
		patternErrorMessage: 'Only allow to use: alphanumeric, _(underscore)',
	},
	address: {
		type: 'string',
		description: 'Address of flash to flash. (must use HEX)',
		pattern: '^(0[xX])?[0-9A-Fa-f]+$',
		patternErrorMessage: 'Only allow to use: alphanumeric, _(underscore)',
	},
	filename: {
		type: 'string',
		description: 'File path. (relative to this file)',
	},
	sha256: {
		type: 'boolean',
		default: false,
		description: 'Automatically calculate file\'s SHA-256 sum and write to flash.',
	},
};

const flashSchema: IJSONSchema = {
	id: flashSchemaId,
	allowComments: true,
	additionalProperties: false,
	type: 'object',
	title: localize('flashManagerSchema', 'Flash Manager'),
	default: { $schema: flashSchemaId },
	properties: {
		downloadSections: {
			type: 'array',
			items: {
				type: 'object',
				required: Object.keys(downloadSectionProps),
				properties: downloadSectionProps,
			},
		},
	},
};

export function registerFlashSchemas(register: (id: string, schema: IJSONSchema) => void) {
	register(flashSchemaId, flashSchema);
}

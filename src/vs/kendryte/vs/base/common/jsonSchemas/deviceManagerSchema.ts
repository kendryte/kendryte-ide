import { IJSONSchema } from 'vs/base/common/jsonSchema';
import { localize } from 'vs/nls';
import { cmakeSchemaId } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';

export const DefaultChipName = 'Kendryte K210';

export interface IFPIOAFuncPinMap {
	[pinFuncID: string]: /* ioPinNum */ string;
}

export interface IFPIOAMapData {
	selectedChip: string;
	funcPinMap: IFPIOAFuncPinMap;
}

export const fpioaSchemaId = 'vscode://schemas/fpioa';

export const fpioaSchema: IJSONSchema = {
	id: cmakeSchemaId,
	allowComments: true,
	additionalProperties: false,
	type: 'object',
	title: localize('fpioa', 'FPIOA'),
	required: ['selectedChip', 'funcPinMap'],
	default: { selectedChip: DefaultChipName, funcPinMap: {} },
	properties: {
		selectedChip: {
			type: 'string',
			enum: [DefaultChipName],
		},
		funcPinMap: {
			additionalProperties: {
				type: 'string',
			},
		},
	},
};


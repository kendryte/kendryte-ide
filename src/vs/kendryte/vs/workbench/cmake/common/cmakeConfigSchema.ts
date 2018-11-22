import { IJSONSchema } from 'vs/base/common/jsonSchema';
import { launchSchemaId } from 'vs/workbench/services/configuration/common/configuration';
import { localize } from 'vs/nls';

export const CMAKE_CONFIG_FILE_NAME = 'kendryte-package.json';
export const CMAKE_LIBRARY_FOLDER_NAME = 'kendryte_libraries';
export const cmakeSchemaId = 'vscode://schemas/CMakeLists';

export interface ICompileOptions {
	type: 'library' | 'executable';
	name: string;
	version: string;
	dependency: { [id: string]: string };
	properties: { [id: string]: string };
	include: string[];
	source: string[];
	extraList: string;
	c_flags: string[];
	cpp_flags: string[];
	c_cpp_flags: string[];
	link_flags: string[];
	ld_file: string;
	entry?: string;
}

export const cmakeSchema: IJSONSchema = {
	id: launchSchemaId,
	type: 'object',
	title: localize('cmake', 'CMake'),
	required: ['name', 'version', 'source', 'type'],
	default: { name: '', version: '1.0.0', dependency: {}, include: [], source: [] },
	properties: {
		name: {
			type: 'string',
			description: 'Name of this project',
			default: '',
		},
		version: {
			type: 'string',
			description: 'Version',
			default: '1.0.0',
		},
		type: {
			type: 'string',
			enum: ['executable', 'library'],
			default: 'executable',
		},
		dependency: {
			type: 'object',
			description: 'A memo of dependencies',
			patternProperties: {
				'.{1,}': { type: 'string' },
			},
		},
		properties: {
			type: 'object',
			description: 'cmake project properties',
			patternProperties: {
				'.{1,}': { type: 'string' },
			},
		},
		source: {
			type: 'array',
			description: 'Source file to compile, can use "*"',
			items: {
				type: 'string',
			},
			default: ['src/*.c', 'src/*.cpp', 'src/*.h'],
		},
		include: {
			type: 'array',
			description: 'Include dirs',
			items: {
				type: 'string',
			},
		},
		extraList: {
			type: 'string',
			description: 'Source file to include',
		},
		c_flags: {
			type: 'array',
			description: 'C compile flags',
			items: {
				type: 'string',
			},
		},
		cpp_flags: {
			type: 'array',
			description: 'C++ compile flags',
			items: {
				type: 'string',
			},
		},
		c_cpp_flags: {
			type: 'array',
			description: 'C And C++ compile flags',
			items: {
				type: 'string',
			},
		},
		link_flags: {
			type: 'array',
			description: 'Linker flags',
			items: {
				type: 'string',
			},
		},
		ld_file: {
			type: 'string',
			default: '',
		},
	},
};

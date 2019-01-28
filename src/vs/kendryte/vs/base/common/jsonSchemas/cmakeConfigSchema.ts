import { IJSONSchema, IJSONSchemaMap } from 'vs/base/common/jsonSchema';
import { localize } from 'vs/nls';
import { SchemaArray, SchemaMap } from 'vs/kendryte/vs/base/common/jsonSchemaHelper/commonTypes';

export const CMAKE_CONFIG_FILE_NAME = 'kendryte-package.json';
export const CMAKE_LIBRARY_FOLDER_NAME = 'kendryte_libraries';
export const CMAKE_LIST_GENERATED_WARNING = '# [NEVER REMOVE THIS LINE] WARNING: this file is generated, please edit ' + CMAKE_CONFIG_FILE_NAME + ' file instead.';

const cmakeSchemaId = 'vscode://schemas/CMakeLists';
const cmakeSchemaIdExe = cmakeSchemaId + '/exe';
const cmakeSchemaIdLib = cmakeSchemaId + '/lib';

export type ICompileInfo = ILibraryProject | IExecutableProject;

export interface ICommonProject {
	name: string;
	version: string;
	homepage?: string;
	dependency: { [id: string]: string };
	properties: { [id: string]: string };
	header: string[];
	source: string[];
	extraList: string;
	c_flags: string[];
	cpp_flags: string[];
	c_cpp_flags: string[];
	link_flags: string[];
	ld_file: string;
	definitions: { [id: string]: string | number }
	entry: string;
}

export enum CMakeProjectTypes {
	executable = 'executable',
	library = 'library',
	example = 'example',
}

export interface ILibraryProject extends ICommonProject {
	type: CMakeProjectTypes.library;
	include: string[];
	exampleSource: string[];
}

export interface IExecutableProject extends ICommonProject {
	type: CMakeProjectTypes.executable;
}

const exeType: IJSONSchemaMap = {
	type: {
		type: 'string',
		enum: [CMakeProjectTypes.executable],
		default: CMakeProjectTypes.executable,
	},
};

const libType: IJSONSchemaMap = {
	type: {
		type: 'string',
		enum: [CMakeProjectTypes.library],
		default: CMakeProjectTypes.library,
	},
	include: {
		...SchemaArray('List of include dir path, will expose to user, relative to current json file.', 'string'),
		default: ['include'],
	},
	exampleSource: {
		...SchemaArray('Source file to compile, can use "*" to match file.', 'string'),
		default: ['example/*.c', 'example/*.cpp', 'example/*.h'],
	},
};

const baseSchemaProps: IJSONSchemaMap = {
	$schema: {
		type: 'string',
		enum: ['vscode://schemas/CMakeLists'],
	},
	name: {
		type: 'string',
		description: 'Name of this project, must not conflict with other library, eg: com.my-name.new_library',
		pattern: '^[a-zA-Z0-9-_.]+$',
		patternErrorMessage: 'Only allow to use: alphanumeric, -(hyphen), _(underscore), .(dot)',
		default: '',
	},
	version: {
		type: 'string',
		description: 'Version',
		default: '1.0.0',
	},
	dependency: SchemaMap('A memo of dependencies, id => url_or_version', 'string'),
	properties: SchemaMap('cmake project properties', 'string'),
	source: {
		...SchemaArray('Source file to compile, can use "*" to match file.', 'string'),
		default: ['src/*.c', 'src/*.cpp', 'src/*.h'],
	},
	header: {
		...SchemaArray('List of header files dir path, relative to current json file.', 'string'),
		default: [],
	},
	extraList: {
		type: 'string',
		description: 'Extra cmake file write into CMakeLists.txt',
	},
	c_flags: SchemaArray('C compile flags', 'string'),
	cpp_flags: SchemaArray('C++ compile flags', 'string'),
	c_cpp_flags: SchemaArray('Both C/C++ compile flags', 'string'),
	link_flags: SchemaArray('Linker flags', 'string'),
	ld_file: {
		type: 'string',
		description: 'Additional LD file to use',
		default: '',
	},
	definitions: SchemaMap('Constant define map', ['string', 'number']),
	entry: {
		type: 'string',
		default: 'src/main.c',
	},
};

const executableSchema: IJSONSchema = {
	id: cmakeSchemaIdExe,
	required: ['type'],
	additionalProperties: false,
	properties: {
		...baseSchemaProps,
		...exeType,
	},
};

const librarySchema: IJSONSchema = {
	id: cmakeSchemaIdLib,
	required: ['type'],
	additionalProperties: false,
	properties: {
		...baseSchemaProps,
		...libType,
	},
};

const cmakeSchema: IJSONSchema = {
	id: cmakeSchemaId,
	allowComments: true,
	additionalProperties: false,
	type: 'object',
	title: localize('cmake', 'CMake'),
	required: ['name', 'type', 'version', 'source'],
	default: { name: '', version: '1.0.0', type: CMakeProjectTypes.executable, dependency: {}, include: [], source: [] },
	properties: {
		...baseSchemaProps,
		...exeType,
		...libType,
		type: {
			type: 'string',
			enum: [CMakeProjectTypes.executable, CMakeProjectTypes.library],
			default: CMakeProjectTypes.executable,
		},
	},
	oneOf: [
		executableSchema,
		librarySchema,
	],
};

export function registerCMakeSchemas(register: (id: string, schema: IJSONSchema) => void) {
	register(cmakeSchemaId, cmakeSchema);
	register(cmakeSchemaIdExe, executableSchema);
	register(cmakeSchemaIdLib, librarySchema);
}

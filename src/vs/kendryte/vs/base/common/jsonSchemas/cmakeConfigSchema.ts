import { IJSONSchema, IJSONSchemaMap } from 'vs/base/common/jsonSchema';
import { localize } from 'vs/nls';
import { SchemaArray, SchemaMap } from 'vs/kendryte/vs/base/common/jsonSchemaHelper/commonTypes';
import {
	CMAKE_CONFIG_FILE_NAME as CMAKE_CONFIG_FILE_NAME_NEW,
	CMAKE_LIBRARY_FOLDER_NAME as CMAKE_LIBRARY_FOLDER_NAME_NEW,
} from 'vs/kendryte/vs/base/common/constants/wellknownFiles';
import { DONT_MODIFY_MARKER } from 'vs/kendryte/vs/base/common/messages';
import { DeepReadonly } from 'vs/kendryte/vs/base/common/type/deepReadonly';

/** @deprecated */
export const CMAKE_CONFIG_FILE_NAME = CMAKE_CONFIG_FILE_NAME_NEW;
/** @deprecated */
export const CMAKE_LIBRARY_FOLDER_NAME = CMAKE_LIBRARY_FOLDER_NAME_NEW;
export const CMAKE_LIST_GENERATED_WARNING = '# ' + DONT_MODIFY_MARKER;
export const CMAKE_LIST_GENERATED_WARNING_OLD = '# [NEVER REMOVE THIS LINE] WARNING: this file is generated, please edit ' + CMAKE_CONFIG_FILE_NAME + ' file instead.';

export const cmakeSchemaId = 'vscode://schemas/CMakeLists';
const cmakeSchemaIdExe = cmakeSchemaId + '/exe';
const cmakeSchemaIdLib = cmakeSchemaId + '/lib';
const cmakeSchemaIdDefinition = cmakeSchemaId + '/def';

export type ICompileInfo = ILibraryProject | IExecutableProject | IDefineProject | ICompileFolder;
export type ICompileInfoReadonly = DeepReadonly<ICompileInfo>;
export type ICompileInfoPossible = ILibraryProject & IExecutableProject & IDefineProject & ICompileFolder;
export type ICompileInfoPossibleKeys = keyof ICompileInfoPossible;

export interface ICompileFolder {
	name: string;
	type: CMakeProjectTypes.folder;
}

export interface ICommonProject {
	name: string;
	version: string;
	homepage?: string;
	dependency: { [id: string]: string };
	localDependency: string[];
	systemLibrary: string[];
	properties: { [id: string]: string };
	header: string[];
	source: string[];
	extraList: string;
	extraList2: string;
	c_flags: string[];
	cpp_flags: string[];
	c_cpp_flags: string[];
	link_flags: string[];
	ld_file: string;
	definitions: { [id: string]: string | number };
}

export enum CMakeProjectTypes {
	executable = 'executable',
	library = 'library',
	prebuiltLibrary = 'prebuiltLibrary', // virtual type
	folder = 'folder',
	define = 'define',
}

export interface IDefineProject extends Pick<ICommonProject, 'name' | 'version' | 'homepage' | 'definitions'> {
	type: CMakeProjectTypes.define;
	include: string[];
}

export interface ILibraryProject extends ICommonProject {
	type: CMakeProjectTypes.library;
	include: string[];
	prebuilt: string;
	linkArgumentPrefix: string[];
	linkArgumentSuffix: string[];
}

export interface IExecutableProject extends ICommonProject {
	type: CMakeProjectTypes.executable;
	entry: string;
}

const defineType: IJSONSchemaMap = {
	type: {
		type: 'string',
		enum: [CMakeProjectTypes.define],
		default: CMakeProjectTypes.define,
	},
};

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
	linkArgumentPrefix: {
		type: 'string',
		description: 'Prefix link argument',
	},
	linkArgumentSuffix: {
		type: 'string',
		description: 'Suffix link argument',
	},
};

const baseSchemaProps: IJSONSchemaMap = {
	$schema: {
		type: 'string',
		enum: ['vscode://schemas/CMakeLists'],
	},
	name: {
		type: 'string',
		description: 'Name of this project, must not conflict with other library, eg: my-name/new_library',
		pattern: '^[a-zA-Z0-9][a-zA-Z0-9_-]*(?:/[a-zA-Z0-9_-]+)?$',
		patternErrorMessage: 'Only allow to use: alphanumeric, -(hyphen), _(underscore), .(dot) and /(slash)',
		default: '',
	},
	version: {
		type: 'string',
		description: 'Version',
		default: '1.0.0',
	},
	homepage: {
		type: 'string',
	},
	dependency: SchemaMap('A memo of dependencies, id => url_or_version', 'string'),
	localDependency: SchemaArray('A list of local dependencies, one project each line.', 'string'),
	systemLibrary: SchemaArray('System dependency, like m or gcc.', 'string'),
	properties: SchemaMap('cmake project properties', 'string'),
	source: {
		...SchemaArray('Source file to compile, can use "*" to match file.', 'string'),
		default: ['src/*.c', 'src/*.cpp'],
	},
	header: {
		...SchemaArray('List of header files dir path, relative to current json file.', 'string'),
		default: [],
	},
	extraList: {
		type: 'string',
		description: 'Extra cmake file write into CMakeLists.txt',
	},
	extraList2: {
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
	definitions: SchemaMap('Preprocessor definitions map', ['string', 'number']),
	entry: {
		type: 'string',
		default: 'src/main.c',
	},
	output: {
		type: 'string',
		description: 'Compile output directory, defaults to "build", you should not edit this.',
		default: 'build',
	},
	prebuilt: {
		type: 'string',
		description: 'Set prebuilt file for imported library.',
		default: [],
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

const cmakeDefineSchema: IJSONSchema = {
	id: cmakeSchemaIdDefinition,
	required: ['type'],
	additionalProperties: false,
	properties: {
		...(() => {
			const { name, version, homepage, definitions } = baseSchemaProps;
			return { name, version, homepage, definitions };
		})(),
		...defineType,
	},
};
const cmakeSchema: IJSONSchema = {
	id: cmakeSchemaId,
	allowComments: true,
	additionalProperties: false,
	type: 'object',
	title: localize('cmake', 'CMake'),
	required: ['name', 'type', 'version'],
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
	register(cmakeSchemaIdDefinition, cmakeDefineSchema);
}

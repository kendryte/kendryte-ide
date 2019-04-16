import { CMAKE_LIBRARY_FOLDER_NAME } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';

export const alwaysIgnorePattern = [
	CMAKE_LIBRARY_FOLDER_NAME + '/**',
	'.*',
	'.*/**',
];
export const rootIgnorePattern = [
	'build/**',
	'config/**',
];

export const ignorePattern = [
	...rootIgnorePattern,
	...alwaysIgnorePattern,
];

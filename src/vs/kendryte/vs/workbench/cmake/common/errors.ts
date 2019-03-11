import { localize } from 'vs/nls';
import { CMAKE_CONFIG_FILE_NAME } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';

export enum CMakeErrorType {
	NO_WORKSPACE,
	PROJECT_NOT_EXISTS,
	LISTS_TXT_EXISTS,
}

function message(type: CMakeErrorType) {
	switch (type) {
		case CMakeErrorType.NO_WORKSPACE:
			return localize('kendryte.errors.cmake.folder.not.open', 'Open any project to start');
		case CMakeErrorType.PROJECT_NOT_EXISTS:
			return localize('kendryte.errors.cmake.project.not.exists', 'Create {0} to start a project', CMAKE_CONFIG_FILE_NAME);
		case CMakeErrorType.LISTS_TXT_EXISTS:
			return localize('kendryte.errors.cmake.lists.txt.exists', 'CMakeLists.txt will be override, please remove it first');
		default:
			throw new Error(`Unknown error type: ` + type);
	}
}

export class CMakeError extends Error {
	constructor(
		public readonly type: CMakeErrorType,
	) {
		super(message(type));
	}
}

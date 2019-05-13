import { localize } from 'vs/nls';

export const DONT_MODIFY_MARKER = localize('dontModifyMarker', 'DO NOT MODIFY THIS FILE, IT WILL BE OVERRIDE!!!');
export const ERROR_REQUIRE_FOLDER = localize('ErrorRequireFolder', 'You need to open a folder to do this.');
export const ERROR_REQUIRE_PROJECT = localize('ErrorRequireProject', 'You need to create or select a project to build.');

export function missingOrInvalidProject(path: string) {
	return localize('missingOrInvalidProject', 'Missing or invalid project: {0}', path);
}

import { escapeRegExpCharacters } from 'vs/base/common/strings';

const cwdStr = new RegExp(escapeRegExpCharacters(process.cwd()), 'g');

export function processErrorStack(e: Error) {
	return e.stack
		.replace(/^/mg, '\x1B[38;5;9m|\x1B[0m  ')
		.replace(/\/.+?file:/g, '')
		.replace(cwdStr, '.');
}
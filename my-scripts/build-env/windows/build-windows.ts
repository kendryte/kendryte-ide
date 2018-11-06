import { DuplexControl } from '@gongt/stillalive';
import { copy } from 'fs-extra';
import { resolve } from 'path';
import { pipeCommandOut } from '../childprocess/complex';
import { RELEASE_ROOT, VSCODE_ROOT } from '../misc/constants';
import { chdir } from '../misc/pathUtil';

export async function windowsBuild(output: DuplexControl) {
	chdir(VSCODE_ROOT);
	const result = resolve(RELEASE_ROOT, 'VSCode-win32-x64');

	await pipeCommandOut(output, 'gulp', 'vscode-win32-x64-min');
	await pipeCommandOut(output, 'gulp', 'vscode-win32-x64-copy-inno-updater');

	await copy('my-scripts/staff/skel/.', result);

	return result;
}

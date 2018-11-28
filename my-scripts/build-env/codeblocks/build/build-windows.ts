import { OutputStreamControl } from '@gongt/stillalive';
import { copy } from 'fs-extra';
import { resolve } from 'path';
import { pipeCommandOut } from '../../childprocess/complex';
import { RELEASE_ROOT } from '../../misc/constants';
import { gulpCommands } from '../gulp';

export async function windowsBuild(output: OutputStreamControl) {
	await pipeCommandOut(output, 'node', ...gulpCommands(), 'vscode-win32-x64-min');
	await pipeCommandOut(output, 'node', ...gulpCommands(), 'vscode-win32-x64-copy-inno-updater');
	
	const compiledResult = resolve(RELEASE_ROOT, 'VSCode-win32-x64');
	await copy('my-scripts/staff/skel/.', compiledResult);
	
	return compiledResult;
}

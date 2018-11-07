import { OutputStreamControl } from '@gongt/stillalive';
import { copy } from 'fs-extra';
import { resolve } from 'path';
import { pipeCommandOut } from '../../childprocess/complex';
import { RELEASE_ROOT } from '../../misc/constants';
import { gulpCommands } from '../gulp';

export async function linuxBuild(output: OutputStreamControl) {
	await pipeCommandOut(output, ...gulpCommands(), 'vscode-linux-x64-min');

	const compiledResult = resolve(RELEASE_ROOT, 'VSCode-linux-x64');
	await copy('my-scripts/staff/skel/.', compiledResult);
	await copy('resources/linux/code.png', resolve(compiledResult, 'code.png'));

	return compiledResult;
}
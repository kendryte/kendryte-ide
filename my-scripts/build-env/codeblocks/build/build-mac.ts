import { OutputStreamControl } from '@gongt/stillalive';
import { copy } from 'fs-extra';
import { resolve } from 'path';
import { pipeCommandOut } from '../../childprocess/complex';
import { RELEASE_ROOT } from '../../misc/constants';
import { gulpCommands } from '../gulp';

export async function macBuild(output: OutputStreamControl) {
	await pipeCommandOut(output, ...gulpCommands(), 'vscode-darwin-x64-min');
	
	const compiledResult = resolve(RELEASE_ROOT, 'VSCode-darwin-x64');
	await copy('my-scripts/staff/skel/.', compiledResult);
	
	return compiledResult;
}
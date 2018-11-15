import { OutputStreamControl } from '@gongt/stillalive';
import { copy } from 'fs-extra';
import { resolve } from 'path';
import { pipeCommandOut } from '../../childprocess/complex';
import { RELEASE_ROOT } from '../../misc/constants';
import { getProductData } from '../../misc/fsUtil';
import { gulpCommands } from '../gulp';

export async function macBuild(output: OutputStreamControl) {
	await pipeCommandOut(output, 'node', ...gulpCommands(), 'vscode-darwin-min');
	
	const appDirName = getProductData().nameLong;
	const compiledResult = resolve(RELEASE_ROOT, 'VSCode-darwin', appDirName + '.app');
	await copy('my-scripts/staff/skel/.', compiledResult);
	
	return compiledResult;
}
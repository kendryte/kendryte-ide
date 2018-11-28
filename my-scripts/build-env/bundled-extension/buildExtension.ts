import { basename, resolve } from 'path';
import { pipeCommandOut } from '../childprocess/complex';
import { listExtension } from './list';

export async function buildExtension(output: NodeJS.WritableStream, sourceRoot: string, targetRoot: string, watch: boolean) {
	targetRoot = resolve(targetRoot, 'data/extensions');
	sourceRoot = resolve(sourceRoot, 'extensions.kendryte');
	
	output.write('build extensions: \n');
	output.write('  From: ' + sourceRoot + '\n');
	output.write('    To: ' + targetRoot + '\n');
	output.write(' Watch: ' + (watch? 'True' : 'False') + '\n');
	
	const tscBin = resolve(sourceRoot, 'node_modules/typescript/lib/tsc.js');
	
	const commands: string[][] = [];
	for (const extName of await listExtension()) {
		const path = resolve(sourceRoot, extName);
		const targetDir = resolve(targetRoot, basename(path));
		const tsconfigFile = resolve(path, 'tsconfig.json');
		
		const args = [tscBin, '-p', tsconfigFile, '--outDir', targetDir];
		if (watch) {
			args.push('-w');
		}
		commands.push(args);
	}
	
	await Promise.race(commands.map(async (args) => {
		return pipeCommandOut(output, 'node', ...args);
	}));
}

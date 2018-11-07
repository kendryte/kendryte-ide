import { createWriteStream, existsSync, unlinkSync } from 'fs';
import { resolve } from 'path';
import { PassThrough } from 'stream';
import { chdir } from '../misc/pathUtil';
import { pipeCommandOut } from './complex';
import WritableStream = NodeJS.WritableStream;

export async function installDependency(output: WritableStream, dir?: string, logToFile = true): Promise<void> {
	if (dir && process.cwd() !== dir) {
		chdir(dir);
	}
	
	let realOutput: NodeJS.WritableStream;
	if (logToFile) {
		const tee = new PassThrough();
		tee.pipe(output, {end: false});
		tee.pipe(createWriteStream('yarn-install.log'));
		realOutput = tee;
	} else {
		realOutput = output;
	}
	
	if (existsSync('yarn-error.log')) {
		unlinkSync('yarn-error.log');
	}
	realOutput.write(`Pwd: ${process.cwd()}\nCommand: yarn install --verbose\n`);
	await pipeCommandOut(realOutput, 'yarn', 'install', '--verbose');
	if (existsSync('yarn-error.log')) {
		output.write('Failed: yarn install failed, see yarn-error.log\n\n');
		throw new Error(`yarn install failed, please see ${resolve(process.cwd(), 'yarn-error.log')}`);
	}
}

import { OutputStreamControl } from '@gongt/stillalive';
import { createWriteStream, existsSync, unlinkSync } from 'fs';
import { resolve } from 'path';
import { PassThrough } from 'stream';
import { chdir } from '../misc/pathUtil';
import { pipeCommandOut } from './complex';

export async function installDependency(output: OutputStreamControl, dir?: string): Promise<void> {
	if (dir && process.cwd() !== dir) {
		chdir(dir);
	}
	
	const tee = new PassThrough();
	tee.pipe(output.screen, {end: false});
	tee.pipe(createWriteStream('yarn-install.log'));
	
	if (existsSync('yarn-error.log')) {
		unlinkSync('yarn-error.log');
	}
	output.writeln(`Pwd: ${process.cwd()}\nCommand: yarn install --verbose\nLogfile: ${resolve(process.cwd(), 'yarn-install.log')}`);
	await pipeCommandOut(tee, 'yarn', 'install', '--verbose');
	if (existsSync('yarn-error.log')) {
		output.fail('yarn-error.log is exists!');
		output.writeln('Failed: yarn install failed, see yarn-install.log And yarn-error.log\n');
		throw new Error(`yarn install failed, please see ${resolve(process.cwd(), 'yarn-error.log')}`);
	}
}

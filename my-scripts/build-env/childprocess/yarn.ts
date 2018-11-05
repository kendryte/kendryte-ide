import { createWriteStream, existsSync, unlinkSync } from 'fs';
import { PassThrough, Writable } from 'stream';
import { chdir } from '../misc/pathUtil';
import { pipeCommandOut } from './complex';

export async function installDependency(output: Writable, dir?: string): Promise<void> {
	if (dir) {
		chdir(dir);
	}
	
	const tee = new PassThrough();
	tee.pipe(output, {end: false});
	tee.pipe(createWriteStream('yarn-install.log'));
	
	if (existsSync('yarn-error.log')) {
		unlinkSync('yarn-error.log');
	}
	tee.write(`Pwd: ${process.cwd()}\nCommand: yarn install --verbose\n`);
	await pipeCommandOut(tee, 'yarn', 'install', '--verbose');
}

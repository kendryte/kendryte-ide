import { createWriteStream, existsSync, unlinkSync } from 'fs';
import { PassThrough } from 'stream';
import { chdir } from '../misc/pathUtil';
import { pipeCommandOut } from './complex';
import WritableStream = NodeJS.WritableStream;

export async function installDependency(output: WritableStream, dir?: string): Promise<void> {
	if (dir && process.cwd() !== dir) {
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

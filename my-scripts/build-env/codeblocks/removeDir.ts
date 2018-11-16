import { rmdir as rmdirAsync, unlink as unlinkAsync } from 'fs';
import * as rimraf from 'rimraf';
import { isWin } from '../misc/constants';
import { globalSuccessMessage } from '../misc/globalOutput';
import { timeout } from '../misc/timeUtil';

function wrapFs(of: Function, output: NodeJS.WritableStream): Function {
	if (output.hasOwnProperty('screen')) {
		output = (output as any).screen;
	}
	return ((...args) => {
		output.write(`${of.name}: ${args[0]}\n`);
		return of.apply(undefined, args);
	}) as any;
}

export function removeDirectory(path: string, output: NodeJS.WritableStream, verbose = true) {
	output.write(`removing directory: ${path}...\n`);
	
	if (process.cwd().indexOf(path) === 0) {
		output.write(`  Cwd: ${process.cwd()}\n`);
		return Promise.reject(new Error('No way to remove current directory.'));
	}
	
	let p = new Promise<void>((resolve, reject) => {
		const wrappedCallback = (err) => err? reject(err) : resolve();
		
		rimraf(path, {
			maxBusyTries: 20,
			emfileWait: true,
			disableGlob: true,
			unlink: wrapFs(unlinkAsync, output) as typeof unlinkAsync,
			rmdir: wrapFs(rmdirAsync, output) as typeof rmdirAsync,
		}, wrappedCallback);
	});
	
	p = p.then(() => {
		output.write(`remove complete. delay for OS.\n`);
	});
	
	if (isWin) {
		p = p.then(() => timeout(5000));
	} else {
		p = p.then(() => timeout(500));
	}
	
	p = p.then(() => {
		globalSuccessMessage(`remove directory finish.`);
	});
	
	return p;
}

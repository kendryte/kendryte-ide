import { OutputStreamControl } from '@gongt/stillalive';
import { chmod, mkdirp } from 'fs-extra';
import { join, resolve } from 'path';
import { Transform, TransformCallback } from 'stream';
import { pipeCommandBoth, pipeCommandOut } from '../childprocess/complex';
import { isWin, RELEASE_ROOT } from '../misc/constants';
import { calcCompileFolderName, removeIfExists } from '../misc/fsUtil';
import { chdir } from '../misc/pathUtil';
import { endArg } from '../misc/streamUtil';
import { nameReleaseFile } from './zip.name';

const _7z = isWin? require('7zip')['7z'] : '7z';

const commonArgs = [
	'a',
	'-y', // --yes
	'-r', // recurse subdirectories
	'-ssc', // sensitive case mode
	'-bso1', // standard output messages -> stdout
	'-bse1', // error messages -> stdout
	'-bsp2', // progress information -> stderr
];
if (!isWin) {
	commonArgs.push('-mmt3'); // use 3 threads
}
const zipLzma2Args = [
	...commonArgs,
	'-t7z', // compress to xxx.7z
	'-ms=on', // solid
	'-mx8', // more compress
	'-m0=lzma2', // use LZMA2
	'-md=256m', // dictionary size
	'-mfb=64', // word size
];
if (isWin) {
	zipLzma2Args.push('"-sfx7z.sfx"'); // self extraction
} else {
	zipLzma2Args.push('-sfx7zCon.sfx'); // self extraction
}

const zipDeflateArgs = [
	...commonArgs,
	'-tzip', // compress to xxx.zip
	'-mx6', // more compress
];

async function createPosixSfx(
	output: NodeJS.WritableStream,
	stderr: NodeJS.WritableStream,
	whatToZip: string,
	zipFileName: string,
	...zipArgs: string[]
) {
	output.write('creating posix 7z sfx bin...\n');
	zipFileName = resolve(releaseZipStorageFolder(), zipFileName);
	await pipeCommandBoth(output, stderr, _7z, ...zipLzma2Args, ...zipArgs, '--', zipFileName, join(whatToZip, '*'));
	await chmod(zipFileName, '777');
}

async function createWindowsSfx(
	output: NodeJS.WritableStream,
	stderr: NodeJS.WritableStream,
	whatToZip: string,
	zipFileName: string,
	...zipArgs: string[]
) {
	output.write('creating windows 7z sfx exe...\n');
	zipFileName = resolve(releaseZipStorageFolder(), zipFileName);
	await removeIfExists(zipFileName);
	return pipeCommandBoth(output, stderr, _7z, ...zipLzma2Args, ...zipArgs, '--', zipFileName, join(whatToZip, '*'));
}

async function createWindowsZip(
	output: NodeJS.WritableStream,
	stderr: NodeJS.WritableStream,
	whatToZip: string,
	zipFileName: string,
	...zipArgs: string[]
) {
	output.write('creating windows zip simple...\n');
	zipFileName = resolve(releaseZipStorageFolder(), zipFileName);
	await removeIfExists(zipFileName);
	return pipeCommandBoth(output, stderr, _7z, ...zipDeflateArgs, ...zipArgs, '--', zipFileName, join(whatToZip, '*'));
}

async function createPosixZip(
	output: NodeJS.WritableStream,
	stderr: NodeJS.WritableStream,
	whatToZip: string,
	zipFileName: string,
	...zipArgs: string[]
) {
	output.write('creating posix zip simple...\n');
	zipFileName = resolve(releaseZipStorageFolder(), zipFileName);
	await removeIfExists(zipFileName);
	return pipeCommandBoth(output, stderr, _7z, ...zipDeflateArgs, ...zipArgs, '--', zipFileName, join(whatToZip, '*'));
}

export async function un7zip(output: NodeJS.WritableStream, from: string, to: string) {
	await mkdirp(to);
	chdir(to);
	return pipeCommandOut(output, _7z, 'x', '-y', '-r', from);
}

export function releaseZipStorageFolder() {
	return resolve(RELEASE_ROOT, 'release-files');
}

class TransformEncode extends Transform {
	public noEnd = true;
	
	_transform(chunk: Buffer, encoding: string, callback: TransformCallback): void {
		const str = chunk.toString('ascii');
		this.push(str, 'utf8');
		callback();
	}
}

class ProgressStream extends Transform {
	public noEnd = true;
	
	_transform(chunk: Buffer, encoding: string, callback: TransformCallback): void {
		const str = chunk.toString('ascii').replace(/[\x08\x0d]+/g, '\n').replace(/^ +| +$/g, '');
		this.push(str, 'utf8');
		callback();
	}
}

export async function creatingUniversalZip(output: OutputStreamControl, sourceDir: string, namer: (type: string) => string) {
	const stderr = new ProgressStream;
	stderr.pipe(output.screen, {end: false});
	
	if (isWin) {
		const convert = new TransformEncode;
		convert.pipe(output, endArg(output));
		
		await createWindowsSfx(convert, stderr, sourceDir, await namer('exe'));
		await createWindowsZip(convert, stderr, sourceDir, await namer('zip'));
		
		convert.end();
	} else {
		await createPosixSfx(output, stderr, sourceDir, await namer('7z.bin'));
		await createPosixZip(output, stderr, sourceDir, await namer('zip'));
	}
}

export async function creatingReleaseZip(output: OutputStreamControl) {
	const zipStoreDir = releaseZipStorageFolder();
	
	chdir(RELEASE_ROOT);
	
	return creatingUniversalZip(output, await calcCompileFolderName(), nameReleaseFile());
}
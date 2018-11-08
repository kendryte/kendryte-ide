import { chmod } from 'fs-extra';
import { resolve } from 'path';
import { Transform, TransformCallback } from 'stream';
import { pipeCommandOut } from '../childprocess/complex';
import { isWin, RELEASE_ROOT } from '../misc/constants';
import { calcCompileFolderName, getPackageData, getProductData } from '../misc/fsUtil';
import { chdir } from '../misc/pathUtil';
import { endArg } from '../misc/streamUtil';
import { cleanupZipFiles } from './build/common-step';

const _7z = isWin? require('7zip')['7z'] : '7z';

const commonArgs = [
	'a',
	'-y', // --yes
	'-r', // recurse subdirectories
	'-ssc', // sensitive case mode
];
if (!isWin) {
	commonArgs.push('-mmt3'); // use 3 threads
}
const normalArgs = [
	...commonArgs,
	'-t7z', // compress to xxx.7z
	'-ms=on', // solid
	'-mx8', // more compress
	'-m0=lzma2', // use LZMA2
	'-md=256m', // dictionary size
	'-mfb=64', // word size
];
if (isWin) {
	commonArgs.push('"-sfx7zCon.sfx"'); // self extraction
} else {
	commonArgs.push('-sfx7zCon.sfx'); // self extraction
}

const zipArgs = [
	...commonArgs,
	'-tzip', // compress to xxx.zip
	'-mx6', // more compress
];

export async function createPosixSfx(output: NodeJS.WritableStream, whatToZip: string) {
	const zipFileName = await distFilePath('7z.bin');
	await pipeCommandOut(output, _7z, ...normalArgs, '--', zipFileName, whatToZip + '/*');
	await chmod(zipFileName, '777');
}

export async function createWindowsSfx(output: NodeJS.WritableStream, whatToZip: string) {
	return pipeCommandOut(output, _7z, ...normalArgs, '--', await distFilePath('exe'), whatToZip + '/*');
}

export async function createWindowsZip(output: NodeJS.WritableStream, whatToZip: string) {
	return pipeCommandOut(output, _7z, ...zipArgs, '--', await distFilePath('zip'), whatToZip + '/*');
}

async function distFilePath(type: string): Promise<string> {
	const product = await getProductData();
	const packageJson = await getPackageData();
	
	const pv = ('' + packageJson.patchVersion).replace(/\./g, '');
	return `release-files/${product.applicationName}.v${packageJson.version}-${product.quality}.${pv}.${type}`;
}

export async function creatingZip(output: NodeJS.WritableStream) {
	const zipStoreDir = resolve(RELEASE_ROOT, 'release-files');
	
	chdir(RELEASE_ROOT);
	await cleanupZipFiles(output, zipStoreDir);
	
	const wantDirName = await calcCompileFolderName();
	
	output.write('creating zip...\n');
	if (isWin) {
		const convert = new class TransformEncode extends Transform {
			public noEnd = true;
			
			_transform(chunk: Buffer, encoding: string, callback: TransformCallback): void {
				const str = chunk.toString('ascii');
				this.push(str, 'utf8');
				callback();
			}
		};
		convert.pipe(output, endArg(output));
		
		await createWindowsSfx(convert, wantDirName);
		await createWindowsZip(convert, wantDirName);
		
		convert.end();
	} else {
		await createPosixSfx(output, wantDirName);
	}
}
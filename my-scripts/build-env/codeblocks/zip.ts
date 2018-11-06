import { DuplexControl } from '@gongt/stillalive';
import { chmod } from 'fs-extra';
import { pipeCommandOut } from '../childprocess/complex';
import { getPackageData, getProductData } from '../misc/fsUtil';

const _7z = require('7zip')['7z'];

const commonArgs = [
	'-y', // --yes
	'-r', // recurse subdirectories
	'-ssc', // sensitive case mode
	'-ms=on', // solid
];
const normalArgs = [
	...commonArgs,
	'-t7z', // compress to xxx.7z
	'-sfx7zCon.sfx', // self extraction
	'-mx8', // more compress
	'-m0=lzma2', // use LZMA2
	'-d=256m', // dictionary size
	'-mfb=64', // word size
];

const zipArgs = [
	...commonArgs,
	'-tzip', // compress to xxx.zip
	'-mx6', // more compress
];

export async function createPosixSfx(output: DuplexControl) {
	const [zip, dir] = await createArgList('7z.bin');
	await pipeCommandOut(output, _7z, ...normalArgs, '--', zip, dir);
	await chmod(zip, '777');
}

export async function createWindowsSfx(output: DuplexControl) {
	return pipeCommandOut(output, _7z, ...normalArgs, '--', ...await createArgList('exe'));
}

export async function createWindowsZip(output: DuplexControl) {
	return pipeCommandOut(output, _7z, ...zipArgs, '--', ...await createArgList('exe'));
}

async function createArgList(type: string): Promise<string[]> {
	const product = await getProductData();
	const packageJson = await getPackageData();

	const pv = ('' + packageJson.patchVersion).replace(/\./g, '');
	return [
		`${product.PRODUCT_NAME}.v${packageJson.version}-${product.quality}.${pv}.${type}`,
		product.PRODUCT_NAME,
	];
}
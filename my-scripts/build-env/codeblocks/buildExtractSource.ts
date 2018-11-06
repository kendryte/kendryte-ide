import { OutputStreamControl } from '@gongt/stillalive';
import { createHash } from 'crypto';
import { createWriteStream } from 'fs';
import { resolve } from 'path';
import { PassThrough } from 'stream';
import { extract } from 'tar-fs';
import { getOutputCommand, muteCommandOut, pipeCommandBoth, pipeCommandOut } from '../childprocess/complex';
import { ARCH_RELEASE_ROOT, RELEASE_ROOT, VSCODE_ROOT } from '../misc/constants';
import { isExists, removeDirectory, rename, writeFile } from '../misc/fsUtil';
import { chdir } from '../misc/pathUtil';
import { streamPromise } from '../misc/streamUtil';
import { timing } from '../misc/timeUtil';
import { compareHash, saveHash } from './statusHash';

export async function extractSourceCodeIfNeed(output: OutputStreamControl) {
	chdir(VSCODE_ROOT);
	const timeOut = timing();
	
	output.writeln('creating source code snapshot...\n');
	const hash = await createSourceSnapshot(output);
	output.success('   code hash: ' + hash).continue();
	
	if (await compareHash('source-code', hash, output)) {
		output.success('source code not changed.' + timeOut()).continue();
	} else {
		output.writeln('source code has changed, making new directory.\n');
		await recreateSourceCodes(output);
		await saveHash('source-code', hash, output);
		output.success('complete action on create source:' + timeOut()).continue();
	}
	
	const dummyGit = resolve(RELEASE_ROOT, '.git');
	if (!await isExists(dummyGit)) {
		chdir(RELEASE_ROOT);
		await pipeCommandOut(output, 'git', 'init', '.');
		await writeFile(dummyGit + 'ignore', '*');
		output.success('dummy git repo created.').continue();
	}
}

async function createSourceSnapshot(output: OutputStreamControl) {
	const hasher = createHash('md5');
	let md5 = '';
	hasher.on('data', (data: Buffer) => {
		md5 = data.toString('hex').toLowerCase();
	});
	
	const snapshotFile = resolve(RELEASE_ROOT, 'building-source-snapshot.tar');
	if (await isExists(snapshotFile)) {
		await rename(snapshotFile, resolve(RELEASE_ROOT, 'prev-snapshot.tar'));
	}
	
	const multiplex = new PassThrough();
	multiplex.pipe(createWriteStream(snapshotFile));
	multiplex.pipe(hasher);
	
	await writeSourceCodeStream(multiplex, output);
	await streamPromise(multiplex);
	await streamPromise(hasher);
	
	return md5;
}

async function recreateSourceCodes(output: OutputStreamControl) {
	const node_modules = resolve(ARCH_RELEASE_ROOT, 'node_modules');
	const temp_node_modules = resolve(RELEASE_ROOT, 'saved_node_modules');
	
	if (await isExists(ARCH_RELEASE_ROOT)) {
		output.writeln('old source code exists.');
		if (await isExists(node_modules)) {
			output.writeln('old node_modules exists, move it out.');
			await rename(node_modules, temp_node_modules);
		}
		output.writeln('remove old source code...');
		await removeDirectory(ARCH_RELEASE_ROOT, output).catch((e) => {
			output.fail(e.message);
			console.error('Did you opened any file in %s?', ARCH_RELEASE_ROOT);
			output.continue();
			throw e;
		});
		output.success('dist directory clean.').continue();
	} else {
		output.writeln('no old source code exists.');
	}
	
	output.writeln('writing source code:');
	const untar = extract(ARCH_RELEASE_ROOT);
	await writeSourceCodeStream(untar, output);
	output.success('source code directory created.').continue();
	
	if (await isExists(temp_node_modules)) {
		output.writeln('move old node_modules back...');
		await rename(temp_node_modules, node_modules);
	}
	
	const gypTemp = resolve(process.env.HOME, '.node-gyp');
	if (await isExists(gypTemp)) {
		output.writeln('remove node-gyp at HOME...');
		await removeDirectory(gypTemp, output);
	}
}

async function writeSourceCodeStream(writeTo: NodeJS.WritableStream, output: OutputStreamControl) {
	const version = await getCurrentVersion(output);
	
	output.writeln('processing source code tarball...');
	await pipeCommandBoth(writeTo, output, 'git', 'archive', '--format', 'tar', version);
}

let knownVersion: string;

async function getCurrentVersion(output: OutputStreamControl) {
	if (knownVersion) {
		return knownVersion;
	}
	output.writeln(`Checking git status.`);
	await muteCommandOut('git', 'add', '.');
	const result = await getOutputCommand('git', 'status');
	
	let currentVersion: string;
	if (result.indexOf('Changes to be committed') === -1) {
		currentVersion = 'HEAD';
	} else {
		currentVersion = await getOutputCommand('git', 'stash', 'create');
	}
	output.success(`Git Current Version: ${currentVersion}.`).continue();
	return knownVersion = currentVersion;
}

function gitGetLastCommit(output: OutputStreamControl) {
	output.writeln(`Get last commit.`);
	return getOutputCommand('git', 'rev-parse', '--verify', 'HEAD');
}

import { OutputStreamControl } from '@gongt/stillalive';
import { readFileSync, rename, writeFileSync } from 'fs';
import { copy, mkdir } from 'fs-extra';
import { resolve } from 'path';
import { pipeCommandOut } from '../childprocess/complex';
import { installDependency } from '../childprocess/yarn';
import { VSCODE_ROOT } from '../misc/constants';
import { isExists, writeFile } from '../misc/fsUtil';
import { resolveGitDir } from '../misc/git';
import { chdir, ensureChdir, yarnPackageDir } from '../misc/pathUtil';
import { timing } from '../misc/timeUtil';
import { gulpCommands } from './gulp';
import { removeDirectory } from './removeDir';

export async function packWindows(output: OutputStreamControl) {
	function log(s: string) {
		output.write(s + '\n');
	}
	
	const devDepsDir = yarnPackageDir('devDependencies');
	const prodDepsDir = yarnPackageDir('dependencies');
	
	chdir(VSCODE_ROOT);
	const root = process.cwd();
	log('  sourceRoot = ' + root);
	log('  packageRoot = ' + yarnPackageDir('.'));
	
	const gitDir = await resolveGitDir(resolve(root, '.git'));
	const originalPkg = require(resolve(root, 'package.json'));
	const originalLock = readFileSync(resolve(root, 'yarn.lock'));
	
	//// dependencies
	log('  create dependencies');
	ensureChdir(prodDepsDir);
	writeFileSync('package.json', JSON.stringify({
		license: originalPkg.license || 'MIT',
		dependencies: {
			...originalPkg.dependencies,
		},
	}));
	writeFileSync('yarn.lock', originalLock);
	
	const bothDependencies = ['applicationinsights', 'source-map-support'];
	bothDependencies.forEach((item) => {
		originalPkg.devDependencies[item] = originalPkg.dependencies[item];
	});
	
	/// dependencies - install
	const timeOutProd = timing();
	await installDependency(output, prodDepsDir);
	output.success('production dependencies installed.' + timeOutProd());
	
	//// devDependencies
	log('  create devDependencies');
	ensureChdir(devDepsDir);
	writeFileSync('package.json', JSON.stringify({
		license: originalPkg.license || 'MIT',
		dependencies: {
			...originalPkg.devDependencies,
		},
	}));
	writeFileSync('yarn.lock', originalLock);
	output.success('basic files write complete.');
	
	//// devDependencies - husky
	if (!await isExists('.git')) {
		await pipeCommandOut(output, 'git', 'init', '.');
		await writeFile('.gitignore', '*');
		output.success('dummy git repo created.');
	}
	const huskyHooks = resolve(devDepsDir, '.git', 'hooks');
	await removeDirectory(huskyHooks, output);
	await mkdir(huskyHooks);
	
	/// devDependencies - install
	const timeOutDev = timing();
	await installDependency(output, devDepsDir);
	output.success('development dependencies installed.' + timeOutDev());
	
	//// devDependencies - husky (ensure)
	await pipeCommandOut(output, 'node', 'node_modules/husky/bin/install.js');
	
	/// devDependencies - link to working tree
	const devDepsStore = resolve(devDepsDir, 'node_modules');
	log(`create link from ${devDepsStore} to ${root}`);
	const lnk = require('lnk');
	await lnk([devDepsStore], root);
	
	/// ASAR
	log('create ASAR package');
	chdir(root);
	const timeOutZip = timing();
	await pipeCommandOut(output, 'node', ...gulpCommands(), '--gulpfile', 'my-scripts/gulpfile/pack-win.js');
	output.success('ASAR created.' + timeOutProd());
	
	log('move ASAR package to source root');
	chdir(root);
	await new Promise((_resolve, reject) => {
		const wrappedCallback = (err) => err? reject(err) : _resolve();
		rename(
			resolve(prodDepsDir, 'node_modules.asar.unpacked'),
			resolve(root, 'node_modules.asar.unpacked'),
			wrappedCallback);
	});
	await new Promise((_resolve, reject) => {
		const wrappedCallback = (err) => err? reject(err) : _resolve();
		rename(
			resolve(prodDepsDir, 'node_modules.asar'),
			resolve(root, 'node_modules.asar'),
			wrappedCallback);
	});
	output.success('ASAR moved to root.');
	
	/// install child node_modules by default script
	log('run post-install script');
	chdir(root);
	await pipeCommandOut(output, 'yarn', 'run', 'postinstall');
	
	await copy(huskyHooks, resolve(gitDir, 'hooks'));
	
	output.success('Everything complete.');
}

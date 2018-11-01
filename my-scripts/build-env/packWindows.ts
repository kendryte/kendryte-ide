import { DuplexControl } from '@gongt/stillalive';
import { readFileSync, rename, writeFileSync } from 'fs';
import { resolve } from 'path';
import { chdir, pipeCommandOut } from './childCommands';
import { cdNewDir, yarnPackageDir } from './include';
import { installDependency } from './output';

export async function packWindows(output: DuplexControl) {
	function log(s: string) {
		output.write(s + '\n');
	}
	
	const devDepsDir = yarnPackageDir('devDependencies');
	const prodDepsDir = yarnPackageDir('dependencies');
	
	chdir(process.env.VSCODE_ROOT);
	const root = process.cwd();
	log('  sourceRoot = ' + root);
	log('  packageRoot = ' + yarnPackageDir('.'));
	
	const originalPkg = require(resolve(root, 'package.json'));
	const originalLock = readFileSync(resolve(root, 'yarn.lock'));
	
	//// dependencies
	log('  create dependencies');
	cdNewDir(prodDepsDir);
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
	
	//// devDependencies
	log('  create devDependencies');
	cdNewDir(devDepsDir);
	writeFileSync('package.json', JSON.stringify({
		license: originalPkg.license || 'MIT',
		dependencies: {
			...originalPkg.devDependencies,
		},
	}));
	writeFileSync('yarn.lock', originalLock);
	output.success('basic files write complete.').continue();
	
	/* start install */
	await installDependency(output, devDepsDir);
	output.success('development dependencies installed.').continue();
	
	const devDepsStore = resolve(devDepsDir, 'node_modules');
	log(`create link from ${devDepsStore} to ${root}`);
	const lnk = require('lnk');
	await lnk([devDepsStore], root);
	
	await installDependency(output, prodDepsDir);
	output.success('production dependencies installed.').continue();
	
	log('create ASAR package');
	chdir(root);
	await pipeCommandOut(output, process.argv0, resolve(devDepsStore, '.bin/gulp'), '--gulpfile', 'my-scripts/gulpfile/pack-win.js');
	output.success('ASAR created.').continue();
	
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
	output.success('ASAR moved to root.').continue();
	
	log('run post-install script');
	chdir(root);
	await pipeCommandOut(output, 'yarn', 'run', 'postinstall');
	
	output.success('Everything complete.').continue();
}

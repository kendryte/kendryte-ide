import { resolve } from 'path';
import { chmodSync, readFileSync, writeFileSync } from 'fs';
import { platform } from 'os';
import { cdNewDir, yarnPackageDir } from './include';

const root = resolve(__dirname, '../..');
console.log('  sourceRoot = ', root);
console.log('  packageRoot = ', yarnPackageDir('.'));

const yarnRc = `disturl "https://atom.io/download/electron"
target "2.0.7"
runtime "electron"
cache-folder ${JSON.stringify(process.env.YARN_CACHE_FOLDER)}
`;

const originalPkg = require(resolve(root, 'package.json'));
const originalLock = readFileSync(resolve(root, 'yarn.lock'));

//// dependencies
console.log('  create dependencies');
cdNewDir(yarnPackageDir('dependencies'));
writeFileSync('package.json', JSON.stringify({
	dependencies: {
		...originalPkg.dependencies,
	},
}));
writeFileSync('.yarnrc', yarnRc);
writeFileSync('yarn.lock', originalLock);

const bothDependencies = ['applicationinsights', 'source-map-support'];
bothDependencies.forEach((item) => {
	originalPkg.devDependencies[item] = originalPkg.dependencies[item];
});

//// devDependencies
console.log('  create devDependencies');
cdNewDir(yarnPackageDir('devDependencies'));
writeFileSync('package.json', JSON.stringify({
	dependencies: {
		...originalPkg.devDependencies,
	},
}));
writeFileSync('yarn.lock', originalLock);

///// base
console.log('  create .yarnrc');
process.chdir(yarnPackageDir('.'));
writeFileSync('.yarnrc', yarnRc);

const yarnExe = resolve(process.argv[0], '..', 'yarn');
const yarnCmd = `${JSON.stringify(yarnExe)} --use-yarnrc ${yarnPackageDir('.yarnrc')} --prefer-offline --cache-folder ${process.env.YARN_CACHE_FOLDER}`;
if (platform() === 'win32') {
	console.log('  create shim yarn.cmd');
	writeFileSync('yarn.cmd', `@echo off
${yarnCmd} %*`);
} else {
	console.log('  create shim yarn');
	writeFileSync('yarn', `exec ${yarnCmd} "$@"`);
	chmodSync('yarn', '0777');
}

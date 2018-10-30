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
		'lnk-cli': 'latest',
	},
}));
writeFileSync('yarn.lock', originalLock);

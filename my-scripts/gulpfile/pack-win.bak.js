const gulp = require('gulp');
const path = require('path');
const createAsar = require('../../build/lib/asar').createAsar;
const _ = require('underscore');
const deps = require('../../build/dependencies');
const filter = require('gulp-filter');
const vfs = require('vinyl-fs');

const codeRoot = path.resolve(process.env.ARG_CODE_ROOT);
const modulesRoot = path.resolve(process.env.ARG_MODULES);
console.log('modulesRoot=%s', modulesRoot);
console.log('codeRoot=%s', codeRoot);
process.chdir(modulesRoot);

const product = require(codeRoot + '/product.json');

const productionDependencies = deps.getProductionDependencies(modulesRoot);

const depsSrc = [
	..._.flatten(productionDependencies.map(d => path.relative(modulesRoot, d.path)).map(d => [`${d}/**`, `!${d}/**/{test,tests}/**`])),
	// @ts-ignore JSON checking: dependencies is optional
	..._.flatten(Object.keys(product.dependencies || {}).map(d => [`node_modules/${d}/**`, `!node_modules/${d}/**/{test,tests}/**`])),
];
gulp.task('default', () => {
	return gulp.src(depsSrc, {base: '.', dot: true})
	           .pipe(filter(['**', '!**/package-lock.json']))
	           .pipe(createAsar(path.join(codeRoot, 'node_modules'), [
		           '**/*.node',
		           '**/*.ts',
		           '**/vscode-ripgrep/bin/*',
		           '**/node-pty/build/Release/*',
	           ], 'node_modules.asar'))
	           .pipe(vfs.dest(codeRoot + '/aa'));
});
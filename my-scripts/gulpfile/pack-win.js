const gulp = require('gulp');
const path = require('path');
const createAsar = require('../../build/lib/asar').createAsar;
const product = require('../../product.json');
const _ = require('underscore');
const deps = require('../../build/dependencies');
const filter = require('gulp-filter');
const vfs = require('vinyl-fs');

const root = path.resolve(__dirname, '../..');
process.chdir(root);

const productionDependencies = deps.getProductionDependencies(root);

const depsSrc = [
	..._.flatten(productionDependencies.map(d => path.relative(root, d.path)).map(d => [`${d}/**`, `!${d}/**/{test,tests}/**`])),
	// @ts-ignore JSON checking: dependencies is optional
	..._.flatten(Object.keys(product.dependencies || {}).map(d => [`node_modules/${d}/**`, `!node_modules/${d}/**/{test,tests}/**`])),
];
gulp.task('default', () => {
	return gulp.src(depsSrc, {base: '.', dot: true})
	           .pipe(filter(['**', '!**/package-lock.json']))
	           .pipe(createAsar(path.join(root, 'node_modules'), [
		           '**/*.node',
		           '**/vscode-ripgrep/bin/*',
		           '**/node-pty/build/Release/*',
	           ], 'node_modules.asar'))
	           .pipe(vfs.dest(root + '/aa'));
});
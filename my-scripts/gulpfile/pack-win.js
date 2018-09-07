const gulp = require('gulp');
const path = require('path');
const util = require('util');
const createAsar = require('../../build/lib/asar').createAsar;
const product = require('../../product.json');
const _ = require('underscore');
const deps = require('../../build/dependencies');
const filter = require('gulp-filter');
const vfs = require('vinyl-fs');

console.log('chdir(%s)', process.env.ARG_MODULES);
process.chdir(process.env.ARG_MODULES);
const root = process.cwd();

const productionDependencies = deps.getProductionDependencies(root);
const l = parseInt(process.stdout.columns) || 100;
productionDependencies.forEach(({name, version, path}) => {
	const pp = util.format(' * %s@%s: ', name, version);
	if (l - pp.length >= path.length) {
		console.log(pp + path.slice(0, l - pp.length - 4) + '...');
	} else {
		console.log(pp + path);
	}
});

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
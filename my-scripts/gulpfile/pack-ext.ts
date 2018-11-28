const gulp = require('gulp');
const path = require('path');
const util = require('util');
const createAsar = require('../../build/lib/asar').createAsar;
const product = require('../../product.json');
const _ = require('underscore');
const deps = require('../../build/dependencies');
const filter = require('gulp-filter');
const vfs = require('vinyl-fs');

const root = process.env.PACK_TARGET;
console.log(`root=${root}`);
process.chdir(root);
const task = 'create-asar:' + path.basename(root);

const productionDependencies = deps.getProductionDependencies(root);
const depsSrc = [
	..._.flatten(productionDependencies.map(d => path.relative(root, d.path)).map(d => [`${d}/**`, `!${d}/**/{test,tests}/**`])),
	// @ts-ignore JSON checking: dependencies is optional
	..._.flatten(Object.keys(product.dependencies || {}).map(d => [`node_modules/${d}/**`, `!node_modules/${d}/**/{test,tests}/**`])),
];
gulp.task(task, () => {
	return gulp.src(depsSrc, {base: '.', dot: true})
	           .pipe(filter(['**', '!**/package-lock.json']))
	           .pipe(createAsar(path.join(root, 'node_modules'), [
		           '**/*.node',
		           '**/*.dll',
		           '**/*.exe',
		           '**/vscode-ripgrep/bin/*',
		           '**/node-pty/build/Release/*',
	           ], 'node_modules.asar'))
	           .pipe(vfs.dest(root + '/aa'));
});

gulp.task('default', [task]);
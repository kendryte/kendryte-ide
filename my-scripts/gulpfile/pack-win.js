"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const include_1 = require("../build-env/include");
const gulp = require('gulp');
const path = require('path');
const util = require('util');
const createAsar = require('../../build/lib/asar').createAsar;
const product = require('../../product.json');
const _ = require('underscore');
const deps = require('../../build/dependencies');
const filter = require('gulp-filter');
const vfs = require('vinyl-fs');
const modulesRoot = include_1.yarnPackageDir('dependencies');
console.log('chdir(%s)', modulesRoot);
process.chdir(modulesRoot);
const root = process.cwd();
const productionDependencies = deps.getProductionDependencies(root);
// const l = parseInt(process.stdout.columns) || 100;
// productionDependencies.forEach(({name, version, path}) => {
// 	const pp = util.format(' * %s@%s: ', name, version);
// 	if (l - pp.length >= path.length) {
// 		console.log(pp + path.slice(0, l - pp.length - 4) + '...');
// 	} else {
// 		console.log(pp + path);
// 	}
// });
const depsSrc = [
    ..._.flatten(productionDependencies.map(d => path.relative(root, d.path)).map(d => [`${d}/**`, `!${d}/**/{test,tests}/**`])),
    // @ts-ignore JSON checking: dependencies is optional
    ..._.flatten(Object.keys(product.dependencies || {}).map(d => [`node_modules/${d}/**`, `!node_modules/${d}/**/{test,tests}/**`])),
];
gulp.task('default', () => {
    return gulp.src(depsSrc, { base: '.', dot: true })
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFjay13aW4uanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImd1bHBmaWxlL3BhY2std2luLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsa0RBQXNEO0FBRXRELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLFVBQVUsQ0FBQztBQUM5RCxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUM5QyxNQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDaEMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFDakQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3RDLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUVoQyxNQUFNLFdBQVcsR0FBRyx3QkFBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ25ELE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQ3RDLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDM0IsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBRTNCLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BFLHFEQUFxRDtBQUNyRCw4REFBOEQ7QUFDOUQsd0RBQXdEO0FBQ3hELHVDQUF1QztBQUN2QyxnRUFBZ0U7QUFDaEUsWUFBWTtBQUNaLDRCQUE0QjtBQUM1QixLQUFLO0FBQ0wsTUFBTTtBQUVOLE1BQU0sT0FBTyxHQUFHO0lBQ2YsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO0lBQzVILHFEQUFxRDtJQUNyRCxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLGlCQUFpQixDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQztDQUNqSSxDQUFDO0FBQ0YsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFO0lBQ3pCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUMsQ0FBQztTQUNwQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLHVCQUF1QixDQUFDLENBQUMsQ0FBQztTQUM3QyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxFQUFFO1FBQ2pELFdBQVc7UUFDWCxVQUFVO1FBQ1YsVUFBVTtRQUNWLHlCQUF5QjtRQUN6Qiw2QkFBNkI7S0FDN0IsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1NBQ3ZCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQzFDLENBQUMsQ0FBQyxDQUFDIn0=
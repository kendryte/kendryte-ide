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
        '**/vscode-ripgrep/bin/*',
        '**/node-pty/build/Release/*',
    ], 'node_modules.asar'))
        .pipe(vfs.dest(root + '/aa'));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFjay13aW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwYWNrLXdpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGtEQUFzRDtBQUV0RCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QixNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxVQUFVLENBQUM7QUFDOUQsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFDOUMsTUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ2hDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0FBQ2pELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUN0QyxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFFaEMsTUFBTSxXQUFXLEdBQUcsd0JBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNuRCxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztBQUN0QyxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzNCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUUzQixNQUFNLHNCQUFzQixHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNwRSxxREFBcUQ7QUFDckQsOERBQThEO0FBQzlELHdEQUF3RDtBQUN4RCx1Q0FBdUM7QUFDdkMsZ0VBQWdFO0FBQ2hFLFlBQVk7QUFDWiw0QkFBNEI7QUFDNUIsS0FBSztBQUNMLE1BQU07QUFFTixNQUFNLE9BQU8sR0FBRztJQUNmLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQztJQUM1SCxxREFBcUQ7SUFDckQsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxpQkFBaUIsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7Q0FDakksQ0FBQztBQUNGLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRTtJQUN6QixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFDLENBQUM7U0FDcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7U0FDN0MsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsRUFBRTtRQUNqRCxXQUFXO1FBQ1gseUJBQXlCO1FBQ3pCLDZCQUE2QjtLQUM3QixFQUFFLG1CQUFtQixDQUFDLENBQUM7U0FDdkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDMUMsQ0FBQyxDQUFDLENBQUMifQ==
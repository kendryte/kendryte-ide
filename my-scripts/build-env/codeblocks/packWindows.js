"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const complex_1 = require("../childprocess/complex");
const yarn_1 = require("../childprocess/yarn");
const constants_1 = require("../misc/constants");
const fsUtil_1 = require("../misc/fsUtil");
const pathUtil_1 = require("../misc/pathUtil");
const timeUtil_1 = require("../misc/timeUtil");
async function reset_asar(output) {
    pathUtil_1.chdir(constants_1.VSCODE_ROOT);
    if (await fsUtil_1.isLinkSync('./node_modules')) {
        fs_1.unlinkSync('./node_modules');
    }
    if (await fsUtil_1.isExistsSync('./node_modules.asar')) {
        fs_1.unlinkSync('./node_modules.asar');
    }
    if (await fsUtil_1.isExistsSync('./node_modules.asar.unpacked')) {
        await fsUtil_1.removeDirectory('./node_modules.asar.unpacked', output);
    }
    output.success('cleanup ASAR files.').continue();
}
exports.reset_asar = reset_asar;
async function packWindows(output) {
    function log(s) {
        output.write(s + '\n');
    }
    const devDepsDir = pathUtil_1.yarnPackageDir('devDependencies');
    const prodDepsDir = pathUtil_1.yarnPackageDir('dependencies');
    pathUtil_1.chdir(constants_1.VSCODE_ROOT);
    const root = process.cwd();
    log('  sourceRoot = ' + root);
    log('  packageRoot = ' + pathUtil_1.yarnPackageDir('.'));
    const originalPkg = require(path_1.resolve(root, 'package.json'));
    const originalLock = fs_1.readFileSync(path_1.resolve(root, 'yarn.lock'));
    //// dependencies
    log('  create dependencies');
    pathUtil_1.ensureChdir(prodDepsDir);
    fs_1.writeFileSync('package.json', JSON.stringify({
        license: originalPkg.license || 'MIT',
        dependencies: {
            ...originalPkg.dependencies,
        },
    }));
    fs_1.writeFileSync('yarn.lock', originalLock);
    const bothDependencies = ['applicationinsights', 'source-map-support'];
    bothDependencies.forEach((item) => {
        originalPkg.devDependencies[item] = originalPkg.dependencies[item];
    });
    //// devDependencies
    log('  create devDependencies');
    pathUtil_1.ensureChdir(devDepsDir);
    fs_1.writeFileSync('package.json', JSON.stringify({
        license: originalPkg.license || 'MIT',
        dependencies: {
            ...originalPkg.devDependencies,
        },
    }));
    fs_1.writeFileSync('yarn.lock', originalLock);
    output.success('basic files write complete.').continue();
    /* start install */
    const timeOutDev = timeUtil_1.timing();
    await yarn_1.installDependency(output, devDepsDir);
    output.success('development dependencies installed.' + timeOutDev()).continue();
    const devDepsStore = path_1.resolve(devDepsDir, 'node_modules');
    log(`create link from ${devDepsStore} to ${root}`);
    const lnk = require('lnk');
    await lnk([devDepsStore], root);
    const timeOutProd = timeUtil_1.timing();
    await yarn_1.installDependency(output, prodDepsDir);
    output.success('production dependencies installed.' + timeOutProd()).continue();
    log('create ASAR package');
    pathUtil_1.chdir(root);
    const timeOutZip = timeUtil_1.timing();
    await complex_1.pipeCommandOut(output, process.argv0, path_1.resolve(devDepsStore, 'gulp/bin/gulp.js'), '--gulpfile', 'my-scripts/gulpfile/pack-win.js');
    output.success('ASAR created.' + timeOutProd()).continue();
    log('move ASAR package to source root');
    pathUtil_1.chdir(root);
    await new Promise((_resolve, reject) => {
        const wrappedCallback = (err) => err ? reject(err) : _resolve();
        fs_1.rename(path_1.resolve(prodDepsDir, 'node_modules.asar.unpacked'), path_1.resolve(root, 'node_modules.asar.unpacked'), wrappedCallback);
    });
    await new Promise((_resolve, reject) => {
        const wrappedCallback = (err) => err ? reject(err) : _resolve();
        fs_1.rename(path_1.resolve(prodDepsDir, 'node_modules.asar'), path_1.resolve(root, 'node_modules.asar'), wrappedCallback);
    });
    output.success('ASAR moved to root.').continue();
    log('run post-install script');
    pathUtil_1.chdir(root);
    await complex_1.pipeCommandOut(output, 'yarn', 'run', 'postinstall');
    output.success('Everything complete.').continue();
}
exports.packWindows = packWindows;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja1dpbmRvd3MuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImJ1aWxkLWVudi9jb2RlYmxvY2tzL3BhY2tXaW5kb3dzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsMkJBQXFFO0FBQ3JFLCtCQUErQjtBQUMvQixxREFBeUQ7QUFDekQsK0NBQXlEO0FBQ3pELGlEQUFnRDtBQUNoRCwyQ0FBMkU7QUFDM0UsK0NBQXNFO0FBQ3RFLCtDQUEwQztBQUVuQyxLQUFLLFVBQVUsVUFBVSxDQUFDLE1BQXFCO0lBQ3JELGdCQUFLLENBQUMsdUJBQVcsQ0FBQyxDQUFDO0lBQ25CLElBQUksTUFBTSxtQkFBVSxDQUFDLGdCQUFnQixDQUFDLEVBQUU7UUFDdkMsZUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUM7S0FDN0I7SUFDRCxJQUFJLE1BQU0scUJBQVksQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFO1FBQzlDLGVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0tBQ2xDO0lBQ0QsSUFBSSxNQUFNLHFCQUFZLENBQUMsOEJBQThCLENBQUMsRUFBRTtRQUN2RCxNQUFNLHdCQUFlLENBQUMsOEJBQThCLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDOUQ7SUFDRCxNQUFNLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDbEQsQ0FBQztBQVpELGdDQVlDO0FBRU0sS0FBSyxVQUFVLFdBQVcsQ0FBQyxNQUFxQjtJQUN0RCxTQUFTLEdBQUcsQ0FBQyxDQUFTO1FBQ3JCLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxNQUFNLFVBQVUsR0FBRyx5QkFBYyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDckQsTUFBTSxXQUFXLEdBQUcseUJBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUVuRCxnQkFBSyxDQUFDLHVCQUFXLENBQUMsQ0FBQztJQUNuQixNQUFNLElB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
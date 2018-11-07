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
const gulp_1 = require("./gulp");
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
    await complex_1.pipeCommandOut(output, 'node', ...gulp_1.gulpCommands(), '--gulpfile', 'my-scripts/gulpfile/pack-win.js');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja1dpbmRvd3MuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImJ1aWxkLWVudi9jb2RlYmxvY2tzL3BhY2tXaW5kb3dzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsMkJBQXFFO0FBQ3JFLCtCQUErQjtBQUMvQixxREFBeUQ7QUFDekQsK0NBQXlEO0FBQ3pELGlEQUFnRDtBQUNoRCwyQ0FBMkU7QUFDM0UsK0NBQXNFO0FBQ3RFLCtDQUEwQztBQUMxQyxpQ0FBc0M7QUFFL0IsS0FBSyxVQUFVLFVBQVUsQ0FBQyxNQUEyQjtJQUMzRCxnQkFBSyxDQUFDLHVCQUFXLENBQUMsQ0FBQztJQUNuQixJQUFJLE1BQU0sbUJBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO1FBQ3ZDLGVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0tBQzdCO0lBQ0QsSUFBSSxNQUFNLHFCQUFZLENBQUMscUJBQXFCLENBQUMsRUFBRTtRQUM5QyxlQUFVLENBQUMscUJBQXFCLENBQUMsQ0FBQztLQUNsQztJQUNELElBQUksTUFBTSxxQkFBWSxDQUFDLDhCQUE4QixDQUFDLEVBQUU7UUFDdkQsTUFBTSx3QkFBZSxDQUFDLDhCQUE4QixFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQzlEO0lBQ0QsTUFBTSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ2xELENBQUM7QUFaRCxnQ0FZQztBQUVNLEtBQUssVUFBVSxXQUFXLENBQUMsTUFBMkI7SUFDNUQsU0FBUyxHQUFHLENBQUMsQ0FBUztRQUNyQixNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBRUQsTUFBTSxVQUFVLEdBQUcseUJBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3JELE1BQU0sV0FBVyxHQUFHLHlCQUFjLENBQUMsY0FBYyxDQUFDLENBQUM7SUFFbkQsZ0JBQUssQ0FBQyx1QkFBVyxDQUFDLENBQUM7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
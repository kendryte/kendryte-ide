"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const complex_1 = require("../childprocess/complex");
const yarn_1 = require("../childprocess/yarn");
const constants_1 = require("../misc/constants");
const fsUtil_1 = require("../misc/fsUtil");
const pathUtil_1 = require("../misc/pathUtil");
const timeUtil_1 = require("../misc/timeUtil");
const gulp_1 = require("./gulp");
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
    /// dependencies - install
    const timeOutProd = timeUtil_1.timing();
    await yarn_1.installDependency(output, prodDepsDir);
    output.success('production dependencies installed.' + timeOutProd()).continue();
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
    //// devDependencies - husky
    if (!await fsUtil_1.isExists('.git')) {
        await complex_1.pipeCommandOut(output, 'git', 'init', '.');
        await fsUtil_1.writeFile('.gitignore', '*');
        output.success('dummy git repo created.').continue();
    }
    const huskyHooks = path_1.resolve(devDepsDir, '.git', 'hooks');
    await fsUtil_1.removeDirectory(huskyHooks, output);
    await fs_extra_1.mkdir(huskyHooks);
    /// devDependencies - install
    const timeOutDev = timeUtil_1.timing();
    await yarn_1.installDependency(output, devDepsDir);
    output.success('development dependencies installed.' + timeOutDev()).continue();
    //// devDependencies - husky (ensure)
    await complex_1.pipeCommandOut(output, 'node', 'node_modules/husky/bin/install.js');
    /// devDependencies - link to working tree
    const devDepsStore = path_1.resolve(devDepsDir, 'node_modules');
    log(`create link from ${devDepsStore} to ${root}`);
    const lnk = require('lnk');
    await lnk([devDepsStore], root);
    /// ASAR
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
    /// install child node_modules by default script
    log('run post-install script');
    pathUtil_1.chdir(root);
    await complex_1.pipeCommandOut(output, 'yarn', 'run', 'postinstall');
    await fs_extra_1.copy(huskyHooks, path_1.resolve(constants_1.VSCODE_ROOT, '.git', 'hooks'));
    output.success('Everything complete.').continue();
}
exports.packWindows = packWindows;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja1dpbmRvd3MuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImJ1aWxkLWVudi9jb2RlYmxvY2tzL3BhY2tXaW5kb3dzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsMkJBQXFFO0FBQ3JFLHVDQUFnRDtBQUNoRCwrQkFBK0I7QUFDL0IscURBQXlEO0FBQ3pELCtDQUF5RDtBQUN6RCxpREFBZ0Q7QUFDaEQsMkNBQWdHO0FBQ2hHLCtDQUFzRTtBQUN0RSwrQ0FBMEM7QUFDMUMsaUNBQXNDO0FBRS9CLEtBQUssVUFBVSxXQUFXLENBQUMsTUFBMkI7SUFDNUQsU0FBUyxHQUFHLENBQUMsQ0FBUztRQUNyQixNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBRUQsTUFBTSxVQUFVLEdBQUcseUJBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3JELE1BQU0sV0FBVyxHQUFHLHlCQUFjLENBQUMsY0FBYyxDQUFDLENBQUM7SUFFbkQsZ0JBQUssQ0FBQyx1QkFBVyxDQUFDLENBQUM7SUFDbkIsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQzNCLEdBQUcsQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUM5QixHQUFHLENBQUMsa0JBQWtCLEdBQUcseUJBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRTlDLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxjQUFPLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7SUFDM0QsTUFBTSxZQUFZLEdBQUcsaUJBQVksQ0FBQyxjQUFPLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7SUFFOUQsaUJBQWlCO0lBQ2pCLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBQzdCLHNCQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDekIsa0JBQWEsQ0FBQyxjQUFjLEVB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
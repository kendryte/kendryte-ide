"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const complex_1 = require("../childprocess/complex");
const yarn_1 = require("../childprocess/yarn");
const constants_1 = require("../misc/constants");
const fsUtil_1 = require("../misc/fsUtil");
const git_1 = require("../misc/git");
const pathUtil_1 = require("../misc/pathUtil");
const timeUtil_1 = require("../misc/timeUtil");
const gulp_1 = require("./gulp");
const removeDir_1 = require("./removeDir");
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
    const gitDir = await git_1.resolveGitDir(path_1.resolve(root, '.git'));
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
    output.success('production dependencies installed.' + timeOutProd());
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
    output.success('basic files write complete.');
    //// devDependencies - husky
    if (!await fsUtil_1.isExists('.git')) {
        await complex_1.pipeCommandOut(output, 'git', 'init', '.');
        await fsUtil_1.writeFile('.gitignore', '*');
        output.success('dummy git repo created.');
    }
    const huskyHooks = path_1.resolve(devDepsDir, '.git', 'hooks');
    await removeDir_1.removeDirectory(huskyHooks, output);
    await fs_extra_1.mkdir(huskyHooks);
    /// devDependencies - install
    const timeOutDev = timeUtil_1.timing();
    await yarn_1.installDependency(output, devDepsDir);
    output.success('development dependencies installed.' + timeOutDev());
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
    output.success('ASAR created.' + timeOutProd());
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
    output.success('ASAR moved to root.');
    /// install child node_modules by default script
    log('run post-install script');
    pathUtil_1.chdir(root);
    await complex_1.pipeCommandOut(output, 'yarn', 'run', 'postinstall');
    await fs_extra_1.copy(huskyHooks, path_1.resolve(gitDir, 'hooks'));
    output.success('Everything complete.');
}
exports.packWindows = packWindows;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja1dpbmRvd3MuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImJ1aWxkLWVudi9jb2RlYmxvY2tzL3BhY2tXaW5kb3dzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsMkJBQXlEO0FBQ3pELHVDQUF1QztBQUN2QywrQkFBK0I7QUFDL0IscURBQXlEO0FBQ3pELCtDQUF5RDtBQUN6RCxpREFBZ0Q7QUFDaEQsMkNBQXFEO0FBQ3JELHFDQUE0QztBQUM1QywrQ0FBc0U7QUFDdEUsK0NBQTBDO0FBQzFDLGlDQUFzQztBQUN0QywyQ0FBOEM7QUFFdkMsS0FBSyxVQUFVLFdBQVcsQ0FBQyxNQUEyQjtJQUM1RCxTQUFTLEdBQUcsQ0FBQyxDQUFTO1FBQ3JCLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxNQUFNLFVBQVUsR0FBRyx5QkFBYyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDckQsTUFBTSxXQUFXLEdBQUcseUJBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUVuRCxnQkFBSyxDQUFDLHVCQUFXLENBQUMsQ0FBQztJQUNuQixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDM0IsR0FBRyxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxDQUFDO0lBQzlCLEdBQUcsQ0FBQyxrQkFBa0IsR0FBRyx5QkFBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFFOUMsTUFBTSxNQUFNLEdBQUcsTUFBTSxtQkFBYSxDQUFDLGNBQU8sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUMxRCxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsY0FBTyxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDO0lBQzNELE1BQU0sWUFBWSxHQUFHLGlCQUFZLENBQUMsY0FBTyxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFD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
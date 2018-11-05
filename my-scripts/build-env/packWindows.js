"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const childCommands_1 = require("./childCommands");
const include_1 = require("./include");
const output_1 = require("./output");
async function packWindows(output) {
    function log(s) {
        output.write(s + '\n');
    }
    const devDepsDir = include_1.yarnPackageDir('devDependencies');
    const prodDepsDir = include_1.yarnPackageDir('dependencies');
    childCommands_1.chdir(process.env.VSCODE_ROOT);
    const root = process.cwd();
    log('  sourceRoot = ' + root);
    log('  packageRoot = ' + include_1.yarnPackageDir('.'));
    const originalPkg = require(path_1.resolve(root, 'package.json'));
    const originalLock = fs_1.readFileSync(path_1.resolve(root, 'yarn.lock'));
    //// dependencies
    log('  create dependencies');
    include_1.cdNewDir(prodDepsDir);
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
    include_1.cdNewDir(devDepsDir);
    fs_1.writeFileSync('package.json', JSON.stringify({
        license: originalPkg.license || 'MIT',
        dependencies: {
            ...originalPkg.devDependencies,
        },
    }));
    fs_1.writeFileSync('yarn.lock', originalLock);
    output.success('basic files write complete.').continue();
    /* start install */
    const timeOutDev = output_1.timing();
    await output_1.installDependency(output, devDepsDir);
    output.success('development dependencies installed.' + timeOutDev()).continue();
    const devDepsStore = path_1.resolve(devDepsDir, 'node_modules');
    log(`create link from ${devDepsStore} to ${root}`);
    const lnk = require('lnk');
    await lnk([devDepsStore], root);
    const timeOutProd = output_1.timing();
    await output_1.installDependency(output, prodDepsDir);
    output.success('production dependencies installed.' + timeOutProd()).continue();
    log('create ASAR package');
    childCommands_1.chdir(root);
    const timeOutZip = output_1.timing();
    await childCommands_1.pipeCommandOut(output, process.argv0, path_1.resolve(devDepsStore, 'gulp/bin/gulp.js'), '--gulpfile', 'my-scripts/gulpfile/pack-win.js');
    output.success('ASAR created.' + timeOutProd()).continue();
    log('move ASAR package to source root');
    childCommands_1.chdir(root);
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
    childCommands_1.chdir(root);
    await childCommands_1.pipeCommandOut(output, 'yarn', 'run', 'postinstall');
    output.success('Everything complete.').continue();
}
exports.packWindows = packWindows;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja1dpbmRvd3MuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImJ1aWxkLWVudi9wYWNrV2luZG93cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLDJCQUF5RDtBQUN6RCwrQkFBK0I7QUFDL0IsbURBQXdEO0FBQ3hELHVDQUFxRDtBQUNyRCxxQ0FBcUQ7QUFFOUMsS0FBSyxVQUFVLFdBQVcsQ0FBQyxNQUFxQjtJQUN0RCxTQUFTLEdBQUcsQ0FBQyxDQUFTO1FBQ3JCLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxNQUFNLFVBQVUsR0FBRyx3QkFBYyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDckQsTUFBTSxXQUFXLEdBQUcsd0JBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUVuRCxxQkFBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDL0IsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQzNCLEdBQUcsQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUM5QixHQUFHLENBQUMsa0JBQWtCLEdBQUcsd0JBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRTlDLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxjQUFPLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7SUFDM0QsTUFBTSxZQUFZLEdBQUcsaUJBQVksQ0FBQyxjQUFPLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7SUFFOUQsaUJBQWlCO0lBQ2pCLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBQzdCLGtCQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDdEIsa0JBQWEsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUM1QyxPQUFPLEVBQUUsV0FBVyxDQUFDLE9BQU8sSUFB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
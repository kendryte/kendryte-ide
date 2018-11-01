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
    await output_1.installDependency(output, devDepsDir);
    output.success('development dependencies installed.').continue();
    const devDepsStore = path_1.resolve(devDepsDir, 'node_modules');
    log(`create link from ${devDepsStore} to ${root}`);
    const lnk = require('lnk');
    await lnk([devDepsStore], root);
    await output_1.installDependency(output, prodDepsDir);
    output.success('production dependencies installed.').continue();
    log('create ASAR package');
    childCommands_1.chdir(root);
    await childCommands_1.pipeCommandOut(output, process.argv0, path_1.resolve(devDepsStore, '.bin/gulp'), '--gulpfile', 'my-scripts/gulpfile/pack-win.js');
    output.success('ASAR created.').continue();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja1dpbmRvd3MuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImJ1aWxkLWVudi9wYWNrV2luZG93cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLDJCQUF5RDtBQUN6RCwrQkFBK0I7QUFDL0IsbURBQXdEO0FBQ3hELHVDQUFxRDtBQUNyRCxxQ0FBNkM7QUFFdEMsS0FBSyxVQUFVLFdBQVcsQ0FBQyxNQUFxQjtJQUN0RCxTQUFTLEdBQUcsQ0FBQyxDQUFTO1FBQ3JCLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxNQUFNLFVBQVUsR0FBRyx3QkFBYyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDckQsTUFBTSxXQUFXLEdBQUcsd0JBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUVuRCxxQkFBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDL0IsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQzNCLEdBQUcsQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUM5QixHQUFHLENBQUMsa0JBQWtCLEdBQUcsd0JBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRTlDLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxjQUFPLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7SUFDM0QsTUFBTSxZQUFZLEdBQUcsaUJBQVksQ0FBQyxjQUFPLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7SUFFOUQsaUJBQWlCO0lBQ2pCLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBQzdCLGtCQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDdEIsa0JBQWEsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUM1QyxPQUFPLEVBQUUsV0FBVyxDQUFDLE9BQU8sSUFB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
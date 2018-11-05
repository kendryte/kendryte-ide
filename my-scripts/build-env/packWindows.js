"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const childCommands_1 = require("./childCommands");
const include_1 = require("./include");
const output_1 = require("./output");
async function reset_asar(output) {
    childCommands_1.chdir(process.env.VSCODE_ROOT);
    if (await include_1.isLink('./node_modules')) {
        fs_1.unlinkSync('./node_modules');
    }
    if (await include_1.isExists('./node_modules.asar')) {
        fs_1.unlinkSync('./node_modules.asar');
    }
    if (await include_1.isExists('./node_modules.asar.unpacked')) {
        await output_1.removeDirecotry('./node_modules.asar.unpacked', output);
    }
    output.success('cleanup ASAR files.').continue();
}
exports.reset_asar = reset_asar;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja1dpbmRvd3MuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImJ1aWxkLWVudi9wYWNrV2luZG93cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLDJCQUFxRTtBQUNyRSwrQkFBK0I7QUFDL0IsbURBQXdEO0FBQ3hELHVDQUF1RTtBQUN2RSxxQ0FBc0U7QUFFL0QsS0FBSyxVQUFVLFVBQVUsQ0FBQyxNQUFxQjtJQUNyRCxxQkFBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDL0IsSUFBSSxNQUFNLGdCQUFNLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtRQUNuQyxlQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztLQUM3QjtJQUNELElBQUksTUFBTSxrQkFBUSxDQUFDLHFCQUFxQixDQUFDLEVBQUU7UUFDMUMsZUFBVSxDQUFDLHFCQUFxQixDQUFDLENBQUM7S0FDbEM7SUFDRCxJQUFJLE1BQU0sa0JBQVEsQ0FBQyw4QkFBOEIsQ0FBQyxFQUFFO1FBQ25ELE1BQU0sd0JBQWUsQ0FBQyw4QkFBOEIsRUFBRSxNQUFNLENBQUMsQ0FBQztLQUM5RDtJQUNELE1BQU0sQ0FBQyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUNsRCxDQUFDO0FBWkQsZ0NBWUM7QUFFTSxLQUFLLFVBQVUsV0FBVyxDQUFDLE1BQXFCO0lBQ3RELFNBQVMsR0FBRyxDQUFDLENBQVM7UUFDckIsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUVELE1BQU0sVUFBVSxHQUFHLHdCQUFjLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUNyRCxNQUFNLFdBQVcsR0FBRyx3QkFBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBRW5ELHFCQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUMvQixNQUFNLElBQUksR0FBRyxPQUFP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
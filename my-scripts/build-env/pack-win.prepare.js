"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_1 = require("fs");
const os_1 = require("os");
const include_1 = require("./include");
const root = path_1.resolve(__dirname, '../..');
console.log('  sourceRoot = ', root);
console.log('  packageRoot = ', include_1.yarnPackageDir('.'));
const yarnRc = `disturl "https://atom.io/download/electron"
target "2.0.7"
runtime "electron"
cache-folder ${JSON.stringify(process.env.YARN_CACHE_FOLDER)}
`;
const originalPkg = require(path_1.resolve(root, 'package.json'));
const originalLock = fs_1.readFileSync(path_1.resolve(root, 'yarn.lock'));
//// dependencies
console.log('  create dependencies');
include_1.cdNewDir(include_1.yarnPackageDir('dependencies'));
fs_1.writeFileSync('package.json', JSON.stringify({
    dependencies: {
        ...originalPkg.dependencies,
    },
}));
fs_1.writeFileSync('.yarnrc', yarnRc);
fs_1.writeFileSync('yarn.lock', originalLock);
const bothDependencies = ['applicationinsights', 'source-map-support'];
bothDependencies.forEach((item) => {
    originalPkg.devDependencies[item] = originalPkg.dependencies[item];
});
//// devDependencies
console.log('  create devDependencies');
include_1.cdNewDir(include_1.yarnPackageDir('devDependencies'));
fs_1.writeFileSync('package.json', JSON.stringify({
    dependencies: {
        ...originalPkg.devDependencies,
        'lnk-cli': 'latest',
    },
}));
fs_1.writeFileSync('yarn.lock', originalLock);
///// base
console.log('  create .yarnrc');
process.chdir(include_1.yarnPackageDir('.'));
fs_1.writeFileSync('.yarnrc', yarnRc);
const yarnExe = path_1.resolve(process.argv[0], '..', 'yarn');
const yarnCmd = `${JSON.stringify(yarnExe)} --use-yarnrc ${include_1.yarnPackageDir('.yarnrc')} --prefer-offline --cache-folder ${process.env.YARN_CACHE_FOLDER}`;
if (os_1.platform() === 'win32') {
    console.log('  create shim yarn.cmd');
    fs_1.writeFileSync('yarn.cmd', `@echo off
${yarnCmd} %*`);
}
else {
    console.log('  create shim yarn');
    fs_1.writeFileSync('yarn', `exec ${yarnCmd} "$@"`);
    fs_1.chmodSync('yarn', '0777');
}
//# sourceMappingURL=pack-win.prepare.js.map
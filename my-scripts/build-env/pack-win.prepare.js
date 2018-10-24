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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFjay13aW4ucHJlcGFyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInBhY2std2luLnByZXBhcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQkFBK0I7QUFDL0IsMkJBQTREO0FBQzVELDJCQUE4QjtBQUM5Qix1Q0FBcUQ7QUFFckQsTUFBTSxJQUFJLEdBQUcsY0FBTyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUN6QyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsd0JBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBRXJELE1BQU0sTUFBTSxHQUFHOzs7ZUFHQSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUM7Q0FDM0QsQ0FBQztBQUVGLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxjQUFPLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7QUFDM0QsTUFBTSxZQUFZLEdBQUcsaUJBQVksQ0FBQyxjQUFPLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7QUFFOUQsaUJBQWlCO0FBQ2pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUNyQyxrQkFBUSxDQUFDLHdCQUFjLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztBQUN6QyxrQkFBYSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQzVDLFlBQVksRUFBRTtRQUNiLEdBQUcsV0FBVyxDQUFDLFlBQVk7S0FDM0I7Q0FDRCxDQUFDLENBQUMsQ0FBQztBQUNKLGtCQUFhLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ2pDLGtCQUFhLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBRXpDLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO0FBQ3ZFLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO0lBQ2pDLFdBQVcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNwRSxDQUFDLENBQUMsQ0FBQztBQUVILG9CQUFvQjtBQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFDeEMsa0JBQVEsQ0FBQyx3QkFBYyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztBQUM1QyxrQkFBYSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQzVDLFlBQVksRUFBRTtRQUNiLEdBQUcsV0FBVyxDQUFDLGVBQWU7S0FDOUI7Q0FDRCxDQUFDLENBQUMsQ0FBQztBQUNKLGtCQUFhLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBRXpDLFVBQVU7QUFDVixPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDaEMsT0FBTyxDQUFDLEtBQUssQ0FBQyx3QkFBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbkMsa0JBQWEsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFFakMsTUFBTSxPQUFPLEdBQUcsY0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3ZELE1BQU0sT0FBTyxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLHdCQUFjLENBQUMsU0FBUyxDQUFDLG9DQUFvQyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLENBQUM7QUFDeEosSUFBSSxhQUFRLEVBQUUsS0FBSyxPQUFPLEVBQUU7SUFDM0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0lBQ3RDLGtCQUFhLENBQUMsVUFBVSxFQUFFO0VBQ3pCLE9BQU8sS0FBSyxDQUFDLENBQUM7Q0FDZjtLQUFNO0lBQ04sT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQ2xDLGtCQUFhLENBQUMsTUFBTSxFQUFFLFFBQVEsT0FBTyxPQUFPLENBQUMsQ0FBQztJQUM5QyxjQUFTLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0NBQzFCIn0=
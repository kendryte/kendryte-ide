"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const complex_1 = require("../../childprocess/complex");
const yarn_1 = require("../../childprocess/yarn");
const constants_1 = require("../../misc/constants");
const fsUtil_1 = require("../../misc/fsUtil");
const pathUtil_1 = require("../../misc/pathUtil");
const timeUtil_1 = require("../../misc/timeUtil");
const getElectron_1 = require("../getElectron");
const gulp_1 = require("../gulp");
async function cleanupBuildResult(output, dir) {
    const backupDir = dir.replace(/(.app)$|$/, '.last$1');
    output.write(`build target is: ${dir}\n`);
    if (await fsUtil_1.isExists(dir)) {
        if (await fsUtil_1.isExists(backupDir)) {
            await fsUtil_1.removeDirectory(backupDir, output, false);
        }
        output.write(`remove last build result.\n`);
        await fsUtil_1.rename(dir, backupDir).catch((e) => {
            output.fail(`Cannot rename folder "${dir}", did you open any file in it?`).continue();
            throw e;
        });
    }
}
exports.cleanupBuildResult = cleanupBuildResult;
async function cleanupZipFiles(output, dir) {
    if (await fsUtil_1.isExists(dir)) {
        await fsUtil_1.removeDirectory(dir, output);
    }
    fsUtil_1.mkdirpSync(dir);
}
exports.cleanupZipFiles = cleanupZipFiles;
async function yarnInstall(output) {
    const timeInstall = timeUtil_1.timing();
    const integrityFile = path_1.resolve(constants_1.ARCH_RELEASE_ROOT, 'node_modules/.yarn-integrity');
    if (await fsUtil_1.isExists(integrityFile)) {
        await fsUtil_1.unlink(integrityFile);
    }
    await yarn_1.installDependency(output, constants_1.ARCH_RELEASE_ROOT, false);
    output.success('dependencies installed.' + timeInstall()).continue();
}
exports.yarnInstall = yarnInstall;
async function downloadElectron(output) {
    pathUtil_1.chdir(constants_1.ARCH_RELEASE_ROOT);
    output.write(`installing electron...\n`);
    getElectron_1.showElectronNoticeInChina();
    await complex_1.pipeCommandOut(output, 'node', ...gulp_1.gulpCommands(), 'electron-x64');
    output.success('electron installed.').continue();
}
exports.downloadElectron = downloadElectron;
async function downloadBuiltinExtensions(output) {
    pathUtil_1.chdir(constants_1.ARCH_RELEASE_ROOT);
    output.write(`installing builtin extension...\n`);
    await complex_1.pipeCommandOut(output, 'node', 'build/lib/builtInExtensions.js');
    output.success('builtin extension installed.').continue();
}
exports.downloadBuiltinExtensions = downloadBuiltinExtensions;
async function deleteCompileCaches(output) {
    pathUtil_1.chdir(process.env.TMP);
    for (const folder of await fs_extra_1.readdir(process.env.TMP)) {
        if (folder.startsWith('v8-compile-cache')) {
            await fsUtil_1.removeDirectory(path_1.resolve(process.env.TMP, folder), output);
        }
    }
    pathUtil_1.chdir(process.env.HOME);
    await fsUtil_1.removeDirectory(path_1.resolve(process.env.HOME, '.node-gyp'), output);
    for (const folder of await fs_extra_1.readdir(process.env.HOME)) {
        if (folder.startsWith('.v8flags')) {
            await fsUtil_1.removeDirectory(path_1.resolve(process.env.TMP, folder), output);
        }
    }
}
exports.deleteCompileCaches = deleteCompileCaches;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uLXN0ZXAuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImJ1aWxkLWVudi9jb2RlYmxvY2tzL2J1aWxkL2NvbW1vbi1zdGVwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsdUNBQW1DO0FBQ25DLCtCQUErQjtBQUMvQix3REFBNEQ7QUFDNUQsa0RBQTREO0FBQzVELG9EQUF5RDtBQUN6RCw4Q0FBMEY7QUFDMUYsa0RBQTRDO0FBQzVDLGtEQUE2QztBQUM3QyxnREFBMkQ7QUFDM0Qsa0NBQXVDO0FBRWhDLEtBQUssVUFBVSxrQkFBa0IsQ0FBQyxNQUEyQixFQUFFLEdBQVc7SUFDaEYsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDdEQsTUFBTSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUMxQyxJQUFJLE1BQU0saUJBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUN4QixJQUFJLE1BQU0saUJBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUM5QixNQUFNLHdCQUFlLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztTQUNoRDtRQUNELE1BQU0sQ0FBQyxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztRQUU1QyxNQUFNLGVBQU0sQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDeEMsTUFBTSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxpQ0FBaUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3RGLE1BQU0sQ0FBQyxDQUFDO1FBQ1QsQ0FBQyxDQUFDLENBQUM7S0FDSDtBQUNGLENBQUM7QUFkRCxnREFjQztBQUVNLEtBQUssVUFBVSxlQUFlLENBQUMsTUFBNkIsRUFBRSxHQUFXO0lBQy9FLElBQUksTUFBTSxpQkFBUSxDQUFDLEdB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
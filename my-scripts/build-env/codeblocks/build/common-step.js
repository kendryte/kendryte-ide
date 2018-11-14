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
const removeDir_1 = require("../removeDir");
async function cleanupBuildResult(output, dir) {
    const backupDir = dir.replace(/(.app)$|$/, '.last$1');
    output.write(`build target is: ${dir}\n`);
    if (await fsUtil_1.isExists(dir)) {
        if (await fsUtil_1.isExists(backupDir)) {
            await removeDir_1.removeDirectory(backupDir, output, false);
        }
        output.write(`remove last build result.\n`);
        await fsUtil_1.rename(dir, backupDir).catch((e) => {
            output.fail(`Cannot rename folder "${dir}", did you open any file in it?`);
            throw e;
        });
    }
}
exports.cleanupBuildResult = cleanupBuildResult;
async function yarnInstall(output) {
    const timeInstall = timeUtil_1.timing();
    const integrityFile = path_1.resolve(constants_1.ARCH_RELEASE_ROOT, 'node_modules/.yarn-integrity');
    if (await fsUtil_1.isExists(integrityFile)) {
        await fsUtil_1.unlink(integrityFile);
    }
    await yarn_1.installDependency(output, constants_1.ARCH_RELEASE_ROOT);
    output.success('dependencies installed.' + timeInstall());
}
exports.yarnInstall = yarnInstall;
async function downloadElectron(output) {
    pathUtil_1.chdir(constants_1.ARCH_RELEASE_ROOT);
    output.write(`installing electron...\n`);
    getElectron_1.showElectronNoticeInChina();
    await complex_1.pipeCommandOut(output, 'node', ...gulp_1.gulpCommands(), 'electron-x64');
    output.success('electron installed.');
}
exports.downloadElectron = downloadElectron;
async function downloadBuiltinExtensions(output) {
    pathUtil_1.chdir(constants_1.ARCH_RELEASE_ROOT);
    output.write(`installing builtin extension...\n`);
    await complex_1.pipeCommandOut(output, 'node', 'build/lib/builtInExtensions.js');
    output.success('builtin extension installed.');
}
exports.downloadBuiltinExtensions = downloadBuiltinExtensions;
async function deleteCompileCaches(output) {
    pathUtil_1.chdir(process.env.TMP);
    for (const folder of await fs_extra_1.readdir(process.env.TMP)) {
        if (folder.startsWith('v8-compile-cache')) {
            await removeDir_1.removeDirectory(path_1.resolve(process.env.TMP, folder), output);
        }
    }
    pathUtil_1.chdir(process.env.HOME);
    await removeDir_1.removeDirectory(path_1.resolve(process.env.HOME, '.node-gyp'), output);
    for (const folder of await fs_extra_1.readdir(process.env.HOME)) {
        if (folder.startsWith('.v8flags')) {
            await removeDir_1.removeDirectory(path_1.resolve(process.env.TMP, folder), output);
        }
    }
}
exports.deleteCompileCaches = deleteCompileCaches;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uLXN0ZXAuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImJ1aWxkLWVudi9jb2RlYmxvY2tzL2J1aWxkL2NvbW1vbi1zdGVwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsdUNBQW1DO0FBQ25DLCtCQUErQjtBQUMvQix3REFBNEQ7QUFDNUQsa0RBQTREO0FBQzVELG9EQUF5RDtBQUN6RCw4Q0FBeUU7QUFDekUsa0RBQTRDO0FBQzVDLGtEQUE2QztBQUM3QyxnREFBMkQ7QUFDM0Qsa0NBQXVDO0FBQ3ZDLDRDQUErQztBQUV4QyxLQUFLLFVBQVUsa0JBQWtCLENBQUMsTUFBMkIsRUFBRSxHQUFXO0lBQ2hGLE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3RELE1BQU0sQ0FBQyxLQUFLLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDMUMsSUFBSSxNQUFNLGlCQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDeEIsSUFBSSxNQUFNLGlCQUFRLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDOUIsTUFBTSwyQkFBZSxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDaEQ7UUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7UUFFNUMsTUFBTSxlQUFNLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ3hDLE1BQU0sQ0FBQyxJQUFJLENBQUMseUJBQXlCLEdBQUcsaUNBQWlDLENBQUMsQ0FBQztZQUMzRSxNQUFNLENBQUMsQ0FBQztRQUNULENBQUMsQ0FBQyxDQUFDO0tBQ0g7QUFDRixDQUFDO0FBZEQsZ0RBY0M7QUFFTSxLQUFLLFVBQVUsV0FBVyxDQUFDLE1BQTJCO0lBQzVELE1BQU0sV0FBVyxHQUFHLGlCQUFNLEVBQUUsQ0FBQztJQUU3QixNQUFNLGFBQWEsR0FBRyxjQUFPLENBQUMsNkJBQWlCLEVBQUUsOEJBQThCLENBQUMsQ0FBQztJQUNqRixJQUFJLE1BQU0saUJBQVEsQ0FBQyxhQUFhLENBQUMsRUFBRTtRQUNsQyxNQUFNLGVBQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUM1QjtJQUNELE1BQU0sd0JBQWlCLENBQUMsTUFBTSxFQUFFLDZCQUFpQixDQUFDLENBQUM7SUFDbkQsTUFBTSxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsR0FBRyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0FBQzNELENBQUM7QUFURCxrQ0FTQztBQUVNLEtBQUssVUFBVSxnQkFBZ0IsQ0FBQyxNQUEyQjtJQUNqRSxnQkFBSyxDQUFDLDZCQUFpQixDQUFDLENBQUM7SUFDekIsTUFBTSxDQUFDLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBQ3pDLHVDQUF5QixFQUFFLENBQUM7SUFFNUIsTUFBTSx3QkFBYyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxtQkFBWSxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDeEUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQ3ZDLENBQUM7QUFQRCw0Q0FPQztBQUVNLEtBQUssVUFBVSx5QkFBeUIsQ0FBQyxNQUEyQjtJQUMxRSxnQkFBSyxDQUFDLDZCQUFpQixDQUFDLENBQUM7SUFDekIsTUFBTSxDQUFDLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO0lBQ2xELE1BQU0sd0JBQWMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLGdDQUFnQyxDQUFDLENBQUM7SUFDdkUsTUFBTSxDQUFDLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO0FBQ2hELENBQUM7QUFMRCw4REFLQztBQUVNLEtBQUssVUFBVSxtQkFBbUIsQ0FBQyxNQUEyQjtJQUNwRSxnQkFBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdkIsS0FBSyxNQUFNLE1BQU0sSUFBSSxNQUFNLGtCQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUNwRCxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsRUFBRTtZQUMxQyxNQUFNLDJCQUFlLENBQUMsY0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQ2hFO0tBQ0Q7SUFFRCxnQkFBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDeEIsTUFBTSwyQkFBZSxDQUFDLGNBQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN0RSxLQUFLLE1BQU0sTUFBTSxJQUFJLE1BQU0sa0JBQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ3JELElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUNsQyxNQUFNLDJCQUFlLENBQUMsY0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQ2hFO0tBQ0Q7QUFDRixDQUFDO0FBZkQsa0RBZUMifQ==
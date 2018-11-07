"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const complex_1 = require("../../childprocess/complex");
const yarn_1 = require("../../childprocess/yarn");
const constants_1 = require("../../misc/constants");
const fsUtil_1 = require("../../misc/fsUtil");
const pathUtil_1 = require("../../misc/pathUtil");
const timeUtil_1 = require("../../misc/timeUtil");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uLXN0ZXAuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImJ1aWxkLWVudi9jb2RlYmxvY2tzL2J1aWxkL2NvbW1vbi1zdGVwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsK0JBQStCO0FBQy9CLHdEQUE0RDtBQUM1RCxrREFBNEQ7QUFDNUQsb0RBQXlEO0FBQ3pELDhDQUEwRjtBQUMxRixrREFBNEM7QUFDNUMsa0RBQTZDO0FBQzdDLGtDQUF1QztBQUVoQyxLQUFLLFVBQVUsa0JBQWtCLENBQUMsTUFBMkIsRUFBRSxHQUFXO0lBQ2hGLE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3RELE1BQU0sQ0FBQyxLQUFLLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDMUMsSUFBSSxNQUFNLGlCQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDeEIsSUFBSSxNQUFNLGlCQUFRLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDOUIsTUFBTSx3QkFBZSxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDaEQ7UUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7UUFFNUMsTUFBTSxlQUFNLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ3hDLE1BQU0sQ0FBQyxJQUFJLENBQUMseUJBQXlCLEdBQUcsaUNBQWlDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN0RixNQUFNLENBQUMsQ0FBQztRQUNULENBQUMsQ0FBQyxDQUFDO0tBQ0g7QUFDRixDQUFDO0FBZEQsZ0RBY0M7QUFFTSxLQUFLLFVBQVUsZUFBZSxDQUFDLE1BQTJCLEVBQUUsR0FBVztJQUM3RSxJQUFJLE1BQU0saUJBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUN4QixNQUFNLHdCQUFlLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQ25DO0lBQ0QsbUJBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNqQixDQUFDO0FBTEQsMENBS0M7QUFFTSxLQUFLLFVBQVUsV0FBVyxDQUFDLE1BQTJCO0lBQzVELE1BQU0sV0FBVyxHQUFHLGlCQUFNLEVBQUUsQ0FBQztJQUU3QixNQUFNLGFBQWEsR0FBRyxjQUFPLENBQUMsNkJBQWlCLEVBQUUsOEJBQThCLENBQUMsQ0FBQztJQUNqRixJQUFJLE1BQU0saUJBQVEsQ0FBQyxhQUFhLENBQUMsRUFBRTtRQUNsQyxNQUFNLGVBQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUM1QjtJQUNELE1BQU0sd0JBQWlCLENBQUMsTUFBTSxFQUFFLDZCQUFpQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzFELE1BQU0sQ0FBQyxPQUFPLENBQUMseUJBQXlCLEdBQUcsV0FBVyxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUN0RSxDQUFDO0FBVEQsa0NBU0M7QUFFTSxLQUFLLFVBQVUsZ0JBQWdCLENBQUMsTUFBMkI7SUFDakUsZ0JBQUssQ0FBQyw2QkFBaUIsQ0FBQyxDQUFDO0lBQ3pCLE1BQU0sQ0FBQyxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztJQUN6QyxNQUFNLHdCQUFjLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLG1CQUFZLEVBQUUsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUN4RSxNQUFNLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDbEQsQ0FBQztBQUxELDRDQUtDO0FBRU0sS0FBSyxVQUFVLHlCQUF5QixDQUFDLE1BQTJCO0lBQzFFLGdCQUFLLENBQUMsNkJBQWlCLENBQUMsQ0FBQztJQUN6QixNQUFNLENBQUMsS0FBSyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7SUFDbEQsTUFBTSx3QkFBYyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsZ0NBQWdDLENBQUMsQ0FBQztJQUN2RSxNQUFNLENBQUMsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDM0QsQ0FBQztBQUxELDhEQUtDIn0=
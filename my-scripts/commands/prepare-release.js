"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const util_1 = require("util");
const childCommands_1 = require("../build-env/childCommands");
const include_1 = require("../build-env/include");
const rimrafAsync = require("rimraf");
const rimraf = util_1.promisify(rimrafAsync);
const writeFile = util_1.promisify(fs_1.writeFile);
include_1.thisIsABuildScript();
include_1.runMain(async () => {
    await removeYarnGlobalDir(process.env.USERPROFILE, '.yarn/bin');
    await removeYarnGlobalDir(process.env.LOCALAPPDATA, 'Yarn/bin');
    await removeYarnGlobalDir((await childCommands_1.shellOutput('yarn', 'global', 'bin')).trim());
    childCommands_1.chdir(include_1.VSCODE_ROOT + '/my-scripts');
    childCommands_1.shellExec('yarn', 'install');
    childCommands_1.shellExec('tsc', '-p', '.');
});
async function removeYarnGlobalDir(binDir, resolveTo) {
    if (!binDir) {
        return;
    }
    if (resolveTo) {
        binDir = path_1.resolve(binDir, resolveTo);
    }
    const stat = await include_1.lstat(binDir);
    if (stat) {
        if (stat.isDirectory()) {
            await rimraf(binDir);
        }
    }
    else {
        include_1.mkdirpSync(path_1.resolve(binDir, '..'));
    }
    await writeDummy(binDir);
}
function writeDummy(bin) {
    return writeFile(bin, '@this is a dummy file from kendryte-ide. To prevent yarn add broken global bin link here.');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlcGFyZS1yZWxlYXNlLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJjb21tYW5kcy9wcmVwYXJlLXJlbGVhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQkFBaUQ7QUFDakQsK0JBQStCO0FBQy9CLCtCQUFpQztBQUNqQyw4REFBMkU7QUFDM0Usa0RBQW1HO0FBQ25HLHNDQUF1QztBQUV2QyxNQUFNLE1BQU0sR0FBRyxnQkFBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3RDLE1BQU0sU0FBUyxHQUFHLGdCQUFTLENBQUMsY0FBYyxDQUFDLENBQUM7QUFFNUMsNEJBQWtCLEVBQUUsQ0FBQztBQUVyQixpQkFBTyxDQUFDLEtBQUssSUFBSSxFQUFFO0lBQ2xCLE1BQU0sbUJBQW1CLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDaEUsTUFBTSxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNoRSxNQUFNLG1CQUFtQixDQUFDLENBQUMsTUFBTSwyQkFBVyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBRS9FLHFCQUFLLENBQUMscUJBQVcsR0FBRyxhQUFhLENBQUMsQ0FBQztJQUNuQyx5QkFBUyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztJQUM3Qix5QkFBUyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDN0IsQ0FBQyxDQUFDLENBQUM7QUFFSCxLQUFLLFVBQVUsbUJBQW1CLENBQUMsTUFBYyxFQUFFLFNBQWtCO0lBQ3BFLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDWixPQUFPO0tBQ1A7SUFDRCxJQUFJLFNBQVMsRUFBRTtRQUNkLE1BQU0sR0FBRyxjQUFPLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0tBQ3BDO0lBRUQsTUFBTSxJQUFJLEdBQUcsTUFBTSxlQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDakMsSUFBSSxJQUFJLEVBQUU7UUFDVCxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRTtZQUN2QixNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNyQjtLQUNEO1NBQU07UUFDTixvQkFBVSxDQUFDLGNBQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztLQUNsQztJQUNELE1BQU0sVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzFCLENBQUM7QUFFRCxTQUFTLFVBQVUsQ0FBQyxHQUFHO0lBQ3RCLE9BQU8sU0FBUyxDQUFDLEdBQUcsRUFBRSwyRkFBMkYsQ0FBQyxDQUFDO0FBQ3BILENBQUMifQ==
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const util_1 = require("util");
const noDependency_1 = require("../build-env/childprocess/noDependency");
const constants_1 = require("../build-env/misc/constants");
const fsUtil_1 = require("../build-env/misc/fsUtil");
const myBuildSystem_1 = require("../build-env/misc/myBuildSystem");
const pathUtil_1 = require("../build-env/misc/pathUtil");
myBuildSystem_1.whatIsThis(__filename, 'install required thing for create release.');
const writeFile = util_1.promisify(fs_1.writeFile);
myBuildSystem_1.runMain(async () => {
    await removeYarnGlobalDir(process.env.USERPROFILE, '.yarn/bin');
    await removeYarnGlobalDir(process.env.LOCALAPPDATA, 'Yarn/bin');
    await removeYarnGlobalDir((await noDependency_1.shellOutput('yarn', 'global', 'bin')).trim());
    pathUtil_1.chdir(constants_1.VSCODE_ROOT + '/my-scripts');
    noDependency_1.shellExec('yarn', 'install');
    noDependency_1.shellExec('tsc', '-p', '.');
});
async function removeYarnGlobalDir(binDir, resolveTo) {
    if (!binDir) {
        return;
    }
    if (resolveTo) {
        binDir = path_1.resolve(binDir, resolveTo);
    }
    const stat = await fsUtil_1.lstat(binDir);
    if (stat) {
        if (stat.isDirectory()) {
            await fsUtil_1.removeDirectory(binDir, process.stderr);
        }
    }
    else {
        fsUtil_1.mkdirpSync(path_1.resolve(binDir, '..'));
    }
    await writeDummy(binDir);
}
function writeDummy(bin) {
    return writeFile(bin, '@this is a dummy file from kendryte-ide. To prevent yarn add broken global bin link here.');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlcGFyZS1yZWxlYXNlLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJjb21tYW5kcy9wcmVwYXJlLXJlbGVhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQkFBaUQ7QUFDakQsK0JBQStCO0FBQy9CLCtCQUFpQztBQUNqQyx5RUFBZ0Y7QUFDaEYsMkRBQTBEO0FBQzFELHFEQUE4RTtBQUM5RSxtRUFBc0U7QUFDdEUseURBQW1EO0FBRW5ELDBCQUFVLENBQUMsVUFBVSxFQUFFLDRDQUE0QyxDQUFDLENBQUM7QUFFckUsTUFBTSxTQUFTLEdBQUcsZ0JBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUU1Qyx1QkFBTyxDQUFDLEtBQUssSUFBSSxFQUFFO0lBQ2xCLE1BQU0sbUJBQW1CLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDaEUsTUFBTSxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNoRSxNQUFNLG1CQUFtQixDQUFDLENBQUMsTUFBTSwwQkFBVyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBRS9FLGdCQUFLLENBQUMsdUJBQVcsR0FBRyxhQUFhLENBQUMsQ0FBQztJQUNuQyx3QkFBUyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztJQUM3Qix3QkFBUyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDN0IsQ0FBQyxDQUFDLENBQUM7QUFFSCxLQUFLLFVBQVUsbUJBQW1CLENBQUMsTUFBYyxFQUFFLFNBQWtCO0lBQ3BFLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDWixPQUFPO0tBQ1A7SUFDRCxJQUFJLFNBQVMsRUFBRTtRQUNkLE1BQU0sR0FBRyxjQUFPLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0tBQ3BDO0lBRUQsTUFBTSxJQUFJLEdBQUcsTUFBTSxjQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDakMsSUFBSSxJQUFJLEVBQUU7UUFDVCxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRTtZQUN2QixNQUFNLHdCQUFlLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUM5QztLQUNEO1NBQU07UUFDTixtQkFBVSxDQUFDLGNBQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztLQUNsQztJQUNELE1BQU0sVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzFCLENBQUM7QUFFRCxTQUFTLFVBQVUsQ0FBQyxHQUFHO0lBQ3RCLE9BQU8sU0FBUyxDQUFDLEdBQUcsRUFBRSwyRkFBMkYsQ0FBQyxDQUFDO0FBQ3BILENBQUMifQ==
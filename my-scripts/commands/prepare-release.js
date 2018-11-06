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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlcGFyZS1yZWxlYXNlLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJjb21tYW5kcy9wcmVwYXJlLXJlbGVhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQkFBaUQ7QUFDakQsK0JBQStCO0FBQy9CLCtCQUFpQztBQUNqQyx5RUFBZ0Y7QUFDaEYsMkRBQTBEO0FBQzFELHFEQUE4RTtBQUM5RSxtRUFBMEQ7QUFDMUQseURBQW1EO0FBRW5ELE1BQU0sU0FBUyxHQUFHLGdCQUFTLENBQUMsY0FBYyxDQUFDLENBQUM7QUFFNUMsdUJBQU8sQ0FBQyxLQUFLLElBQUksRUFBRTtJQUNsQixNQUFNLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ2hFLE1BQU0sbUJBQW1CLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDaEUsTUFBTSxtQkFBbUIsQ0FBQyxDQUFDLE1BQU0sMEJBQVcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUUvRSxnQkFBSyxDQUFDLHVCQUFXLEdBQUcsYUFBYSxDQUFDLENBQUM7SUFDbkMsd0JBQVMsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDN0Isd0JBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzdCLENBQUMsQ0FBQyxDQUFDO0FBRUgsS0FBSyxVQUFVLG1CQUFtQixDQUFDLE1BQWMsRUFBRSxTQUFrQjtJQUNwRSxJQUFJLENBQUMsTUFBTSxFQUFFO1FBQ1osT0FBTztLQUNQO0lBQ0QsSUFBSSxTQUFTLEVBQUU7UUFDZCxNQUFNLEdBQUcsY0FBTyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztLQUNwQztJQUVELE1BQU0sSUFBSSxHQUFHLE1BQU0sY0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2pDLElBQUksSUFBSSxFQUFFO1FBQ1QsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUU7WUFDdkIsTUFBTSx3QkFBZSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDOUM7S0FDRDtTQUFNO1FBQ04sbUJBQVUsQ0FBQyxjQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDbEM7SUFDRCxNQUFNLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMxQixDQUFDO0FBRUQsU0FBUyxVQUFVLENBQUMsR0FBRztJQUN0QixPQUFPLFNBQVMsQ0FBQyxHQUFHLEVBQUUsMkZBQTJGLENBQUMsQ0FBQztBQUNwSCxDQUFDIn0=
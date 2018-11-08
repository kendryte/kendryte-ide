"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const util_1 = require("util");
const noDependency_1 = require("../build-env/childprocess/noDependency");
const constants_1 = require("../build-env/misc/constants");
const fsUtil_1 = require("../build-env/misc/fsUtil");
const help_1 = require("../build-env/misc/help");
const myBuildSystem_1 = require("../build-env/misc/myBuildSystem");
const pathUtil_1 = require("../build-env/misc/pathUtil");
help_1.whatIsThis(__filename, 'install required thing for create release.');
const writeFile = util_1.promisify(fs_1.writeFile);
myBuildSystem_1.runMain(async () => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlcGFyZS1yZWxlYXNlLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJjb21tYW5kcy9wcmVwYXJlLXJlbGVhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQkFBaUQ7QUFDakQsK0JBQStCO0FBQy9CLCtCQUFpQztBQUNqQyx5RUFBbUU7QUFDbkUsMkRBQTBEO0FBQzFELHFEQUE4RTtBQUM5RSxpREFBb0Q7QUFDcEQsbUVBQTBEO0FBQzFELHlEQUFtRDtBQUVuRCxpQkFBVSxDQUFDLFVBQVUsRUFBRSw0Q0FBNEMsQ0FBQyxDQUFDO0FBRXJFLE1BQU0sU0FBUyxHQUFHLGdCQUFTLENBQUMsY0FBYyxDQUFDLENBQUM7QUFFNUMsdUJBQU8sQ0FBQyxLQUFLLElBQUksRUFBRTtJQUNsQixnQkFBSyxDQUFDLHVCQUFXLEdBQUcsYUFBYSxDQUFDLENBQUM7SUFDbkMsd0JBQVMsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDN0Isd0JBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzdCLENBQUMsQ0FBQyxDQUFDO0FBRUgsS0FBSyxVQUFVLG1CQUFtQixDQUFDLE1BQWMsRUFBRSxTQUFrQjtJQUNwRSxJQUFJLENBQUMsTUFBTSxFQUFFO1FBQ1osT0FBTztLQUNQO0lBQ0QsSUFBSSxTQUFTLEVBQUU7UUFDZCxNQUFNLEdBQUcsY0FBTyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztLQUNwQztJQUVELE1BQU0sSUFBSSxHQUFHLE1BQU0sY0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2pDLElBQUksSUFBSSxFQUFFO1FBQ1QsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUU7WUFDdkIsTUFBTSx3QkFBZSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDOUM7S0FDRDtTQUFNO1FBQ04sbUJBQVUsQ0FBQyxjQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDbEM7SUFDRCxNQUFNLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMxQixDQUFDO0FBRUQsU0FBUyxVQUFVLENBQUMsR0FBRztJQUN0QixPQUFPLFNBQVMsQ0FBQyxHQUFHLEVBQUUsMkZBQTJGLENBQUMsQ0FBQztBQUNwSCxDQUFDIn0=
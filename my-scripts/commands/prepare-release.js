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
    childCommands_1.chdir(process.env.VSCODE_ROOT + '/my-scripts');
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
    const stat = await lstatPromise(binDir);
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
function lstatPromise(p) {
    return new Promise((resolve, reject) => {
        fs_1.lstat(p, (err, stats) => {
            if (err && err.code !== 'ENOENT') {
                return reject(err);
            }
            return resolve(stats);
        });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlcGFyZS1yZWxlYXNlLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJjb21tYW5kcy9wcmVwYXJlLXJlbGVhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwyQkFBK0Q7QUFDL0QsK0JBQStCO0FBQy9CLCtCQUFpQztBQUNqQyw4REFBMkU7QUFDM0Usa0RBQStFO0FBQy9FLHNDQUF1QztBQUV2QyxNQUFNLE1BQU0sR0FBRyxnQkFBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3RDLE1BQU0sU0FBUyxHQUFHLGdCQUFTLENBQUMsY0FBYyxDQUFDLENBQUM7QUFFNUMsNEJBQWtCLEVBQUUsQ0FBQztBQUVyQixpQkFBTyxDQUFDLEtBQUssSUFBSSxFQUFFO0lBQ2xCLE1BQU0sbUJBQW1CLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDaEUsTUFBTSxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNoRSxNQUFNLG1CQUFtQixDQUFDLENBQUMsTUFBTSwyQkFBVyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBRS9FLHFCQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsYUFBYSxDQUFDLENBQUM7SUFDL0MseUJBQVMsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDN0IseUJBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzdCLENBQUMsQ0FBQyxDQUFDO0FBRUgsS0FBSyxVQUFVLG1CQUFtQixDQUFDLE1BQWMsRUFBRSxTQUFrQjtJQUNwRSxJQUFJLENBQUMsTUFBTSxFQUFFO1FBQ1osT0FBTztLQUNQO0lBQ0QsSUFBSSxTQUFTLEVBQUU7UUFDZCxNQUFNLEdBQUcsY0FBTyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztLQUNwQztJQUVELE1BQU0sSUFBSSxHQUFHLE1BQU0sWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3hDLElBQUksSUFBSSxFQUFFO1FBQ1QsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUU7WUFDdkIsTUFBTSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDckI7S0FDRDtTQUFNO1FBQ04sb0JBQVUsQ0FBQyxjQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDbEM7SUFDRCxNQUFNLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMxQixDQUFDO0FBRUQsU0FBUyxVQUFVLENBQUMsR0FBRztJQUN0QixPQUFPLFNBQVMsQ0FBQyxHQUFHLEVBQUUsMkZBQTJGLENBQUMsQ0FBQztBQUNwSCxDQUFDO0FBRUQsU0FBUyxZQUFZLENBQUMsQ0FBUztJQUM5QixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ3RDLFVBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDdkIsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7Z0JBQ2pDLE9BQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ25CO1lBQ0QsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztBQUNKLENBQUMifQ==
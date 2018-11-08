"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const yarn_1 = require("../build-env/childprocess/yarn");
const packWindows_1 = require("../build-env/codeblocks/packWindows");
const resetAsar_1 = require("../build-env/codeblocks/resetAsar");
const constants_1 = require("../build-env/misc/constants");
const fsUtil_1 = require("../build-env/misc/fsUtil");
const help_1 = require("../build-env/misc/help");
const myBuildSystem_1 = require("../build-env/misc/myBuildSystem");
const pathUtil_1 = require("../build-env/misc/pathUtil");
const usePretty_1 = require("../build-env/misc/usePretty");
require("./prepare-release");
help_1.whatIsThis(__filename, 'install required thing for development (require prepare-release).');
myBuildSystem_1.runMain(async () => {
    pathUtil_1.chdir(constants_1.VSCODE_ROOT);
    const output = usePretty_1.usePretty();
    output.pipe(myBuildSystem_1.useWriteFileStream(path_1.resolve(constants_1.RELEASE_ROOT, 'prepare-development.log')));
    if (constants_1.isWin) {
        const stat = await fsUtil_1.lstat('./node_modules');
        if (stat && stat.isDirectory()) {
            throw new Error('node_modules exists, must remove.');
        }
        await resetAsar_1.reset_asar(output);
        await packWindows_1.packWindows(output);
    }
    else {
        await yarn_1.installDependency(output, constants_1.VSCODE_ROOT);
    }
    output.success('Done.');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlcGFyZS1kZXZlbG9wbWVudC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiY29tbWFuZHMvcHJlcGFyZS1kZXZlbG9wbWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUErQjtBQUMvQix5REFBbUU7QUFDbkUscUVBQWtFO0FBQ2xFLGlFQUErRDtBQUMvRCwyREFBK0U7QUFDL0UscURBQWlEO0FBQ2pELGlEQUFvRDtBQUNwRCxtRUFBOEU7QUFDOUUseURBQW1EO0FBQ25ELDJEQUF3RDtBQUN4RCw2QkFBMkI7QUFFM0IsaUJBQVUsQ0FBQyxVQUFVLEVBQUUsbUVBQW1FLENBQUMsQ0FBQztBQUU1Rix1QkFBTyxDQUFDLEtBQUssSUFBSSxFQUFFO0lBQ2xCLGdCQUFLLENBQUMsdUJBQVcsQ0FBQyxDQUFDO0lBQ25CLE1BQU0sTUFBTSxHQUFHLHFCQUFTLEVBQUUsQ0FBQztJQUMzQixNQUFNLENBQUMsSUFBSSxDQUFDLGtDQUFrQixDQUFDLGNBQU8sQ0FBQyx3QkFBWSxFQUFFLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xGLElBQUksaUJBQUssRUFBRTtRQUNWLE1BQU0sSUFBSSxHQUFHLE1BQU0sY0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDM0MsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFO1lBQy9CLE1BQU0sSUFBSSxLQUFLLENBQUMsbUNBQW1DLENBQUMsQ0FBQztTQUNyRDtRQUNELE1BQU0sc0JBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN6QixNQUFNLHlCQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDMUI7U0FBTTtRQUNOLE1BQU0sd0JBQWlCLENBQUMsTUFBTSxFQUFFLHVCQUFXLENBQUMsQ0FBQztLQUM3QztJQUNELE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDekIsQ0FBQyxDQUFDLENBQUMifQ==
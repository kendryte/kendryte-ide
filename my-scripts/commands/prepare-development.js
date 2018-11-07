"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yarn_1 = require("../build-env/childprocess/yarn");
const packWindows_1 = require("../build-env/codeblocks/packWindows");
const constants_1 = require("../build-env/misc/constants");
const fsUtil_1 = require("../build-env/misc/fsUtil");
const myBuildSystem_1 = require("../build-env/misc/myBuildSystem");
const pathUtil_1 = require("../build-env/misc/pathUtil");
require("./prepare-release");
myBuildSystem_1.whatIsThis(__filename, 'install required thing for development (includes prepare-release).');
myBuildSystem_1.runMain(async () => {
    pathUtil_1.chdir(constants_1.VSCODE_ROOT);
    const output = myBuildSystem_1.usePretty();
    if (constants_1.isWin) {
        const stat = await fsUtil_1.lstat('./node_modules');
        if (stat && stat.isDirectory()) {
            throw new Error('node_modules exists, must remove.');
        }
        await packWindows_1.reset_asar(output);
        await packWindows_1.packWindows(output);
    }
    else {
        await yarn_1.installDependency(output, constants_1.VSCODE_ROOT);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlcGFyZS1kZXZlbG9wbWVudC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiY29tbWFuZHMvcHJlcGFyZS1kZXZlbG9wbWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlEQUFtRTtBQUNuRSxxRUFBOEU7QUFDOUUsMkRBQWlFO0FBQ2pFLHFEQUFpRDtBQUNqRCxtRUFBaUY7QUFDakYseURBQW1EO0FBQ25ELDZCQUEyQjtBQUUzQiwwQkFBVSxDQUFDLFVBQVUsRUFBRSxvRUFBb0UsQ0FBQyxDQUFDO0FBRTdGLHVCQUFPLENBQUMsS0FBSyxJQUFJLEVBQUU7SUFDbEIsZ0JBQUssQ0FBQyx1QkFBVyxDQUFDLENBQUM7SUFDbkIsTUFBTSxNQUFNLEdBQUcseUJBQVMsRUFBRSxDQUFDO0lBQzNCLElBQUksaUJBQUssRUFBRTtRQUNWLE1BQU0sSUFBSSxHQUFHLE1BQU0sY0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDM0MsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFO1lBQy9CLE1BQU0sSUFBSSxLQUFLLENBQUMsbUNBQW1DLENBQUMsQ0FBQztTQUNyRDtRQUNELE1BQU0sd0JBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN6QixNQUFNLHlCQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDMUI7U0FBTTtRQUNOLE1BQU0sd0JBQWlCLENBQUMsTUFBTSxFQUFFLHVCQUFXLENBQUMsQ0FBQztLQUM3QztBQUNGLENBQUMsQ0FBQyxDQUFDIn0=
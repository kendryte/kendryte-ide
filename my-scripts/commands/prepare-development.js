"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yarn_1 = require("../build-env/childprocess/yarn");
const packWindows_1 = require("../build-env/codeblocks/packWindows");
const resetAsar_1 = require("../build-env/codeblocks/resetAsar");
const constants_1 = require("../build-env/misc/constants");
const fsUtil_1 = require("../build-env/misc/fsUtil");
const help_1 = require("../build-env/misc/help");
const myBuildSystem_1 = require("../build-env/misc/myBuildSystem");
const pathUtil_1 = require("../build-env/misc/pathUtil");
const usePretty_1 = require("../build-env/misc/usePretty");
help_1.whatIsThis(__filename, 'install required thing for development (require prepare-release).');
myBuildSystem_1.runMain(async () => {
    pathUtil_1.chdir(constants_1.VSCODE_ROOT);
    const output = usePretty_1.usePretty('prepare-development');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlcGFyZS1kZXZlbG9wbWVudC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiY29tbWFuZHMvcHJlcGFyZS1kZXZlbG9wbWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlEQUFtRTtBQUNuRSxxRUFBa0U7QUFDbEUsaUVBQStEO0FBQy9ELDJEQUFpRTtBQUNqRSxxREFBaUQ7QUFDakQsaURBQW9EO0FBQ3BELG1FQUEwRDtBQUMxRCx5REFBbUQ7QUFDbkQsMkRBQXdEO0FBRXhELGlCQUFVLENBQUMsVUFBVSxFQUFFLG1FQUFtRSxDQUFDLENBQUM7QUFFNUYsdUJBQU8sQ0FBQyxLQUFLLElBQUksRUFBRTtJQUNsQixnQkFBSyxDQUFDLHVCQUFXLENBQUMsQ0FBQztJQUNuQixNQUFNLE1BQU0sR0FBRyxxQkFBUyxDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFDaEQsSUFBSSxpQkFBSyxFQUFFO1FBQ1YsTUFBTSxJQUFJLEdBQUcsTUFBTSxjQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUMzQyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUU7WUFDL0IsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO1NBQ3JEO1FBQ0QsTUFBTSxzQkFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3pCLE1BQU0seUJBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUMxQjtTQUFNO1FBQ04sTUFBTSx3QkFBaUIsQ0FBQyxNQUFNLEVBQUUsdUJBQVcsQ0FBQyxDQUFDO0tBQzdDO0lBQ0QsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN6QixDQUFDLENBQUMsQ0FBQyJ9
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const yarn_1 = require("../build-env/childprocess/yarn");
const packWindows_1 = require("../build-env/codeblocks/packWindows");
const constants_1 = require("../build-env/misc/constants");
const fsUtil_1 = require("../build-env/misc/fsUtil");
const globalOutput_1 = require("../build-env/misc/globalOutput");
const help_1 = require("../build-env/misc/help");
const myBuildSystem_1 = require("../build-env/misc/myBuildSystem");
const pathUtil_1 = require("../build-env/misc/pathUtil");
require("./prepare-release");
help_1.whatIsThis(__filename, 'install required thing for development (require prepare-release).');
myBuildSystem_1.runMain(async () => {
    pathUtil_1.chdir(constants_1.VSCODE_ROOT);
    const output = globalOutput_1.usePretty();
    output.pipe(myBuildSystem_1.useWriteFileStream(path_1.resolve(constants_1.RELEASE_ROOT, 'prepare-development.log')));
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
    output.success('Done.');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlcGFyZS1kZXZlbG9wbWVudC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiY29tbWFuZHMvcHJlcGFyZS1kZXZlbG9wbWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUErQjtBQUMvQix5REFBbUU7QUFDbkUscUVBQThFO0FBQzlFLDJEQUErRTtBQUMvRSxxREFBaUQ7QUFDakQsaUVBQTJEO0FBQzNELGlEQUFvRDtBQUNwRCxtRUFBOEU7QUFDOUUseURBQW1EO0FBQ25ELDZCQUEyQjtBQUUzQixpQkFBVSxDQUFDLFVBQVUsRUFBRSxtRUFBbUUsQ0FBQyxDQUFDO0FBRTVGLHVCQUFPLENBQUMsS0FBSyxJQUFJLEVBQUU7SUFDbEIsZ0JBQUssQ0FBQyx1QkFBVyxDQUFDLENBQUM7SUFDbkIsTUFBTSxNQUFNLEdBQUcsd0JBQVMsRUFBRSxDQUFDO0lBQzNCLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0NBQWtCLENBQUMsY0FBTyxDQUFDLHdCQUFZLEVBQUUseUJBQXlCLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEYsSUFBSSxpQkFBSyxFQUFFO1FBQ1YsTUFBTSxJQUFJLEdBQUcsTUFBTSxjQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUMzQyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUU7WUFDL0IsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO1NBQ3JEO1FBQ0QsTUFBTSx3QkFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3pCLE1BQU0seUJBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUMxQjtTQUFNO1FBQ04sTUFBTSx3QkFBaUIsQ0FBQyxNQUFNLEVBQUUsdUJBQVcsQ0FBQyxDQUFDO0tBQzdDO0lBQ0QsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUN4QixDQUFDLENBQUMsQ0FBQyJ9
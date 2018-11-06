"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yarn_1 = require("../build-env/childprocess/yarn");
const packWindows_1 = require("../build-env/codeblocks/packWindows");
const constants_1 = require("../build-env/misc/constants");
const fsUtil_1 = require("../build-env/misc/fsUtil");
const myBuildSystem_1 = require("../build-env/misc/myBuildSystem");
require("./prepare-release");
myBuildSystem_1.whatIsThis(__filename, 'install required thing for development (includes prepare-release).');
myBuildSystem_1.runMain(async () => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlcGFyZS1kZXZlbG9wbWVudC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiY29tbWFuZHMvcHJlcGFyZS1kZXZlbG9wbWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlEQUFtRTtBQUNuRSxxRUFBOEU7QUFDOUUsMkRBQWlFO0FBQ2pFLHFEQUFpRDtBQUNqRCxtRUFBaUY7QUFDakYsNkJBQTJCO0FBRTNCLDBCQUFVLENBQUMsVUFBVSxFQUFFLG9FQUFvRSxDQUFDLENBQUM7QUFFN0YsdUJBQU8sQ0FBQyxLQUFLLElBQUksRUFBRTtJQUNsQixNQUFNLE1BQU0sR0FBRyx5QkFBUyxFQUFFLENBQUM7SUFDM0IsSUFBSSxpQkFBSyxFQUFFO1FBQ1YsTUFBTSxJQUFJLEdBQUcsTUFBTSxjQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUMzQyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUU7WUFDL0IsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO1NBQ3JEO1FBQ0QsTUFBTSx3QkFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3pCLE1BQU0seUJBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUMxQjtTQUFNO1FBQ04sTUFBTSx3QkFBaUIsQ0FBQyxNQUFNLEVBQUUsdUJBQVcsQ0FBQyxDQUFDO0tBQzdDO0FBQ0YsQ0FBQyxDQUFDLENBQUMifQ==
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const include_1 = require("../build-env/include");
const output_1 = require("../build-env/output");
const packWindows_1 = require("../build-env/packWindows");
require("./prepare-release");
include_1.thisIsABuildScript();
include_1.runMain(async () => {
    const output = output_1.usePretty();
    if (include_1.isWin) {
        const stat = await include_1.lstat('./node_modules');
        if (stat && stat.isDirectory()) {
            throw new Error('node_modules exists, must remove.');
        }
        await packWindows_1.reset_asar(output);
        await packWindows_1.packWindows(output);
    }
    else {
        await output_1.installDependency(output, include_1.VSCODE_ROOT);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlcGFyZS1kZXZlbG9wbWVudC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiY29tbWFuZHMvcHJlcGFyZS1kZXZlbG9wbWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGtEQUE4RjtBQUM5RixnREFBbUU7QUFDbkUsMERBQW1FO0FBQ25FLDZCQUEyQjtBQUUzQiw0QkFBa0IsRUFBRSxDQUFDO0FBRXJCLGlCQUFPLENBQUMsS0FBSyxJQUFJLEVBQUU7SUFDbEIsTUFBTSxNQUFNLEdBQUcsa0JBQVMsRUFBRSxDQUFDO0lBQzNCLElBQUksZUFBSyxFQUFFO1FBQ1YsTUFBTSxJQUFJLEdBQUcsTUFBTSxlQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUMzQyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUU7WUFDL0IsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO1NBQ3JEO1FBQ0QsTUFBTSx3QkFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3pCLE1BQU0seUJBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUMxQjtTQUFNO1FBQ04sTUFBTSwwQkFBaUIsQ0FBQyxNQUFNLEVBQUUscUJBQVcsQ0FBQyxDQUFDO0tBQzdDO0FBQ0YsQ0FBQyxDQUFDLENBQUMifQ==
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const childCommands_1 = require("../build-env/childCommands");
const include_1 = require("../build-env/include");
const output_1 = require("../build-env/output");
const packWindows_1 = require("../build-env/packWindows");
require("./prepare-release");
include_1.thisIsABuildScript();
include_1.runMain(async () => {
    const output = output_1.usePretty();
    if (include_1.isWin) {
        await reset_asar(output);
        await packWindows_1.packWindows(output);
    }
    else {
        await output_1.installDependency(output, process.env.VSCODE_ROOT);
    }
});
async function reset_asar(output) {
    childCommands_1.chdir(process.env.VSCODE_ROOT);
    if (await include_1.isLink('./node_modules')) {
        fs_1.unlinkSync('./node_modules');
    }
    if (await include_1.isExists('./node_modules')) {
        throw new Error('node_modules exists, must remove.');
    }
    if (await include_1.isExists('./node_modules.asar')) {
        fs_1.unlinkSync('./node_modules.asar');
    }
    if (await include_1.isExists('./node_modules.asar.unpacked')) {
        await output_1.removeDirecotry('./node_modules.asar.unpacked', output);
    }
    output.success('cleanup ASAR files.').continue();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlcGFyZS1kZXZlbG9wbWVudC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiY29tbWFuZHMvcHJlcGFyZS1kZXZlbG9wbWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLDJCQUFnQztBQUNoQyw4REFBbUQ7QUFDbkQsa0RBQTRGO0FBQzVGLGdEQUFvRjtBQUNwRiwwREFBdUQ7QUFDdkQsNkJBQTJCO0FBRTNCLDRCQUFrQixFQUFFLENBQUM7QUFFckIsaUJBQU8sQ0FBQyxLQUFLLElBQUksRUFBRTtJQUNsQixNQUFNLE1BQU0sR0FBRyxrQkFBUyxFQUFFLENBQUM7SUFDM0IsSUFBSSxlQUFLLEVBQUU7UUFDVixNQUFNLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN6QixNQUFNLHlCQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDMUI7U0FBTTtRQUNOLE1BQU0sMEJBQWlCLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDekQ7QUFDRixDQUFDLENBQUMsQ0FBQztBQUVILEtBQUssVUFBVSxVQUFVLENBQUMsTUFBcUI7SUFDOUMscUJBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQy9CLElBQUksTUFBTSxnQkFBTSxDQUFDLGdCQUFnQixDQUFDLEVBQUU7UUFDbkMsZUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUM7S0FDN0I7SUFDRCxJQUFJLE1BQU0sa0JBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO1FBQ3JDLE1BQU0sSUFBSSxLQUFLLENBQUMsbUNBQW1DLENBQUMsQ0FBQztLQUNyRDtJQUVELElBQUksTUFBTSxrQkFBUSxDQUFDLHFCQUFxQixDQUFDLEVBQUU7UUFDMUMsZUFBVSxDQUFDLHFCQUFxQixDQUFDLENBQUM7S0FDbEM7SUFDRCxJQUFJLE1BQU0sa0JBQVEsQ0FBQyw4QkFBOEIsQ0FBQyxFQUFFO1FBQ25ELE1BQU0sd0JBQWUsQ0FBQyw4QkFBOEIsRUFBRSxNQUFNLENBQUMsQ0FBQztLQUM5RDtJQUNELE1BQU0sQ0FBQyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUNsRCxDQUFDIn0=
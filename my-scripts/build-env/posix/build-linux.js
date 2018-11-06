"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const complex_1 = require("../childprocess/complex");
const constants_1 = require("../misc/constants");
const pathUtil_1 = require("../misc/pathUtil");
async function linuxBuild(output) {
    pathUtil_1.chdir(constants_1.VSCODE_ROOT);
    const result = path_1.resolve(constants_1.RELEASE_ROOT, 'VSCode-win32-x64');
    await complex_1.pipeCommandOut(output, 'gulp', 'vscode-win32-x64-min');
    await complex_1.pipeCommandOut(output, 'gulp', 'vscode-win32-x64-copy-inno-updater');
    await fs_extra_1.copy('my-scripts/staff/skel/.', result);
    return result;
}
exports.linuxBuild = linuxBuild;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQtbGludXguanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImJ1aWxkLWVudi9wb3NpeC9idWlsZC1saW51eC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHVDQUFnQztBQUNoQywrQkFBK0I7QUFDL0IscURBQXlEO0FBQ3pELGlEQUE4RDtBQUM5RCwrQ0FBeUM7QUFFbEMsS0FBSyxVQUFVLFVBQVUsQ0FBQyxNQUFxQjtJQUNyRCxnQkFBSyxDQUFDLHVCQUFXLENBQUMsQ0FBQztJQUNuQixNQUFNLE1BQU0sR0FBRyxjQUFPLENBQUMsd0JBQVksRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0lBRXpELE1BQU0sd0JBQWMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLHNCQUFzQixDQUFDLENBQUM7SUFDN0QsTUFBTSx3QkFBYyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsb0NBQW9DLENBQUMsQ0FBQztJQUUzRSxNQUFNLGVBQUksQ0FBQyx5QkFBeUIsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUU5QyxPQUFPLE1BQU0sQ0FBQztBQUNmLENBQUM7QUFWRCxnQ0FVQyJ9
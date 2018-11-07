"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const complex_1 = require("../../childprocess/complex");
const constants_1 = require("../../misc/constants");
const gulp_1 = require("../gulp");
async function windowsBuild(output) {
    await complex_1.pipeCommandOut(output, ...gulp_1.gulpCommands(), 'vscode-win32-x64-min');
    await complex_1.pipeCommandOut(output, ...gulp_1.gulpCommands(), 'vscode-win32-x64-copy-inno-updater');
    const compiledResult = path_1.resolve(constants_1.RELEASE_ROOT, 'VSCode-win32-x64');
    await fs_extra_1.copy('my-scripts/staff/skel/.', compiledResult);
    return compiledResult;
}
exports.windowsBuild = windowsBuild;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQtd2luZG93cy5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiYnVpbGQtZW52L2NvZGVibG9ja3MvYnVpbGQvYnVpbGQtd2luZG93cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHVDQUFnQztBQUNoQywrQkFBK0I7QUFDL0Isd0RBQTREO0FBQzVELG9EQUFvRDtBQUNwRCxrQ0FBdUM7QUFFaEMsS0FBSyxVQUFVLFlBQVksQ0FBQyxNQUEyQjtJQUM3RCxNQUFNLHdCQUFjLENBQUMsTUFBTSxFQUFFLEdBQUcsbUJBQVksRUFBRSxFQUFFLHNCQUFzQixDQUFDLENBQUM7SUFDeEUsTUFBTSx3QkFBYyxDQUFDLE1BQU0sRUFBRSxHQUFHLG1CQUFZLEVBQUUsRUFBRSxvQ0FBb0MsQ0FBQyxDQUFDO0lBRXRGLE1BQU0sY0FBYyxHQUFHLGNBQU8sQ0FBQyx3QkFBWSxFQUFFLGtCQUFrQixDQUFDLENBQUM7SUFDakUsTUFBTSxlQUFJLENBQUMseUJBQXlCLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFFdEQsT0FBTyxjQUFjLENBQUM7QUFDdkIsQ0FBQztBQVJELG9DQVFDIn0=
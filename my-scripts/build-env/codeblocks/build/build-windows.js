"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const complex_1 = require("../../childprocess/complex");
const constants_1 = require("../../misc/constants");
const gulp_1 = require("../gulp");
async function windowsBuild(output) {
    await complex_1.pipeCommandOut(output, 'node', ...gulp_1.gulpCommands(), 'vscode-win32-x64-min');
    await complex_1.pipeCommandOut(output, 'node', ...gulp_1.gulpCommands(), 'vscode-win32-x64-copy-inno-updater');
    const compiledResult = path_1.resolve(constants_1.RELEASE_ROOT, 'VSCode-win32-x64');
    await fs_extra_1.copy('my-scripts/staff/skel/.', compiledResult);
    return compiledResult;
}
exports.windowsBuild = windowsBuild;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQtd2luZG93cy5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiYnVpbGQtZW52L2NvZGVibG9ja3MvYnVpbGQvYnVpbGQtd2luZG93cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHVDQUFnQztBQUNoQywrQkFBK0I7QUFDL0Isd0RBQTREO0FBQzVELG9EQUF1RTtBQUN2RSxrQ0FBdUM7QUFFaEMsS0FBSyxVQUFVLFlBQVksQ0FBQyxNQUEyQjtJQUM3RCxNQUFNLHdCQUFjLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLG1CQUFZLEVBQUUsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO0lBQ2hGLE1BQU0sd0JBQWMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsbUJBQVksRUFBRSxFQUFFLG9DQUFvQyxDQUFDLENBQUM7SUFFOUYsTUFBTSxjQUFjLEdBQUcsY0FBTyxDQUFDLHdCQUFZLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztJQUNqRSxNQUFNLGVBQUksQ0FBQyx5QkFBeUIsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUV0RCxPQUFPLGNBQWMsQ0FBQztBQUN2QixDQUFDO0FBUkQsb0NBUUMifQ==
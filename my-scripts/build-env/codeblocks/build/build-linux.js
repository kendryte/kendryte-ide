"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const complex_1 = require("../../childprocess/complex");
const constants_1 = require("../../misc/constants");
const gulp_1 = require("../gulp");
async function linuxBuild(output) {
    await complex_1.pipeCommandOut(output, 'node', ...gulp_1.gulpCommands(), 'vscode-linux-x64-min');
    const compiledResult = path_1.resolve(constants_1.RELEASE_ROOT, 'VSCode-linux-x64');
    await fs_extra_1.copy('my-scripts/staff/skel/.', compiledResult);
    await fs_extra_1.copy('resources/linux/code.png', path_1.resolve(compiledResult, 'code.png'));
    return compiledResult;
}
exports.linuxBuild = linuxBuild;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQtbGludXguanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImJ1aWxkLWVudi9jb2RlYmxvY2tzL2J1aWxkL2J1aWxkLWxpbnV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsdUNBQWdDO0FBQ2hDLCtCQUErQjtBQUMvQix3REFBNEQ7QUFDNUQsb0RBQW9EO0FBQ3BELGtDQUF1QztBQUVoQyxLQUFLLFVBQVUsVUFBVSxDQUFDLE1BQTJCO0lBQzNELE1BQU0sd0JBQWMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsbUJBQVksRUFBRSxFQUFFLHNCQUFzQixDQUFDLENBQUM7SUFFaEYsTUFBTSxjQUFjLEdBQUcsY0FBTyxDQUFDLHdCQUFZLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztJQUNqRSxNQUFNLGVBQUksQ0FBQyx5QkFBeUIsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUN0RCxNQUFNLGVBQUksQ0FBQywwQkFBMEIsRUFBRSxjQUFPLENBQUMsY0FBYyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFFNUUsT0FBTyxjQUFjLENBQUM7QUFDdkIsQ0FBQztBQVJELGdDQVFDIn0=
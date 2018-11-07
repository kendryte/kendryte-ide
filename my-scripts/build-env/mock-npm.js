"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = require("path");
const error_1 = require("./childprocess/error");
const constants_1 = require("./misc/constants");
const args = process.argv.slice(2);
if (!process.env.hasOwnProperty('GIT_PARAMS') && args[0] !== 'run') {
    throw new Error('This is mocked npm, only used for husky git hooks, please use yarn instead.');
}
let r;
if (constants_1.isWin) {
    r = child_process_1.spawnSync('powershell.exe', [path_1.resolve(process.env.PRIVATE_BINS, 'yarn.ps1'), ...args], {
        stdio: 'inherit',
    });
}
else {
    r = child_process_1.spawnSync('sh', [path_1.resolve(process.env.PRIVATE_BINS, 'yarn'), ...args], {
        stdio: 'inherit',
    });
}
if (r.error) {
    throw r.error;
}
error_1.ThrowStatusCodeError(r.status, r.signal, ['npm (mock script)', args, process.cwd()]);
console.error('npm return with %s', r.status);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9jay1ucG0uanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImJ1aWxkLWVudi9tb2NrLW5wbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlEQUE0RDtBQUM1RCwrQkFBK0I7QUFDL0IsZ0RBQTREO0FBQzVELGdEQUF5QztBQUV6QyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUVuQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssRUFBRTtJQUNuRSxNQUFNLElBQUksS0FBSyxDQUFDLDZFQUE2RSxDQUFDLENBQUM7Q0FDL0Y7QUFFRCxJQUFJLENBQTJCLENBQUM7QUFDaEMsSUFBSSxpQkFBSyxFQUFFO0lBQ1YsQ0FBQyxHQUFHLHlCQUFTLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxjQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRTtRQUN6RixLQUFLLEVBQUUsU0FBUztLQUNoQixDQUFDLENBQUM7Q0FDSDtLQUFNO0lBQ04sQ0FBQyxHQUFHLHlCQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsY0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUU7UUFDekUsS0FBSyxFQUFFLFNBQVM7S0FDaEIsQ0FBQyxDQUFDO0NBQ0g7QUFFRCxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUU7SUFDWixNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUM7Q0FDZDtBQUNELDRCQUFvQixDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLG1CQUFtQixFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBRXJGLE9BQU8sQ0FBQyxLQUFLLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDIn0=
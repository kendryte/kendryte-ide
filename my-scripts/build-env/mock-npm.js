"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const constants_1 = require("./misc/constants");
const args = process.argv.slice(2);
if (!process.env.GIT_PARAMS && args[0] !== 'run') {
    throw new Error('This is mocked npm, only used for husky git hooks, please use yarn instead.');
}
if (constants_1.isWin) {
    child_process_1.spawnSync('powershell.exe', [process.env.YARN_PS, ...args], {
        stdio: 'inherit',
    });
}
else {
    child_process_1.spawnSync('sh', [process.env.YARN_SH, ...args], {
        stdio: 'inherit',
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9jay1ucG0uanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImJ1aWxkLWVudi9tb2NrLW5wbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlEQUEwQztBQUMxQyxnREFBeUM7QUFFekMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFFbkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLEVBQUU7SUFDakQsTUFBTSxJQUFJLEtBQUssQ0FBQyw2RUFBNkUsQ0FBQyxDQUFDO0NBQy9GO0FBRUQsSUFBSSxpQkFBSyxFQUFFO0lBQ1YseUJBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUU7UUFDM0QsS0FBSyxFQUFFLFNBQVM7S0FDaEIsQ0FBQyxDQUFDO0NBQ0g7S0FBTTtJQUNOLHlCQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRTtRQUMvQyxLQUFLLEVBQUUsU0FBUztLQUNoQixDQUFDLENBQUM7Q0FDSCJ9
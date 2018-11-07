"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../misc/constants");
const error_1 = require("./error");
function parseCommand(cmd, args) {
    if (constants_1.isWin) {
        return ['powershell.exe', ['-Command', cmd, ...args]];
    }
    else {
        return [cmd, args];
    }
}
exports.parseCommand = parseCommand;
function processPromise(cp, cmd) {
    return new Promise((resolve, reject) => {
        const cwd = process.cwd();
        cp.once('error', reject);
        cp.once('exit', (code, signal) => {
            const e = error_1.StatusCodeError(code, signal, [cmd[0], cmd[1], cwd]);
            if (e) {
                reject(e);
            }
            else {
                resolve();
            }
        });
    });
}
exports.processPromise = processPromise;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFuZGxlcnMuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImJ1aWxkLWVudi9jaGlsZHByb2Nlc3MvaGFuZGxlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxpREFBMEM7QUFDMUMsbUNBQTBDO0FBTTFDLFNBQWdCLFlBQVksQ0FBQyxHQUFXLEVBQUUsSUFBYztJQUN2RCxJQUFJLGlCQUFLLEVBQUU7UUFDVixPQUFPLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxVQUFVLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztLQUN0RDtTQUFNO1FBQ04sT0FBTyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztLQUNuQjtBQUNGLENBQUM7QUFORCxvQ0FNQztBQUVELFNBQWdCLGNBQWMsQ0FBQyxFQUFnQixFQUFFLEdBQW9CO0lBQ3BFLE9BQU8sSUFBSSxPQUFPLENBQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDNUMsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzFCLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3pCLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBWSxFQUFFLE1BQWMsRUFBRSxFQUFFO1lBQ2hELE1BQU0sQ0FBQyxHQUFHLHVCQUFlLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvRCxJQUFJLENBQUMsRUFBRTtnQkFDTixNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDVjtpQkFBTTtnQkFDTixPQUFPLEVBQUUsQ0FBQzthQUNWO1FBQ0YsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztBQUNKLENBQUM7QUFiRCx3Q0FhQyJ9
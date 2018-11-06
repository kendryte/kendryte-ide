"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../misc/constants");
const error_1 = require("./error");
/* No use any node_modules deps */
function parseCommand(cmd, args) {
    if (constants_1.isWin) {
        return ['powershell.exe', ['-Command', cmd, ...args]];
    }
    else {
        return [cmd, args];
    }
}
exports.parseCommand = parseCommand;
function processPromise(cp) {
    return new Promise((resolve, reject) => {
        cp.once('error', reject);
        cp.once('exit', (code, signal) => {
            const e = error_1.StatusCodeError(code, signal);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFuZGxlcnMuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImJ1aWxkLWVudi9jaGlsZHByb2Nlc3MvaGFuZGxlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxpREFBMEM7QUFDMUMsbUNBQTBDO0FBRTFDLGtDQUFrQztBQUVsQyxTQUFnQixZQUFZLENBQUMsR0FBVyxFQUFFLElBQWM7SUFDdkQsSUFBSSxpQkFBSyxFQUFFO1FBQ1YsT0FBTyxDQUFDLGdCQUFnQixFQUFFLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDdEQ7U0FBTTtRQUNOLE9BQU8sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDbkI7QUFDRixDQUFDO0FBTkQsb0NBTUM7QUFFRCxTQUFnQixjQUFjLENBQUMsRUFBZ0I7SUFDOUMsT0FBTyxJQUFJLE9BQU8sQ0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUM1QyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN6QixFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQVksRUFBRSxNQUFjLEVBQUUsRUFBRTtZQUNoRCxNQUFNLENBQUMsR0FBRyx1QkFBZSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztZQUN4QyxJQUFJLENBQUMsRUFBRTtnQkFDTixNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDVjtpQkFBTTtnQkFDTixPQUFPLEVBQUUsQ0FBQzthQUNWO1FBQ0YsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztBQUNKLENBQUM7QUFaRCx3Q0FZQyJ9
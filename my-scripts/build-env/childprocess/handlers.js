"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../misc/constants");
const error_1 = require("./error");
function parseCommand(cmd, args) {
    if (!args) {
        args = [];
    }
    if (cmd === 'powershell.exe') {
        return [cmd, args];
    }
    if (constants_1.isWin) {
        return ['powershell.exe', ['-Command', cmd, ...args]];
    }
    else {
        return [cmd, args];
    }
}
exports.parseCommand = parseCommand;
function processPromise(cp, cmd, options) {
    return new Promise((resolve, reject) => {
        const cwd = (options && options.cwd) ? options.cwd : process.cwd();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFuZGxlcnMuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImJ1aWxkLWVudi9jaGlsZHByb2Nlc3MvaGFuZGxlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxpREFBMEM7QUFDMUMsbUNBQTBDO0FBTTFDLFNBQWdCLFlBQVksQ0FBQyxHQUFXLEVBQUUsSUFBMkI7SUFDcEUsSUFBSSxDQUFDLElBQUksRUFBRTtRQUNWLElBQUksR0FBRyxFQUFFLENBQUM7S0FDVjtJQUNELElBQUksR0FBRyxLQUFLLGdCQUFnQixFQUFFO1FBQzdCLE9BQU8sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDbkI7SUFDRCxJQUFJLGlCQUFLLEVBQUU7UUFDVixPQUFPLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxVQUFVLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztLQUN0RDtTQUFNO1FBQ04sT0FBTyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztLQUNuQjtBQUNGLENBQUM7QUFaRCxvQ0FZQztBQUVELFNBQWdCLGNBQWMsQ0FBQyxFQUFnQixFQUFFLEdBQW9CLEVBQUUsT0FBc0I7SUFDNUYsT0FBTyxJQUFJLE9BQU8sQ0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUM1QyxNQUFNLEdBQUcsR0FBRyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNsRSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN6QixFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQVksRUFBRSxNQUFjLEVBQUUsRUFBRTtZQUNoRCxNQUFNLENBQUMsR0FBRyx1QkFBZSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDL0QsSUFBSSxDQUFDLEVBQUU7Z0JBQ04sTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ1Y7aUJBQU07Z0JBQ04sT0FBTyxFQUFFLENBQUM7YUFDVjtRQUNGLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDO0FBYkQsd0NBYUMifQ==
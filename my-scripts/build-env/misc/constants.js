"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
/* No use any node_modules deps */
if (!process.env.RELEASE_ROOT) {
    console.error('Command Failed:\n\tPlease run start.ps1 first.');
    process.exit(1);
}
exports.VSCODE_ROOT = requireEnvPath('VSCODE_ROOT');
exports.RELEASE_ROOT = requireEnvPath('RELEASE_ROOT');
exports.isWin = os_1.platform() === 'win32';
function nativePath(p) {
    return p.replace(/^\/cygdrive\/([a-z])/i, (m0, drv) => {
        return drv.toUpperCase() + ':';
    });
}
exports.nativePath = nativePath;
function requireEnvPath(name) {
    if (!process.env[name]) {
        throw new Error('Env ' + name + ' not set');
    }
    return nativePath(process.env[name]);
}
exports.requireEnvPath = requireEnvPath;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvbWlzYy9jb25zdGFudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQkFBOEI7QUFDOUIsa0NBQWtDO0FBRWxDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRTtJQUM5QixPQUFPLENBQUMsS0FBSyxDQUFDLGdEQUFnRCxDQUFDLENBQUM7SUFDaEUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNoQjtBQUVZLFFBQUEsV0FBVyxHQUFHLGNBQWMsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUM1QyxRQUFBLFlBQVksR0FBRyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDOUMsUUFBQSxLQUFLLEdBQUcsYUFBUSxFQUFFLEtBQUssT0FBTyxDQUFDO0FBRTVDLFNBQWdCLFVBQVUsQ0FBQyxDQUFTO0lBQ25DLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUNyRCxPQUFPLEdBQUcsQ0FBQyxXQUFXLEVBQUUsR0FBRyxHQUFHLENBQUM7SUFDaEMsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDO0FBSkQsZ0NBSUM7QUFFRCxTQUFnQixjQUFjLENBQUMsSUFBWTtJQUMxQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUN2QixNQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLEdBQUcsVUFBVSxDQUFDLENBQUM7S0FDNUM7SUFDRCxPQUFPLFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDdEMsQ0FBQztBQUxELHdDQUtDIn0=
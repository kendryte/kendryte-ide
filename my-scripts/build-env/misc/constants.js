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
exports.isMac = os_1.platform() === 'darwin';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvbWlzYy9jb25zdGFudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQkFBOEI7QUFDOUIsa0NBQWtDO0FBRWxDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRTtJQUM5QixPQUFPLENBQUMsS0FBSyxDQUFDLGdEQUFnRCxDQUFDLENBQUM7SUFDaEUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNoQjtBQUVZLFFBQUEsV0FBVyxHQUFHLGNBQWMsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUM1QyxRQUFBLFlBQVksR0FBRyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDOUMsUUFBQSxLQUFLLEdBQUcsYUFBUSxFQUFFLEtBQUssT0FBTyxDQUFDO0FBQy9CLFFBQUEsS0FBSyxHQUFHLGFBQVEsRUFBRSxLQUFLLFFBQVEsQ0FBQztBQUU3QyxTQUFnQixVQUFVLENBQUMsQ0FBUztJQUNuQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFDckQsT0FBTyxHQUFHLENBQUMsV0FBVyxFQUFFLEdBQUcsR0FBRyxDQUFDO0lBQ2hDLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUpELGdDQUlDO0FBRUQsU0FBZ0IsY0FBYyxDQUFDLElBQVk7SUFDMUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDdkIsTUFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxHQUFHLFVBQVUsQ0FBQyxDQUFDO0tBQzVDO0lBQ0QsT0FBTyxVQUFVLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3RDLENBQUM7QUFMRCx3Q0FLQyJ9
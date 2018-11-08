"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const complex_1 = require("../childprocess/complex");
const constants_1 = require("../misc/constants");
const pathUtil_1 = require("../misc/pathUtil");
const gulp_1 = require("./gulp");
function showElectronNoticeInChina() {
    console.error('Electron not install. will install now. The download is single thread, and not able to resume.');
    console.error('  So, if your download is toooooo slow:');
    console.error('     1. see what is downloading below');
    console.error('     2. stop this program by ctrl+c');
    console.error('     3. find these files from https://github.com/electron/electron/releases');
    console.error('                           or https://npm.taobao.org/mirrors/electron/');
    console.error('     4. place them at %s', path_1.resolve(constants_1.requireEnvPath('TEMP'), 'gulp-electron-cache/atom/electron/'));
    console.error('');
}
exports.showElectronNoticeInChina = showElectronNoticeInChina;
// node build/lib/electron.js || ./node_modules/.bin/gulp electron
function getElectronIfNot() {
    pathUtil_1.chdir(constants_1.VSCODE_ROOT);
    return complex_1.muteCommandOut('node', 'build/lib/electron.js').catch(() => {
        showElectronNoticeInChina();
        return complex_1.pipeCommandOut(process.stderr, 'node', ...gulp_1.gulpCommands(), 'electron');
    }).then(() => {
        console.log('Electron has installed.');
    }, (e) => {
        console.error(e.stack);
        throw new Error('cannot install Electron.');
    });
}
exports.getElectronIfNot = getElectronIfNot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0RWxlY3Ryb24uanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImJ1aWxkLWVudi9jb2RlYmxvY2tzL2dldEVsZWN0cm9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQStCO0FBQy9CLHFEQUF5RTtBQUN6RSxpREFBZ0U7QUFDaEUsK0NBQXlDO0FBQ3pDLGlDQUFzQztBQUV0QyxTQUFnQix5QkFBeUI7SUFDeEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxnR0FBZ0csQ0FBQyxDQUFDO0lBQ2hILE9BQU8sQ0FBQyxLQUFLLENBQUMseUNBQXlDLENBQUMsQ0FBQztJQUN6RCxPQUFPLENBQUMsS0FBSyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7SUFDdkQsT0FBTyxDQUFDLEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO0lBQ3JELE9BQU8sQ0FBQyxLQUFLLENBQUMsNkVBQTZFLENBQUMsQ0FBQztJQUM3RixPQUFPLENBQUMsS0FBSyxDQUFDLHdFQUF3RSxDQUFDLENBQUM7SUFDeEYsT0FBTyxDQUFDLEtBQUssQ0FBQywwQkFBMEIsRUFBRSxjQUFPLENBQUMsMEJBQWMsQ0FBQyxNQUFNLENBQUMsRUFBRSxvQ0FBb0MsQ0FBQyxDQUFDLENBQUM7SUFDakgsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNuQixDQUFDO0FBVEQsOERBU0M7QUFFRCxrRUFBa0U7QUFDbEUsU0FBZ0IsZ0JBQWdCO0lBQy9CLGdCQUFLLENBQUMsdUJBQVcsQ0FBQyxDQUFDO0lBQ25CLE9BQU8sd0JBQWMsQ0FBQyxNQUFNLEVBQUUsdUJBQXVCLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFO1FBQ2pFLHlCQUF5QixFQUFFLENBQUM7UUFDNUIsT0FBTyx3QkFBYyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsbUJBQVksRUFBRSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQzlFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7UUFDWixPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUM7SUFDeEMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUU7UUFDUixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2QixNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUM7SUFDN0MsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDO0FBWEQsNENBV0MifQ==
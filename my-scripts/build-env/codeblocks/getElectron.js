"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const complex_1 = require("../childprocess/complex");
const constants_1 = require("../misc/constants");
// node build/lib/electron.js || ./node_modules/.bin/gulp electron
function getElectronIfNot() {
    return complex_1.muteCommandOut('node', 'build/lib/electron.js').catch(() => {
        console.error('Electron not install. will install now. The download is single thread, and not able to resume.');
        console.error('  So, if your download is toooooo slow:');
        console.error('     1. see what is downloading below');
        console.error('     2. stop this program by ctrl+c');
        console.error('     3. find these files from https://github.com/electron/electron/releases');
        console.error('                           or https://npm.taobao.org/mirrors/electron/');
        console.error('     4. place them at %s', path_1.resolve(constants_1.requireEnvPath('TEMP'), 'gulp-electron-cache/atom/electron/'));
        console.error('');
        return complex_1.pipeCommandOut(process.stderr, 'node', './node_modules/gulp/bin/gulp.js', 'electron');
    }).then(() => {
        console.log('Electron has installed.');
    }, (e) => {
        console.error(e.stack);
        throw new Error('cannot install Electron.');
    });
}
exports.getElectronIfNot = getElectronIfNot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0RWxlY3Ryb24uanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImJ1aWxkLWVudi9jb2RlYmxvY2tzL2dldEVsZWN0cm9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQStCO0FBQy9CLHFEQUF5RTtBQUN6RSxpREFBbUQ7QUFFbkQsa0VBQWtFO0FBQ2xFLFNBQWdCLGdCQUFnQjtJQUMvQixPQUFPLHdCQUFjLENBQUMsTUFBTSxFQUFFLHVCQUF1QixDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRTtRQUNqRSxPQUFPLENBQUMsS0FBSyxDQUFDLGdHQUFnRyxDQUFDLENBQUM7UUFDaEgsT0FBTyxDQUFDLEtBQUssQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO1FBQ3pELE9BQU8sQ0FBQyxLQUFLLENBQUMsdUNBQXVDLENBQUMsQ0FBQztRQUN2RCxPQUFPLENBQUMsS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7UUFDckQsT0FBTyxDQUFDLEtBQUssQ0FBQyw2RUFBNkUsQ0FBQyxDQUFDO1FBQzdGLE9BQU8sQ0FBQyxLQUFLLENBQUMsd0VBQXdFLENBQUMsQ0FBQztRQUN4RixPQUFPLENBQUMsS0FBSyxDQUFDLDBCQUEwQixFQUFFLGNBQU8sQ0FBQywwQkFBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFLG9DQUFvQyxDQUFDLENBQUMsQ0FBQztRQUNqSCxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2xCLE9BQU8sd0JBQWMsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxpQ0FBaUMsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUM5RixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO1FBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQ3hDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO1FBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkIsTUFBTSxJQUFJLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBQzdDLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQWpCRCw0Q0FpQkMifQ==
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stillalive_1 = require("@gongt/stillalive");
const complex_1 = require("../build-env/childprocess/complex");
const getElectron_1 = require("../build-env/codeblocks/getElectron");
const gulp_1 = require("../build-env/codeblocks/gulp");
const switchQuitKey_1 = require("../build-env/codeblocks/switchQuitKey");
const clsUtil_1 = require("../build-env/misc/clsUtil");
const fsUtil_1 = require("../build-env/misc/fsUtil");
const myBuildSystem_1 = require("../build-env/misc/myBuildSystem");
const streamUtil_1 = require("../build-env/misc/streamUtil");
myBuildSystem_1.whatIsThis(__filename, 'start local debug IDE, require prepare-development first.');
myBuildSystem_1.runMain(async () => {
    process.env.FORCE_COLOR = 'yes'; // ensure typescript output has colors
    await getElectron_1.getElectronIfNot();
    switchQuitKey_1.switchQuitKey();
    let skipped = false;
    if (process.argv.includes('--slow') || !await fsUtil_1.isExists('extensions/css-language-features/client/out')) {
        const stream = stillalive_1.startWorking();
        stream.write('starting compile extensions...');
        await complex_1.pipeCommandOut(stream, 'node', ...gulp_1.gulpCommands(), 'compile-extensions');
        stream.success('extensions compiled');
        stream.end();
    }
    else {
        skipped = true;
    }
    let streamToDisplay = process.stdout;
    if (process.stdout.isTTY) {
        streamToDisplay = new streamUtil_1.TypescriptCompileOutputStream();
        streamToDisplay.pipe(clsUtil_1.getCleanableStdout());
        clsUtil_1.cleanScreen();
    }
    if (skipped) {
        console.error('\x1B[38;5;14mExtensions Recompile Skipped, add \'--slow\' to force do it!\x1B[0m');
    }
    console.error('starting: gulp watch-client');
    await complex_1.pipeCommandOut(streamToDisplay, 'node', ...gulp_1.gulpCommands(), 'watch-client');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhcnQtd2F0Y2guanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImNvbW1hbmRzL3N0YXJ0LXdhdGNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsa0RBQWlEO0FBQ2pELCtEQUFtRTtBQUNuRSxxRUFBdUU7QUFDdkUsdURBQTREO0FBQzVELHlFQUFzRTtBQUN0RSx1REFBNEU7QUFDNUUscURBQW9EO0FBQ3BELG1FQUFzRTtBQUN0RSw2REFBNkU7QUFFN0UsMEJBQVUsQ0FBQyxVQUFVLEVBQUUsMkRBQTJELENBQUMsQ0FBQztBQUVwRix1QkFBTyxDQUFDLEtBQUssSUFBSSxFQUFFO0lBQ2xCLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQyxDQUFDLHNDQUFzQztJQUN2RSxNQUFNLDhCQUFnQixFQUFFLENBQUM7SUFFekIsNkJBQWEsRUFBRSxDQUFDO0lBRWhCLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQztJQUNwQixJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxpQkFBUSxDQUFDLDZDQUE2QyxDQUFDLEVBQUU7UUFDdEcsTUFBTSxNQUFNLEdBQUcseUJBQVksRUFBRSxDQUFDO1FBQzlCLE1BQU0sQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztRQUMvQyxNQUFNLHdCQUFjLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLG1CQUFZLEVBQUUsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBQzlFLE1BQU0sQ0FBQyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUN0QyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7S0FDYjtTQUFNO1FBQ04sT0FBTyxHQUFHLElBQUksQ0FBQztLQUNmO0lBRUQsSUFBSSxlQUFlLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztJQUNyQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFO1FBQ3pCLGVBQWUsR0FBRyxJQUFJLDBDQUE2QixFQUFFLENBQUM7UUFDdEQsZUFBZSxDQUFDLElBQUksQ0FBQyw0QkFBa0IsRUFBRSxDQUFDLENBQUM7UUFDM0MscUJBQVcsRUFBRSxDQUFDO0tBQ2Q7SUFFRCxJQUFJLE9BQU8sRUFBRTtRQUNaLE9BQU8sQ0FBQyxLQUFLLENBQUMsa0ZBQWtGLENBQUMsQ0FBQztLQUNsRztJQUVELE9BQU8sQ0FBQyxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztJQUM3QyxNQUFNLHdCQUFjLENBQUMsZUFBZSxFQUFFLE1BQU0sRUFBRSxHQUFHLG1CQUFZLEVBQUUsRUFBRSxjQUFjLENBQUMsQ0FBQztBQUNsRixDQUFDLENBQUMsQ0FBQyJ9
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stillalive_1 = require("@gongt/stillalive");
const complex_1 = require("../build-env/childprocess/complex");
const getElectron_1 = require("../build-env/codeblocks/getElectron");
const switchQuitKey_1 = require("../build-env/codeblocks/switchQuitKey");
const clsUtil_1 = require("../build-env/misc/clsUtil");
const constants_1 = require("../build-env/misc/constants");
const fsUtil_1 = require("../build-env/misc/fsUtil");
const myBuildSystem_1 = require("../build-env/misc/myBuildSystem");
const pathUtil_1 = require("../build-env/misc/pathUtil");
const streamUtil_1 = require("../build-env/misc/streamUtil");
myBuildSystem_1.runMain(async () => {
    await getElectron_1.getElectronIfNot();
    switchQuitKey_1.switchQuitKey();
    process.env.FORCE_COLOR = 'yes'; // ensure typescript output has colors
    pathUtil_1.chdir(constants_1.VSCODE_ROOT);
    let skipped = false;
    if (process.argv.includes('--slow') || !await fsUtil_1.isExists('extensions/css-language-features/client/out')) {
        const stream = stillalive_1.startWorking();
        stream.write('starting compile extensions...');
        await complex_1.pipeCommandOut(stream, 'gulp', 'compile-extensions');
        stream.success('extensions compiled');
        stream.end();
    }
    else {
        skipped = true;
    }
    let streamToDisplay = clsUtil_1.getCleanableStdout();
    if (process.stderr.isTTY) {
        const outputParser = new streamUtil_1.TypescriptCompileOutputStream();
        outputParser.pipe(streamToDisplay);
        streamToDisplay = outputParser;
    }
    clsUtil_1.cleanScreen();
    if (skipped) {
        console.error('\x1B[38;5;14mExtensions Recompile Skipped, add \'--slow\' to force do it!\x1B[0m');
    }
    console.error('starting: gulp watch-client');
    await complex_1.pipeCommandOut(streamToDisplay, 'node', '--max-old-space-size=4096', './node_modules/gulp/bin/gulp.js', '--', 'watch-client');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhcnQtd2F0Y2guanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImNvbW1hbmRzL3N0YXJ0LXdhdGNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsa0RBQWlEO0FBQ2pELCtEQUFtRTtBQUNuRSxxRUFBdUU7QUFDdkUseUVBQXNFO0FBQ3RFLHVEQUE0RTtBQUM1RSwyREFBMEQ7QUFDMUQscURBQW9EO0FBQ3BELG1FQUEwRDtBQUMxRCx5REFBbUQ7QUFDbkQsNkRBQTZFO0FBRTdFLHVCQUFPLENBQUMsS0FBSyxJQUFJLEVBQUU7SUFDbEIsTUFBTSw4QkFBZ0IsRUFBRSxDQUFDO0lBRXpCLDZCQUFhLEVBQUUsQ0FBQztJQUVoQixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsQ0FBQyxzQ0FBc0M7SUFFdkUsZ0JBQUssQ0FBQyx1QkFBVyxDQUFDLENBQUM7SUFDbkIsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO0lBQ3BCLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLGlCQUFRLENBQUMsNkNBQTZDLENBQUMsRUFBRTtRQUN0RyxNQUFNLE1BQU0sR0FBRyx5QkFBWSxFQUFFLENBQUM7UUFDOUIsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO1FBQy9DLE1BQU0sd0JBQWMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLG9CQUFvQixDQUFDLENBQUM7UUFDM0QsTUFBTSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ3RDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztLQUNiO1NBQU07UUFDTixPQUFPLEdBQUcsSUFBSSxDQUFDO0tBQ2Y7SUFFRCxJQUFJLGVBQWUsR0FBRyw0QkFBa0IsRUFBRSxDQUFDO0lBQzNDLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUU7UUFDekIsTUFBTSxZQUFZLEdBQUcsSUFBSSwwQ0FBNkIsRUFBRSxDQUFDO1FBQ3pELFlBQVksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7UUFFbkMsZUFBZSxHQUFHLFlBQVksQ0FBQztLQUMvQjtJQUVELHFCQUFXLEVBQUUsQ0FBQztJQUNkLElBQUksT0FBTyxFQUFFO1FBQ1osT0FBTyxDQUFDLEtBQUssQ0FBQyxrRkFBa0YsQ0FBQyxDQUFDO0tBQ2xHO0lBQ0QsT0FBTyxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0lBQzdDLE1BQU0sd0JBQWMsQ0FBQyxlQUFlLEVBQUUsTUFBTSxFQUFFLDJCQUEyQixFQUFFLGlDQUFpQyxFQUFFLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztBQUNySSxDQUFDLENBQUMsQ0FBQyJ9
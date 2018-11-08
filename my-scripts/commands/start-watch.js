"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stillalive_1 = require("@gongt/stillalive");
const complex_1 = require("../build-env/childprocess/complex");
const getElectron_1 = require("../build-env/codeblocks/getElectron");
const gulp_1 = require("../build-env/codeblocks/gulp");
const switchQuitKey_1 = require("../build-env/codeblocks/switchQuitKey");
const clsUtil_1 = require("../build-env/misc/clsUtil");
const fsUtil_1 = require("../build-env/misc/fsUtil");
const help_1 = require("../build-env/misc/help");
const myBuildSystem_1 = require("../build-env/misc/myBuildSystem");
const streamUtil_1 = require("../build-env/misc/streamUtil");
help_1.whatIsThis(__filename, 'start local debug IDE, require prepare-development first.');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhcnQtd2F0Y2guanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImNvbW1hbmRzL3N0YXJ0LXdhdGNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsa0RBQWlEO0FBQ2pELCtEQUFtRTtBQUNuRSxxRUFBdUU7QUFDdkUsdURBQTREO0FBQzVELHlFQUFzRTtBQUN0RSx1REFBNEU7QUFDNUUscURBQW9EO0FBQ3BELGlEQUFvRDtBQUNwRCxtRUFBMEQ7QUFDMUQsNkRBQTZFO0FBRTdFLGlCQUFVLENBQUMsVUFBVSxFQUFFLDJEQUEyRCxDQUFDLENBQUM7QUFFcEYsdUJBQU8sQ0FBQyxLQUFLLElBQUksRUFBRTtJQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsQ0FBQyxzQ0FBc0M7SUFDdkUsTUFBTSw4QkFBZ0IsRUFBRSxDQUFDO0lBRXpCLDZCQUFhLEVBQUUsQ0FBQztJQUVoQixJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7SUFDcEIsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0saUJBQVEsQ0FBQyw2Q0FBNkMsQ0FBQyxFQUFFO1FBQ3RHLE1BQU0sTUFBTSxHQUFHLHlCQUFZLEVBQUUsQ0FBQztRQUM5QixNQUFNLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7UUFDL0MsTUFBTSx3QkFBYyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxtQkFBWSxFQUFFLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztRQUM5RSxNQUFNLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDdEMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO0tBQ2I7U0FBTTtRQUNOLE9BQU8sR0FBRyxJQUFJLENBQUM7S0FDZjtJQUVELElBQUksZUFBZSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7SUFDckMsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRTtRQUN6QixlQUFlLEdBQUcsSUFBSSwwQ0FBNkIsRUFBRSxDQUFDO1FBQ3RELGVBQWUsQ0FBQyxJQUFJLENBQUMsNEJBQWtCLEVBQUUsQ0FBQyxDQUFDO1FBQzNDLHFCQUFXLEVBQUUsQ0FBQztLQUNkO0lBRUQsSUFBSSxPQUFPLEVBQUU7UUFDWixPQUFPLENBQUMsS0FBSyxDQUFDLGtGQUFrRixDQUFDLENBQUM7S0FDbEc7SUFFRCxPQUFPLENBQUMsS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7SUFDN0MsTUFBTSx3QkFBYyxDQUFDLGVBQWUsRUFBRSxNQUFNLEVBQUUsR0FBRyxtQkFBWSxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFDbEYsQ0FBQyxDQUFDLENBQUMifQ==
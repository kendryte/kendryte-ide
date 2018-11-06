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
myBuildSystem_1.whatIsThis(__filename, 'start local debug IDE, require prepare-development first.');
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
    await complex_1.pipeCommandOut(streamToDisplay, 'node', '--max-old-space-size=4096', './node_modules/gulp/bin/gulp.js', '--', 'watch-client');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhcnQtd2F0Y2guanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImNvbW1hbmRzL3N0YXJ0LXdhdGNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsa0RBQWlEO0FBQ2pELCtEQUFtRTtBQUNuRSxxRUFBdUU7QUFDdkUseUVBQXNFO0FBQ3RFLHVEQUE0RTtBQUM1RSwyREFBMEQ7QUFDMUQscURBQW9EO0FBQ3BELG1FQUFzRTtBQUN0RSx5REFBbUQ7QUFDbkQsNkRBQTZFO0FBRTdFLDBCQUFVLENBQUMsVUFBVSxFQUFFLDJEQUEyRCxDQUFDLENBQUM7QUFFcEYsdUJBQU8sQ0FBQyxLQUFLLElBQUksRUFBRTtJQUNsQixNQUFNLDhCQUFnQixFQUFFLENBQUM7SUFFekIsNkJBQWEsRUFBRSxDQUFDO0lBRWhCLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQyxDQUFDLHNDQUFzQztJQUV2RSxnQkFBSyxDQUFDLHVCQUFXLENBQUMsQ0FBQztJQUNuQixJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7SUFDcEIsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0saUJBQVEsQ0FBQyw2Q0FBNkMsQ0FBQyxFQUFFO1FBQ3RHLE1BQU0sTUFBTSxHQUFHLHlCQUFZLEVBQUUsQ0FBQztRQUM5QixNQUFNLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7UUFDL0MsTUFBTSx3QkFBYyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztRQUMzRCxNQUFNLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDdEMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO0tBQ2I7U0FBTTtRQUNOLE9BQU8sR0FBRyxJQUFJLENBQUM7S0FDZjtJQUVELElBQUksZUFBZSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7SUFDckMsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRTtRQUN6QixlQUFlLEdBQUcsSUFBSSwwQ0FBNkIsRUFBRSxDQUFDO1FBQ3RELGVBQWUsQ0FBQyxJQUFJLENBQUMsNEJBQWtCLEVBQUUsQ0FBQyxDQUFDO1FBQzNDLHFCQUFXLEVBQUUsQ0FBQztLQUNkO0lBRUQsSUFBSSxPQUFPLEVBQUU7UUFDWixPQUFPLENBQUMsS0FBSyxDQUFDLGtGQUFrRixDQUFDLENBQUM7S0FDbEc7SUFFRCxPQUFPLENBQUMsS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7SUFDN0MsTUFBTSx3QkFBYyxDQUFDLGVBQWUsRUFBRSxNQUFNLEVBQUUsMkJBQTJCLEVBQUUsaUNBQWlDLEVBQUUsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBQ3JJLENBQUMsQ0FBQyxDQUFDIn0=
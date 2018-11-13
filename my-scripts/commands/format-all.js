"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const stream_1 = require("stream");
const complex_1 = require("../build-env/childprocess/complex");
const gulp_1 = require("../build-env/codeblocks/gulp");
const constants_1 = require("../build-env/misc/constants");
const help_1 = require("../build-env/misc/help");
const myBuildSystem_1 = require("../build-env/misc/myBuildSystem");
const pathUtil_1 = require("../build-env/misc/pathUtil");
const streamUtil_1 = require("../build-env/misc/streamUtil");
const timeUtil_1 = require("../build-env/misc/timeUtil");
const usePretty_1 = require("../build-env/misc/usePretty");
help_1.whatIsThis(__filename, 'format all source code and check any errors.');
const split2 = require('split2');
const fileNotFormat = /^File not formatted: (.+)$/;
const errReport = /^(src[\\/].+?)\(\d+,\d+\): /;
const violates = /^(src[\\/].+?):\d+:\d+:Imports violates/;
const isTs = /\.ts$/i;
const isCss = /\.css$/i;
myBuildSystem_1.runMain(async () => {
    process.stderr.write('\x1Bc\r');
    pathUtil_1.chdir(constants_1.VSCODE_ROOT);
    const output = usePretty_1.usePretty('format-all');
    output.success('running reformat on ALL source files, this will use about 1min. please wait.');
    output.write('waiting for \'yarn gulp hygiene\'');
    const notFormattedFiles = [];
    const notValidFiles = [];
    const processor = split2().on('data', (line) => {
        line = line.toString();
        if (fileNotFormat.test(line)) {
            notFormattedFiles.push(fileNotFormat.exec(line)[1].trim());
        }
        else if (errReport.test(line)) {
            notFormattedFiles.push(errReport.exec(line)[1].trim());
        }
        else if (violates.test(line)) {
            notValidFiles.push(violates.exec(line)[1].trim());
        }
    });
    const multiplex = new stream_1.PassThrough();
    const collector = new streamUtil_1.CollectingStream();
    multiplex.pipe(processor);
    multiplex.pipe(collector);
    multiplex.pipe(output, { end: false });
    multiplex.pipe(myBuildSystem_1.useWriteFileStream(path_1.resolve(constants_1.RELEASE_ROOT, 'hygiene.log')));
    await await complex_1.pipeCommandOut(multiplex, 'node', ...gulp_1.gulpCommands(), 'hygiene').then(() => {
        output.success('gulp hygiene exit successful');
    }, (e) => {
        output.fail(`gulp hygiene exit with failed status: ${e.status || ''}${e.signal || ''}`);
        notValidFiles.unshift('hygiene failed. this list may not complete. run yarn gulp hygiene too see full.');
    });
    if (notFormattedFiles.length) {
        output.success(`fixing ${notFormattedFiles.length} error....\n`);
        for (const file of notFormattedFiles) {
            output.write(file + '\n');
            if (isTs.test(file)) {
                await complex_1.getOutputCommand('tsfmt', '-r', file).catch(() => {
                    notValidFiles.push(file);
                });
            }
            else if (isCss.test(file)) {
                await complex_1.getOutputCommand('css-beautify', '-n', '-t', '-L', '-N', '--type', 'css', '-r', '-f', file).catch(() => {
                    notValidFiles.push(file);
                });
            }
            else {
                notValidFiles.push(file);
            }
        }
    }
    if (notValidFiles.length) {
        output.write('\n\n');
        output.nextLine();
        await timeUtil_1.timeout(500);
        console.error('\n' + collector.getOutput() + '\n');
        output.fail(notValidFiles.length + ' files must fix by hand.');
        for (const file of notValidFiles) {
            console.error(' x %s', file);
        }
        console.log('\n\n');
        throw new Error('auto fix fail.');
    }
    else {
        output.success(notFormattedFiles.length + ' files auto fix complete.');
    }
    console.error('Notice: you must run `yarn gulp hygiene` again...');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0LWFsbC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiY29tbWFuZHMvZm9ybWF0LWFsbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUErQjtBQUMvQixtQ0FBcUM7QUFDckMsK0RBQXFGO0FBRXJGLHVEQUE0RDtBQUM1RCwyREFBd0U7QUFDeEUsaURBQW9EO0FBQ3BELG1FQUE4RTtBQUM5RSx5REFBbUQ7QUFDbkQsNkRBQWdFO0FBQ2hFLHlEQUFxRDtBQUNyRCwyREFBd0Q7QUFFeEQsaUJBQVUsQ0FBQyxVQUFVLEVBQUUsOENBQThDLENBQUMsQ0FBQztBQUV2RSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFFakMsTUFBTSxhQUFhLEdBQUcsNEJBQTRCLENBQUM7QUFDbkQsTUFBTSxTQUFTLEdBQUcsNkJBQTZCLENBQUM7QUFDaEQsTUFBTSxRQUFRLEdBQUcseUNBQXlDLENBQUM7QUFDM0QsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDO0FBQ3RCLE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQztBQUV4Qix1QkFBTyxDQUFDLEtBQUssSUFBSSxFQUFFO0lBQ2xCLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2hDLGdCQUFLLENBQUMsdUJBQVcsQ0FBQyxDQUFDO0lBRW5CLE1BQU0sTUFBTSxHQUFHLHFCQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7SUFFdkMsTUFBTSxDQUFDLE9BQU8sQ0FBQyw4RUFBOEUsQ0FBQyxDQUFDO0lBQy9GLE1BQU0sQ0FBQyxLQUFLLENBQUMsbUNBQW1DLENBQUMsQ0FBQztJQUVsRCxNQUFNLGlCQUFpQixHQUFhLEVBQUUsQ0FBQztJQUN2QyxNQUFNLGFBQWEsR0FBYSxFQUFFLENBQUM7SUFDbkMsTUFBTSxTQUFTLEdBQUcsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFO1FB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
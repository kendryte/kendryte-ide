"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const stream_1 = require("stream");
const complex_1 = require("../build-env/childprocess/complex");
const constants_1 = require("../build-env/misc/constants");
const myBuildSystem_1 = require("../build-env/misc/myBuildSystem");
const pathUtil_1 = require("../build-env/misc/pathUtil");
const streamUtil_1 = require("../build-env/misc/streamUtil");
const timeUtil_1 = require("../build-env/misc/timeUtil");
const split2 = require('split2');
const fileNotFormat = /^File not formatted: (.+)$/;
const errReport = /^(src[\\/].+?)\(\d+,\d+\): /;
const violates = /^(src[\\/].+?):\d+:\d+:Imports violates/;
const isTs = /\.ts$/i;
const isCss = /\.css$/i;
myBuildSystem_1.runMain(async () => {
    process.stderr.write('\x1Bc\r');
    pathUtil_1.chdir(constants_1.VSCODE_ROOT);
    const output = myBuildSystem_1.usePretty();
    output.success('running reformat on ALL source files, this will use about 1min. please wait.').continue();
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
    multiplex.pipe(myBuildSystem_1.writeFileStream(path_1.resolve(constants_1.RELEASE_ROOT, 'hygiene.log')));
    await await complex_1.pipeCommandOut(multiplex, 'yarn', 'run', 'gulp', 'hygiene').then(() => {
        output.success('gulp hygiene exit successful').continue();
    }, (e) => {
        output.fail(`gulp hygiene exit with failed status: ${e.status || ''}${e.signal || ''}`);
        notValidFiles.unshift('hygiene failed. this list may not complete. run yarn gulp hygiene too see full.');
        output.continue();
    });
    if (notFormattedFiles.length) {
        output.success(`fixing ${notFormattedFiles.length} error....\n`).continue();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0LWFsbC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiY29tbWFuZHMvZm9ybWF0LWFsbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUErQjtBQUMvQixtQ0FBcUM7QUFDckMsK0RBQXFGO0FBRXJGLDJEQUF3RTtBQUN4RSxtRUFBc0Y7QUFDdEYseURBQW1EO0FBQ25ELDZEQUFnRTtBQUNoRSx5REFBcUQ7QUFFckQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBRWpDLE1BQU0sYUFBYSxHQUFHLDRCQUE0QixDQUFDO0FBQ25ELE1BQU0sU0FBUyxHQUFHLDZCQUE2QixDQUFDO0FBQ2hELE1BQU0sUUFBUSxHQUFHLHlDQUF5QyxDQUFDO0FBQzNELE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQztBQUN0QixNQUFNLEtBQUssR0FBRyxTQUFTLENBQUM7QUFFeEIsdUJBQU8sQ0FBQyxLQUFLLElBQUksRUFBRTtJQUNsQixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNoQyxnQkFBSyxDQUFDLHVCQUFXLENBQUMsQ0FBQztJQUVuQixNQUFNLE1BQU0sR0FBRyx5QkFBUyxFQUFFLENBQUM7SUFFM0IsTUFBTSxDQUFDLE9BQU8sQ0FBQyw4RUFBOEUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsbUNBQW1DLENBQUMsQ0FBQztJQUVsRCxNQUFNLGlCQUFpQixHQUFhLEVBQUUsQ0FBQztJQUN2QyxNQUFNLGFBQWEsR0FBYSxFQUFFLENBQUM7SUFDbkMsTUFBTSxTQUFTLEdBQUcsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFO1FBQzlDLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFdkIsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FB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
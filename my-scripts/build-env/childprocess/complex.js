"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const stream_1 = require("stream");
const streamUtil_1 = require("../misc/streamUtil");
const env_1 = require("./env");
const handlers_1 = require("./handlers");
async function pipeCommandBoth(stdout, stderr, cmd, ...args) {
    [cmd, args] = handlers_1.parseCommand(cmd, args);
    const cp = child_process_1.spawn(cmd, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        ...env_1.mergeEnv(),
    });
    cp.stdout.pipe(stdout, { end: true });
    cp.stderr.pipe(stderr, endArg(stderr));
    return handlers_1.processPromise(cp, [cmd, args]);
}
exports.pipeCommandBoth = pipeCommandBoth;
async function muteCommandOut(cmd, ...args) {
    return pipeCommandOut(new streamUtil_1.BlackHoleStream(), cmd, ...args);
}
exports.muteCommandOut = muteCommandOut;
function endArg(stream) {
    if (stream.hasOwnProperty('noEnd') || stream === process.stdout || stream === process.stderr) {
        return { end: false };
    }
    else {
        return { end: true };
    }
}
async function pipeCommandOut(pipe, cmd, ...args) {
    [cmd, args] = handlers_1.parseCommand(cmd, args);
    // console.log(' + %s %s | line-output', cmd, args.join(' '));
    const stream = _spawnCommand(cmd, args);
    stream.output.pipe(pipe, endArg(pipe));
    await stream.wait();
}
exports.pipeCommandOut = pipeCommandOut;
async function getOutputCommand(cmd, ...args) {
    [cmd, args] = handlers_1.parseCommand(cmd, args);
    // console.log(' + %s %s | stream-output', cmd, args.join(' '));
    const stream = _spawnCommand(cmd, args);
    const collector = new streamUtil_1.CollectingStream();
    stream.output.pipe(collector);
    await stream.wait();
    return collector.getOutput().trim();
}
exports.getOutputCommand = getOutputCommand;
function _spawnCommand(cmd, args) {
    const output = new stream_1.PassThrough();
    return {
        output,
        wait() {
            const cp = child_process_1.spawn(cmd, args, {
                stdio: ['ignore', 'pipe', 'pipe'],
                ...env_1.mergeEnv(),
            });
            cp.stdout.pipe(output, { end: false });
            cp.stderr.pipe(output, { end: false });
            cp.on('exit', () => {
                output.end();
            });
            return handlers_1.processPromise(cp, [cmd, args]);
        },
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGxleC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiYnVpbGQtZW52L2NoaWxkcHJvY2Vzcy9jb21wbGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaURBQXNDO0FBQ3RDLG1DQUFxQztBQUNyQyxtREFBdUU7QUFDdkUsK0JBQWlDO0FBQ2pDLHlDQUEwRDtBQU9uRCxLQUFLLFVBQVUsZUFBZSxDQUNwQyxNQUE2QixFQUM3QixNQUE2QixFQUM3QixHQUFXLEVBQ1gsR0FBRyxJQUFjO0lBRWpCLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLHVCQUFZLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3RDLE1BQU0sRUFBRSxHQUFHLHFCQUFLLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRTtRQUMzQixLQUFLLEVBQUUsQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNqQyxHQUFHLGNBQVEsRUFBRTtLQUNiLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0lBQ3BDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUV2QyxPQUFPLHlCQUFjLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDeEMsQ0FBQztBQWhCRCwwQ0FnQkM7QUFFTSxLQUFLLFVBQVUsY0FBYyxDQUFDLEdBQVcsRUFBRSxHQUFHLElBQWM7SUFDbEUsT0FBTyxjQUFjLENBQUMsSUFBSSw0QkFBZSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDNUQsQ0FBQztBQUZELHdDQUVDO0FBRUQsU0FBUyxNQUFNLENBQUMsTUFBNkI7SUFDNUMsSUFBSSxNQUFNLENB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
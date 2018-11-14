"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const globalOutput_1 = require("../misc/globalOutput");
const streamUtil_1 = require("../misc/streamUtil");
const env_1 = require("./env");
const handlers_1 = require("./handlers");
async function pipeCommandBoth(stdout, stderr, cmd, ...args) {
    const cp = globalOutput_1.spawnWithLog(cmd, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        ...env_1.mergeEnv(),
    });
    cp.stdout.pipe(stdout, streamUtil_1.endArg(stdout));
    cp.stderr.pipe(stderr, streamUtil_1.endArg(stderr));
    const [command, argumentList] = handlers_1.parseCommand(cmd, args);
    return handlers_1.processPromise(cp, [command, argumentList]);
}
exports.pipeCommandBoth = pipeCommandBoth;
async function muteCommandOut(cmd, ...args) {
    return pipeCommandOut(new streamUtil_1.BlackHoleStream(), cmd, ...args);
}
exports.muteCommandOut = muteCommandOut;
async function pipeCommandOut(pipe, cmd, ...args) {
    // console.log(' + %s %s | line-output', command, argumentList.join(' '));
    const stream = _spawnCommand(cmd, args);
    stream.output.pipe(pipe, streamUtil_1.endArg(pipe));
    await stream.wait();
}
exports.pipeCommandOut = pipeCommandOut;
async function getOutputCommand(cmd, ...args) {
    // console.log(' + %s %s | stream-output', command, argumentList.join(' '));
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
            const cp = globalOutput_1.spawnWithLog(cmd, args, {
                stdio: ['ignore', 'pipe', 'pipe'],
                ...env_1.mergeEnv(),
            });
            cp.stdout.pipe(output, { end: false });
            cp.stderr.pipe(output, { end: false });
            cp.on('exit', () => {
                output.end();
            });
            const [command, argumentList] = handlers_1.parseCommand(cmd, args);
            return handlers_1.processPromise(cp, [command, argumentList]);
        },
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGxleC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiYnVpbGQtZW52L2NoaWxkcHJvY2Vzcy9jb21wbGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsbUNBQXFDO0FBQ3JDLHVEQUFvRDtBQUNwRCxtREFBK0U7QUFDL0UsK0JBQWlDO0FBQ2pDLHlDQUEwRDtBQU9uRCxLQUFLLFVBQVUsZUFBZSxDQUNwQyxNQUE2QixFQUM3QixNQUE2QixFQUM3QixHQUFXLEVBQ1gsR0FBRyxJQUFjO0lBRWpCLE1BQU0sRUFBRSxHQUFHLDJCQUFZLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRTtRQUNsQyxLQUFLLEVBQUUsQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNqQyxHQUFHLGNBQVEsRUFBRTtLQUNiLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxtQkFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDdkMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLG1CQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUV2QyxNQUFNLENBQUMsT0FBTyxFQUFFLFlBQVksQ0FBQyxHQUFHLHVCQUFZLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3hELE9BQU8seUJBQWMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQztBQUNwRCxDQUFDO0FBaEJELDBDQWdCQztBQUVNLEtBQUssVUFBVSxjQUFjLENBQUMsR0FBVyxFQUFFLEdBQUcsSUFBYztJQUNsRSxPQUFPLGNBQWMsQ0FBQyxJQUFJLDRCQUFlLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUM1RCxDQUFDO0FBRkQsd0NBRUM7QUFFTSxLQUFLLFVBQVUsY0FBYyxDQUFDLElBQTJCLEVBQUUsR0FBVyxFQUFFLEdBQUcsSUFBYztJQUMvRiwwRUFBMEU7SUFDMUUsTUFBTSxNQUFNLEdBQUcsYUFBYSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN4QyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsbUJBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3ZDLE1BQU0sTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3JCLENBQUM7QUFMRCx3Q0FLQztBQUVNLEtBQUssVUFBVSxnQkFBZ0IsQ0FBQyxHQUFXLEVBQUUsR0FBRyxJQUFjO0lBQ3BFLDRFQUE0RTtJQUM1RSxNQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3hDLE1BQU0sU0FBUyxHQUFHLElBQUksNkJBQWdCLEVBQUUsQ0FBQztJQUN6QyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM5QixNQUFNLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNwQixPQUFPLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNyQyxDQUFDO0FBUEQsNENBT0M7QUFFRCxTQUFTLGFBQWEsQ0FBQyxHQUFXLEVBQUUsSUFBYztJQUNqRCxNQUFNLE1BQU0sR0FBRyxJQUFJLG9CQUFXLEVBQUUsQ0FBQztJQUNqQyxPQUFPO1FBQ04sTUFBTTtRQUNOLElBQUk7WUFDSCxNQUFNLEVBQUUsR0FBRywyQkFBWSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUU7Z0JBQ2xDLEtBQUssRUFBRSxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDO2dCQUNqQyxHQUFHLGNBQVEsRUFBRTthQUNiLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO1lBQ3JDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO1lBRXJDLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRTtnQkFDbEIsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQUM7WUFFSCxNQUFNLENBQUMsT0FBTyxFQUFFLFlBQVksQ0FBQyxHQUFHLHVCQUFZLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3hELE9BQU8seUJBQWMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUNwRCxDQUFDO0tBQ0QsQ0FBQztBQUNILENBQUMifQ==
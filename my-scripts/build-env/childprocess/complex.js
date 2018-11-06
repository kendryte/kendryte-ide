"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const stream_1 = require("stream");
const streamUtil_1 = require("../misc/streamUtil");
const handlers_1 = require("./handlers");
async function pipeCommandBoth(stdout, stderr, cmd, ...args) {
    [cmd, args] = handlers_1.parseCommand(cmd, args);
    const cp = child_process_1.spawn(cmd, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
    });
    cp.stdout.pipe(stdout, { end: true });
    cp.stderr.pipe(stderr, endArg(stderr));
    return handlers_1.processPromise(cp);
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
            });
            cp.stdout.pipe(output, { end: false });
            cp.stderr.pipe(output, { end: false });
            cp.on('exit', () => {
                output.end();
            });
            return handlers_1.processPromise(cp);
        },
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGxleC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiYnVpbGQtZW52L2NoaWxkcHJvY2Vzcy9jb21wbGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaURBQXNDO0FBQ3RDLG1DQUFxQztBQUNyQyxtREFBdUU7QUFDdkUseUNBQTBEO0FBT25ELEtBQUssVUFBVSxlQUFlLENBQ3BDLE1BQTZCLEVBQzdCLE1BQTZCLEVBQzdCLEdBQVcsRUFDWCxHQUFHLElBQWM7SUFFakIsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsdUJBQVksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdEMsTUFBTSxFQUFFLEdBQUcscUJBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQzNCLEtBQUssRUFBRSxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDO0tBQ2pDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0lBQ3BDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUV2QyxPQUFPLHlCQUFjLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDM0IsQ0FBQztBQWZELDBDQWVDO0FBRU0sS0FBSyxVQUFVLGNBQWMsQ0FBQyxHQUFXLEVBQUUsR0FBRyxJQUFjO0lBQ2xFLE9BQU8sY0FBYyxDQUFDLElBQUksNEJBQWUsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQzVELENBQUM7QUFGRCx3Q0FFQztBQUVELFNBQVMsTUFBTSxDQUFDLE1BQTZCO0lBQzVDLElBQUksTUFBTSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxNQUFNLEtBQUssT0FBTyxDQUFDLE1BQU0sSUFBSSxNQUFNLEtBQUssT0FBTyxDQUFDLE1BQU0sRUFBRTtRQUM3RixPQUFPLEVBQUMsR0FBRyxFQUFFLEtBQUssRUFBQyxDQUFDO0tBQ3BCO1NBQU07UUFDTixPQUFPLEVBQUMsR0FBRyxFQUFFLElBQUksRUFBQyxDQUFDO0tBQ25CO0FBQ0YsQ0FBQztBQUVNLEtBQUssVUFBVSxjQUFjLENBQUMsSUFBMkIsRUFBRSxHQUFXLEVBQUUsR0FBRyxJQUFjO0lBQy9GLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLHVCQUFZLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3RDLDhEQUE4RDtJQUM5RCxNQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3hDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUN2QyxNQUFNLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNyQixDQUFDO0FBTkQsd0NBTUM7QUFFTSxLQUFLLFVBQVUsZ0JBQWdCLENBQUMsR0FBVyxFQUFFLEdBQUcsSUFBYztJQUNwRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyx1QkFBWSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN0QyxnRUFBZ0U7SUFDaEUsTUFBTSxNQUFNLEdBQUcsYUFBYSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN4QyxNQUFNLFNBQVMsR0FBRyxJQUFJLDZCQUFnQixFQUFFLENBQUM7SUFDekMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDOUIsTUFBTSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDcEIsT0FBTyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDckMsQ0FBQztBQVJELDRDQVFDO0FBRUQsU0FBUyxhQUFhLENBQUMsR0FBVyxFQUFFLElBQWM7SUFDakQsTUFBTSxNQUFNLEdBQUcsSUFBSSxvQkFBVyxFQUFFLENBQUM7SUFDakMsT0FBTztRQUNOLE1BQU07UUFDTixJQUFJO1lBQ0gsTUFBTSxFQUFFLEdBQUcscUJBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFO2dCQUMzQixLQUFLLEVBQUUsQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQzthQUNqQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBQyxHQUFHLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQztZQUNyQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBQyxHQUFHLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQztZQUVyQyxFQUFFLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUU7Z0JBQ2xCLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNkLENBQUMsQ0FBQyxDQUFDO1lBRUgsT0FBTyx5QkFBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzNCLENBQUM7S0FDRCxDQUFDO0FBQ0gsQ0FBQyJ9
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const stream_1 = require("stream");
const streamUtil_1 = require("../misc/streamUtil");
const handlers_1 = require("./handlers");
async function pipeCommandBoth(stdout, stderr, cmd, ...args) {
    const cp = child_process_1.spawn(cmd, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
    });
    cp.stdout.pipe(stdout, { end: true });
    cp.stderr.pipe(stderr, { end: false });
    return handlers_1.processPromise(cp);
}
exports.pipeCommandBoth = pipeCommandBoth;
async function muteCommandOut(cmd, ...args) {
    return pipeCommandOut(new streamUtil_1.BlackHoleStream(), cmd, ...args);
}
exports.muteCommandOut = muteCommandOut;
async function pipeCommandOut(pipe, cmd, ...args) {
    [cmd, args] = handlers_1.parseCommand(cmd, args);
    // console.log(' + %s %s | line-output', cmd, args.join(' '));
    const stream = _spawnCommand(cmd, args);
    stream.output.pipe(pipe);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGxleC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiYnVpbGQtZW52L2NoaWxkcHJvY2Vzcy9jb21wbGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaURBQXNDO0FBQ3RDLG1DQUFxQztBQUNyQyxtREFBdUU7QUFDdkUseUNBQTBEO0FBT25ELEtBQUssVUFBVSxlQUFlLENBQ3BDLE1BQTZCLEVBQzdCLE1BQTZCLEVBQzdCLEdBQVcsRUFDWCxHQUFHLElBQWM7SUFFakIsTUFBTSxFQUFFLEdBQUcscUJBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQzNCLEtBQUssRUFBRSxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDO0tBQ2pDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0lBQ3BDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO0lBRXJDLE9BQU8seUJBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUMzQixDQUFDO0FBZEQsMENBY0M7QUFFTSxLQUFLLFVBQVUsY0FBYyxDQUFDLEdBQVcsRUFBRSxHQUFHLElBQWM7SUFDbEUsT0FBTyxjQUFjLENBQUMsSUFBSSw0QkFBZSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDNUQsQ0FBQztBQUZELHdDQUVDO0FBRU0sS0FBSyxVQUFVLGNBQWMsQ0FBQyxJQUEyQixFQUFFLEdBQVcsRUFBRSxHQUFHLElBQWM7SUFDL0YsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsdUJBQVksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdEMsOERBQThEO0lBQzlELE1BQU0sTUFBTSxHQUFHLGFBQWEsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDeEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDekIsTUFBTSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDckIsQ0FBQztBQU5ELHdDQU1DO0FBRU0sS0FBSyxVQUFVLGdCQUFnQixDQUFDLEdBQVcsRUFBRSxHQUFHLElBQWM7SUFDcEUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsdUJBQVksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdEMsZ0VBQWdFO0lBQ2hFLE1BQU0sTUFBTSxHQUFHLGFBQWEsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDeEMsTUFBTSxTQUFTLEdBQUcsSUFBSSw2QkFBZ0IsRUFBRSxDQUFDO0lBQ3pDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzlCLE1BQU0sTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3BCLE9BQU8sU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3JDLENBQUM7QUFSRCw0Q0FRQztBQUVELFNBQVMsYUFBYSxDQUFDLEdBQVcsRUFBRSxJQUFjO0lBQ2pELE1BQU0sTUFBTSxHQUFHLElBQUksb0JBQVcsRUFBRSxDQUFDO0lBQ2pDLE9BQU87UUFDTixNQUFNO1FBQ04sSUFBSTtZQUNILE1BQU0sRUFBRSxHQUFHLHFCQUFLLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRTtnQkFDM0IsS0FBSyxFQUFFLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUM7YUFDakMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUMsR0FBRyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7WUFDckMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUMsR0FBRyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7WUFFckMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFO2dCQUNsQixNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDZCxDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8seUJBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMzQixDQUFDO0tBQ0QsQ0FBQztBQUNILENBQUMifQ==
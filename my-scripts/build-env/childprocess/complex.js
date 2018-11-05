"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const stream_1 = require("stream");
const streamUtil_1 = require("../misc/streamUtil");
const handlers_1 = require("./handlers");
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
    return collector.getOutput();
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
            return handlers_1.promiseProcess(cp);
        },
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGxleC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiYnVpbGQtZW52L2NoaWxkcHJvY2Vzcy9jb21wbGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaURBQXNDO0FBQ3RDLG1DQUF5RDtBQUN6RCxtREFBdUU7QUFDdkUseUNBQTBEO0FBT25ELEtBQUssVUFBVSxjQUFjLENBQUMsR0FBVyxFQUFFLEdBQUcsSUFBYztJQUNsRSxPQUFPLGNBQWMsQ0FBQyxJQUFJLDRCQUFlLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUM1RCxDQUFDO0FBRkQsd0NBRUM7QUFFTSxLQUFLLFVBQVUsY0FBYyxDQUFDLElBQWMsRUFBRSxHQUFXLEVBQUUsR0FBRyxJQUFjO0lBQ2xGLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLHVCQUFZLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3RDLDhEQUE4RDtJQUM5RCxNQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3hDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3pCLE1BQU0sTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3JCLENBQUM7QUFORCx3Q0FNQztBQUVNLEtBQUssVUFBVSxnQkFBZ0IsQ0FBQyxHQUFXLEVBQUUsR0FBRyxJQUFjO0lBQ3BFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLHVCQUFZLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3RDLGdFQUFnRTtJQUNoRSxNQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3hDLE1BQU0sU0FBUyxHQUFHLElBQUksNkJBQWdCLEVBQUUsQ0FBQztJQUN6QyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM5QixNQUFNLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNwQixPQUFPLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUM5QixDQUFDO0FBUkQsNENBUUM7QUFFRCxTQUFTLGFBQWEsQ0FBQyxHQUFXLEVBQUUsSUFBYztJQUNqRCxNQUFNLE1BQU0sR0FBRyxJQUFJLG9CQUFXLEVBQUUsQ0FBQztJQUNqQyxPQUFPO1FBQ04sTUFBTTtRQUNOLElBQUk7WUFDSCxNQUFNLEVBQUUsR0FBRyxxQkFBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUU7Z0JBQzNCLEtBQUssRUFBRSxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDO2FBQ2pDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO1lBQ3JDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO1lBRXJDLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRTtnQkFDbEIsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPLHlCQUFjLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDM0IsQ0FBQztLQUNELENBQUM7QUFDSCxDQUFDIn0=
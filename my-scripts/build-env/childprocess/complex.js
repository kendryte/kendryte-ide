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
    cp.stdout.pipe(stdout, { end: true });
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
    if (pipe.nextLine) {
        pipe.writeln(`Running command: ${cmd} ${args.join(' ')}`);
        pipe.nextLine();
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGxleC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiYnVpbGQtZW52L2NoaWxkcHJvY2Vzcy9jb21wbGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsbUNBQXFDO0FBQ3JDLHVEQUFvRDtBQUNwRCxtREFBK0U7QUFDL0UsK0JBQWlDO0FBQ2pDLHlDQUEwRDtBQU9uRCxLQUFLLFVBQVUsZUFBZSxDQUNwQyxNQUE2QixFQUM3QixNQUE2QixFQUM3QixHQUFXLEVBQ1gsR0FBRyxJQUFjO0lBRWpCLE1BQU0sRUFBRSxHQUFHLDJCQUFZLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRTtRQUNsQyxLQUFLLEVBQUUsQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNqQyxHQUFHLGNBQVEsRUFBRTtLQUNiLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0lBQ3BDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxtQkFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFFdkMsTUFBTSxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsR0FBRyx1QkFBWSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN4RCxPQUFPLHlCQUFjLENBQUMsRUFBRSxFQUFFLENBQUMsT0FBTyxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUM7QUFDcEQsQ0FBQztBQWhCRCwwQ0FnQkM7QUFFTSxLQUFLLFVBQVUsY0FBYyxDQUFDLEdBQVcsRUFBRSxHQUFHLElBQWM7SUFDbEUsT0FBTyxjQUFjLENBQUMsSUFBSSw0QkFBZSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDNUQsQ0FBQztBQUZELHdDQUVDO0FBRU0sS0FBSyxVQUFVLGNBQWMsQ0FBQyxJQUEyQixFQUFFLEdBQVcsRUFBRSxHQUFHLElBQWM7SUFDL0YsMEVBQTBFO0lBQzFFLE1BQU0sTUFBTSxHQUFHLGFBQWEsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDeEMsSUFBSyxJQUFZLENBQUMsUUFBUSxFQUFFO1FBQzFCLElBQTRCLENBQUMsT0FBTyxDQUFDLG9CQUFvQixHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbEYsSUFBNEIsQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUN6QztJQUNELE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxtQkFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDdkMsTUFBTSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDckIsQ0FBQztBQVRELHdDQVNDO0FBRU0sS0FBSyxVQUFVLGdCQUFnQixDQUFDLEdBQVcsRUFBRSxHQUFHLElBQWM7SUFDcEUsNEVBQTRFO0lBQzVFLE1BQU0sTUFBTSxHQUFHLGFBQWEsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDeEMsTUFBTSxTQUFTLEdBQUcsSUFBSSw2QkFBZ0IsRUFBRSxDQUFDO0lBQ3pDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzlCLE1BQU0sTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3BCLE9BQU8sU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3JDLENBQUM7QUFQRCw0Q0FPQztBQUVELFNBQVMsYUFBYSxDQUFDLEdBQVcsRUFBRSxJQUFjO0lBQ2pELE1BQU0sTUFBTSxHQUFHLElBQUksb0JBQVcsRUFBRSxDQUFDO0lBQ2pDLE9BQU87UUFDTixNQUFNO1FBQ04sSUFBSTtZQUNILE1BQU0sRUFBRSxHQUFHLDJCQUFZLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRTtnQkFDbEMsS0FBSyxFQUFFLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUM7Z0JBQ2pDLEdBQUcsY0FBUSxFQUFFO2FBQ2IsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUMsR0FBRyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7WUFDckMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUMsR0FBRyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7WUFFckMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFO2dCQUNsQixNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDZCxDQUFDLENBQUMsQ0FBQztZQUVILE1BQU0sQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLEdBQUcsdUJBQVksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDeEQsT0FBTyx5QkFBYyxDQUFDLEVBQUUsRUFBRSxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBQ3BELENBQUM7S0FDRCxDQUFDO0FBQ0gsQ0FBQyJ9
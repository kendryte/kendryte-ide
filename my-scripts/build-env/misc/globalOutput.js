"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stillalive_1 = require("@gongt/stillalive");
const child_process_1 = require("child_process");
const util_1 = require("util");
const handlers_1 = require("../childprocess/handlers");
const myBuildSystem_1 = require("./myBuildSystem");
/* No use any node_modules deps */
let globalLogTarget = process.stderr;
function useThisStream(stream) {
    globalLogTarget = stream;
}
exports.useThisStream = useThisStream;
function globalLog(msg, ...args) {
    globalLogTarget.write(util_1.format(msg + '\n', ...args));
}
exports.globalLog = globalLog;
function globalInterruptLog(msg, ...args) {
    if (globalLogTarget['nextLine']) {
        globalLogTarget.write('\n' + util_1.format(msg + '\n', ...args));
        globalLogTarget['nextLine']();
    }
    else {
        globalLogTarget.write(util_1.format(msg + '\n', ...args));
    }
}
exports.globalInterruptLog = globalInterruptLog;
function spawnWithLog(command, args, options) {
    globalInterruptLog(' + %s %s', command, args.join(' '));
    [command, args] = handlers_1.parseCommand(command, args);
    const r = child_process_1.spawn(command, args, options);
    handlers_1.processPromise(r, [command, args], options).then(() => {
        globalLog('Command %s success.', command);
    }, (e) => {
        globalLog('Command [%s] [%s]\n  Failed with error: code = %s, signal = %s\n%s', command, args.join('] ['), e.status, e.signal, e.stack);
    });
    return r;
}
exports.spawnWithLog = spawnWithLog;
useThisStream(process.stderr);
function usePretty(opts) {
    const stream = stillalive_1.startWorking();
    useThisStream(stream);
    Object.assign(stream, { noEnd: true });
    myBuildSystem_1.mainDispose((error) => {
        useThisStream(process.stderr);
        if (error) {
            stream.fail(error.message);
        }
        stream.end();
    });
    return stream;
}
exports.usePretty = usePretty;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsT3V0cHV0LmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvbWlzYy9nbG9iYWxPdXRwdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxrREFBaUY7QUFDakYsaURBQW9EO0FBQ3BELCtCQUE4QjtBQUU5Qix1REFBd0U7QUFDeEUsbURBQThDO0FBQzlDLGtDQUFrQztBQUVsQyxJQUFJLGVBQWUsR0FBMEIsT0FBTyxDQUFDLE1BQU0sQ0FBQztBQUU1RCxTQUFnQixhQUFhLENBQUMsTUFBNkI7SUFDMUQsZUFBZSxHQUFHLE1BQU0sQ0FBQztBQUMxQixDQUFDO0FBRkQsc0NBRUM7QUFFRCxTQUFnQixTQUFTLENBQUMsR0FBUSxFQUFFLEdBQUcsSUFBVztJQUNqRCxlQUFlLENBQUMsS0FBSyxDQUFDLGFBQU0sQ0FBQyxHQUFHLEdBQUcsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNwRCxDQUFDO0FBRkQsOEJBRUM7QUFFRCxTQUFnQixrQkFBa0IsQ0FBQyxHQUFRLEVBQUUsR0FBRyxJQUFXO0lBQzFELElBQUksZUFBZSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1FBQ2hDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLGFBQU0sQ0FBQyxHQUFHLEdBQUcsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUMxRCxlQUFlLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztLQUM5QjtTQUFNO1FBQ04sZUFBZSxDQUFDLEtBQUssQ0FBQyxhQUFNLENBQUMsR0FBRyxHQUFHLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDbkQ7QUFDRixDQUFDO0FBUEQsZ0RBT0M7QUFFRCxTQUFnQixZQUFZLENBQUMsT0FBZSxFQUFFLElBQTRCLEVBQUUsT0FBc0I7SUFDakcsa0JBQWtCLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFFeEQsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEdBQUcsdUJBQVksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDOUMsTUFBTSxDQUFDLEdBQUcscUJBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRXhDLHlCQUFjLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7UUFDckQsU0FBUyxDQUFDLHFCQUFxQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzNDLENBQUMsRUFBRSxDQUFDLENBQWUsRUFBRSxFQUFFO1FBQ3RCLFNBQVMsQ0FDUixvRUFBb0UsRUFDcEUsT0FBTyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQ3pCLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDL0IsQ0FBQyxDQUFDLENBQUM7SUFFSCxPQUFPLENBQUMsQ0FBQztBQUNWLENBQUM7QUFoQkQsb0NBZ0JDO0FBRUQsYUFBYSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUU5QixTQUFnQixTQUFTLENBQUMsSUFBZ0I7SUFDekMsTUFBTSxNQUFNLEdBQUcseUJBQVksRUFBRSxDQUFDO0lBQzlCLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN0QixNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0lBQ3JDLDJCQUFXLENBQUMsQ0FBQyxLQUFZLEVBQUUsRUFBRTtRQUM1QixhQUFhLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzlCLElBQUksS0FBSyxFQUFFO1lBQ1YsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDM0I7UUFDRCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDZCxDQUFDLENBQUMsQ0FBQztJQUNILE9BQU8sTUFBTSxDQUFDO0FBQ2YsQ0FBQztBQVpELDhCQVlDIn0=
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const util_1 = require("util");
const handlers_1 = require("../childprocess/handlers");
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
function globalSuccessMessage(msg, ...args) {
    if (globalLogTarget.hasOwnProperty('success')) {
        globalLogTarget.success(util_1.format(msg, ...args));
    }
    else {
        globalLogTarget.write(util_1.format('Success: ' + msg + '\n', ...args));
    }
}
exports.globalSuccessMessage = globalSuccessMessage;
function globalSplitLog(msg, ...args) {
    if (globalLogTarget.hasOwnProperty('nextLine')) {
        globalLogTarget.writeln('');
        globalLogTarget.nextLine();
    }
    else {
        globalLogTarget.write('\n');
    }
}
exports.globalSplitLog = globalSplitLog;
function globalInterruptLog(msg, ...args) {
    if (globalLogTarget['nextLine']) {
        globalLogTarget['empty'](util_1.format(msg, ...args));
    }
    else {
        globalLogTarget.write('---------------\n' + util_1.format(msg + '\n', ...args));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsT3V0cHV0LmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvbWlzYy9nbG9iYWxPdXRwdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxpREFBb0Q7QUFDcEQsK0JBQThCO0FBRTlCLHVEQUF3RTtBQUN4RSxrQ0FBa0M7QUFFbEMsSUFBSSxlQUFlLEdBQTBCLE9BQU8sQ0FBQyxNQUFNLENBQUM7QUFFNUQsU0FBZ0IsYUFBYSxDQUFDLE1BQTZCO0lBQzFELGVBQWUsR0FBRyxNQUFNLENBQUM7QUFDMUIsQ0FBQztBQUZELHNDQUVDO0FBRUQsU0FBZ0IsU0FBUyxDQUFDLEdBQVEsRUFBRSxHQUFHLElBQVc7SUFDakQsZUFBZSxDQUFDLEtBQUssQ0FBQyxhQUFNLENBQUMsR0FBRyxHQUFHLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDcEQsQ0FBQztBQUZELDhCQUVDO0FBRUQsU0FBZ0Isb0JBQW9CLENBQUMsR0FBUSxFQUFFLEdBQUcsSUFBVztJQUM1RCxJQUFJLGVBQWUsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLEVBQUU7UUFDN0MsZUFBdUMsQ0FBQyxPQUFPLENBQUMsYUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDdkU7U0FBTTtRQUNOLGVBQWUsQ0FBQyxLQUFLLENBQUMsYUFBTSxDQUFDLFdBQVcsR0FBRyxHQUFHLEdBQUcsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztLQUNqRTtBQUNGLENBQUM7QUFORCxvREFNQztBQUVELFNBQWdCLGNBQWMsQ0FBQyxHQUFRLEVBQUUsR0FBRyxJQUFXO0lBQ3RELElBQUksZUFBZSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsRUFBRTtRQUM5QyxlQUF1QyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNwRCxlQUF1QyxDQUFDLFFBQVEsRUFBRSxDQUFDO0tBQ3BEO1NBQU07UUFDTixlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQzVCO0FBQ0YsQ0FBQztBQVBELHdDQU9DO0FBRUQsU0FBZ0Isa0JBQWtCLENBQUMsR0FBUSxFQUFFLEdBQUcsSUFBVztJQUMxRCxJQUFJLGVBQWUsQ0FBQyxVQUFVLENBQUMsRUFBRTtRQUNoQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsYUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDL0M7U0FBTTtRQUNOLGVBQWUsQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEdBQUcsYUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQ3pFO0FBQ0YsQ0FBQztBQU5ELGdEQU1DO0FBRUQsU0FBZ0IsWUFBWSxDQUFDLE9BQWUsRUFBRSxJQUE0QixFQUFFLE9BQXNCO0lBQ2pHLGtCQUFrQixDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRXhELENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxHQUFHLHVCQUFZLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzlDLE1BQU0sQ0FBQyxHQUFHLHFCQUFLLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUV4Qyx5QkFBYyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO1FBQ3JELFNBQVMsQ0FBQyxxQkFBcUIsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUMzQyxDQUFDLEVBQUUsQ0FBQyxDQUFlLEVBQUUsRUFBRTtRQUN0QixTQUFTLENBQ1Isb0VBQW9FLEVBQ3BFLE9BQU8sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUN6QixDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQy9CLENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTyxDQUFDLENBQUM7QUFDVixDQUFDO0FBaEJELG9DQWdCQztBQUVELGFBQWEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMifQ==
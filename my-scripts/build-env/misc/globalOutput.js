"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = require("path");
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
function globalScreenLog(msg, ...args) {
    if (globalLogTarget['nextLine']) {
        globalLogTarget.screen.writeln(util_1.format(msg, ...args));
    }
    else {
        globalLogTarget.write(util_1.format(msg, ...args) + '\n');
    }
}
exports.globalScreenLog = globalScreenLog;
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
    if (!path_1.isAbsolute(command)) {
        globalLog('PATH=%s', options.env.PATH || process.env.PATH);
    }
    globalLog(' > %s', options.cwd || process.cwd());
    globalInterruptLog(' + %s %s', command, args.join(' '));
    globalScreenLog('running...');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsT3V0cHV0LmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvbWlzYy9nbG9iYWxPdXRwdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxpREFBb0Q7QUFDcEQsK0JBQWtDO0FBQ2xDLCtCQUE4QjtBQUU5Qix1REFBd0U7QUFDeEUsa0NBQWtDO0FBRWxDLElBQUksZUFBZSxHQUEwQixPQUFPLENBQUMsTUFBTSxDQUFDO0FBRTVELFNBQWdCLGFBQWEsQ0FBQyxNQUE2QjtJQUMxRCxlQUFlLEdBQUcsTUFBTSxDQUFDO0FBQzFCLENBQUM7QUFGRCxzQ0FFQztBQUVELFNBQWdCLFNBQVMsQ0FBQyxHQUFRLEVBQUUsR0FBRyxJQUFXO0lBQ2pELGVBQWUsQ0FBQyxLQUFLLENBQUMsYUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3BELENBQUM7QUFGRCw4QkFFQztBQUVELFNBQWdCLG9CQUFvQixDQUFDLEdBQVEsRUFBRSxHQUFHLElBQVc7SUFDNUQsSUFBSSxlQUFlLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1FBQzdDLGVBQXVDLENBQUMsT0FBTyxDQUFDLGFBQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQ3ZFO1NBQU07UUFDTixlQUFlLENBQUMsS0FBSyxDQUFDLGFBQU0sQ0FBQyxXQUFXLEdBQUcsR0FBRyxHQUFHLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDakU7QUFDRixDQUFDO0FBTkQsb0RBTUM7QUFFRCxTQUFnQixjQUFjLENBQUMsR0FBUSxFQUFFLEdBQUcsSUFBVztJQUN0RCxJQUFJLGVBQWUsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLEVBQUU7UUFDOUMsZUFBdUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEQsZUFBdUMsQ0FBQyxRQUFRLEVBQUUsQ0FB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
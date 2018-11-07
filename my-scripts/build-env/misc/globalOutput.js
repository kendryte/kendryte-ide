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
        globalLog('Command %s failed with error: code = %s, signal = %s\n%s', e.status, e.signal, e.stack);
    });
    return r;
}
exports.spawnWithLog = spawnWithLog;
function indentArgs(args) {
    return args.map((arg, index) => {
        return `  Argument[${index}] = ${arg}`;
    }).join('\n');
}
exports.indentArgs = indentArgs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsT3V0cHV0LmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvbWlzYy9nbG9iYWxPdXRwdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxpREFBb0Q7QUFDcEQsK0JBQThCO0FBRTlCLHVEQUF3RTtBQUN4RSxrQ0FBa0M7QUFFbEMsSUFBSSxlQUFlLEdBQTBCLE9BQU8sQ0FBQyxNQUFNLENBQUM7QUFFNUQsU0FBZ0IsYUFBYSxDQUFDLE1BQTZCO0lBQzFELGVBQWUsR0FBRyxNQUFNLENBQUM7QUFDMUIsQ0FBQztBQUZELHNDQUVDO0FBRUQsU0FBZ0IsU0FBUyxDQUFDLEdBQVEsRUFBRSxHQUFHLElBQVc7SUFDakQsZUFBZSxDQUFDLEtBQUssQ0FBQyxhQUFNLENBQUMsR0FBRyxHQUFHLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDcEQsQ0FBQztBQUZELDhCQUVDO0FBRUQsU0FBZ0Isa0JBQWtCLENBQUMsR0FBUSxFQUFFLEdBQUcsSUFBVztJQUMxRCxJQUFJLGVBQWUsQ0FBQyxVQUFVLENBQUMsRUFBRTtRQUNoQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxhQUFNLENBQUMsR0FBRyxHQUFHLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDMUQsZUFBZSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7S0FDOUI7U0FBTTtRQUNOLGVBQWUsQ0FBQyxLQUFLLENBQUMsYUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQ25EO0FBQ0YsQ0FBQztBQVBELGdEQU9DO0FBRUQsU0FBZ0IsWUFBWSxDQUFDLE9BQWUsRUFBRSxJQUE0QixFQUFFLE9BQXNCO0lBQ2pHLGtCQUFrQixDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRXhELENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxHQUFHLHVCQUFZLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzlDLE1BQU0sQ0FBQyxHQUFHLHFCQUFLLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUV4Qyx5QkFBYyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO1FBQ3JELFNBQVMsQ0FBQyxxQkFBcUIsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUMzQyxDQUFDLEVBQUUsQ0FBQyxDQUFlLEVBQUUsRUFBRTtRQUN0QixTQUFTLENBQUMsMERBQTBELEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNwRyxDQUFDLENBQUMsQ0FBQztJQUVILE9BQU8sQ0FBQyxDQUFDO0FBQ1YsQ0FBQztBQWJELG9DQWFDO0FBRUQsU0FBZ0IsVUFBVSxDQUFDLElBQTJCO0lBQ3JELE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRTtRQUM5QixPQUFPLGNBQWMsS0FBSyxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ3hDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNmLENBQUM7QUFKRCxnQ0FJQyJ9
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const env_1 = require("./env");
const error_1 = require("./error");
const handlers_1 = require("./handlers");
/* No use any node_modules deps */
function _shellSync(stdio, cmd, args) {
    const r = child_process_1.spawnSync(cmd, args, {
        stdio,
        encoding: 'utf8',
        ...env_1.mergeEnv(),
    });
    if (r.error) {
        throw r.error;
    }
    error_1.ThrowStatusCodeError(r.status, r.signal, [cmd, args, process.cwd()]);
    return r;
}
function shellExec(cmd, ...args) {
    const [command, argumentList] = handlers_1.parseCommand(cmd, args);
    console.log(' + %s %s | pipe-output', command, argumentList.join(' '));
    _shellSync('inherit', command, argumentList);
}
exports.shellExec = shellExec;
function shellExecAsync(cmd, ...args) {
    const [command, argumentList] = handlers_1.parseCommand(cmd, args);
    console.log(' + %s %s | pipe-output', command, argumentList.join(' '));
    const r = child_process_1.spawn(command, argumentList, {
        stdio: 'inherit',
        ...env_1.mergeEnv(),
    });
    return handlers_1.processPromise(r, [command, argumentList]);
}
exports.shellExecAsync = shellExecAsync;
function shellOutput(cmd, ...args) {
    const [command, argumentList] = handlers_1.parseCommand(cmd, args);
    console.log(' + %s %s | read-output', command, argumentList.join(' '));
    const r = _shellSync(['ignore', 'pipe', 'ignore'], command, argumentList);
    return r.stdout;
}
exports.shellOutput = shellOutput;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9EZXBlbmRlbmN5LmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvY2hpbGRwcm9jZXNzL25vRGVwZW5kZW5jeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlEQUErRDtBQUMvRCwrQkFBaUM7QUFDakMsbUNBQStDO0FBQy9DLHlDQUEwRDtBQUUxRCxrQ0FBa0M7QUFFbEMsU0FBUyxVQUFVLENBQUMsS0FBbUIsRUFBRSxHQUFXLEVBQUUsSUFBMkI7SUFDaEYsTUFBTSxDQUFDLEdBQUcseUJBQVMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQzlCLEtBQUs7UUFDTCxRQUFRLEVBQUUsTUFBTTtRQUNoQixHQUFHLGNBQVEsRUFBRTtLQUNiLENBQUMsQ0FBQztJQUNILElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRTtRQUNaLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQztLQUNkO0lBQ0QsNEJBQW9CLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3JFLE9BQU8sQ0FBQyxDQUFDO0FBQ1YsQ0FBQztBQUVELFNBQWdCLFNBQVMsQ0FBQyxHQUFXLEVBQUUsR0FBRyxJQUFjO0lBQ3ZELE1BQU0sQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLEdBQUcsdUJBQVksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDeEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRSxPQUFPLEVBQUUsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3ZFLFVBQVUsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQzlDLENBQUM7QUFKRCw4QkFJQztBQUVELFNBQWdCLGNBQWMsQ0FBQyxHQUFXLEVBQUUsR0FBRyxJQUFjO0lBQzVELE1BQU0sQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLEdBQUcsdUJBQVksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDeEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRSxPQUFPLEVBQUUsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3ZFLE1BQU0sQ0FBQyxHQUFHLHFCQUFLLENBQUMsT0FBTyxFQUFFLFlBQVksRUFBRTtRQUN0QyxLQUFLLEVBQUUsU0FBUztRQUNoQixHQUFHLGNBQVEsRUFBRTtLQUNiLENBQUMsQ0FBQztJQUNILE9BQU8seUJBQWMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQztBQUNuRCxDQUFDO0FBUkQsd0NBUUM7QUFFRCxTQUFnQixXQUFXLENBQUMsR0FBVyxFQUFFLEdBQUcsSUFBYztJQUN6RCxNQUFNLENBQUMsT0FBTyxFQUFFLFlBQVksQ0FBQyxHQUFHLHVCQUFZLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3hELE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEVBQUUsT0FBTyxFQUFFLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUN2RSxNQUFNLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxFQUFFLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQztJQUMxRSxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUM7QUFDakIsQ0FBQztBQUxELGtDQUtDIn0=
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
    [cmd, args] = handlers_1.parseCommand(cmd, args);
    console.log(' + %s %s | pipe-output', cmd, args.join(' '));
    _shellSync('inherit', cmd, args);
}
exports.shellExec = shellExec;
function shellExecAsync(cmd, ...args) {
    [cmd, args] = handlers_1.parseCommand(cmd, args);
    console.log(' + %s %s | pipe-output', cmd, args.join(' '));
    const r = child_process_1.spawn(cmd, args, {
        stdio: 'inherit',
        ...env_1.mergeEnv(),
    });
    return handlers_1.processPromise(r, [cmd, args]);
}
exports.shellExecAsync = shellExecAsync;
function shellOutput(cmd, ...args) {
    [cmd, args] = handlers_1.parseCommand(cmd, args);
    console.log(' + %s %s | read-output', cmd, args.join(' '));
    const r = _shellSync(['ignore', 'pipe', 'ignore'], cmd, args);
    return r.stdout;
}
exports.shellOutput = shellOutput;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9EZXBlbmRlbmN5LmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvY2hpbGRwcm9jZXNzL25vRGVwZW5kZW5jeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlEQUErRDtBQUMvRCwrQkFBaUM7QUFDakMsbUNBQStDO0FBQy9DLHlDQUEwRDtBQUUxRCxrQ0FBa0M7QUFFbEMsU0FBUyxVQUFVLENBQUMsS0FBbUIsRUFBRSxHQUFXLEVBQUUsSUFBYztJQUNuRSxNQUFNLENBQUMsR0FBRyx5QkFBUyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUU7UUFDOUIsS0FBSztRQUNMLFFBQVEsRUFBRSxNQUFNO1FBQ2hCLEdBQUcsY0FBUSxFQUFFO0tBQ2IsQ0FBQyxDQUFDO0lBQ0gsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFO1FBQ1osTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDO0tBQ2Q7SUFDRCw0QkFBb0IsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDckUsT0FBTyxDQUFDLENBQUM7QUFDVixDQUFDO0FBRUQsU0FBZ0IsU0FBUyxDQUFDLEdBQVcsRUFBRSxHQUFHLElBQWM7SUFDdkQsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsdUJBQVksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzNELFVBQVUsQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2xDLENBQUM7QUFKRCw4QkFJQztBQUVELFNBQWdCLGNBQWMsQ0FBQyxHQUFXLEVBQUUsR0FBRyxJQUFjO0lBQzVELENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLHVCQUFZLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMzRCxNQUFNLENBQUMsR0FBRyxxQkFBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUU7UUFDMUIsS0FBSyxFQUFFLFNBQVM7UUFDaEIsR0FBRyxjQUFRLEVBQUU7S0FDYixDQUFDLENBQUM7SUFDSCxPQUFPLHlCQUFjLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDdkMsQ0FBQztBQVJELHdDQVFDO0FBRUQsU0FBZ0IsV0FBVyxDQUFDLEdBQVcsRUFBRSxHQUFHLElBQWM7SUFDekQsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsdUJBQVksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzNELE1BQU0sQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzlELE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQztBQUNqQixDQUFDO0FBTEQsa0NBS0MifQ==
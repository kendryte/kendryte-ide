"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const error_1 = require("./error");
const handlers_1 = require("./handlers");
/* No use any node_modules deps */
function shellSync(stdio, cmd, args) {
    const r = child_process_1.spawnSync(cmd, args, {
        stdio,
        encoding: 'utf8',
    });
    if (r.error) {
        throw r.error;
    }
    error_1.ThrowStatusCodeError(r.status, r.signal);
    return r;
}
function shellExec(cmd, ...args) {
    [cmd, args] = handlers_1.parseCommand(cmd, args);
    console.log(' + %s %s | pipe-output', cmd, args.join(' '));
    shellSync('inherit', cmd, args);
}
exports.shellExec = shellExec;
function shellExecAsync(cmd, ...args) {
    [cmd, args] = handlers_1.parseCommand(cmd, args);
    console.log(' + %s %s | pipe-output', cmd, args.join(' '));
    const r = child_process_1.spawn(cmd, args, {
        stdio: 'inherit',
    });
    return new Promise((resolve, reject) => {
        const wrappedCallback = (err, data) => err ? reject(err) : resolve(data);
        r.on('error', (e) => {
            reject(e);
        });
        r.on('exit', (status, signal) => {
            const e = error_1.StatusCodeError(status, signal);
            if (e) {
                reject(e);
            }
            else {
                resolve();
            }
        });
    });
}
exports.shellExecAsync = shellExecAsync;
function shellOutput(cmd, ...args) {
    [cmd, args] = handlers_1.parseCommand(cmd, args);
    console.log(' + %s %s | read-output', cmd, args.join(' '));
    const r = shellSync(['ignore', 'pipe', 'ignore'], cmd, args);
    return r.stdout;
}
exports.shellOutput = shellOutput;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9EZXBlbmRlbmN5LmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvY2hpbGRwcm9jZXNzL25vRGVwZW5kZW5jeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlEQUErRDtBQUMvRCxtQ0FBZ0U7QUFDaEUseUNBQTBDO0FBRTFDLGtDQUFrQztBQUVsQyxTQUFTLFNBQVMsQ0FBQyxLQUFtQixFQUFFLEdBQVcsRUFBRSxJQUFjO0lBQ2xFLE1BQU0sQ0FBQyxHQUFHLHlCQUFTLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRTtRQUM5QixLQUFLO1FBQ0wsUUFBUSxFQUFFLE1BQU07S0FDaEIsQ0FBQyxDQUFDO0lBQ0gsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFO1FBQ1osTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDO0tBQ2Q7SUFDRCw0QkFBb0IsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN6QyxPQUFPLENBQUMsQ0FBQztBQUNWLENBQUM7QUFFRCxTQUFnQixTQUFTLENBQUMsR0FBVyxFQUFFLEdBQUcsSUFBYztJQUN2RCxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyx1QkFBWSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN0QyxPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDM0QsU0FBUyxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDakMsQ0FBQztBQUpELDhCQUlDO0FBRUQsU0FBZ0IsY0FBYyxDQUFDLEdBQVcsRUFBRSxHQUFHLElBQWM7SUFDNUQsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsdUJBQVksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzNELE1BQU0sQ0FBQyxHQUFHLHFCQUFLLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRTtRQUMxQixLQUFLLEVBQUUsU0FBUztLQUNoQixDQUFDLENBQUM7SUFDSCxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ3RDLE1BQU0sZUFBZSxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFBLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV4RSxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ25CLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNYLENBQUMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxNQUFjLEVBQUUsTUFBYyxFQUFFLEVBQUU7WUFDL0MsTUFBTSxDQUFDLEdBQUcsdUJBQWUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDMUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ04sTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ1Y7aUJBQU07Z0JBQ04sT0FBTyxFQUFFLENBQUM7YUFDVjtRQUNGLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDO0FBckJELHdDQXFCQztBQUVELFNBQWdCLFdBQVcsQ0FBQyxHQUFXLEVBQUUsR0FBRyxJQUFjO0lBQ3pELENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLHVCQUFZLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMzRCxNQUFNLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM3RCxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUM7QUFDakIsQ0FBQztBQUxELGtDQUtDIn0=
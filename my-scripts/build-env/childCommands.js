"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const stream_1 = require("stream");
const include_1 = require("./include");
function ThrowStatusCodeError(status, signal) {
    const e = StatusCodeError(status, signal);
    if (e) {
        throw e;
    }
    return;
}
function StatusCodeError(status, signal) {
    if (status === 0 && !signal) {
        return null;
    }
    new Error(signal ? `Program exit by signal "${signal}"` : `Program exit with code "${status}"`);
}
function parseCommand(cmd, args) {
    if (include_1.isWin) {
        return ['powershell.exe', ['-Command', cmd, ...args]];
    }
    else {
        return [cmd, args];
    }
}
function execCommand(cmd, ...args) {
    console.log(' + %s %s', cmd, args.join(' '));
    [cmd, args] = parseCommand(cmd, args);
    const r = child_process_1.spawnSync(cmd, args, {
        stdio: 'inherit',
        encoding: 'utf8',
    });
    if (r.error) {
        throw r.error;
    }
    ThrowStatusCodeError(r.status, r.signal);
}
exports.execCommand = execCommand;
async function simpleOutput(cmd) {
    const [_cmd, args] = parseCommand(cmd, []);
    return child_process_1.spawn(_cmd, args, {
        stdio: ['inherit', 'pipe', ''],
        encoding: 'utf8',
    });
}
exports.simpleOutput = simpleOutput;
function outputCommand(exec, ...args) {
    const output = new stream_1.Duplex();
    return {
        output,
        wait() {
            const cp = child_process_1.spawn(exec, args, {
                stdio: ['ignore', output, output],
            });
            return new Promise((resolve, reject) => {
                cp.once('error', reject);
                cp.once('exit', (code, signal) => {
                    const e = StatusCodeError(code, signal);
                    if (e) {
                        reject(e);
                    }
                    else {
                        resolve();
                    }
                });
            });
        },
    };
}
exports.outputCommand = outputCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hpbGRDb21tYW5kcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNoaWxkQ29tbWFuZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxpREFBaUQ7QUFDakQsbUNBQTBDO0FBQzFDLHVDQUFrQztBQUVsQyxTQUFTLG9CQUFvQixDQUFDLE1BQWMsRUFBRSxNQUFjO0lBQzNELE1BQU0sQ0FBQyxHQUFHLGVBQWUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDMUMsSUFBSSxDQUFDLEVBQUU7UUFDTixNQUFNLENBQUMsQ0FBQztLQUNSO0lBQ0QsT0FBTztBQUNSLENBQUM7QUFFRCxTQUFTLGVBQWUsQ0FBQyxNQUFjLEVBQUUsTUFBYztJQUN0RCxJQUFJLE1BQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDNUIsT0FBTyxJQUFJLENBQUM7S0FDWjtJQUNELElBQUksS0FBSyxDQUNSLE1BQU0sQ0FBQyxDQUFDLENBQUMsMkJBQTJCLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQywyQkFBMkIsTUFBTSxHQUFHLENBQ3BGLENBQUM7QUFDSCxDQUFDO0FBRUQsU0FBUyxZQUFZLENBQUMsR0FBVyxFQUFFLElBQWM7SUFDaEQsSUFBSSxlQUFLLEVBQUU7UUFDVixPQUFPLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxVQUFVLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztLQUN0RDtTQUFNO1FBQ04sT0FBTyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztLQUNuQjtBQUNGLENBQUM7QUFFRCxTQUFnQixXQUFXLENBQUMsR0FBVyxFQUFFLEdBQUcsSUFBYztJQUN6RCxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzdDLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLFlBQVksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdEMsTUFBTSxDQUFDLEdBQUcseUJBQVMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQzlCLEtBQUssRUFBRSxTQUFTO1FBQ2hCLFFBQVEsRUFBRSxNQUFNO0tBQ2hCLENBQUMsQ0FBQztJQUNILElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRTtRQUNaLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQztLQUNkO0lBQ0Qsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDMUMsQ0FBQztBQVhELGtDQVdDO0FBRU0sS0FBSyxVQUFVLFlBQVksQ0FBQyxHQUFXO0lBQzdDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsWUFBWSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUMzQyxPQUFPLHFCQUFLLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRTtRQUN4QixLQUFLLEVBQUUsQ0FBQyxTQUFTLEVBQUMsTUFBTSxFQUFDLEVBQUUsQ0FBQztRQUM1QixRQUFRLEVBQUUsTUFBTTtLQUNoQixDQUFDLENBQUM7QUFDSixDQUFDO0FBTkQsb0NBTUM7QUFPRCxTQUFnQixhQUFhLENBQUMsSUFBWSxFQUFFLEdBQUcsSUFBYztJQUM1RCxNQUFNLE1BQU0sR0FBRyxJQUFJLGVBQU0sRUFBRSxDQUFDO0lBQzVCLE9BQU87UUFDTixNQUFNO1FBQ04sSUFBSTtZQUNILE1BQU0sRUFBRSxHQUFHLHFCQUFLLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRTtnQkFDNUIsS0FBSyxFQUFFLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUM7YUFDakMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtnQkFDdEMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ3pCLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBWSxFQUFFLE1BQWMsRUFBRSxFQUFFO29CQUNoRCxNQUFNLENBQUMsR0FBRyxlQUFlLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUN4QyxJQUFJLENBQUMsRUFBRTt3QkFDTixNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQ1Y7eUJBQU07d0JBQ04sT0FBTyxFQUFFLENBQUM7cUJBQ1Y7Z0JBQ0YsQ0FBQyxDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRCxDQUFDO0FBQ0gsQ0FBQztBQXRCRCxzQ0FzQkMifQ==
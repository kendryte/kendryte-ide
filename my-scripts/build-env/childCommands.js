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
function chdir(d) {
    process.chdir(d);
    console.log(' > %s', process.cwd());
}
exports.chdir = chdir;
function StatusCodeError(status, signal) {
    if (status === 0 && !signal) {
        return null;
    }
    return new Error(signal ? `Program exit by signal "${signal}"` : `Program exit with code "${status}"`);
}
function parseCommand(cmd, args) {
    if (include_1.isWin) {
        return ['powershell.exe', ['-Command', cmd, ...args]];
    }
    else {
        return [cmd, args];
    }
}
function shellSync(stdio, cmd, args) {
    const r = child_process_1.spawnSync(cmd, args, {
        stdio,
        encoding: 'utf8',
    });
    if (r.error) {
        throw r.error;
    }
    ThrowStatusCodeError(r.status, r.signal);
    return r;
}
function shellExec(cmd, ...args) {
    [cmd, args] = parseCommand(cmd, args);
    console.log(' + %s %s | pipe-output', cmd, args.join(' '));
    shellSync('inherit', cmd, args);
}
exports.shellExec = shellExec;
function shellMute(cmd, ...args) {
    [cmd, args] = parseCommand(cmd, args);
    console.log(' + %s %s | mute-output', cmd, args.join(' '));
    shellSync(['ignore', 'ignore', 'inherit'], cmd, args);
}
exports.shellMute = shellMute;
function shellOutput(cmd, ...args) {
    [cmd, args] = parseCommand(cmd, args);
    console.log(' + %s %s | read-output', cmd, args.join(' '));
    const r = shellSync(['ignore', 'pipe', 'inherit'], cmd, args);
    return r.stdout;
}
exports.shellOutput = shellOutput;
function outputCommand(cmd, ...args) {
    [cmd, args] = parseCommand(cmd, args);
    console.log(' + %s %s | stream-output', cmd, args.join(' '));
    const output = new stream_1.Duplex();
    return {
        output,
        wait() {
            const cp = child_process_1.spawn(cmd, args, {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hpbGRDb21tYW5kcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNoaWxkQ29tbWFuZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxpREFBaUQ7QUFDakQsbUNBQTBDO0FBQzFDLHVDQUFrQztBQUVsQyxTQUFTLG9CQUFvQixDQUFDLE1BQWMsRUFBRSxNQUFjO0lBQzNELE1BQU0sQ0FBQyxHQUFHLGVBQWUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDMUMsSUFBSSxDQUFDLEVBQUU7UUFDTixNQUFNLENBQUMsQ0FBQztLQUNSO0lBQ0QsT0FBTztBQUNSLENBQUM7QUFFRCxTQUFnQixLQUFLLENBQUMsQ0FBUztJQUM5QixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ3JDLENBQUM7QUFIRCxzQkFHQztBQUVELFNBQVMsZUFBZSxDQUFDLE1BQWMsRUFBRSxNQUFjO0lBQ3RELElBQUksTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUM1QixPQUFPLElBQUksQ0FBQztLQUNaO0lBQ0QsT0FBTyxJQUFJLEtBQUssQ0FDZixNQUFNLENBQUMsQ0FBQyxDQUFDLDJCQUEyQixNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsMkJBQTJCLE1BQU0sR0FBRyxDQUNwRixDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQVMsWUFBWSxDQUFDLEdBQVcsRUFBRSxJQUFjO0lBQ2hELElBQUksZUFBSyxFQUFFO1FBQ1YsT0FBTyxDQUFDLGdCQUFnQixFQUFFLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDdEQ7U0FBTTtRQUNOLE9BQU8sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDbkI7QUFDRixDQUFDO0FBRUQsU0FBUyxTQUFT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
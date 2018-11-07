"use strict";
/* No use any node_modules deps */
Object.defineProperty(exports, "__esModule", { value: true });
function ThrowStatusCodeError(status, signal, cmd) {
    const e = StatusCodeError(status, signal, cmd);
    if (e) {
        throw e;
    }
    return;
}
exports.ThrowStatusCodeError = ThrowStatusCodeError;
function StatusCodeError(status, signal, cmd) {
    if (status === 0 && !signal) {
        return null;
    }
    const __program = `Command = ${cmd[0]}` + cmd[1].map((arg, index) => {
        return `\nArgument[${index}] = ${arg}`;
    }).join('');
    return Object.assign(new Error(signal ? `Program exit by signal "${signal}"` : `Program exit with code "${status}"`), {
        status, signal,
        __programError: true,
        __program,
        __cwd: cmd[2],
    });
}
exports.StatusCodeError = StatusCodeError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImJ1aWxkLWVudi9jaGlsZHByb2Nlc3MvZXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLGtDQUFrQzs7QUFZbEMsU0FBZ0Isb0JBQW9CLENBQUMsTUFBYyxFQUFFLE1BQWMsRUFBRSxHQUFtQjtJQUN2RixNQUFNLENBQUMsR0FBRyxlQUFlLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztJQUMvQyxJQUFJLENBQUMsRUFBRTtRQUNOLE1BQU0sQ0FBQyxDQUFDO0tBQ1I7SUFDRCxPQUFPO0FBQ1IsQ0FBQztBQU5ELG9EQU1DO0FBRUQsU0FBZ0IsZUFBZSxDQUFDLE1BQWMsRUFBRSxNQUFjLEVBQUUsR0FBbUI7SUFDbEYsSUFBSSxNQUFNLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO1FBQzVCLE9BQU8sSUFBSSxDQUFDO0tBQ1o7SUFDRCxNQUFNLFNBQVMsR0FBRyxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFDbkUsT0FBTyxjQUFjLEtBQUssT0FBTyxHQUFHLEVBQUUsQ0FBQztJQUN4QyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDWixPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQzdCLE1BQU0sQ0FBQSxDQUFDLENBQUMsMkJBQTJCLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQywyQkFBMkIsTUFBTSxHQUFHLENBQ25GLEVBQUU7UUFDRixNQUFNLEVBQUUsTUFBTTtRQUNkLGNBQWMsRUFBRSxJQUFJO1FBQ3BCLFNBQVM7UUFDVCxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztLQUNiLENBQUMsQ0FBQztBQUNKLENBQUM7QUFmRCwwQ0FlQyJ9
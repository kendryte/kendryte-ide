"use strict";
/* No use any node_modules deps */
Object.defineProperty(exports, "__esModule", { value: true });
const globalOutput_1 = require("../misc/globalOutput");
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
    const __program = `\`${cmd[0]} ${cmd[1].join(' ')}\`
    Command = ${cmd[0]}
${globalOutput_1.indentArgs(cmd[1])}
`;
    return Object.assign(new Error(signal ? `Program exit by signal "${signal}"` : `Program exit with code "${status}"`), {
        status, signal,
        __programError: true,
        __program,
        __cwd: cmd[2],
    });
}
exports.StatusCodeError = StatusCodeError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImJ1aWxkLWVudi9jaGlsZHByb2Nlc3MvZXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLGtDQUFrQzs7QUFFbEMsdURBQWtEO0FBWWxELFNBQWdCLG9CQUFvQixDQUFDLE1BQWMsRUFBRSxNQUFjLEVBQUUsR0FBbUI7SUFDdkYsTUFBTSxDQUFDLEdBQUcsZUFBZSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDL0MsSUFBSSxDQUFDLEVBQUU7UUFDTixNQUFNLENBQUMsQ0FBQztLQUNSO0lBQ0QsT0FBTztBQUNSLENBQUM7QUFORCxvREFNQztBQUVELFNBQWdCLGVBQWUsQ0FBQyxNQUFjLEVBQUUsTUFBYyxFQUFFLEdBQW1CO0lBQ2xGLElBQUksTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUM1QixPQUFPLElBQUksQ0FBQztLQUNaO0lBQ0QsTUFBTSxTQUFTLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7Z0JBQ25DLEdBQUcsQ0FBQyxDQUFDLENBQUM7RUFDcEIseUJBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDbkIsQ0FBQztJQUNELE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FDN0IsTUFBTSxDQUFBLENBQUMsQ0FBQywyQkFBMkIsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLDJCQUEyQixNQUFNLEdBQUcsQ0FDbkYsRUFBRTtRQUNGLE1BQU0sRUFBRSxNQUFNO1FBQ2QsY0FBYyxFQUFFLElBQUk7UUFDcEIsU0FBUztRQUNULEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0tBQ2IsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQWhCRCwwQ0FnQkMifQ==
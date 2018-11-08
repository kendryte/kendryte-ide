"use strict";
/* No use any node_modules deps */
Object.defineProperty(exports, "__esModule", { value: true });
function indentArgs(args) {
    return args.map((arg, index) => {
        return `  Argument[${index}] = ${arg}`;
    }).join('\n');
}
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
${indentArgs(cmd[1])}
`;
    return Object.assign(new Error(signal ? `Program exit by signal "${signal}"` : `Program exit with code "${status}"`), {
        status, signal,
        __programError: true,
        __program,
        __cwd: cmd[2],
    });
}
exports.StatusCodeError = StatusCodeError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImJ1aWxkLWVudi9jaGlsZHByb2Nlc3MvZXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLGtDQUFrQzs7QUFFbEMsU0FBUyxVQUFVLENBQUMsSUFBMkI7SUFDOUMsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFO1FBQzlCLE9BQU8sY0FBYyxLQUFLLE9BQU8sR0FBRyxFQUFFLENBQUM7SUFDeEMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2YsQ0FBQztBQVlELFNBQWdCLG9CQUFvQixDQUFDLE1BQWMsRUFBRSxNQUFjLEVBQUUsR0FBbUI7SUFDdkYsTUFBTSxDQUFDLEdBQUcsZUFBZSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDL0MsSUFBSSxDQUFDLEVBQUU7UUFDTixNQUFNLENBQUMsQ0FBQztLQUNSO0lBQ0QsT0FBTztBQUNSLENBQUM7QUFORCxvREFNQztBQUVELFNBQWdCLGVBQWUsQ0FBQyxNQUFjLEVBQUUsTUFBYyxFQUFFLEdBQW1CO0lBQ2xGLElBQUksTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUM1QixPQUFPLElBQUksQ0FBQztLQUNaO0lBQ0QsTUFBTSxTQUFTLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7Z0JBQ25DLEdBQUcsQ0FBQyxDQUFDLENBQUM7RUFDcEIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNuQixDQUFDO0lBQ0QsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxDQUM3QixNQUFNLENBQUEsQ0FBQyxDQUFDLDJCQUEyQixNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsMkJBQTJCLE1BQU0sR0FBRyxDQUNuRixFQUFFO1FBQ0YsTUFBTSxFQUFFLE1BQU07UUFDZCxjQUFjLEVBQUUsSUFBSTtRQUNwQixTQUFTO1FBQ1QsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDYixDQUFDLENBQUM7QUFDSixDQUFDO0FBaEJELDBDQWdCQyJ9
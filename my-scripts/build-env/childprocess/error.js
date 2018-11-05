"use strict";
/* No use any node_modules deps */
Object.defineProperty(exports, "__esModule", { value: true });
function ThrowStatusCodeError(status, signal) {
    const e = StatusCodeError(status, signal);
    if (e) {
        throw e;
    }
    return;
}
exports.ThrowStatusCodeError = ThrowStatusCodeError;
function StatusCodeError(status, signal) {
    if (status === 0 && !signal) {
        return null;
    }
    return Object.assign(new Error(signal ? `Program exit by signal "${signal}"` : `Program exit with code "${status}"`), {
        status, signal,
        __programError: true,
    });
}
exports.StatusCodeError = StatusCodeError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImJ1aWxkLWVudi9jaGlsZHByb2Nlc3MvZXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLGtDQUFrQzs7QUFRbEMsU0FBZ0Isb0JBQW9CLENBQUMsTUFBYyxFQUFFLE1BQWM7SUFDbEUsTUFBTSxDQUFDLEdBQUcsZUFBZSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMxQyxJQUFJLENBQUMsRUFBRTtRQUNOLE1BQU0sQ0FBQyxDQUFDO0tBQ1I7SUFDRCxPQUFPO0FBQ1IsQ0FBQztBQU5ELG9EQU1DO0FBRUQsU0FBZ0IsZUFBZSxDQUFDLE1BQWMsRUFBRSxNQUFjO0lBQzdELElBQUksTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUM1QixPQUFPLElBQUksQ0FBQztLQUNaO0lBQ0QsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxDQUM3QixNQUFNLENBQUEsQ0FBQyxDQUFDLDJCQUEyQixNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsMkJBQTJCLE1BQU0sR0FBRyxDQUNuRixFQUFFO1FBQ0YsTUFBTSxFQUFFLE1BQU07UUFDZCxjQUFjLEVBQUUsSUFBSTtLQUNwQixDQUFDLENBQUM7QUFDSixDQUFDO0FBVkQsMENBVUMifQ==
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function timing() {
    const date = new Date;
    return function () {
        const t = (Date.now() - date.getTime()) / 1000;
        return ` (in ${t.toFixed(2)} sec)`;
    };
}
exports.timing = timing;
function timeout(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}
exports.timeout = timeout;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZVV0aWwuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImJ1aWxkLWVudi9taXNjL3RpbWVVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsU0FBZ0IsTUFBTTtJQUNyQixNQUFNLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQztJQUV0QixPQUFPO1FBQ04sTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQy9DLE9BQU8sUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7SUFDcEMsQ0FBQyxDQUFDO0FBQ0gsQ0FBQztBQVBELHdCQU9DO0FBRUQsU0FBZ0IsT0FBTyxDQUFDLEVBQVU7SUFDakMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUN0QyxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3pCLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUpELDBCQUlDIn0=
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
function WIT() {
    return process.argv.includes('--what-is-this');
}
exports.WIT = WIT;
function helpTip(cmd, msg) {
    console.log('\x1B[48;5;0;1m * \x1B[38;5;14m%s\x1B[0;48;5;0m - %s.', cmd, msg);
}
exports.helpTip = helpTip;
function whatIsThis(self, title) {
    if (WIT()) {
        helpTip(path_1.basename(self, '.js'), title);
    }
}
exports.whatIsThis = whatIsThis;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiYnVpbGQtZW52L21pc2MvaGVscC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUFnQztBQUVoQyxTQUFnQixHQUFHO0lBQ2xCLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNoRCxDQUFDO0FBRkQsa0JBRUM7QUFFRCxTQUFnQixPQUFPLENBQUMsR0FBVyxFQUFFLEdBQVc7SUFDL0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzREFBc0QsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDL0UsQ0FBQztBQUZELDBCQUVDO0FBRUQsU0FBZ0IsVUFBVSxDQUFDLElBQVksRUFBRSxLQUFhO0lBQ3JELElBQUksR0FBRyxFQUFFLEVBQUU7UUFDVixPQUFPLENBQUMsZUFBUSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztLQUN0QztBQUNGLENBQUM7QUFKRCxnQ0FJQyJ9
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
function gulpCommands(absolute) {
    if (absolute) {
        return ['--max-old-space-size=4096', path_1.resolve(absolute, 'node_modules/gulp/bin/gulp.js')];
    }
    else {
        return ['--max-old-space-size=4096', './node_modules/gulp/bin/gulp.js'];
    }
}
exports.gulpCommands = gulpCommands;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3VscC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiYnVpbGQtZW52L2NvZGVibG9ja3MvZ3VscC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUErQjtBQUUvQixTQUFnQixZQUFZLENBQUMsUUFBaUI7SUFDN0MsSUFBSSxRQUFRLEVBQUU7UUFDYixPQUFPLENBQUMsMkJBQTJCLEVBQUUsY0FBTyxDQUFDLFFBQVEsRUFBRSwrQkFBK0IsQ0FBQyxDQUFDLENBQUM7S0FDekY7U0FBTTtRQUNOLE9BQU8sQ0FBQywyQkFBMkIsRUFBRSxpQ0FBaUMsQ0FBQyxDQUFDO0tBQ3hFO0FBQ0YsQ0FBQztBQU5ELG9DQU1DIn0=
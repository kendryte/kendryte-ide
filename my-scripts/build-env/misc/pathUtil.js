"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const constants_1 = require("./constants");
const fsUtil_1 = require("./fsUtil");
/* No use any node_modules deps */
function chdir(d) {
    d = path_1.normalize(d);
    process.chdir(d);
    console.log('\n > %s', process.cwd());
}
exports.chdir = chdir;
function ensureChdir(p) {
    p = path_1.normalize(p);
    fsUtil_1.mkdirpSync(p);
    return chdir(p);
}
exports.ensureChdir = ensureChdir;
function yarnPackageDir(what) {
    return path_1.resolve(constants_1.RELEASE_ROOT, 'yarn-dir', what);
}
exports.yarnPackageDir = yarnPackageDir;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aFV0aWwuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImJ1aWxkLWVudi9taXNjL3BhdGhVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQTBDO0FBQzFDLDJDQUEyQztBQUMzQyxxQ0FBc0M7QUFDdEMsa0NBQWtDO0FBRWxDLFNBQWdCLEtBQUssQ0FBQyxDQUFTO0lBQzlCLENBQUMsR0FBRyxnQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pCLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDdkMsQ0FBQztBQUpELHNCQUlDO0FBRUQsU0FBZ0IsV0FBVyxDQUFDLENBQVM7SUFDcEMsQ0FBQyxHQUFHLGdCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakIsbUJBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNkLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pCLENBQUM7QUFKRCxrQ0FJQztBQUVELFNBQWdCLGNBQWMsQ0FBQyxJQUFZO0lBQzFDLE9BQU8sY0FBTyxDQUFDLHdCQUFZLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2hELENBQUM7QUFGRCx3Q0FFQyJ9
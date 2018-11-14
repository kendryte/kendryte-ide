"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const constants_1 = require("./constants");
const fsUtil_1 = require("./fsUtil");
function chdir(d) {
    d = path_1.normalize(d);
    if (process.cwd() !== d) {
        process.chdir(d);
        console.log('\n > %s', process.cwd());
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aFV0aWwuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImJ1aWxkLWVudi9taXNjL3BhdGhVdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQTBDO0FBQzFDLDJDQUEyQztBQUMzQyxxQ0FBc0M7QUFFdEMsU0FBZ0IsS0FBSyxDQUFDLENBQVM7SUFDOUIsQ0FBQyxHQUFHLGdCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakIsSUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUFFO1FBQ3hCLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7S0FDdEM7QUFDRixDQUFDO0FBTkQsc0JBTUM7QUFFRCxTQUFnQixXQUFXLENBQUMsQ0FBUztJQUNwQyxDQUFDLEdBQUcsZ0JBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqQixtQkFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2QsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakIsQ0FBQztBQUpELGtDQUlDO0FBRUQsU0FBZ0IsY0FBYyxDQUFDLElBQVk7SUFDMUMsT0FBTyxjQUFPLENBQUMsd0JBQVksRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDaEQsQ0FBQztBQUZELHdDQUVDIn0=
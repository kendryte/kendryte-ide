"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_1 = require("fs");
function nativePath(p) {
    return p.replace(/^\/cygdrive\/([a-z])/i, (m0, drv) => {
        return drv.toUpperCase() + ':';
    });
}
exports.nativePath = nativePath;
function mkdirpSync(p) {
    if (!p) {
        throw new Error('path must not empty string');
    }
    if (!fs_1.existsSync(p)) {
        mkdirpSync(path_1.resolve(p, '..'));
        fs_1.mkdirSync(p);
    }
}
exports.mkdirpSync = mkdirpSync;
function cdNewDir(p) {
    mkdirpSync(p);
    console.error('    chdir(%s)', p);
    process.chdir(p);
}
exports.cdNewDir = cdNewDir;
function yarnPackageDir(what) {
    return path_1.resolve(requireEnvPath('RELEASE_ROOT'), 'yarn-dir', what);
}
exports.yarnPackageDir = yarnPackageDir;
function requireEnvPath(name) {
    if (!process.env[name]) {
        throw new Error('Env ' + name + ' not set');
    }
    return nativePath(process.env[name]);
}
exports.requireEnvPath = requireEnvPath;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5jbHVkZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImluY2x1ZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQkFBK0I7QUFDL0IsMkJBQTJDO0FBRTNDLFNBQWdCLFVBQVUsQ0FBQyxDQUFDO0lBQzNCLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUNyRCxPQUFPLEdBQUcsQ0FBQyxXQUFXLEVBQUUsR0FBRyxHQUFHLENBQUM7SUFDaEMsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDO0FBSkQsZ0NBSUM7QUFFRCxTQUFnQixVQUFVLENBQUMsQ0FBQztJQUMzQixJQUFJLENBQUMsQ0FBQyxFQUFFO1FBQ1AsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0tBQzlDO0lBQ0QsSUFBSSxDQUFDLGVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNuQixVQUFVLENBQUMsY0FBTyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzdCLGNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNiO0FBQ0YsQ0FBQztBQVJELGdDQVFDO0FBRUQsU0FBZ0IsUUFBUSxDQUFDLENBQUM7SUFDekIsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2QsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDbEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsQixDQUFDO0FBSkQsNEJBSUM7QUFFRCxTQUFnQixjQUFjLENBQUMsSUFBSTtJQUNsQyxPQUFPLGNBQU8sQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2xFLENBQUM7QUFGRCx3Q0FFQztBQUVELFNBQWdCLGNBQWMsQ0FBQyxJQUFZO0lBQzFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ3ZCLE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksR0FBRyxVQUFVLENBQUMsQ0FBQztLQUM1QztJQUNELE9BQU8sVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN0QyxDQUFDO0FBTEQsd0NBS0MifQ==
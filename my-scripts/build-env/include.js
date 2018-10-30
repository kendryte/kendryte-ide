"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_1 = require("fs");
const os_1 = require("os");
const child_process_1 = require("child_process");
exports.isWin = os_1.platform() === 'win32';
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
function winSize() {
    try {
        if (os_1.platform() === 'win32' && !process.env.SHELL) {
            const cmd = 'powershell (Get-Host).UI.RawUI.WindowSize.width';
            const code = child_process_1.execSync(cmd).toString().trim();
            return parseInt(code);
        }
        else {
            const cmd = 'tput cols';
            const code = child_process_1.execSync(cmd).toString().trim();
            return parseInt(code);
        }
    }
    catch (e) {
    }
    return NaN;
}
exports.winSize = winSize;
function runMain(main) {
    main().catch((e) => {
        console.error('Command ' + e.message);
        process.exit(1);
    });
}
exports.runMain = runMain;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5jbHVkZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImluY2x1ZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQkFBK0I7QUFDL0IsMkJBQTJDO0FBQzNDLDJCQUE4QjtBQUM5QixpREFBeUM7QUFFNUIsUUFBQSxLQUFLLEdBQUcsYUFBUSxFQUFFLEtBQUssT0FBTyxDQUFDO0FBRTVDLFNBQWdCLFVBQVUsQ0FBQyxDQUFDO0lBQzNCLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUNyRCxPQUFPLEdBQUcsQ0FBQyxXQUFXLEVBQUUsR0FBRyxHQUFHLENBQUM7SUFDaEMsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDO0FBSkQsZ0NBSUM7QUFFRCxTQUFnQixVQUFVLENBQUMsQ0FBQztJQUMzQixJQUFJLENBQUMsQ0FBQyxFQUFFO1FBQ1AsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0tBQzlDO0lBQ0QsSUFBSSxDQUFDLGVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNuQixVQUFVLENBQUMsY0FBTyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzdCLGNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNiO0FBQ0YsQ0FBQztBQVJELGdDQVFDO0FBRUQsU0FBZ0IsUUFBUSxDQUFDLENBQUM7SUFDekIsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2QsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDbEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsQixDQUFDO0FBSkQsNEJBSUM7QUFFRCxTQUFnQixjQUFjLENBQUMsSUFBSTtJQUNsQyxPQUFPLGNBQU8sQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2xFLENBQUM7QUFGRCx3Q0FFQztBQUVELFNBQWdCLGNBQWMsQ0FBQyxJQUFZO0lBQzFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ3ZCLE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksR0FBRyxVQUFVLENBQUMsQ0FBQztLQUM1QztJQUNELE9BQU8sVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN0QyxDQUFDO0FBTEQsd0NBS0M7QUFFRCxTQUFnQixPQUFPO0lBQ3RCLElBQUk7UUFDSCxJQUFJLGFBQVEsRUFBRSxLQUFLLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFO1lBQ2pELE1BQU0sR0FBRyxHQUFHLGlEQUFpRCxDQUFDO1lBQzlELE1BQU0sSUFBSSxHQUFHLHdCQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDN0MsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdEI7YUFBTTtZQUNOLE1BQU0sR0FBRyxHQUFHLFdBQVcsQ0FBQztZQUN4QixNQUFNLElBQUksR0FBRyx3QkFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzdDLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3RCO0tBQ0Q7SUFBQyxPQUFPLENBQUMsRUFBRTtLQUNYO0lBQ0QsT0FBTyxHQUFHLENBQUM7QUFDWixDQUFDO0FBZEQsMEJBY0M7QUFFRCxTQUFnQixPQUFPLENBQUMsSUFBeUI7SUFDaEQsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7UUFDbEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakIsQ0FBQyxDQUFDLENBQUM7QUFDSixDQUFDO0FBTEQsMEJBS0MifQ==
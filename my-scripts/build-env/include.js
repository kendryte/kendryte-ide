"use strict";
///<reference types="node"/>
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const os_1 = require("os");
const path_1 = require("path");
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
    process.chdir(p);
    console.log('\n > %s', process.cwd());
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
    if (process.stderr.columns) {
        return process.stderr.columns;
    }
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
const disposeList = [];
function mainDispose(dispose) {
    disposeList.push(dispose);
}
exports.mainDispose = mainDispose;
let finalPromise = new Promise((resolve, reject) => {
    setImmediate(resolve);
});
function runMain(main) {
    const p = finalPromise = finalPromise.then(main);
    p.then(() => {
        if (finalPromise !== p) {
            return;
        }
        disposeList.forEach((cb) => {
            cb();
        });
    }, (e) => {
        console.error('\x1B[38;5;9mCommand Failed:\n\t%s\x1B[0m', e.message);
        disposeList.forEach((cb) => {
            cb(e);
        });
    }).then(() => {
        if (finalPromise !== p) {
            return;
        }
        process.exit(0);
    }, () => {
        process.exit(1);
    });
}
exports.runMain = runMain;
function thisIsABuildScript() {
    if (!process.env.RELEASE_ROOT) {
        console.error('Command Failed:\n\tPlease run start.ps1 first.');
        process.exit(1);
    }
}
exports.thisIsABuildScript = thisIsABuildScript;
function isLink(path) {
    try {
        return fs_1.lstatSync(path).isSymbolicLink();
    }
    catch (e) {
    }
}
exports.isLink = isLink;
function isExists(path) {
    try {
        fs_1.lstatSync(path);
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.isExists = isExists;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5jbHVkZS5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiYnVpbGQtZW52L2luY2x1ZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLDRCQUE0Qjs7QUFFNUIsaURBQXlDO0FBQ3pDLDJCQUFzRDtBQUN0RCwyQkFBOEI7QUFDOUIsK0JBQStCO0FBRWxCLFFBQUEsS0FBSyxHQUFHLGFBQVEsRUFBRSxLQUFLLE9BQU8sQ0FBQztBQUU1QyxTQUFnQixVQUFVLENBQUMsQ0FBQztJQUMzQixPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFDckQsT0FBTyxHQUFHLENBQUMsV0FBVyxFQUFFLEdBQUcsR0FBRyxDQUFDO0lBQ2hDLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUpELGdDQUlDO0FBRUQsU0FBZ0IsVUFBVSxDQUFDLENBQUM7SUFDM0IsSUFBSSxDQUFDLENBQUMsRUFBRTtRQUNQLE1BQU0sSUFBSSxLQUFLLENBQUMsNEJBQTRCLENBQUMsQ0FBQztLQUM5QztJQUNELElBQUksQ0FBQyxlQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDbkIsVUFBVSxDQUFDLGNBQU8sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUM3QixjQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDYjtBQUNGLENBQUM7QUFSRCxnQ0FRQztBQUVELFNBQWdCLFFBQVEsQ0FBQyxDQUFDO0lBQ3pCLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNkLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDdkMsQ0FBQztBQUpELDRCQUlDO0FBRUQsU0FBZ0IsY0FBYyxDQUFDLElBQUk7SUFDbEMsT0FBTyxjQUFPLENBQUMsY0FBYyxD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
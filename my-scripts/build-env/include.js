"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_1 = require("fs");
const os_1 = require("os");
const child_process_1 = require("child_process");
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
//# sourceMappingURL=include.js.map
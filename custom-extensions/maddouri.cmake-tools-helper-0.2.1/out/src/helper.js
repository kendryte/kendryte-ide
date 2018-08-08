'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
const github = require("@octokit/rest");
const os = require("os");
const mkdirp = require("mkdirp");
const fs = require("fs");
const decompress = require("decompress");
const request = require("request");
const request_progress = require("request-progress");
const url_exists = require("url-exists");
const compare_versions = require("compare-versions");
const child_process = require("child_process");
function cmakeArchBits() {
    const archName = os.arch();
    switch (archName) {
        case 'x64':
            return 64;
        case 'x32':
            return 32;
        case 'x86':
            return 32;
    }
}
exports.cmakeArchBits = cmakeArchBits;
// @return ['exact platform name', 'fallback name 1', 'fallback name 2']
function cmakePlatformNames() {
    const archBits = cmakeArchBits();
    const osName = os.type();
    switch (osName) {
        case 'Linux':
            if (archBits == 64) {
                return ['Linux-x86_64', 'Linux-i386'];
            }
            else {
                return ['Linux-i386'];
            }
        case 'Darwin':
            if (archBits == 64) {
                return ['Darwin-x86_64', 'Darwin64-universal', 'Darwin-universal'];
            }
            else {
                return ['Darwin-universal'];
            }
        case 'Windows_NT':
            if (archBits == 64) {
                return ['win64-x64', 'win32-x86'];
            }
            else {
                return ['win32-x86'];
            }
        default:
            throw 'Unsupported OS [' + osName + ']';
    }
}
exports.cmakePlatformNames = cmakePlatformNames;
function cmakePlatformExtension() {
    const osName = os.type();
    switch (osName) {
        case 'Linux':
            return '.tar.gz';
        case 'Darwin':
            return '.tar.gz';
        case 'Windows_NT':
            return '.zip';
        default:
            throw 'Unsupported OS [' + osName + ']';
    }
}
exports.cmakePlatformExtension = cmakePlatformExtension;
function makeConfigName(projectName, targetName, buildTypeName) {
    if (projectName == null || targetName == null || buildTypeName == null) {
        return 'null';
    }
    else {
        return `${projectName} / ${targetName} / ${buildTypeName}`;
    }
}
exports.makeConfigName = makeConfigName;
function vscodeFolderPath() {
    return path.join(vscode.workspace.rootPath || '~', '.vscode');
}
exports.vscodeFolderPath = vscodeFolderPath;
function initCMakeDownloadDir() {
    let cmakeDlPath = vscode.workspace.getConfiguration('cmake-tools-helper').get('cmake_download_path');
    if (cmakeDlPath == null) {
        const extPath = vscode.extensions.getExtension("maddouri.cmake-tools-helper").extensionPath;
        const cmakeDlPath = extPath + path.sep + 'cmake_download';
        vscode.workspace.getConfiguration('cmake-tools-helper').update('cmake_download_path', cmakeDlPath, true);
    }
    if (!fs.existsSync(cmakeDlPath)) {
        mkdirp.sync(cmakeDlPath);
        if (!fs.existsSync(cmakeDlPath)) {
            const msg = `Fail: Creation of cmakeDlPath:${cmakeDlPath}`;
            console.error(msg);
            vscode.window.showErrorMessage(msg);
            return;
        }
    }
    console.log(`cmake-tools-helper.cmake_download_path:${cmakeDlPath}`);
}
exports.initCMakeDownloadDir = initCMakeDownloadDir;
function installCMake() {
    getRemoteCMakeVersionNames((remoteVersions) => __awaiter(this, void 0, void 0, function* () {
        remoteVersions.sort().reverse();
        const versionToDownload = yield vscode.window.showQuickPick(remoteVersions, {
            matchOnDescription: true,
            matchOnDetail: true,
            placeHolder: 'Choose a CMake version to download and install',
            ignoreFocusOut: true
        });
        if (versionToDownload == null) {
            return null;
        }
        downloadAndInstallCMake(versionToDownload, (installedCMakeRootDir) => __awaiter(this, void 0, void 0, function* () {
            if (installedCMakeRootDir == null) {
                console.error(`Failed to download CMake ${versionToDownload}`);
                return null;
            }
            const installedCMakePath = `${installedCMakeRootDir}${path.sep}bin${path.sep}cmake`;
            const currentCMakePath = vscode.workspace.getConfiguration('cmake').get('cmakePath');
            const msg = `CMake ${versionToDownload} installed in ${installedCMakeRootDir}`;
            console.log(msg);
            const setCMakePath = yield vscode.window.showQuickPick([
                {
                    label: 'Yes',
                    description: `Set "cmake.cmakePath": "${installedCMakePath}"`
                }, {
                    label: 'No',
                    description: `Keep "cmake.cmakePath": "${currentCMakePath}"`
                }
            ], {
                matchOnDescription: true,
                matchOnDetail: true,
                placeHolder: 'Update cmake.cmakePath ?',
                ignoreFocusOut: true
            });
            if (setCMakePath.label == 'Yes') {
                yield vscode.workspace.getConfiguration('cmake').update('cmakePath', `${installedCMakePath}`, true);
                const useCMakeServer = compare_versions(versionToDownload, '3.7.1') > 0;
                yield vscode.workspace.getConfiguration('cmake').update('useCMakeServer', useCMakeServer, true);
                vscode.window.showInformationMessage(`CMake Tools will use CMake ${versionToDownload} after restarting Visual Studio Code`);
            }
        }));
    }));
}
exports.installCMake = installCMake;
function getRemoteCMakeVersionNames(onReceivedTagsCB) {
    let ghClient = new github({
        headers: {
            // https://developer.github.com/v3/#user-agent-required
            'user-agent': 'vscode'
            //, 'Authorization': 'token MY_SECRET_TOKEN'  // TODO remove me
        }
    });
    let tags = [];
    const getTags = (err, res) => {
        if (err) {
            return false;
        }
        Array.prototype.push.apply(tags, res.data.map(t => t.ref));
        if (ghClient.hasNextPage(res)) {
            ghClient.getNextPage(res, (err, res) => { return getTags(err, res); });
        }
        else {
            onReceivedTagsCB(tags.map(t => t.replace('refs/tags/', '')));
        }
    };
    ghClient.gitdata.getTags({
        owner: 'Kitware',
        repo: 'CMake'
    }, (err, res) => {
        getTags(err, res);
    });
}
exports.getRemoteCMakeVersionNames = getRemoteCMakeVersionNames;
function downloadAndInstallCMake(versionName, onDownloadInstallFinish) {
    const versionNumber = versionName.replace(/^v/, '');
    const versionArray = versionNumber.split('.');
    const versionMajor = versionArray[0];
    const versionMinor = versionArray[1];
    const versionDirUrl = `http://cmake.org/files/v${versionMajor}.${versionMinor}/`;
    const fileNameBase = `cmake-${versionNumber}-`;
    const downloadPath = vscode.workspace.getConfiguration('cmake-tools-helper').get('cmake_download_path').replace(/[\/\\]+$/, '');
    downloadAndInstallCMake_actual(versionDirUrl, versionNumber, cmakePlatformNames(), cmakePlatformExtension(), downloadPath, onDownloadInstallFinish);
}
exports.downloadAndInstallCMake = downloadAndInstallCMake;
function downloadAndInstallCMake_actual(versionDirUrl, versionNumber, platformNames, platformExt, downloadPath, onDownloadInstallFinish) {
    if (platformNames.length < 1) {
        vscode.window.showErrorMessage('Failed to find valid precompiled CMake archives for your platform');
        return;
    }
    const fileNameBase = `cmake-${versionNumber}-`;
    const fileName = `${fileNameBase}${platformNames[0]}${platformExt}`;
    const fileUrl = `${versionDirUrl}${fileName}`;
    const filePath = `${downloadPath}${path.sep}${fileName}`;
    const tryMsg = `Trying to download ${fileUrl}`;
    console.log(tryMsg);
    vscode.window.setStatusBarMessage(tryMsg, 4000);
    url_exists(fileUrl, (err, exists) => {
        if (!exists) {
            const errMsg = `The precompiled CMake archive [${fileUrl}] does not exist [Error: ${err}]`;
            console.error(errMsg);
            vscode.window.setStatusBarMessage(errMsg, 4000);
            platformNames.shift();
            downloadAndInstallCMake_actual(versionDirUrl, versionNumber, platformNames, platformExt, downloadPath, onDownloadInstallFinish);
        }
        else {
            // The options argument is optional so you can omit it
            return request_progress(request(fileUrl), {})
                .on('progress', state => {
                // The state is an object that looks like this:
                // {
                //     percent: 0.5,               // Overall percent (between 0 to 1)
                //     speed: 554732,              // The download speed in bytes/sec
                //     size: {
                //         total: 90044871,        // The total payload size in bytes
                //         transferred: 27610959   // The transferred payload size in bytes
                //     },
                //     time: {
                //         elapsed: 36.235,        // The total elapsed seconds since the start (3 decimals)
                //         remaining: 81.403       // The remaining seconds to finish (3 decimals)
                //     }
                // }
                console.log('CMake Download ', state);
                const progPercent = (state.percent * 100.0).toFixed(2) + '%';
                const progSpeed = (state.speed / 1024).toFixed(2) + ' Kib/s';
                vscode.window.setStatusBarMessage(`CMake Download ${progPercent} @ ${progSpeed}`, 4000);
            })
                .on('error', e => {
                // Do something with err
                const errMsg = `Error when downloading ${fileUrl}. ${e}`;
                console.error(errMsg);
                vscode.window.showErrorMessage(errMsg);
            })
                .on('end', () => {
                // Do something after request finishes
                vscode.window.setStatusBarMessage('CMake Download Finished. Extracting...', 4000);
                decompress(filePath, path.dirname(filePath)).then((extractedData) => __awaiter(this, void 0, void 0, function* () {
                    fs.unlinkSync(filePath);
                    const extractionDir = extractedData[0].path.split(/[\/\\]/)[0]; // keep only the first "component" of the path
                    const extractionPath = `${downloadPath}${path.sep}${extractionDir}`;
                    const okMsg = `CMake v${versionNumber} installed in ${extractionPath}`;
                    console.log(okMsg);
                    vscode.window.setStatusBarMessage(okMsg, 4000);
                    yield onDownloadInstallFinish(extractionPath);
                }));
            })
                .pipe(fs.createWriteStream(filePath));
        }
    });
}
exports.downloadAndInstallCMake_actual = downloadAndInstallCMake_actual;
function changeCMakeVersion() {
    return __awaiter(this, void 0, void 0, function* () {
        const installedCMakes = getInstalledCMakeVersions();
        if (installedCMakes == null) {
            vscode.window.showErrorMessage('You have not installed any version of CMake. Make sure that you have run "Install CMake" at least once');
            return;
        }
        const installedCMakesQuickPick = installedCMakes.map(cm => {
            return {
                label: `v${cm.version}`,
                description: `${cm.path}`
            };
        });
        const cmakeVersion = yield vscode.window.showQuickPick(installedCMakesQuickPick, {
            matchOnDescription: true,
            matchOnDetail: true,
            placeHolder: 'Choose a CMake version to use with CMake Tools',
            ignoreFocusOut: true
        });
        if (cmakeVersion == null) {
            return;
        }
        yield vscode.workspace.getConfiguration('cmake').update('cmakePath', path.join(cmakeVersion.description, 'bin', 'cmake'), true);
        const useCMakeServer = (() => {
            try {
                return compare_versions(cmakeVersion.label, '3.7.1') > 0; // fails if rhs is not a valid SemVer
            }
            catch (e) {
                console.error('compare_versions(cmakeVersion.label, \'3.7.1\') failed [cmakeVersion.label:' + `${cmakeVersion.label}` + ']');
                return false;
            }
        })();
        yield vscode.workspace.getConfiguration('cmake').update('useCMakeServer', useCMakeServer, true);
        vscode.window.showInformationMessage(`CMake Tools will use CMake ${cmakeVersion.label} after restarting Visual Studio Code`);
    });
}
exports.changeCMakeVersion = changeCMakeVersion;
function getInstalledCMakeVersions() {
    const cmakeDlPath = vscode.workspace.getConfiguration('cmake-tools-helper').get('cmake_download_path');
    if (cmakeDlPath == null) {
        vscode.window.showErrorMessage('Please configure "cmake-tools-helper.cmake_download_path"');
        return null;
    }
    const cmakeDirs = fs.readdirSync(cmakeDlPath).filter(file => fs.lstatSync(path.join(cmakeDlPath, file)).isDirectory());
    if (cmakeDirs == null || cmakeDirs.length < 1) {
        return null;
    }
    return cmakeDirs.map(d => {
        const absPath = path.join(cmakeDlPath, d);
        return {
            version: computeCMakeVersion(absPath),
            path: absPath
        };
    });
}
exports.getInstalledCMakeVersions = getInstalledCMakeVersions;
function computeCMakeVersion(cmakeInstallDir) {
    const cmd = `"${cmakeInstallDir}${path.sep}bin${path.sep}cmake" --version`;
    const cmakeOutput = child_process.execSync(cmd).toString();
    // sample outputs: (obtained after some trial&error)
    //  cmake version 2.4-patch 2 (the last "2" won't be matched...)
    //  cmake version 3.9.0-rc1
    //  cmake version 3.5.1
    const cmakeVersion = cmakeOutput.match(/cmake\s+version\s+([0-9]+\.[0-9]+(\.[0-9]+)?\S*)/i);
    if (cmakeVersion == null || cmakeVersion.length < 2) {
        return null;
    }
    return cmakeVersion[1];
}
exports.computeCMakeVersion = computeCMakeVersion;
//# sourceMappingURL=helper.js.map
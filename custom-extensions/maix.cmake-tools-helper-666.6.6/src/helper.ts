'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as Github from '@octokit/rest';
import * as os from 'os';
import * as mkdirp from 'mkdirp';
import * as fs from 'fs';
import * as decompress from 'decompress';
import * as request from 'request';
import * as request_progress from 'request-progress';
import * as url_exists from 'url-exists';
import * as child_process from 'child_process';
import * as console from './log';
import { getPackagesRoot, isFile } from './root-dir';
import compare_versions = require('compare-versions');

export function cmakeArchBits(): number {
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

// @return ['exact platform name', 'fallback name 1', 'fallback name 2']
export function cmakePlatformNames(): string[] {
    const archBits = cmakeArchBits();
    const osName = os.type();
    switch (osName) {
    case 'Linux':
        if (archBits === 64) {
            return ['Linux-x86_64', 'Linux-i386'];
        } else {
            return ['Linux-i386'];
        }

    case 'Darwin':
        if (archBits === 64) {
            return ['Darwin-x86_64', 'Darwin64-universal', 'Darwin-universal'];
        } else {
            return ['Darwin-universal'];
        }

    case 'Windows_NT':
        if (archBits === 64) {
            return ['win64-x64', 'win32-x86'];
        } else {
            return ['win32-x86'];
        }

    default:
        throw new Error('Unsupported OS [' + osName + ']');
    }
}

export function cmakePlatformExtension(): string {
    const osName = os.type();
    switch (osName) {
    case 'Linux':
        return '.tar.gz';

    case 'Darwin':
        return '.tar.gz';

    case 'Windows_NT':
        return '.zip';

    default:
        throw new Error('Unsupported OS [' + osName + ']');
    }
}

export function makeConfigName(projectName: string, targetName: string, buildTypeName: string): string {
    if (projectName === null || targetName === null || buildTypeName === null) {
        return 'null';
    }
    else {
        return `${projectName} / ${targetName} / ${buildTypeName}`;
    }
}

export function vscodeFolderPath(): string {
    return path.join(vscode.workspace.rootPath || '~', '.vscode');
}

export async function installAtLeaseOneCmake(): Promise<string> {
    const installedVers = getInstalledCMakeVersions();
    if (installedVers && installedVers.length) {
        console.log('found %d installed cmake.', installedVers.length);
        if (await isFile(installedVers[0].path)) {
            return installedVers[0].path;
        }
    }

    await vscode.workspace.getConfiguration('cmake').update('cmakePath', '', true);

    return await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: '',
        cancellable: false,
    }, async () => {
        initCMakeDownloadDir();
        const availableVers = await getRemoteCMakeVersionNames(false);

        const versionToDownload = availableVers[0];
        if (!versionToDownload) {
            throw new Error('Failed to download CMake: No Versions.');
        }

        const installedCMakeRootDir = await downloadAndInstallCMake(versionToDownload);
        if (!installedCMakeRootDir) {
            throw new Error(`Failed to download CMake ${versionToDownload}`);
        }
        return `${installedCMakeRootDir}${path.sep}bin${path.sep}cmake`;
    });
}

export function initCMakeDownloadDir() {
    const CMakeDownloadPath = path.resolve(getPackagesRoot(), 'cmake');
    if (!fs.existsSync(CMakeDownloadPath)) {
        mkdirp.sync(CMakeDownloadPath);
        if (!fs.existsSync(CMakeDownloadPath)) {
            const msg = `Fail: Creation of CMakeDownloadPath:${CMakeDownloadPath}`;
            console.error(msg);
            vscode.window.showErrorMessage(msg);
            return;
        }
    }

    console.log(`cmake download path: ${CMakeDownloadPath}`);
}

export async function installCMake() {
    const remoteVersions: string[] = await getRemoteCMakeVersionNames(true);
    const versionToDownload = await vscode.window.showQuickPick(remoteVersions, {
        matchOnDescription: true,
        matchOnDetail: true,
        placeHolder: 'Choose a CMake version to download and install',
        ignoreFocusOut: true,
    });
    if (!versionToDownload) {
        return null;
    }

    const installedCMakeRootDir = await downloadAndInstallCMake(versionToDownload);

    if (!installedCMakeRootDir) {
        console.error(`Failed to download CMake ${versionToDownload}`);
        return null;
    }
    const installedCMakePath = `${installedCMakeRootDir}${path.sep}bin${path.sep}cmake`;

    const currentCMakePath = vscode.workspace.getConfiguration('cmake').get<string>('cmakePath');
    const msg = `CMake ${versionToDownload} installed in ${installedCMakeRootDir}`;
    console.log(msg);
    const setCMakePath = await vscode.window.showQuickPick([
        {
            label: 'Yes',
            description: `Set "cmake.cmakePath": "${installedCMakePath}"`,
        }, {
            label: 'No',
            description: `Keep "cmake.cmakePath": "${currentCMakePath}"`,
        },
    ], {
        matchOnDescription: true,
        matchOnDetail: true,
        placeHolder: 'Update cmake.cmakePath ?',
        ignoreFocusOut: true,
    });

    if (setCMakePath.label === 'Yes') {
        await vscode.workspace.getConfiguration('cmake').update('cmakePath', `${installedCMakePath}`, true);
        const useCMakeServer = compare_versions(versionToDownload, '3.7.1') > 0;
        await vscode.workspace.getConfiguration('cmake').update('useCMakeServer', useCMakeServer, true);

        vscode.window.showInformationMessage(`CMake Tools will use CMake ${versionToDownload} after restarting Visual Studio Code`);
    }
}

export async function getRemoteCMakeVersionNames(paging: boolean): Promise<string[]> {
    let ghClient = new Github({
        headers: {
            // https://developer.github.com/v3/#user-agent-required
            'user-agent': 'vscode',
            //, 'Authorization': 'token MY_SECRET_TOKEN'  // TODO remove me
        },
    });

    let tags: string[] = [];

    let res = await ghClient.gitdata.getTags({
        owner: 'Kitware',
        repo: 'CMake',
        per_page: 10,
    });
    tags.push(...res.data.map(t => t.ref));

    while (paging && ghClient.hasNextPage(res as any)) {
        res = await ghClient.getNextPage(res as any);
        tags.push(...res.data.map(t => t.ref));
    }

    tags = tags.map(t => t.replace('refs/tags/', ''));
    tags.sort().reverse();
    return tags;
}

export function downloadAndInstallCMake(versionName: string) {
    const versionNumber = versionName.replace(/^v/, '');
    const versionArray = versionNumber.split('.');
    const versionMajor = versionArray[0];
    const versionMinor = versionArray[1];
    const versionDirUrl = `http://cmake.org/files/v${versionMajor}.${versionMinor}/`;
    const CMakeDownloadPath = path.resolve(getPackagesRoot(), 'cmake');

    return downloadAndInstallCMake_actual(
        versionDirUrl, versionNumber, cmakePlatformNames(), cmakePlatformExtension(),
        CMakeDownloadPath,
    );
}

export async function downloadAndInstallCMake_actual(
    versionDirUrl: string, versionNumber: string, platformNames: string[], platformExt: string,
    downloadPath: string,
): Promise<string|null> {

    if (platformNames.length < 1) {
        throw new Error('Failed to find valid precompiled CMake archives for your platform');
    }

    const fileNameBase = `cmake-${versionNumber}-`;
    const fileName = `${fileNameBase}${platformNames[0]}${platformExt}`;

    const fileUrl = `${versionDirUrl}${fileName}`;
    const filePath = `${downloadPath}${path.sep}${fileName}`;

    const tryMsg = `Trying to download ${fileUrl}`;
    console.log(tryMsg);
    vscode.window.setStatusBarMessage(tryMsg, 4000);

    const [exists, err] = await new Promise<[boolean, Error]>((resolve) => {
        url_exists(fileUrl, (err, exists) => resolve([exists, err]));
    });

    if (exists) {
        const requestState = request_progress(request(fileUrl), {});
        requestState.on('progress', (state: ProgressReport) => {
            console.debug('CMake Download ', state);
            const progPercent = (state.percent * 100.0).toFixed(2) + '%';
            const progSpeed = (state.speed / 1024).toFixed(2) + ' Kib/s';
            vscode.window.setStatusBarMessage(`CMake Download ${progPercent} @ ${progSpeed}`, 4000);
        });
        await new Promise((resolve, reject) => {
            requestState.on('error', e => {
                // Do something with err
                reject(new Error(`Error when downloading ${fileUrl}. ${e}`));
            });
            requestState.on('end', () => {
                resolve();
            });
            requestState.pipe(fs.createWriteStream(filePath));
        });
        vscode.window.setStatusBarMessage('CMake Download Finished. Extracting...', 4000);
        const extractedData = await decompress(filePath, path.dirname(filePath));
        fs.unlinkSync(filePath);

        const extractionDir = extractedData[0].path.split(/[\/\\]/)[0];  // keep only the first "component" of the path
        const extractionPath = `${downloadPath}${path.sep}${extractionDir}`;

        const okMsg = `CMake v${versionNumber} installed in ${extractionPath}`;
        console.log(okMsg);
        vscode.window.setStatusBarMessage(okMsg, 4000);

        return extractionPath;
    } else {
        const errMsg = `The precompiled CMake archive [${fileUrl}] does not exist [Error: ${err}]`;
        console.error(errMsg);
        vscode.window.setStatusBarMessage(errMsg, 4000);
        platformNames.shift();
        return await downloadAndInstallCMake_actual(
            versionDirUrl, versionNumber, platformNames, platformExt,
            downloadPath,
        );
    }
}

export async function changeCMakeVersion() {
    const installedCMakes = getInstalledCMakeVersions();
    if (!installedCMakes) {
        vscode.window.showErrorMessage('You have not installed any version of CMake. Make sure that you have run "Install CMake" at least once');
        return;
    }

    const installedCMakesQuickPick = installedCMakes.map(cm => {
        return {
            label: `v${cm.version}`,
            description: `${cm.path}`,
        };
    });
    const cmakeVersion = await vscode.window.showQuickPick(installedCMakesQuickPick, {
        matchOnDescription: true,
        matchOnDetail: true,
        placeHolder: 'Choose a CMake version to use with CMake Tools',
        ignoreFocusOut: true,
    });
    if (cmakeVersion === null) {
        return;
    }

    await vscode.workspace.getConfiguration('cmake').update('cmakePath', path.join(cmakeVersion.description, 'bin', 'cmake'), true);
    const useCMakeServer = (() => {
        try {
            return compare_versions(cmakeVersion.label, '3.7.1') > 0;  // fails if rhs is not a valid SemVer
        } catch (e) {
            console.error('compare_versions(cmakeVersion.label, \'3.7.1\') failed [cmakeVersion.label:' + `${cmakeVersion.label}` + ']');
            return false;
        }
    })();
    await vscode.workspace.getConfiguration('cmake').update('useCMakeServer', useCMakeServer, true);

    vscode.window.showInformationMessage(`CMake Tools will use CMake ${cmakeVersion.label} after restarting Visual Studio Code`);
}

export function getInstalledCMakeVersions() {
    const CMakeDownloadPath = path.resolve(getPackagesRoot(), 'cmake');
    const cmakeDirs = fs.readdirSync(CMakeDownloadPath).filter(file => fs.lstatSync(path.join(CMakeDownloadPath, file)).isDirectory());
    if (cmakeDirs === null || cmakeDirs.length < 1) {
        return null;
    }

    return cmakeDirs.map(d => {
        const absPath = path.join(CMakeDownloadPath, d);
        return {
            version: computeCMakeVersion(absPath),
            path: absPath,
        };
    });
}

export function computeCMakeVersion(cmakeInstallDir: string): string {
    const cmd = `"${cmakeInstallDir}${path.sep}bin${path.sep}cmake" --version`;
    const cmakeOutput = child_process.execSync(cmd).toString();
    // sample outputs: (obtained after some trial&error)
    //  cmake version 2.4-patch 2 (the last "2" won't be matched...)
    //  cmake version 3.9.0-rc1
    //  cmake version 3.5.1
    const cmakeVersion = cmakeOutput.match(/cmake\s+version\s+([0-9]+\.[0-9]+(\.[0-9]+)?\S*)/i);
    if (cmakeVersion === null || cmakeVersion.length < 2) {
        return null;
    }
    return cmakeVersion[1];
}
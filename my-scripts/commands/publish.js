"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const fs_extra_1 = require("fs-extra");
const os_1 = require("os");
const path_1 = require("path");
const url_1 = require("url");
const util_1 = require("util");
const complex_1 = require("../build-env/childprocess/complex");
const downloadFile_1 = require("../build-env/codeblocks/downloadFile");
const zip_1 = require("../build-env/codeblocks/zip");
const zip_name_1 = require("../build-env/codeblocks/zip.name");
const awsUtil_1 = require("../build-env/misc/awsUtil");
const constants_1 = require("../build-env/misc/constants");
const fsUtil_1 = require("../build-env/misc/fsUtil");
const globalOutput_1 = require("../build-env/misc/globalOutput");
const myBuildSystem_1 = require("../build-env/misc/myBuildSystem");
const pathUtil_1 = require("../build-env/misc/pathUtil");
const timeUtil_1 = require("../build-env/misc/timeUtil");
const usePretty_1 = require("../build-env/misc/usePretty");
const { compress } = require('targz');
const { loadCredentialsFromEnv, loadCredentialsFromIniFile, loadRegionFromEnv, loadRegionFromIniFile } = require('awscred');
require('awscred').credentialsCallChain = [loadCredentialsFromEnv, loadCredentialsFromIniFile];
require('awscred').regionCallChain = [loadRegionFromEnv, loadRegionFromIniFile];
const loadCredentialsAndRegion = util_1.promisify(require('awscred').loadCredentialsAndRegion);
const OBJKEY_IDE_JSON = 'release/IDE.json';
myBuildSystem_1.runMain(async () => {
    const output = usePretty_1.usePretty('publish');
    globalOutput_1.globalInterruptLog('HTTP_PROXY=%s', process.env.HTTP_PROXY);
    await awsUtil_1.initS3(output);
    const compiledResult = path_1.resolve(constants_1.RELEASE_ROOT, await fsUtil_1.calcCompileFolderName());
    const targetZipFiles = (await zip_name_1.calcReleaseFileName()).map(fn => path_1.resolve(constants_1.RELEASE_ROOT, fn));
    if (await fsUtil_1.isExists(compiledResult)) {
        globalOutput_1.globalInterruptLog('read data from ' + compiledResult);
    }
    else {
        globalOutput_1.globalInterruptLog('read data from ' + targetZipFiles[0]);
        await zip_1.un7zip(output, targetZipFiles[0], constants_1.RELEASE_ROOT);
    }
    const prodData = await fsUtil_1.getProductData(path_1.resolve(compiledResult, 'resources/app'));
    const packData = await fsUtil_1.getPackageData(path_1.resolve(compiledResult, 'resources/app'));
    const patchVersionStr = packData.patchVersion.toString();
    output.writeln('loading IDE.json from AWS.');
    const ideState = await awsUtil_1.s3LoadJson(OBJKEY_IDE_JSON);
    if (!ideState.patches) {
        ideState.patches = [];
    }
    let lastPatch = (ideState.patches || []).find((item) => {
        return (item.version || '').toString() === patchVersionStr;
    }) || {};
    output.writeln(`remote version=${ideState.version} patch=${lastPatch.version || 'Null'}`);
    output.writeln(`local  version=${packData.version} patch=${patchVersionStr}`);
    if (ideState.version === packData.version || ideState.version === `${packData.version}-${prodData.quality}`) {
        output.writeln('ide version has not change: ' + ideState.version);
        const alreadyPost = lastPatch.version === patchVersionStr && lastPatch[platformKey()];
        if (alreadyPost) {
            output.success('already published same version');
            await timeUtil_1.timeout(1000);
        }
        else {
            await publishSubVersion();
        }
    }
    else {
        await publishMainVersion();
    }
    async function publishSubVersion() {
        output.writeln('publishing sub version: ' + packData.patchVersion);
        if (!lastPatch.version) { // no current patch
            lastPatch.version = patchVersionStr;
            ideState.patches.push(lastPatch);
        }
        const oldPackageAt = url_1.resolve(bucketUrl(Bucket, OBJKEY_IDE_JSON), ideState[platformKey()]);
        const oldPackageLocal = path_1.resolve(constants_1.RELEASE_ROOT, 'create-patch', 'old.7z');
        output.writeln('download old version from: ' + oldPackageAt);
        await downloadFile_1.downloadFile(output, oldPackageAt, oldPackageLocal);
        output.success('downloaded old version.');
        output.writeln('extract it');
        await zip_1.un7zip(output, oldPackageLocal, path_1.resolve(constants_1.RELEASE_ROOT, 'create-patch', 'prev-version'));
        output.success('extract complete.');
        for (const file of targetZipFiles) {
            ideState[platformKey()] = await new Promise((resolve, reject) => {
                s3.upload({ ACL: 'public-read', Bucket, Key: 'release/download/' + path_1.basename(file), Body: fs_1.createReadStream(file) }, { partSize: 10 * 1024 * 1024, queueSize: 4 }, (err, data) => err ? reject(err) : resolve(data.Location));
            });
        }
        const createdPatchTarball = await createPatch(output, path_1.resolve(constants_1.RELEASE_ROOT, 'create-patch', 'prev-version'), compiledResult);
        const patchUrl = await new Promise((resolve, reject) => {
            awsUtil_1.s3UploadStream();
            s3.upload({ ACL: 'public-read', Bucket, Key: 'release/patches/' + path_1.basename(createdPatchTarball) }, { partSize: 10 * 1024 * 1024, queueSize: 4 }, (err, data) => err ? reject(err) : resolve(data.Location));
        });
        lastPatch[platformKey()] = {
            generic: patchUrl,
        };
    }
    async function publishMainVersion() {
        output.writeln('publishing main version: ' + packData.version);
    }
    output.writeln('Done.');
});
async function createPatch(output, baseVer, newVer) {
    baseVer = path_1.resolve(baseVer, 'resources/app');
    newVer = path_1.resolve(newVer, 'resources/app');
    pathUtil_1.chdir(baseVer);
    await complex_1.pipeCommandOut(output, 'git', 'init', '.');
    await complex_1.pipeCommandOut(output.screen, 'git', 'add', '.');
    await complex_1.pipeCommandOut(output.screen, 'git', 'commit', '-m', 'init');
    await fs_extra_1.copy(newVer, baseVer);
    await complex_1.pipeCommandOut(output.screen, 'git', 'commit', '-m', 'init');
    await complex_1.pipeCommandOut(output.screen, 'git', 'add', '.');
    const fileList = await complex_1.getOutputCommand('git', 'diff', '--name-only', 'HEAD');
    const realFileList = fileList.split('\n').filter((e) => {
        return e && !e.startsWith('node_modules');
    });
    const packData = await fsUtil_1.getPackageData(baseVer);
    const patchFile = path_1.resolve(constants_1.RELEASE_ROOT, 'release-files', `${packData.version}_${packData.patchVersion}_${os_1.platform()}.tar.gz`);
    const config = {
        src: baseVer,
        dest: patchFile,
        tar: {
            entries: realFileList,
            dmode: 493,
            fmode: 420,
            strict: false,
        },
        gz: {
            level: 6,
            memLevel: 6,
        },
    };
    await new Promise((resolve, reject) => {
        const wrappedCallback = (err) => err ? reject(err) : resolve();
        compress(config, wrappedCallback);
    });
    return patchFile;
}
function platformKey() {
    if (constants_1.isWin) {
        return 'windows';
    }
    else if (constants_1.isMac) {
        return 'mac';
    }
    else {
        return 'linux';
    }
}
async function loadCred(output, home) {
    output.writeln('try load aws key from ' + home);
    const saveHome = process.env.HOME;
    process.env.HOME = home;
    const p = loadCredentialsAndRegion();
    process.env.HOME = saveHome;
    return p.then((cfg) => {
        if (cfg) {
            output.success('success load config from ' + home);
        }
        return cfg;
    }, () => {
        output.writeln('not able to load.');
        return null;
    });
}
function bucketUrl(Bucket, Key) {
    return `https://s3.cn-northwest-1.amazonaws.com.cn/${Bucket}/${Key}`;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGlzaC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiY29tbWFuZHMvcHVibGlzaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLDJCQUFzQztBQUN0Qyx1Q0FBZ0M7QUFDaEMsMkJBQThCO0FBQzlCLCtCQUF5QztBQUN6Qyw2QkFBNEM7QUFDNUMsK0JBQWlDO0FBQ2pDLCtEQUFxRjtBQUNyRix1RUFBb0U7QUFDcEUscURBQXFEO0FBQ3JELCtEQUF1RTtBQUN2RSx1REFBK0U7QUFDL0UsMkRBQXlFO0FBQ3pFLHFEQUEyRztBQUMzRyxpRUFBb0U7QUFDcEUsbUVBQTBEO0FBQzFELHlEQUFtRDtBQUNuRCx5REFBcUQ7QUFDckQsMkRBQXdEO0FBR3hELE1BQU0sRUFBQyxRQUFRLEVBQUMsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFFcEMsTUFBTSxFQUFDLHNCQUFzQixFQUFFLDBCQUEwQixFQUFFLGlCQUFpQixFQUFFLHFCQUFxQixFQUFDLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzFILE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxvQkFBb0IsR0FBRyxDQUFDLHNCQUFzQixFQUFFLDBCQUEwQixDQUFDLENBQUM7QUFDL0YsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLGVBQWUsR0FBRyxDQUFDLGlCQUFpQixFQUFFLHFCQUFxQixDQUFDLENBQUM7QUFDaEYsTUFBTSx3QkFBd0IsR0FBRyxnQkFBUyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBRXhGLE1BQU0sZUFBZSxHQUFHLGtCQUFrQixDQUFDO0FBRTNDLHVCQUFPLENBQUMsS0FBSyxJQUFJLEVBQUU7SUFDbEIsTUFBTSxNQUFNLEdBQUcscUJBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUVwQyxpQ0FBa0IsQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM1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
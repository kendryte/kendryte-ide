"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = require("aws-sdk");
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
const constants_1 = require("../build-env/misc/constants");
const fsUtil_1 = require("../build-env/misc/fsUtil");
const globalOutput_1 = require("../build-env/misc/globalOutput");
const myBuildSystem_1 = require("../build-env/misc/myBuildSystem");
const pathUtil_1 = require("../build-env/misc/pathUtil");
const streamUtil_1 = require("../build-env/misc/streamUtil");
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
    const awsConfig = await loadCred(output, process.env.HOME) || await loadCred(output, process.env.ORIGINAL_HOME);
    if (!awsConfig) {
        throw new Error('Not able to load AWS config. see https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/setup-credentials.html');
    }
    const s3 = new aws_sdk_1.S3({
        ...awsConfig,
        logger: {
            write: output.write.bind(output),
            log(...messages) {
                output.writeln(util_1.format(...messages));
            },
        },
    });
    const Bucket = prodData.applicationName;
    const patchVersionStr = packData.patchVersion.toString();
    output.writeln('loading IDE.json from AWS.');
    const json = await s3.getObject({ Bucket, Key: OBJKEY_IDE_JSON })
        .createReadStream()
        .pipe(new streamUtil_1.CollectingStream(), { end: true })
        .promise();
    const ideState = JSON.parse(json);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGlzaC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiY29tbWFuZHMvcHVibGlzaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHFDQUE2QjtBQUU3QiwyQkFBc0M7QUFDdEMsdUNBQWdDO0FBQ2hDLDJCQUE4QjtBQUM5QiwrQkFBeUM7QUFDekMsNkJBQTRDO0FBQzVDLCtCQUF5QztBQUN6QywrREFBcUY7QUFDckYsdUVBQW9FO0FBQ3BFLHFEQUFxRDtBQUNyRCwrREFBdUU7QUFDdkUsMkRBQXlFO0FBQ3pFLHFEQUEyRztBQUMzRyxpRUFBb0U7QUFDcEUsbUVBQTBEO0FBQzFELHlEQUFtRDtBQUNuRCw2REFBZ0U7QUFDaEUseURBQXFEO0FBQ3JELDJEQUF3RDtBQUd4RCxNQUFNLEVBQUMsUUFBUSxFQUFDLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBRXBDLE1BQU0sRUFBQyxzQkFBc0IsRUFBRSwwQkFBMEIsRUFBRSxpQkFBaUIsRUFBRSxxQkFBcUIsRUFBQyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMxSCxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsb0JBQW9CLEdBQUcsQ0FBQyxzQkFBc0IsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO0FBQy9GLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxlQUFlLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0FBQ2hGLE1BQU0sd0JBQXdCLEdBQUcsZ0JBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUV4RixNQUFNLGVBQWUsR0FBRyxrQkFBa0IsQ0FBQztBQUUzQyx1QkFBTyxDQUFDLEtBQUssSUFBSSxFQUFFO0lBQ2xCLE1BQU0sTUFBTSxHQUFHLHFCQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFcEMsaUNBQWtCLENBQUMsZUFBZSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxD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
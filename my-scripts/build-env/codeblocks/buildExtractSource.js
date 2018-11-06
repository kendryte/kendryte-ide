"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const path_1 = require("path");
const stream_1 = require("stream");
const tar_fs_1 = require("tar-fs");
const complex_1 = require("../childprocess/complex");
const constants_1 = require("../misc/constants");
const fsUtil_1 = require("../misc/fsUtil");
const pathUtil_1 = require("../misc/pathUtil");
const streamUtil_1 = require("../misc/streamUtil");
const timeUtil_1 = require("../misc/timeUtil");
const statusHash_1 = require("./statusHash");
async function extractSourceCodeIfNeed(output) {
    pathUtil_1.chdir(constants_1.VSCODE_ROOT);
    const timeOut = timeUtil_1.timing();
    output.write('creating source code snapshot...\n');
    const hash = await createSourceSnapshot(output);
    if (await statusHash_1.compareHash('source-code', hash)) {
        output.write('source code has changed, making new directory.\n');
        await recreateSourceCodes(output);
        await statusHash_1.saveHash('source-code', hash);
        output.success('source code has changed. new code extracted.' + timeOut()).continue();
    }
    else {
        output.success('source code not changed.' + timeOut()).continue();
    }
    const dummyGit = path_1.resolve(constants_1.RELEASE_ROOT, '.git');
    if (!await fsUtil_1.isExists(dummyGit)) {
        pathUtil_1.chdir(constants_1.RELEASE_ROOT);
        await complex_1.pipeCommandOut(output, 'git', 'init', '.');
        await fsUtil_1.writeFile(dummyGit + 'ignore', '*');
        output.success('dummy git repo created.').continue();
    }
}
exports.extractSourceCodeIfNeed = extractSourceCodeIfNeed;
async function createSourceSnapshot(output) {
    const hasher = crypto_1.createHash('md5');
    const snapshotFile = path_1.resolve(constants_1.RELEASE_ROOT, 'building-source-snapshot.tar');
    if (await fsUtil_1.isExists(snapshotFile)) {
        await fsUtil_1.rename(snapshotFile, path_1.resolve(constants_1.RELEASE_ROOT, 'prev-snapshot.tar'));
    }
    const multiplex = new stream_1.PassThrough();
    multiplex.pipe(fs_1.createWriteStream(snapshotFile));
    multiplex.pipe(hasher);
    await writeSourceCodeStream(multiplex, output);
    await streamUtil_1.streamPromise(multiplex);
    return hasher.digest('hex').toLowerCase();
}
async function recreateSourceCodes(output) {
    const node_modules = path_1.resolve(constants_1.ARCH_RELEASE_ROOT, 'node_modules');
    const temp_node_modules = path_1.resolve(constants_1.RELEASE_ROOT, 'saved_node_modules');
    if (await fsUtil_1.isExists(constants_1.ARCH_RELEASE_ROOT)) {
        output.write('old source code exists.');
        if (await fsUtil_1.isExists(node_modules)) {
            output.write('old node_modules exists, move it out.');
            await fsUtil_1.rename(node_modules, temp_node_modules);
        }
        output.write('remove old source code...');
        await fsUtil_1.removeDirectory(constants_1.ARCH_RELEASE_ROOT, output).catch((e) => {
            output.fail(e.message);
            console.error('Did you opened any file in %s?', constants_1.ARCH_RELEASE_ROOT);
            output.continue();
            throw e;
        });
        output.success('dist directory clean.').continue();
    }
    else {
        output.write('no old source code exists.');
    }
    output.write('writing source code:');
    const untar = tar_fs_1.extract(constants_1.ARCH_RELEASE_ROOT);
    await writeSourceCodeStream(untar, output);
    output.success('source code directory created.').continue();
    if (await fsUtil_1.isExists(temp_node_modules)) {
        output.write('move old node_modules back...');
        await fsUtil_1.rename(temp_node_modules, node_modules);
    }
    const gypTemp = path_1.resolve(process.env.HOME, '.node-gyp');
    if (await fsUtil_1.isExists(gypTemp)) {
        output.write('remove node-gyp at HOME...');
        await fsUtil_1.removeDirectory(gypTemp, output);
    }
}
async function writeSourceCodeStream(writeTo, output) {
    const version = await getCurrentVersion(output);
    output.write('processing source code tarball...');
    await complex_1.pipeCommandBoth(writeTo, output, 'git', 'archive', '--format', 'tar', version);
}
let knownVersion;
async function getCurrentVersion(output) {
    if (knownVersion) {
        return knownVersion;
    }
    output.write(`Checking git status.`);
    await complex_1.muteCommandOut('git', 'add', '.');
    const result = await complex_1.getOutputCommand('git', 'status');
    let currentVersion;
    if (result.indexOf('Changes to be committed') === -1) {
        currentVersion = 'HEAD';
    }
    else {
        currentVersion = await complex_1.getOutputCommand('git', 'stash', 'create');
    }
    output.success(`Git Current Version: ${currentVersion}.`).continue();
    return knownVersion = currentVersion;
}
function gitGetLastCommit(output) {
    output.write(`Get last commit.`);
    return complex_1.getOutputCommand('git', 'rev-parse', '--verify', 'HEAD');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRFeHRyYWN0U291cmNlLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvY29kZWJsb2Nrcy9idWlsZEV4dHJhY3RTb3VyY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxtQ0FBb0M7QUFDcEMsMkJBQXVDO0FBQ3ZDLCtCQUErQjtBQUMvQixtQ0FBcUM7QUFDckMsbUNBQWlDO0FBQ2pDLHFEQUE0RztBQUM1RyxpREFBaUY7QUFDakYsMkNBQThFO0FBQzlFLCtDQUF5QztBQUN6QyxtREFBbUQ7QUFDbkQsK0NBQTBDO0FBQzFDLDZDQUFxRDtBQUU5QyxLQUFLLFVBQVUsdUJBQXVCLENBQUMsTUFBcUI7SUFDbEUsZ0JBQUssQ0FBQyx1QkFBVyxDQUFDLENBQUM7SUFDbkIsTUFBTSxPQUFPLEdBQUcsaUJBQU0sRUFBRSxDQUFDO0lBRXpCLE1BQU0sQ0FBQyxLQUFLLENBQUMsb0NBQW9DLENBQUMsQ0FBQztJQUNuRCxNQUFNLElBQUksR0FBRyxNQUFNLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRWhELElBQUksTUFBTSx3QkFBVyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsRUFBRTtRQUMzQyxNQUFNLENBQUMsS0FBSyxDQUFDLGtEQUFrRCxDQUFDLENBQUM7UUFDakUsTUFBTSxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsQyxNQUFNLHFCQUFRLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3BDLE1BQU0sQ0FBQyxPQUFPLENBQUMsOENBQThDLEdBQUcsT0FBTyxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUN0RjtTQUFNO1FBQ04sTUFBTSxDQUFDLE9BQU8sQ0FBQywwQkFBMEIsR0FBRyxPQUFPLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO0tBQ2xFO0lBRUQsTUFBTSxRQUFRLEdBQUcsY0FBTyxDQUFDLHdCQUFZLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFD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
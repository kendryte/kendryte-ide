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
    output.writeln('creating source code snapshot...\n');
    const hash = await createSourceSnapshot(output);
    output.success('   code hash: ' + hash).continue();
    if (await statusHash_1.compareHash('source-code', hash, output)) {
        output.success('source code not changed.' + timeOut()).continue();
    }
    else {
        output.writeln('source code has changed, making new directory.\n');
        await recreateSourceCodes(output);
        await statusHash_1.saveHash('source-code', hash, output);
        output.success('complete action on create source:' + timeOut()).continue();
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
    let md5 = '';
    hasher.on('data', (data) => {
        md5 = data.toString('hex').toLowerCase();
    });
    const snapshotFile = path_1.resolve(constants_1.RELEASE_ROOT, 'building-source-snapshot.tar');
    if (await fsUtil_1.isExists(snapshotFile)) {
        await fsUtil_1.rename(snapshotFile, path_1.resolve(constants_1.RELEASE_ROOT, 'prev-snapshot.tar'));
    }
    const multiplex = new stream_1.PassThrough();
    multiplex.pipe(fs_1.createWriteStream(snapshotFile));
    multiplex.pipe(hasher);
    await writeSourceCodeStream(multiplex, output);
    await streamUtil_1.streamPromise(multiplex);
    await streamUtil_1.streamPromise(hasher);
    return md5;
}
async function recreateSourceCodes(output) {
    const node_modules = path_1.resolve(constants_1.ARCH_RELEASE_ROOT, 'node_modules');
    const temp_node_modules = path_1.resolve(constants_1.RELEASE_ROOT, 'saved_node_modules');
    if (await fsUtil_1.isExists(constants_1.ARCH_RELEASE_ROOT)) {
        output.writeln('old source code exists.');
        if (await fsUtil_1.isExists(node_modules)) {
            output.writeln('old node_modules exists, move it out.');
            await fsUtil_1.rename(node_modules, temp_node_modules);
        }
        output.writeln('remove old source code...');
        await fsUtil_1.removeDirectory(constants_1.ARCH_RELEASE_ROOT, output).catch((e) => {
            output.fail(e.message);
            console.error('Did you opened any file in %s?', constants_1.ARCH_RELEASE_ROOT);
            output.continue();
            throw e;
        });
        output.success('dist directory clean.').continue();
    }
    else {
        output.writeln('no old source code exists.');
    }
    output.writeln('writing source code:');
    const untar = tar_fs_1.extract(constants_1.ARCH_RELEASE_ROOT);
    await writeSourceCodeStream(untar, output);
    output.success('source code directory created.').continue();
    if (await fsUtil_1.isExists(temp_node_modules)) {
        output.writeln('move old node_modules back...');
        await fsUtil_1.rename(temp_node_modules, node_modules);
    }
    const gypTemp = path_1.resolve(process.env.HOME, '.node-gyp');
    if (await fsUtil_1.isExists(gypTemp)) {
        output.writeln('remove node-gyp at HOME...');
        await fsUtil_1.removeDirectory(gypTemp, output);
    }
}
async function writeSourceCodeStream(writeTo, output) {
    const version = await getCurrentVersion(output);
    output.writeln('processing source code tarball...');
    await complex_1.pipeCommandBoth(writeTo, output, 'git', 'archive', '--format', 'tar', version);
}
let knownVersion;
async function getCurrentVersion(output) {
    if (knownVersion) {
        return knownVersion;
    }
    output.writeln(`Checking git status.`);
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
    output.writeln(`Get last commit.`);
    return complex_1.getOutputCommand('git', 'rev-parse', '--verify', 'HEAD');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRFeHRyYWN0U291cmNlLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvY29kZWJsb2Nrcy9idWlsZEV4dHJhY3RTb3VyY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxtQ0FBb0M7QUFDcEMsMkJBQXVDO0FBQ3ZDLCtCQUErQjtBQUMvQixtQ0FBcUM7QUFDckMsbUNBQWlDO0FBQ2pDLHFEQUE0RztBQUM1RyxpREFBaUY7QUFDakYsMkNBQThFO0FBQzlFLCtDQUF5QztBQUN6QyxtREFBbUQ7QUFDbkQsK0NBQTBDO0FBQzFDLDZDQUFxRDtBQUU5QyxLQUFLLFVBQVUsdUJBQXVCLENBQUMsTUFBMkI7SUFDeEUsZ0JBQUssQ0FBQyx1QkFBVyxDQUFDLENBQUM7SUFDbkIsTUFBTSxPQUFPLEdBQUcsaUJBQU0sRUFBRSxDQUFDO0lBRXpCLE1BQU0sQ0FBQyxPQUFPLENBQUMsb0NBQW9DLENBQUMsQ0FBQztJQUNyRCxNQUFNLElBQUksR0FBRyxNQUFNLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2hELE1BQU0sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7SUFFbkQsSUFBSSxNQUFNLHdCQUFXLENBQUMsYUFBYSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRTtRQUNuRCxNQUFNLENBQUMsT0FBTyxDQUFDLDBCQUEwQixHQUFHLE9BQU8sRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDbEU7U0FBTTtRQUNOLE1BQU0sQ0FBQyxPQUFPLENBQUMsa0RBQWtELENBQUMsQ0FBQztRQUNuRSxNQUFNLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2xDLE1BQU0scUJBQVEsQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzVDLE1BQU0sQ0FBQyxPQUFPLENBQUMsbUNBQW1DLEdBQUcsT0FBTyxFQUFFLENB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
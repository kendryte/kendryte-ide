"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const path_1 = require("path");
const stream_1 = require("stream");
const tar_fs_1 = require("tar-fs");
const complex_1 = require("../../childprocess/complex");
const constants_1 = require("../../misc/constants");
const fsUtil_1 = require("../../misc/fsUtil");
const pathUtil_1 = require("../../misc/pathUtil");
const streamUtil_1 = require("../../misc/streamUtil");
const timeUtil_1 = require("../../misc/timeUtil");
const statusHash_1 = require("../statusHash");
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
        await fsUtil_1.removeDirectory(constants_1.ARCH_RELEASE_ROOT, output, false).catch((e) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRFeHRyYWN0U291cmNlLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvY29kZWJsb2Nrcy9idWlsZC9idWlsZEV4dHJhY3RTb3VyY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxtQ0FBb0M7QUFDcEMsMkJBQXVDO0FBQ3ZDLCtCQUErQjtBQUMvQixtQ0FBcUM7QUFDckMsbUNBQWlDO0FBQ2pDLHdEQUErRztBQUMvRyxvREFBb0Y7QUFDcEYsOENBQWlGO0FBQ2pGLGtEQUE0QztBQUM1QyxzREFBc0Q7QUFDdEQsa0RBQTZDO0FBQzdDLDhDQUFzRDtBQUUvQyxLQUFLLFVBQVUsdUJBQXVCLENBQUMsTUFBMkI7SUFDeEUsZ0JBQUssQ0FBQyx1QkFBVyxDQUFDLENBQUM7SUFDbkIsTUFBTSxPQUFPLEdBQUcsaUJBQU0sRUFBRSxDQUFDO0lBRXpCLE1BQU0sQ0FBQyxPQUFPLENBQUMsb0NBQW9DLENBQUMsQ0FBQztJQUNyRCxNQUFNLElBQUksR0FBRyxNQUFNLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2hELE1BQU0sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7SUFFbkQsSUFBSSxNQUFNLHdCQUFXLENBQUMsYUFBYSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRTtRQUNuRCxNQUFNLENBQUMsT0FBTyxDQUFDLDBCQUEwQixHQUFHLE9BQU8sRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDbEU7U0FBTTtRQUNOLE1BQU0sQ0FBQyxPQUFPLENBQUMsa0RBQWtELENBQUMsQ0FBQztRQUNuRSxNQUFNLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2xDLE1BQU0scUJBQVEsQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzVDLE1BQU0sQ0FBQyxPQUFPLENBQUMsbUNBQW1DLEdBQUcsT0FBTyxF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
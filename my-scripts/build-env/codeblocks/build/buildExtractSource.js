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
const removeDir_1 = require("../removeDir");
const statusHash_1 = require("../statusHash");
async function extractSourceCodeIfNeed(output) {
    pathUtil_1.chdir(constants_1.VSCODE_ROOT);
    const timeOut = timeUtil_1.timing();
    output.writeln('creating source code snapshot...\n');
    const hash = await createSourceSnapshot(output);
    output.success('   code hash: ' + hash);
    if (await statusHash_1.compareHash('source-code', hash, output)) {
        output.success('source code not changed.' + timeOut());
    }
    else {
        output.writeln('source code has changed, making new directory.\n');
        await recreateSourceCodes(output);
        await statusHash_1.saveHash('source-code', hash, output);
        output.success('complete action on create source:' + timeOut());
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
        await removeDir_1.removeDirectory(constants_1.ARCH_RELEASE_ROOT, output, false).catch((e) => {
            output.fail(e.message);
            output.fail(`Did you opened any file in ${constants_1.ARCH_RELEASE_ROOT}?`);
            throw e;
        });
        output.success('dist directory clean.');
    }
    else {
        output.writeln('no old source code exists.');
    }
    output.writeln('writing source code:');
    const untar = tar_fs_1.extract(constants_1.ARCH_RELEASE_ROOT);
    await writeSourceCodeStream(untar, output);
    output.success('source code directory created.');
    if (await fsUtil_1.isExists(temp_node_modules)) {
        output.writeln('move old node_modules back...');
        await fsUtil_1.rename(temp_node_modules, node_modules);
    }
    const gypTemp = path_1.resolve(process.env.HOME, '.node-gyp');
    if (await fsUtil_1.isExists(gypTemp)) {
        output.writeln('remove node-gyp at HOME...');
        await removeDir_1.removeDirectory(gypTemp, output);
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
    output.success(`Git Current Version: ${currentVersion}.`);
    return knownVersion = currentVersion;
}
function gitGetLastCommit(output) {
    output.writeln(`Get last commit.`);
    return complex_1.getOutputCommand('git', 'rev-parse', '--verify', 'HEAD');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRFeHRyYWN0U291cmNlLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvY29kZWJsb2Nrcy9idWlsZC9idWlsZEV4dHJhY3RTb3VyY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxtQ0FBb0M7QUFDcEMsMkJBQXVDO0FBQ3ZDLCtCQUErQjtBQUMvQixtQ0FBcUM7QUFDckMsbUNBQWlDO0FBQ2pDLHdEQUErRjtBQUMvRixvREFBb0Y7QUFDcEYsOENBQXFEO0FBQ3JELGtEQUE0QztBQUM1QyxzREFBc0Q7QUFDdEQsa0RBQTZDO0FBQzdDLDRDQUErQztBQUMvQyw4Q0FBc0Q7QUFFL0MsS0FBSyxVQUFVLHVCQUF1QixDQUFDLE1BQTJCO0lBQ3hFLGdCQUFLLENBQUMsdUJBQVcsQ0FBQyxDQUFDO0lBQ25CLE1BQU0sT0FBTyxHQUFHLGlCQUFNLEVBQUUsQ0FBQztJQUV6QixNQUFNLENBQUMsT0FBTyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7SUFDckQsTUFBTSxJQUFJLEdBQUcsTUFBTSxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNoRCxNQUFNLENBQUMsT0FBTyxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxDQUFDO0lBRXhDLElBQUksTUFBTSx3QkFBVyxDQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUU7UUFDbkQsTUFBTSxDQUFDLE9BQU8sQ0FBQywwQkFBMEIsR0FBRyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0tBQ3ZEO1NBQU07UUFDTixNQUFNLENBQUMsT0FBTyxDQUFDLGtEQUFrRCxDQUFDLENBQUM7UUFDbkUsTUFBTSxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsQyxNQUFNLHFCQUFRLENBQUMsYUFBYSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM1QyxNQUFNLENBQUMsT0FBTyxDQUFDLG1DQUFtQyxHQUFHLE9BQU8sRUFBRSxDQUFDLENBQUM7S0FDaEU7QUFDRixDQUFDO0FBaEJELDBEQWdCQztBQUVELEtBQUssVUFBVSxvQkFBb0IsQ0FBQyxNQUEyQjtJQUM5RCxNQUFNLE1BQU0sR0FBRyxtQkFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2pDLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztJQUNiLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBWSxFQUFFLEVBQUU7UUFDbEMsR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDMUMsQ0FBQyxDQUFDLENBQUM7SUFFSCxNQUFNLFlBQVksR0FBRyxjQUFPLENBQUMsd0JBQVksRUFBRSw4QkFBOEIsQ0FBQyxDQUFDO0lBQzNFLElBQUksTUFBTSxpQkFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFO1FBQ2pDLE1BQU0sZUFBTSxDQUFDLFlBQVksRUFBRSxjQUFPLENBQUMsd0JBQVksRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7S0FDdkU7SUFFRCxNQUFNLFNBQVMsR0FBRyxJQUFJLG9CQUFXLEVBQUUsQ0FBQztJQUNwQyxTQUFTLENBQUMsSUFBSSxDQUFDLHNCQUFpQixDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7SUFDaEQsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUV2QixNQUFNLHFCQUFxQixDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMvQyxNQUFNLDBCQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDL0IsTUFBTSwwQkFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRTVCLE9BQU8sR0FBRyxDQUFDO0FBQ1osQ0FBQztBQUVELEtBQUssVUFBVSxtQkFBbUIsQ0FBQyxNQUEyQjtJQUM3RCxNQUFNLFlBQVksR0FBRyxjQUFPLENBQUMsNkJBQWlCLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDaEUsTUFBTSxpQkFBaUIsR0FBRyxjQUFPLENBQUMsd0JBQVksRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO0lBRXRFLElBQUksTUFBTSxpQkFBUSxDQUFDLDZCQUFpQixDQUFDLEVBQUU7UUFDdEMsTUFBTSxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQzFDLElBQUksTUFBTSxpQkFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQ2pDLE1BQU0sQ0FBQyxPQUFPLENBQUMsdUNBQXVDLENBQUMsQ0FBQztZQUN4RCxNQUFNLGVBQU0sQ0FBQyxZQUFZLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztTQUM5QztRQUNELE1BQU0sQ0FBQyxPQUFPLENBQUMsMkJBQTJCLENBQUMsQ0FBQztRQUM1QyxNQUFNLDJCQUFlLENBQUMsNkJBQWlCLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ25FLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsOEJBQThCLDZCQUFpQixHQUFHLENBQUMsQ0FBQztZQUNoRSxNQUFNLENBQUMsQ0FBQztRQUNULENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0tBQ3hDO1NBQU07UUFDTixNQUFNLENBQUMsT0FBTyxDQUFDLDRCQUE0QixDQUFDLENBQUM7S0FDN0M7SUFFRCxNQUFNLENBQUMsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUM7SUFDdkMsTUFBTSxLQUFLLEdBQUcsZ0JBQU8sQ0FBQyw2QkFBaUIsQ0FBQyxDQUFDO0lBQ3pDLE1BQU0scUJBQXFCLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzNDLE1BQU0sQ0FBQyxPQUFPLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztJQUVqRCxJQUFJLE1BQU0saUJBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO1FBQ3RDLE1BQU0sQ0FBQyxPQUFPLENBQUMsK0JBQStCLENBQUMsQ0FBQztRQUNoRCxNQUFNLGVBQU0sQ0FBQyxpQkFBaUIsRUFBRSxZQUFZLENBQUMsQ0FBQztLQUM5QztJQUVELE1BQU0sT0FBTyxHQUFHLGNBQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztJQUN2RCxJQUFJLE1BQU0saUJBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRTtRQUM1QixNQUFNLENBQUMsT0FBTyxDQUFDLDRCQUE0QixDQUFDLENBQUM7UUFDN0MsTUFBTSwyQkFBZSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztLQUN2QztBQUNGLENBQUM7QUFFRCxLQUFLLFVBQVUscUJBQXFCLENBQUMsT0FBOEIsRUFBRSxNQUEyQjtJQUMvRixNQUFNLE9BQU8sR0FBRyxNQUFNLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRWhELE1BQU0sQ0FBQyxPQUFPLENBQUMsbUNBQW1DLENBQUMsQ0FBQztJQUNwRCxNQUFNLHlCQUFlLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDdEYsQ0FBQztBQUVELElBQUksWUFBb0IsQ0FBQztBQUV6QixLQUFLLFVBQVUsaUJBQWlCLENBQUMsTUFBMkI7SUFDM0QsSUFBSSxZQUFZLEVBQUU7UUFDakIsT0FBTyxZQUFZLENBQUM7S0FDcEI7SUFDRCxNQUFNLENBQUMsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUM7SUFDdkMsTUFBTSx3QkFBYyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDeEMsTUFBTSxNQUFNLEdBQUcsTUFBTSwwQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFFdkQsSUFBSSxjQUFzQixDQUFDO0lBQzNCLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1FBQ3JELGNBQWMsR0FBRyxNQUFNLENBQUM7S0FDeEI7U0FBTTtRQUNOLGNBQWMsR0FBRyxNQUFNLDBCQUFnQixDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDbEU7SUFDRCxNQUFNLENBQUMsT0FBTyxDQUFDLHdCQUF3QixjQUFjLEdBQUcsQ0FBQyxDQUFDO0lBQzFELE9BQU8sWUFBWSxHQUFHLGNBQWMsQ0FBQztBQUN0QyxDQUFDO0FBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxNQUEyQjtJQUNwRCxNQUFNLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDbkMsT0FBTywwQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUNqRSxDQUFDIn0=
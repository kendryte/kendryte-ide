"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const stream_1 = require("stream");
const complex_1 = require("../childprocess/complex");
const constants_1 = require("../misc/constants");
const fsUtil_1 = require("../misc/fsUtil");
const pathUtil_1 = require("../misc/pathUtil");
const streamUtil_1 = require("../misc/streamUtil");
const common_step_1 = require("./build/common-step");
const zip_name_1 = require("./zip.name");
const _7z = constants_1.isWin ? require('7zip')['7z'] : '7z';
const commonArgs = [
    'a',
    '-y',
    '-r',
    '-ssc',
    '-bso1',
    '-bse1',
    '-bsp2',
];
if (!constants_1.isWin) {
    commonArgs.push('-mmt3'); // use 3 threads
}
const zipLzma2Args = [
    ...commonArgs,
    '-t7z',
    '-ms=on',
    '-mx8',
    '-m0=lzma2',
    '-md=256m',
    '-mfb=64',
];
if (constants_1.isWin) {
    zipLzma2Args.push('"-sfx7z.sfx"'); // self extraction
}
else {
    zipLzma2Args.push('-sfx7zCon.sfx'); // self extraction
}
const zipDeflateArgs = [
    ...commonArgs,
    '-tzip',
    '-mx6',
];
async function createPosixSfx(output, stderr, whatToZip, zipFileName, ...zipArgs) {
    output.write('creating posix 7z sfx bin...\n');
    zipFileName = path_1.resolve(releaseZipStorageFolder(), zipFileName);
    await complex_1.pipeCommandBoth(output, stderr, _7z, ...zipLzma2Args, ...zipArgs, '--', zipFileName, path_1.join(whatToZip, '*'));
    await fs_extra_1.chmod(zipFileName, '777');
}
async function createWindowsSfx(output, stderr, whatToZip, zipFileName, ...zipArgs) {
    output.write('creating windows 7z sfx exe...\n');
    zipFileName = path_1.resolve(releaseZipStorageFolder(), zipFileName);
    return complex_1.pipeCommandBoth(output, stderr, _7z, ...zipLzma2Args, ...zipArgs, '--', zipFileName, path_1.join(whatToZip, '*'));
}
async function createWindowsZip(output, stderr, whatToZip, zipFileName, ...zipArgs) {
    output.write('creating windows zip simple...\n');
    zipFileName = path_1.resolve(releaseZipStorageFolder(), zipFileName);
    return complex_1.pipeCommandBoth(output, stderr, _7z, ...zipDeflateArgs, ...zipArgs, '--', zipFileName, path_1.join(whatToZip, '*'));
}
async function createPosixZip(output, stderr, whatToZip, zipFileName, ...zipArgs) {
    output.write('creating posix zip simple...\n');
    zipFileName = path_1.resolve(releaseZipStorageFolder(), zipFileName);
    return complex_1.pipeCommandBoth(output, stderr, _7z, ...zipDeflateArgs, ...zipArgs, '--', zipFileName, path_1.join(whatToZip, '*'));
}
async function un7zip(output, from, to) {
    await fs_extra_1.mkdirp(to);
    pathUtil_1.chdir(to);
    return complex_1.pipeCommandOut(output, _7z, 'x', '-y', '-r', from);
}
exports.un7zip = un7zip;
function releaseZipStorageFolder() {
    return path_1.resolve(constants_1.RELEASE_ROOT, 'release-files');
}
exports.releaseZipStorageFolder = releaseZipStorageFolder;
class TransformEncode extends stream_1.Transform {
    constructor() {
        super(...arguments);
        this.noEnd = true;
    }
    _transform(chunk, encoding, callback) {
        const str = chunk.toString('ascii');
        this.push(str, 'utf8');
        callback();
    }
}
class ProgressStream extends stream_1.Transform {
    constructor() {
        super(...arguments);
        this.noEnd = true;
    }
    _transform(chunk, encoding, callback) {
        const str = chunk.toString('ascii').replace(/\x08+/g, '\n');
        // console.log('\n', Buffer.from(str));
        this.push(str, 'utf8');
        callback();
    }
}
async function creatingUniversalZip(output, sourceDir, namer) {
    const stderr = new ProgressStream;
    stderr.pipe(output.screen, { end: false });
    if (constants_1.isWin) {
        const convert = new TransformEncode;
        convert.pipe(output, streamUtil_1.endArg(output));
        await createWindowsSfx(convert, stderr, sourceDir, await namer('exe'));
        await createWindowsZip(convert, stderr, sourceDir, await namer('zip'));
        convert.end();
    }
    else {
        await createPosixSfx(output, stderr, sourceDir, await namer('7z.bin'));
        await createPosixZip(output, stderr, sourceDir, await namer('zip'));
    }
}
exports.creatingUniversalZip = creatingUniversalZip;
async function creatingReleaseZip(output) {
    const zipStoreDir = releaseZipStorageFolder();
    pathUtil_1.chdir(constants_1.RELEASE_ROOT);
    await common_step_1.cleanupZipFiles(output, zipStoreDir);
    return creatingUniversalZip(output, await fsUtil_1.calcCompileFolderName(), zip_name_1.nameReleaseFile);
}
exports.creatingReleaseZip = creatingReleaseZip;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiemlwLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvY29kZWJsb2Nrcy96aXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSx1Q0FBeUM7QUFDekMsK0JBQXFDO0FBQ3JDLG1DQUFzRDtBQUN0RCxxREFBMEU7QUFDMUUsaURBQXdEO0FBQ3hELDJDQUF1RDtBQUN2RCwrQ0FBeUM7QUFDekMsbURBQTRDO0FBQzVDLHFEQUFzRDtBQUN0RCx5Q0FBNkM7QUFFN0MsTUFBTSxHQUFHLEdBQUcsaUJBQUssQ0FBQSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFFaEQsTUFBTSxVQUFVLEdBQUc7SUFDbEIsR0FBRztJQUNILElBQUk7SUFDSixJQUFJO0lBQ0osTUFBTTtJQUNOLE9BQU87SUFDUCxPQUFPO0lBQ1AsT0FBTztDQUNQLENBQUM7QUFDRixJQUFJLENBQUMsaUJBQUssRUFBRTtJQUNYLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0I7Q0FDMUM7QUFDRCxNQUFNLFlBQVksR0FBRztJQUNwQixHQUFHLFVBQVU7SUFDYixNQUFNO0lBQ04sUUFBUTtJQUNSLE1BQU07SUFDTixXQUFXO0lBQ1gsVUFBVTtJQUNWLFNBQVM7Q0FDVCxDQUFDO0FBQ0YsSUFBSSxpQkFBSyxFQUFFO0lBQ1YsWUFBWSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLGtCQUFrQjtDQUNyRDtLQUFNO0lBQ04sWUFBWSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGtCQUFrQjtDQUN0RDtBQUVELE1BQU0sY0FBYyxHQUFHO0lBQ3RCLEdBQUcsVUFBVTtJQUNiLE9BQU87SUFDUCxNQUFNO0NBQ04sQ0FBQztBQUVGLEtBQUssVUFBVSxjQUFjLENBQzVCLE1BQTZCLEVBQzdCLE1BQTZCLEVBQzdCLFNBQWlC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
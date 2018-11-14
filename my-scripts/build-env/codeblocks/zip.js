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
    await fsUtil_1.removeIfExists(zipFileName);
    return complex_1.pipeCommandBoth(output, stderr, _7z, ...zipLzma2Args, ...zipArgs, '--', zipFileName, path_1.join(whatToZip, '*'));
}
async function createWindowsZip(output, stderr, whatToZip, zipFileName, ...zipArgs) {
    output.write('creating windows zip simple...\n');
    zipFileName = path_1.resolve(releaseZipStorageFolder(), zipFileName);
    await fsUtil_1.removeIfExists(zipFileName);
    return complex_1.pipeCommandBoth(output, stderr, _7z, ...zipDeflateArgs, ...zipArgs, '--', zipFileName, path_1.join(whatToZip, '*'));
}
async function createPosixZip(output, stderr, whatToZip, zipFileName, ...zipArgs) {
    output.write('creating posix zip simple...\n');
    zipFileName = path_1.resolve(releaseZipStorageFolder(), zipFileName);
    await fsUtil_1.removeIfExists(zipFileName);
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
        const str = chunk.toString('ascii').replace(/[\x08\x0d]+/g, '\n').replace(/^ +| +$/g, '');
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
    return creatingUniversalZip(output, await fsUtil_1.calcCompileFolderName(), zip_name_1.nameReleaseFile);
}
exports.creatingReleaseZip = creatingReleaseZip;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiemlwLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvY29kZWJsb2Nrcy96aXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSx1Q0FBeUM7QUFDekMsK0JBQXFDO0FBQ3JDLG1DQUFzRDtBQUN0RCxxREFBMEU7QUFDMUUsaURBQXdEO0FBQ3hELDJDQUF1RTtBQUN2RSwrQ0FBeUM7QUFDekMsbURBQTRDO0FBQzVDLHlDQUE2QztBQUU3QyxNQUFNLEdBQUcsR0FBRyxpQkFBSyxDQUFBLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUVoRCxNQUFNLFVBQVUsR0FBRztJQUNsQixHQUFHO0lBQ0gsSUFBSTtJQUNKLElBQUk7SUFDSixNQUFNO0lBQ04sT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPO0NBQ1AsQ0FBQztBQUNGLElBQUksQ0FBQyxpQkFBSyxFQUFFO0lBQ1gsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLGdCQUFnQjtDQUMxQztBQUNELE1BQU0sWUFBWSxHQUFHO0lBQ3BCLEdBQUcsVUFBVTtJQUNiLE1BQU07SUFDTixRQUFRO0lBQ1IsTUFBTTtJQUNOLFdBQVc7SUFDWCxVQUFVO0lBQ1YsU0FBUztDQUNULENBQUM7QUFDRixJQUFJLGlCQUFLLEVBQUU7SUFDVixZQUFZLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsa0JBQWtCO0NBQ3JEO0tBQU07SUFDTixZQUFZLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsa0JBQWtCO0NBQ3REO0FBRUQsTUFBTSxjQUFjLEdBQUc7SUFDdEIsR0FBRyxVQUFVO0lBQ2IsT0FBTztJQUNQLE1BQU07Q0FDTixDQUFDO0FBRUYsS0FBSyxVQUFVLGNBQWMsQ0FDNUIsTUFBNkIsRUFDN0IsTUFBNkIsRUFDN0IsU0FBaUIsRUFDakIsV0FBbUIs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
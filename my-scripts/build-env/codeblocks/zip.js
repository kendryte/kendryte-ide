"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const os_1 = require("os");
const path_1 = require("path");
const stream_1 = require("stream");
const complex_1 = require("../childprocess/complex");
const constants_1 = require("../misc/constants");
const fsUtil_1 = require("../misc/fsUtil");
const pathUtil_1 = require("../misc/pathUtil");
const streamUtil_1 = require("../misc/streamUtil");
const common_step_1 = require("./build/common-step");
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
async function calcZipFileName() {
    if (constants_1.isWin) {
        return [await distFileName('exe'), await distFileName('zip')];
    }
    else {
        return [await distFileName('7z.bin')];
    }
}
exports.calcZipFileName = calcZipFileName;
async function un7zip(output, from, to) {
    await fs_extra_1.mkdirp(to);
    pathUtil_1.chdir(to);
    return complex_1.pipeCommandOut(output, _7z, 'x', '-y', '-r', from);
}
exports.un7zip = un7zip;
async function distFileName(type) {
    const product = await fsUtil_1.getProductData();
    const packageJson = await fsUtil_1.getPackageData();
    const pv = ('' + packageJson.patchVersion).replace(/\./g, '');
    return path_1.normalize(`${os_1.platform()}.${product.applicationName}.v${packageJson.version}-${product.quality}.${pv}.${type}`);
}
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
    }
}
exports.creatingUniversalZip = creatingUniversalZip;
async function creatingReleaseZip(output) {
    const zipStoreDir = releaseZipStorageFolder();
    pathUtil_1.chdir(constants_1.RELEASE_ROOT);
    await common_step_1.cleanupZipFiles(output, zipStoreDir);
    return creatingUniversalZip(output, await fsUtil_1.calcCompileFolderName(), distFileName);
}
exports.creatingReleaseZip = creatingReleaseZip;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiemlwLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvY29kZWJsb2Nrcy96aXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSx1Q0FBeUM7QUFDekMsMkJBQThCO0FBQzlCLCtCQUFnRDtBQUNoRCxtQ0FBc0Q7QUFDdEQscURBQTBFO0FBQzFFLGlEQUF3RDtBQUN4RCwyQ0FBdUY7QUFDdkYsK0NBQXlDO0FBQ3pDLG1EQUE0QztBQUM1QyxxREFBc0Q7QUFFdEQsTUFBTSxHQUFHLEdBQUcsaUJBQUssQ0FBQSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFFaEQsTUFBTSxVQUFVLEdBQUc7SUFDbEIsR0FBRztJQUNILElBQUk7SUFDSixJQUFJO0lBQ0osTUFBTTtJQUNOLE9BQU87SUFDUCxPQUFPO0lBQ1AsT0FBTztDQUNQLENBQUM7QUFDRixJQUFJLENBQUMsaUJBQUssRUFBRTtJQUNYLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0I7Q0FDMUM7QUFDRCxNQUFNLFlBQVksR0FBRztJQUNwQixHQUFHLFVBQVU7SUFDYixNQUFNO0lBQ04sUUFBUTtJQUNSLE1BQU07SUFDTixXQUFXO0lBQ1gsVUFBVTtJQUNWLFNBQVM7Q0FDVCxDQUFDO0FBQ0YsSUFBSSxpQkFBSyxFQUFFO0lBQ1YsWUFBWSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLGtCQUFrQjtDQUNyRDtLQUFNO0lBQ04sWUFBWSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGtCQUFrQjtDQUN0RDtBQUVELE1BQU0sY0FBYyxHQUFHO0lBQ3RCLEdBQUcsVUFBVTtJQUNiLE9BQU87SUFDUCxNQUFNO0NBQ04sQ0FBQztBQUVGLEtBQUssVUFBVSxjQUFjLENBQzVCLE1BQTZCLEVBQzdCLE1BQTZCLEVBQzdCLFNBQWlC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
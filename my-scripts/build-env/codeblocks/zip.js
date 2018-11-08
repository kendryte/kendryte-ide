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
const _7z = constants_1.isWin ? require('7zip')['7z'] : '7z';
const commonArgs = [
    'a',
    '-y',
    '-r',
    '-ssc',
];
if (!constants_1.isWin) {
    commonArgs.push('-mmt3'); // use 3 threads
}
const normalArgs = [
    ...commonArgs,
    '-t7z',
    '-ms=on',
    '-mx8',
    '-m0=lzma2',
    '-md=256m',
    '-mfb=64',
];
if (constants_1.isWin) {
    commonArgs.push('"-sfx7zCon.sfx"'); // self extraction
}
else {
    commonArgs.push('-sfx7zCon.sfx'); // self extraction
}
const zipArgs = [
    ...commonArgs,
    '-tzip',
    '-mx6',
];
async function createPosixSfx(output, whatToZip) {
    const zipFileName = await distFilePath('7z.bin');
    await complex_1.pipeCommandOut(output, _7z, ...normalArgs, '--', zipFileName, whatToZip + '/*');
    await fs_extra_1.chmod(zipFileName, '777');
}
exports.createPosixSfx = createPosixSfx;
async function createWindowsSfx(output, whatToZip) {
    return complex_1.pipeCommandOut(output, _7z, ...normalArgs, '--', await distFilePath('exe'), whatToZip + '/*');
}
exports.createWindowsSfx = createWindowsSfx;
async function createWindowsZip(output, whatToZip) {
    return complex_1.pipeCommandOut(output, _7z, ...zipArgs, '--', await distFilePath('zip'), whatToZip + '/*');
}
exports.createWindowsZip = createWindowsZip;
async function calcZipFileName() {
    if (constants_1.isWin) {
        return [await distFilePath('exe'), await distFilePath('zip')];
    }
    else {
        return [await distFilePath('7z.bin')];
    }
}
exports.calcZipFileName = calcZipFileName;
async function un7zip(output, from, to) {
    await fs_extra_1.mkdirp(to);
    pathUtil_1.chdir(to);
    return complex_1.pipeCommandOut(output, _7z, 'x', '-y', '-r', from);
}
exports.un7zip = un7zip;
async function distFilePath(type) {
    const product = await fsUtil_1.getProductData();
    const packageJson = await fsUtil_1.getPackageData();
    const pv = ('' + packageJson.patchVersion).replace(/\./g, '');
    return `release-files/${product.applicationName}.v${packageJson.version}-${product.quality}.${pv}.${type}`;
}
async function creatingZip(output) {
    const zipStoreDir = path_1.resolve(constants_1.RELEASE_ROOT, 'release-files');
    pathUtil_1.chdir(constants_1.RELEASE_ROOT);
    await common_step_1.cleanupZipFiles(output, zipStoreDir);
    const wantDirName = await fsUtil_1.calcCompileFolderName();
    output.write('creating zip...\n');
    if (constants_1.isWin) {
        const convert = new class TransformEncode extends stream_1.Transform {
            constructor() {
                super(...arguments);
                this.noEnd = true;
            }
            _transform(chunk, encoding, callback) {
                const str = chunk.toString('ascii');
                this.push(str, 'utf8');
                callback();
            }
        };
        convert.pipe(output, streamUtil_1.endArg(output));
        await createWindowsSfx(convert, wantDirName);
        await createWindowsZip(convert, wantDirName);
        convert.end();
    }
    else {
        await createPosixSfx(output, wantDirName);
    }
}
exports.creatingZip = creatingZip;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiemlwLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvY29kZWJsb2Nrcy96aXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1Q0FBeUM7QUFDekMsK0JBQStCO0FBQy9CLG1DQUFzRDtBQUN0RCxxREFBeUQ7QUFDekQsaURBQXdEO0FBQ3hELDJDQUF1RjtBQUN2RiwrQ0FBeUM7QUFDekMsbURBQTRDO0FBQzVDLHFEQUFzRDtBQUV0RCxNQUFNLEdBQUcsR0FBRyxpQkFBSyxDQUFBLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUVoRCxNQUFNLFVBQVUsR0FBRztJQUNsQixHQUFHO0lBQ0gsSUFBSTtJQUNKLElBQUk7SUFDSixNQUFNO0NBQ04sQ0FBQztBQUNGLElBQUksQ0FBQyxpQkFBSyxFQUFFO0lBQ1gsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLGdCQUFnQjtDQUMxQztBQUNELE1BQU0sVUFBVSxHQUFHO0lBQ2xCLEdBQUcsVUFBVTtJQUNiLE1BQU07SUFDTixRQUFRO0lBQ1IsTUFBTTtJQUNOLFdBQVc7SUFDWCxVQUFVO0lBQ1YsU0FBUztDQUNULENBQUM7QUFDRixJQUFJLGlCQUFLLEVBQUU7SUFDVixVQUFVLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxrQkFBa0I7Q0FDdEQ7S0FBTTtJQUNOLFVBQVUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxrQkFBa0I7Q0FDcEQ7QUFFRCxNQUFNLE9BQU8sR0FBRztJQUNmLEdBQUcsVUFBVTtJQUNiLE9BQU87SUFDUCxNQUFNO0NBQ04sQ0FBQztBQUVLLEtBQUssVUFBVSxjQUFjLENBQUMsTUFBNkIsRUFBRSxTQUFpQjtJQUNwRixNQUFNLFdBQVcsR0FBRyxNQUFNLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNq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
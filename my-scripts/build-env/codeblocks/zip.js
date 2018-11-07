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
const _7z = require('7zip')['7z'];
const commonArgs = [
    'a',
    '-y',
    '-r',
    '-ssc',
];
const normalArgs = [
    ...commonArgs,
    '-t7z',
    '-ms=on',
    '"-sfx7zCon.sfx"',
    '-mx8',
    '-m0=lzma2',
    '-md=256m',
    '-mfb=64',
];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiemlwLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvY29kZWJsb2Nrcy96aXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1Q0FBaUM7QUFDakMsK0JBQStCO0FBQy9CLG1DQUFzRDtBQUN0RCxxREFBeUQ7QUFDekQsaURBQXdEO0FBQ3hELDJDQUF1RjtBQUN2RiwrQ0FBeUM7QUFDekMsbURBQTRDO0FBQzVDLHFEQUFzRDtBQUV0RCxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFFbEMsTUFBTSxVQUFVLEdBQUc7SUFDbEIsR0FBRztJQUNILElBQUk7SUFDSixJQUFJO0lBQ0osTUFBTTtDQUNOLENBQUM7QUFDRixNQUFNLFVBQVUsR0FBRztJQUNsQixHQUFHLFVBQVU7SUFDYixNQUFNO0lBQ04sUUFBUTtJQUNSLGlCQUFpQjtJQUNqQixNQUFNO0lBQ04sV0FBVztJQUNYLFVBQVU7SUFDVixTQUFTO0NBQ1QsQ0FBQztBQUVGLE1BQU0sT0FBTyxHQUFHO0lBQ2YsR0FBRyxVQUFVO0lBQ2IsT0FBTztJQUNQLE1BQU07Q0FDTixDQUFDO0FBRUssS0FBSyxVQUFVLGNBQWMsQ0FBQyxNQUE2QixFQUFFLFNBQWlCO0lBQ3BGLE1BQU0sV0FBVyxHQUFHLE1BQU0sWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2pELE1BQU0sd0JBQWMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsVUFBVSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ3RGLE1BQU0sZ0JBQUssQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDakMsQ0FBQztBQUpELHdDQUlDO0FBRU0sS0FBSyxVQUFVLGdCQUFnQixDQUFDLE1BQTZCLEVBQUUsU0FBaUI7SUFDdEYsT0FBTyx3QkFBYyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxVQUFVLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFFLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUN0RyxDQUFDO0FBRkQsNENBRUM7QUFFTSxLQUFLLFVBQVUsZ0JBQWdCLENBQUMsTUFBNkIsRUFBRSxTQUFpQjtJQUN0RixPQUFPLHdCQUFjLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQUUsU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQ25HLENBQUM7QUFGRCw0Q0FFQztBQUVELEtBQUssVUFBVSxZQUFZLENBQUMsSUFBWTtJQUN2QyxNQUFNLE9BQU8sR0FBRyxNQUFNLHVCQUFjLEVBQUUsQ0FBQztJQUN2QyxNQUFNLFdBQVcsR0FBRyxNQUFNLHVCQUFjLEVBQUUsQ0FBQztJQUUzQyxNQUFNLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztJQUM5RCxPQUFPLGlCQUFpQixPQUFPLENBQUMsZUFBZSxLQUFLLFdBQVcsQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sSUFBSSxFQUFFLElBQUksSUFBSSxFQUFFLENBQUM7QUFDNUcsQ0FBQztBQUVNLEtBQUssVUFBVSxXQUFXLENBQUMsTUFBNkI7SUFDOUQsTUFBTSxXQUFXLEdBQUcsY0FBTyxDQUFDLHdCQUFZLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFFM0QsZ0JBQUssQ0FBQyx3QkFBWSxDQUFDLENBQUM7SUFDcEIsTUFBTSw2QkFBZSxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztJQUUzQyxNQUFNLFdBQVcsR0FBRyxNQUFNLDhCQUFxQixFQUFFLENBQUM7SUFFbEQsTUFBTSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBQ2xDLElBQUksaUJBQUssRUFBRTtRQUNWLE1BQU0sT0FBTyxHQUFHLElBQUksTUFBTSxlQUFnQixTQUFRLGtCQUFTO1lBQXZDOztnQkFDWixVQUFLLEdBQUcsSUFBSSxDQUFDO1lBT3JCLENBQUM7WUFMQSxVQUFVLENBQUMsS0FBYSxFQUFFLFFBQWdCLEVBQUUsUUFBMkI7Z0JBQ3RFLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3BDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUN2QixRQUFRLEVBQUUsQ0FBQztZQUNaLENBQUM7U0FDRCxDQUFDO1FBQ0YsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsbUJBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBRXJDLE1BQU0sZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQzdDLE1BQU0sZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBRTdDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztLQUNkO1NBQU07UUFDTixNQUFNLGNBQWMsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7S0FDMUM7QUFDRixDQUFDO0FBNUJELGtDQTRCQyJ9
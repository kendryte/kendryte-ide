"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const complex_1 = require("../childprocess/complex");
const fsUtil_1 = require("../misc/fsUtil");
const _7z = require('7zip')['7z'];
const commonArgs = [
    'a',
    '-y',
    '-r',
    '-ssc',
    '-ms=on',
];
const normalArgs = [
    ...commonArgs,
    '-t7z',
    '-sfx7zCon.sfx',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiemlwLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvY29kZWJsb2Nrcy96aXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSx1Q0FBaUM7QUFDakMscURBQXlEO0FBQ3pELDJDQUFnRTtBQUVoRSxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFFbEMsTUFBTSxVQUFVLEdBQUc7SUFDbEIsR0FBRztJQUNILElBQUk7SUFDSixJQUFJO0lBQ0osTUFBTTtJQUNOLFFBQVE7Q0FDUixDQUFDO0FBQ0YsTUFBTSxVQUFVLEdBQUc7SUFDbEIsR0FBRyxVQUFVO0lBQ2IsTUFBTTtJQUNOLGVBQWU7SUFDZixNQUFNO0lBQ04sV0FBVztJQUNYLFVBQVU7SUFDVixTQUFTO0NBQ1QsQ0FBQztBQUVGLE1BQU0sT0FBTyxHQUFHO0lBQ2YsR0FBRyxVQUFVO0lBQ2IsT0FBTztJQUNQLE1BQU07Q0FDTixDQUFDO0FBRUssS0FBSyxVQUFVLGNBQWMsQ0FBQyxNQUEyQixFQUFFLFNBQWlCO0lBQ2xGLE1BQU0sV0FBVyxHQUFHLE1BQU0sWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2pELE1BQU0sd0JBQWMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsVUFBVSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ3RGLE1BQU0sZ0JBQUssQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDakMsQ0FBQztBQUpELHdDQUlDO0FBRU0sS0FBSyxVQUFVLGdCQUFnQixDQUFDLE1BQTJCLEVBQUUsU0FBaUI7SUFDcEYsT0FBTyx3QkFBYyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxVQUFVLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFFLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUN0RyxDQUFDO0FBRkQsNENBRUM7QUFFTSxLQUFLLFVBQVUsZ0JBQWdCLENBQUMsTUFBMkIsRUFBRSxTQUFpQjtJQUNwRixPQUFPLHdCQUFjLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQUUsU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQ25HLENBQUM7QUFGRCw0Q0FFQztBQUVELEtBQUssVUFBVSxZQUFZLENBQUMsSUFBWTtJQUN2QyxNQUFNLE9BQU8sR0FBRyxNQUFNLHVCQUFjLEVBQUUsQ0FBQztJQUN2QyxNQUFNLFdBQVcsR0FBRyxNQUFNLHVCQUFjLEVBQUUsQ0FBQztJQUUzQyxNQUFNLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztJQUM5RCxPQUFPLGlCQUFpQixPQUFPLENBQUMsZUFBZSxLQUFLLFdBQVcsQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sSUFBSSxFQUFFLElBQUksSUFBSSxFQUFFLENBQUM7QUFDNUcsQ0FBQyJ9
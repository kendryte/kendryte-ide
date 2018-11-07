"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const complex_1 = require("../childprocess/complex");
const fsUtil_1 = require("../misc/fsUtil");
const _7z = require('7zip')['7z'];
const commonArgs = [
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
    '-d=256m',
    '-mfb=64',
];
const zipArgs = [
    ...commonArgs,
    '-tzip',
    '-mx6',
];
async function createPosixSfx(output, whatToZip) {
    const zipFileName = await distFilePath('7z.bin');
    await complex_1.pipeCommandOut(output, _7z, ...normalArgs, '--', zipFileName, whatToZip);
    await fs_extra_1.chmod(zipFileName, '777');
}
exports.createPosixSfx = createPosixSfx;
async function createWindowsSfx(output, whatToZip) {
    return complex_1.pipeCommandOut(output, _7z, ...normalArgs, '--', await distFilePath('exe'), whatToZip);
}
exports.createWindowsSfx = createWindowsSfx;
async function createWindowsZip(output, whatToZip) {
    return complex_1.pipeCommandOut(output, _7z, ...zipArgs, '--', await distFilePath('zip'), whatToZip);
}
exports.createWindowsZip = createWindowsZip;
async function distFilePath(type) {
    const product = await fsUtil_1.getProductData();
    const packageJson = await fsUtil_1.getPackageData();
    const pv = ('' + packageJson.patchVersion).replace(/\./g, '');
    return `release-files/${product.applicationName}.v${packageJson.version}-${product.quality}.${pv}.${type}`;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiemlwLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvY29kZWJsb2Nrcy96aXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSx1Q0FBaUM7QUFDakMscURBQXlEO0FBQ3pELDJDQUFnRTtBQUVoRSxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFFbEMsTUFBTSxVQUFVLEdBQUc7SUFDbEIsSUFBSTtJQUNKLElBQUk7SUFDSixNQUFNO0lBQ04sUUFBUTtDQUNSLENBQUM7QUFDRixNQUFNLFVBQVUsR0FBRztJQUNsQixHQUFHLFVBQVU7SUFDYixNQUFNO0lBQ04sZUFBZTtJQUNmLE1BQU07SUFDTixXQUFXO0lBQ1gsU0FBUztJQUNULFNBQVM7Q0FDVCxDQUFDO0FBRUYsTUFBTSxPQUFPLEdBQUc7SUFDZixHQUFHLFVBQVU7SUFDYixPQUFPO0lBQ1AsTUFBTTtDQUNOLENBQUM7QUFFSyxLQUFLLFVBQVUsY0FBYyxDQUFDLE1BQTJCLEVBQUUsU0FBaUI7SUFDbEYsTUFBTSxXQUFXLEdBQUcsTUFBTSxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDakQsTUFBTSx3QkFBYyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxVQUFVLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUMvRSxNQUFNLGdCQUFLLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ2pDLENBQUM7QUFKRCx3Q0FJQztBQUVNLEtBQUssVUFBVSxnQkFBZ0IsQ0FBQyxNQUEyQixFQUFFLFNBQWlCO0lBQ3BGLE9BQU8sd0JBQWMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsVUFBVSxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQyxLQUFLLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztBQUMvRixDQUFDO0FBRkQsNENBRUM7QUFFTSxLQUFLLFVBQVUsZ0JBQWdCLENBQUMsTUFBMkIsRUFBRSxTQUFpQjtJQUNwRixPQUFPLHdCQUFjLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDNUYsQ0FBQztBQUZELDRDQUVDO0FBRUQsS0FBSyxVQUFVLFlBQVksQ0FBQyxJQUFZO0lBQ3ZDLE1BQU0sT0FBTyxHQUFHLE1BQU0sdUJBQWMsRUFBRSxDQUFDO0lBQ3ZDLE1BQU0sV0FBVyxHQUFHLE1BQU0sdUJBQWMsRUFBRSxDQUFDO0lBRTNDLE1BQU0sRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzlELE9BQU8saUJBQWlCLE9BQU8sQ0FBQyxlQUFlLEtBQUssV0FBVyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsT0FBTyxJQUFJLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUM1RyxDQUFDIn0=
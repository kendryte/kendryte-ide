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
async function createPosixSfx(output) {
    const [zip, dir] = await createArgList('7z.bin');
    await complex_1.pipeCommandOut(output, _7z, ...normalArgs, '--', zip, dir);
    await fs_extra_1.chmod(zip, '777');
}
exports.createPosixSfx = createPosixSfx;
async function createWindowsSfx(output) {
    return complex_1.pipeCommandOut(output, _7z, ...normalArgs, '--', ...await createArgList('exe'));
}
exports.createWindowsSfx = createWindowsSfx;
async function createWindowsZip(output) {
    return complex_1.pipeCommandOut(output, _7z, ...zipArgs, '--', ...await createArgList('exe'));
}
exports.createWindowsZip = createWindowsZip;
async function createArgList(type) {
    const product = await fsUtil_1.getProductData();
    const packageJson = await fsUtil_1.getPackageData();
    const pv = ('' + packageJson.patchVersion).replace(/\./g, '');
    return [
        `${product.PRODUCT_NAME}.v${packageJson.version}-${product.quality}.${pv}.${type}`,
        product.PRODUCT_NAME,
    ];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiemlwLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvY29kZWJsb2Nrcy96aXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSx1Q0FBaUM7QUFDakMscURBQXlEO0FBQ3pELDJDQUFnRTtBQUVoRSxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFFbEMsTUFBTSxVQUFVLEdBQUc7SUFDbEIsSUFBSTtJQUNKLElBQUk7SUFDSixNQUFNO0lBQ04sUUFBUTtDQUNSLENBQUM7QUFDRixNQUFNLFVBQVUsR0FBRztJQUNsQixHQUFHLFVBQVU7SUFDYixNQUFNO0lBQ04sZUFBZTtJQUNmLE1BQU07SUFDTixXQUFXO0lBQ1gsU0FBUztJQUNULFNBQVM7Q0FDVCxDQUFDO0FBRUYsTUFBTSxPQUFPLEdBQUc7SUFDZixHQUFHLFVBQVU7SUFDYixPQUFPO0lBQ1AsTUFBTTtDQUNOLENBQUM7QUFFSyxLQUFLLFVBQVUsY0FBYyxDQUFDLE1BQXFCO0lBQ3pELE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsTUFBTSxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDakQsTUFBTSx3QkFBYyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxVQUFVLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNqRSxNQUFNLGdCQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3pCLENBQUM7QUFKRCx3Q0FJQztBQUVNLEtBQUssVUFBVSxnQkFBZ0IsQ0FBQyxNQUFxQjtJQUMzRCxPQUFPLHdCQUFjLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLFVBQVUsRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ3hGLENBQUM7QUFGRCw0Q0FFQztBQUVNLEtBQUssVUFBVSxnQkFBZ0IsQ0FBQyxNQUFxQjtJQUMzRCxPQUFPLHdCQUFjLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLE9BQU8sRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ3JGLENBQUM7QUFGRCw0Q0FFQztBQUVELEtBQUssVUFBVSxhQUFhLENBQUMsSUFBWTtJQUN4QyxNQUFNLE9BQU8sR0FBRyxNQUFNLHVCQUFjLEVBQUUsQ0FBQztJQUN2QyxNQUFNLFdBQVcsR0FBRyxNQUFNLHVCQUFjLEVBQUUsQ0FBQztJQUUzQyxNQUFNLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztJQUM5RCxPQUFPO1FBQ04sR0FBRyxPQUFPLENBQUMsWUFBWSxLQUFLLFdBQVcsQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sSUFBSSxFQUFFLElBQUksSUFBSSxFQUFFO1FBQ2xGLE9BQU8sQ0FBQyxZQUFZO0tBQ3BCLENBQUM7QUFDSCxDQUFDIn0=
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
const path_1 = require("path");
const constants_1 = require("../misc/constants");
const fsUtil_1 = require("../misc/fsUtil");
exports.TYPE_WINDOWS_SFX = 'exe';
exports.TYPE_WINDOWS_ZIP = 'zip';
exports.TYPE_LINUX_SFX = '7z.bin';
exports.TYPE_LINUX_ZIP = 'zip';
exports.TYPE_MAC_SFX = '7z.bin';
exports.TYPE_MAC_ZIP = 'zip';
function distFileName(platform, type) {
    const product = fsUtil_1.getProductData();
    const packageJson = fsUtil_1.getPackageData();
    const pv = ('' + packageJson.patchVersion).replace(/\./g, '');
    return path_1.normalize(`${platform}.${product.applicationName}.v${packageJson.version}-${product.quality}.${pv}.${type}`);
}
function packageFileName(platform, type) {
    return `${platform}.offlinepackages.${type}`;
}
exports.packageFileName = packageFileName;
function calcReleaseFileName() {
    const plat = os_1.platform();
    if (constants_1.isWin) {
        return [distFileName(plat, exports.TYPE_WINDOWS_SFX), distFileName(plat, exports.TYPE_WINDOWS_ZIP)];
    }
    else {
        return [distFileName(plat, exports.TYPE_LINUX_SFX)];
    }
}
exports.calcReleaseFileName = calcReleaseFileName;
function nameReleaseFile() {
    const plat = os_1.platform();
    return distFileName.bind(undefined, plat);
}
exports.nameReleaseFile = nameReleaseFile;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiemlwLm5hbWUuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImJ1aWxkLWVudi9jb2RlYmxvY2tzL3ppcC5uYW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkJBQThCO0FBQzlCLCtCQUFpQztBQUNqQyxpREFBMEM7QUFDMUMsMkNBQWdFO0FBRW5ELFFBQUEsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO0FBQ3pCLFFBQUEsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO0FBQ3pCLFFBQUEsY0FBYyxHQUFHLFFBQVEsQ0FBQztBQUMxQixRQUFBLGNBQWMsR0FBRyxLQUFLLENBQUM7QUFDdkIsUUFBQSxZQUFZLEdBQUcsUUFBUSxDQUFDO0FBQ3hCLFFBQUEsWUFBWSxHQUFHLEtBQUssQ0FBQztBQUVsQyxTQUFTLFlBQVksQ0FBQyxRQUFnQixFQUFFLElBQVk7SUFDbkQsTUFBTSxPQUFPLEdBQUcsdUJBQWMsRUFBRSxDQUFDO0lBQ2pDLE1BQU0sV0FBVyxHQUFHLHVCQUFjLEVBQUUsQ0FBQztJQUVyQyxNQUFNLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztJQUM5RCxPQUFPLGdCQUFTLENBQUMsR0FBRyxRQUFRLElBQUksT0FBTyxDQUFDLGVBQWUsS0FBSyxXQUFXLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxPQUFPLElBQUksRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLENBQUM7QUFDckgsQ0FBQztBQUVELFNBQWdCLGVBQWUsQ0FBQyxRQUFnQixFQUFFLElBQVk7SUFDN0QsT0FBTyxHQUFHLFFBQVEsb0JBQW9CLElBQUksRUFBRSxDQUFDO0FBQzlDLENBQUM7QUFGRCwwQ0FFQztBQUVELFNBQWdCLG1CQUFtQjtJQUNsQyxNQUFNLElBQUksR0FBRyxhQUFRLEVBQUUsQ0FBQztJQUN4QixJQUFJLGlCQUFLLEVBQUU7UUFDVixPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSx3QkFBZ0IsQ0FBQyxFQUFFLFlBQVksQ0FBQyxJQUFJLEVBQUUsd0JBQWdCLENBQUMsQ0FBQyxDQUFDO0tBQ3BGO1NBQU07UUFDTixPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxzQkFBYyxDQUFDLENBQUMsQ0FBQztLQUM1QztBQUNGLENBQUM7QUFQRCxrREFPQztBQUVELFNBQWdCLGVBQWU7SUFDOUIsTUFBTSxJQUFJLEdBQUcsYUFBUSxFQUFFLENBQUM7SUFDeEIsT0FBTyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMzQyxDQUFDO0FBSEQsMENBR0MifQ==
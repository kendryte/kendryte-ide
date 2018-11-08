"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const build_linux_1 = require("../build-env/codeblocks/build/build-linux");
const build_mac_1 = require("../build-env/codeblocks/build/build-mac");
const build_windows_1 = require("../build-env/codeblocks/build/build-windows");
const buildExtractSource_1 = require("../build-env/codeblocks/build/buildExtractSource");
const common_step_1 = require("../build-env/codeblocks/build/common-step");
const zip_1 = require("../build-env/codeblocks/zip");
const clsUtil_1 = require("../build-env/misc/clsUtil");
const constants_1 = require("../build-env/misc/constants");
const fsUtil_1 = require("../build-env/misc/fsUtil");
const help_1 = require("../build-env/misc/help");
const myBuildSystem_1 = require("../build-env/misc/myBuildSystem");
const pathUtil_1 = require("../build-env/misc/pathUtil");
const timeUtil_1 = require("../build-env/misc/timeUtil");
const usePretty_1 = require("../build-env/misc/usePretty");
help_1.whatIsThis(__filename, 'build complete release.');
let output;
myBuildSystem_1.runMain(async () => {
    clsUtil_1.cleanScreen();
    pathUtil_1.chdir(constants_1.VSCODE_ROOT);
    output = usePretty_1.usePretty('build');
    output.write('starting build...\n');
    process.env.BUILDING = 'yes';
    await common_step_1.deleteCompileCaches(output);
    const product = await fsUtil_1.getProductData();
    await fsUtil_1.getPackageData();
    const zipStoreDir = path_1.resolve(constants_1.RELEASE_ROOT, 'release-files');
    output.write(`Starting build
	Release Root=${constants_1.RELEASE_ROOT}
	Product Name=${product.applicationName}
	App Title=${product.nameShort}
	Platform=${constants_1.isWin ? 'windows' : constants_1.isMac ? 'mac os' : 'linux'}
	Storage=${zipStoreDir}

`);
    pathUtil_1.chdir(constants_1.RELEASE_ROOT);
    const wantDirName = await fsUtil_1.calcCompileFolderName();
    const wantDirPath = path_1.resolve(constants_1.RELEASE_ROOT, wantDirName);
    await common_step_1.cleanupBuildResult(output, wantDirPath);
    await buildExtractSource_1.extractSourceCodeIfNeed(output);
    await common_step_1.yarnInstall(output);
    await common_step_1.downloadElectron(output);
    await common_step_1.downloadBuiltinExtensions(output);
    const timeBuild = timeUtil_1.timing();
    output.success('Prepare complete. Start building package. This is really slow.').continue();
    let compileResultFolder;
    pathUtil_1.chdir(constants_1.ARCH_RELEASE_ROOT);
    if (constants_1.isWin) {
        compileResultFolder = await build_windows_1.windowsBuild(output);
    }
    else if (constants_1.isMac) {
        compileResultFolder = await build_mac_1.macBuild(output);
    }
    else {
        compileResultFolder = await build_linux_1.linuxBuild(output);
    }
    output.success('Package Created.' + timeBuild()).continue();
    await fsUtil_1.rename(compileResultFolder, wantDirPath);
    await zip_1.creatingZip(output);
    output.success('complete.');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImNvbW1hbmRzL2J1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsK0JBQStCO0FBQy9CLDJFQUF1RTtBQUN2RSx1RUFBbUU7QUFDbkUsK0VBQTJFO0FBQzNFLHlGQUEyRjtBQUMzRiwyRUFNbUQ7QUFDbkQscURBQTBEO0FBQzFELHVEQUF3RDtBQUN4RCwyREFBeUc7QUFDekcscURBQXlHO0FBQ3pHLGlEQUFvRDtBQUNwRCxtRUFBOEU7QUFDOUUseURBQW1EO0FBQ25ELHlEQUFvRDtBQUNwRCwyREFBd0Q7QUFFeEQsaUJBQVUsQ0FBQyxVQUFVLEVBQUUseUJBQXlCLENBQUMsQ0FBQztBQUVsRCxJQUFJLE1BQTJCLENBQUM7QUFDaEMsdUJBQU8sQ0FBQyxLQUFLLElBQUksRUFBRTtJQUNsQixxQkFBVyxFQUFFLENBQUM7SUFDZCxnQkFBSyxDQUFDLHVCQUFXLENBQUMsQ0FBQztJQUVuQixNQUFNLEdBQUcscUJBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM1QixNQUFNLENBQUMsS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFFcEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0lBQzdCLE1BQU0saUNBQW1CLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFbEMsTUFBTSxPQUFPLEdBQUcsTUFBTSx1QkFBYyxFQUFFLENBQUM7SUFDdkMsTUFBTSx1QkFBYyxFQUFFLENBQUM7SUFFdkIsTUFBTSxXQUFXLEdBQUcsY0FBTyxDQUFDLHdCQUFZLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFFM0QsTUFBTSxDQUFDLEtBQUssQ0FBQztnQkFDRSx3QkFBWTtnQkFDWixPQUFPLENBQUMsZUFBZTthQUMxQixPQUFPLENBQUMsU0FBUztZQUNsQixpQkFBSyxDQUFBLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGlCQUFLLENBQUEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTztXQUM3QyxXQUFXOztDQUVyQixDQUFDLENBQUM7SUFFRixnQkFBSyxDQUFDLHdCQUFZLENBQUMsQ0FBQztJQUNwQixNQUFNLFdBQVcsR0FBRyxNQUFNLDhCQUFxQixFQUFFLENBQUM7SUFDbEQsTUFBTSxXQUFXLEdBQUcsY0FBTyxDQUFDLHdCQUFZLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDdkQsTUFBTSxnQ0FBa0IsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFFOUMsTUFBTSw0Q0FBdUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN0QyxNQUFNLHlCQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDMUIsTUFBTSw4QkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMvQixNQUFNLHVDQUF5QixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRXhDLE1BQU0sU0FBUyxHQUFHLGlCQUFNLEVBQUUsQ0FBQztJQUMzQixNQUFNLENBQUMsT0FBTyxDQUFDLGdFQUFnRSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7SUFFNUYsSUFBSSxtQkFBMkIsQ0FBQztJQUNoQyxnQkFBSyxDQUFDLDZCQUFpQixDQUFDLENBQUM7SUFDekIsSUFBSSxpQkFBSyxFQUFFO1FBQ1YsbUJBQW1CLEdBQUcsTUFBTSw0QkFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ2pEO1NBQU0sSUFBSSxpQkFBSyxFQUFFO1FBQ2pCLG1CQUFtQixHQUFHLE1BQU0sb0JBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUM3QztTQUFNO1FBQ04sbUJBQW1CLEdBQUcsTUFBTSx3QkFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQy9DO0lBQ0QsTUFBTSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsR0FBRyxTQUFTLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBRTVELE1BQU0sZUFBTSxDQUFDLG1CQUFtQixFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBRS9DLE1BQU0saUJBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUUxQixNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzdCLENBQUMsQ0FBQyxDQUFDIn0=
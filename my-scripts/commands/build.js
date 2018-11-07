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
const myBuildSystem_1 = require("../build-env/misc/myBuildSystem");
const pathUtil_1 = require("../build-env/misc/pathUtil");
const timeUtil_1 = require("../build-env/misc/timeUtil");
myBuildSystem_1.whatIsThis(__filename, 'build complete release.');
let output;
myBuildSystem_1.runMain(async () => {
    clsUtil_1.cleanScreen();
    pathUtil_1.chdir(constants_1.VSCODE_ROOT);
    output = myBuildSystem_1.usePretty();
    output.pipe(myBuildSystem_1.useWriteFileStream(path_1.resolve(constants_1.RELEASE_ROOT, 'build.log')));
    output.write('starting build...\n');
    process.env.BUILDING = 'yes';
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
    await common_step_1.cleanupBuildResult(output, path_1.resolve(constants_1.RELEASE_ROOT, wantDirName));
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
    await fsUtil_1.rename(compileResultFolder, wantDirName);
    pathUtil_1.chdir(constants_1.RELEASE_ROOT);
    await common_step_1.cleanupZipFiles(output, zipStoreDir);
    output.write('creating zip...');
    if (constants_1.isWin) {
        await zip_1.createWindowsSfx(output, wantDirName);
        await zip_1.createWindowsZip(output, wantDirName);
    }
    else {
        await zip_1.createPosixSfx(output, wantDirName);
    }
    output.success('complete.');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImNvbW1hbmRzL2J1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsK0JBQStCO0FBQy9CLDJFQUF1RTtBQUN2RSx1RUFBbUU7QUFDbkUsK0VBQTJFO0FBQzNFLHlGQUEyRjtBQUMzRiwyRUFNbUQ7QUFDbkQscURBQWlHO0FBQ2pHLHVEQUF3RDtBQUN4RCwyREFBeUc7QUFDekcscURBQXlHO0FBQ3pHLG1FQUFxRztBQUNyRyx5REFBbUQ7QUFDbkQseURBQW9EO0FBRXBELDBCQUFVLENBQUMsVUFBVSxFQUFFLHlCQUF5QixDQUFDLENBQUM7QUFFbEQsSUFBSSxNQUEyQixDQUFDO0FBQ2hDLHVCQUFPLENBQUMsS0FBSyxJQUFJLEVBQUU7SUFDbEIscUJBQVcsRUFBRSxDQUFDO0lBQ2QsZ0JBQUssQ0FBQyx1QkFBVyxDQUFDLENBQUM7SUFFbkIsTUFBTSxHQUFHLHlCQUFTLEVBQUUsQ0FBQztJQUNyQixNQUFNLENBQUMsSUFBSSxDQUFDLGtDQUFrQixDQUFDLGNBQU8sQ0FBQyx3QkFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNwRSxNQUFNLENBQUMsS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFFcEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0lBRTdCLE1BQU0sT0FBTyxHQUFHLE1BQU0sdUJBQWMsRUFBRSxDQUFDO0lBQ3ZDLE1BQU0sdUJBQWMsRUFBRSxDQUFDO0lBRXZCLE1BQU0sV0FBVyxHQUFHLGNBQU8sQ0FBQyx3QkFBWSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0lBRTNELE1BQU0sQ0FBQyxLQUFLLENBQUM7Z0JBQ0Usd0JBQVk7Z0JBQ1osT0FBTyxDQUFDLGVBQWU7YUFDMUIsT0FBTyxDQUFDLFNBQVM7WUFDbEIsaUJBQUssQ0FBQSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxpQkFBSyxDQUFBLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU87V0FDN0MsV0FBVzs7Q0FFckIsQ0FBQyxDQUFDO0lBRUYsZ0JBQUssQ0FBQyx3QkFBWSxDQUFDLENBQUM7SUFDcEIsTUFBTSxXQUFXLEdBQUcsTUFBTSw4QkFBcUIsRUFBRSxDQUFDO0lBQ2xELE1BQU0sZ0NBQWtCLENBQUMsTUFBTSxFQUFFLGNBQU8sQ0FBQyx3QkFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7SUFFckUsTUFBTSw0Q0FBdUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN0QyxNQUFNLHlCQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDMUIsTUFBTSw4QkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMvQixNQUFNLHVDQUF5QixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRXhDLE1BQU0sU0FBUyxHQUFHLGlCQUFNLEVBQUUsQ0FBQztJQUMzQixNQUFNLENBQUMsT0FBTyxDQUFDLGdFQUFnRSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7SUFFNUYsSUFBSSxtQkFBMkIsQ0FBQztJQUNoQyxnQkFBSyxDQUFDLDZCQUFpQixDQUFDLENBQUM7SUFDekIsSUFBSSxpQkFBSyxFQUFFO1FBQ1YsbUJBQW1CLEdBQUcsTUFBTSw0QkFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ2pEO1NBQU0sSUFBSSxpQkFBSyxFQUFFO1FBQ2pCLG1CQUFtQixHQUFHLE1BQU0sb0JBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUM3QztTQUFNO1FBQ04sbUJBQW1CLEdBQUcsTUFBTSx3QkFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQy9DO0lBQ0QsTUFBTSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsR0FBRyxTQUFTLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBRTVELE1BQU0sZUFBTSxDQUFDLG1CQUFtQixFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBRS9DLGdCQUFLLENBQUMsd0JBQVksQ0FBQyxDQUFDO0lBQ3BCLE1BQU0sNkJBQWUsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFFM0MsTUFBTSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ2hDLElBQUksaUJBQUssRUFBRTtRQUNWLE1BQU0sc0JBQWdCLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQzVDLE1BQU0sc0JBQWdCLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0tBQzVDO1NBQU07UUFDTixNQUFNLG9CQUFjLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0tBQzFDO0lBRUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUM3QixDQUFDLENBQUMsQ0FBQyJ9
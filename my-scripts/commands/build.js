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
    output = usePretty_1.usePretty();
    output.pipe(myBuildSystem_1.useWriteFileStream(path_1.resolve(constants_1.RELEASE_ROOT, 'build.log')));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImNvbW1hbmRzL2J1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsK0JBQStCO0FBQy9CLDJFQUF1RTtBQUN2RSx1RUFBbUU7QUFDbkUsK0VBQTJFO0FBQzNFLHlGQUEyRjtBQUMzRiwyRUFNbUQ7QUFDbkQscURBQTBEO0FBQzFELHVEQUF3RDtBQUN4RCwyREFBeUc7QUFDekcscURBQXlHO0FBQ3pHLGlEQUFvRDtBQUNwRCxtRUFBOEU7QUFDOUUseURBQW1EO0FBQ25ELHlEQUFvRDtBQUNwRCwyREFBd0Q7QUFFeEQsaUJBQVUsQ0FBQyxVQUFVLEVBQUUseUJBQXlCLENBQUMsQ0FBQztBQUVsRCxJQUFJLE1BQTJCLENBQUM7QUFDaEMsdUJBQU8sQ0FBQyxLQUFLLElBQUksRUFBRTtJQUNsQixxQkFBVyxFQUFFLENBQUM7SUFDZCxnQkFBSyxDQUFDLHVCQUFXLENBQUMsQ0FBQztJQUVuQixNQUFNLEdBQUcscUJBQVMsRUFBRSxDQUFDO0lBQ3JCLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0NBQWtCLENBQUMsY0FBTyxDQUFDLHdCQUFZLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BFLE1BQU0sQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQztJQUVwQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7SUFDN0IsTUFBTSxpQ0FBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUVsQyxNQUFNLE9BQU8sR0FBRyxNQUFNLHVCQUFjLEVBQUUsQ0FBQztJQUN2QyxNQUFNLHVCQUFjLEVBQUUsQ0FBQztJQUV2QixNQUFNLFdBQVcsR0FBRyxjQUFPLENBQUMsd0JBQVksRUFBRSxlQUFlLENBQUMsQ0FBQztJQUUzRCxNQUFNLENBQUMsS0FBSyxDQUFDO2dCQUNFLHdCQUFZO2dCQUNaLE9BQU8sQ0FBQyxlQUFlO2FBQzFCLE9BQU8sQ0FBQyxTQUFTO1lBQ2xCLGlCQUFLLENBQUEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsaUJBQUssQ0FBQSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPO1dBQzdDLFdBQVc7O0NBRXJCLENBQUMsQ0FBQztJQUVGLGdCQUFLLENBQUMsd0JBQVksQ0FBQyxDQUFDO0lBQ3BCLE1BQU0sV0FBVyxHQUFHLE1BQU0sOEJBQXFCLEVBQUUsQ0FBQztJQUNsRCxNQUFNLFdBQVcsR0FBRyxjQUFPLENBQUMsd0JBQVksRUFBRSxXQUFXLENBQUMsQ0FBQztJQUN2RCxNQUFNLGdDQUFrQixDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztJQUU5QyxNQUFNLDRDQUF1QixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3RDLE1BQU0seUJBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMxQixNQUFNLDhCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQy9CLE1BQU0sdUNBQXlCLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFeEMsTUFBTSxTQUFTLEdBQUcsaUJBQU0sRUFBRSxDQUFDO0lBQzNCLE1BQU0sQ0FBQyxPQUFPLENBQUMsZ0VBQWdFLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUU1RixJQUFJLG1CQUEyQixDQUFDO0lBQ2hDLGdCQUFLLENBQUMsNkJBQWlCLENBQUMsQ0FBQztJQUN6QixJQUFJLGlCQUFLLEVBQUU7UUFDVixtQkFBbUIsR0FBRyxNQUFNLDRCQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDakQ7U0FBTSxJQUFJLGlCQUFLLEVBQUU7UUFDakIsbUJBQW1CLEdBQUcsTUFBTSxvQkFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQzdDO1NBQU07UUFDTixtQkFBbUIsR0FBRyxNQUFNLHdCQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDL0M7SUFDRCxNQUFNLENBQUMsT0FBTyxDQUFDLGtCQUFrQixHQUFHLFNBQVMsRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7SUFFNUQsTUFBTSxlQUFNLENBQUMsbUJBQW1CLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFFL0MsTUFBTSxpQkFBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRTFCLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDN0IsQ0FBQyxDQUFDLENBQUMifQ==
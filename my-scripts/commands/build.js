"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const complex_1 = require("../build-env/childprocess/complex");
const yarn_1 = require("../build-env/childprocess/yarn");
const buildExtractSource_1 = require("../build-env/codeblocks/buildExtractSource");
const zip_1 = require("../build-env/codeblocks/zip");
const constants_1 = require("../build-env/misc/constants");
const fsUtil_1 = require("../build-env/misc/fsUtil");
const myBuildSystem_1 = require("../build-env/misc/myBuildSystem");
const pathUtil_1 = require("../build-env/misc/pathUtil");
const timeUtil_1 = require("../build-env/misc/timeUtil");
const build_linux_1 = require("../build-env/posix/build-linux");
const build_mac_1 = require("../build-env/posix/mac/build-mac");
const build_windows_1 = require("../build-env/windows/build-windows");
let output;
myBuildSystem_1.runMain(async () => {
    const output = myBuildSystem_1.usePretty();
    output.write('starting build...\n');
    pathUtil_1.chdir(constants_1.VSCODE_ROOT);
    process.env.BUILDING = 'yes';
    const product = await fsUtil_1.getProductData();
    const distFolder = path_1.resolve(constants_1.RELEASE_ROOT, product.PRODUCT_NAME);
    await cleanupBuildResult(distFolder);
    await buildExtractSource_1.extractSourceCodeIfNeed(output);
    await yarnInstall();
    await downloadElectron();
    const timeBuild = timeUtil_1.timing();
    output.success('Prepare complete. Start building package. This is really slow.').continue();
    let outputFolder;
    if (constants_1.isWin) {
        outputFolder = await build_windows_1.windowsBuild(output);
    }
    else if (constants_1.isMac) {
        outputFolder = await build_mac_1.macBuild(output);
    }
    else {
        outputFolder = await build_linux_1.linuxBuild(output);
    }
    output.success('Package Created.' + timeBuild()).continue();
    await fsUtil_1.rename(outputFolder, distFolder);
    pathUtil_1.chdir(constants_1.RELEASE_ROOT);
    const resultDir = path_1.resolve(constants_1.RELEASE_ROOT, 'release');
    await cleanupZipFiles(resultDir);
    output.write('creating zip...');
    if (constants_1.isWin) {
        await zip_1.createWindowsSfx(output);
        await zip_1.createWindowsZip(output);
    }
    else {
        await zip_1.createPosixSfx(output);
    }
    output.success('complete.');
});
async function cleanupBuildResult(dir) {
    output.write(`build target is: ${dir}\n`);
    if (await fsUtil_1.isExists(dir)) {
        if (await fsUtil_1.isExists(dir + '.last')) {
            await fsUtil_1.removeDirectory(dir + '.last', output);
        }
        output.write(`remove last build result.\n`);
        await fsUtil_1.rename(dir, dir + '.last').catch((e) => {
            output.fail(`Cannot remove folder "${dir}", did you open any file in it?`).continue();
            throw e;
        });
    }
}
async function cleanupZipFiles(dir) {
    if (await fsUtil_1.isExists(dir)) {
        await fsUtil_1.removeDirectory(dir, output);
    }
    fsUtil_1.mkdirpSync(dir);
}
async function yarnInstall() {
    pathUtil_1.chdir(constants_1.VSCODE_ROOT);
    const timeInstall = timeUtil_1.timing();
    await yarn_1.installDependency(output, constants_1.VSCODE_ROOT);
    output.success('dependencies installed.' + timeInstall()).continue();
}
async function downloadElectron() {
    pathUtil_1.chdir(constants_1.VSCODE_ROOT);
    output.write(`installing electron...\n`);
    await complex_1.pipeCommandOut(output, 'gulp', 'electron-x64');
    output.success('electron installed.').continue();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImNvbW1hbmRzL2J1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsK0JBQStCO0FBQy9CLCtEQUFtRTtBQUNuRSx5REFBbUU7QUFDbkUsbUZBQXFGO0FBQ3JGLHFEQUFpRztBQUNqRywyREFBc0Y7QUFDdEYscURBQXlHO0FBQ3pHLG1FQUFxRTtBQUNyRSx5REFBbUQ7QUFDbkQseURBQW9EO0FBQ3BELGdFQUE0RDtBQUM1RCxnRUFBNEQ7QUFDNUQsc0VBQWtFO0FBRWxFLElBQUksTUFBcUIsQ0FBQztBQUMxQix1QkFBTyxDQUFDLEtBQUssSUFBSSxFQUFFO0lBQ2xCLE1BQU0sTUFBTSxHQUFHLHlCQUFTLEVBQUUsQ0FBQztJQUMzQixNQUFNLENBQUMsS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFFcEMsZ0JBQUssQ0FBQyx1QkFBVyxDQUFDLENBQUM7SUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0lBRTdCLE1BQU0sT0FBTyxHQUFHLE1BQU0sdUJBQWMsRUFBRSxDQUFDO0lBQ3ZDLE1BQU0sVUFBVSxHQUFHLGNBQU8sQ0FBQyx3QkFBWSxFQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUUvRCxNQUFNLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3JDLE1BQU0sNENBQXVCLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdEMsTUFBTSxXQUFXLEVBQUUsQ0FBQztJQUNwQixNQUFNLGdCQUFnQixFQUFFLENBQUM7SUFFekIsTUFBTSxTQUFTLEdBQUcsaUJBQU0sRUFBRSxDQUFDO0lBQzNCLE1BQU0sQ0FBQyxPQUFPLENBQUMsZ0VBQWdFLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUU1RixJQUFJLFlBQW9CLENBQUM7SUFDekIsSUFBSSxpQkFBSyxFQUFFO1FBQ1YsWUFBWSxHQUFHLE1BQU0sNEJBQVksQ0FBQyxNQUFN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
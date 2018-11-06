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
    output = myBuildSystem_1.usePretty({
        pipeTo: myBuildSystem_1.useWriteFileStream(path_1.resolve(constants_1.RELEASE_ROOT, 'build.log')),
    });
    output.write('starting build...\n');
    pathUtil_1.chdir(constants_1.VSCODE_ROOT);
    process.env.BUILDING = 'yes';
    const product = await fsUtil_1.getProductData();
    await fsUtil_1.getPackageData();
    const distFolder = path_1.resolve(constants_1.RELEASE_ROOT, product.nameShort);
    const resultDir = path_1.resolve(constants_1.RELEASE_ROOT, 'release-files');
    output.write(`Starting build
	Release Root=${constants_1.RELEASE_ROOT}
	Product Name=${product.applicationName}
	App Title=${product.nameShort}
	Platform=${constants_1.isWin ? 'windows' : constants_1.isMac ? 'mac os' : 'linux'}
	Storage=${resultDir}

`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImNvbW1hbmRzL2J1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsK0JBQStCO0FBQy9CLCtEQUFtRTtBQUNuRSx5REFBbUU7QUFDbkUsbUZBQXFGO0FBQ3JGLHFEQUFpRztBQUNqRywyREFBc0Y7QUFDdEYscURBQXlIO0FBQ3pILG1FQUF5RjtBQUN6Rix5REFBbUQ7QUFDbkQseURBQW9EO0FBQ3BELGdFQUE0RDtBQUM1RCxnRUFBNEQ7QUFDNUQsc0VBQWtFO0FBRWxFLElBQUksTUFBcUIsQ0FBQztBQUMxQix1QkFBTyxDQUFDLEtBQUssSUFBSSxFQUFFO0lBQ2xCLE1BQU0sR0FBRyx5QkFBUyxDQUFDO1FBQ2xCLE1BQU0sRUFBRSxrQ0FBa0IsQ0FBQyxjQUFPLENBQUMsd0JBQVksRUFBRSxXQUFXLENBQUMsQ0FBQztLQUM5RCxDQUFDLENBQUM7SUFDSCxNQUFNLENBQUMsS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFFcEMsZ0JBQUssQ0FBQyx1QkFBVyxDQUFDLENBQUM7SUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0lBRTdCLE1BQU0sT0FBTyxHQUFHLE1BQU0sdUJBQWMsRUFBRSxDQUFDO0lBQ3ZDLE1BQU0sdUJBQWMsRUFBRSxDQUFDO0lBRXZCLE1BQU0sVUFBVSxHQUFHLGNBQU8sQ0FBQyx3QkFBWSxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM1RCxNQUFNLFNBQVMsR0FBRyxjQUFPLENBQUMsd0JBQVksRUFBRSxlQUFlLENBQUMsQ0FBQztJQUV6RCxNQUFNLENBQUMsS0FBSyxDQUFDO2dCQUNFLHdCQUFZO2dCQUNaLE9BQU8sQ0FBQyxlQUFlO2FBQzFCLE9BQU8sQ0FBQyxTQUFTO1lBQ2xCLGlCQUFLLENBQUEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsaUJBQUssQ0FBQSxDQUFDLENBQUMsUUFB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
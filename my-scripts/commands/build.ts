import { OutputStreamControl } from '@gongt/stillalive';
import { resolve } from 'path';
import { buildExtension } from '../build-env/bundled-extension/buildExtension';
import { installExtensionDevelopDeps, installExtensionProdDeps } from '../build-env/bundled-extension/installAll';
import { getExtensionPath } from '../build-env/bundled-extension/path';
import { prepareLinkForProd } from '../build-env/bundled-extension/prepare';
import { installDependency } from '../build-env/childprocess/yarn';
import { linuxBuild } from '../build-env/codeblocks/build/build-linux';
import { macBuild } from '../build-env/codeblocks/build/build-mac';
import { windowsBuild } from '../build-env/codeblocks/build/build-windows';
import { extractSourceCodeIfNeed } from '../build-env/codeblocks/build/buildExtractSource';
import {
	cleanupBuildResult,
	deleteCompileCaches,
	downloadBuiltinExtensions,
	downloadElectron,
	yarnInstall,
} from '../build-env/codeblocks/build/common-step';
import { creatingReleaseZip } from '../build-env/codeblocks/zip';
import { cleanScreen } from '../build-env/misc/clsUtil';
import { ARCH_RELEASE_ROOT, isMac, isWin, RELEASE_ROOT, VSCODE_ROOT } from '../build-env/misc/constants';
import { calcCompileFolderName, getPackageData, getProductData, rename } from '../build-env/misc/fsUtil';
import { whatIsThis } from '../build-env/misc/help';
import { runMain } from '../build-env/misc/myBuildSystem';
import { chdir } from '../build-env/misc/pathUtil';
import { timing } from '../build-env/misc/timeUtil';
import { usePretty } from '../build-env/misc/usePretty';

whatIsThis(__filename, 'build complete release.');

let output: OutputStreamControl;
runMain(async () => {
	cleanScreen();
	chdir(VSCODE_ROOT);
	
	output = usePretty('build');
	output.write('starting build...\n');
	
	process.env.BUILDING = 'yes';
	await deleteCompileCaches(output);
	
	const product = await getProductData();
	await getPackageData();
	
	const zipStoreDir = resolve(RELEASE_ROOT, 'release-files');
	
	output.write(`Starting build
	Release Root=${RELEASE_ROOT}
	Product Name=${product.applicationName}
	App Title=${product.nameShort}
	Platform=${isWin? 'windows' : isMac? 'mac os' : 'linux'}
	Storage=${zipStoreDir}

`);
	
	chdir(RELEASE_ROOT);
	const wantDirName = await calcCompileFolderName();
	const wantDirPath = resolve(RELEASE_ROOT, wantDirName);
	await cleanupBuildResult(output, wantDirPath);
	
	await extractSourceCodeIfNeed(output);
	
	chdir(resolve(ARCH_RELEASE_ROOT, 'my-scripts'));
	await installDependency(output);
	
	await yarnInstall(output);
	await downloadElectron(output);
	await downloadBuiltinExtensions(output);
	
	const timeBuild = timing();
	output.success('\x1B[38;5;10mPrepare complete.\x1B[0m Start building package. This is really slow.');
	
	let compileResultFolder: string;
	chdir(ARCH_RELEASE_ROOT);
	if (isWin) {
		compileResultFolder = await windowsBuild(output);
	} else if (isMac) {
		compileResultFolder = await macBuild(output);
	} else {
		compileResultFolder = await linuxBuild(output);
	}
	output.success('Build process complete.' + timeBuild());
	
	await rename(compileResultFolder, wantDirPath);
	
	await installExtensionDevelopDeps(output, getExtensionPath(true));
	output.success('Bundle extensions dependencies resolved');
	await prepareLinkForProd(output, getExtensionPath(true, wantDirPath));
	output.success('Bundle extensions link created.');
	await installExtensionProdDeps(output, getExtensionPath(true, wantDirPath));
	output.success('Bundle extensions production dependencies resolved');
	await buildExtension(output, getExtensionPath(true, wantDirPath), false);
	output.success('Bundle extensions built');
	
	const timeZip = timing();
	output.log('Creating zip packages...');
	await creatingReleaseZip(output);
	output.success('Zip files created.' + timeZip());
	
	output.success('Done.');
});

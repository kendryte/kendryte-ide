import { copy, mkdirp, pathExists } from 'fs-extra';
import { platform } from 'os';
import { resolve } from 'path';
import { removeDirectory } from '../build-env/codeblocks/removeDir';
import { creatingUniversalZip } from '../build-env/codeblocks/zip';
import { packageFileName } from '../build-env/codeblocks/zip.name';
import { RELEASE_ROOT, VSCODE_ROOT } from '../build-env/misc/constants';
import { whatIsThis } from '../build-env/misc/help';
import { runMain } from '../build-env/misc/myBuildSystem';
import { chdir, ensureChdir } from '../build-env/misc/pathUtil';
import { usePretty } from '../build-env/misc/usePretty';

whatIsThis(
	'Create Offline Dependency Package',
	'创建离线依赖包',
);

runMain(async () => {
	const output = usePretty('create-offline-package');
	
	const inLocation = process.argv.slice(2).find(e => !e.startsWith('-'));
	if (!inLocation) {
		throw new Error('You need provide a path to packages (argument 1).');
	}
	const location = resolve(process.cwd(), inLocation);
	
	output.log('location = %s', location);
	
	if (!await pathExists(location)) {
		throw new Error(`Your path (${location}) is not exists`);
	}
	
	const localRel = 'KendryteIDE/LocalPackage';
	
	chdir(VSCODE_ROOT);
	const wd = resolve(RELEASE_ROOT, 'create-offlinepackages');
	await removeDirectory(wd, output);
	ensureChdir(wd);
	await mkdirp(localRel);
	
	output.log('copy(%s, %s)', location, localRel);
	await copy(location, localRel, {
		filter(src: string, dst: string) {
			output.screen.writeln(src);
			return true;
		},
	});
	
	await creatingUniversalZip(output, localRel, (type) => {
		return packageFileName(platform(), type);
	});
	
	output.success('Done. you may run packages-upload now.');
});
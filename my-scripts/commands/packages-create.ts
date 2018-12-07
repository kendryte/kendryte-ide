import { platform } from 'os';
import { join } from 'path';
import { creatingUniversalZip } from '../build-env/codeblocks/zip';
import { packageFileName } from '../build-env/codeblocks/zip.name';
import { VSCODE_ROOT } from '../build-env/misc/constants';
import { whatIsThis } from '../build-env/misc/help';
import { runMain } from '../build-env/misc/myBuildSystem';
import { chdir } from '../build-env/misc/pathUtil';
import { usePretty } from '../build-env/misc/usePretty';

whatIsThis(
	'Create Offline.Dependency.Package from ./data/packages',
	'打包 ./data/packages 创建离线依赖包',
);

runMain(async () => {
	const output = usePretty('create-offline-package');
	chdir(VSCODE_ROOT);
	await creatingUniversalZip(output, join('data', 'packages'), (type) => {
		return packageFileName(platform(), type);
	});
	
	output.success('Done. you may run upload-offline-package now.');
});
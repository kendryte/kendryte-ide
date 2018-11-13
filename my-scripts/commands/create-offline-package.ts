import { platform } from 'os';
import { join } from 'path';
import { creatingUniversalZip } from '../build-env/codeblocks/zip';
import { VSCODE_ROOT } from '../build-env/misc/constants';
import { whatIsThis } from '../build-env/misc/help';
import { runMain } from '../build-env/misc/myBuildSystem';
import { chdir } from '../build-env/misc/pathUtil';
import { usePretty } from '../build-env/misc/usePretty';

whatIsThis(__filename, 'zip files from ./data/packages to release dir.');

runMain(async () => {
	const output = usePretty('create-offline-package');
	chdir(VSCODE_ROOT);
	await creatingUniversalZip(output, join('data', 'packages'), (type: string) => {
		return Promise.resolve(`${platform()}.offlinepackages.${type}`);
	});
});
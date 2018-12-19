import { resolve } from 'path';
import { getOutputCommand } from '../build-env/childprocess/complex';
import { shellExec } from '../build-env/childprocess/simple';
import { VSCODE_ROOT } from '../build-env/misc/constants';
import { readFile, writeFile } from '../build-env/misc/fsUtil';
import { whatIsThis } from '../build-env/misc/help';
import { runMain } from '../build-env/misc/myBuildSystem';
import { chdir } from '../build-env/misc/pathUtil';

whatIsThis(
	'Update `patchVersion` field inside package.json',
	'更新package.json里的 `patchVersion` 字段',
);

runMain(async () => {
	chdir(VSCODE_ROOT);
	const initOutput = await getOutputCommand('git', 'status');
	if (!initOutput.includes('working tree clean')) {
		throw new Error('local worktree has change, please commit all first');
	}
	
	const packageFile = resolve(VSCODE_ROOT, 'package.json');
	const pkg = JSON.parse(await readFile(packageFile));
	
	const d = new Date;
	pkg.patchVersion = d.getFullYear().toFixed(0)
	                   + pad(d.getMonth() + 1)
	                   + pad(d.getDate())
	                   + '.'
	                   + pad(d.getHours())
	                   + pad(d.getMinutes())
	                   + pad(d.getSeconds());
	
	let content = JSON.stringify(pkg, null, 2) + '\n';
	content = content.replace('"' + pkg.patchVersion + '"', pkg.patchVersion);
	
	console.log('writing version [%s] to package.json: %s', pkg.patchVersion, packageFile);
	await writeFile(packageFile, content);
	
	chdir(VSCODE_ROOT);
	shellExec('git', 'add', '.');
	shellExec('git', 'commit', '-m', 'patch: ' + pkg.patchVersion);
	
	console.log('Done.');
});

function pad(num: number) {
	if (num > 9) {
		return num.toFixed(0);
	} else {
		return '0' + num.toFixed(0);
	}
}

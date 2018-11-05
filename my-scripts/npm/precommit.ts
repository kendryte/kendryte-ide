import { resolve } from 'path';
import { shellExec } from '../build-env/childprocess/noDependency';
import { VSCODE_ROOT } from '../build-env/misc/constants';
import { readFile, writeFile } from '../build-env/misc/fsUtil';
import { runMain } from '../build-env/misc/myBuildSystem';
import { chdir } from '../build-env/misc/pathUtil';

runMain(async () => {
	chdir(VSCODE_ROOT);
	const packageFile = resolve(VSCODE_ROOT, 'package.json');
	const pkg = JSON.parse(await readFile(packageFile, 'utf8'));
	
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
	await writeFile(packageFile, content, 'utf8');
	
	shellExec('git', 'add', 'package.json');
});

function pad(num: number) {
	if (num > 9) {
		return num.toFixed(0);
	} else {
		return '0' + num.toFixed(0);
	}
}

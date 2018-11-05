import { readFile as readFileAsync, writeFile as writeFileAsync } from 'fs';
import { resolve } from 'path';
import { promisify } from 'util';
import { chdir } from '../build-env/childCommands';
import { runMain, VSCODE_ROOT } from '../build-env/include';

const readFile = promisify(readFileAsync);
const writeFile = promisify(writeFileAsync);

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
});

function pad(num: number) {
	if (num > 9) {
		return num.toFixed(0);
	} else {
		return '0' + num.toFixed(0);
	}
}

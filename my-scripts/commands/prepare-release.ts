import { ENOENT } from 'constants';
import { lstat, Stats, writeFile as writeFileAsync } from 'fs';
import { resolve } from 'path';
import { promisify } from 'util';
import { chdir, shellExec, shellOutput } from '../build-env/childCommands';
import { mkdirpSync, runMain, thisIsABuildScript } from '../build-env/include';
import rimrafAsync = require('rimraf');

const rimraf = promisify(rimrafAsync);
const writeFile = promisify(writeFileAsync);

thisIsABuildScript();

runMain(async () => {
	await removeYarnGlobalDir(process.env.USERPROFILE, '.yarn/bin');
	await removeYarnGlobalDir(process.env.LOCALAPPDATA, 'Yarn/bin');
	await removeYarnGlobalDir((await shellOutput('yarn', 'global', 'bin')).trim());
	
	chdir(process.env.VSCODE_ROOT + '/my-scripts');
	shellExec('yarn', 'install');
	shellExec('tsc', '-p', '.');
});

async function removeYarnGlobalDir(binDir: string, resolveTo?: string) {
	if (!binDir) {
		return;
	}
	if (resolveTo) {
		binDir = resolve(binDir, resolveTo);
	}
	
	const stat = await lstatPromise(binDir);
	if (stat) {
		if (stat.isDirectory()) {
			await rimraf(binDir);
		}
	} else {
		mkdirpSync(resolve(binDir, '..'));
	}
	await writeDummy(binDir);
}

function writeDummy(bin) {
	return writeFile(bin, '@this is a dummy file from kendryte-ide. To prevent yarn add broken global bin link here.');
}

function lstatPromise(p: string): Promise<Stats> {
	return new Promise((resolve, reject) => {
		lstat(p, (err, stats) => {
			if (err && err.code !== 'ENOENT') {
				return reject(err);
			}
			return resolve(stats);
		});
	});
}

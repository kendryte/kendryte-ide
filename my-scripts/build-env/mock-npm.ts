import { spawnSync, SpawnSyncReturns } from 'child_process';
import { resolve } from 'path';
import { ThrowStatusCodeError } from './childprocess/error';
import { isWin } from './misc/constants';

const args = process.argv.slice(2);

if (!process.env.hasOwnProperty('GIT_PARAMS') && args[0] !== 'run') {
	throw new Error('This is mocked npm, only used for husky git hooks, please use yarn instead.');
}

let r: SpawnSyncReturns<Buffer>;
if (isWin) {
	r = spawnSync('powershell.exe', [resolve(process.env.PRIVATE_BINS, 'yarn.ps1'), ...args], {
		stdio: 'inherit',
	});
} else {
	r = spawnSync('sh', [resolve(process.env.PRIVATE_BINS, 'yarn'), ...args], {
		stdio: 'inherit',
	});
}

if (r.error) {
	throw r.error;
}
ThrowStatusCodeError(r.status, r.signal, ['npm (mock script)', args, process.cwd()]);

console.error('npm return with %s', r.status);

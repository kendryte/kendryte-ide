import { spawnSync } from 'child_process';
import { isWin } from './misc/constants';

const args = process.argv.slice(2);

if (!process.env.GIT_PARAMS && args[0] !== 'run') {
	throw new Error('This is mocked npm, only used for husky git hooks, please use yarn instead.');
}

if (isWin) {
	spawnSync('powershell.exe', [process.env.YARN_PS, ...args], {
		stdio: 'inherit',
	});
} else {
	spawnSync('sh', [process.env.YARN_SH, ...args], {
		stdio: 'inherit',
	});
}

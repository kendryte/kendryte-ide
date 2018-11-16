import { resolve } from 'path';
import { muteCommandOut, pipeCommandOut } from '../childprocess/complex';
import { requireEnvPath, VSCODE_ROOT } from '../misc/constants';
import { chdir } from '../misc/pathUtil';
import { gulpCommands } from './gulp';

export function showElectronNoticeInChina() {
	console.error('');
	console.error('Electron not install. will install now. The download is single thread, and not able to resume.');
	console.error('  So, if your download is toooooo slow:');
	console.error('     1. see what is downloading below');
	console.error('     2. stop this program by ctrl+c');
	console.error('     3. find these files from https://github.com/electron/electron/releases');
	console.error('                           or https://npm.taobao.org/mirrors/electron/');
	console.error('     4. place them at %s', resolve(requireEnvPath('TEMP'), 'gulp-electron-cache/atom/electron/'));
	console.error('');
}

// node build/lib/electron.js || ./node_modules/.bin/gulp electron
export function getElectronIfNot() {
	chdir(VSCODE_ROOT);
	return muteCommandOut('node', 'build/lib/electron.js').catch(() => {
		showElectronNoticeInChina();
		return pipeCommandOut(process.stderr, 'node', ...gulpCommands(), 'electron');
	}).then(() => {
		console.log('Electron has installed.');
	}, (e) => {
		console.error(e.stack);
		throw new Error('cannot install Electron.');
	});
}
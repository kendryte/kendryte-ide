import { spawnSync } from 'child_process';
import { getElectronIfNot } from '../build-env/codeblocks/getElectron';
import { cleanScreen } from '../build-env/misc/clsUtil';
import { isWin, VSCODE_ROOT } from '../build-env/misc/constants';
import { mkdirpSync } from '../build-env/misc/fsUtil';
import { whatIsThis } from '../build-env/misc/help';
import { runMain } from '../build-env/misc/myBuildSystem';
import { chdir } from '../build-env/misc/pathUtil';

whatIsThis(__filename, 'start local debug IDE, need start-watch show success.');

runMain(async () => {
	await getElectronIfNot();
	
	delete process.env.VSCODE_PORTABLE;
	
	chdir(VSCODE_ROOT);
	
	mkdirpSync('data');
	
	delete process.env.HTTP_PROXY;
	delete process.env.HTTPS_PROXY;
	delete process.env.ALL_PROXY;
	
	const passArgs = process.argv.slice(2);
	if (isWin) {
		cleanScreen();
		console.error('cmd.exe /c scripts\\code.bat %s', passArgs.join(' '));
		spawnSync('cmd.exe', ['/C', 'scripts\\code.bat', ...passArgs], {
			encoding: 'utf8',
			stdio: 'inherit',
		});
	} else {
		cleanScreen();
		console.error('bash scripts/code.sh %s', passArgs.join(' '));
		spawnSync('bash', ['scripts/code.sh', ...passArgs], {
			encoding: 'utf8',
			stdio: 'inherit',
		});
	}
});

/*
elif [ "$SYSTEM" = "mac" ]; then
	mkdir -p ~/kendryte-ide-user-data
	if [ -L ../data ] && [ "$(readlink ../data)" != ~/kendryte-ide-user-data ] ; then
		unlink ../data
		ln -s ~/kendryte-ide-user-data ../data
	fi

	do_start bash scripts/code.sh "$@"
*/
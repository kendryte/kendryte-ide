import { spawnSync } from 'child_process';
import { existsSync, unlinkSync } from 'fs';
import { resolve } from 'path';
import { getElectronIfNot } from '../build-env/codeblocks/getElectron';
import { cleanScreen } from '../build-env/misc/clsUtil';
import { isWin, VSCODE_ROOT } from '../build-env/misc/constants';
import { mkdirpSync } from '../build-env/misc/fsUtil';
import { whatIsThis } from '../build-env/misc/help';
import { preventProxy, runMain } from '../build-env/misc/myBuildSystem';
import { chdir } from '../build-env/misc/pathUtil';

whatIsThis(
	'Run KendryteIDE',
	'运行 KendryteIDE',
);

runMain(async () => {
	const passArgs = process.argv.slice(2);
	
	cleanScreen();
	preventProxy();
	
	const env = {...process.env};
	for (const i of Object.keys(env)) {
		if (i.startsWith('npm_')) {
			delete env[i];
		}
	}
	
	await getElectronIfNot();
	
	delete process.env.VSCODE_PORTABLE;
	
	chdir(VSCODE_ROOT);
	
	mkdirpSync('data');
	
	delete process.env.HTTP_PROXY;
	delete process.env.HTTPS_PROXY;
	delete process.env.ALL_PROXY;
	
	const inspect = passArgs.find(e => /^--inspect(-brk)?(=|$)/.test(e));
	if (inspect) {
		const port = parseInt(inspect.replace(/^--inspect(-brk)?(=|$)/, '')) || 9229;
		passArgs.push(`--inspect${inspect[1] || ''}-extensions=${port + 1}`);
	} else {
		passArgs.push(`--inspect=9229`);
		passArgs.push(`--inspect-extensions=9230`);
	}
	
	const markupFile = resolve(process.env.TEMP, 'debug-ide-restart.mark');
	do {
		if (existsSync(markupFile)) {
			unlinkSync(markupFile);
		}
		run(passArgs, env);
	} while (existsSync(markupFile));
});

function run(passArgs: string[], env: any) {
	console.log(passArgs);
	if (isWin) {
		console.error('cmd.exe /c scripts\\code.bat %s', passArgs.join(' '));
		spawnSync('cmd.exe', ['/C', 'scripts\\code.bat', ...passArgs], {
			encoding: 'utf8',
			stdio: 'inherit',
			env,
		});
	} else {
		console.error('bash scripts/code.sh %s', passArgs.join(' '));
		spawnSync('bash', ['scripts/code.sh', ...passArgs], {
			encoding: 'utf8',
			stdio: 'inherit',
			env,
		});
	}
}
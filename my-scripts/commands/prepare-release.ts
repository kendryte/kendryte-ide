import { execCommand } from '../build-env/childCommands';
import { runMain } from '../build-env/include';

runMain(async () => {
	process.chdir(process.env.VSCODE_ROOT + '/my-scripts');
	console.log(process.cwd());
	await execCommand('yarn', 'install');
	await execCommand('tsc', '-p', '.');
});

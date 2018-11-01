import { chdir, shellExec } from '../build-env/childCommands';
import { runMain, thisIsABuildScript } from '../build-env/include';

thisIsABuildScript();

runMain(async () => {
	chdir(process.env.VSCODE_ROOT + '/my-scripts');
	shellExec('yarn', 'install');
	shellExec('tsc', '-p', '.');
});
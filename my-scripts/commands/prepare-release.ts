import { chdir, shellExec, shellMute } from '../build-env/childCommands';
import { runMain, thisIsABuildScript } from '../build-env/include';

thisIsABuildScript();

runMain(async () => {
	chdir(process.env.VSCODE_ROOT + '/my-scripts');
	shellMute('yarn', 'install');
	shellExec('tsc', '-p', '.');
});
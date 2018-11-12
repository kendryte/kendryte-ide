import { resolve } from 'path';
import { shellExec } from '../build-env/childprocess/noDependency';
import { VSCODE_ROOT } from '../build-env/misc/constants';
import { whatIsThis } from '../build-env/misc/help';
import { runMain } from '../build-env/misc/myBuildSystem';
import { chdir } from '../build-env/misc/pathUtil';

whatIsThis(__filename, 'install required thing for create release.');

runMain(async () => {
	chdir(VSCODE_ROOT + '/my-scripts');
	shellExec('yarn', 'install');
	shellExec('tsc', '-p', '.');
});

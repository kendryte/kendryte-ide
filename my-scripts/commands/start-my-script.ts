import { resolve } from 'path';
import { pipeCommandOut } from '../build-env/childprocess/complex';
import { installDependency } from '../build-env/childprocess/yarn';
import { removeDirectory } from '../build-env/codeblocks/removeDir';
import { VSCODE_ROOT } from '../build-env/misc/constants';
import { useThisStream } from '../build-env/misc/globalOutput';
import { helpStringCache, whatIsThis } from '../build-env/misc/help';
import { runMain } from '../build-env/misc/myBuildSystem';
import { chdir } from '../build-env/misc/pathUtil';
import { usePretty } from '../build-env/misc/usePretty';

whatIsThis(
	'Install and compile "my-scripts" project',
	'安装并编译 "my-scripts" 项目',
);

const useWatch = process.argv.includes('-w');
if (useWatch) {
	process.env.SKIP_FIRST_COMPILE = 'yes';
}

runMain(async () => {
	const output = usePretty();
	chdir(resolve(VSCODE_ROOT, 'my-scripts'));
	await installDependency(output);
	output.success('Yarn success.').pause();
	
	const help = helpStringCache();
	await removeDirectory(help, output);
	
	output.end();
	useThisStream(process.stderr);
	
	if (useWatch) {
		await pipeCommandOut(process.stdout, 'tsc', '-p', '.', ...process.argv.slice(2)).catch(e => {
			if (e.__programError) {
				console.error('`tsc` reported this error: %s.\nBut it will ignore.', e.message);
			} else {
				throw e;
			}
		});
	}
});
import { creatingZip } from '../build-env/codeblocks/zip';
import { whatIsThis } from '../build-env/misc/help';
import { runMain } from '../build-env/misc/myBuildSystem';

whatIsThis(__filename, 'Re-create zip files from current compiled result.');

runMain(async () => {
	await creatingZip(process.stderr);
});
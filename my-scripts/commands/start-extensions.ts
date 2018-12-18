import { buildExtension } from '../build-env/bundled-extension/buildExtension';
import { getExtensionPath } from '../build-env/bundled-extension/path';
import { prepareLinkForDev } from '../build-env/bundled-extension/prepare';
import { switchQuitKey } from '../build-env/codeblocks/switchQuitKey';
import { whatIsThis } from '../build-env/misc/help';
import { runMain } from '../build-env/misc/myBuildSystem';
import { closeStream, usePretty } from '../build-env/misc/usePretty';

whatIsThis(
	'Compile private extensions',
	'编译私有插件',
);

runMain(async () => {
	process.env.FORCE_COLOR = 'yes'; // ensure typescript output has colors
	
	switchQuitKey();
	
	const output = usePretty('start-ext');
	await prepareLinkForDev(output);
	output.success('extension link created.');
	await closeStream(output);
	
	await buildExtension(process.stderr, getExtensionPath(false), process.argv.includes('-w'));
});

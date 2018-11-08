import { OutputStreamControl } from '@gongt/stillalive';
import { unlinkSync } from 'fs';
import { VSCODE_ROOT } from '../misc/constants';
import { isExistsSync, isLinkSync, removeDirectory } from '../misc/fsUtil';
import { chdir } from '../misc/pathUtil';

export async function reset_asar(output: NodeJS.WritableStream) {
	chdir(VSCODE_ROOT);
	if (await isLinkSync('./node_modules')) {
		unlinkSync('./node_modules');
	}
	if (await isExistsSync('./node_modules.asar')) {
		unlinkSync('./node_modules.asar');
	}
	if (await isExistsSync('./node_modules.asar.unpacked')) {
		await removeDirectory('./node_modules.asar.unpacked', output);
	}
	if (output.hasOwnProperty('success')) {
		(output as OutputStreamControl).success('cleanup ASAR files.').continue();
	} else {
		output.write('cleanup ASAR files.\n');
	}
}

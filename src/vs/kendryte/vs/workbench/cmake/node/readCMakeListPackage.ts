import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { readFile } from 'vs/base/node/pfs';
import { CMAKE_CONFIG_FILE_NAME } from 'vs/kendryte/vs/workbench/cmake/common/cmakeConfigSchema';

export const CMAKE_LIST_GENERATED_WARNING = '# [NEVER REMOVE THIS LINE] WARNING: this file is generated, please edit ' + CMAKE_CONFIG_FILE_NAME + ' file instead.';

interface KnownFiles {
	fix9985: string;
	macros: string;
	prepend: string;
	dumpConfig: string;
	flash: string;
}

let readed: KnownFiles;

export async function readCMakeListPackage(pathService: INodePathService): Promise<KnownFiles> {
	if (readed) {
		return readed;
	}

	const val: KnownFiles = {} as any;

	const read = async (file: keyof KnownFiles) => {
		const filePath = pathService.getPackagesPath('cmake-list-files/' + file + '.cmake');
		const content = await readFile(filePath, 'utf8');
		val[file] = `##### include(${file}) #####\n${content.trim()}\n\n`;
	};

	await Promise.all([
		read('fix9985'),
		read('macros'),
		read('prepend'),
		read('dumpConfig'),
		read('flash'),
	]);

	return readed = val;
}
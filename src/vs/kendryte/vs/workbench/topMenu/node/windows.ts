import { promisify } from 'util';
import { create, IShortcutOptions, NORMAL } from 'windows-shortcuts';
import product from 'vs/platform/product/node/product';
import { applicationDescription } from 'vs/kendryte/vs/workbench/topMenu/common/title';
import { unlink } from 'vs/base/node/pfs';
import { lstatExists } from 'vs/kendryte/vs/base/node/extrafs';

const createLnk = promisify<string, IShortcutOptions>(create);

export async function createWindowStartupMenuShortcut(installPath: string) {
	const fileName = `${product.nameLong}.lnk`;
	const startMenuItem = `%AppData%/Microsoft/Windows/Start Menu/Programs/${fileName}`;

	if (await lstatExists(startMenuItem)) {
		await unlink(startMenuItem);
	}
	await createLnk(startMenuItem, {
		target: `${installPath}/Updater/electron.exe`,
		runStyle: NORMAL,
		icon: `${installPath}/ico/favicon.ico`,
		desc: applicationDescription,
	});
}

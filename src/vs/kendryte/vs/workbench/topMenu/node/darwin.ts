import product from 'vs/platform/product/node/product';
import { symlink, unlink } from 'vs/base/node/pfs';
import { lstatExists } from 'vs/kendryte/vs/base/node/extrafs';

export async function createMacApplicationsLink(installPath: string): Promise<void> {
	const linkFile = `/Applications/${product.applicationName}.app`;
	const target = `${installPath}/Updater.app`;

	if (await lstatExists(linkFile)) {
		await unlink(linkFile);
	}

	await symlink(target, linkFile);
}
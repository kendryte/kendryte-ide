import product from 'vs/platform/product/node/product';
import { resolvePath } from 'vs/kendryte/vs/base/common/resolvePath';
import { mkdirp, writeFile } from 'vs/base/node/pfs';
import * as fs from 'fs';
import { applicationDescription } from 'vs/kendryte/vs/workbench/topMenu/common/title';
import { dirname } from 'vs/base/common/path';

export async function createLinuxApplicationOrDesktopShortcut(installPath: string): Promise<void> {
	const appPath = `${installPath}/Updater/electron`;
	const content: string = `#!/usr/bin/env xdg-open
[Desktop Entry]
Name=${product.nameLong}
Comment=${applicationDescription}
GenericName=Text Editor
Exec=${appPath} --unity-launch %F
Icon=${installPath}/ico/favicon.png
Type=Application
StartupNotify=true
StartupWMClass=${product.nameShort}
Categories=Utility;TextEditor;Development;IDE;
MimeType=text/plain;inode/directory;
Actions=new-empty-window;
Keywords=vscode;kendryte

[Desktop Action new-empty-window]
Name=New Empty Window
Exec=${appPath} --new-window %F
Icon=${installPath}/ico/favicon.png
`;

	const fileName = `${product.applicationName}.desktop`;

	const applicationMenuItem = resolvePath(process.env.HOME || '/', '.local/share/applications', fileName);
	await mkdirp(dirname(applicationMenuItem));
	console.log('write to', applicationMenuItem);
	await writeFile(applicationMenuItem, content);

	const desktop = process.env.XDG_DESKTOP_DIR || resolvePath(process.env.HOME || process.env.HOMEPATH || '/', 'Desktop');
	if (!desktop || desktop === '/Desktop') {
		throw new Error('Cannot find desktop menu path to create shortcut.');
	} else {
		await mkdirp(desktop);
		const desktopLink = resolvePath(desktop, fileName);
		console.log('write to', desktopLink);
		await writeFile(desktopLink, content);
	}

	fs.chmod(appPath, '0777', (e) => {
		console.warn('create shortcut, chmod to 777: ', e.message);
	});
}

import { create as createWindows, IShortcutOptions, query as queryWindows } from 'windows-shortcuts';
import { isWindows } from 'vs/base/common/platform';
import { lstat, mkdirp, readlink, rimraf, symlink, writeFile } from 'vs/base/node/pfs';
import { nfcall } from 'vs/base/common/async';
import { TPromise } from 'vs/base/common/winjs.base';
import * as fs from 'fs';
import { resolvePath } from 'vs/workbench/parts/maix/_library/node/resolvePath';
import { dirname } from 'path';
import product from 'vs/platform/node/product';

export async function createUserLink(linkFile: string, existsFile: string, windowsOptions?: Partial<IShortcutOptions>) {
	linkFile = lnk(linkFile);

	await mkdirp(dirname(linkFile));

	if (isWindows) {
		if (!windowsOptions) {
			windowsOptions = { target: existsFile };
		} else {
			windowsOptions.target = existsFile;
		}
		await nfcall(createWindows, linkFile, windowsOptions);
	} else {
		await symlink(existsFile, linkFile);
	}
}

export type IUserLinkValue = string | IShortcutOptions;

export interface IUserLinkStat {
	exists: boolean;
	isLink: boolean;
	value: IUserLinkValue;
	stat: fs.Stats;
}

export async function readUserLink(linkFile: string): TPromise<IUserLinkStat> {
	linkFile = lnk(linkFile);
	const ret: IUserLinkStat = {} as any;
	ret.exists = await lstat(linkFile).then((stat) => {
		ret.stat = stat;
		return true;
	}, () => {
		return false;
	});
	if (ret.exists) {
		ret.isLink = isWindows ? /\.lnk$/i.test(linkFile) : ret.stat.isSymbolicLink();
	} else {
		ret.isLink = false;
	}

	if (ret.isLink) {
		ret.value = isWindows ? await nfcall(queryWindows, linkFile) : await readlink(linkFile);
	}

	return ret;
}

export function isUserLinkSame(link: IUserLinkStat, value: string, windowsOptions?: Partial<IShortcutOptions>) {
	if (!link.exists) {
		return false;
	}
	if (isWindows) {
		windowsOptions = windowsOptions ? { ...windowsOptions, target: value } : { target: value };

		for (const key of Object.keys(link.value)) {
			if (key === 'expanded') {
				continue;
			}

			if (windowsOptions.hasOwnProperty(key) && link.value[key] === windowsOptions[key]) {
				continue;
			}

			return false;
		}

		return true;
	} else {
		return link.value === value;
	}
}

export enum LinkTarget {
	HOME,
	APPDATA,
	IDE_DATA,
}

export function pathResolve(windows, linux, ...paths: string[]) {
	return isWindows ? `^%${windows}^%${resolvePath('/', ...paths)}` : resolvePath(linux, ...paths);
}

const _lnk = isWindows ? '.lnk' : '';

function lnk(f) {
	return `${f}${_lnk}`;
}

export async function ensureLinkEquals(linkFile: string, existsFile: string, windowsOptions?: Partial<IShortcutOptions>): TPromise<any> {
	linkFile = lnk(linkFile);
	const stat = await readUserLink(linkFile);
	if (isUserLinkSame(stat, linkFile, windowsOptions)) {
		return;
	}

	if (stat.exists) {
		await rimraf(linkFile);
	}

	await createUserLink(linkFile, existsFile, windowsOptions);
}

export async function createLinuxDesktopShortcut(installPath: string, appPath: string): TPromise<void> {
	const content: string = `#!/usr/bin/env xdg-open
[Desktop Entry]
Name=${product.nameLong}
Comment=Code Editing. Redefined.
GenericName=Text Editor
Exec=${appPath} --unity-launch %F
Icon=${installPath}/icon.png
Type=Application
StartupNotify=true
StartupWMClass=${product.nameShort}
Categories=Utility;TextEditor;Development;IDE;
MimeType=text/plain;inode/directory;
Actions=new-empty-window;
Keywords=vscode;

[Desktop Action new-empty-window]
Name=New Empty Window
Exec=${appPath} --new-window %F
Icon=${installPath}/icon.png
`;
	const desktop = process.env.XDG_DESKTOP_DIR || resolvePath(process.env.HOME, 'Desktop');
	await mkdirp(desktop);
	await writeFile(`${desktop}/${product.applicationName}.desktop`, content);
}
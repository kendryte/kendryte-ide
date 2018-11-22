import { Menu, MenuItem } from 'electron';
import * as nls from 'vs/nls';
import { mnemonicMenuLabel as baseMnemonicLabel } from 'vs/base/common/labels';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IRunActionInWindowRequest } from 'vs/platform/windows/common/windows';
import { IWindowsMainService } from 'vs/platform/windows/electron-main/windows';
import { ApplicationMenuStructure, MyMenu, MyMenuRegistry, MyMenuSeparator, MySubMenu } from 'vs/kendryte/vs/base/common/menu/applicationMenuStructure';

export function installKendryteMenu(access: ServicesAccessor, menubar: Menu) {
	const configurationService = access.get<IConfigurationService>(IConfigurationService);
	const windowsMainService = access.get<IWindowsMainService>(IWindowsMainService);

	function runInMain(id: string) {
		const activeWindow = windowsMainService.getFocusedWindow();
		if (activeWindow) {
			windowsMainService.sendToFocused('vscode:runAction', { id, from: 'menu' } as IRunActionInWindowRequest);
		}
	}

	let enableMenuBarMnemonics = configurationService.getValue<boolean>('window.enableMenuBarMnemonics');
	if (typeof enableMenuBarMnemonics !== 'boolean') {
		enableMenuBarMnemonics = true;
	}

	function mnemonicLabel(label: string): string {
		return baseMnemonicLabel(label, !enableMenuBarMnemonics);
	}

	function createMenu(s: MyMenuRegistry, parent: Menu) {
		s.forEach((item, index) => {
			if (item instanceof MyMenuSeparator) {
				if (index !== 0) {
					parent.append(new MenuItem({ type: 'separator' }));
				}
			} else if (item instanceof MyMenu) {
				parent.append(new MenuItem({
					type: 'normal',
					label: mnemonicLabel(item.title),
					click: (function (this: string, menuItem, win, event) {
						runInMain(this);
					}).bind(item.commandId),
				}));
			} else if (item instanceof MySubMenu) {
				const sub = new Menu();
				parent.append(new MenuItem({
					type: 'submenu',
					label: mnemonicLabel(item.title),
					submenu: sub,
				}));
				createMenu(item.submenu, sub);
			}
		});
	}

	const maixMenu = new Menu();
	createMenu(ApplicationMenuStructure, maixMenu);

	menubar.append(new MenuItem({
		label: mnemonicLabel(nls.localize({ key: 'mKendryte', comment: ['&& denotes a mnemonic'] }, '&&Kendryte')),
		submenu: maixMenu,
	}));
}

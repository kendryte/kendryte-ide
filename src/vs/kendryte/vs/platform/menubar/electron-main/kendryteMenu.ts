import { Menu, MenuItem } from 'electron';
import * as nls from 'vs/nls';
import { mnemonicMenuLabel as baseMnemonicLabel } from 'vs/base/common/labels';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IRunActionInWindowRequest } from 'vs/platform/windows/common/windows';
import { IWindowsMainService } from 'vs/platform/windows/electron-main/windows';

// SYNC: vs/kendryte/vs/workbench/topMenu/electron-browser/menuContribution

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

	const maixMenu = new Menu();
	const maixMenuItem = new MenuItem({
		label: mnemonicLabel(nls.localize({ key: 'mKendryte', comment: ['&& denotes a mnemonic'] }, '&&Kendryte')),
		submenu: maixMenu,
	});

	maixMenu.append(new MenuItem({
		label: nls.localize({ key: 'KendryteIOEditor', comment: ['&& denotes a mnemonic'] }, 'Edit Kendryte IO function'),
		click: (menuItem, win, event) => {
			runInMain('workbench.action.kendryte.openIOConfig');
		},
	}));

	const openocdMenu = new Menu();
	maixMenu.append(new MenuItem({
		label: nls.localize({ key: 'openocd', comment: ['&& denotes a mnemonic'] }, 'OpenOCD'),
		submenu: openocdMenu,
	}));

	openocdMenu.append(new MenuItem({
		label: nls.localize({ key: 'openocd.action.start', comment: ['&& denotes a mnemonic'] }, 'Start openocd server'),
		click: (menuItem, win, event) => {
			runInMain('workbench.action.openocd.start');
		},
	}));
	openocdMenu.append(new MenuItem({
		label: nls.localize({ key: 'openocd.action.stop', comment: ['&& denotes a mnemonic'] }, 'Stop openocd server'),
		click: (menuItem, win, event) => {
			runInMain('workbench.action.openocd.stop');
		},
	}));
	openocdMenu.append(new MenuItem({
		label: nls.localize({ key: 'openocd.action.restart', comment: ['&& denotes a mnemonic'] }, 'Restart openocd server'),
		click: (menuItem, win, event) => {
			runInMain('workbench.action.openocd.restart');
		},
	}));
	maixMenu.append(__separator__());
	openocdMenu.append(new MenuItem({
		label: nls.localize({ key: 'jtag.action.detect', comment: ['&& denotes a mnemonic'] }, 'Detect connected JTag ids'),
		click: (menuItem, win, event) => {
			runInMain('workbench.action.jtag.get');
		},
	}));
	openocdMenu.append(new MenuItem({
		label: nls.localize({ key: 'jtag.action.install', comment: ['&& denotes a mnemonic'] }, 'Install driver'),
		click: (menuItem, win, event) => {
			runInMain('workbench.action.jtag.install');
		},
	}));

	maixMenu.append(__separator__());
	maixMenu.append(new MenuItem({
		label: nls.localize({ key: 'Cleanup', comment: ['&& denotes a mnemonic'] }, 'Make Cleanup'),
		click: (menuItem, win, event) => {
			runInMain('workbench.action.kendryte.cleanup');
		},
	}));
	maixMenu.append(new MenuItem({
		label: nls.localize({ key: 'Configure', comment: ['&& denotes a mnemonic'] }, 'Make Configure'),
		click: (menuItem, win, event) => {
			runInMain('workbench.action.kendryte.configure');
		},
	}));
	maixMenu.append(new MenuItem({
		label: nls.localize({ key: 'Build', comment: ['&& denotes a mnemonic'] }, 'Make Build'),
		click: (menuItem, win, event) => {
			runInMain('workbench.action.kendryte.build');
		},
	}));
	maixMenu.append(new MenuItem({
		label: nls.localize({ key: 'Debug', comment: ['&& denotes a mnemonic'] }, 'Start Debug'),
		click: (menuItem, win, event) => {
			runInMain('workbench.action.kendryte.run');
		},
	}));
	maixMenu.append(new MenuItem({
		label: nls.localize({ key: 'Upload', comment: ['&& denotes a mnemonic'] }, 'SPI Upload'),
		click: (menuItem, win, event) => {
			runInMain('workbench.action.kendryte.upload');
		},
	}));

	maixMenu.append(__separator__());

	maixMenu.append(new MenuItem({
		label: nls.localize({ key: 'PackagesUpdate', comment: ['&& denotes a mnemonic'] }, 'Packages update'),
		click: (menuItem, win, event) => {
			runInMain('workbench.action.kendryte.packageUpgrade');
		},
	}));
	maixMenu.append(new MenuItem({
		label: nls.localize({ key: 'PackagesManager', comment: ['&& denotes a mnemonic'] }, 'Open package manager'),
		click: (menuItem, win, event) => {
			runInMain('workbench.package-manager.action.open-market');
		},
	}));
	maixMenu.append(new MenuItem({
		label: nls.localize({ key: 'InstallDependencies', comment: ['&& denotes a mnemonic'] }, 'Install dependencies'),
		click: (menuItem, win, event) => {
			runInMain('workbench.package-manager.action.install-everything');
		},
	}));

	maixMenu.append(__separator__());
	const toolsMenu = new Menu();
	maixMenu.append(new MenuItem({
		label: nls.localize({ key: 'tools', comment: ['&& denotes a mnemonic'] }, 'Tools'),
		submenu: toolsMenu,
	}));

	toolsMenu.append(new MenuItem({
		label: nls.localize({ key: 'KendryteCreateShortcuts', comment: ['&& denotes a mnemonic'] }, 'Create shortcuts'),
		click: (menuItem, win, event) => {
			runInMain('workbench.action.kendryte.createShortcuts');
		},
	}));

	menubar.append(maixMenuItem);
}

function __separator__(): Electron.MenuItem {
	return new MenuItem({ type: 'separator' });
}

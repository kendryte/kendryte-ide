import { MenuId, MenuRegistry } from 'vs/platform/actions/common/actions';
import { FpioaEditorAction } from 'vs/kendryte/vs/workbench/fpioaConfig/electron-browser/fpioaActions';
import { MaixCMakeCleanupAction } from 'vs/kendryte/vs/workbench/cmake/electron-browser/actions/cleanupAction';
import { MaixCMakeConfigureAction } from 'vs/kendryte/vs/workbench/cmake/electron-browser/actions/configureAction';
import { MaixCMakeBuildAction } from 'vs/kendryte/vs/workbench/cmake/electron-browser/actions/buildAction';
import { MaixCMakeDebugAction } from 'vs/kendryte/vs/workbench/cmake/electron-browser/actions/debugRunAction';
import { CreateShortcutsAction } from 'vs/kendryte/vs/workbench/topMenu/node/shortcutsContribution';
import { MaixSerialUploadAction } from 'vs/kendryte/vs/workbench/serialUpload/node/uploadAction';
import { BuildingBlocksUpgradeAction } from 'vs/kendryte/vs/services/update/electron-browser/buildingBlocksUpgradeAction';
import { localize } from 'vs/nls';
import { OpenPackagesMarketPlaceAction } from 'vs/kendryte/vs/workbench/packageManager/browser/actions/openPackagesMarketPlaceAction';
import { InstallDependencyAction } from 'vs/kendryte/vs/workbench/packageManager/browser/actions/installDependencyAction';

// SYNC: vs/kendryte/vs/code/patches/electron-main/kendryteMenu.ts

let clsName = '';
let clsOrder = 0;
let lastMenuId = 5000;
let orders: { [id: number]: number } = {};

cls('chipTool');
registerTop(FpioaEditorAction);

cls('cpp');
registerTop(MaixCMakeCleanupAction);
registerTop(MaixCMakeConfigureAction);
registerTop(MaixCMakeBuildAction);
registerTop(MaixCMakeDebugAction);
registerTop(MaixSerialUploadAction);

cls('package');
registerTop(BuildingBlocksUpgradeAction);
registerTop(OpenPackagesMarketPlaceAction);
registerTop(InstallDependencyAction);

cls('others');
const tools = submenu(localize('tools', 'Tools'));
register(tools, CreateShortcutsAction);

interface ActionStatic {
	readonly ID: string;
	readonly LABEL: string;
}

function submenu(title: string, parent = MenuId.MenubarMaixMenu) {
	const r = ++lastMenuId;
	if (!orders[parent]) {
		orders[parent] = 1;
	} else {
		orders[parent]++;
	}
	MenuRegistry.appendMenuItem(parent, {
		title,
		group: clsName,
		order: orders[parent],
		submenu: r,
	});
	return r;
}

function register(sub: MenuId, s: ActionStatic) {
	if (!orders[sub]) {
		orders[sub] = 1;
	} else {
		orders[sub]++;
	}
	MenuRegistry.appendMenuItem(sub, {
		group: clsName,
		command: {
			id: s.ID,
			title: s.LABEL,
		},
		order: orders[sub],
	});
}

function registerTop(s: ActionStatic) {
	register(MenuId.MenubarMaixMenu, s);
}

function cls(cls: string) {
	clsOrder++;
	clsName = `${clsOrder}_${cls}`;
}

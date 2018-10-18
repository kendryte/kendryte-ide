import { MenuId, MenuRegistry } from 'vs/platform/actions/common/actions';
import { FpioaEditorAction } from 'vs/kendryte/vs/workbench/fpioaConfig/electron-browser/fpioaActions';
import { MaixCMakeCleanupAction } from 'vs/kendryte/vs/workbench/cmake/electron-browser/actions/cleanupAction';
import { MaixCMakeConfigureAction } from 'vs/kendryte/vs/workbench/cmake/electron-browser/actions/configureAction';
import { MaixCMakeBuildAction } from 'vs/kendryte/vs/workbench/cmake/electron-browser/actions/buildAction';
import { MaixCMakeDebugAction } from 'vs/kendryte/vs/workbench/cmake/electron-browser/actions/debugRunAction';
import { CreateShortcutsAction } from 'vs/kendryte/vs/workbench/topMenu/node/shortcutsContribution';
import { MaixSerialUploadAction } from 'vs/kendryte/vs/workbench/serialUpload/node/uploadAction';
import { BuildingBlocksUpgradeAction } from 'vs/kendryte/vs/services/update/electron-browser/openPackageUpgradeAction';
import { localize } from 'vs/nls';
import { OpenPackagesMarketPlaceAction } from 'vs/kendryte/vs/workbench/packageManager/common/actions/openPackagesMarketPlaceAction';
import { InstallDependencyAction } from 'vs/kendryte/vs/workbench/packageManager/common/actions/installDependencyAction';

// SYNC: vs/kendryte/vs/code/patches/electron-main/kendryteMenu.ts

let clsName = '';
let clsOrder = 0;

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
	const r = new MenuId();
	if (!parent['order']) {
		parent['order'] = 1;
	} else {
		parent['order']++;
	}
	MenuRegistry.appendMenuItem(parent, {
		title,
		group: clsName,
		order: parent['order'],
		submenu: r,
	});
	return r;
}

function register(sub: MenuId, s: ActionStatic) {
	if (!sub['order']) {
		sub['order'] = 1;
	} else {
		sub['order']++;
	}
	MenuRegistry.appendMenuItem(sub, {
		group: clsName,
		command: {
			id: s.ID,
			title: s.LABEL,
		},
		order: sub['order'],
	});
}

function registerTop(s: ActionStatic) {
	register(MenuId.MenubarMaixMenu, s);
}

function cls(cls: string) {
	clsOrder++;
	clsName = `${clsOrder}_${cls}`;
}

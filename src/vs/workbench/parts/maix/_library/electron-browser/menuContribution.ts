import { MenuId, MenuRegistry } from 'vs/platform/actions/common/actions';
import { FpioaEditorAction } from 'vs/workbench/parts/maix/fpioa-config/electron-browser/fpioaActions';
import { MaixCMakeCleanupAction } from 'vs/workbench/parts/maix/cmake/electron-browser/actions/cleanupAction';
import { MaixCMakeConfigureAction } from 'vs/workbench/parts/maix/cmake/electron-browser/actions/configureAction';
import { MaixCMakeBuildAction } from 'vs/workbench/parts/maix/cmake/electron-browser/actions/buildAction';
import { MaixCMakeDebugAction } from 'vs/workbench/parts/maix/cmake/electron-browser/actions/debugRunAction';
import { CreateShortcutsAction } from 'vs/workbench/parts/maix/_library/node/shortcutsContribution';
import { MaixSerialUploadAction } from 'vs/workbench/parts/maix/serialPort/upload/node/uploadAction';

// SYNC: vs/code/electron-main/menu.maix.ts

cls('tools');
register(FpioaEditorAction);

cls('2_cpp');
register(MaixCMakeCleanupAction);
register(MaixCMakeConfigureAction);
register(MaixCMakeBuildAction);
register(MaixCMakeDebugAction);
register(MaixSerialUploadAction);

cls('others');
register(CreateShortcutsAction);

interface ActionStatic {
	readonly ID: string;
	readonly LABEL: string;
}

let order = 0;
let clsName = '';
let clsOrder = 0;

function register(s: ActionStatic) {
	order++;
	MenuRegistry.appendMenuItem(MenuId.MenubarMaixMenu, {
		group: clsName,
		command: {
			id: s.ID,
			title: s.LABEL,
		},
		order,
	});
}

function cls(cls: string) {
	clsOrder++;
	order = 0;
	clsName = `${clsOrder}_${cls}`;
}

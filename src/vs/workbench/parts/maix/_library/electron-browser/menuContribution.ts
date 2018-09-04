import { MenuId, MenuRegistry } from 'vs/platform/actions/common/actions';
import { FpioaEditorAction } from 'vs/workbench/parts/maix/fpioa-config/electron-browser/fpioaActions';
import * as nls from 'vs/nls';

// SYNC: vs/code/electron-main/menu.maix.ts

MenuRegistry.appendMenuItem(MenuId.MenubarMaixMenu, {
	group: '1_tools',
	command: {
		id: FpioaEditorAction.ID,
		title: nls.localize({ key: 'MaixIOEditor', comment: ['&& denotes a mnemonic'] }, 'Edit Maix IO function'),
	},
	order: 1,
});
import { MenuId, MenuRegistry } from 'vs/platform/actions/common/actions';
import { FpioaEditorAction } from 'vs/workbench/parts/maix/fpioa-config/electron-browser/fpioaActions';
import * as nls from 'vs/nls';

// SYNC: vs/code/electron-main/menu.maix.ts

MenuRegistry.appendMenuItem(MenuId.MenubarMaixMenu, {
	group: '1_tools',
	command: {
		id: FpioaEditorAction.ID,
		title: nls.localize({ key: 'KendryteIOEditor', comment: ['&& denotes a mnemonic'] }, 'Edit Kendryte IO function'),
	},
	order: 1,
});

MenuRegistry.appendMenuItem(MenuId.MenubarMaixMenu, {
	group: '2_others',
	command: {
		id: FpioaEditorAction.ID,
		title: nls.localize({ key: 'KendryteIOEditor', comment: ['&& denotes a mnemonic'] }, 'Edit Kendryte IO function'),
	},
	order: 1,
});

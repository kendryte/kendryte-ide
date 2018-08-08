import { MenuRegistry } from 'vs/platform/actions/common/actions';
import { FpioaEditorAction } from 'vs/workbench/parts/maix/fpioa-config/electron-browser/fpioaActions';
import { MenubarMaixMenu } from 'vs/workbench/parts/maix/_library/common/menu';
import * as nls from 'vs/nls';

MenuRegistry.appendMenuItem(MenubarMaixMenu, {
	group: '1_tools',
	command: {
		id: FpioaEditorAction.ID,
		title: nls.localize({ key: 'MaixIOEditor', comment: ['&& denotes a mnemonic'] }, 'Edit Maix IO function'),
	},
	order: 1,
});
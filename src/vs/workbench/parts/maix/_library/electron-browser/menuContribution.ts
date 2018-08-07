import { MenuId, MenuRegistry } from 'vs/platform/actions/common/actions';
import { FpioaEditorAction } from 'vs/workbench/parts/maix/fpioa-config/electron-browser/fpioaActions';

MenuRegistry.appendMenuItem(MenuId.MenubarMaixMenu, {
	command: { id: FpioaEditorAction.ID, title: FpioaEditorAction.LABEL },
});
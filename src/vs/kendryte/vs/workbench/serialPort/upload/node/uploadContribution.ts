// UPLOAD
import { Extensions as ActionExtensions, IWorkbenchActionRegistry } from 'vs/workbench/common/actions';
import { MenuId, MenuRegistry, SyncActionDescriptor } from 'vs/platform/actions/common/actions';
import { Registry } from 'vs/platform/registry/common/platform';
import { MaixSerialUploadAction } from 'vs/kendryte/vs/workbench/serialPort/upload/node/uploadAction';
import { localize } from 'vs/nls';

const category = localize('kendryte', 'Kendryte');

Registry.as<IWorkbenchActionRegistry>(ActionExtensions.WorkbenchActions)
	.registerWorkbenchAction(new SyncActionDescriptor(MaixSerialUploadAction, MaixSerialUploadAction.ID, MaixSerialUploadAction.LABEL), 'Kendryte: Upload to chip', category);

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
	command: {
		id: MaixSerialUploadAction.ID,
		title: `${category}: ${MaixSerialUploadAction.LABEL}`,
	},
});
import { AbstractFieldControl } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/electron-browser/fields/base';
import { visualStudioIconClass } from 'vs/kendryte/vs/platform/vsicons/browser/vsIconRender';
import { ACTION_ID_PACKAGE_MANAGER_OPEN_MARKET, ACTION_LABEL_PACKAGE_MANAGER_OPEN_MARKET } from 'vs/kendryte/vs/base/common/menu/packageManager';

export class OpenManagerControl extends AbstractFieldControl<string> {
	createControlList() {
		const addButton = this.createCommonButton(
			visualStudioIconClass('browser-download'),
			ACTION_LABEL_PACKAGE_MANAGER_OPEN_MARKET,
			'',
		);
		this._register(addButton.onDidClick(() => {
			return this.commandService.executeCommand(ACTION_ID_PACKAGE_MANAGER_OPEN_MARKET);
		}));
	}
}

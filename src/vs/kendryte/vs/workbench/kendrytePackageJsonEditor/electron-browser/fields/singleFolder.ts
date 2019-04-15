import { AbstractFieldControl, SelectType } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/electron-browser/fields/base';
import { localize } from 'vs/nls';

export class SingleFolderFieldControl extends AbstractFieldControl<string> {
	createControlList() {
		const addButton = this.createCommonButton(
			'vscode-icon AddFolder',
			localize('addFolderSingle', 'Select folder...'),
			'',
		);
		this._register(addButton.onDidClick(async () => {
			const ret = await this.selectFileSystem('folder', SelectType.SelectSingle);
			this.mergeArray(ret);
		}));
	}
}
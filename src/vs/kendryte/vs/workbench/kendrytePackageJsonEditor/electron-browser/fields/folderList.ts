import { AbstractFieldControl, SelectType } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/electron-browser/fields/base';
import { localize } from 'vs/nls';

export class FolderListFieldControl extends AbstractFieldControl<string[]> {
	createControlList() {
		const addButton = this.createCommonButton(
			'vscode-icon AddFolder',
			localize('addFolder', 'Add folders...'),
			'',
		);
		this._register(addButton.onDidClick(async () => {
			const ret = await this.selectFileSystem('folder', SelectType.SelectMany);
			this.mergeArray(ret);
		}));
	}
}

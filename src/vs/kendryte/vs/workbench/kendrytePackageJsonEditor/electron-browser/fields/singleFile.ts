import { AbstractFieldControl, SelectType } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/electron-browser/fields/base';
import { localize } from 'vs/nls';

export class SingleFileFieldControl extends AbstractFieldControl<string> {
	createControlList() {
		const addButton = this.createCommonButton(
			'vscode-icon AddFile',
			localize('addFileSingle', 'Select file...'),
			'',
		);
		this._register(addButton.onDidClick(async () => {
			const ret = await this.selectFileSystem('file', SelectType.SelectSingle);
			this.mergeArray(ret);
		}));
	}
}
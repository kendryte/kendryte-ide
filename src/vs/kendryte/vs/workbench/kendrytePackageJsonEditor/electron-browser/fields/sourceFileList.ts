import { AbstractFieldControl, SelectType } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/electron-browser/fields/base';
import { localize } from 'vs/nls';
import { createSourceFilter, getSourceFileExtensions } from 'vs/kendryte/vs/platform/fileDialog/common/sourceFile';

export class SourceFileListFieldControl extends AbstractFieldControl<string[]> {
	createControlList() {
		const addButton = this.createCommonButton(
			'vscode-icon AddFile',
			localize('addFile', 'Add files...'),
			localize('addFileTreeDesc', 'Add some files...'),
		);
		this._register(addButton.onDidClick(async () => {
			const ret = await this.selectFileSystem('file', SelectType.SelectMany, [createSourceFilter(this.configurationService)]);
			this.mergeArray(ret);
		}));

		const addAllButton = this.createCommonButton(
			'vscode-icon AddFolder',
			localize('addFileAll', 'Add folders...'),
			localize('addFileTreeDesc', 'Add all files from specified folder...'),
		);
		this._register(addAllButton.onDidClick(async () => {
			const ret = await this.selectFileSystem('folder', SelectType.SelectSingle);
			if (!ret[0]) {
				return;
			}
			// console.log('try add files from %s', ret[0]);

			const files = await this.globPath(ret[0], false, getSourceFileExtensions(this.configurationService));
			this.mergeArray(files);
		}));

		const addAllResButton = this.createCommonButton(
			'visualstudio-icon add-add-folder',
			localize('addFileTree', 'Add tree...'),
			localize('addFileTreeDesc', 'Add all files from specified folder, recursively...'),
		);

		this._register(addAllResButton.onDidClick(async () => {
			const ret = await this.selectFileSystem('folder', SelectType.SelectSingle);
			if (!ret[0]) {
				return;
			}
			// console.log('try add files from %s (recursive)', ret[0]);

			const files = await this.globPath(ret[0], true, getSourceFileExtensions(this.configurationService));
			this.mergeArray(files);
		}));
	}
}

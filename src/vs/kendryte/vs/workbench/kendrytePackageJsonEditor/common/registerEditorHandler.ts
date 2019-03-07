import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { Disposable } from 'vs/base/common/lifecycle';
import { IEditorService, IOpenEditorOverride } from 'vs/workbench/services/editor/common/editorService';
import { IEditorInput } from 'vs/workbench/common/editor';
import { IEditorOptions } from 'vs/platform/editor/common/editor';
import { IEditorGroup } from 'vs/workbench/services/group/common/editorGroupsService';
import { endsWith } from 'vs/base/common/strings';
import { IKendrytePackageJsonEditorService } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/common/kendrytePackageJsonEditorService';
import { CMAKE_CONFIG_FILE_NAME } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { KendrytePackageJsonEditorInput } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/electron-browser/kendrytePackageJsonEditorInput';

export class KendrytePackageJsonEditorHandlerContribution extends Disposable implements IWorkbenchContribution {
	constructor(
		@IEditorService private readonly editorService: IEditorService,
		@IKendrytePackageJsonEditorService private readonly kendrytePackageJsonEditorService: IKendrytePackageJsonEditorService,
	) {
		super();

		this._register(
			this.editorService.overrideOpenEditor((editor, options, group) => this.onEditorOpening(editor, options, group)),
		);
	}

	private onEditorOpening(editor: IEditorInput, options: IEditorOptions, group: IEditorGroup): IOpenEditorOverride {
		if (editor instanceof KendrytePackageJsonEditorInput) {
			return void 0;
		}
		const resource = editor.getResource();
		if (
			!resource ||
			!endsWith(resource.path, CMAKE_CONFIG_FILE_NAME) // resource must end in kendryte-package.json
		) {
			return void 0;
		}

		if (group.isOpened(editor)) {
			return { override: this.kendrytePackageJsonEditorService.openEditor(resource, options, group) };
		}

		return { override: this.kendrytePackageJsonEditorService.openEditor(resource, options, group) };
	}
}

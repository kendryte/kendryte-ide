import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { Disposable } from 'vs/base/common/lifecycle';
import { IEditorService, IOpenEditorOverride } from 'vs/workbench/services/editor/common/editorService';
import { IEditorInput } from 'vs/workbench/common/editor';
import { IEditorOptions, ITextEditorOptions } from 'vs/platform/editor/common/editor';
import { IEditorGroup } from 'vs/workbench/services/editor/common/editorGroupsService';
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
			this.editorService.overrideOpenEditor(this.onEditorOpening.bind(this)),
		);
	}

	private onEditorOpening(editor: IEditorInput, options: IEditorOptions | ITextEditorOptions | undefined, group: IEditorGroup): IOpenEditorOverride | undefined {
		if (editor instanceof KendrytePackageJsonEditorInput) {
			return;
		}
		const resource = editor.getResource();
		if (
			!resource ||
			!endsWith(resource.path, CMAKE_CONFIG_FILE_NAME) // resource must end in kendryte-package.json
		) {
			return;
		}

		if (group.isOpened(editor)) {
			return { override: this.kendrytePackageJsonEditorService.openEditor(resource, options, group) };
		}

		return { override: this.kendrytePackageJsonEditorService.openEditor(resource, options, group) };
	}
}

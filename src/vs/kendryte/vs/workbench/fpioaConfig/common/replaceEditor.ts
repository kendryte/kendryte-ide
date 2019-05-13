import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { Disposable } from 'vs/base/common/lifecycle';
import { IEditorService, IOpenEditorOverride } from 'vs/workbench/services/editor/common/editorService';
import { IEditorInput } from 'vs/workbench/common/editor';
import { IEditorOptions, ITextEditorOptions } from 'vs/platform/editor/common/editor';
import { IEditorGroup } from 'vs/workbench/services/editor/common/editorGroupsService';
import { endsWith } from 'vs/base/common/strings';
import { IWorkspaceContextService, WorkbenchState } from 'vs/platform/workspace/common/workspace';
import { basename, dirname } from 'vs/base/common/path';
import { FPIOA_FILE_NAME, PROJECT_CONFIG_FOLDER_NAME } from 'vs/kendryte/vs/base/common/constants/wellknownFiles';
import { IFpioaService } from 'vs/kendryte/vs/workbench/fpioaConfig/common/types';
import { FpioaEditorInput } from 'vs/kendryte/vs/workbench/fpioaConfig/electron-browser/fpioaEditorInput';

export class FpioaHandlerContribution extends Disposable implements IWorkbenchContribution {
	constructor(
		@IEditorService private readonly editorService: IEditorService,
		@IFpioaService private readonly fpioaEditorService: IFpioaService,
		@IWorkspaceContextService private readonly workspaceContextService: IWorkspaceContextService,
	) {
		super();

		this._register(
			this.editorService.overrideOpenEditor(this.onEditorOpening.bind(this)),
		);
	}

	private onEditorOpening(editor: IEditorInput, options: IEditorOptions | ITextEditorOptions | undefined, group: IEditorGroup): IOpenEditorOverride | undefined {
		if (editor instanceof FpioaEditorInput) {
			return;
		}
		const resource = editor.getResource();
		if (
			!resource ||
			!endsWith(basename(dirname(resource.path)), PROJECT_CONFIG_FOLDER_NAME) ||
			!endsWith(resource.path, FPIOA_FILE_NAME)
		) {
			return;
		}

		if (this.workspaceContextService.getWorkbenchState() === WorkbenchState.EMPTY) {
			return;
		}

		if (group.isOpened(editor)) {
			return { override: this.fpioaEditorService.openEditor(resource, options, group) };
		}

		return { override: this.fpioaEditorService.openEditor(resource, options, group) };
	}
}

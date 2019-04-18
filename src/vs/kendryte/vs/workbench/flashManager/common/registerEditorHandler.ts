import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { Disposable } from 'vs/base/common/lifecycle';
import { IEditorService, IOpenEditorOverride } from 'vs/workbench/services/editor/common/editorService';
import { IEditorInput } from 'vs/workbench/common/editor';
import { IEditorOptions, ITextEditorOptions } from 'vs/platform/editor/common/editor';
import { IEditorGroup } from 'vs/workbench/services/editor/common/editorGroupsService';
import { endsWith } from 'vs/base/common/strings';
import { CMAKE_CONFIG_FILE_NAME } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { IWorkspaceContextService, WorkbenchState } from 'vs/platform/workspace/common/workspace';
import { IFlashManagerEditorService } from 'vs/kendryte/vs/workbench/flashManager/common/flashManagerEditorService';
import { FlashManagerEditorInput } from 'vs/kendryte/vs/workbench/flashManager/electron-browser/flashManagerEditorInput';

export class FlashManagerHandlerContribution extends Disposable implements IWorkbenchContribution {
	constructor(
		@IEditorService private readonly editorService: IEditorService,
		@IFlashManagerEditorService private readonly flashManagerEditorService: IFlashManagerEditorService,
		@IWorkspaceContextService private readonly workspaceContextService: IWorkspaceContextService,
	) {
		super();

		this._register(
			this.editorService.overrideOpenEditor(this.onEditorOpening.bind(this)),
		);
	}

	private onEditorOpening(editor: IEditorInput, options: IEditorOptions | ITextEditorOptions | undefined, group: IEditorGroup): IOpenEditorOverride | undefined {
		if (editor instanceof FlashManagerEditorInput) {
			return;
		}
		const resource = editor.getResource();
		if (
			!resource ||
			!endsWith(resource.path, CMAKE_CONFIG_FILE_NAME) // resource must end in kendryte-package.json
		) {
			return;
		}

		if (this.workspaceContextService.getWorkbenchState() === WorkbenchState.EMPTY) {
			return;
		}

		if (group.isOpened(editor)) {
			return { override: this.flashManagerEditorService.openEditor(resource, options, group) };
		}

		return { override: this.flashManagerEditorService.openEditor(resource, options, group) };
	}
}

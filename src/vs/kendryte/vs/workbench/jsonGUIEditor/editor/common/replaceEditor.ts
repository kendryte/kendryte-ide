import { Disposable } from 'vs/base/common/lifecycle';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IEditorService, IOpenEditorOverride } from 'vs/workbench/services/editor/common/editorService';
import { IWorkspaceContextService, WorkbenchState } from 'vs/platform/workspace/common/workspace';
import { IEditorInput } from 'vs/workbench/common/editor';
import { IEditorOptions, ITextEditorOptions } from 'vs/platform/editor/common/editor';
import { IEditorGroup } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { AbstractJsonEditorInput } from 'vs/kendryte/vs/workbench/jsonGUIEditor/editor/browser/abstractJsonEditorInput';
import { CustomJsonRegistry } from 'vs/kendryte/vs/workbench/jsonGUIEditor/common/register';

export class JsonEditorHandlerContribution extends Disposable implements IWorkbenchContribution {
	constructor(
		@IEditorService private readonly editorService: IEditorService,
		@IWorkspaceContextService private readonly workspaceContextService: IWorkspaceContextService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
	) {
		super();

		this._register(
			this.editorService.overrideOpenEditor(this.onEditorOpening.bind(this)),
		);
	}

	private onEditorOpening(editor: IEditorInput, options: IEditorOptions | ITextEditorOptions | undefined, group: IEditorGroup): IOpenEditorOverride | undefined {
		if (editor instanceof AbstractJsonEditorInput) {
			return;
		}

		if (this.workspaceContextService.getWorkbenchState() === WorkbenchState.EMPTY) {
			return;
		}

		const resource = editor.getResource();
		if (!resource) {
			return;
		}
		const id = CustomJsonRegistry.matchPath(resource);
		if (!id) {
			return;
		}

		const editorInputCtor = CustomJsonRegistry.getEditorInputById(id);
		const editorInput: IEditorInput = this.instantiationService.createInstance(editorInputCtor, resource);
		return { override: this.editorService.openEditor(editorInput, options, group) };
	}
}

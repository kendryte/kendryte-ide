import { Disposable } from 'vs/base/common/lifecycle';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IEditorService, IOpenEditorOverride } from 'vs/workbench/services/editor/common/editorService';
import { IWorkspaceContextService, WorkbenchState } from 'vs/platform/workspace/common/workspace';
import { IEditorInput } from 'vs/workbench/common/editor';
import { IEditorOptions, ITextEditorOptions } from 'vs/platform/editor/common/editor';
import { IEditorGroup } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IJsonEditorInputConstructor, JsonEditorInputBase } from 'vs/kendryte/vs/workbench/jsonGUIEditor/browser/editorInputBaseImpl';
import { URI } from 'vs/base/common/uri';
import { IPathMatchingFunction } from 'vs/kendryte/vs/workbench/jsonGUIEditor/browser/registerEditorType';

export class JsonEditorHandlerContribution extends Disposable implements IWorkbenchContribution {
	public static readonly inputMatchList: [IPathMatchingFunction, IJsonEditorInputConstructor][] = [];

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
		if (editor instanceof JsonEditorInputBase) {
			return;
		}

		if (this.workspaceContextService.getWorkbenchState() === WorkbenchState.EMPTY) {
			return;
		}

		const resource = editor.getResource();
		if (!resource) {
			return;
		}
		const editorInput = JsonEditorHandlerContribution.createJsonEditorInputByPath(resource, this.instantiationService);

		if (editorInput) {
			return { override: this.editorService.openEditor(editorInput, options, group) };
		}

		return;
	}

	static createJsonEditorInputByPath(resource: URI, instantiationService: IInstantiationService): JsonEditorInputBase<any> | undefined {
		for (const [matcher, ctor] of JsonEditorHandlerContribution.inputMatchList) {
			if (matcher(resource)) {
				return instantiationService.createInstance(ctor, resource);
			}
		}
		return;
	}
}

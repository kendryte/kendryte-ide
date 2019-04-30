import { BaseEditor } from 'vs/workbench/browser/parts/editor/baseEditor';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { EditorOptions } from 'vs/workbench/common/editor';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IContextKey, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { CONTEXT_JSON_GUI_EDITOR } from 'vs/kendryte/vs/workbench/jsonGUIEditor/common/context';
import { ISwitchTypeEvent, JsonEditorInputBase } from 'vs/kendryte/vs/workbench/jsonGUIEditor/browser/editorInputBaseImpl';
import { JsonEditorModelBase } from 'vs/kendryte/vs/workbench/jsonGUIEditor/browser/editorInputModelImpl';
import { EditorId } from 'vs/kendryte/vs/workbench/jsonGUIEditor/common/type';
import { IConstructorSignature1 } from 'vs/platform/instantiation/common/instantiation';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { INotificationService } from 'vs/platform/notification/common/notification';

export interface IJsonEditorToRegister<Model extends JsonEditorModelBase<any>>
	extends IConstructorSignature1<EditorId, JsonEditorBase<Model>> {
}

export abstract class JsonEditorBase<Model extends JsonEditorModelBase<any>> extends BaseEditor {
	protected readonly inJsonGuiEditorContextKey: IContextKey<boolean>;
	protected _input: JsonEditorInputBase<Model> | null;
	private _inputEvents: IDisposable[] = [];
	protected isJsonMode: boolean = false;
	protected editorInited: boolean;

	protected constructor(
		descriptor: EditorId,
		@ITelemetryService telemetryService: ITelemetryService,
		@IThemeService themeService: IThemeService,
		@IStorageService storageService: IStorageService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@INotificationService protected readonly notificationService: INotificationService,
	) {
		super(descriptor.id, telemetryService, themeService, storageService);
		this.inJsonGuiEditorContextKey = CONTEXT_JSON_GUI_EDITOR.bindTo(contextKeyService);
	}

	async setInput(input: JsonEditorInputBase<Model>, options: EditorOptions, token: CancellationToken): Promise<void> {
		this.inJsonGuiEditorContextKey.set(true);
		await super.setInput(input, options, token);

		const model = await input.resolve();
		if (!model) {
			debugger;
		}

		this._inputEvents.push(input.onSwitchType(event => { this.onSwitchType(event);}));

		this.updateModel(model);
	}

	clearInput(): void {
		this._inputEvents = dispose(this._inputEvents);
		super.clearInput();
		this.inJsonGuiEditorContextKey.set(false);

		this.updateModel();
	}

	protected getModel() {
		if (!this._input) {
			throw new Error('input not resolved');
		}
		return this._input.model;
	}

	protected abstract updateModel(model: Model): void | Promise<void>;
	protected abstract updateModel(): void | Promise<void>;

	private onSwitchType(event: ISwitchTypeEvent) {
		const isJsonMode = event.type === 'json';
		if (isJsonMode !== this.isJsonMode) {

		}
	}

	protected createEditor(parent: HTMLElement): void {
		try {
			this._createEditor(parent);
		} catch (e) {
			this.notificationService.error(e);
			return;
		}
		this.editorInited = true;
	}

	protected abstract _createEditor(parent: HTMLElement): void
}

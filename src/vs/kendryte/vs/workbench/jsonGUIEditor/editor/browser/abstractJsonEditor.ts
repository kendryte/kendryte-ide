import { BaseEditor } from 'vs/workbench/browser/parts/editor/baseEditor';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { EditorOptions } from 'vs/workbench/common/editor';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IContextKey, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { CONTEXT_JSON_GUI_EDITOR } from 'vs/kendryte/vs/workbench/jsonGUIEditor/editor/common/context';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { EditorId, IJsonEditor } from 'vs/kendryte/vs/workbench/jsonGUIEditor/editor/common/type';
import { AbstractJsonEditorInput, ISwitchTypeEvent } from 'vs/kendryte/vs/workbench/jsonGUIEditor/editor/browser/abstractJsonEditorInput';
import { ICustomJsonEditorService, IJsonEditorModel } from 'vs/kendryte/vs/workbench/jsonGUIEditor/service/common/type';
import { $, append, IFocusTracker, trackFocus } from 'vs/base/browser/dom';

export abstract class AbstractJsonEditor<JsonType> extends BaseEditor implements IJsonEditor {
	protected readonly inJsonGuiEditorContextKey: IContextKey<boolean>;
	protected _input: AbstractJsonEditorInput<JsonType> | null;
	private _inputEvents: IDisposable[] = [];
	protected isJsonMode: boolean = false;
	protected editorInited: boolean = false;
	private _awaitingUpdate: boolean = false;
	private focusTracker: IFocusTracker;

	protected constructor(
		public readonly descriptor: EditorId,
		@ITelemetryService telemetryService: ITelemetryService,
		@IThemeService themeService: IThemeService,
		@IStorageService storageService: IStorageService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@INotificationService protected readonly notificationService: INotificationService,
		@ICustomJsonEditorService protected readonly customJsonEditorService: ICustomJsonEditorService,
	) {
		super(descriptor.id, telemetryService, themeService, storageService);
		this.inJsonGuiEditorContextKey = CONTEXT_JSON_GUI_EDITOR.bindTo(contextKeyService);
	}

	_registerInput(dis: IDisposable) {
		this._inputEvents.push(dis);
	}

	async setInput(input: AbstractJsonEditorInput<JsonType>, options: EditorOptions, token: CancellationToken): Promise<void> {
		this.inJsonGuiEditorContextKey.set(true);
		await super.setInput(input, options, token);

		const model = await input.resolve();
		if (!model) {
			debugger;
		}

		this._inputEvents.push(input.onSwitchType(event => { this.onSwitchType(event);}));

		if (!this.editorInited) {
			console.warn('Skip because editor not ready');
			this._awaitingUpdate = true;
			return;
		}

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

	protected abstract updateModel(model: IJsonEditorModel<JsonType>): void | Promise<void>;
	protected abstract updateModel(): void | Promise<void>;

	private onSwitchType(event: ISwitchTypeEvent) {
		const isJsonMode = event.type === 'json';
		if (isJsonMode !== this.isJsonMode) {

		}
	}

	protected createEditor(parent: HTMLElement): void {
		// console.log('will create editor: %s', this.descriptor.id);
		const container = append(parent, $('div.kendryte-json-editor')) as HTMLDivElement;
		container.classList.add(this.descriptor.id.split('.').pop() || 'invalid-editor-id');

		this.focusTracker = this._register(trackFocus(container));
		this._register(this.focusTracker.onDidBlur(() => {
			// console.log('json editor lost focus');
			this.customJsonEditorService.updateFocus(this.descriptor.id, false);
		}));
		this._register(this.focusTracker.onDidFocus(() => {
			// console.log('json editor gained focus');
			this.customJsonEditorService.updateFocus(this.descriptor.id, true);
		}));

		try {
			this._createEditor(container);
			// console.log('editor created');
		} catch (e) {
			// console.error('editor failed to create:', e.stack);
			this.notificationService.error(e);
			return;
		}
		this.editorInited = true;

		if (this._awaitingUpdate) {
			this.updateModel(this._input!.model);
			this._awaitingUpdate = false;
		}
	}

	protected abstract _createEditor(parent: HTMLElement): void
}

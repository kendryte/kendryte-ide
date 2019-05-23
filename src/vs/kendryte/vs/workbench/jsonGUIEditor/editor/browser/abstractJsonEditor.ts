import 'vs/css!vs/kendryte/vs/workbench/jsonGUIEditor/editor/browser/style';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { EditorOptions } from 'vs/workbench/common/editor';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IContextKey, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { CONTEXT_JSON_GUI_EDITOR, CONTEXT_JSON_GUI_EDITOR_JSON_MODE } from 'vs/kendryte/vs/workbench/jsonGUIEditor/editor/common/context';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { AbstractJsonEditorInput, IInputState } from 'vs/kendryte/vs/workbench/jsonGUIEditor/editor/browser/abstractJsonEditorInput';
import { EditorId, IJsonEditor } from 'vs/kendryte/vs/workbench/jsonGUIEditor/editor/common/type';
import { ICustomJsonEditorService, IJsonEditorModel } from 'vs/kendryte/vs/workbench/jsonGUIEditor/service/common/type';
import { $, append, Dimension, hide, IFocusTracker, show, trackFocus } from 'vs/base/browser/dom';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { ITextResourceConfigurationService } from 'vs/editor/common/services/resourceConfiguration';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IWindowService } from 'vs/platform/windows/common/windows';
import { AbstractTextResourceEditor } from 'vs/workbench/browser/parts/editor/textResourceEditor';

export abstract class AbstractJsonEditor<JsonType, State extends IInputState = {}> extends AbstractTextResourceEditor implements IJsonEditor {
	private readonly inJsonGuiEditorContextKey: IContextKey<boolean>;
	private readonly inJsonRawEditorContextKey: IContextKey<boolean>;

	protected _input: AbstractJsonEditorInput<JsonType, State> | null;
	private _inputEvents: IDisposable[] = [];
	protected editorInited: boolean = false;
	private _awaitingUpdate: boolean = false;
	private focusTracker: IFocusTracker;

	private containerRaw?: HTMLDivElement;
	private containerGui?: HTMLDivElement;

	protected constructor(
		public readonly descriptor: EditorId,
		@ITelemetryService telemetryService: ITelemetryService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IStorageService storageService: IStorageService,
		@ITextResourceConfigurationService configurationService: ITextResourceConfigurationService,
		@IThemeService themeService: IThemeService,
		@ITextFileService textFileService: ITextFileService,
		@IEditorService editorService: IEditorService,
		@IEditorGroupsService editorGroupService: IEditorGroupsService,
		@IWindowService windowService: IWindowService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@INotificationService protected readonly notificationService: INotificationService,
		@ICustomJsonEditorService protected readonly customJsonEditorService: ICustomJsonEditorService,
	) {
		super(
			descriptor.id,
			telemetryService,
			instantiationService,
			storageService,
			configurationService,
			themeService,
			editorGroupService,
			textFileService,
			editorService,
			windowService,
		);
		this.inJsonGuiEditorContextKey = CONTEXT_JSON_GUI_EDITOR.bindTo(contextKeyService);
		this.inJsonRawEditorContextKey = CONTEXT_JSON_GUI_EDITOR_JSON_MODE.bindTo(contextKeyService);
	}

	getConfigurationOverrides() {
		const opts = super.getConfigurationOverrides();
		opts.readOnly = false;
		return opts;
	}

	protected abstract _layout(dimension: Dimension): void;

	private _lastDimension: Dimension;

	layout(dimension: Dimension = this._lastDimension) {
		if (!dimension) {
			return;
		}
		this._lastDimension = dimension;
		super.layout(dimension);
		this._layout(dimension);
	}

	public getTitle(): string {
		return this.descriptor.title;
	}

	_registerInput(dis: IDisposable) {
		this._inputEvents.push(dis);
	}

	async setInput(input: AbstractJsonEditorInput<JsonType>, options: EditorOptions, token: CancellationToken): Promise<void> {
		if (this._input) {
			this._input!.setState(this.sleep());
		}

		await super.setInput(input, options, token);

		const model = await input.resolve(false);
		if (!model) {
			debugger;
		}

		this._inputEvents.push(input.onSwitchType(event => {
			this.switchJsonType();
			this.updateModel(model);
			this.wakeup(input!.getState());
		}));

		if (!this.editorInited) {
			console.warn('Skip because editor not ready');
			this._awaitingUpdate = true;
			return;
		}

		this.updateModel(model);
		this.switchJsonType();
		this.wakeup(input!.getState());
	}

	clearInput(): void {
		this._input!.setState(this.sleep());
		this.updateModel();

		this._inputEvents = dispose(this._inputEvents);
		super.clearInput();

		this.switchJsonType();
	}

	protected getModel() {
		if (!this._input) {
			throw new Error('input not resolved');
		}
		return this._input.model;
	}

	protected abstract updateModel(model: IJsonEditorModel<JsonType>): void | Promise<void>;
	protected abstract updateModel(): void | Promise<void>;

	private switchJsonType() {
		if (!this._input) {
			console.log('json mode: blur');
			this.inJsonGuiEditorContextKey.set(false);
			this.inJsonRawEditorContextKey.set(false);
			return;
		}
		const isJsonMode: boolean = this._input.jsonMode;
		console.log('json mode: ', isJsonMode);
		if (isJsonMode) {
			this.inJsonRawEditorContextKey.set(true);
			this.inJsonGuiEditorContextKey.set(false);
			hide(this.containerGui!);
			show(this.containerRaw!);
		} else {
			this.inJsonGuiEditorContextKey.set(true);
			this.inJsonRawEditorContextKey.set(false);
			hide(this.containerRaw!);
			show(this.containerGui!);
		}
	}

	protected createEditor(parent: HTMLElement): void {
		this.containerRaw = append(parent, $('div.kendryte-json-editor-raw')) as HTMLDivElement;
		hide(this.containerRaw);
		super.createEditor(this.containerRaw);

		// console.log('will create editor: %s', this.descriptor.id);
		const container = this.containerGui = append(parent, $('div.kendryte-json-editor')) as HTMLDivElement;
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
			this.wakeup(this._input!.getState());
			this._awaitingUpdate = false;
		}
	}

	protected getAriaLabel(): string {
		return this.getTitle();
	}

	protected abstract _createEditor(parent: HTMLElement): void

	protected abstract wakeup(state: Partial<State>): void;

	protected abstract sleep(): Partial<State>;
}

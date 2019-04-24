import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { Terminal as XTermTerminal } from 'vscode-xterm';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IConfigurationChangeEvent, IConfigurationService } from 'vs/platform/configuration/common/configuration';
import * as nls from 'vs/nls';
import { addDisposableListener, Dimension } from 'vs/base/browser/dom';
import { Emitter, Event } from 'vs/base/common/event';
import { isMacintosh } from 'vs/base/common/platform';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { StandardMouseEvent } from 'vs/base/browser/mouseEvent';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IAction } from 'vs/base/common/actions';
import { ContextSubMenu } from 'vs/base/browser/contextmenu';
import { memoize } from 'vs/base/common/decorators';
import { SerialPortCopyAction, SerialPortPasteAction } from 'vs/kendryte/vs/workbench/serialMonitor/electron-browser/actions/copyPaste';
import { IContextKey, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { SerialPortClearAction } from 'vs/kendryte/vs/workbench/serialMonitor/electron-browser/actions/clear';
import { Separator } from 'vs/base/browser/ui/actionbar/actionbar';
import { SerialPortShowFindAction } from 'vs/kendryte/vs/workbench/serialMonitor/electron-browser/actions/find';
import { XtermScrollbackBuffer } from 'vs/kendryte/vs/workbench/serialMonitor/electron-browser/iobuffers/output';
import { EscapeStringClearScreen } from 'vs/kendryte/vs/base/node/terminalConst';
import { TerminalConfigHelper } from 'vs/workbench/contrib/terminal/browser/terminalConfigHelper';
import { TerminalInstance } from 'vs/workbench/contrib/terminal/browser/terminalInstance';
import { linuxDistro } from 'vs/workbench/contrib/terminal/node/terminal';
import { ExtendMap } from 'vs/kendryte/vs/base/common/extendMap';
import { SerialPortBaseBinding } from 'vs/kendryte/vs/services/serialPort/common/type';
import { ILocalOptions } from 'vs/kendryte/vs/workbench/serialMonitor/common/localSettings';
import { CONTEXT_IN_SERIAL_PORT_OUTPUT, CONTEXT_SERIAL_PORT_HAS_SELECT } from 'vs/kendryte/vs/workbench/serialMonitor/common/actionId';
import { ITerminalInstanceService } from 'vs/workbench/contrib/terminal/browser/terminal';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IPanelService } from 'vs/workbench/services/panel/common/panelService';
import { ILogService } from 'vs/platform/log/common/log';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
import { OutputWindowFind } from 'vs/kendryte/vs/workbench/serialMonitor/electron-browser/outputWindowFind';

export class OutputXTerminal extends TerminalInstance {
	protected _toDisposable: IDisposable[];
	protected _isLifecycleDisposed: boolean;

	private terminal: XTermTerminal;
	private elementWrapper: HTMLDivElement;
	private parentDisposables: IDisposable[];

	protected scrollbackList: ExtendMap<NodeJS.WritableStream, XtermScrollbackBuffer>;
	protected readonly myConfigHelper: TerminalConfigHelper;

	private last: XtermScrollbackBuffer;
	private encoding: ILocalOptions['outputCharset'];
	private translateLineFeed: string;
	private hexLineFeed: boolean;
	private userInputEnabled: boolean;
	private _cancelContextMenu: boolean;
	private dimension: Dimension;
	private currentInstance?: NodeJS.WritableStream;
	private _hasFocusContext: IContextKey<boolean>;

	private readonly _onXTermInputData: Emitter<string>;
	public readonly onXTermInputData: Event<string>;

	private readonly notificationService: INotificationService;
	private readonly clipboardService: IClipboardService;
	private readonly configurationService: IConfigurationService;
	private readonly instantiationService: IInstantiationService;
	private readonly contextMenuService: IContextMenuService;
	private xtermReadyPromise: Promise<void>;

	constructor(
		container: HTMLDivElement,
		@ITerminalInstanceService terminalInstanceService: ITerminalInstanceService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IKeybindingService keybindingService: IKeybindingService,
		@INotificationService notificationService: INotificationService,
		@IPanelService panelService: IPanelService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IClipboardService clipboardService: IClipboardService,
		@IThemeService themeService: IThemeService,
		@IConfigurationService configurationService: IConfigurationService,
		@ILogService logService: ILogService,
		@IStorageService storageService: IStorageService,
		@IAccessibilityService accessibilityService: IAccessibilityService,
		@IContextMenuService contextMenuService: IContextMenuService,
	) {
		const configHelper = instantiationService.createInstance(TerminalConfigHelper, linuxDistro);
		configHelper.panelContainer = container;
		const terminalFocusContextKey = CONTEXT_IN_SERIAL_PORT_OUTPUT.bindTo(contextKeyService);
		const terminalHasTextContextKey = CONTEXT_SERIAL_PORT_HAS_SELECT.bindTo(contextKeyService);
		super(
			terminalFocusContextKey,
			configHelper,
			container,
			{ isRendererOnly: true },
			terminalInstanceService,
			contextKeyService,
			keybindingService,
			notificationService,
			panelService,
			instantiationService,
			clipboardService,
			themeService,
			configurationService,
			logService,
			storageService,
			accessibilityService,
		);

		Object.assign(this, {
			_terminalHasTextContextKey: terminalHasTextContextKey,
		});

		this.myConfigHelper = configHelper;
		this.scrollbackList = new ExtendMap<NodeJS.WritableStream, XtermScrollbackBuffer>();
		this.userInputEnabled = false;
		this._cancelContextMenu = false;
		this._onXTermInputData = new Emitter<string>();
		this.onXTermInputData = this._onXTermInputData.event;

		this.notificationService = notificationService;
		this.clipboardService = clipboardService;
		this.configurationService = configurationService;
		this.instantiationService = instantiationService;
		this.contextMenuService = contextMenuService;

		this._hasFocusContext = CONTEXT_IN_SERIAL_PORT_OUTPUT.bindTo(contextKeyService);

		this.parentDisposables = [];
		this._toDisposable = [];

		this.setVisible(true);
	}

	public dispose(): void {
		this._isLifecycleDisposed = true;
		super.dispose();
		this._toDisposable = dispose(this._toDisposable);
	}

	protected _register<T extends IDisposable>(t: T): T {
		if (this._isLifecycleDisposed) {
			console.warn('Registering disposable on object that has already been disposed.');
			t.dispose();
		} else {
			this._toDisposable.push(t);
		}

		return t;
	}

	_createXterm(): Promise<void> {
		if (this.xtermReadyPromise) {
			return this.xtermReadyPromise;
		}
		return this.xtermReadyPromise = new Promise((resolve, reject) => {
			this.__createXterm().then(resolve, reject);
		});
	}

	async __createXterm(): Promise<void> {
		await super._createXterm();
		this.terminal = (this as any)._xterm;

		this._register(this.onRendererInput((data: string) => this.handleInput(data)));

		// this.registerFocusEvents();
	}

	public reattachToElement(container: HTMLElement): void {
		if (!this.elementWrapper) {
			throw new Error('The terminal instance has not been attached to a container yet');
		}
		super.reattachToElement(container);
		this.elementWrapper = (this as any)._wrapperElement;
		this._attach();
	}

	public attachToElement(container: HTMLElement): void {
		if (this.elementWrapper) {
			throw new Error('The terminal instance has already been attached to a container');
		}
		super.attachToElement(container);
		this.elementWrapper = (this as any)._wrapperElement;
		this._attach();
	}

	private _attach() {
		this._createXterm().then(() => {
			this.parentDisposables = dispose(this.parentDisposables);
			this.parentDisposables.push(addDisposableListener(this.elementWrapper, 'mousedown', (event: MouseEvent) => this.handleMouseDown(event)));
			this.parentDisposables.push(addDisposableListener(this.elementWrapper, 'mouseup', (event: MouseEvent) => this.handleMouseUp(event)));
			this.parentDisposables.push(addDisposableListener(this.elementWrapper, 'contextmenu', (event: MouseEvent) => this.handleContextMenu(event)));
		});
	}

	public copySelection(): void {
		if (this.terminal.hasSelection()) {
			this.clipboardService.writeText(this.terminal.getSelection());
		} else {
			this.notificationService.warn(nls.localize('terminal.integrated.copySelection.noSelection', 'The terminal has no selection to copy'));
		}
	}

	public layout(dimension: Dimension = this.dimension): void {
		this.dimension = dimension;
		if (this.terminal) {
			this.terminal.element.style.height = dimension.height + 'px';
			super.layout(dimension);
			console.log('terminalInstance: layout: [%s, %s] = (%s, %s)', dimension.width, dimension.height, (this as any)._cols, (this as any)._rows);
		}
	}

	handleSerialIncoming(instance: SerialPortBaseBinding | undefined) {
		if (instance) {
			this.currentInstance = instance;
		} else {
			delete this.currentInstance;
		}
		if (this.last) {
			this.last.deletePipe();
		}

		if (!instance) {
			return;
		}

		const buff = this.scrollbackList.entry(instance, () => {
			const scrollbackBuffer = new XtermScrollbackBuffer(this.encoding, this.translateLineFeed, this.hexLineFeed);
			instance.pipe(scrollbackBuffer);
			return scrollbackBuffer;
		});
		buff.pipeTo(this.terminal);
		this.last = buff;
	}

	destroyScrollback(instance: SerialPortBaseBinding) {
		if (!this.scrollbackList.has(instance)) {
			return;
		}

		const buff = this.scrollbackList.getReq(instance);
		buff.destroy();
		this.scrollbackList.delete(instance);

		if (buff === this.last) {
			this.last.destroy();
			delete this.last;
		}
	}

	handleUserType(enabled: boolean) {
		this.userInputEnabled = enabled;
	}

	public setOptions(options: ILocalOptions) {
		this.encoding = options.outputCharset;
		this.translateLineFeed = options.translateLineFeed as string;
		this.hexLineFeed = options.hexLineFeed;
	}

	writeUser(instance: NodeJS.WritableStream, message: string) {
		// the EOL in `message` Must use LF. this is what `xterm.js` default output when press enter.
		// \r will not reset cursor column, must follow \n
		const scrollback = this.scrollbackList.get(instance);
		if (scrollback) {
			scrollback.write(message.replace(/\r/g, '\r\n'));
		} else {
			console.error('no instance', instance);
		}
	}

	paste() {
		this.terminal.focus();
		document.execCommand('paste');
	}

	private handleContextMenu(event: MouseEvent) {
		if (!this._cancelContextMenu) {
			const standardEvent = new StandardMouseEvent(event);
			const anchor: { x: number, y: number } = { x: standardEvent.posx, y: standardEvent.posy };
			this.contextMenuService.showContextMenu({
				getAnchor: () => anchor,
				getActions: () => this._getContextMenuActions(),
				getActionsContext: () => this.elementWrapper,
			});
		} else {
			// console.log('cancel context');
		}
		this._cancelContextMenu = false;
	}

	private handleMouseUp(event: MouseEvent) {
		if (this.configurationService.getValue('terminal.integrated.copyOnSelection')) {
			if (event.which === 1) {
				if (this.terminal.hasSelection()) {
					this.copySelection();
				}
			}
		}
	}

	private handleMouseDown(event: MouseEvent) {
		if (event.which === 3) {
			if (this.myConfigHelper.config.rightClickBehavior === 'copyPaste') {
				if (this.terminal.hasSelection()) {
					this.copySelection();
					this.terminal.clearSelection();
				} else {
					this.paste();
				}
				if (isMacintosh) {
					setTimeout(() => {
						this.terminal.clearSelection();
					}, 0);
				}
				this._cancelContextMenu = true;
			}
		}
	}

	private _getContextMenuActions(): (IAction | ContextSubMenu)[] {
		const acts = this._createContextMenuActions();
		acts.copy.enabled = this.terminal.hasSelection();
		acts.paste.enabled = this.userInputEnabled;
		return acts.list;
	}

	@memoize
	private _createContextMenuActions() {
		const copy = this.instantiationService.createInstance(SerialPortCopyAction, SerialPortCopyAction.ID, SerialPortCopyAction.LABEL);
		const paste = this.instantiationService.createInstance(SerialPortPasteAction, SerialPortPasteAction.ID, SerialPortPasteAction.LABEL);

		return {
			copy,
			paste,
			list: [
				this.instantiationService.createInstance(SerialPortShowFindAction, SerialPortShowFindAction.ID, SerialPortShowFindAction.LABEL),
				new Separator(),
				copy,
				paste,
				new Separator(),
				this.instantiationService.createInstance(SerialPortClearAction, SerialPortClearAction.ID, SerialPortClearAction.LABEL),
			],
		};
	}

	protected reloadConfig(e: IConfigurationChangeEvent) {
		if (e.affectsConfiguration('terminal.integrated')) {
			TerminalInstance.prototype.updateConfig.call(this);
		}
		if (e.affectsConfiguration('editor.accessibilitySupport')) {
			TerminalInstance.prototype.updateAccessibilitySupport.call(this);
		}

		this.layout();
	}

	clearScreen(instance = this.currentInstance) {
		if (instance === this.currentInstance) {
			this.terminal.write(EscapeStringClearScreen.toString());
			this.terminal.clear();
		}

		if (!instance || !this.scrollbackList.has(instance)) {
			return;
		}

		const buff = this.scrollbackList.getReq(instance);
		buff.flush();
	}

	waitForTerminalInit() {
		return this.xtermReadyPromise;
	}

	private handleInput(data: string) {
		if (!this.userInputEnabled) {
			return;
		}
		this._onXTermInputData.fire(data);
	}

	@memoize
	public get findWidget() {
		return this.instantiationService.createInstance(OutputWindowFind, this.elementWrapper, this.terminal);
	}

	focusFindWidget() {
		const sel = this.terminal.getSelection();
		if (this.terminal.hasSelection() && (sel.indexOf('\n') === -1)) {
			this.findWidget.reveal(sel);
		} else {
			this.findWidget.reveal();
		}
	}
}

const selfDesc = Object.getOwnPropertyDescriptors(OutputXTerminal.prototype);
for (const [key, desc] of Object.entries(Object.getOwnPropertyDescriptors(TerminalInstance.prototype))) {
	if (!selfDesc.hasOwnProperty(key)) {
		Object.defineProperty(OutputXTerminal.prototype, key, desc);
	}
}

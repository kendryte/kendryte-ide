import { Disposable } from 'vs/base/common/lifecycle';
import { Terminal as XTermTerminal } from 'vscode-xterm';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IEditorOptions } from 'vs/editor/common/config/editorOptions';
import { IConfigurationChangeEvent, IConfigurationService } from 'vs/platform/configuration/common/configuration';
import * as nls from 'vs/nls';
import { $, addDisposableListener, append, Dimension } from 'vs/base/browser/dom';
import { Emitter, Event } from 'vs/base/common/event';
import { isMacintosh } from 'vs/base/common/platform';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { StandardMouseEvent } from 'vs/base/browser/mouseEvent';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IAction } from 'vs/base/common/actions';
import { ContextSubMenu } from 'vs/base/browser/contextmenu';
import { memoize } from 'vs/base/common/decorators';
import { OutputWindowFind } from 'vs/kendryte/vs/workbench/serialMonitor/electron-browser/outputWindowFind';
import { SerialPortCopyAction, SerialPortPasteAction } from 'vs/kendryte/vs/workbench/serialMonitor/electron-browser/actions/copyPaste';
import { IContextKey, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { SerialPortClearAction } from 'vs/kendryte/vs/workbench/serialMonitor/electron-browser/actions/clear';
import { Separator } from 'vs/base/browser/ui/actionbar/actionbar';
import { SerialPortShowFindAction } from 'vs/kendryte/vs/workbench/serialMonitor/electron-browser/actions/find';
import { XtermScrollbackBuffer } from 'vs/kendryte/vs/workbench/serialMonitor/electron-browser/iobuffers/output';
import { EscapeStringClearScreen } from 'vs/kendryte/vs/base/node/terminalConst';
import { TerminalWidgetManager } from 'vs/workbench/contrib/terminal/browser/terminalWidgetManager';
import { TerminalConfigHelper } from 'vs/workbench/contrib/terminal/browser/terminalConfigHelper';
import { TerminalInstance } from 'vs/workbench/contrib/terminal/browser/terminalInstance';
import { linuxDistro } from 'vs/workbench/contrib/terminal/node/terminal';
import { ExtendMap } from 'vs/kendryte/vs/base/common/extendMap';
import { SerialPortBaseBinding } from 'vs/kendryte/vs/services/serialPort/common/type';
import { ILocalOptions } from 'vs/kendryte/vs/workbench/serialMonitor/common/localSettings';
import { CONTEXT_IN_SERIAL_PORT_OUTPUT, CONTEXT_SERIAL_PORT_HAS_SELECT } from 'vs/kendryte/vs/workbench/serialMonitor/common/actionId';

let Terminal: typeof XTermTerminal;

export class OutputXTerminal extends Disposable {
	private _xterm: XTermTerminal;
	private _xtermElement: HTMLDivElement;
	protected _widgetManager: TerminalWidgetManager;
	protected _configHelper: TerminalConfigHelper;

	protected _isVisible = true;
	protected _wrapperElement: HTMLElement;

	protected scrollbackList = new ExtendMap<NodeJS.WritableStream, XtermScrollbackBuffer>();
	private currentInstance?: NodeJS.WritableStream;

	private last: XtermScrollbackBuffer;
	private encoding: ILocalOptions['outputCharset'];
	private translateLineFeed: string;
	private hexLineFeed: boolean;
	private userInputEnabled: boolean = false;
	private _cancelContextMenu: boolean = false;
	private dimension: Dimension;
	private _hasSelectContext: IContextKey<boolean>;
	private _hasFocusContext: IContextKey<boolean>;

	private readonly _onData = new Emitter<string>();
	public readonly onData = this._onData.event;

	private readonly _onDimensionsChanged: Emitter<void> = new Emitter<void>();
	public get onDimensionsChanged(): Event<void> { return this._onDimensionsChanged.event; }

	constructor(
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@IThemeService private readonly _themeService: IThemeService,
		@IConfigurationService private readonly _configurationService: IConfigurationService,
		@IContextMenuService private readonly _contextMenuService: IContextMenuService,
		@INotificationService private readonly _notificationService: INotificationService,
		@IClipboardService private readonly _clipboardService: IClipboardService,
		@IContextKeyService _contextKeyService: IContextKeyService,
	) {
		super();

		this._configHelper = instantiationService.createInstance(TerminalConfigHelper, linuxDistro);
		Object.assign(this, {
			_getDimension: TerminalInstance.prototype['_getDimension'],
			_safeSetOption: TerminalInstance.prototype['_safeSetOption'],
			_setCursorBlink: TerminalInstance.prototype['_setCursorBlink'],
			_setCursorStyle: TerminalInstance.prototype['_setCursorStyle'],
			_setCommandsToSkipShell: TerminalInstance.prototype['_setCommandsToSkipShell'],
			_setEnableBell: TerminalInstance.prototype['_setEnableBell'],
		});

		this._hasSelectContext = CONTEXT_SERIAL_PORT_HAS_SELECT.bindTo(_contextKeyService);
		this._hasFocusContext = CONTEXT_IN_SERIAL_PORT_OUTPUT.bindTo(_contextKeyService);
	}

	public async attachToElement(container: HTMLElement) {
		this._configHelper.panelContainer = container;
		const out1 = append(container, $('.integrated-terminal'));
		const out2 = append(out1, $('.terminal-outer-container'));
		this._wrapperElement = append(out2, $('.terminal-wrapper'));
		this._xtermElement = append(this._wrapperElement, $('div'));

		await this.createXterm();

		this._wrapperElement.style.bottom = '2px';

		this._widgetManager = new TerminalWidgetManager(this._wrapperElement);
	}

	async createXterm() {
		if (!Terminal) {
			Terminal = (await import('vscode-xterm')).Terminal;
			// Enable xterm.js addons
			Terminal.applyAddon(require.__$__nodeRequire('vscode-xterm/lib/addons/search/search'));
			Terminal.applyAddon(require.__$__nodeRequire('vscode-xterm/lib/addons/webLinks/webLinks'));
			Terminal.applyAddon(require.__$__nodeRequire('vscode-xterm/lib/addons/winptyCompat/winptyCompat'));
			// Localize strings
			Terminal.strings.blankLine = nls.localize('terminal.integrated.a11yBlankLine', 'Blank line');
			Terminal.strings.promptLabel = nls.localize('terminal.integrated.a11yPromptLabel', 'Terminal input');
			Terminal.strings.tooMuchOutput = nls.localize('terminal.integrated.a11yTooMuchOutput', 'Too much output to announce, navigate to rows manually to read');
		}
		const font = this._configHelper.getFont(undefined, true);
		const config = this._configHelper.config;
		const accessibilitySupport = this._configurationService.getValue<IEditorOptions>('editor').accessibilitySupport;

		this._xterm = new Terminal({
			scrollback: config.scrollback,
			theme: TerminalInstance.prototype['_getXtermTheme'].call(this),
			drawBoldTextInBrightColors: config.drawBoldTextInBrightColors,
			fontFamily: font.fontFamily,
			fontWeight: config.fontWeight,
			fontWeightBold: config.fontWeightBold,
			fontSize: font.fontSize,
			letterSpacing: font.letterSpacing,
			lineHeight: font.lineHeight,
			bellStyle: config.enableBell ? 'sound' : 'none',
			screenReaderMode: accessibilitySupport === 'on',
			macOptionIsMeta: config.macOptionIsMeta,
			macOptionClickForcesSelection: config.macOptionClickForcesSelection,
			rightClickSelectsWord: config.rightClickBehavior === 'selectWord',
			// TODO: Guess whether to use canvas or dom better
			rendererType: config.rendererType === 'auto' ? 'canvas' : config.rendererType,
			// TODO: Remove this once the setting is removed upstream
			experimentalCharAtlas: 'dynamic',
		});

		// this._xterm.on('linefeed', () => this._onLineFeed());

		// TODO: process stdio

		// this._xterm.on('focus', () => this._onFocus.fire(this));

		this._register(this._themeService.onThemeChange(theme => TerminalInstance.prototype['_getXtermTheme'].call(this, theme)));

		this._xterm.open(this._xtermElement);

		this._register(this._xterm);

		this._register(addDisposableListener(this._wrapperElement, 'mousedown', (event: MouseEvent) => this.handleMouseDown(event)));
		this._register(addDisposableListener(this._wrapperElement, 'mouseup', (event: MouseEvent) => this.handleMouseUp(event)));
		this._register(addDisposableListener(this._wrapperElement, 'contextmenu', (event: MouseEvent) => this.handleContextMenu(event)));
		this._register(this._configurationService.onDidChangeConfiguration(e => this.reloadConfig(e)));
		this._register(this._xterm.addDisposableListener('data', (data: string) => this.handleInput(data)));

		this.registerFocusEvents();

		TerminalInstance.prototype.updateConfig.call(this);
	}

	@memoize
	public get findWidget() {
		return this.instantiationService.createInstance(OutputWindowFind, this._wrapperElement, this._xterm);
	}

	public copySelection(): void {
		if (this._xterm.hasSelection()) {
			this._clipboardService.writeText(this._xterm.getSelection());
		} else {
			this._notificationService.warn(nls.localize('terminal.integrated.copySelection.noSelection', 'The terminal has no selection to copy'));
		}
	}

	public layout(dimension: Dimension = this.dimension): void {
		this.dimension = dimension;

		const terminalWidth = TerminalInstance.prototype['_evaluateColsAndRows'].call(this, dimension.width, dimension.height);
		// console.log('layout terminalWidth=', terminalWidth);
		if (!terminalWidth) {
			return;
		}

		if (this._xterm) {
			this._xterm.element.style.width = terminalWidth + 'px';
			this._xterm.element.style.height = dimension.height + 'px';
		}

		TerminalInstance.prototype['_resize'].call(this);
	}

	printScrollBack() {

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
		buff.pipeTo(this._xterm);
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
		this._xterm.focus();
		document.execCommand('paste');
	}

	private handleContextMenu(event: MouseEvent) {
		if (!this._cancelContextMenu) {
			const standardEvent = new StandardMouseEvent(event);
			const anchor: { x: number, y: number } = { x: standardEvent.posx, y: standardEvent.posy };
			this._contextMenuService.showContextMenu({
				getAnchor: () => anchor,
				getActions: () => this._getContextMenuActions(),
				getActionsContext: () => this._wrapperElement,
			});
		} else {
			// console.log('cancel context');
		}
		this._cancelContextMenu = false;
	}

	private handleMouseUp(event: MouseEvent) {
		if (this._configurationService.getValue('terminal.integrated.copyOnSelection')) {
			if (event.which === 1) {
				if (this._xterm.hasSelection()) {
					this.copySelection();
				}
			}
		}
	}

	private handleMouseDown(event: MouseEvent) {
		if (event.which === 3) {
			if (this._configHelper.config.rightClickBehavior === 'copyPaste') {
				if (this._xterm.hasSelection()) {
					this.copySelection();
					this._xterm.clearSelection();
				} else {
					this.paste();
				}
				if (isMacintosh) {
					setTimeout(() => {
						this._xterm.clearSelection();
					}, 0);
				}
				this._cancelContextMenu = true;
			}
		}
	}

	private _getContextMenuActions(): (IAction | ContextSubMenu)[] {
		const acts = this._createContextMenuActions();
		acts.copy.enabled = this._xterm.hasSelection();
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

	private reloadConfig(e: IConfigurationChangeEvent) {
		if (e.affectsConfiguration('terminal.integrated')) {
			TerminalInstance.prototype.updateConfig.call(this);
		}
		if (e.affectsConfiguration('editor.accessibilitySupport')) {
			TerminalInstance.prototype.updateAccessibilitySupport.call(this);
		}

		this.layout();
	}

	private registerFocusEvents() {
		// copy from terminalInstance
		this._register(addDisposableListener(this._xterm.textarea, 'focus', (event: KeyboardEvent) => {
			// console.log('%s -> %s', '_hasFocusContext', true);
			this._hasFocusContext.set(true);
		}));
		this._register(addDisposableListener(this._xterm.textarea, 'blur', (event: KeyboardEvent) => {
			// console.log('%s -> %s', '_hasFocusContext', 'reset');
			this._hasFocusContext.reset();
			this._refreshSelectionContextKey();
		}));
		this._register(addDisposableListener(this._xterm.element, 'focus', (event: KeyboardEvent) => {
			// console.log('%s -> %s', '_hasFocusContext', 'true');
			this._hasFocusContext.set(true);
		}));
		this._register(addDisposableListener(this._xterm.element, 'blur', (event: KeyboardEvent) => {
			// console.log('%s -> %s', '_hasFocusContext', 'reset');
			this._hasFocusContext.reset();
			this._refreshSelectionContextKey();
		}));

		/// these two may change after time (see terminalInstance)
		this._register(addDisposableListener(this._xterm.element, 'mousedown', (event: KeyboardEvent) => {
			const listener = addDisposableListener(document, 'mouseup', (event: KeyboardEvent) => {
				setTimeout(() => this._refreshSelectionContextKey(), 0);
				listener.dispose();
			});
		}));

		this._register(addDisposableListener(this._xterm.element, 'keyup', (event: KeyboardEvent) => {
			setTimeout(() => this._refreshSelectionContextKey(), 0);
		}));
	}

	private _refreshSelectionContextKey() {
		// console.log('%s -> %s', '_hasSelectContext', this._xterm.hasSelection());
		this._hasSelectContext.set(this._xterm.hasSelection());
	}

	clearScreen(instance = this.currentInstance) {
		if (instance === this.currentInstance) {
			this._xterm.write(EscapeStringClearScreen.toString());
			this._xterm.clear();
		}

		if (!instance || !this.scrollbackList.has(instance)) {
			return;
		}

		const buff = this.scrollbackList.getReq(instance);
		buff.flush();
	}

	focusFindWidget() {
		const sel = this._xterm.getSelection();
		if (this._xterm.hasSelection() && (sel.indexOf('\n') === -1)) {
			this.findWidget.reveal(sel);
		} else {
			this.findWidget.reveal();
		}
	}

	private handleInput(data: string) {
		if (!this.userInputEnabled) {
			return;
		}
		this._onData.fire(data);
	}
}

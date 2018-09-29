import { TerminalWidgetManager } from 'vs/workbench/parts/terminal/browser/terminalWidgetManager';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { Terminal as XTermTerminal } from 'vscode-xterm';
import { TerminalConfigHelper } from 'vs/workbench/parts/terminal/electron-browser/terminalConfigHelper';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { TerminalInstance } from 'vs/workbench/parts/terminal/electron-browser/terminalInstance';
import { IEditorOptions } from 'vs/editor/common/config/editorOptions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import * as nls from 'vs/nls';
import { $, append, Dimension } from 'vs/base/browser/dom';
import { Emitter, Event } from 'vs/base/common/event';
import { ILocalOptions, SerialPortBaseBinding, serialPortEOL } from 'vs/kendryte/vs/workbench/serialPort/node/serialPortType';
import { Writable } from 'stream';

let Terminal: typeof XTermTerminal;

export class OutputXTerminal implements IDisposable {
	private _disposables: IDisposable[] = [];

	private _xterm: XTermTerminal;
	private _xtermElement: HTMLDivElement;
	protected _widgetManager: TerminalWidgetManager;
	protected _configHelper: TerminalConfigHelper;

	protected _isVisible = true;
	protected _wrapperElement: HTMLElement;

	protected scrollbackList = new Map<SerialPortBaseBinding, ScrollbackBuffer>();

	private readonly _onDimensionsChanged: Emitter<void> = new Emitter<void>();
	private last: ScrollbackBuffer;
	private inputReading: IDisposable;
	private encoding: ILocalOptions['charset'];
	private ending: string;

	public get onDimensionsChanged(): Event<void> { return this._onDimensionsChanged.event; }

	constructor(
		@IInstantiationService instantiationService: IInstantiationService,
		@IThemeService protected readonly _themeService: IThemeService,
		@IConfigurationService private readonly _configurationService: IConfigurationService,
	) {
		this._configHelper = instantiationService.createInstance(TerminalConfigHelper);
		Object.assign(this, {
			_getDimension: TerminalInstance.prototype['_getDimension'],
			_safeSetOption: TerminalInstance.prototype['_safeSetOption'],
		});

	}

	public async attachToElement(container: HTMLElement) {
		this._configHelper.panelContainer = container;
		this._wrapperElement = append(container, $('div.terminal-wrapper'));
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

		this._disposables.push(this._themeService.onThemeChange(theme => TerminalInstance.prototype['_getXtermTheme'].call(this, theme)));

		this._xterm.open(this._xtermElement);
	}

	public layout(dimension: Dimension): void {
		const terminalWidth = TerminalInstance.prototype['_evaluateColsAndRows'].call(this, dimension.width, dimension.height);
		if (!terminalWidth) {
			return;
		}

		if (this._xterm) {
			this._xterm.element.style.width = terminalWidth + 'px';
		}

		TerminalInstance.prototype['_resize'].call(this);
	}

	dispose() {
		dispose(this._disposables);
		this._xterm.dispose();
	}

	handleSerialIncoming(instance: SerialPortBaseBinding) {
		if (this.last) {
			this.last.deletePipe();
		}

		if (!instance) {
			return;
		}

		if (!this.scrollbackList.has(instance)) {
			const scrollbackBuffer = new ScrollbackBuffer(this.encoding);
			this.scrollbackList.set(instance, scrollbackBuffer);
			instance.pipe(scrollbackBuffer);
		}

		const buff = this.scrollbackList.get(instance);
		buff.pipeTo(this._xterm);
		this.last = buff;
	}

	destroyScrollback(instance: SerialPortBaseBinding) {
		if (!this.scrollbackList.has(instance)) {
			return;
		}

		const buff = this.scrollbackList.get(instance);
		buff.destroy();
		this.scrollbackList.delete(instance);

		if (buff === this.last) {
			this.last.destroy();
			delete this.last;
		}
	}

	handleUserType(instance: Writable, echo: boolean) {
		if (instance) {
			this.inputReading = this._xterm.addDisposableListener('data', (buff: string) => {
				const r = Buffer.from(buff.replace(/\r/g, this.ending || '\n'), this.encoding);
				console.log('xterm input', r);
				instance.write(r);
				if (echo) {
					this._xterm.write(buff.replace(/\r/g, '\n\r'));
				}
			});
		} else if (this.inputReading) {
			this.inputReading.dispose();
		}
	}

	setOptions(options: ILocalOptions = {} as any) {
		this.encoding = options.charset || 'binary';
		this.ending = serialPortEOL.get(options.lineEnding) || '';
	}

	write(s: string) {
		this._xterm.write(s);
	}
}

const Escape = Buffer.from([0x1B, 0x63]); // \ec

class ScrollbackBuffer extends Writable {
	private scrollback: string;
	private target: XTermTerminal;

	constructor(private encoding: ILocalOptions['charset']) {
		super();
	}

	pipeTo(_xterm: XTermTerminal) {
		_xterm.clear();
		_xterm.write(this.scrollback);
		this.target = _xterm;
	}

	_write(data: Buffer) {
		if (data.indexOf(Escape) !== -1) {
			this.scrollback = '';
		}
		const str = data.toString(this.encoding);
		this.scrollback += str;
		if (this.target) {
			this.target.write(str);
		}
	}

	destroy() {
		super.destroy();
		delete this.target;
	}

	deletePipe() {
		delete this.target;
	}
}
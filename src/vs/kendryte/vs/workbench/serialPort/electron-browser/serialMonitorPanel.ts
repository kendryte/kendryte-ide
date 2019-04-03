import { Extensions as PanelExtensions, Panel, PanelDescriptor, PanelRegistry } from 'vs/workbench/browser/panel';
import { $, append, Dimension, getTotalHeight, hide, show } from 'vs/base/browser/dom';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { SERIAL_MONITOR_ACTION_REFRESH_DEVICE, SERIAL_PANEL_ID, SerialPortCloseReason } from 'vs/kendryte/vs/workbench/serialPort/common/type';
import { ISerialPortService } from 'vs/kendryte/vs/workbench/serialPort/node/serialPortService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { attachButtonStyler, attachSelectBoxStyler, IButtonStyleOverrides } from 'vs/platform/theme/common/styler';
import { Button } from 'vs/base/browser/ui/button/button';
import { Registry } from 'vs/platform/registry/common/platform';
import { localize } from 'vs/nls';
import { SerialDeviceList } from 'vs/kendryte/vs/workbench/serialPort/electron-browser/serialDeviceList';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { SerialReplInput } from 'vs/kendryte/vs/workbench/serialPort/electron-browser/serialReplInput';
import { IAction } from 'vs/base/common/actions';
import { OutputXTerminal } from 'vs/kendryte/vs/workbench/serialPort/electron-browser/outputWindow';
import { SerialScope } from 'vs/kendryte/vs/workbench/serialPort/electron-browser/serialScope';
import { isMacintosh } from 'vs/base/common/platform';
import { SelectBox } from 'vs/base/browser/ui/selectBox/selectBox';
import { CONFIG_KEY_DEFAULT_SERIAL_BAUDRATE } from 'vs/kendryte/vs/base/common/configKeys';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import {
	defaultConfig,
	ILocalOptions,
	inputCharset,
	ISerialPortStatus,
	outputCharset,
	SerialLocalStorageSavedData,
	serialPortEOLArr,
	serialPortLFArr,
	serialPortYesNoSelection,
} from 'vs/kendryte/vs/workbench/serialPort/node/serialPortType';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { renderOcticons } from 'vs/base/browser/ui/octiconLabel/octiconLabel';
import * as SerialPort from 'serialport';
import { standardBaudRate, standardDataBits, standardParity, standardStopBits } from 'vs/kendryte/vs/workbench/config/common/baudrate';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { format } from 'util';
import { buttonBackground, buttonForeground } from 'vs/platform/theme/common/colorRegistry';
import { IDisposable } from 'vs/base/common/lifecycle';
import { ILogService } from 'vs/platform/log/common/log';
import { SerialPortActionCategory } from 'vs/kendryte/vs/base/common/menu/serialPort';
import { selectBoxNames } from 'vs/kendryte/vs/base/browser/ui/selectBox';

interface ButtonList {
	pause: Button & { styler: IDisposable };
	stop: Button;
	playTerm: Button;
	playRaw: Button;

	baudRate: SelectBox;
	parity: SelectBox;
	dataBits: SelectBox;
	stopBits: SelectBox;

	outputCharset: SelectBox;
	inputCharset: SelectBox;
	lineEnding: SelectBox;
	escape: SelectBox;
	echo: SelectBox;

	translateLineFeed: SelectBox;
	hexLineFeed: SelectBox;
}

interface ValueList {
	baudRate: undefined | number;
	dataBits: undefined | number;
	parity: undefined | string;
	stopBits: undefined | number;
	outputCharset: undefined | ILocalOptions['outputCharset'];
	inputCharset: undefined | ILocalOptions['inputCharset'];
	lineEnding: undefined | ILocalOptions['lineEnding'];
	escape: undefined | ILocalOptions['escape'];
	echo: undefined | ILocalOptions['echo'];
	translateLineFeed: undefined | ILocalOptions['translateLineFeed'];
	hexLineFeed: undefined | ILocalOptions['hexLineFeed'];
}

class SerialMonitorPanel extends Panel {
	private actions: IAction[];

	private created: boolean = false;
	private lastDimension: Dimension;

	private left: HTMLDivElement;
	private $leftHead: HTMLElement;
	private $rightHead: HTMLElement;

	private list: SerialDeviceList;

	private controlList: ButtonList;
	private valueList: ValueList;
	private title: HTMLSpanElement;
	private /*readonly*/ xterm: OutputXTerminal;
	private inputController: SerialReplInput;
	private currentSelectedItem: ISerialPortStatus;
	private context: SerialScope;

	constructor(
		@IThemeService themeService: IThemeService,
		@ITelemetryService telemetryService: ITelemetryService,
		@IInstantiationService private instantiationService: IInstantiationService,
		@ISerialPortService private serialPortService: ISerialPortService,
		@INotificationService private notifyService: INotificationService,
		@ICommandService private commandService: ICommandService,
		@IStorageService storageService: IStorageService,
		@IConfigurationService private configurationService: IConfigurationService,
		@IContextViewService protected contextViewService: IContextViewService,
		@ILogService protected logService: ILogService,
	) {
		super(SERIAL_PANEL_ID, telemetryService, themeService, storageService);
	}

	public getActions(): IAction[] {
		if (!this.actions) {
			this.actions = [];

			this.actions.forEach(a => this._register(a));
		}

		return this.actions;
	}

	private createLeft(parent: HTMLElement) {
		const $left = this.left = append(parent, $('.left-panel'));

		this.$leftHead = append($left, $('.reload-button-container'));

		this.createButton(
			this.$leftHead,
			'$(repo-sync) ' + localize('create session', 'Reload Devices'),
			() => this.commandService.executeCommand(SERIAL_MONITOR_ACTION_REFRESH_DEVICE),
		).enabled = true;

		const selectList = this.list = this._register(this.instantiationService.createInstance(SerialDeviceList, append($left, $('.devices-list-container'))));
		this.serialPortService.onChange((list) => {
			selectList.updateList(list);
		});
		Promise.resolve(void 0).then(async () => {
			selectList.updateList(await this.serialPortService.getValues());
		});
		this._register(selectList.onClick((item) => this._update(item)));
	}

	private async createRight(parent: HTMLElement) {
		const $right = append(parent, $('.right-panel'));
		this.controlList = {} as any;

		// buttons line
		this.$rightHead = append($right, $('.head'));
		const $rightHead = append(this.$rightHead, $('.tool-button-bar'));
		const $openOptions = append(this.$rightHead, $('.options-bar.hide'));

		this.controlList.playTerm = this.createButton(
			$rightHead,
			'$(plug) $(terminal)',
			() => this._doSerialOpen(this.currentSelectedItem, 'term'),
			localize('serial-port.open.termial', 'Open serial terminal'),
		);
		this.controlList.playRaw = this.createButton(
			$rightHead,
			'$(plug) $(file-binary)',
			() => this._doSerialOpen(this.currentSelectedItem, 'raw'),
			localize('serial-port.open.raw', 'Open raw terminal'),
		);
		this.controlList.pause = this.createButton(
			$rightHead,
			'　$(pin)　',
			() => this._doSerialPause(this.currentSelectedItem),
			localize('serial-port.close', 'Pause output'),
		);
		this.controlList.stop = this.createButton(
			$rightHead,
			'　$(primitive-square)　',
			() => this._doSerialClose(this.currentSelectedItem, SerialPortCloseReason.UserAction),
			localize('serial-port.close', 'Close port'),
		);

		this.title = append($rightHead, $('span'));

		append($rightHead, $('.spacer'));

		this.createButton(
			$rightHead,
			'$(chevron-down)',
			(theButton) => {
				$openOptions.classList.toggle('hide');
				if ($openOptions.classList.contains('hide')) {
					theButton.element.innerHTML = '&nbsp;' + renderOcticons('$(chevron-down)') + '&nbsp;';
				} else {
					theButton.element.innerHTML = '&nbsp;' + renderOcticons('$(chevron-up)') + '&nbsp;';
				}
				this.layout();
			},
			localize('serial-port.options.toggle', 'Toggle serial port options'),
		).enabled = true;

		/// options bar
		const Title = (text: string) => {
			const o = $('span.title-text');
			o.innerText = text;
			return o;
		};
		const TextBox = (text: string, help?: string) => {
			const o = $('span');
			o.innerText = text;
			if (help) {
				o.title = help;
			}
			return o;
		};

		const $port = append($openOptions, $('div.line.port'));
		append($port, Title('Device - '));

		append($port, TextBox('Baud Rate:'));
		this.controlList.baudRate = this.createSelect(6, $port, standardBaudRate, 115200, 'baudRate', true);
		append($port, TextBox('Data Bits:'));
		this.controlList.dataBits = this.createSelect(6, $port, standardDataBits, undefined, 'dataBits', true);
		append($port, TextBox('Parity:'));
		this.controlList.parity = this.createSelect(6, $port, standardParity, undefined, 'parity', true);
		append($port, TextBox('Stop Bits:'));
		this.controlList.stopBits = this.createSelect(6, $port, standardStopBits, undefined, 'stopBits', true);

		const $input = append($openOptions, $('div.line.input'));
		append($input, Title('I/O - '));

		append($input, TextBox('Charset:', 'Input charset'));
		this.controlList.inputCharset = this.createSelect(6, $input, inputCharset, defaultConfig.inputCharset, 'inputCharset', false);
		append($input, TextBox('Echo:', 'Print back what you type (only raw mode)'));
		this.controlList.echo = this.createSelect(4, $input, serialPortYesNoSelection, defaultConfig.echo, 'echo', false);
		append($input, TextBox('Append:', 'Binary mode: append after your input. Terminal mode: translate Enter key ("no" will be \\n).'));
		this.controlList.lineEnding = this.createSelect(4, $input, serialPortEOLArr, defaultConfig.lineEnding, 'lineEnding', false);
		append($input, TextBox('Escape:', 'Do C escape before send. Only affect RAW mode'));
		this.controlList.escape = this.createSelect(4, $input, serialPortYesNoSelection, defaultConfig.escape, 'escape', false);

		const $terminal = append($openOptions, $('div.line.terminal'));
		append($terminal, Title('Term - '));

		append($terminal, TextBox('Charset:', 'Display charset'));
		this.controlList.outputCharset = this.createSelect(6, $terminal, outputCharset, defaultConfig.outputCharset, 'outputCharset', false);
		append($terminal, TextBox('LineFeed:', 'Translate this string into \\n\\r'));
		this.controlList.translateLineFeed = this.createSelect(4, $terminal, serialPortLFArr, defaultConfig.translateLineFeed, 'translateLineFeed', false);
		append($terminal, TextBox('HexNL:', 'When hex mode, append \\n after 0x0d'));
		this.controlList.hexLineFeed = this.createSelect(4, $terminal, serialPortYesNoSelection, defaultConfig.hexLineFeed, 'hexLineFeed', false);

		// xterm/input container
		const $repl = append($right, $('.repl'));
		const xtermContainer = append($repl, $('.xterm-wrapper'));
		const replInputContainer = append($repl, $('.repl-input-wrapper'));
		const placeholder = append(replInputContainer, $('.repl-placeholder'));
		placeholder.innerHTML = localize('press.ctrl.enter', 'Press {0}+Enter to send data.', isMacintosh ? 'CMD' : 'Ctrl');

		// local scope
		const context = this.context = this.instantiationService.createInstance(SerialScope, replInputContainer);

		// input -> history
		this._register(context.history.onNavigate((historyInput: string) => {
			this.inputController.setValue(historyInput);
			// always leave cursor at the end.
			this.inputController.setPosition({ lineNumber: 1, column: historyInput.length + 1 });
			context.enablement.set(true);
		}));

		// input
		this.inputController = context.instantiationService.createInstance(SerialReplInput, replInputContainer);
		this._register(this.inputController);

		this._register(this.inputController.onValueChange((value: string) => {
			context.enablement.set(value === '');
			if (value === '') {
				show(placeholder);
			} else {
				hide(placeholder);
			}
		}));
		this._register(this.inputController.onHeightChange(() => {
			this.layout();
		}));

		// xterm
		this.xterm = this._register(this.instantiationService.createInstance(OutputXTerminal));
		context.setOutput(this.xterm);
		await this.xterm.attachToElement(xtermContainer);
	}

	private createButton($target: HTMLElement, label: string, cb: (btn: Button) => void, title?: string): Button & { styler: IDisposable } {
		const theButton = new Button($target);

		theButton.label = '';
		theButton.element.innerHTML = '&nbsp;' + renderOcticons(label) + '&nbsp;';
		if (title) {
			theButton.element.title = title;
		}

		theButton.enabled = false;
		const styler = attachButtonStyler(theButton, this.themeService);
		this._register(styler);
		this._register(theButton);
		this._register(theButton.onDidClick(() => cb(theButton)));

		return Object.assign(theButton, {
			styler,
		});
	}

	public async create(parent: HTMLElement) {
		await super.create(parent);
		parent.classList.add('serial-monitor-panel');

		this.createLeft(parent);

		await this.createRight(parent);

		this.created = true;
		this.layout(); // if layout already call before promise, call again. (if not, lastDimension will null)
	}

	public layout(dimension: Dimension = this.lastDimension): void {
		if (!dimension) {
			return;
		}
		this.lastDimension = dimension;

		if (!this.created) {
			return;
		}

		const leftWidth = dimension.width / 5;
		this.left.style.width = `${leftWidth}px`;
		this.list.layout(dimension.height - getTotalHeight(this.$leftHead));

		const rightWidth = dimension.width - leftWidth;
		const rightHeight = dimension.height - getTotalHeight(this.$rightHead);

		const replSize = new Dimension(rightWidth, rightHeight);
		const inputHeight = this.inputController.layout(replSize);

		const rightCenterDim = new Dimension(rightWidth, rightHeight - inputHeight);
		this.xterm.layout(rightCenterDim);
	}

	private _save(item: ISerialPortStatus) {
		item.savedInput = this.inputController.getValue();

		const { port, local } = this._getCurrentOpt();

		item.openOptions = port;
		this._store(item.portItem.comName, { port, local });
	}

	private _update(item: ISerialPortStatus) {
		if (this.currentSelectedItem) {
			this._save(this.currentSelectedItem);
		}
		this.currentSelectedItem = item;

		const { portItem } = item;

		if (!item.openOptions) {
			try {
				const optStr = localStorage.getItem('serialport-options::' + portItem.comName) || '{}'
				               || localStorage.getItem('serialport-options::' + portItem.comName) || '{}';
				const opt: SerialLocalStorageSavedData = JSON.parse(optStr);
				item.openOptions = opt.port || {};
				item.localOptions = opt.local || {};
			} catch (e) {
				item.openOptions = {};
				item.localOptions = {} as any;
			}
		}

		this._updateEnable(item.hasOpen);

		Object.assign(this.valueList, defaultConfig, item.openOptions);
		const _select = <K extends keyof ValueList, V extends ValueList[K]>(def: number, selections: V[], key: K) => { // for [default]
			const v: V = this.valueList[key] as any;
			const index = selections.indexOf(v);
			return index === -1 ? def : index + 1;
		};
		this.controlList.baudRate.select(_select(1, standardBaudRate, 'baudRate'));
		this.controlList.parity.select(_select(1, standardParity, 'parity'));
		this.controlList.dataBits.select(_select(1, standardDataBits, 'dataBits'));
		this.controlList.stopBits.select(_select(1, standardStopBits, 'stopBits'));

		this.controlList.lineEnding.select(_select(0, serialPortEOLArr, 'lineEnding'));
		this.controlList.inputCharset.select(_select(0, inputCharset, 'inputCharset'));
		this.controlList.outputCharset.select(_select(0, outputCharset, 'outputCharset'));
		this.controlList.escape.select(_select(0, serialPortYesNoSelection, 'escape'));
		this.controlList.echo.select(_select(0, serialPortYesNoSelection, 'echo'));

		this.controlList.translateLineFeed.select(_select(0, serialPortLFArr, 'translateLineFeed'));
		this.controlList.hexLineFeed.select(_select(0, serialPortYesNoSelection, 'hexLineFeed'));

		this.title.innerHTML = portItem.comName;
		if (item.hasOpen) {
			this.title.innerHTML += format(' - [%s, %s, %s, %s]', item.openOptions.baudRate || '-', item.openOptions.parity || '-', item.openOptions.dataBits || '-', item.openOptions.stopBits || '-');
		}

		const changed = this.inputController.setModel((item.openMode === 'raw' && item.hasOpen) ? this.context.model : null);
		this.inputController.setValue(item.savedInput || '');
		if (changed) {
			this.layout();
		}

		this.list.refreshItem(item);

		this.xterm.setOptions(item.localOptions);
		this._updatePaused(item.paused);
		this.xterm.handleSerialIncoming(item.instance);
		if (item.instance) {
			if (item.openMode === 'raw') {
				this.context.lineInputStream.setOptions(item.localOptions);
				this.context.lineInputStream.pipe(item.instance);
				this.context.typeInputStream.unpipe();
				this.xterm.handleUserType(false);
			} else {
				this.context.typeInputStream.setOptions(item.localOptions);
				this.context.typeInputStream.pipe(item.instance);
				this.context.lineInputStream.unpipe();
				this.xterm.handleUserType(true);
			}
		} else {
			this.context.lineInputStream.unpipe();
			this.context.typeInputStream.unpipe();
			this.xterm.handleUserType(false);
		}
		if (!item.instance) {
			this.xterm.clearScreen();
		}
	}

	private _updateEnable(hasOpen: boolean) {
		this.controlList.playRaw.enabled = !hasOpen;
		this.controlList.playTerm.enabled = !hasOpen;

		this.$rightHead.querySelectorAll('.options-bar select').forEach((item: HTMLSelectElement) => {
			item.disabled = hasOpen;
		});

		this.controlList.playTerm.enabled = !hasOpen;

		this.controlList.stop.enabled = hasOpen;
		this.controlList.pause.enabled = hasOpen;
	}

	private _updatePaused(hasPaused: boolean) {
		const override: IButtonStyleOverrides = hasPaused ? {
			buttonForeground: buttonBackground,
			buttonBackground: buttonForeground,
			buttonHoverBackground: buttonForeground,
		} : {};
		this.controlList.pause.styler.dispose();
		this.controlList.pause.styler = attachButtonStyler(this.controlList.pause, this.themeService, override);
	}

	private _getCurrentOpt(): SerialLocalStorageSavedData {
		const options: Partial<SerialPort.OpenOptions> = {};
		if (this.valueList.baudRate !== null && this.valueList.baudRate !== undefined) {
			options.baudRate = parseInt(this.valueList.baudRate as any) || undefined;
		}
		if (this.valueList.dataBits !== null && this.valueList.dataBits !== undefined) {
			options.dataBits = this.valueList.dataBits as any;
		}
		if (this.valueList.parity !== null && this.valueList.parity !== undefined) {
			options.parity = this.valueList.parity as any;
		}
		if (this.valueList.stopBits !== null && this.valueList.stopBits !== undefined) {
			options.stopBits = this.valueList.stopBits as any;
		}

		const localOptions: ILocalOptions = {
			lineEnding: this.valueList.lineEnding,
			inputCharset: this.valueList.inputCharset,
			outputCharset: this.valueList.outputCharset,
			escape: this.valueList.escape,
			echo: this.valueList.echo,
			translateLineFeed: this.valueList.translateLineFeed,
			hexLineFeed: this.valueList.hexLineFeed,
		};

		return {
			port: options,
			local: localOptions,
		};
	}

	private _store(name: string, opt: SerialLocalStorageSavedData) {
		const optStr = JSON.stringify(opt);
		this.logService.info(`[serialPort] _store: ${name} ->${optStr}`);
		localStorage.setItem('serialport-options::' + name, optStr);
	}

	private _doSerialOpen(portStat: ISerialPortStatus, openMode: ISerialPortStatus['openMode']) {
		this.logService.info('[serialPort] _doSerialOpen:', portStat);
		if (!portStat || portStat.hasOpen) {
			this.logService.warn('[serialPort]    invalid stat or has already open');
			return;
		}

		const opt = portStat.portItem;
		portStat.openMode = openMode;

		const config = this._getCurrentOpt();
		this._store(opt.comName, config);

		if (config.port) {
			config.port.baudRate = parseInt(this.configurationService.getValue<string>(CONFIG_KEY_DEFAULT_SERIAL_BAUDRATE)) || 115200;
		}

		this._realOpenPort(portStat, config).catch((e: Error) => {
			this.notifyService.error(e);
			portStat.hasOpen = false;
			this._update(portStat);
		});
	}

	private async _realOpenPort(portStat: ISerialPortStatus, config: SerialLocalStorageSavedData) {
		const port = await this.serialPortService.openPort(portStat.portItem.comName, config.port, true);
		this.logService.info('[serialPort] port open success');

		portStat.hasOpen = true;
		portStat.openOptions = config.port;
		portStat.localOptions = config.local;
		portStat.instance = port;

		this._update(portStat);

		port.beforeClose((reason) => {
			this.logService.info('[serialPort] port will close because: ' + SerialPortCloseReason[reason]);
			this._destroyOnClose(portStat);
			if (reason === SerialPortCloseReason.Exclusive) {
				this.logService.info('[serialPort] will auto re-open.');
				setTimeout(() => {
					this.reOpenWhenAvailable(portStat, config).catch((e) => {
						this.logService.warn('[serialPort] Not able auto open serial port monitor');
						if (e) {
							this.logService.error(e);
						} else {
							this.logService.warn('[serialPort] do not know why, commonly not an error');
						}
					});
				}, 1000);
			}
		});
	}

	private async reOpenWhenAvailable(portStat: ISerialPortStatus, config: SerialLocalStorageSavedData) {
		const port = await this.serialPortService.openPort(portStat.portItem.comName, config.port, false);
		this.logService.error('[serialPort] reOpenWhenAvailable: waiting...');
		await new Promise((resolve, reject) => {
			const to = setTimeout(() => {
				this.logService.error('[serialPort] auto re-connect timeout.');
				reject();
			}, 20000);
			port.beforeClose((reason) => {
				this.logService.info('[serialPort] !! port close: ' + SerialPortCloseReason[reason]);
				clearTimeout(to);
				if (reason === SerialPortCloseReason.FlashComplete) {
					this.logService.info('[serialPort] try re-connect');
					setImmediate(resolve);
				} else {
					this.logService.info('[serialPort] reason not FlashComplete, ignore.');
					reject();
				}
			});
		});

		await this._realOpenPort(portStat, config);
	}

	private _doSerialPause(item: ISerialPortStatus) {
		if (!item.hasOpen) {
			return;
		}
		if (!item.instance) {
			throw new Error('Port seems already closed');
		}

		item.paused = !item.paused;
		this._updatePaused(item.paused);

		if (item.paused) {
			item.instance.pause();
		} else {
			item.instance.resume();
		}
	}

	private _destroyOnClose(item: ISerialPortStatus) {
		item.hasOpen = false;
		this.context.lineInputStream.unpipe(item.instance);
		if (item.instance) {
			this.xterm.destroyScrollback(item.instance);
		}
		this._update(item);
	}

	private _doSerialClose(item: ISerialPortStatus, reason: SerialPortCloseReason) {
		this._destroyOnClose(item);

		if (item.instance) {
			this.serialPortService.closePort(item.instance, reason).then(() => {
				delete item.instance;
			});
		} else {
			throw new Error('Port seems already closed');
		}
	}

	private createSelect<V extends keyof ValueList, T extends ValueList[V]>(
		width: number,
		$holder: HTMLElement,
		list: T[],
		selectedValue: T | undefined,
		field: V,
		unset: boolean,
	) {
		list = list.slice();

		const selections: string[] = list.map((e: T) => {
			switch (e) {
				case true:
					return 'ON';
				case false:
					return 'OFF';
				default:
					if (e && e.toString) {
						return e.toString();
					}
					throw new TypeError('Invalid value, no toString().');
			}
		});
		if (unset) {
			selections.unshift('[default]');
			list.unshift(null as any);
		}

		this.valueList[field] = selectedValue;

		const defaultValue = typeof selectedValue === 'undefined' ? -1 : list.indexOf(selectedValue);
		const $select = this._register(new SelectBox(
			selections.map(selectBoxNames),
			defaultValue === -1 ? 0 : defaultValue,
			this.contextViewService,
		));

		const $parent = append($holder, $('div'));
		$parent.style.width = width + 'em';
		$select.render($parent);

		this._register(attachSelectBoxStyler($select, this.themeService));
		this._register($select.onDidSelect(sel => {
			this.valueList[field] = list[sel.index];
		}));

		return $select;
	}
}

Registry.as<PanelRegistry>(PanelExtensions.Panels).registerPanel(new PanelDescriptor(
	SerialMonitorPanel,
	SERIAL_PANEL_ID,
	SerialPortActionCategory,
	'serial-monitor-panel-tab',
	100,
));

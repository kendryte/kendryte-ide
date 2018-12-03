import { Extensions as PanelExtensions, Panel, PanelDescriptor, PanelRegistry } from 'vs/workbench/browser/panel';
import { $, append, Dimension, getTotalHeight, hide, show } from 'vs/base/browser/dom';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { TPromise } from 'vs/base/common/winjs.base';
import { SERIAL_MONITOR_ACTION_REFRESH_DEVICE, SERIAL_PANEL_ID, SerialPortActionCategory } from 'vs/kendryte/vs/workbench/serialPort/common/type';
import { ISerialPortService } from 'vs/kendryte/vs/workbench/serialPort/node/serialPortService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { attachButtonStyler, attachSelectBoxStyler } from 'vs/platform/theme/common/styler';
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
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { renderOcticons } from 'vs/base/browser/ui/octiconLabel/octiconLabel';
import * as SerialPort from 'serialport';
import { standardBaudRate, standardDataBits, standardParity, standardStopBits } from 'vs/kendryte/vs/workbench/config/common/baudrate';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { format } from 'util';

interface ButtonList {
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

	baudRateValue: number;
	dataBitsValue: number;
	parityValue: string;
	stopBitsValue: number;
	outputCharsetValue: ILocalOptions['outputCharset'];
	inputCharsetValue: ILocalOptions['inputCharset'];
	lineEndingValue: ILocalOptions['lineEnding'];
	escapeValue: ILocalOptions['escape'];
	echoValue: ILocalOptions['echo'];
	translateLineFeedValue: ILocalOptions['translateLineFeed'];
	hexLineFeedValue: ILocalOptions['hexLineFeed'];
}

class SerialMonitorPanel extends Panel {
	private actions: IAction[];

	private created: boolean = false;
	private lastDimension: Dimension;

	private left: HTMLDivElement;
	private $leftHead: HTMLElement;
	private $rightHead: HTMLElement;

	private list: SerialDeviceList;

	private controlList: ButtonList = {} as any;
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
		TPromise.as(void 0).then(async () => {
			selectList.updateList(await this.serialPortService.getValues());
		});
		this._register(selectList.onClick((item) => this._update(item)));
	}

	private async createRight(parent: HTMLElement) {
		const $right = append(parent, $('.right-panel'));

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
		this.controlList.stop = this.createButton(
			$rightHead,
			'　$(primitive-square)　',
			() => this._doSerialClose(this.currentSelectedItem),
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
		this.controlList.baudRate = this.createSelect(6, $port, standardBaudRate, defaultConfig.baudRate, 'baudRateValue', true);
		append($port, TextBox('Data Bits:'));
		this.controlList.dataBits = this.createSelect(6, $port, standardDataBits, defaultConfig.dataBits, 'dataBitsValue', true);
		append($port, TextBox('Parity:'));
		this.controlList.parity = this.createSelect(6, $port, standardParity, defaultConfig.parity, 'parityValue', true);
		append($port, TextBox('Stop Bits:'));
		this.controlList.stopBits = this.createSelect(6, $port, standardStopBits, defaultConfig.stopBits, 'stopBitsValue', true);

		const $input = append($openOptions, $('div.line.input'));
		append($input, Title('I/O - '));

		append($input, TextBox('Charset:', 'Input charset'));
		this.controlList.inputCharset = this.createSelect(6, $input, inputCharset, defaultConfig.inputCharset, 'inputCharsetValue', false);
		append($input, TextBox('Echo:', 'Print back what you type (only raw mode)'));
		this.controlList.echo = this.createSelect(4, $input, serialPortYesNoSelection, defaultConfig.echo, 'echoValue', false);
		append($input, TextBox('Append:', 'Binary mode: append after your input. Terminal mode: translate Enter key ("no" will be \\n).'));
		this.controlList.lineEnding = this.createSelect(4, $input, serialPortEOLArr, defaultConfig.lineEnding, 'lineEndingValue', false);
		append($input, TextBox('Escape:', 'Do C escape before send. Only affect RAW mode'));
		this.controlList.escape = this.createSelect(4, $input, serialPortYesNoSelection, defaultConfig.escape, 'escapeValue', false);

		const $terminal = append($openOptions, $('div.line.terminal'));
		append($terminal, Title('Term - '));

		append($terminal, TextBox('Charset:', 'Display charset'));
		this.controlList.outputCharset = this.createSelect(6, $terminal, outputCharset, defaultConfig.outputCharset, 'outputCharsetValue', false);
		append($terminal, TextBox('LineFeed:', 'Translate this string into \\n\\r'));
		this.controlList.translateLineFeed = this.createSelect(4, $terminal, serialPortLFArr, defaultConfig.translateLineFeed, 'translateLineFeedValue', false);
		append($terminal, TextBox('HexNL:', 'When hex mode, append \\n after 0x0d'));
		this.controlList.hexLineFeed = this.createSelect(4, $terminal, serialPortYesNoSelection, defaultConfig.hexLineFeed, 'hexLineFeedValue', false);

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

	private createButton($target: HTMLElement, label: string, cb: (btn: Button) => void, title?: string): Button {
		const theButton = new Button($target);

		theButton.label = '';
		theButton.element.innerHTML = '&nbsp;' + renderOcticons(label) + '&nbsp;';
		if (title) {
			theButton.element.title = title;
		}

		theButton.enabled = false;
		this._register(attachButtonStyler(theButton, this.themeService));
		this._register(theButton);
		this._register(theButton.onDidClick(_ => cb(theButton)));

		return theButton;
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
				item.localOptions = {};
			}
		}

		this._updateEnable(item.hasOpen);

		const _select1 = (e) => e === -1 ? 0 : e + 1; // for [default]
		const _select0 = (e) => e === -1 ? 0 : e; // NO [default]
		this.controlList.baudRate.select(_select1(standardBaudRate.indexOf(this.controlList.baudRateValue = item.openOptions.baudRate || defaultConfig.baudRate)));
		this.controlList.parity.select(_select1(standardParity.indexOf(this.controlList.parityValue = item.openOptions.parity || defaultConfig.parity)));
		this.controlList.dataBits.select(_select1(standardDataBits.indexOf(this.controlList.dataBitsValue = item.openOptions.dataBits || defaultConfig.dataBits)));
		this.controlList.stopBits.select(_select1(standardStopBits.indexOf(this.controlList.stopBitsValue = item.openOptions.stopBits || defaultConfig.stopBits)));

		this.controlList.lineEnding.select(_select0(serialPortEOLArr.indexOf(this.controlList.lineEndingValue = item.localOptions.lineEnding || defaultConfig.lineEnding)));
		this.controlList.inputCharset.select(_select0(inputCharset.indexOf(this.controlList.inputCharsetValue = item.localOptions.inputCharset || defaultConfig.inputCharset)));
		this.controlList.outputCharset.select(_select0(outputCharset.indexOf(this.controlList.outputCharsetValue = item.localOptions.outputCharset || defaultConfig.outputCharset)));
		this.controlList.escape.select(_select0(serialPortYesNoSelection.indexOf(this.controlList.escapeValue = item.localOptions.escape || defaultConfig.escape)));
		this.controlList.echo.select(_select0(serialPortYesNoSelection.indexOf(this.controlList.echoValue = item.localOptions.echo || defaultConfig.echo)));

		this.controlList.translateLineFeed.select(_select0(serialPortLFArr.indexOf(this.controlList.translateLineFeedValue = item.localOptions.translateLineFeed || defaultConfig.translateLineFeed)));
		this.controlList.hexLineFeed.select(_select0(serialPortYesNoSelection.indexOf(this.controlList.hexLineFeedValue = item.localOptions.hexLineFeed || defaultConfig.hexLineFeed)));

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
		this.xterm.handleSerialIncoming(item.instance);
		if (item.instance) {
			if (item.openMode === 'raw') {
				console.log('RAW');
				this.context.lineInputStream.setOptions(item.localOptions);
				this.context.lineInputStream.pipe(item.instance);
				this.context.typeInputStream.unpipe();
				this.xterm.handleUserType(false);
			} else {
				console.log('TERM');
				this.context.typeInputStream.setOptions(item.localOptions);
				this.context.typeInputStream.pipe(item.instance);
				this.context.lineInputStream.unpipe();
				this.xterm.handleUserType(true);
			}
		} else {
			console.log('DISALBE');
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
	}

	private _getCurrentOpt(): SerialLocalStorageSavedData {
		const options: Partial<SerialPort.OpenOptions> = {};
		if (this.controlList.baudRateValue !== null && this.controlList.baudRateValue !== undefined) {
			options.baudRate = parseInt(this.controlList.baudRateValue as any) || undefined;
		}
		if (this.controlList.dataBitsValue !== null && this.controlList.dataBitsValue !== undefined) {
			options.dataBits = this.controlList.dataBitsValue as any;
		}
		if (this.controlList.parityValue !== null && this.controlList.parityValue !== undefined) {
			options.parity = this.controlList.parityValue as any;
		}
		if (this.controlList.stopBitsValue !== null && this.controlList.stopBitsValue !== undefined) {
			options.stopBits = this.controlList.stopBitsValue as any;
		}

		const localOptions: ILocalOptions = {
			lineEnding: this.controlList.lineEndingValue,
			inputCharset: this.controlList.inputCharsetValue,
			outputCharset: this.controlList.outputCharsetValue,
			escape: this.controlList.escapeValue,
			echo: this.controlList.echoValue,
			translateLineFeed: this.controlList.translateLineFeedValue,
			hexLineFeed: this.controlList.hexLineFeedValue,
		};

		return {
			port: options,
			local: localOptions,
		};
	}

	private _store(name: string, opt: SerialLocalStorageSavedData) {
		const optStr = JSON.stringify(opt);
		console.log('_store: %s -> %s', name, optStr);
		localStorage.setItem('serialport-options::' + name, optStr);
	}

	private _doSerialOpen(item: ISerialPortStatus, openMode: ISerialPortStatus['openMode']) {
		if (!item) {
			return;
		}
		const handle = this.notifyService.notify({ severity: Severity.Info, message: 'connecting...' });
		handle.progress.infinite();

		if (item.hasOpen) {
			handle.updateSeverity(Severity.Error);
			handle.updateMessage('port already opened.');
			handle.progress.done();
			return;
		}

		item.hasOpen = true;
		const opt = item.portItem;
		item.openMode = openMode;

		const result = this._getCurrentOpt();
		this._store(opt.comName, result);

		if (result.port) {
			result.port.baudRate = parseInt(this.configurationService.getValue<string>(CONFIG_KEY_DEFAULT_SERIAL_BAUDRATE)) || 115200;
		}

		this.serialPortService.openPort(opt.comName, result.port, true).then((port) => {
			item.openOptions = result.port;
			item.localOptions = result.local;

			item.instance = port;

			this._update(item);

			port.once('close', () => {
				this._doSerialClose(item);
			});

			handle.close();
		}).then(undefined, (e: Error) => {
			handle.updateSeverity(Severity.Error);
			handle.updateMessage(e);
			handle.progress.done();
			item.hasOpen = false;
			this._update(item);
		});
	}

	private _doSerialClose(item: ISerialPortStatus) {
		if (!item.hasOpen) {
			return;
		}

		this.context.lineInputStream.unpipe(item.instance);
		this.xterm.destroyScrollback(item.instance);

		this.serialPortService.closePort(item.instance).then(() => {
			delete item.instance;
			item.hasOpen = false;
			this._update(item);
		});
	}

	private createSelect<V extends keyof ButtonList, T extends ButtonList[V]>(width: number, $holder: HTMLElement, list: T[], selectedValue: T, field: V, unset: boolean) {
		list = list.slice();

		const selections = list.map(e => {
			switch (e) {
				case true:
					return 'ON';
				case false:
					return 'OFF';
				default:
					return e.toString();
			}
		});
		if (unset) {
			selections.unshift('[default]');
			list.unshift(null);
		}

		this.controlList[field] = selectedValue;

		const defaultValue = list.indexOf(selectedValue);
		const $select = this._register(new SelectBox(
			selections,
			defaultValue === -1 ? 0 : defaultValue,
			this.contextViewService,
		));

		const $parent = append($holder, $('div'));
		$parent.style.width = width + 'em';
		$select.render($parent);

		this._register(attachSelectBoxStyler($select, this.themeService));
		this._register($select.onDidSelect(sel => {
			this.controlList[field] = list[sel.index];
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

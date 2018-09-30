import { Extensions as PanelExtensions, Panel, PanelDescriptor, PanelRegistry } from 'vs/workbench/browser/panel';
import { $, append, Dimension, getTotalHeight, hide, show } from 'vs/base/browser/dom';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { TPromise } from 'vs/base/common/winjs.base';
import { SERIAL_MONITOR_ACTION_REFRESH_DEVICE, SERIAL_PANEL_ID, SerialPortActionCategory, } from 'vs/kendryte/vs/workbench/serialPort/common/type';
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
import { MAIX_CONFIG_KEY_SERIAL_BAUDRATE } from 'vs/kendryte/vs/platform/common/type';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import {
	ILocalOptions,
	ISerialPortStatus,
	SerialLocalStorageSavedData,
	serialPortCharset,
	serialPortEOLArr,
	serialPortYesNoSelection,
} from 'vs/kendryte/vs/workbench/serialPort/node/serialPortType';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { renderOcticons } from 'vs/base/browser/ui/octiconLabel/octiconLabel';
import * as SerialPort from 'serialport';
import { standardBaudRate, standardDataBits, standardParity, standardStopBits } from 'vs/kendryte/vs/workbench/config/common/baudrate';
import { IStorageService, StorageScope } from 'vs/platform/storage/common/storage';
import { format } from 'util';

interface ButtonList {
	stop: Button;
	playTerm: Button;
	playRaw: Button;

	baudRate: SelectBox;
	parity: SelectBox;
	dataBits: SelectBox;
	stopBits: SelectBox;

	charset: SelectBox;
	lineEnding: SelectBox;
	escape: SelectBox;
	echo: SelectBox;

	baudRateValue: number;
	dataBitsValue: number;
	parityValue: string;
	stopBitsValue: number;
	charsetValue: ILocalOptions['charset'];
	lineEndingValue: ILocalOptions['lineEnding'];
	escapeValue: ILocalOptions['escape'];
	echoValue: ILocalOptions['echo'];
}

class SerialMonitorPanel extends Panel {
	private actions: IAction[];

	private created: boolean = false;
	private lastDimension: Dimension;

	private left: HTMLDivElement;
	private $leftHead: HTMLElement;
	private right: HTMLElement;
	private $rightHead: HTMLElement;

	private list: SerialDeviceList;

	private controlList: ButtonList = {} as any;
	private title: HTMLSpanElement;
	private xterm: OutputXTerminal;
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
		@IStorageService private storageService: IStorageService,
		@IConfigurationService private configurationService: IConfigurationService,
		@IContextViewService protected contextViewService: IContextViewService,
	) {
		super(SERIAL_PANEL_ID, telemetryService, themeService);
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
		const $right = this.right = append(parent, $('.right-panel'));

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
		const TextBox = (text: string, help?: string) => {
			const o = $('span');
			o.innerText = text;
			if (help) {
				o.title = help;
			}
			return o;
		};
		append($openOptions, TextBox('Baud Rate:'));
		const br = parseInt(this.configurationService.getValue(MAIX_CONFIG_KEY_SERIAL_BAUDRATE)) || 115200;
		this.controlList.baudRate = this.createSelect(6, $openOptions, standardBaudRate, br, 'baudRateValue', true);
		append($openOptions, TextBox('Data Bits:'));
		this.controlList.dataBits = this.createSelect(6, $openOptions, standardDataBits, null, 'dataBitsValue', true);
		append($openOptions, TextBox('Parity:'));
		this.controlList.parity = this.createSelect(6, $openOptions, standardParity, null, 'parityValue', true);
		append($openOptions, TextBox('Stop Bits:'));
		this.controlList.stopBits = this.createSelect(6, $openOptions, standardStopBits, null, 'stopBitsValue', true);

		append($openOptions, TextBox('| Charset:', 'input/output charset'));
		this.controlList.charset = this.createSelect(4, $openOptions, serialPortCharset, 'binary', 'charsetValue', false);
		append($openOptions, TextBox('Echo:'));
		this.controlList.echo = this.createSelect(4, $openOptions, serialPortYesNoSelection, false, 'echoValue', false);
		append($openOptions, TextBox('Line Ending:', 'Terminal mode cannot use No line ending (will fallback to \\n\\r)'));
		this.controlList.lineEnding = this.createSelect(4, $openOptions, serialPortEOLArr, 'No', 'lineEndingValue', false);

		append($openOptions, TextBox('| Escape:', 'Only affect RAW mode'));
		this.controlList.escape = this.createSelect(4, $openOptions, serialPortYesNoSelection, false, 'escapeValue', false);

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

	public async create(parent: HTMLElement): TPromise<any> {
		super.create(parent);
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
				const optStr = this.storageService.get('serialport-options::' + portItem.comName, StorageScope.WORKSPACE, '{}') || this.storageService.get('serialport-options::' + portItem.comName, StorageScope.GLOBAL, '{}');
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
		this.controlList.baudRate.select(_select1(standardBaudRate.indexOf(this.controlList.baudRateValue = item.openOptions.baudRate)));
		this.controlList.parity.select(_select1(standardParity.indexOf(this.controlList.parityValue = item.openOptions.parity)));
		this.controlList.dataBits.select(_select1(standardDataBits.indexOf(this.controlList.dataBitsValue = item.openOptions.dataBits)));
		this.controlList.stopBits.select(_select1(standardStopBits.indexOf(this.controlList.stopBitsValue = item.openOptions.stopBits)));

		this.controlList.lineEnding.select(_select0(serialPortEOLArr.indexOf(this.controlList.lineEndingValue = item.localOptions.lineEnding)));
		this.controlList.charset.select(_select0(serialPortCharset.indexOf(this.controlList.charsetValue = item.localOptions.charset)));
		this.controlList.escape.select(_select0(serialPortYesNoSelection.indexOf(this.controlList.escapeValue = item.localOptions.escape)));
		this.controlList.echo.select(_select0(serialPortYesNoSelection.indexOf(this.controlList.echoValue = item.localOptions.echo)));

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
		if (item.instance && item.openMode === 'raw') {
			this.context.lineInputStream.doPipe(item.instance, item.localOptions, this.xterm);
			this.xterm.handleUserType(null, false);
		} else {
			this.context.lineInputStream.unpipe();
			this.xterm.handleUserType(item.instance, item.localOptions.echo);
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
			options.baudRate = this.controlList.baudRateValue;
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
			charset: this.controlList.charsetValue,
			escape: this.controlList.escapeValue,
			echo: this.controlList.echoValue,
		};

		return {
			port: options,
			local: localOptions,
		};
	}

	private _store(name: string, opt: SerialLocalStorageSavedData) {
		const optStr = JSON.stringify(opt);
		// console.log('%s -> %s', name, optStr);
		this.storageService.store('serialport-options::' + name, optStr, StorageScope.WORKSPACE);
		this.storageService.store('serialport-options::' + name, optStr, StorageScope.GLOBAL);
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

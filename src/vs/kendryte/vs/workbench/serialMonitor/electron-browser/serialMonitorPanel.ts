import { Extensions as PanelExtensions, Panel, PanelDescriptor, PanelRegistry } from 'vs/workbench/browser/panel';
import { $, append, Dimension, getTotalHeight, getTotalWidth, hide, show } from 'vs/base/browser/dom';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { SerialPortBaseBinding, SerialPortCloseReason } from 'vs/kendryte/vs/services/serialPort/common/type';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { attachButtonStyler, IButtonStyleOverrides } from 'vs/platform/theme/common/styler';
import { Button } from 'vs/base/browser/ui/button/button';
import { Registry } from 'vs/platform/registry/common/platform';
import { localize } from 'vs/nls';
import { SerialDeviceList } from 'vs/kendryte/vs/workbench/serialMonitor/electron-browser/serialDeviceList';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { SerialReplInput } from 'vs/kendryte/vs/workbench/serialMonitor/electron-browser/serialReplInput';
import { Action, IAction } from 'vs/base/common/actions';
import { OutputXTerminal } from 'vs/kendryte/vs/workbench/serialMonitor/electron-browser/outputWindow';
import { SerialScope } from 'vs/kendryte/vs/workbench/serialMonitor/electron-browser/serialScope';
import { isMacintosh, setImmediate } from 'vs/base/common/platform';
import {
	ACTION_ID_MONITOR_TOGGLE_LEFT,
	ACTION_ID_MONITOR_TOGGLE_RIGHT,
	ACTION_LABEL_MONITOR_TOGGLE_LEFT,
	ACTION_LABEL_MONITOR_TOGGLE_RIGHT,
	SERIAL_PANEL_ID,
} from 'vs/kendryte/vs/workbench/serialMonitor/common/actionId';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { renderOcticons } from 'vs/base/browser/ui/octiconLabel/octiconLabel';
import { IStorageService, StorageScope } from 'vs/platform/storage/common/storage';
import { format } from 'util';
import { buttonBackground, buttonForeground } from 'vs/platform/theme/common/colorRegistry';
import { IDisposable } from 'vs/base/common/lifecycle';
import { ILogService } from 'vs/platform/log/common/log';
import { SerialPortActionCategory } from 'vs/kendryte/vs/base/common/menu/serialPort';
import { ACTION_ID_REFRESH_SERIAL_DEVICE } from 'vs/kendryte/vs/services/serialPort/common/actionId';
import { SerialOpenMode } from 'vs/kendryte/vs/workbench/serialMonitor/common/localSettings';
import { SerialMonitorData } from 'vs/kendryte/vs/workbench/serialMonitor/common/serialMonitorData';
import { SerialMonitorSettings } from 'vs/kendryte/vs/workbench/serialMonitor/browser/serialMonitorSettings';
import { SerialMonitorUIConfig } from 'vs/kendryte/vs/workbench/serialMonitor/browser/SerialMonitorUIConfig';
import { DomScrollableElement } from 'vs/base/browser/ui/scrollbar/scrollableElement';
import { ScrollbarVisibility } from 'vs/base/common/scrollable';

class SerialMonitorPanel extends Panel {
	private actions: IAction[];

	private created: boolean = false;
	private lastDimension: Dimension;

	private left: HTMLDivElement;
	private right: HTMLElement;
	private rightScroll: DomScrollableElement;
	private $leftHead: HTMLElement;
	private $centerHead: HTMLElement;

	private list: SerialDeviceList;

	private pause: Button & { styler: IDisposable };
	private stop: Button;
	private playTerm: Button;
	private playRaw: Button;
	private title: HTMLSpanElement;

	private /*readonly*/ xterm: OutputXTerminal;
	private inputController: SerialReplInput;
	private context: SerialScope;

	private readonly monitorConfig: SerialMonitorUIConfig;
	private readonly optionsPanel: SerialMonitorSettings;

	constructor(
		@IThemeService themeService: IThemeService,
		@ITelemetryService telemetryService: ITelemetryService,
		@IStorageService private readonly storageService: IStorageService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@INotificationService private readonly notifyService: INotificationService,
		@ICommandService private readonly commandService: ICommandService,
		@ILogService private readonly logService: ILogService,
	) {
		super(SERIAL_PANEL_ID, telemetryService, themeService, storageService);
		this.monitorConfig = instantiationService.createInstance(SerialMonitorUIConfig);
		this.optionsPanel = this._register(this.instantiationService.createInstance(SerialMonitorSettings));

		this._register(this.optionsPanel.onSettingChange(({ key, value }) => {
			this.monitorConfig.update(key, value);
		}));
	}

	public getActions(): IAction[] {
		if (!this.actions) {
			this.actions = [
				new Action(ACTION_ID_MONITOR_TOGGLE_LEFT, ACTION_LABEL_MONITOR_TOGGLE_LEFT, 'left', true, () => Promise.resolve(this.toggleSide('left'))),
				new Action(ACTION_ID_MONITOR_TOGGLE_RIGHT, ACTION_LABEL_MONITOR_TOGGLE_RIGHT, 'right', true, () => Promise.resolve(this.toggleSide('right'))),
			];

			this.actions.forEach(a => this._register(a));
		}

		return this.actions;
	}

	private sideVisible(which: 'left' | 'right') {
		return this.getContainer().classList.contains(which + '_show');
	}

	private toggleSide(which: 'left' | 'right') {
		const shown = this.getContainer().classList.toggle(which + '_show');
		this.layout();
		this.storageService.store('serial:monitor:panel:status:' + which, shown ? 'show' : '', StorageScope.GLOBAL);
	}

	private createLeft(parent: HTMLElement) {
		const $left = this.left = append(parent, $('.left-panel'));
		this.$leftHead = append($left, $('.reload-button-container'));

		this.createButton(
			this.$leftHead,
			'$(repo-sync) ' + localize('reload_devices', 'Reload Devices'),
			() => this.commandService.executeCommand(ACTION_ID_REFRESH_SERIAL_DEVICE),
		).enabled = true;

		const selectList = this.list = this._register(this.instantiationService.createInstance(SerialDeviceList, append($left, $('.devices-list-container'))));

		this._register(selectList.onClick((item) => this._setCurrent(item)));
		this._register(selectList.onClose((item) => this._destroyOnClose(item)));
	}

	private async createRight(parent: HTMLElement) {
		const $center = append(parent, $('.center-panel'));

		// buttons line
		this.$centerHead = append($center, $('.head'));
		const $centerHead = append(this.$centerHead, $('.tool-button-bar'));

		this.playTerm = this.createButton(
			$centerHead,
			'$(plug) $(terminal)',
			() => this._doClickOpenMonitor(SerialOpenMode.term),
			localize('serial-port.open.termial', 'Open serial terminal'),
		);
		this.playRaw = this.createButton(
			$centerHead,
			'$(plug) $(file-binary)',
			() => this._doClickOpenMonitor(SerialOpenMode.raw),
			localize('serial-port.open.raw', 'Open raw terminal'),
		);
		this.pause = this.createButton(
			$centerHead,
			'　$(pin)　',
			() => this._doSerialPause(),
			localize('serial-port.close', 'Pause output'),
		);
		this.stop = this.createButton(
			$centerHead,
			'　$(primitive-square)　',
			() => this._doSerialClose(SerialPortCloseReason.UserAction),
			localize('serial-port.close', 'Close port'),
		);

		this.title = append($centerHead, $('span'));

		append($centerHead, $('.spacer'));

		// right panel
		const $right = append(parent, $('.right-panel'));
		this.rightScroll = this._register(new DomScrollableElement($right, {
			horizontal: ScrollbarVisibility.Hidden,
			vertical: ScrollbarVisibility.Visible,
		}));
		this.right = append(parent, this.rightScroll.getDomNode());

		this.optionsPanel.render($right);

		// xterm/input container
		const $repl = append($center, $('.repl'));
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

		if (this.storageService.get('serial:monitor:panel:status:left', StorageScope.GLOBAL, 'show')) {
			parent.classList.add('left_show');
		}
		if (this.storageService.get('serial:monitor:panel:status:right', StorageScope.GLOBAL, 'show')) {
			parent.classList.add('right_show');
		}

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

		this.list.layout(dimension.height - getTotalHeight(this.$leftHead));

		let centerWidth = dimension.width - 8; // margin 4px
		const leftVisible = this.sideVisible('left');
		const rightVisible = this.sideVisible('right');
		if (rightVisible) {
			centerWidth -= getTotalWidth(this.right);
			if (leftVisible) {
				this.left.style.minWidth =
					this.left.style.maxWidth = '127px';
				centerWidth -= 127;
			}
		} else if (leftVisible) {
			this.left.style.minWidth =
				this.left.style.maxWidth = '227px';
			centerWidth -= 227;
		}

		const centerHeight = dimension.height - getTotalHeight(this.$centerHead) - 8; // margin 4px

		const replSize = new Dimension(centerWidth, centerHeight);
		const inputHeight = this.inputController.layout(replSize);

		// console.log(centerWidth, centerHeight - inputHeight);
		this.xterm.layout(new Dimension(centerWidth, centerHeight - inputHeight));

		this.rightScroll.scanDomNode();
	}

	private _updateEnable(hasOpen: boolean) {
		this.optionsPanel.setEnabled(!hasOpen);

		this.playRaw.enabled = !hasOpen;
		this.playTerm.enabled = !hasOpen;
		this.stop.enabled = hasOpen;
		this.pause.enabled = hasOpen;
	}

	private render() {
		this.list.refreshCurrent();
		const current = this.list.currentSelect;

		this._updateEnable(current.hasOpen);
		this.optionsPanel.flushValues(this.monitorConfig.uiSettings);

		this.title.innerHTML = current.id;
		if (current.hasOpen) {
			const cfg = current.dumpOptions();
			this.title.innerHTML += format(' - [%s, %s, %s, %s]', cfg.baudRate || '-', cfg.parity || '-', cfg.dataBits || '-', cfg.stopBits || '-');
		}

		const changed = this.inputController.setModel((current.hasOpen && current.openMode === SerialOpenMode.raw) ? this.context.model : null);
		this.inputController.setValue(current.savedInput || '');
		if (changed) {
			this.layout();
		}

		this.xterm.setOptions(this.monitorConfig.settings);
		this._updatePaused(current.paused);

		if (current.hasOpen) {
			const instance = current.getInstance();
			this.xterm.handleSerialIncoming(instance);
			if (current.openMode === SerialOpenMode.raw) {
				this.context.lineInputStream.setOptions(current.getMonitorConfig());
				this.context.lineInputStream.pipe(instance);
				this.context.typeInputStream.unpipe();
				this.xterm.handleUserType(false);
			} else {
				this.context.typeInputStream.setOptions(current.getMonitorConfig());
				this.context.typeInputStream.pipe(instance);
				this.context.lineInputStream.unpipe();
				this.xterm.handleUserType(true);
			}
		} else {
			this.xterm.handleSerialIncoming(undefined);
			this.context.lineInputStream.unpipe();
			this.context.typeInputStream.unpipe();
			this.xterm.handleUserType(false);
			this.xterm.clearScreen();
		}
	}

	private _setCurrent(newItem: SerialMonitorData) {
		if (this.list.isSelected()) {
			this.monitorConfig.save(this.list.currentSelect.id);
		}

		this.monitorConfig.load(newItem.id);

		this.list.selectItem(newItem);
		this.render();
	}

	private _updatePaused(hasPaused: boolean) {
		const override: IButtonStyleOverrides = hasPaused ? {
			buttonForeground: buttonBackground,
			buttonBackground: buttonForeground,
			buttonHoverBackground: buttonForeground,
		} : {};
		this.pause.styler.dispose();
		this.pause.styler = attachButtonStyler(this.pause, this.themeService, override);
	}

	private _doClickOpenMonitor(openMode: SerialOpenMode) {
		const current = this.list.currentSelect;
		if (!current) {
			this.notifyService.error('invalid internal state: left list not selected');
			return;
		}
		this.logService.info('[serialPort] _doClickOpenMonitor:', current.port);
		if (!current || current.hasOpen) {
			this.notifyService.error('invalid internal state: port already opened');
			return;
		}

		current.setOpenMode(openMode);

		this.monitorConfig.save(current.id);

		this._realOpenPort(current.id).catch((e: Error) => {
			this.notifyService.error(e);
			this._setCurrent(current);
		});
	}

	private async _realOpenPort(id: string) {
		const port = await this.list.openPort(id, this.monitorConfig.settings);
		this.logService.info('[serialPort] port open success');

		port.beforeClose((reason) => {
			this.logService.info('[serialPort] port will close because: ' + SerialPortCloseReason[reason]);
			if (reason === SerialPortCloseReason.Exclusive) {
				this.logService.info('[serialPort] will auto re-open.');
				setTimeout(() => {
					this.reOpenWhenAvailable(id).catch((e) => {
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

		this.render();
	}

	private async reOpenWhenAvailable(id: string) {
		const port = await this.list.openPort(id, this.monitorConfig.settings);
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

		await this._realOpenPort(id);
	}

	private _doSerialPause() {
		const item = this.list.currentSelect;
		if (!item.hasOpen) {
			return;
		}
		if (!item.hasOpen) {
			throw new Error('pause fail: port closed');
		}

		item.togglePaused();
		this._updatePaused(item.paused);
	}

	private _destroyOnClose(instance: SerialPortBaseBinding) {
		this.context.lineInputStream.unpipe(instance);
		this.xterm.destroyScrollback(instance);
	}

	private async _doSerialClose(reason: SerialPortCloseReason) {
		const item = this.list.currentSelect;

		if (item.hasOpen) {
			await this.list.closePort(item.id, reason);
			this.render();
		} else {
			setImmediate(() => {
				this.render();
			});
			throw new Error('Port seems already closed');
		}
	}
}

Registry.as<PanelRegistry>(PanelExtensions.Panels).registerPanel(new PanelDescriptor(
	SerialMonitorPanel,
	SERIAL_PANEL_ID,
	SerialPortActionCategory,
	'serial-monitor-panel-tab',
	100,
));

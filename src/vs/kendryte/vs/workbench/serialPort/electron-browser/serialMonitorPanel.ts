import { Extensions as PanelExtensions, Panel, PanelDescriptor, PanelRegistry } from 'vs/workbench/browser/panel';
import { $, append, Dimension, getTotalHeight, hide, show } from 'vs/base/browser/dom';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { TPromise } from 'vs/base/common/winjs.base';
import { ISerialPortStatus, SERIAL_MONITOR_ACTION_REFRESH_DEVICE, SERIAL_PANEL_ID, SerialPortActionCategory, } from 'vs/kendryte/vs/workbench/serialPort/common/type';
import { ISerialPortService } from 'vs/kendryte/vs/workbench/serialPort/node/serialPortService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { attachButtonStyler } from 'vs/platform/theme/common/styler';
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

interface ButtonList {
	stop: Button;
	play: Button;
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

	private buttons: ButtonList = {} as any;
	private title: HTMLSpanElement;
	private xterm: OutputXTerminal;
	private inputController: SerialReplInput;

	constructor(
		@IThemeService themeService: IThemeService,
		@ITelemetryService telemetryService: ITelemetryService,
		@IInstantiationService private instantiationService: IInstantiationService,
		@ISerialPortService private serialPortService: ISerialPortService,
		@ICommandService private commandService: ICommandService,
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

		const reloadButton = this.createButton(
			this.$leftHead,
			localize('create session', 'Reload Devices'),
			'repo-sync',
		);
		this.attachCommand(reloadButton, SERIAL_MONITOR_ACTION_REFRESH_DEVICE);

		const selectList = this.list = this._register(this.instantiationService.createInstance(SerialDeviceList, append($left, $('.devices-list-container'))));
		this.serialPortService.onChange((list) => {
			selectList.updateList(list);
		});
		TPromise.as(void 0).then(async () => {
			selectList.updateList(await this.serialPortService.getValues());
		});
		this._register(selectList.onClick((item: ISerialPortStatus) => {
			this.title.innerHTML = item.portItem.comName;
			this.buttons.play.enabled = !item.hasOpen;
			this.buttons.stop.enabled = item.hasOpen;
			console.log(item);
		}));
	}

	private async createRight(parent: HTMLElement) {
		const $right = this.right = append(parent, $('.right-panel'));

		// buttons line
		const $rightHead = this.$rightHead = append($right, $('.tool-button-bar'));

		this.buttons.play = this.createButton(
			$rightHead,
			' ',
			'circle-slash',
		);
		this.buttons.stop = this.createButton(
			$rightHead,
			' ',
			'circle-slash',
		);
		this.buttons.stop.enabled = false;

		this.title = append($rightHead, $('span'));

		append($rightHead, $('.spacer'));

		// xterm/input container
		const $repl = append($right, $('.repl'));
		const xtermContainer = append($repl, $('.xterm-wrapper'));
		const replInputContainer = append($repl, $('.repl-input-wrapper'));
		const placeholder = append(replInputContainer, $('.repl-placeholder'));
		placeholder.innerHTML = localize('press.ctrl.enter', 'Press {0}+Enter to send data.', isMacintosh ? 'CMD' : 'Ctrl');

		// local scope
		const context = this.instantiationService.createInstance(SerialScope, replInputContainer);

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

		this.inputController.setModel(context.model);

		// xterm
		this.xterm = this._register(context.instantiationService.createInstance(OutputXTerminal));
		await this.xterm.attachToElement(xtermContainer);
	}

	private attachCommand(button: Button, command: string, commandArgs: any[] = []) {
		this._register(button.onDidClick(() => this.commandService.executeCommand(command, ...commandArgs)));
	}

	private createButton($target: HTMLElement, label: string, icon: string = ''): Button {
		const theButton = new Button($target);
		if (label) {
			theButton.label = label;
		}
		if (icon) {
			theButton.element.classList.add('octicon', 'octicon-' + icon);
		}

		this._register(attachButtonStyler(theButton, this.themeService));
		this._register(theButton);

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
}

Registry.as<PanelRegistry>(PanelExtensions.Panels).registerPanel(new PanelDescriptor(
	SerialMonitorPanel,
	SERIAL_PANEL_ID,
	SerialPortActionCategory,
	'serial-monitor-panel-tab',
	100,
));

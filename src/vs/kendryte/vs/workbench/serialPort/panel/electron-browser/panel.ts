import { Panel } from 'vs/workbench/browser/panel';
import { $, append, Dimension } from 'vs/base/browser/dom';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { TPromise } from 'vs/base/common/winjs.base';
import { CONFIG_KEY_SRIAL_PORT, ISerialPanelService } from 'vs/kendryte/vs/workbench/serialPort/common/type';
import { ISerialPortService } from 'vs/kendryte/vs/workbench/serialPort/node/serialPortService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { dispose } from 'vs/base/common/lifecycle';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { SelectBox } from 'vs/base/browser/ui/selectBox/selectBox';
import { attachButtonStyler, attachSelectBoxStyler } from 'vs/platform/theme/common/styler';
import { Button } from 'vs/base/browser/ui/button/button';
import { ITerminalInstance } from 'vs/workbench/parts/terminal/common/terminal';
import { INotificationService } from 'vs/platform/notification/common/notification';

export const SERIAL_PANEL_ID = 'workbench.panel.serial';

export class SerialMonitPanel extends Panel {
	private selectBox: SelectBox;
	private deviceMap: Map<string, string> = new Map;
	private left: HTMLDivElement;

	// private activeInstance: ITerminalInstance;

	constructor(
		@IThemeService themeService: IThemeService,
		@ITelemetryService telemetryService: ITelemetryService,
		@IInstantiationService protected instantiationService: IInstantiationService,
		@IConfigurationService protected configurationService: IConfigurationService,
		@ISerialPortService protected serialPortService: ISerialPortService,
		@IContextKeyService protected contextKeyService: IContextKeyService,
		@IContextViewService protected contextViewService: IContextViewService,
		@ISerialPanelService protected serialPanelService: ISerialPanelService,
		@INotificationService protected notificationService: INotificationService,
	) {
		super(SERIAL_PANEL_ID, telemetryService, themeService);
	}

	public async create(parent: HTMLElement): TPromise<any> {
		super.create(parent);
		parent.classList.add('serial-monitor');

		this.left = append(parent, $('.left-panel'));
		const $right = append(parent, $('.right-panel'));

		append(this.left, $('span')).innerText = 'Sessions: ';

		const $head = append(this.left, $('.session-switch'));

		const selectBox = this.selectBox = new SelectBox([], 0, this.contextViewService);
		this._toDispose.push(attachSelectBoxStyler(selectBox, this.themeService));
		selectBox.render($head);
		this._toDispose.push(selectBox, selectBox.onDidSelect(({ selected }) => {
			const path = this.deviceMap.get(selected) || selected;
			if (/ /.test(path)) {
				return;
			}
		}));

		const createBtn = new Button($head);
		createBtn.label = ' ';
		createBtn.element.classList.add('octicon', `octicon-plus`);
		this._toDispose.push(attachButtonStyler(createBtn, this.themeService));
		this._toDispose.push(this.serialPortService.onChange(_ => this.refreshDevicesList()));
		await this.refreshDevicesList();

		return $right;
	}

	public layout(dimension: Dimension): void {
		this.left.style.width = `${dimension.width / 5}px`;
	}

	dispose() {
		if (this.selectBox) {
			dispose(this.selectBox);
		}
		super.dispose();
	}

	protected async refreshDevicesList() {
		// FIXME: this is completly wrong
		const devices = await this.serialPortService.getDevices();
		this.deviceMap.clear();

		const names = devices.map((item) => {
			let displayName = `${item.comName}`;
			if (item.manufacturer || item.serialNumber) {
				displayName += ': ';
				if (item.manufacturer) {
					displayName += `${item.manufacturer}`;
					if (item.serialNumber) {
						displayName += ` - `;
					}
				}
				if (item.serialNumber) {
					displayName += `${item.serialNumber}`;
				}
			}
			this.deviceMap.set(displayName, item.comName);
			return displayName;
		});

		const def = this.configurationService.getValue(CONFIG_KEY_SRIAL_PORT) as string;
		const found = names.indexOf(def);

		this.selectBox.setOptions(names, found >= 0 ? found : 0);
	}

	setInput(serialMonitorTerminalInstance: ITerminalInstance) {
		if (!serialMonitorTerminalInstance) {
			return;
		}
	}
}
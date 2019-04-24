import { WorkbenchList } from 'vs/platform/list/browser/listService';
import { Emitter } from 'vs/base/common/event';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { localize } from 'vs/nls';
import { IListRenderer, IListVirtualDelegate } from 'vs/base/browser/ui/list/list';
import { ISerialPortService, SerialPortBaseBinding, SerialPortCloseReason, SerialPortItem } from 'vs/kendryte/vs/services/serialPort/common/type';
import 'vs/css!vs/kendryte/vs/workbench/serialMonitor/browser/media/panel';
import { OcticonLabel } from 'vs/base/browser/ui/octiconLabel/octiconLabel';
import { addDisposableListener } from 'vs/base/browser/dom';
import { SimpleIdProvider } from 'vs/kendryte/vs/base/common/simpleIdProvider';
import { SerialMonitorData } from 'vs/kendryte/vs/workbench/serialMonitor/common/serialMonitorData';
import { ExtendMap } from 'vs/kendryte/vs/base/common/extendMap';
import { SerialOpenMode } from 'vs/kendryte/vs/workbench/serialMonitor/common/localSettings';
import { assertNotNull, throwNull } from 'vs/kendryte/vs/base/common/assertNotNull';
import { ISerialMonitorSettings } from 'vs/kendryte/vs/workbench/serialMonitor/common/schema';

export class SerialDeviceList extends Disposable {
	private readonly _onClick = new Emitter<SerialMonitorData>();
	readonly onClick = this._onClick.event;

	private readonly _onClose = new Emitter<SerialPortBaseBinding>();
	readonly onClose = this._onClose.event;

	protected readonly list: WorkbenchList<SerialMonitorData>;
	private listData = new ExtendMap<string, SerialMonitorData>();
	private listDataArray: SerialMonitorData[] = [];
	private _currentSelect?: SerialMonitorData;

	constructor(
		private readonly container: HTMLElement,
		@IInstantiationService instantiationService: IInstantiationService,
		@ISerialPortService private readonly serialPortService: ISerialPortService,
	) {
		super();
		this.list = instantiationService.createInstance(
			WorkbenchList,
			container,
			this.createDelegate(),
			[new SerialPortItemRenderer(this._onClick)],
			{
				identityProvider: SimpleIdProvider<SerialMonitorData>(),
				ariaLabel: localize('settingsListLabel', 'Settings'),
				keyboardSupport: false,
				mouseSupport: false,
			},
		) as WorkbenchList<SerialMonitorData>;
		this._register(this.list);

		this._register(serialPortService.onDynamicEnumChange((list) => {
			this.updateList(list);
		}));
		Promise.resolve(serialPortService.getDynamicEnum()).then((list) => {
			this.updateList(list);
		});
	}

	public selectItem(item: SerialMonitorData) {
		if (this._currentSelect === item) {
			this.refreshCurrent();
			return;
		}

		if (this._currentSelect) {
			this._currentSelect.setSelect(false);
			this.refreshCurrent();
			delete this._currentSelect;
		}
		this._currentSelect = item;
		this._currentSelect.setSelect(true);
		this.refreshCurrent();
	}

	layout(height: number) {
		this.container.style.height = height + 'px';
		this.list.layout(height);
	}

	public get currentSelect() {
		return throwNull(this._currentSelect);
	}

	isSelected(item?: SerialMonitorData) {
		if (item) {
			return this._currentSelect && this._currentSelect === item;
		} else {
			return !!this._currentSelect;
		}
	}

	protected createDelegate(): IListVirtualDelegate<SerialMonitorData> {
		return {
			getHeight(element: SerialMonitorData): number {
				return 24;
			},
			getTemplateId(element: SerialMonitorData): string {
				return 'serialPortTemplate';
			},
			hasDynamicHeight() {return false;},
			setDynamicHeight() {},
		};
	}

	updateList(list: SerialPortItem[]) {
		list.forEach((item) => {
			const entry = this.listData.entry(item.comName, (id) => {
				// console.log('[serial][list] device attached: %s', id);
				return new SerialMonitorData(id);
			});

			entry.updatePort(item);
		});

		const knownIds = list.map(e => e.comName);
		for (const key of this.listData.keys()) {
			if (knownIds.indexOf(key) !== -1) {
				continue;
			}
			if (this.listData.getForce(key).hasOpen) {
				continue;
			}
			// console.log('[serial][list] device removed: %s', key);
			this.listData.delete(key);
		}
		this.refreshList();
	}

	refreshCurrent() {
		const item = assertNotNull(this._currentSelect);
		const index = this.listDataArray.indexOf(item);
		if (index !== -1) {
			this.list.splice(index, 1, [item]);
		}
	}

	private refreshList() {
		const matchPortName = /^([^0-9]+)([0-9]+)$/;
		this.listDataArray = Array.from(this.listData.values()).sort((a, b) => {
			const m1 = matchPortName.exec(a.id);
			const m2 = matchPortName.exec(b.id);
			if (!m1 || !m2) {
				return a.id > b.id ? 1 : -1;
			}
			if (m1[1] > m2[1]) {
				return 1;
			} else if (m1[1] < m2[1]) {
				return -1;
			} else {
				return parseInt(m1[2]) - parseInt(m2[2]);
			}
		});

		if (this._currentSelect) {
			const index = this.listDataArray.indexOf(this._currentSelect);
			if (index === -1) {
				delete this._currentSelect;
			}
		}

		this.list.splice(0, this.list.length, this.listDataArray);
	}

	public closePort(id: string, reason: SerialPortCloseReason) {
		return this.serialPortService.closePort(id, reason);
	}

	public async openPort(id: string, config: ISerialMonitorSettings) {
		const portData = this.listData.getReq(id);
		// console.log('[serial] open port: ', config);

		portData.loadOptions(config);

		const port = await this.serialPortService.openPort(portData.id, portData.getPortConfig(), true);
		portData.setInstance(port);

		port.beforeClose(() => {
			portData.setInstance(null);
			this._onClose.fire(port);
		});

		return port;
	}
}

interface ISerialPortItemTemplate {
	dis: IDisposable;
	parent: HTMLElement;
	icon: OcticonLabel;
	current?: SerialMonitorData;
}

class SerialPortItemRenderer implements IListRenderer<SerialMonitorData, ISerialPortItemTemplate> {
	constructor(
		private readonly onClick: Emitter<SerialMonitorData>,
	) {
	}

	get templateId(): string {
		return 'serialPortTemplate';
	}

	renderTemplate(parent: HTMLElement): ISerialPortItemTemplate {
		const listen = addDisposableListener(parent, 'dblclick', () => {
			if (ret.current) {
				this.onClick.fire(ret.current);
			}
		});

		const ret: ISerialPortItemTemplate = {
			dis: listen,
			parent,
			icon: new OcticonLabel(parent),
		};

		return ret;
	}

	renderElement(entry: SerialMonitorData, index: number, templateData: ISerialPortItemTemplate): void {
		const port = entry.port;

		templateData.current = entry;

		let ico;
		if (entry.hasOpen) {
			if (entry.openMode === SerialOpenMode.raw) {
				ico = '$(plug)$(file-binary)　';
			} else {
				ico = '$(plug)$(terminal)　';
			}
			templateData.parent.classList.add('open');
			templateData.parent.classList.remove('close');
		} else {
			ico = '$(primitive-square)　';
			templateData.parent.classList.remove('open');
			templateData.parent.classList.add('close');
		}

		if (entry.selected) {
			templateData.parent.classList.add('selected');
		} else {
			templateData.parent.classList.remove('selected');
		}

		let title = port.comName;
		if (port.manufacturer || port.serialNumber) {
			title += `: ${port.manufacturer || port.serialNumber}`;
			if (port.manufacturer && port.serialNumber) {
				title += ` - ${port.serialNumber}`;
			}
		}

		templateData.icon.text = `${ico}${title}`;
		templateData.parent.title = `${title}
location=${port.locationId || ''}
pnp=${port.pnpId || ''}
vendor=${port.vendorId || ''}
product=${port.productId || ''}`;
	}

	public disposeElement(element: SerialMonitorData, index: number, templateData: ISerialPortItemTemplate): void {
		templateData.parent.title = '';
		templateData.icon.text = '';
	}

	disposeTemplate(templateData: ISerialPortItemTemplate): void {
		templateData.parent.title = '';
		templateData.parent.innerHTML = '';
		templateData.dis.dispose();
	}
}

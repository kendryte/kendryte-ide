import { WorkbenchList } from 'vs/platform/list/browser/listService';
import { ISerialPortService } from 'vs/kendryte/vs/workbench/serialPort/node/serialPortService';
import { Emitter, Event } from 'vs/base/common/event';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { localize } from 'vs/nls';
import { IListRenderer, IListVirtualDelegate } from 'vs/base/browser/ui/list/list';
import { SerialPortItem } from 'vs/kendryte/vs/workbench/serialPort/common/type';
import 'vs/css!vs/kendryte/vs/workbench/serialPort/electron-browser/panel';
import { OcticonLabel } from 'vs/base/browser/ui/octiconLabel/octiconLabel';
import { addDisposableListener } from 'vs/base/browser/dom';
import { ISerialPortStatus } from 'vs/kendryte/vs/workbench/serialPort/node/serialPortType';
import { SimpleIdProvider } from 'vs/kendryte/vs/base/common/simpleIdProvider';

interface IStatusWithSelect extends ISerialPortStatus {
	selected?: boolean;
}

export class SerialDeviceList extends Disposable {
	private readonly _onClick = new Emitter<IStatusWithSelect>();
	readonly onClick: Event<IStatusWithSelect> = this._onClick.event;

	protected readonly list: WorkbenchList<IStatusWithSelect>;
	private dataList: IStatusWithSelect[];
	private currentSelect: IStatusWithSelect;

	constructor(
		container: HTMLElement,
		@ISerialPortService serialPortService: ISerialPortService,
		@IInstantiationService instantiationService: IInstantiationService,
	) {
		super();
		this.list = instantiationService.createInstance(
			WorkbenchList,
			container,
			this.createDelegate(),
			[new SerialPortItemRenderer(this._onClick)],
			{
				identityProvider: SimpleIdProvider<IStatusWithSelect>(),
				ariaLabel: localize('settingsListLabel', 'Settings'),
				keyboardSupport: false,
				mouseSupport: false,
			},
		) as WorkbenchList<IStatusWithSelect>;
		this._register(this.list);

		this._register(this.onClick((item) => {
			if (this.currentSelect) {
				let last = this.currentSelect;
				delete this.currentSelect;
				last.selected = false;
				this.refreshItem(last);
			}
			item.selected = true;
			this.refreshItem(item);
			this.currentSelect = item;
		}));
	}

	layout(height: number) {
		this.list.layout(height);
	}

	protected createDelegate(): IListVirtualDelegate<IStatusWithSelect> {
		return {
			getHeight(element: IStatusWithSelect): number {
				return 24;
			},
			getTemplateId(element: IStatusWithSelect): string {
				return 'serialPortTemplate';
			},
		};
	}

	updateList(list: SerialPortItem[]) {
		if (this.dataList) {
			const map: { [dev: string]: boolean } = {};
			for (const item of this.dataList) {
				map[item.portItem.comName] = item.hasOpen;
			}
			this.dataList = list.map((entry) => {
				return {
					id: entry.comName,
					portItem: entry,
					hasOpen: map[entry.comName] || false,
					paused: false,
				};
			});

			// console.log('update-list');
			this.list.splice(0, this.list.length, this.dataList);
		} else {
			this.dataList = list.map((entry) => {
				return {
					id: entry.comName,
					portItem: entry,
					hasOpen: false,
					paused: false,
				};
			});
			this.list.splice(0, 0, this.dataList);
		}

		this.recheckCurrent();
	}

	refreshItem(item: ISerialPortStatus) {
		const index = this.dataList.findIndex((e) => {
			return item.portItem.comName === e.portItem.comName;
		});
		if (index === -1) {
			debugger;
		}
		this.list.splice(index, 1, [item]);

		this.recheckCurrent();
	}

	private recheckCurrent() {
		if (!this.currentSelect) {
			return;
		}

		const index = this.dataList.indexOf(this.currentSelect);
		if (index === -1) {
			delete this.currentSelect;
			return;
		}
	}
}

interface ISerialPortItemTemplate {
	dis: IDisposable;
	parent: HTMLElement;
	icon: OcticonLabel;
	current?: IStatusWithSelect;
}

class SerialPortItemRenderer implements IListRenderer<IStatusWithSelect, ISerialPortItemTemplate> {
	constructor(
		private readonly onClick: Emitter<IStatusWithSelect>,
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

	renderElement(entry: IStatusWithSelect, index: number, templateData: ISerialPortItemTemplate): void {
		const port = entry.portItem;

		templateData.current = entry;

		let ico;
		if (entry.hasOpen) {
			if (entry.openMode === 'raw') {
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

	public disposeElement(element: IStatusWithSelect, index: number, templateData: ISerialPortItemTemplate): void {
		templateData.parent.title = '';
		templateData.icon.text = '';
	}

	disposeTemplate(templateData: ISerialPortItemTemplate): void {
		templateData.parent.title = '';
		templateData.parent.innerHTML = '';
		templateData.dis.dispose();
	}
}

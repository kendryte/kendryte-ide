import { WorkbenchList } from 'vs/platform/list/browser/listService';
import { ISerialPortService } from 'vs/kendryte/vs/workbench/serialPort/node/serialPortService';
import { Emitter, Event } from 'vs/base/common/event';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { localize } from 'vs/nls';
import { IRenderer, IVirtualDelegate } from 'vs/base/browser/ui/list/list';
import { ISerialPortStatus, SerialPortItem } from 'vs/kendryte/vs/workbench/serialPort/common/type';
import 'vs/css!vs/kendryte/vs/workbench/serialPort/electron-browser/panel';
import { OcticonLabel } from 'vs/base/browser/ui/octiconLabel/octiconLabel';
import { addDisposableListener } from 'vs/base/browser/dom';

export class SerialDeviceList extends Disposable {
	private readonly _onClick = new Emitter<ISerialPortStatus>();
	readonly onClick: Event<ISerialPortStatus> = this._onClick.event;

	protected readonly list: WorkbenchList<ISerialPortStatus>;
	private dataList: ISerialPortStatus[];

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
				identityProvider: e => e.id,
				ariaLabel: localize('settingsListLabel', 'Settings'),
				focusOnMouseDown: false,
				selectOnMouseDown: false,
				keyboardSupport: false,
				mouseSupport: false,
			},
		) as WorkbenchList<ISerialPortStatus>;
		this._register(this.list);
	}

	layout(height: number) {
		this.list.layout(height);
	}

	protected createDelegate(): IVirtualDelegate<ISerialPortStatus> {
		return {
			getHeight(element: ISerialPortStatus): number {
				return 24;
			},
			getTemplateId(element: ISerialPortStatus): string {
				return 'serialPortTemplate';
			},
		};
	}

	updateList(list: SerialPortItem[]) {
		if (!this.dataList) {
			this.dataList = list.map((entry) => {
				return { portItem: entry, hasOpen: false };
			});
			this.list.splice(0, 0, this.dataList);
			return;
		}
		const map: { [dev: string]: boolean } = {};
		for (const item of this.dataList) {
			map[item.portItem.comName] = item.hasOpen;
		}
		this.dataList = list.map((entry) => {
			return {
				portItem: entry,
				hasOpen: map[entry.comName] || false,
			};
		});

		this.list.splice(0, this.list.length, this.dataList);
	}
}

interface ISerialPortItemTemplate {
	dis: IDisposable;
	parent: HTMLElement;
	icon: OcticonLabel;
	current: ISerialPortStatus;
}

class SerialPortItemRenderer implements IRenderer<ISerialPortStatus, ISerialPortItemTemplate> {
	constructor(
		private readonly onClick: Emitter<ISerialPortStatus>,
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

		const ret = {
			dis: listen,
			parent,
			icon: new OcticonLabel(parent),
			current: null,
		};

		return ret;
	}

	renderElement(entry: ISerialPortStatus, index: number, templateData: ISerialPortItemTemplate): void {
		const port = entry.portItem;

		templateData.current = entry;

		const ico = entry.hasOpen ? 'plug' : 'primitive-square';
		if (entry.hasOpen) {
			templateData.parent.classList.add('open');
			templateData.parent.classList.remove('close');
		} else {
			templateData.parent.classList.remove('open');
			templateData.parent.classList.add('close');
		}

		let title = port.comName;
		if (port.manufacturer || port.serialNumber) {
			title += `: ${port.manufacturer || port.serialNumber}`;
			if (port.manufacturer && port.serialNumber) {
				title += ` - ${port.serialNumber}`;
			}
		}

		templateData.icon.text = `$(${ico}) ${title}`;
		templateData.parent.title = `${title}
location=${port.locationId || ''}
pnp=${port.pnpId || ''}
vendor=${port.vendorId || ''}
product=${port.productId || ''}`;
	}

	public disposeElement(element: ISerialPortStatus, index: number, templateData: ISerialPortItemTemplate): void {
		templateData.parent.title = '';
		templateData.icon.text = '';
	}

	disposeTemplate(templateData: ISerialPortItemTemplate): void {
		templateData.parent.title = '';
		templateData.parent.innerHTML = '';
		templateData.dis.dispose();
	}
}

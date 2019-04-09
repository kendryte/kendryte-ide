import { Disposable } from 'vs/base/common/lifecycle';
import { Emitter } from 'vs/base/common/event';
import { ISerialMonitorSettings, localOptionsScheme, typedValues } from 'vs/kendryte/vs/workbench/serialMonitor/common/schema';
import { ExtendMap } from 'vs/kendryte/vs/base/common/extendMap';
import { fieldWidgetFactory, ISerialMonitorField } from 'vs/kendryte/vs/workbench/serialMonitor/browser/fields/base';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IJSONSchema } from 'vs/base/common/jsonSchema';

export interface ISettingUpdateEvent<K extends keyof ISerialMonitorSettings = keyof ISerialMonitorSettings> {
	key: K;
	value: ISerialMonitorSettings[K];
}

export class SerialMonitorSettings extends Disposable {
	private readonly _onSettingChange = new Emitter<ISettingUpdateEvent>();
	public readonly onSettingChange = this._onSettingChange.event;

	private $parent: HTMLDivElement;
	private controls = new ExtendMap<keyof ISerialMonitorSettings, ISerialMonitorField>();

	constructor(
		@IInstantiationService private readonly instantiationService: IInstantiationService,
	) {
		super();
	}

	public render(parent: HTMLElement) {
		if (this.$parent) {
			throw new Error('Duplicate call to render()');
		}
		this.$parent = parent as HTMLDivElement;

		Object.keys(localOptionsScheme).forEach((key: keyof ISerialMonitorSettings) => {
			const def: IJSONSchema = localOptionsScheme[key];

			const input = fieldWidgetFactory(this.$parent, this.instantiationService, def);
			input.toDispose().forEach(d => this._register(d));
			this._register(input.onChange((value) => {
				const filterd = typedValues({ [key]: value });
				this._onSettingChange.fire({ key: key, value: filterd[key] });
			}));

			this.controls.set(key, input);
		});
	}

	public setEnabled(enabled: boolean) {
		this.controls.forEach((item) => {
			item.setEnabled(enabled);
		});
	}

	public flushValues(settings: ISerialMonitorSettings) {
		this.controls.forEach((field, key) => {
			field.setValue(settings[key]);
		});
	}
}
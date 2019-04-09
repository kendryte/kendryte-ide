import { ISerialMonitorSettings } from 'vs/kendryte/vs/workbench/serialMonitor/common/schema';
import { Event } from 'vs/base/common/event';
import { IJSONSchema } from 'vs/base/common/jsonSchema';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IDisposable } from 'vs/base/common/lifecycle';
import { SerialMonitorSelect } from 'vs/kendryte/vs/workbench/serialMonitor/browser/fields/select';
import { $, append } from 'vs/base/browser/dom';

export interface ISerialMonitorField<K extends keyof ISerialMonitorSettings = keyof ISerialMonitorSettings, V = ISerialMonitorSettings[K]> {
	setValue(val: V): void;
	readonly onChange: Event<V>;
	toDispose(): IDisposable[];
	setEnabled(enable: boolean): void;
}

export function fieldWidgetFactory(parent: HTMLDivElement, instantiationService: IInstantiationService, def: IJSONSchema): ISerialMonitorField {
	const title = append(parent, $('label')) as HTMLLabelElement;
	title.innerText = def.title as string;
	if (def.description) {
		title.title = def.description;
	}

	switch (def.type) {
		case 'boolean':
			def.enum = [true, false];
			def.enumDescriptions = ['Yes', 'No'];
		// fallthrough
		case 'number':
		case 'string':
			if (def.enum) {
				return instantiationService.createInstance(SerialMonitorSelect, title, def);
			} else {
				// return instantiationService.createInstance(SerialMonitorText, parent, def);
			}
		// fallthrough
		default:
			throw new Error('Cannot render input for ' + def.title);
	}
}
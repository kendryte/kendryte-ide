import { TPromise } from 'vs/base/common/winjs.base';
import { Event } from 'vs/base/common/event';
import { ServiceIdentifier } from 'vs/platform/instantiation/common/instantiation';

export interface EnumProviderService<T> {
	// get enum selection list
	getValues(): TPromise<T[]> | T[];
	onChange: Event<T[]>;
}

export interface EnumProviderConfig<T> {
	__dyn_enum: boolean;

	service: ServiceIdentifier<EnumProviderService<T>> | string;
	editable: boolean;

	toString(): string;
}

export function dynamicEnum<T>(service: ServiceIdentifier<EnumProviderService<T>>, editable: boolean): EnumProviderConfig<T> {
	return Object['assign']([], {
		__dyn_enum: true,
		service,
		editable,
		toString() {
			return 'Error: this enum must be handle by patched settings page.';
		},
	});
}

import { TPromise } from 'vs/base/common/winjs.base';
import { IDisposable } from 'vs/base/common/lifecycle';

export interface EnumProviderService {
	refreshDevices(): TPromise<void>;

	getValues(): string[];

	onChange(cb: (list: string[]) => void): IDisposable;
}
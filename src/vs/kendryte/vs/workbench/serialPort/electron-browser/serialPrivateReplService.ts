import { IPrivateReplService } from 'vs/workbench/parts/debug/electron-browser/repl';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';

export interface ISerialPrivateReplService extends IPrivateReplService {
}

export const ISerialPrivateReplService = createDecorator<IPrivateReplService>('serialPortReplService');

export class SerialPrivateReplService implements IPrivateReplService {
	_serviceBrand: any;

	constructor() {

	}

	public acceptReplInput(): void {
	}

	public getVisibleContent(): string {
		return '';
	}
}
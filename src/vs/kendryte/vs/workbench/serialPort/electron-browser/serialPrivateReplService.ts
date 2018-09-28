import { IPrivateReplService } from 'vs/workbench/parts/debug/electron-browser/repl';

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
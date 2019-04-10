import { ISerialMonitorField } from 'vs/kendryte/vs/workbench/serialMonitor/browser/fields/base';
import { IJSONSchema } from 'vs/base/common/jsonSchema';
import { IDisposable } from 'vs/base/common/lifecycle';
import { Emitter } from 'vs/base/common/event';

export class SerialMonitorText implements ISerialMonitorField {
	private readonly _onChange = new Emitter<any>();
	public readonly onChange = this._onChange.event;

	private readonly disposable: IDisposable[] = [];

	constructor(parent: HTMLDivElement, def: IJSONSchema) {
	}

	public setValue(val: any): void {
	}

	public toDispose(): IDisposable[] {
		return this.disposable;
	}

	public setEnabled(enable: boolean): void {
	}
}
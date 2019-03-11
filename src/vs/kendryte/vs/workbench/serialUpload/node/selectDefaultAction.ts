import { Action } from 'vs/base/common/actions';
import { ACTION_ID_MAIX_SERIAL_SELECT_DEFAULT, ACTION_LABEL_MAIX_SERIAL_SELECT_DEFAULT } from 'vs/kendryte/vs/base/common/menu/cmake';
import { TPromise } from 'vs/base/common/winjs.base';
import { ISerialPortService } from 'vs/kendryte/vs/workbench/serialPort/node/serialPortService';

export class MaixSerialSelectDefaultAction extends Action {
	public static readonly ID = ACTION_ID_MAIX_SERIAL_SELECT_DEFAULT;
	public static readonly LABEL = ACTION_LABEL_MAIX_SERIAL_SELECT_DEFAULT;

	constructor(
		id: string = MaixSerialSelectDefaultAction.ID, label: string = MaixSerialSelectDefaultAction.LABEL,
		@ISerialPortService private serialPortService: ISerialPortService,
	) {
		super(id, label);
	}

	async run(): TPromise<void> {
		await this.serialPortService.quickOpenDevice();
	}
}

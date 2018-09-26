import { ISerialFlasher } from 'vs/kendryte/vs/workbench/serialPort/common/type';
import { TPromise } from 'vs/base/common/winjs.base';
import { ILogService } from 'vs/platform/log/common/log';
import { nfcall } from 'vs/base/common/async';
import SerialPort = require('serialport');

export class Flash implements ISerialFlasher {
	constructor(
		protected readonly serialDevice: SerialPort,
		protected readonly logger: ILogService,
	) {
	}

	public async flash(firmware: Buffer, bootLoader?: Buffer): TPromise<void> {
		const status = await nfcall(_ => this.serialDevice.get());
		this.logger.debug(JSON.stringify(status, null, 2));

		while (true) {
			this.logger.info('Greeting');

		}
		return undefined;
	}
}
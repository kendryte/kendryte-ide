import { ISerialPortInstance, ISerialPortService } from 'vs/kendryte/vs/services/serialPort/common/type';
import { ILogService } from 'vs/platform/log/common/log';
import { BOOT_BUTTON_TYPE, BOOT_BOARD_TYPE, getSerialPortIspSequence } from 'vs/kendryte/vs/services/serialPort/common/rebootSequence';
import { CancellationToken } from 'vs/base/common/cancellation';

export async function tryRebootDevBoard(
	device: ISerialPortInstance,
	type: BOOT_BOARD_TYPE,
	cancelToken: CancellationToken,
	serialPortService: ISerialPortService,
	logger: ILogService,
	greetingMethod: () => Promise<void>,
) {
	logger.info('Greeting');
	try {
		logger.info('try reboot as KD233');
		await serialPortService.sendFlowControl(device, getSerialPortIspSequence(type, BOOT_BUTTON_TYPE.RTS_IS_BOOT), cancelToken);
		await greetingMethod();
		return true;
	} catch (e) {
		logger.info('Failed to boot as KD233: %s', e.message);
	}
	try {
		logger.info('try reboot as other board');
		await serialPortService.sendFlowControl(device, getSerialPortIspSequence(type, BOOT_BUTTON_TYPE.DTR_IS_BOOT), cancelToken);
		await greetingMethod();
		return true;
	} catch (e) {
		logger.info('Failed to boot as other board: %s', e.message);
	}

	return false;
}

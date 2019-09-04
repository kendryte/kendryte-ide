import { ISerialRebootSequence } from 'vs/kendryte/vs/services/serialPort/common/type';
import { SetOptions } from 'vs/kendryte/vs/services/serialPort/common/libraryType';

export const boardRebootSequence: ISerialRebootSequence = [
	{ dtr: false, rts: false },	// 1 -> all false
	{ dtr: false, rts: true },
	{ dtr: false, rts: false },
	{ dtr: true, rts: false },
	{ dtr: false, rts: false }, // 4 -> release boot
];

// KD233: DTR is reset, RTS is boot(IO16)

export const enum BOOT_BUTTON_TYPE {
	RTS_IS_BOOT = 1, // kd233
	DTR_IS_BOOT = 2, // other
}

export enum BOOT_BOARD_TYPE {
	NORMAL = 1, // kflash.py
	FAST = 2, // IDE
}

export function getSerialPortIspSequence(type: BOOT_BOARD_TYPE, board: BOOT_BUTTON_TYPE) {
	if (type === BOOT_BOARD_TYPE.FAST) {
		return [
			getSerialPortNormalState(),
			getSerialPortResetState(board),
			getSerialPortNormalState(),
			getSerialPortBootState(board),
		];
	} else {
		return [
			getSerialPortNormalState(),
			getSerialPortResetBootState(),
			getSerialPortBootState(board),
			getSerialPortNormalState(),
		];
	}
}

export function getSerialPortNormalState(): SetOptions {
	return { dtr: false, rts: false };
}

export function getSerialPortResetState(type: BOOT_BUTTON_TYPE): SetOptions {
	if (type === BOOT_BUTTON_TYPE.RTS_IS_BOOT) {
		return { dtr: true, rts: false };
	} else {
		return { dtr: false, rts: true };
	}
}

export function getSerialPortResetBootState(): SetOptions {
	return { dtr: true, rts: true };
}

export function getSerialPortBootState(type: BOOT_BUTTON_TYPE): SetOptions {
	if (type === BOOT_BUTTON_TYPE.RTS_IS_BOOT) {
		return { dtr: false, rts: true };
	} else {
		return { dtr: true, rts: false };
	}
}

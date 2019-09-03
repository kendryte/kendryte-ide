import { ISerialRebootSequence } from 'vs/kendryte/vs/services/serialPort/common/type';

export const boardRebootSequence: ISerialRebootSequence = [
	{ dtr: false, rts: false },	// 1 -> all false
	{ dtr: true }, // 2 -> press reset
	{ dtr: false, rts: false }, // 4 -> release boot
];
export const boardRebootSequenceISP233 = [
	{ dtr: false, rts: false },	// 1 -> all false
	{ dtr: false, rts: true }, // 2 -> press reset
	{ dtr: true, rts: false }, // 3 -> press boot // 4 -> release reset
	{ dtr: false, rts: false }, // 4 -> release boot
];
export const boardRebootSequenceISPOther = [
	{ dtr: false, rts: false },	// 1 -> all false
	{ dtr: true }, // 2 -> press reset
	{ rts: true }, // 3 -> press boot
	{ dtr: false }, // 4 -> release reset
	{ dtr: false, rts: false }, // 4 -> release boot
];

export const garbageEvent = 'garbage';

export const quoteMark = '\xc0';
export const escapeMark = '\xdb';

export enum ISPOperation {
	ISP_ECHO = 0xC1,
	ISP_NOP = 0xC2,
	ISP_MEMORY_WRITE = 0xC3,
	ISP_MEMORY_READ = 0xC4,
	ISP_MEMORY_BOOT = 0xC5,
	ISP_DEBUG_INFO = 0xD1,
	ISP_FLASH_GREETING = 0xD2,
	ISP_FLASH_ERASE = 0xD3,
	ISP_FLASH_WRITE = 0xD4,
	ISP_REBOOT = 0xD5,
	ISP_DEBUG_CHANGE_BAUD_RATE = 0xD6,
	ISP_FLASH_SELECT = 0xD7,
}

export enum ISPError {
	ISP_RET_DEFAULT = 0,
	ISP_RET_OK = 0xE0,
	ISP_RET_BAD_DATA_LEN = 0xE1,
	ISP_RET_BAD_DATA_CHECKSUM = 0xE2,
	ISP_RET_INVALID_COMMAND = 0xE3,
	ISP_RET_BAD_INITIALIZATION = 0xE4,
}

export interface ISPMessage {
	op: ISPOperation;
}

export interface ISPResponse extends ISPMessage {
	err: ISPError;
	text: string;
}

export interface ISPRequest extends ISPMessage {
	buffer: Buffer;
	raw?: boolean;
}
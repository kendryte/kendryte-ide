import { escapeMark, quoteMark } from 'vs/kendryte/vs/workbench/serialPort/upload/node/bufferConsts';
import { BaseTransformStream } from 'vs/kendryte/vs/workbench/serialPort/upload/node/baseTransform';

const escapeMap: Map<string, string> = new Map();
escapeMap.set(escapeMark + '\xdd', escapeMark); // order is important
escapeMap.set(escapeMark + '\xdc', quoteMark);

export class EscapeBuffer extends BaseTransformStream<Buffer, string> {
	transform(str) {
		if (Buffer.isBuffer(str)) {
			str = str.toString('binary');
		}
		for (const [escaped, raw] of Array.from(escapeMap.entries()) as [string, string][]) {
			str = str.split(raw).join(escaped);
		}
		this.push(str);
	}
}

export class UnEscapeBuffer extends BaseTransformStream<string, Buffer> {
	protected buffer: Buffer;

	transform(str: string) {
		for (const [escaped, raw] of Array.from(escapeMap.entries()) as [string, string][]) {
			str = str.split(escaped).join(raw);
		}
		this.push(Buffer.from(str, 'binary'));
	}
}
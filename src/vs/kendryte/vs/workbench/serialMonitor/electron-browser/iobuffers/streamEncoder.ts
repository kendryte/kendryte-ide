import { chunkBuffer } from 'vs/kendryte/vs/base/node/chunkBuffer';
import { splitBuffer } from 'vs/kendryte/vs/base/node/splitBuffer';

export function createEncoder(encoding: string) {
	switch (encoding) {
		case 'hex':
		case 'utf8':
			return (data: Buffer): string => {
				return data.toString(encoding);
			};
		case 'hexasc':
			return hexascEncoder();
		case 'hexnewline':
			return (data: Buffer): string => {
				return splitBuffer(data, Buffer.from('\n'), true).map((buff) => {
					return buff.toString('hex');
				}).join('\r\n');
			};
		default: // 'binary'
			return (data: Buffer): string => {
				return data.toString('binary');
			};
	}
}

function hexascEncoder() {
	const LineMax = 16;
	const buff = Buffer.alloc(LineMax, 0);
	let bitr = 0;

	function hexdump(last: Buffer, len: number = last.length) {
		let left = '';
		let right = '';
		let itr: number;
		for (itr = 0; itr < len; itr++) {
			const c = last[itr];
			const cc = c.toString(16).toUpperCase();
			left += (cc.length === 1 ? '0' + cc : cc) + ' ';
			right += (0x1F < c && c < 0x80) ? String.fromCharCode(c) : '.';
		}
		for (; itr < LineMax; itr++) {
			left += '   ';
			right += ' ';
		}
		return `${left}  |${right}|`;
	}

	return (data: Buffer): string => {
		let ret: string[];
		// console.log(`%s + %s < %s ? `, bitr, data.length, LineMax, data.toString());
		if (bitr + data.length < LineMax) {
			bitr += data.copy(buff, bitr);
			// console.log(`A: bitr = ${bitr}`);
			return hexdump(buff, bitr) + '\r';
		} else if (bitr > 0) {
			const skip = data.copy(buff, bitr, 0, LineMax - bitr);
			data = data.slice(skip);
			ret = [hexdump(buff)];
			bitr = 0;
			// console.log(`B: skip = ${skip}`);
			// console.log(`B: ${ret[0]}`);
		} else {
			ret = [];
		}

		const views = chunkBuffer(data, LineMax);
		const last = views.pop() as Buffer;
		for (const view of views) {
			ret.push(hexdump(view));
		}

		// console.log(`C: ${last.length}`);
		if (last.length === LineMax) {
			ret.push(hexdump(last));
			// console.log(`C:`, hexdump(last));
			return ret.join('\r\n') + '\r\n';
		} else { // must <
			bitr = last.copy(buff);
			ret.push(hexdump(last, bitr));
			// console.log(`D: bitr = ${bitr}\nD:`, hexdump(last, bitr));
			return ret.join('\r\n') + '\r';
		}
	};
}



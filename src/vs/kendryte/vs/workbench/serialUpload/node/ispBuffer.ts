import { ISPRequest, ISPResponse } from 'vs/kendryte/vs/workbench/serialUpload/node/bufferConsts';
import { BaseTransformStream } from 'vs/kendryte/vs/workbench/serialUpload/node/baseTransform';
import crc32 = require('buffer-crc32');

function buffHex(buff: Buffer) {
	return buff.map((value) => {
		return value.toString(16).toUpperCase() as any;
	}).join('');
}

export function debugWriteBuffer(header: Buffer, data: Buffer) {
	let dumpBuff: string;
	if (data.length > 20) {
		dumpBuff = `<${buffHex(data.slice(0, 10))} ...${data.length}bytes... ${buffHex(data.slice(data.length - 10))}>`;
	} else {
		dumpBuff = `<${buffHex(data)}> (${data.length} bytes)`;
	}
	if (header.length === 4) {
		console.log(
			'>>> [op=%s|err=%s] %s',
			header.slice(0, 2).toString('HEX'),
			header.slice(2, 4).toString('HEX'),
			dumpBuff,
		);
	} else {
		console.log(
			'>>> [op=%s|err=%s|hash=%s] %s',
			header.slice(0, 2).toString('HEX'),
			header.slice(2, 4).toString('HEX'),
			header.slice(4, 8).toString('HEX'),
			dumpBuff,
		);
	}
}

export class ISPSerializeBuffer extends BaseTransformStream<ISPRequest, Buffer> {
	transform(req: ISPRequest) {
		const dataBase = req.raw ? 4 : 8;
		const header = Buffer.allocUnsafe(dataBase);
		header.writeUInt16LE(req.op, 0);
		header.writeUInt16LE(0, 2);

		if (!req.raw) {
			header.writeUInt32LE(crc32.unsigned(req.buffer), 4);
		}

		// debugWriteBuffer(header, req.buffer);

		this.push(Buffer.concat([header, req.buffer]));
	}
}

export class ISPParseBuffer extends BaseTransformStream<Buffer, ISPResponse> {
	transform(chunk: Buffer) {
		const op: ISPResponse = {
			op: chunk[0],
			err: chunk[1],
			text: chunk.slice(2).toString(),
		};
		this.push(op);
	}
}

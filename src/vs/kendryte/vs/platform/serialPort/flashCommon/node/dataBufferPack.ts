import { FourBytesReverser } from 'vs/kendryte/vs/platform/serialPort/flasher/node/fourBytesReverser';
import { streamToBuffer } from 'vs/kendryte/vs/base/node/collectingStream';

export async function flashDataBufferPack(stream: NodeJS.ReadableStream, reverse4Bytes: boolean): Promise<Buffer> {
	const source = reverse4Bytes ?
		stream.pipe(new FourBytesReverser()) :
		stream;
	return await streamToBuffer(source, true);
}

export async function flashDataBufferPackFastLoader(stream: NodeJS.ReadableStream, reverse4Bytes: boolean): Promise<Buffer> {
	const source = reverse4Bytes ?
		stream :
		stream.pipe(new FourBytesReverser());
	return await streamToBuffer(source, true);
}

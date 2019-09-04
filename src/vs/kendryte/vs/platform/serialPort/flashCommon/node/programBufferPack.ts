import { createCipheriv, createHash } from 'crypto';
import { drainStream } from 'vs/kendryte/vs/base/common/drainStream';

export async function flashProgramBufferPack(stream: NodeJS.ReadableStream, length: number, encryptionKey?: Buffer): Promise<Buffer> {
	const shaSize = 32;
	const headerIsEncryptSize = 1;
	const headerDataLenSize = 4;

	const AES_MAX_LARGER_SIZE = 16;

	let contentBuffer: Buffer;
	const headerSize = headerIsEncryptSize + headerDataLenSize; // isEncrypt(1bit) + appLen(4bit) + appCode
	if (encryptionKey) {
		const aesType = `aes-${encryptionKey.length}-cbc`;
		const encrypt = createCipheriv(aesType, encryptionKey, Buffer.allocUnsafe(16));
		contentBuffer = await drainStream(stream.pipe(encrypt), length + AES_MAX_LARGER_SIZE, headerSize, shaSize);
	} else {
		contentBuffer = await drainStream(stream, length, headerSize, shaSize);
	}

	// dataStartAt = headerSize
	const dataEndAt = contentBuffer.length - shaSize;
	const dataSize = contentBuffer.length - shaSize - headerSize;

	if (encryptionKey) {
		contentBuffer.writeUInt8(1, 0);
	} else {
		contentBuffer.writeUInt8(0, 0);
	}
	contentBuffer.writeUInt32LE(dataSize, 1);

	createHash('sha256').update(contentBuffer.slice(0, dataEndAt)).digest()
		.copy(contentBuffer, contentBuffer.length - shaSize);

	return contentBuffer;
}

export function packISPWritePackage(buff: Buffer, address: number) {
	const writeHeader = Buffer.allocUnsafe(8);
	writeHeader.writeUInt32LE(address, 0);
	writeHeader.writeUInt32LE(buff.length, 4);
	return Buffer.concat([writeHeader, buff]);
}

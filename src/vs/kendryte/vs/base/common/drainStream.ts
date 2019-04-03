export function drainStream(stream: NodeJS.ReadableStream, size: number, start: number = 0, extra: number = 0): Promise<Buffer> {
	// buff will alloc as start+size+extra, but return will always start+RealStreamSize+extra
	const buff = Buffer.allocUnsafe(start + size + extra);
	let cur = start;
	return new Promise<Buffer>((resolve, reject) => {
		stream.once('error', err => reject(err));
		stream.on('data', (data: Buffer) => {
			cur += data.copy(buff, cur);
		});
		stream.on('close', () => {
			resolve(buff.slice(0, cur + extra));
		});
	});
}
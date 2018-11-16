import { createHash } from 'crypto';

export function hashStream(stream: NodeJS.ReadableStream): Promise<string> {
	const hasher = createHash('md5');
	stream.pipe(hasher);
	
	return new Promise((resolve, reject) => {
		const wrappedCallback = (err, data) => err? reject(err) : resolve(data);
		hasher.on('error', reject);
		stream.on('error', reject);
		
		hasher.on('data', (data: Buffer) => {
			resolve(data.toString('hex').toLowerCase());
		});
	});
}
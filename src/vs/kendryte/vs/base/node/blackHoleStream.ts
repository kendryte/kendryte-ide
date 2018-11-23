import { Writable } from 'stream';

export class BlackHoleStream extends Writable {
	_write(chunk: Buffer, encoding: string, callback: (error?: Error | null) => void): void {
		callback();
	}
}

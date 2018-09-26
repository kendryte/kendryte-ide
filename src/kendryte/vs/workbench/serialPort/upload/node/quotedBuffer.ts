import { garbageEvent, quoteMark } from 'kendryte/vs/workbench/serialPort/upload/node/bufferConsts';
import { BaseTransformStream } from 'kendryte/vs/workbench/serialPort/upload/node/baseTransform';

export class QuotingBuffer extends BaseTransformStream<string, Buffer> {
	transform(chunk: string) {
		const buff = Buffer.from(`${quoteMark}${chunk}${quoteMark}`, 'binary');
		// console.log('>>> <%s>%s', buff.length, inspect(buff));

		// appendFileSync('X:/test-js.txt', '=======================\n' + buff.toString('hex') + '\n\n');

		this.push(buff);
	}
}

export class UnQuotedBuffer extends BaseTransformStream<Buffer, string> {
	protected lastBuffer: string;

	constructor(protected readonly quote = quoteMark) {
		super();
		this.lastBuffer = '';
	}

	transform(chunk: Buffer) {
		// console.log('<<< <%s>%s', chunk.length, inspect(chunk));
		const current = this.lastBuffer + chunk.toString('binary');

		let inQuote = false;
		let lastIndex = 0;
		for (let itr = current.indexOf(this.quote); itr !== -1; itr = current.indexOf(this.quote, lastIndex)) {
			inQuote = !inQuote;

			if (inQuote) {
				if (lastIndex !== itr) {
					this.emit(garbageEvent, current.slice(lastIndex, itr));
				}
			} else {
				this.push(current.slice(lastIndex, itr));
			}

			lastIndex = itr + 1;
		}

		if (inQuote) {
			this.lastBuffer = current.slice(lastIndex - 1); // must with quote
		} else if (lastIndex === current.length) {
			this.lastBuffer = '';
		} else {
			this.emit(garbageEvent, current.slice(lastIndex));
			this.lastBuffer = '';
		}
	}

	static test() {
		const x = new UnQuotedBuffer('"');
		let c = 0;
		x.on('data', (l) => {
			c++;
			return console.assert(l === 'aaa', 'simple data');
		});
		x.on(garbageEvent, (l) => {
			c++;
			console.assert(l === 'xxx' || l === 'yyy', 'simple garbage');
		});
		x.write('xxx"aaa"yyy');
		console.assert(c === 3, '3 test pass');

		const y = new UnQuotedBuffer('"');
		c = 0;
		y.on('data', (l) => {
			c++;
			console.assert(l === 'aaaAAAaaa', 'concat data');
		});

		y.write('xxx"aaa');
		y.write('AAA');
		y.write('aaa"yyy');
		console.assert(c === 1, '1 test pass');

		const z = new UnQuotedBuffer('"');
		c = 0;
		z.on('data', (l) => {
			c++;
			console.assert(l === 'aaa', 'multi data');
		});

		z.write('xxx"aaa""aaa"yyy');
		console.assert(c === 2, '2 test pass');
	}
}

// UnQuotedBuffer.test();

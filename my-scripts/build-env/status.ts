import { winSize } from './include';
import { Readable } from 'stream';
import { stringWidth } from '../build-env/stringWidth';

let currentLine = '';
let currentLineWidth = 0;
let CurrentColumn: number;

const outputStream = process.stderr;

function resizeHandler() {
	CurrentColumn = winSize() || 42;
	schedulePrint();
}

function clearLine() {
	outputStream.write('\r\x1BK');
}

let timePrint: NodeJS.Timer;

function schedulePrint() {
	if (!timePrint) {
		timePrint = setTimeout(() => {
			timePrint = null;
			print();
		}, 50);
	}
}

export async function cutStringWidth(original: string, to: number) {
	console.log('original = %s (%s)', original, stringWidth(original));
	let str = original;
	while (true) {
		const delta = stringWidth(str) - to;
		console.log('# delta = ', delta);
		if (delta === 0) {
			return str;
		}
		if (delta > 0) {
			console.log('# slice < %s => %s', delta, str.length - delta);
			str = original.slice(0, str.length - delta);
		} else if (delta < 0) {
			if (delta === -1) {
				const tmp = original.slice(0, str.length + 1);
				if (stringWidth(tmp) === to) {
					return tmp;
				} else {
					return str;
				}
			}
			console.log('# push  > %s => %s', Math.round(delta / 2), str.length - Math.round(delta / 2));
			str = original.slice(0, str.length - Math.round(delta / 2));
		}

		await new Promise((resolve, reject) => {
			setTimeout(resolve, 500);
		});
	}
}

function print() {
	// print some data to let displayCursor equals MIN( dataWidth, CurrentColumn )
	outputStream.write('\r\x1BK');

	if (currentLineWidth > CurrentColumn) {
		outputStream.write(cutStringWidth(currentLine, CurrentColumn - 3));
		outputStream.write('...');
	} else {
		outputStream.write(currentLine);
	}
	outputStream.write('\r');
}

let listening = false;

function stopListeners() {
	clearLine();
	process.removeListener('exit', clearLine);
	process.removeListener('SIGWINCH', resizeHandler);
	process.stderr.removeListener('resize', resizeHandler);
	process.stdout.removeListener('resize', resizeHandler);
}

function startListeners() {
	if (listening) {
		throw new Error('not support multiple progress');
	}
	listening = true;
	resizeHandler();
	process.on('SIGWINCH', resizeHandler);
	process.stderr.on('resize', resizeHandler);
	process.stdout.on('resize', resizeHandler);
	process.on('exit', clearLine);
}

const nl = Buffer.from('\n');

export function handleStream(stream: Readable) {
	startListeners();

	stream.on('end', () => {
		stopListeners();
	});

	stream.on('data', (data: Buffer) => {
		const lastLine = data.lastIndexOf(nl);
		if (lastLine === -1) {
			currentLine += data.toString('utf8');
		} else {
			currentLine = data.slice(lastLine).toString('utf8');
		}
		currentLineWidth = stringWidth(currentLine);
		schedulePrint();
	});
}
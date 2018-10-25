import { winSize } from './include';

process.stdin.on('end', (f) => {
	console.log('# end');
	process.stderr.end(f, () => {
		process.exit(0);
	});
});

const MAX_LINE = 1024;
let CurrentColumn = winSize() || 42;
let cursor = 0;

let lineBuffer: Buffer = Buffer.alloc(MAX_LINE, ' ');
let currentDataPos = 0;

function resizeHandler(why: string) {
	CurrentColumn = winSize() || 42;
	console.log('# ' + why + ' -> ', CurrentColumn);
	clearLine();
	print(lineBuffer);
}

function appendCurrentLine(data: Buffer) {
	if (currentDataPos >= MAX_LINE) {
		return;
	}
	cursor += data.copy(lineBuffer, currentDataPos);
	print(data);
}

function print(data: Buffer) {
	const newCursor = cursor + data.length;
	if (newCursor >= CurrentColumn - 4) {
		process.stderr.write(data.slice(0, CurrentColumn - 4 - cursor));
		process.stderr.write('...');
		cursor = CurrentColumn;
	} else {
		process.stderr.write(data);
		cursor = newCursor;
	}
}

function clearLine() {
	cursor = 0;
	process.stderr.write('\r\x1BK');
}

function flushLine() {
	lineBuffer.fill(' ');
	currentDataPos = 0;
	clearLine();
}

const nl = Buffer.from('\n');
process.stdin.on('data', (data: Buffer) => {
	process.stderr.write(data);
	const lastLine = data.lastIndexOf(nl);
	if (lastLine === -1) {
		return appendCurrentLine(data);
	} else {
		flushLine();
		return appendCurrentLine(data);
	}
});

console.log('# size -> ', CurrentColumn);

process.on('SIGWINCH', () => resizeHandler('SIGWINCH'));
process.stderr.on('resize', () => resizeHandler('stderr.resize'));
process.stdout.on('resize', () => resizeHandler('stdout.resize'));

process.stdin.pipe(process.stdout);

process.on('exit', clearLine);

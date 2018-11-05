export function switchQuitKey() {
	process.on('SIGINT', () => {
		process.stderr.write('\r\x1BKPress Ctrl+K to quit.\n');
	});

	console.log('\n\x1B[38;5;14m!!! Press Ctrl+K instead of Ctrl+C to stop this. !!!\x1B[0m');

	process.stdin.on('data', (data: Buffer) => {
		if (data.length === 1 && data[0] === 0x0B) {
			process.exit(0);
		}
	});
}
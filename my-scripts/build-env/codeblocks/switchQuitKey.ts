export function switchQuitKey() {
	process.stdin.setRawMode(true);
	process.stdin.on('data', (data: Buffer) => {
		if (data.length === 1 && data[0] === 0x0B) {
			process.stdin.setRawMode(false);
			process.exit(0);
		}
		if (data.length === 1 && data[0] === 0x03) {
			process.stderr.write('\r\n\x1B[38;5;14mPress Ctrl+K to quit.\x1B[0m\n\n');
		}
	});
	
	console.log('\n\x1B[38;5;14m!!! Press Ctrl+K instead of Ctrl+C to stop this. !!!\x1B[0m');
}

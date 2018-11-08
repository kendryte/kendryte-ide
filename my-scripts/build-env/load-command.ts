import { resolve } from 'path';

Error.stackTraceLimit = Infinity;

const command = process.argv.splice(2, 1)[0];
process.argv.splice(1, 1, resolve(__dirname, '../commands', command + '.js'));

try {
	require(process.argv[1]);
} catch (e) {
	const parsedTrace = e.stack.split('\n').slice(1).filter((line) => {
		return line.includes('(/') || line.includes('(\\');
	}).map((e) => {
		return e.replace(process.env.VSCODE_ROOT, '.');
	}).join('\n');
	console.error('\x1B[2m%s\x1B[0m', parsedTrace);
	
	console.error('Failed to run %s.', command);
	console.error('  Error when first event loop: %s.', e.message);
	console.error('Did you run prepare-release?', e.message);
	process.exit(1);
}

import { resolve } from 'path';
import { currentCommand } from './misc/help';

try {
	require('source-map-support/register');
} catch (e) {
}

Error.stackTraceLimit = Infinity;

const command = process.argv.splice(2, 1)[0];
process.argv.splice(1, 1, resolve(__dirname, '../commands', command + '.js'));

console.error('\x1B]0;%s\x07', command.toUpperCase() + ' :: Kendryte IDE');

try {
	require(process.argv[1]);
	console.error('\x1B]0;%s\x07', currentCommand().title + ' :: Kendryte IDE');
} catch (e) {
	const parsedTrace = e.stack.split('\n').slice(1).filter((line) => {
		return line.includes('(/') || line.includes('(\\');
	}).map((e) => {
		return e.replace(process.env.VSCODE_ROOT, '.');
	}).join('\n');
	console.error('\x1B[2m%s\x1B[0m', parsedTrace);
	
	console.error('Failed to run %s.', command);
	console.error('  Error when first event loop:\n  %s.', e.stack);
	process.exit(1);
}

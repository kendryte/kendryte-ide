require('source-map-support/register');

console.error('\n[kendryte debug] debugger protocol.');
process.title = 'gdb';

Object.assign(global, {
	DIE(e: Error) {
		console.error('Fatal Error: ', e ? e.stack || e.message || e : 'No Information');
		process.exit(1);
	},
});

require('./gdb');

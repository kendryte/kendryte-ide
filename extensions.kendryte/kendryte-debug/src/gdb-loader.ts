require('source-map-support/register');

console.error('\n[kendryte debug] debugger protocol.');
console.error('\n * '+process.argv.join('\n * '));
process.title = 'gdb-session';

Object.assign(global, {
	DIE(e: Error) {
		console.error('Fatal Error: ', e ? e.stack || e.message || e : 'No Information');
		process.exit(1);
	},
});

require('./gdb');

import { existsSync, lstatSync, unlinkSync } from 'fs';
import { sync as rimrafSync } from 'rimraf';

if (existsSync('./node_modules') && lstatSync('./node_modules').isSymbolicLink()) {
	console.log('unlink node_modules');
	try {
		unlinkSync('./node_modules');
	} catch (e) {
		console.error('Cannot remove node_modules maybe using?');
		console.error(e.message);
		process.exit(1);
	}
}
if (existsSync('./node_modules.asar.unpacked') && lstatSync('./node_modules.asar.unpacked').isDirectory()) {
	console.log('unlink node_modules.asar.unpacked');
	try {
		rimrafSync('./node_modules.asar.unpacked');
	} catch (e) {
		console.error('Cannot remove node_modules.asar.unpacked maybe using?');
		console.error(e.message);
		process.exit(1);
	}
}

if (existsSync('./node_modules.asar') && lstatSync('./node_modules.asar').isFile()) {
	console.log('remove node_modules.asar');
	try {
		unlinkSync('./node_modules.asar');
	} catch (e) {
		console.error('Cannot remove node_modules.asar maybe using?');
		console.error(e.message);
		process.exit(1);
	}
}

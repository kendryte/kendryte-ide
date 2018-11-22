import { readdirSync, readFileSync } from 'fs';
import { platform } from 'os';
import { resolve } from 'path';
import { helpTip, whatIsThis } from './misc/help';

process.argv.push('--what-is-this');

const extract = /^whatIsThis\(.+\);/m;

helpTip('show-help', 'print this');

const base = resolve(__dirname, '../commands');
readdirSync(base).forEach((file) => {
	if (!file.endsWith('.ts')) {
		return;
	}
	
	const content = readFileSync(resolve(base, file), 'utf8');
	const match = extract.exec(content);
	if (!match) {
		return;
	}
	
	const fn = new Function('whatIsThis', '__filename', match[0]);
	try {
		fn(whatIsThis, file.replace(/\.ts$/, '.js'));
	} catch (e) {
		whatIsThis(file.replace(/\.ts$/, '.js'), e.message);
	}
});
if (platform() === 'win32') {
	helpTip('fork', 'Open new window like this');
}

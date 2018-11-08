import { readdirSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { isWin } from './misc/constants';
import { helpTip, whatIsThis } from './misc/help';

process.argv.push('--what-is-this');

const extract = /\bwhatIsThis\(.+\);/;

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
if (isWin) {
	helpTip('fork', 'Open new window like this');
}

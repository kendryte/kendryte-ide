import { createWriteStream, existsSync, readdirSync, readFileSync, unlinkSync } from 'fs';
import { ensureDirSync } from 'fs-extra';
import { platform } from 'os';
import { resolve } from 'path';
import { PassThrough } from 'stream';
import { helpPrint, helpStringCache, whatIsThis } from './misc/help';

process.argv.push('--what-is-this');

if (existsSync(helpStringCache())) {
	process.stderr.write(readFileSync(helpStringCache()));
	process.exit(0);
}

ensureDirSync(process.env.TEMP);
const out = helpPrint(new PassThrough());
const cacheFile = helpStringCache();
if (existsSync(cacheFile)) {
	unlinkSync(cacheFile);
}
out.pipe(createWriteStream(cacheFile));
out.pipe(process.stderr);

whatIsThis('Print this', '显示这些提示', 'show-help');
const base = resolve(__dirname, '../commands');
readdirSync(base).forEach((file) => {
	if (!file.endsWith('.ts')) {
		return;
	}
	
	try {
		require(resolve(__dirname, '../commands', file.replace(/\.ts$/, '.js')));
	} catch (e) {
		whatIsThis(file.replace(/\.ts$/, ''), e.message, 'Unknown');
	}
});

if (platform() === 'win32') {
	whatIsThis('Open new window like this', '打开一个新窗口', 'fork');
}

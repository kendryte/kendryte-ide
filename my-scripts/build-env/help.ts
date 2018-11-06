import { readdirSync } from 'fs';
import { resolve } from 'path';
import { helpTip } from './misc/myBuildSystem';

process.argv.push('--what-is-this');

const base = resolve(__dirname, '../commands');
readdirSync(base).forEach((file) => {
	if (file.endsWith('.js')) {
		require(resolve(base, file));
	}
});
helpTip('fork', 'Open new window like this');

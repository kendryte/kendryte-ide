import { basename } from 'path';

export function WIT() {
	return process.argv.includes('--what-is-this');
}

export function helpTip(cmd: string, msg: string) {
	console.log('\x1B[48;5;0;1m * \x1B[38;5;14m%s\x1B[0;48;5;0m - %s.', cmd, msg);
}

export function whatIsThis(self: string, title: string) {
	if (WIT()) {
		helpTip(basename(self, '.js'), title);
	}
}

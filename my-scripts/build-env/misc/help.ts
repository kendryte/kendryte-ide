import { execSync } from 'child_process';
import { resolve } from 'path';
import { format } from 'util';
import { isWin, UILanguage } from './constants';

export function WIT() {
	return process.argv.includes('--what-is-this');
}

let defaultOutput: NodeJS.WritableStream = process.stderr;

export function helpPrint<T extends NodeJS.WritableStream>(out: T): T {
	return defaultOutput = out;
}

function toPrintHelp() {
	process.on('beforeExit', () => {
		setTimeout(() => {
			process.exit(0);
		}, 1000);
		
		defaultOutput.write('\n\n');
		for (const list of registry.values()) {
			if (!list.length) {
				continue;
			}
			const [en, cn] = cates[list[0].category] || cates.unknown;
			defaultOutput.write(format('\x1B[48;5;0;1m[\x1B[38;5;10m%s\x1B[0;48;5;0;1m]\n', isZh? cn : en));
			for (const {file, title} of list) {
				defaultOutput.write(format('\x1B[48;5;0;1m * \x1B[38;5;14m%s\x1B[0;48;5;0m - %s.\n', file, title));
			}
		}
		defaultOutput.write('\n');
	});
}

interface WhatIsThis {
	file: string;
	title: string;
	category: string;
}

let isZh: boolean = null;
let registry = new Map<string, WhatIsThis[]>();

function stack() {
	const frame = /([^\/]+)\.[j|t]s:/.exec((new Error).stack.split('\n', 4).pop());
	if (!frame) {
		console.error((new Error).stack.split('\n', 4).slice(1));
		throw new Error('Cannot detect stack frame');
	}
	return frame[1];
}

const cates = {
	unknown: ['No Category', '未分类'],
	packages: ['Component Packages', '三方组件包'],
	pm: ['Package Manager', '包管理器'],
	release: ['Releasing', '发布'],
	start: ['Local Development', '本地开发调试'],
	test: ['Test', '测试'],
	tool: ['Misc', '工具'],
};

let firstWhat: WhatIsThis = {
	file: 'unknown-command',
	title: 'Unknown Command',
	category: 'unknown',
};

export function currentCommand() {
	return firstWhat;
}

export function whatIsThis(en: string, cn: string, file: string = stack()) {
	if (isZh === null) {
		if (isWin) {
			isZh = execSync('powershell.exe -Command Get-UICulture', {encoding: 'utf8'}).toLowerCase().includes('zh');
		} else {
			isZh = UILanguage.includes('zh');
		}
	}
	let category = (/^[^-]+/.exec(file) || ['unknown'])[0];
	if (!cates[category]) {
		category = 'unknown';
	}
	const title = isZh? cn : en;
	const data = {
		title,
		category,
		file,
	};
	
	if (firstWhat.file === 'unknown-command') {
		firstWhat = data;
	}
	
	if (WIT()) {
		toPrintHelp();
		if (!registry.has(category)) {
			registry.set(category, []);
		}
		registry.get(category).push(data);
	}
}

export function helpStringCache() {
	return resolve(process.env.TEMP, 'help.txt');
}

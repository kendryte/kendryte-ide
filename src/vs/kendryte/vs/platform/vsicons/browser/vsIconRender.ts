import 'vs/css!./icons/style';
import { $ } from 'vs/base/browser/dom';

export function vsicon(name: string) {
	const ico = $('span');
	ico.className = 'visualstudio-icon ' + name;
	return ico;
}

export function vsiconClass(name: string) {
	return 'visualstudio-icon ' + name;
}

export function vscodeIcon(name: string) {
	const ico = $('span');
	ico.className = 'vscode-icon ' + name;
	return ico;
}

export function vscodeIconClass(name: string) {
	return 'vscode-icon ' + name;
}
import { ColorMap } from 'vs/workbench/parts/maix/fpioa-config/electron-browser/editor/right/abstract';
import { $, addClass, append } from 'vs/base/browser/dom';
import { CountBadge } from 'vs/base/browser/ui/countBadge/countBadge';
import { Color } from 'vs/base/common/color';

export interface ICellStyle extends ColorMap {
	funcBackground: Color;
	funcForeground: Color;
	funcBorder: Color;
}

export class CellRender {
	private $h3: HTMLElement;
	private $fnContainer: HTMLElement;
	private functionBadge: CountBadge;

	constructor($parent: HTMLTableDataCellElement) {
		addClass($parent, 'IO');
		this.$h3 = append($parent, $('h3'));
		this.$fnContainer = append($parent, $('div.functions'));
	}

	set title(value: string) {
		this.$h3.innerText = value;
	}

	get title() {
		return this.$h3.innerText;
	}

	setFunction(fnName: string) {
		this.$fnContainer.innerHTML = '';
		this.$fnContainer.title = fnName;
		this.functionBadge = new CountBadge(this.$fnContainer, { countFormat: fnName });
	}

	style(colors: ICellStyle) {
		if (this.functionBadge) {
			this.functionBadge.style({
				badgeBackground: colors.funcBackground,
				badgeForeground: colors.funcForeground,
				badgeBorder: colors.funcBorder,
			});
		}
	}

	clean() {
		if (this.functionBadge) {
			this.$fnContainer.innerHTML = '';
			delete this.functionBadge;
		}
	}
}
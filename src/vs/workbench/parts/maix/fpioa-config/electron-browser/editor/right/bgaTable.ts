import { $, addClass, addClasses, append } from 'vs/base/browser/dom';
import { stringifyPin } from 'vs/workbench/parts/maix/fpioa-config/common/builder';
import { AbstractTableRender, ColorMap, grid } from 'vs/workbench/parts/maix/fpioa-config/electron-browser/editor/right/abstract';
import { memoize } from 'vs/base/common/decorators';
import { IColorMapping } from 'vs/platform/theme/common/styler';
import { badgeBackground, badgeForeground, contrastBorder } from 'vs/platform/theme/common/colorRegistry';
import { CellRender } from 'vs/workbench/parts/maix/fpioa-config/electron-browser/editor/right/cell';

export type BGAPinList = Map<string, CellRender>;

export class BGATableRender extends AbstractTableRender<BGAPinList> {
	private $trList: HTMLElement[];

	@memoize
	get styleMap(): IColorMapping {
		return {
			funcBackground: badgeBackground,
			funcForeground: badgeForeground,
			funcBorder: contrastBorder,
		};
	}

	frameStyle(colors: ColorMap) {

	}

	layout(size: number) {
		super.layout(size);

		const $list = this.$trList.slice(1, this.$trList.length - 1);
		const titleHeight = this.$trList[0].clientHeight + this.$trList[this.$trList.length - 1].clientHeight;

		const eachLine = ((size - titleHeight) / $list.length) + 'px';
		$list.forEach($tr => {
			$tr.style.height = eachLine;
		});
	}

	createTableTemplate(): BGAPinList {
		const cellList = new Map<string, CellRender>();

		const { x, y } = this.chip.geometry.maxPin;
		const base = this.chip.ROW;

		const L = 0, T = 0, R = x + 1, B = y + 1;
		const IL = 1, IT = 1, IR = x, IB = y;

		const tData: HTMLTableDataCellElement[][] = [];
		for (let r = T; r <= B; r++) {
			tData.push([]);
		}

		tData[T][L] = this.createCellHeader(['left', 'top'], '');
		tData[B][L] = this.createCellHeader(['left', 'bottom'], '');
		tData[T][R] = this.createCellHeader(['right', 'top'], '');
		tData[B][R] = this.createCellHeader(['right', 'bottom'], '');

		for (let c = IL; c <= IR; c++) { // first last line
			tData[T][c] = this.createCellHeader(['top', grid(c, 'col')], c.toString());
			tData[B][c] = this.createCellHeader(['bottom', grid(c, 'col')], c.toString());
		}
		for (let r = IT; r <= IB; r++) { // first last column
			const Key = base.fromBase10(r);
			tData[r][L] = this.createCellHeader(['left', grid(r, 'row')], Key);
			tData[r][R] = this.createCellHeader(['right', grid(r, 'row')], Key);
		}

		for (let c = IL; c <= IR; c++) {
			for (let r = IT; r <= IB; r++) {
				const [$td, cell] = this.createCellData(c, r);

				tData[r][c] = $td;
				if (cell) {
					cellList.set(cell.id, cell);
					// this._register(cell.click);
				}
			}
		}

		this.$trList = tData.map(($tds) => {
			const $tr = append(this.$table, $('tr'));
			append($tr, ...$tds);
			return $tr;
		});

		return cellList;
	}

	private createCellData(x: number, y: number): [HTMLTableDataCellElement, CellRender] {
		const pinPos = stringifyPin(this.chip.ROW, { x, y });
		const ioNum = this.chip.geometry.IOPinPlacement[pinPos];

		const $td = $('td') as HTMLTableDataCellElement;
		let cell: CellRender;

		addClasses($td, grid(y, 'row'), grid(x, 'col'), 'pin');

		if (typeof ioNum === 'number') {
			cell = new CellRender($td, { x, y });
			cell.title = 'IO_' + ioNum.toString();
		} else {
			addClass($td, 'ignored');
		}

		return [$td, cell];
	}

	private createCellHeader(classes: string[], text: string): HTMLTableHeaderCellElement {
		const ret = $('th') as HTMLTableHeaderCellElement;

		addClasses(ret, ...classes);
		ret.innerText = text;

		return ret;
	}
}

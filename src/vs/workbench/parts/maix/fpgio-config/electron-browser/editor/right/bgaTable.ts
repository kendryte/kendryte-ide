import { $, addClass, addClasses, append } from 'vs/base/browser/dom';
import { IPin, IPin2DNumber } from 'vs/workbench/parts/maix/fpgio-config/common/packagingTypes';
import { normalizePin, stringifyPin } from 'vs/workbench/parts/maix/fpgio-config/common/builder';
import { AbstractTableRender, CellRender, grid } from 'vs/workbench/parts/maix/fpgio-config/electron-browser/editor/right/abstract';

export interface ITableCell {
	title: string;
}

export class BGATableRender extends AbstractTableRender {
	protected readonly cellList = new Map<IPin2DNumber, ITableCell>();

	_set(pin: IPin, data: string) {
		this.cellList.get(normalizePin(this.chip.ROW, pin)).title = data;
	}

	createTableTemplate() {
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
					this.cellList.set({ x: c, y: r }, cell);
					// this._register(cell.click);
				}
			}
		}

		tData.forEach(($tds) => {
			const $tr = append(this.$table, $('tr'));
			append($tr, ...$tds);
		});
	}

	private createCellData(x: number, y: number): [HTMLTableDataCellElement, ITableCell] {
		const pinPos = stringifyPin(this.chip.ROW, { x, y });
		const ioNum = this.chip.geometry.IOPinPlacement[pinPos];

		const $td = $('td') as HTMLTableDataCellElement;
		let cell: ITableCell;

		addClasses($td, grid(y, 'row'), grid(x, 'col'), 'pin');

		if (typeof ioNum === 'number') {
			$td.setAttribute('x', x.toString());
			$td.setAttribute('y', y.toString());
			cell = this.renderIO($td, ioNum);
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

	private renderIO($td: HTMLTableDataCellElement, ioNum: number) {
		const ret = new CellRender($td);
		ret.title = 'IO_' + ioNum.toString();
		return ret;
	}
}
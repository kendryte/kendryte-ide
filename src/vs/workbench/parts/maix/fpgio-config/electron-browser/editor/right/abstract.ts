import { $, addClass, addClasses, append } from 'vs/base/browser/dom';
import { Disposable } from 'vs/base/common/lifecycle';
import { IChipPackagingCalculated, IPin } from 'vs/workbench/parts/maix/fpgio-config/common/packagingTypes';
import { ITableCell } from 'vs/workbench/parts/maix/fpgio-config/electron-browser/editor/right/bgaTable';

export interface ChipTableCreator {
	new(chip: IChipPackagingCalculated): AbstractTableRender;
}

export abstract class AbstractTableRender extends Disposable {
	protected $table: HTMLTableElement;

	protected chip: IChipPackagingCalculated;
	public readonly chipName: string;
	private hasRendered: boolean = false;

	public abstract _set(pin: IPin, data: string);

	protected abstract createTableTemplate();

	constructor(chip: IChipPackagingCalculated) {
		super();

		this.chip = chip;
		this.chipName = chip.name;

		this.$table = $('table');

		addClasses(this.$table, chip.name, 'chip-table');
		this.$table.style.tableLayout = 'fixed';
	}

	render(element: HTMLElement) {
		if (!this.hasRendered) {
			this.hasRendered = true;
			this.createTableTemplate();
		}

		append(element, this.$table);
	}

	show(show: boolean = true) {
		if (show) {
			this.$table.style.display = 'table';
		} else {
			this.$table.style.display = 'none';
		}
	}
}

export class CellRender implements ITableCell {
	private $h3: HTMLElement;

	constructor($parent: HTMLTableDataCellElement) {
		addClass($parent, 'IO');
		this.$h3 = append($parent, $('h3'));
	}

	set title(value: string) {
		this.$h3.innerText = value;
	}

	get title() {
		return this.$h3.innerText;
	}
}

export function grid(num: number, type: 'col' | 'row') {
	return type + '-' + (num % 2 === 0 ? 'even' : 'odd');
}

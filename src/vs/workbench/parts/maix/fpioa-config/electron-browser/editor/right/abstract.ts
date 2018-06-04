import { $, addClasses, append } from 'vs/base/browser/dom';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { IChipPackagingCalculated, IPin, IPin2DNumber } from 'vs/workbench/parts/maix/fpioa-config/common/packagingTypes';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { attachStyler, IColorMapping } from 'vs/platform/theme/common/styler';
import { Color } from 'vs/base/common/color';
import { normalizePin } from 'vs/workbench/parts/maix/fpioa-config/common/builder';
import { CellRender } from 'vs/workbench/parts/maix/fpioa-config/electron-browser/editor/right/cell';
import { IFuncPinMap } from 'vs/workbench/parts/maix/fpioa-config/common/types';

export interface ChipTableCreator {
	new(chip: IChipPackagingCalculated): AbstractTableRender<any>;
}

export interface IEachDisposable {
	forEach(callback: (item: IDisposable) => void): void;
}

export interface IEach<T> {
	forEach(callback: (item: T) => void): void;
}

export interface ColorMap {
	[p: string]: Color;
}

export abstract class AbstractTableRender<T extends IEach<CellRender>> extends Disposable {
	protected $table: HTMLTableElement;

	protected chip: IChipPackagingCalculated;
	public readonly chipName: string;
	private hasRendered: boolean = false;

	private _cellList: T;

	private styleAttached = false;

	protected abstract readonly styleMap: IColorMapping; // only for overwrite

	protected abstract createTableTemplate(): T;

	protected abstract _getPin(list: T, pin: IPin2DNumber): CellRender;

	protected abstract frameStyle(colors: ColorMap);

	constructor(chip: IChipPackagingCalculated, protected themeService: IThemeService) {
		super();

		this.chip = chip;
		this.chipName = chip.name;

		this.$table = $('table');

		addClasses(this.$table, chip.name, 'chip-table');
		this.$table.style.tableLayout = 'fixed';
	}

	style(colors: ColorMap) {
		this._cellList.forEach(item => item.style(colors as any));
		this.frameStyle(colors);
	}

	layout(size: number) {
		this.$table.style.height = size + 'px';
		this.$table.style.width = size + 'px';
	}

	setFuncMap(currentFuncMap: IFuncPinMap) {
		this._cellList.forEach((cell) => {
			cell.clean();
		});
		Object.keys(currentFuncMap).forEach((funId) => {
			const pin = currentFuncMap[funId];
			try {
				const cell = this.getPin(pin);
				cell.setFunction(funId);
			} catch (e) {
				console.error('Set %s:%s Error [%s]', JSON.stringify(pin), funId, e.message);
			}
		});
	}

	render(element: HTMLElement) {
		if (!this.hasRendered) {
			this.hasRendered = true;
			this.disposeCells();
			this._cellList = this.createTableTemplate();
			// todo: actions
		}

		append(element, this.$table);

		if (!this.styleAttached) {
			this._register(attachStyler(this.themeService, this.styleMap, this));
			this.styleAttached = true;
		}
	}

	show(show: boolean = true) {
		if (show) {
			this.$table.style.display = 'table';
		} else {
			this.$table.style.display = 'none';
		}
	}

	getPin(pin: IPin) {
		return this._getPin(this._cellList, normalizePin(this.chip.ROW, pin));
	}

	dispose() {
		super.dispose();
		this.disposeCells();
	}

	disposeCells() {
		/*
		if (this._cellList) {
			this._cellList.forEach(e => e.dispose());
		}
		*/
	}
}

export function grid(num: number, type: 'col' | 'row') {
	return type + '-' + (num % 2 === 0 ? 'even' : 'odd');
}

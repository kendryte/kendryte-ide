import { $, addClasses, addDisposableListener, append } from 'vs/base/browser/dom';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { IChipPackagingCalculated, IPin, IPin2DNumber } from 'vs/workbench/parts/maix/fpioa-config/common/packagingTypes';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { attachStyler, IColorMapping } from 'vs/platform/theme/common/styler';
import { Color } from 'vs/base/common/color';
import { normalizePin, stringifyPin } from 'vs/workbench/parts/maix/fpioa-config/common/builder';
import { CellRender } from 'vs/workbench/parts/maix/fpioa-config/electron-browser/editor/right/cell';
import { IFuncPinMap } from 'vs/workbench/parts/maix/fpioa-config/common/types';
import { ContextMenuEvent } from 'vs/base/parts/tree/browser/tree';
import { Emitter } from 'vs/base/common/event';

export interface ChipTableCreator {
	new(chip: IChipPackagingCalculated): AbstractTableRender<any>;
}

export interface IEachDisposable {
	forEach(callback: (item: IDisposable) => void): void;
}

export interface IEach<T> {
	forEach(callback: (item: T) => void): void;

	get(id: string): T;
}

export interface ColorMap {
	[p: string]: Color;
}

export interface ContextMenuData {
	dom: HTMLTableDataCellElement;
	pin: IPin2DNumber;
	pinName: string;
	ioNum: number;
}

export abstract class AbstractTableRender<T extends IEach<CellRender>> extends Disposable {
	protected $table: HTMLTableElement;

	protected chip: IChipPackagingCalculated;
	public readonly chipName: string;
	private hasRendered: boolean = false;

	private _cellList: T;

	private readonly _onContextMenu = new Emitter<ContextMenuData>();
	public readonly onContextMenu = this._onContextMenu.event;

	protected abstract readonly styleMap: IColorMapping; // only for overwrite

	protected abstract createTableTemplate(): T;

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
			this._cellList = this.createTableTemplate();
			this.hasRendered = true;
		}

		this.dispose();

		this.show(true);
		append(element, this.$table);

		this._register(attachStyler(this.themeService, this.styleMap, this));

		this._register(addDisposableListener(this.$table, 'contextmenu', (event: ContextMenuEvent) => {
			let dom = event.target;
			while (true) {
				if (dom.tagName === 'TD') {
					break;
				}
				if (dom === this.$table || !dom.parentElement) {
					return;
				}
				dom = dom.parentElement;
			}
			const id: string = dom.getAttribute('pinId');
			if (!id) { // click on info area or empty pin
				return;
			}
			const obj = this._cellList.get(id);

			const pinLocName = stringifyPin(this.chip.ROW, obj.pin);
			const io = this.chip.geometry.IOPinPlacement[pinLocName];

			this._onContextMenu.fire({
				dom: obj.$cell,
				pin: obj.pin,
				pinName: pinLocName,
				ioNum: io,
			});
		}));
	}

	show(show: boolean = true) {
		if (show) {
			this.$table.style.display = 'table';
		} else {
			this.$table.style.display = 'none';
		}
	}

	getPin(pin: IPin) {
		pin = normalizePin(this.chip.ROW, pin);
		return this._cellList.get(`x:${pin.x}y:${pin.y}`);
	}

	dispose() {
		if (this.$table.parentElement) {
			this.$table.parentElement.removeChild(this.$table);
		}
		this.show(false);
		super.dispose();
		this.disposeCells();
		this.hasRendered = false;
	}

	disposeCells() {
		// if (this._cellList) {
		// 	this._cellList.forEach(e => e.dispose());
		// }
	}
}

export function grid(num: number, type: 'col'|'row') {
	return type + '-' + (num % 2 === 0? 'even' : 'odd');
}

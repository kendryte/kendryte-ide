import { $, addClass, addDisposableListener, append } from 'vs/base/browser/dom';
import { Color } from 'vs/base/common/color';
import { IPin2DNumber } from 'vs/kendryte/vs/workbench/fpioaConfig/common/packagingTypes';
import { ColorMap, ContextMenuData } from 'vs/kendryte/vs/workbench/fpioaConfig/common/types';
import { Disposable } from 'vs/base/common/lifecycle';
import { Emitter } from 'vs/base/common/event';
import { StandardMouseEvent } from 'vs/base/browser/mouseEvent';

export interface ICellStyle extends ColorMap {
	funcBackground: Color;
	funcForeground: Color;
	funcBorder: Color;
}

export class CellRender extends Disposable {
	private $label: HTMLElement;

	private _pinLocation: string;
	private _ioName?: string;
	private _funcLabel?: string;

	private readonly _onContextMenu = new Emitter<ContextMenuData>();
	public readonly onContextMenu = this._onContextMenu.event;

	constructor(public readonly $cell: HTMLTableDataCellElement, public readonly pin: IPin2DNumber) {
		super();
		$cell.setAttribute('x', pin.x.toString());
		$cell.setAttribute('y', pin.y.toString());
		addClass($cell, 'IO');
		this.$label = append($cell, $('div.label'));

		this._register(addDisposableListener(this.$cell, 'contextmenu', (event: MouseEvent) => {

			const mouseEvent = new StandardMouseEvent(event);

			this._onContextMenu.fire({
				pinName: this._pinLocation,
				pointer: { x: mouseEvent.posx, y: mouseEvent.posy },
			});
		}));
	}

	style(color: ColorMap) {
		// is this needed?
	}

	getPinLocation() {
		return this._pinLocation;
	}

	getIoName() {
		return this._ioName;
	}

	setPinInformation(location: string, ioName: string | number | undefined) {
		this._pinLocation = location;
		this._ioName = '' + ioName;
		this._updateDisplay();
	}

	getFunction() {
		return this._funcLabel;
	}

	setFunction(label?: string) {
		this._funcLabel = label;
		this._updateDisplay();
	}

	private _updateDisplay() {
		if (this._funcLabel) {
			this.$label.innerText = this._funcLabel;
			this.$cell.title = `${this._funcLabel}\nIO: ${this._ioName} (${this._pinLocation})`;
		} else if (this._ioName) {
			this.$label.innerText = this._ioName;
			this.$cell.title = `${this._ioName}\n${this._pinLocation}`;
		}
	}
}

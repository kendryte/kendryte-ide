import { $, addClass, addDisposableListener, append } from 'vs/base/browser/dom';
import { CountBadge } from 'vs/base/browser/ui/countBadge/countBadge';
import { Color } from 'vs/base/common/color';
import { IPin2DNumber } from 'vs/kendryte/vs/workbench/fpioaConfig/common/packagingTypes';
import { ColorMap, ContextMenuData, ID_NO_FUNCTION } from 'vs/kendryte/vs/workbench/fpioaConfig/common/types';
import { Disposable } from 'vs/base/common/lifecycle';
import { Emitter } from 'vs/base/common/event';
import { StandardMouseEvent } from 'vs/base/browser/mouseEvent';

export interface ICellStyle extends ColorMap {
	funcBackground: Color;
	funcForeground: Color;
	funcBorder: Color;
}

export class CellRender extends Disposable {
	private $h3: HTMLElement;
	private $fnContainer: HTMLElement;
	private functionBadge: CountBadge;
	private _funcId: string = ID_NO_FUNCTION;
	private _pinName: string;

	private readonly _onContextMenu = new Emitter<ContextMenuData>();
	public readonly onContextMenu = this._onContextMenu.event;

	constructor(public readonly $cell: HTMLTableDataCellElement, public readonly pin: IPin2DNumber) {
		super();
		$cell.setAttribute('x', pin.x.toString());
		$cell.setAttribute('y', pin.y.toString());
		addClass($cell, 'IO');
		this.$h3 = append($cell, $('h3'));
		this.$fnContainer = append($cell, $('div.functions'));

		this._register(addDisposableListener(this.$cell, 'contextmenu', (event: MouseEvent) => {

			const mouseEvent = new StandardMouseEvent(event);

			this._onContextMenu.fire({
				pinName: this.pinName,
				pointer: { x: mouseEvent.posx, y: mouseEvent.posy },
				currentFunctionId: this._funcId,
			});
		}));
	}

	get pinName() {
		return this._pinName;
	}

	assignPinName(v) {
		if (this._pinName) {
			throw new TypeError('re-assign pin name');
		}
		this._pinName = v;
	}

	set title(value: string) {
		this.$h3.innerText = value;
	}

	get title() {
		return this.$h3.innerText;
	}

	assignFunctionId(funcId: string) {
		if (!funcId) {
			funcId = ID_NO_FUNCTION;
		}
		if (this._funcId === funcId) {
			return;
		}
		this._funcId = funcId;
		this.$fnContainer.title = funcId ? funcId : '';
		if (funcId) {
			if (this.functionBadge) {
				this.functionBadge.setCountFormat(funcId);
			} else {
				this.functionBadge = new CountBadge(this.$fnContainer, { countFormat: funcId });
			}
		} else {
			this.clean();
		}
	}

	get functionId() {
		return this._funcId;
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
		this._funcId = ID_NO_FUNCTION;
		if (this.functionBadge) {
			this.$fnContainer.innerHTML = '';
			delete this.functionBadge;
		}
	}
}
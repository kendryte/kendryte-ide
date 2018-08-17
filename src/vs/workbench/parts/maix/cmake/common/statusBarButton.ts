import { IStatusbarService, StatusbarAlignment } from 'vs/platform/statusbar/common/statusbar';
import { IDisposable } from 'vs/base/common/lifecycle';
import { ThemeColor } from 'vs/platform/theme/common/themeService';

class StatusBarItemLogic implements IDisposable {
	protected _entry: IDisposable;

	protected _text: string;
	protected _command: string;
	protected _tooltip: string;
	protected _color: string | ThemeColor;
	protected _arguments: any[];
	protected _showBeak: string;

	protected _visibleState: boolean = false;

	constructor(
		protected readonly align: StatusbarAlignment,
		protected readonly position: number,
		@IStatusbarService protected readonly statusbarService: IStatusbarService,
	) {
	}

	protected reload() {
		if (this._visibleState) {
			this.show(false);
			this.show(true);
		}
	}

	public show(isShow: boolean) {
		if (this._visibleState === isShow) {
			return;
		}
		this._visibleState = isShow;

		if (isShow) {
			if (!this._text) {
				console.error('button show without text, will not visible.');
			}
			this._entry = this.statusbarService.addEntry({
				text: this._text,
				command: this._command,
				tooltip: this._tooltip,
				color: this._color,
				arguments: this._arguments,
			}, this.align, this.position);
		} else {
			this._entry.dispose();
			this._entry = null;
		}
	}

	public isVisible() {
		return this._visibleState;
	}

	public dispose(): void {
		this.show(false);
	}
}

interface SleepData {
}

export class StatusBarItem extends StatusBarItemLogic {
	public text: string;
	public command: string;
	public tooltip: string;
	public color: string | ThemeColor;
	public arguments: any[];
	public showBeak: string;

	sleep(): SleepData {
		const data = {};
		for (const property of pproperties) {
			data[property] = this[property];
		}
		return data;
	}

	wakeup(data: any) {
		if (!data) {
			return;
		}
		let changed = false;
		for (const property of pproperties) {
			if (!data.hasOwnProperty(property) || this[property] === data[property]) {
				continue;
			}

			changed = true;
			this[property] = data[property];
		}
		if (changed) {
			this.reload();
		}
	}
}

const properties = ['text', 'command', 'tooltip', 'color', 'arguments', 'showBeak'];
const pproperties = properties.map(e => '_' + e);

for (const property of properties) {
	let privateVarName = '_' + property;
	Object.defineProperty(StatusBarItem.prototype, property, {
		get() {
			return this[privateVarName];
		},
		set(v: any) {
			if (this[privateVarName] === v) {
				return;
			}
			this[privateVarName] = v;
			this.reload();
		},
	});
}

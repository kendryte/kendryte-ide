import { IStatusbarService, StatusbarAlignment } from 'vs/platform/statusbar/common/statusbar';
import { IDisposable } from 'vs/base/common/lifecycle';
import { ThemeColor } from 'vs/platform/theme/common/themeService';
import { ISleepData, IStatusButtonData, IStatusButtonMethod } from 'vs/kendryte/vs/workbench/bottomBar/common/type';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { Emitter } from 'vs/base/common/event';
import { getNameOfButton, MyStatusBarItemNames } from 'vs/kendryte/vs/workbench/bottomBar/common/myStatusBarItemId';

export interface IContextKeyObject {
	expr: ContextKeyExpr;
	list: Set<string>;
}

export class MyStatusBarItem implements IStatusButtonData, IStatusButtonMethod {
	public readonly name: string;

	private _entry?: IDisposable;
	private _visibleState: boolean = false;
	private _isDisposed = false;

	@get_set() public text: string;
	@get_set() public command: string;
	@get_set() public tooltip: string;
	@get_set() public color: string | ThemeColor;
	@get_set() public arguments: any[];
	@get_set() public showBeak: boolean;
	@get_set() public align: StatusbarAlignment;
	@get_set() public position: number;
	private _contextKey: IContextKeyObject | null;

	private readonly _beforeDispose = new Emitter<void>();
	public readonly onDispose = this._beforeDispose.event;

	constructor(
		public readonly id: MyStatusBarItemNames,
		private readonly statusbarService: IStatusbarService,
	) {
		this.name = getNameOfButton(id);
	}

	get contextKeyList() {
		return this._contextKey ? this._contextKey.list : null;
	}

	get contextKeyExpr(): ContextKeyExpr | null {
		return this._contextKey ? this._contextKey.expr : null;
	}

	getContextKey(): IContextKeyObject | null {
		return this._contextKey;
	}

	setContextKey(v: ContextKeyExpr | null) {
		if (v) {
			this._contextKey = {
				expr: v,
				list: new Set(v.keys()),
			};
		} else {
			this._contextKey = null;
		}
	}

	public reload() {
		if (this._visibleState) {
			this.hide();
			this.show();
		}
	}

	show() {
		this.setVisible(true);
	}

	hide() {
		this.setVisible(false);
	}

	private setVisible(isShow: boolean) {
		if (this._isDisposed) {
			console.error('Show status bar disposed:', this);
			throw new Error('This status bar item is already disposed.');
		}
		let lastState = this._visibleState;

		if (this._visibleState === isShow) {
			return lastState;
		}
		this._visibleState = isShow;

		if (isShow) {
			if (!this.text) {
				console.error('status bar button show without text, this will not visible.');
			}
			// console.log('show button [%s] at [%s]', this.text, this.position);
			this._entry = this.statusbarService.addEntry({
				text: this.text,
				command: this.command,
				tooltip: this.tooltip,
				color: this.color,
				showBeak: this.showBeak,
				arguments: this.arguments,
			}, this.id, this.name, this.align, this.position);
		} else if (this._entry) {
			this._entry.dispose();
			delete this._entry;
		}

		return lastState;
	}

	public isVisible() {
		return this._visibleState;
	}

	public dispose(): void {
		this._beforeDispose.fire();
		this.hide();
		this._beforeDispose.dispose();
		this._isDisposed = true;
	}

	public sleep(): ISleepData {
		const data: ISleepData = {};
		data.text = this.text;
		data.command = this.command;
		data.tooltip = this.tooltip;
		data.color = this.color;
		data.arguments = this.arguments;
		data.showBeak = this.showBeak;
		data.align = this.align;
		data.position = this.position;
		const contextKey = this.contextKeyExpr;
		data.contextKey = contextKey ? contextKey.serialize() : '';
		return data;
	}

	public wakeup(data: ISleepData) {
		if (!data) {
			return;
		}
		const lastStatus = this.setVisible(false);
		if (data.text) {
			this.text = data.text;
		}
		if (data.command) {
			this.command = data.command;
		}
		if (data.tooltip) {
			this.tooltip = data.tooltip;
		}
		if (data.color) {
			this.color = data.color;
		}
		if (data.arguments) {
			this.arguments = data.arguments;
		}
		if (data.showBeak) {
			this.showBeak = data.showBeak;
		}
		if (data.align) {
			this.align = data.align;
		}
		if (data.position) {
			this.position = data.position;
		}
		if (data.contextKey) {
			const contextKey = ContextKeyExpr.deserialize(data.contextKey);
			if (contextKey) {
				this.setContextKey(contextKey);
			}
		}
		this.setVisible(lastStatus);
	}
}

function get_set(): PropertyDecorator {
	return function (target: MyStatusBarItem, property: string) {
		if (target.hasOwnProperty(property)) {
			throw new Error('WTF');
		}
		const symbol = Symbol('MyStatusBarItemValue/' + property);
		Object.defineProperty(target, property, {
			get() {
				return this[symbol];
			},
			set(v: any) {
				if (this[symbol] === v) {
					return;
				}
				this[symbol] = v;
				this.reload();
			},
		});
	};
}


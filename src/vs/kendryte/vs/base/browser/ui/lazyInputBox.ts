import { IInputOptions, InputBox } from 'vs/base/browser/ui/inputbox/inputBox';
import { IContextViewProvider } from 'vs/base/browser/ui/contextview/contextview';
import { Emitter, Event } from 'vs/base/common/event';

export class LazyInputBox extends InputBox {
	private _onLazyDidChange = this._register(new Emitter<string>());
	public readonly onDidChange: Event<string>;
	private _eventMustFire: boolean = false;
	private _isFocusIn: boolean = false;

	constructor(container: HTMLElement, contextViewProvider: IContextViewProvider | undefined, options?: IInputOptions) {
		super(container, contextViewProvider, options);
		this._register(this.onDidChange((v) => {
			this.handleDidChange(v);
		}));
		this.onblur(this.inputElement, () => { return this.handleBlur();});
		this.onfocus(this.inputElement, () => { return this.handleFocus();});

		this.onDidChange = this._onLazyDidChange.event;

	}

	private handleDidChange(v: string) {
		if (this._isFocusIn) {
			this._eventMustFire = true;
		} else {
			this._onLazyDidChange.fire(v);
		}
	}

	private handleBlur() {
		this._isFocusIn = false;
		if (this._eventMustFire) {
			this._eventMustFire = false;
			this._onLazyDidChange.fire(this.inputElement.value);
		}
	}

	private handleFocus() {
		this._isFocusIn = true;
	}
}
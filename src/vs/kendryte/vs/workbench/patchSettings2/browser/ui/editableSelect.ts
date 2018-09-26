import 'vs/css!vs/kendryte/vs/workbench/patchSettings2/browser/ui/editableSelect';
import { Widget } from 'vs/base/browser/ui/widget';
import { SelectBox } from 'vs/base/browser/ui/selectBox/selectBox';
import { InputBox } from 'vs/base/browser/ui/inputbox/inputBox';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { $, addDisposableListener, append } from 'vs/base/browser/dom';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { Emitter, Event } from 'vs/base/common/event';
import { attachStyler, IInputBoxStyleOverrides, ISelectBoxStyleOverrides, IThemable } from 'vs/platform/theme/common/styler';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import * as ColorRegistry from 'vs/platform/theme/common/colorRegistry';
import { Color } from 'vs/base/common/color';
import { TPromise } from 'vs/base/common/winjs.base';

export type SelectStyle =
	'selectBackground' |
	'selectListBackground' |
	'selectForeground' |
	'listFocusBackground' |
	'listFocusForeground' |
	'activeContrastBorder' |
	'listHoverBackground' |
	'listHoverForeground' |
	'activeContrastBorder';
export type IEditableSelectBoxStyleOverrides = Pick<ISelectBoxStyleOverrides, SelectStyle> & IInputBoxStyleOverrides;

const defaultColor: IEditableSelectBoxStyleOverrides = {} as any;
[
	'inputBackground',
	'inputForeground',
	'inputValidationInfoBorder',
	'inputValidationInfoBackground',
	'inputValidationWarningBorder',
	'inputValidationWarningBackground',
	'inputValidationErrorBorder',
	'inputValidationErrorBackground',
	'selectBackground',
	'selectListBackground',
	'selectForeground',
	'listFocusBackground',
	'listFocusForeground',
	'activeContrastBorder',
	'listHoverBackground',
	'listHoverForeground',
	'activeContrastBorder',
].forEach(name => defaultColor[name] = ColorRegistry[name]);
defaultColor.inputBorder = ColorRegistry.selectBorder;

export function attachEditableSelectBoxStyler(widget: IThemable, themeService: IThemeService, style?: IEditableSelectBoxStyleOverrides): IDisposable {
	return attachStyler(themeService, {
		...defaultColor,
		...style,
	}, widget);
}

class FireProtect {
	protected stackSize = 0;

	run(cb: Function) {
		if (this.isFiring) {
			return;
		}
		this.stackSize++;
		try {
			const ret = cb();
			this.stackSize--;
			return ret;
		} catch (e) {
			this.stackSize--;
			throw e;
		}
	}

	get isFiring() {
		return this.stackSize > 0;
	}
}

export class EditableSelectBox extends Widget implements IThemable {
	protected select: SelectBox;
	protected input: InputBox;

	private inputEvent: IDisposable;
	private selectEvent: IDisposable;
	private selectPlaceHolderEvent: IDisposable;

	protected $container: HTMLElement;

	protected $input: HTMLElement;
	protected $selectPlaceHolder: HTMLElement;
	protected $select: HTMLElement;

	protected enum: string[] = [];
	private _value: string;
	private _editable: boolean = true;

	protected readonly fireOnDidChange: (event: string) => void;
	public readonly onDidChange: Event<string>;
	private firing: FireProtect = new FireProtect;
	private styleCache: { [p: string]: Color };

	constructor(
		parentElement: HTMLElement,
		private contextViewService: IContextViewService,
	) {
		super();

		this.$container = append(parentElement, $('.editable-select-box'));
		this.$input = append(this.$container, $('.input'));
		this.$select = append(this.$container, $('.select'));

		this.applyStyles();

		this.createInput();

		const emitter = new Emitter<string>();
		this.fireOnDidChange = emitter.fire.bind(emitter);
		this.onDidChange = emitter.event;
	}

	private createInput() {
		if (!this.input) {
			this.input = new InputBox(this.$input, this.contextViewService);
			if (this.styleCache) {
				this.input.style(this.styleCache);
			}
			this.inputEvent = this.input.onDidChange((data) => {
				this._value = data;
				this.firing.run(() => {
					if (this.select) {
						this.selectValue();
					}
					this.fireOnDidChange(data);
				});
			});
		}
	}

	private destroyInput() {
		if (!this.input) {
			return;
		}
		dispose(this.input);
		this.$input.innerHTML = '';
		this.input = null;
	}

	private disableInput(disable: boolean) {
		if (!this.input) {
			this.createInput();
		}
		dispose(this.inputEvent);
		this.input.setEnabled(!disable);
	}

	private createSelect() {
		if (!this.select) {
			this.select = new SelectBox(this.enum, undefined, this.contextViewService);
			if (this.styleCache) {
				this.select.style(this.styleCache);
			}
			this.select.render(this.$select);
			this.$selectPlaceHolder = append(this.$container, $('.editable-select-holder'));

			this.selectEvent = this.select.onDidSelect(({ selected, index }) => {
				if (selected === 'undefined' && index === 0) {
					return;
				}
				if (this.input) {
					this.input.value = selected;
				} else {
					this.firing.run(() => {
						this.fireOnDidChange(selected);
					});
				}
			});
			this.selectPlaceHolderEvent = addDisposableListener(this.$selectPlaceHolder, 'click', () => {
				this.$select.querySelector('select').click();
			});
		} else {
			this.select.setOptions(this.enum);
		}
		this.selectValue();
	}

	private destroySelect() {
		if (!this.select) {
			return;
		}
		dispose(this.selectEvent);
		dispose(this.selectPlaceHolderEvent);
		dispose(this.select);
		this.$selectPlaceHolder.remove();

		this.$select.innerHTML = '';
		this.select = null;
		this.$selectPlaceHolder = null;
		this.selectPlaceHolderEvent = null;
	}

	private selectValue() {
		if (!this.enum) {
			return;
		}
		const selected = this.enum.indexOf(this._value);
		if (selected === -1) {
			this.select.select(undefined);
		} else {
			this.select.select(selected);
		}
	}

	registerEnum(list: string[] | TPromise<string[]>) {
		if (Array.isArray(list)) {
			this.enum = list.map(item => '' + item);

			if (list.length === 0) {
				this.destroySelect();
				if (!this.editable) {
					this.disableInput(true);
				}
			} else {
				this.createSelect();
				if (!this.editable && this.input) {
					this.destroyInput();
				}
			}
		} else {
			list.then(list => this.registerEnum(list));
		}
	}

	get value() {
		return this._value;
	}

	set value(v: string) {
		if (this._value === v) {
			return;
		}
		this._value = v;
		this.firing.run(() => {
			if (this.select) {
				this.selectValue();
			}
			if (this.input) {
				if (v !== undefined) {
					this.input.value = v;
				}
			}
		});
	}

	get editable() {
		return this._editable;
	}

	set editable(v: boolean) {
		if (this._editable === v) {
			return;
		}
		this._editable = v;

		if (v) {
			this.createInput();
			this.createSelect();
		} else {
			this.destroyInput();
			this.createSelect();
		}
	}

	protected applyStyles(): void {
	}

	style(colors: { [name: string]: Color }): void {
		const { inputBorder, ...others } = colors;
		if (inputBorder) {
			this.$container.style.borderColor = inputBorder.toString();
		}
		this.styleCache = colors;
		if (this.input) {
			this.input.style(others);
		}
		if (this.select) {
			this.select.style(others);
		}
	}

	dispose() {
		this.destroySelect();
		this.destroyInput();
		super.dispose();
	}
}
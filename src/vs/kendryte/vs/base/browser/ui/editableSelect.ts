import 'vs/css!vs/kendryte/vs/base/browser/ui/editableSelect';
import { Widget } from 'vs/base/browser/ui/widget';
import { ISelectOptionItem, SelectBox } from 'vs/base/browser/ui/selectBox/selectBox';
import { InputBox } from 'vs/base/browser/ui/inputbox/inputBox';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { $, addDisposableListener, append } from 'vs/base/browser/dom';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { Emitter, Event } from 'vs/base/common/event';
import { attachStyler, IInputBoxStyleOverrides, ISelectBoxStyleOverrides, IThemable } from 'vs/platform/theme/common/styler';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import * as ColorRegistry from 'vs/platform/theme/common/colorRegistry';
import { Color } from 'vs/base/common/color';
import { querySelector } from 'vs/kendryte/vs/base/browser/dom';
import { selectBoxNames } from 'vs/kendryte/vs/base/browser/ui/selectBox';

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
	private stackSize = 0;

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
	private select?: SelectBox;
	private readonly input: InputBox;

	private inputEvent?: IDisposable;
	private selectEvent?: IDisposable;
	private selectPlaceHolderEvent?: IDisposable;

	private readonly $container: HTMLElement;

	private readonly $input: HTMLElement;
	private $selectPlaceHolder?: HTMLElement;
	private readonly $select: HTMLElement;

	private enum: ISelectOptionItem[];
	private _value: string;
	private _editable: boolean;

	private readonly fireOnDidChange: (event: string) => void;
	public readonly onDidChange: Event<string>;
	private firing: FireProtect = new FireProtect;
	private styleCache: { [p: string]: Color };

	constructor(
		private readonly parentElement: HTMLElement,
		private contextViewService: IContextViewService,
	) {
		super();

		this.$container = append(parentElement, $('.editable-select-box'));
		this.$input = append(this.$container, $('.input'));
		this.$select = append(this.$container, $('.select'));

		this._register(addDisposableListener(parentElement, 'focus', () => {
			parentElement.classList.add('synthetic-focus');
		}));
		this._register(addDisposableListener(parentElement, 'blur', () => {
			parentElement.classList.remove('synthetic-focus');
		}));

		this.input = new InputBox(this.$input, this.contextViewService);

		const emitter = new Emitter<string>();
		this.fireOnDidChange = emitter.fire.bind(emitter);
		this.onDidChange = emitter.event;

		this.applyStyles();

		this.editable = false;
		this.registerSelection([]);
	}

	private setInputEnable(enable: boolean) {
		if (enable) {
			this.$container.classList.add('enable-input');
			if (!this.inputEvent) {
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
			this.input.setEnabled(true);
		} else {
			this.$container.classList.remove('enable-input');
			if (this.inputEvent) {
				dispose(this.inputEvent);
				delete this.inputEvent;
			}
			this.input.setEnabled(false);
		}
	}

	private createSelect() {
		if (!this.select) {
			this.select = new SelectBox(this.enum, 0, this.contextViewService);
			if (this.styleCache) {
				this.select.style(this.styleCache);
			}
			this.select.render(this.$select);
			this.$selectPlaceHolder = append(this.$container, $('.editable-select-holder'));

			this.selectEvent = this.select.onDidSelect(({ selected, index }) => {
				if (selected === 'undefined' && index === 0) {
					return;
				}
				this.firing.run(() => {
					this.input.value = selected;
					this.fireOnDidChange(selected);
				});
			});
			this.selectPlaceHolderEvent = addDisposableListener(this.$selectPlaceHolder, 'click', () => {
				querySelector(this.$select, 'select').click();
			});
		} else {
			this.select.setOptions(this.enum);
		}
		this.$container.classList.add('has-select');
		this.selectValue();
	}

	private destroySelect() {
		if (!this.select) {
			return;
		}
		this.$container.classList.remove('has-select');
		dispose(this.selectEvent);
		delete this.selectEvent;

		dispose(this.select);
		delete this.select;

		dispose(this.selectPlaceHolderEvent);

		if (this.$selectPlaceHolder) {
			this.$selectPlaceHolder.remove();
		}
		delete this.$selectPlaceHolder;

		this.$select.innerHTML = '';
	}

	private selectValue() {
		if (!this.enum) {
			return;
		}
		if (!this.select) {
			throw new Error('selectable state error');
		}
		if (this._value === undefined) {
			this.select.select(0);
		} else {
			const selected = this.enum.findIndex((item) => {
				return item.text === this._value;
			});
			this.select.select(selected);
		}
	}

	registerSelection(list: ISelectOptionItem[] | Promise<ISelectOptionItem[]>) {
		if (Array.isArray(list)) {
			this.enum = list.map((item) => {
				return { ...item };
			});

			if (list.length === 0) {
				this.destroySelect();
			} else {
				this.createSelect();
			}
		} else {
			list.then(list => this.registerSelection(list));
		}
	}

	/**
	 * @deprecated
	 */
	registerEnum(list: string[] | Promise<string[]>) {
		if (Array.isArray(list)) {
			this.registerSelection(list.map(selectBoxNames));
		} else {
			list.then(list => this.registerSelection(list.map(selectBoxNames)));
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
			if (v !== undefined) {
				this.input.value = v;
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

		this.setInputEnable(v);
	}

	private applyStyles(): void {
		// TODO?
	}

	style(colors: { [name: string]: Color }): void {
		const { inputBorder, ...others } = colors;
		if (inputBorder) {
			this.$container.style.borderColor = inputBorder.toString();
		}
		this.styleCache = colors;
		this.input.style(others);
		if (this.select) {
			this.select.style(others);
		}
	}

	dispose() {
		this.destroySelect();
		dispose(this.input);
		super.dispose();
	}

	public setEnable(enable: boolean) {
		if (this.select) {
			this.parentElement.querySelectorAll('select').forEach((item) => {
				item.disabled = !enable;
			});
		}
		this.input.setEnabled(!!(this.inputEvent && enable));
	}
}
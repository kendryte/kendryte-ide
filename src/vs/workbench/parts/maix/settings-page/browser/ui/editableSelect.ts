import { Widget } from 'vs/base/browser/ui/widget';
import { SelectBox } from 'vs/base/browser/ui/selectBox/selectBox';
import { InputBox } from 'vs/base/browser/ui/inputbox/inputBox';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { $, append } from 'vs/base/browser/dom';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { Emitter, Event } from 'vs/base/common/event';
import { attachStyler, IInputBoxStyleOverrides, ISelectBoxStyleOverrides, IThemable } from 'vs/platform/theme/common/styler';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import {
	activeContrastBorder,
	focusBorder,
	inputBackground,
	inputBorder,
	inputForeground,
	inputValidationErrorBackground,
	inputValidationErrorBorder,
	inputValidationInfoBackground,
	inputValidationInfoBorder,
	inputValidationWarningBackground,
	inputValidationWarningBorder,
	listFocusBackground,
	listFocusForeground,
	listHoverBackground,
	listHoverForeground,
	selectBackground,
	selectBorder,
	selectForeground,
	selectListBackground
} from 'vs/platform/theme/common/colorRegistry';
import { Color } from 'vs/base/common/color';

export type IEditableSelectBoxStyleOverrides = ISelectBoxStyleOverrides & IInputBoxStyleOverrides;

export function attachEditableSelectBoxStyler(widget: IThemable, themeService: IThemeService, style?: IEditableSelectBoxStyleOverrides): IDisposable {
	return attachStyler(themeService, {
		inputBackground: (style && style.inputBackground) || inputBackground,
		inputForeground: (style && style.inputForeground) || inputForeground,
		inputBorder: (style && style.inputBorder) || inputBorder,
		inputValidationInfoBorder: (style && style.inputValidationInfoBorder) || inputValidationInfoBorder,
		inputValidationInfoBackground: (style && style.inputValidationInfoBackground) || inputValidationInfoBackground,
		inputValidationWarningBorder: (style && style.inputValidationWarningBorder) || inputValidationWarningBorder,
		inputValidationWarningBackground: (style && style.inputValidationWarningBackground) || inputValidationWarningBackground,
		inputValidationErrorBorder: (style && style.inputValidationErrorBorder) || inputValidationErrorBorder,
		inputValidationErrorBackground: (style && style.inputValidationErrorBackground) || inputValidationErrorBackground,

		selectBackground: (style && style.selectBackground) || selectBackground,
		selectListBackground: (style && style.selectListBackground) || selectListBackground,
		selectForeground: (style && style.selectForeground) || selectForeground,
		selectBorder: (style && style.selectBorder) || selectBorder,
		focusBorder: (style && style.focusBorder) || focusBorder,
		listFocusBackground: (style && style.listFocusBackground) || listFocusBackground,
		listFocusForeground: (style && style.listFocusForeground) || listFocusForeground,
		listFocusOutline: (style && style.listFocusOutline) || activeContrastBorder,
		listHoverBackground: (style && style.listHoverBackground) || listHoverBackground,
		listHoverForeground: (style && style.listHoverForeground) || listHoverForeground,
		listHoverOutline: (style && style.listFocusOutline) || activeContrastBorder,
	} as IEditableSelectBoxStyleOverrides, widget);
}

export class EditableSelectBox extends Widget implements IThemable {
	protected select: SelectBox;
	protected input: InputBox;

	private inputEvent: IDisposable;
	private selectEvent: IDisposable;

	protected $remove: HTMLElement;
	protected $container: HTMLElement;

	protected $input: HTMLElement;
	protected $select: HTMLElement;

	protected enum: string[] = [];
	private _value: string;
	private _editable: boolean = true;

	protected readonly fireOnDidChange: (event: string) => void;
	public readonly onDidChange: Event<string>;
	private firing: boolean = false;
	private styleCache: { [p: string]: Color };

	constructor(
		parentElement: HTMLElement,
		private contextViewService: IContextViewService
	) {
		super();

		this.$container = append(parentElement, $('.editable-select-box'));
		this.$select = append(this.$container, $('.select'));
		this.$input = append(this.$container, $('.input'));

		this.applyStyles();

		this.$remove = $('.editable-select');

		this.createInput();

		const emitter = new Emitter<string>();
		this.fireOnDidChange = emitter.fire.bind(emitter);
		this.onDidChange = emitter.event;
	}

	private createInput() {
		if (!this.input) {
			this.input = new InputBox(this.$remove, this.contextViewService);
			if (this.styleCache) {
				this.input.style(this.styleCache);
			}
			this.inputEvent = this.input.onDidChange((data) => {
				if (this.firing) {
					return;
				}
				this._value = data;
				this.firing = true;
				if (this.select) {
					this.selectValue();
				}
				this.fireOnDidChange(data);
				this.firing = false;
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

			this.selectEvent = this.select.onDidSelect(({ selected, index }) => {
				if (this.input) {
					this.input.value = selected;
				} else {
					this.fireOnDidChange(selected);
				}
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
		dispose(this.select);
		this.$select.innerHTML = '';
		this.select = null;
	}

	private selectValue() {
		if (!this.enum) {
			return;
		}
		const selected = this.enum.indexOf(this._value);
		if (selected !== -1) {
			this.select.select(selected);
		}
	}

	registerEnum(list: string[]) {
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
	}

	get value() {
		return this._value;
	}

	set value(v: string) {
		if (this._value === v) {
			return;
		}
		this._value = v;
		if (this.select) {
			this.selectValue();
		} else if (this.input) {
			this.input.value = v;
		}
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
		this.styleCache = colors;
		if (this.input) {
			this.input.style(colors);
		}
		if (this.select) {
			this.select.style(colors);
		}
	}

	dispose() {
		this.destroySelect();
		this.destroyInput();
		super.dispose();
	}
}
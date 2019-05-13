import 'vs/css!vs/kendryte/vs/base/browser/ui/myCheckBox';
import { Widget } from 'vs/base/browser/ui/widget';
import { Emitter, Event } from 'vs/base/common/event';
import * as objects from 'vs/base/common/objects';
import { KeyCode } from 'vs/base/common/keyCodes';
import * as DOM from 'vs/base/browser/dom';
import { $, append } from 'vs/base/browser/dom';
import { ColorIdentifier, inputActiveOptionBorder, inputBackground, inputBorder } from 'vs/platform/theme/common/colorRegistry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IDisposable } from 'vs/base/common/lifecycle';
import { attachStyler, IStyleOverrides, IThemable } from 'vs/platform/theme/common/styler';
import { Color } from 'vs/base/common/color';

export interface IMyCheckboxStyles {
	inputInactiveOptionBorder?: Color;
	inputActiveOptionBorder?: Color;
	inputBackground?: Color;
}

export interface IMyCheckboxOpts extends IMyCheckboxStyles {
	readonly title: string;
	readonly description?: string;
	readonly isChecked?: boolean;
	readonly icon?: string;
}

const defaultOpts: Partial<IMyCheckboxOpts> = {
	isChecked: true,
};

export interface IMyCheckboxStyleOverrides extends IStyleOverrides {
	inputInactiveOptionBorder?: ColorIdentifier;
	inputActiveOptionBorder?: ColorIdentifier;
	inputBackground?: ColorIdentifier;
}

export function attachMyCheckboxStyler(widget: MyCheckBox, themeService: IThemeService, style?: IMyCheckboxStyleOverrides): IDisposable {
	return attachStyler(themeService, {
		inputInactiveOptionBorder: (style && style.inputInactiveOptionBorder) || inputBorder,
		inputActiveOptionBorder: (style && style.inputActiveOptionBorder) || inputActiveOptionBorder,
		inputBackground: (style && style.inputBackground) || inputBackground,
	} as IMyCheckboxStyleOverrides, widget);
}

export class MyCheckBox extends Widget implements IThemable {
	private readonly _onChange = this._register(new Emitter<boolean>());
	get onChange(): Event<boolean /* via keyboard */> { return this._onChange.event; }

	private readonly _opts: IMyCheckboxOpts;

	private readonly parentNode: HTMLElement;
	private readonly boxNode: HTMLElement;
	private readonly textNode: HTMLElement;

	private _checked: boolean;

	constructor(parent: HTMLElement, opts: IMyCheckboxOpts) {
		super();

		this._opts = objects.deepClone(opts);
		objects.mixin(this._opts, defaultOpts, false);
		this._checked = this._opts.isChecked || false;

		this.parentNode = $('label.my-custom-checkbox');
		append(parent, this.parentNode);

		this.boxNode = $('span.checkbox-node');
		this.boxNode.setAttribute('role', 'checkbox');
		this.boxNode.setAttribute('aria-checked', String(this._checked));
		this.boxNode.setAttribute('aria-label', this._opts.title);
		this.boxNode.tabIndex = 0;
		this.boxNode.className += ' ' + (this._opts.icon ? this._opts.icon + ' ' : '') + (this._checked ? 'checked' : 'unchecked');
		append(this.parentNode, this.boxNode);

		this.textNode = $('span.title-node');
		append(this.parentNode, this.textNode);

		this.applyStyles();

		this.onclick(this.boxNode, (ev) => {
			this.checked = !this._checked;
			this._onChange.fire(false);
			ev.preventDefault();
		});

		this.onkeydown(this.boxNode, (keyboardEvent) => {
			if (keyboardEvent.keyCode === KeyCode.Space || keyboardEvent.keyCode === KeyCode.Enter) {
				this.checked = !this._checked;
				this._onChange.fire(true);
				keyboardEvent.preventDefault();
			}
		});

		this.setTitle(this._opts.title, this._opts.description);
	}

	get enabled(): boolean {
		return this.boxNode.getAttribute('aria-disabled') !== 'true';
	}

	focus(): void {
		this.boxNode.focus();
	}

	get checked(): boolean {
		return this._checked;
	}

	set checked(newIsChecked: boolean) {
		this._checked = !!newIsChecked;
		this.boxNode.setAttribute('aria-checked', String(this._checked));
		if (this._checked) {
			this.boxNode.classList.add('checked');
			this.boxNode.classList.remove('unchecked');
		} else {
			this.boxNode.classList.remove('checked');
			this.boxNode.classList.add('unchecked');
		}

		this.applyStyles();
	}

	width(): number {
		return 2 /*marginleft*/ + 2 /*border*/ + 2 /*padding*/ + 16 /* icon width */;
	}

	style(styles: IMyCheckboxStyles): void {
		if (styles.inputActiveOptionBorder) {
			this._opts.inputActiveOptionBorder = styles.inputActiveOptionBorder;
		}
		if (styles.inputInactiveOptionBorder) {
			this._opts.inputInactiveOptionBorder = styles.inputInactiveOptionBorder;
		}
		if (styles.inputBackground) {
			this._opts.inputBackground = styles.inputBackground;
		}
		this.applyStyles();
	}

	protected applyStyles(): void {
		if (this._checked) {
			this.boxNode.style.borderColor = this._opts.inputActiveOptionBorder ?
				this._opts.inputActiveOptionBorder.toString() :
				'transparent';
		} else {
			this.boxNode.style.borderColor = this._opts.inputInactiveOptionBorder ?
				this._opts.inputInactiveOptionBorder.toString() :
				'transparent';
		}
		this.boxNode.style.backgroundColor = this._opts.inputBackground ?
			this._opts.inputBackground.toString() :
			'transparent';
	}

	enable(): void {
		this.boxNode.tabIndex = 0;
		this.boxNode.setAttribute('aria-disabled', String(false));
	}

	disable(): void {
		DOM.removeTabIndexAndUpdateFocus(this.boxNode);
		this.boxNode.setAttribute('aria-disabled', String(true));
	}

	private setTitle(title: string, description: string = title) {
		this.parentNode.title = description;
		this.textNode.textContent = title;
	}
}
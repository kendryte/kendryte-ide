import { IUISectionWidget } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/common/type';
import { CMakeProjectTypes, ICompileInfoPossibleKeys } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { InputBox } from 'vs/base/browser/ui/inputbox/inputBox';
import { MapLike } from 'vs/kendryte/vs/base/common/extendMap';
import { Disposable } from 'vs/base/common/lifecycle';
import { combineValidation } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/node/validators';
import { attachInputBoxStyler, attachSelectBoxStyler } from 'vs/platform/theme/common/styler';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { Emitter } from 'vs/base/common/event';
import { ISelectData, SelectBox } from 'vs/base/browser/ui/selectBox/selectBox';
import { selectBoxNames } from 'vs/kendryte/vs/base/browser/ui/selectBox';
import { localize } from 'vs/nls';
import { KendryteJsonValidator, PackageJsonValidatorType } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/node/validators.class';

export class SectionFactory extends Disposable {
	private readonly _onDidHeightChange = new Emitter<void>();
	public readonly onDidHeightChange = this._onDidHeightChange.event;

	private readonly _onTypeChange = new Emitter<CMakeProjectTypes>();
	public readonly onTypeChange = this._onTypeChange.event;

	private readonly _onUpdate = new Emitter<{ property: ICompileInfoPossibleKeys, value: any }>();
	public readonly onUpdate = this._onUpdate.event;

	private readonly validator = new KendryteJsonValidator();

	constructor(
		@IContextViewService private readonly contextViewService: IContextViewService,
		@IThemeService private readonly themeService: IThemeService,
	) {
		super();
	}

	setRootPath(path: string) {
		this.validator.setRootPath(path);
	}

	public createTypeSelect(parent: HTMLElement): IUISectionWidget<CMakeProjectTypes, CMakeProjectTypes> {
		const typeSelections = {
			[CMakeProjectTypes.library]: localize('library', 'Library'),
			[CMakeProjectTypes.prebuiltLibrary]: localize('prebuilt library', 'Prebuilt library'),
			[CMakeProjectTypes.executable]: localize('executable', 'Executable'),
		};

		const displayNames = Object.values(typeSelections);
		const values = Object.keys(typeSelections) as CMakeProjectTypes[];

		let setting = false;
		let value = values[0];
		const input = this._register(new SelectBox(displayNames.map(selectBoxNames), 0, this.contextViewService));
		this._register(attachSelectBoxStyler(input, this.themeService));
		this._register(input.onDidSelect((sel: ISelectData) => {
			if (setting) {
				return;
			}
			value = values[sel.index];
			this._onTypeChange.fire(values[sel.index]);

			if (value === CMakeProjectTypes.prebuiltLibrary) {
				this.updateSimple('type', CMakeProjectTypes.library);
			} else {
				this.updateSimple('type', value);
			}
		}));
		input.render(parent);

		return {
			get() {return value;},
			set(newVal) {
				setting = true;
				value = newVal || values[0];
				console.log('Type SelectBox: set: %s (%s)', newVal, value);
				input.select(values.indexOf(value));
				setting = false;
			},
		};
	}

	private _createTextBox(
		parent: HTMLElement,
		validation: PackageJsonValidatorType,
		placeholder: string,
		textarea: boolean,
	): InputBox {
		const input = this._register(new InputBox(parent, this.contextViewService, {
			placeholder,
			validationOptions: {
				validation: combineValidation(this.validator.getValidate(validation)),
			},
			flexibleHeight: textarea,
		}));
		input.width = 320;
		this._register(attachInputBoxStyler(input, this.themeService));
		this._register(input.onDidHeightChange(() => {
			this._onDidHeightChange.fire();
		}));
		return input;
	}

	public createTextInput(
		parent: HTMLElement,
		property: ICompileInfoPossibleKeys,
		validation: PackageJsonValidatorType,
		placeholder: string,
	): IUISectionWidget<string, string> {
		const input = this._createTextBox(parent, validation, placeholder, false);
		let setting = false;
		this._register(input.onDidChange((data: string) => {
			if (setting) {
				return;
			}
			this.updateSimple(property, data);
		}));
		return {
			get() {return input.value;},
			set(v) {
				setting = true;
				input.value = v || '';
				setting = false;
			},
		};
	}

	public createTextAreaMap(
		parent: HTMLElement,
		property: ICompileInfoPossibleKeys,
		validation: PackageJsonValidatorType,
		placeholder: string,
	): IUISectionWidget<string | string[], MapLike<string>> {
		const input = this._createTextBox(parent, validation, placeholder, true);
		let setting = false;
		const ret = {
			get(): MapLike<string> {
				const obj: any = {};
				input.value.split('\n').filter(e => e.length > 0).forEach((line) => {
					let f = line.indexOf('=');
					if (f === -1) {
						f = line.length;
					}
					obj[line.substr(0, f)] = line.substr(f + 1);
				});
				return obj;
			},
			set(v: string | string[]) {
				setting = true;
				if (v) {
					if (typeof v === 'string') {
						input.value = v;
					} else {
						input.value = Object.entries(v).map(([k, v]) => {
							return `${k}=${v}`;
						}).join('\n');
					}
				} else {
					input.value = '';
				}
				setting = false;
			},
		};
		this._register(input.onDidChange((data: string) => {
			if (setting) {
				return;
			}
			this.updateSimple(property, ret.get());
		}));
		return ret;
	}

	public createTextAreaArray(
		parent: HTMLElement,
		property: ICompileInfoPossibleKeys,
		validation: PackageJsonValidatorType,
		placeholder: string,
	): IUISectionWidget<string[] | string, string[]> {
		const input = this._createTextBox(parent, validation, placeholder, true);
		let setting = false;
		const ret = {
			get() {return input.value.split('\n').filter(e => e.length > 0);},
			set(v: string[] | string) {
				setting = true;
				if (v) {
					input.value = Array.isArray(v) ? v.join('\n') : v;
				} else {
					input.value = '';
				}
				setting = false;
			},
		};
		this._register(input.onDidChange((data: string) => {
			if (setting) {
				return;
			}
			this.updateSimple(property, ret.get());
		}));
		return ret;
	}

	private updateSimple(property: ICompileInfoPossibleKeys, value: any) {
		this._onUpdate.fire({ property, value });
	}
}
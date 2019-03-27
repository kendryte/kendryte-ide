import 'vs/css!vs/kendryte/vs/workbench/kendrytePackageJsonEditor/browser/media/kendrytePackageJsonEditor';
import { BaseEditor } from 'vs/workbench/browser/parts/editor/baseEditor';
import { KENDRYTE_PACKAGE_JSON_EDITOR_ID } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/common/ids';
import { $, append, Dimension } from 'vs/base/browser/dom';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { EditorOptions } from 'vs/workbench/common/editor';
import { CancellationToken } from 'vs/base/common/cancellation';
import { KendrytePackageJsonEditorInput } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/electron-browser/kendrytePackageJsonEditorInput';
import { KendrytePackageJsonEditorModel } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/node/kendrytePackageJsonEditorModel';
import { CMAKE_CONFIG_FILE_NAME, CMakeProjectTypes, ICompileInfoPossibleKeys } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { ISelectData, SelectBox } from 'vs/base/browser/ui/selectBox/selectBox';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { attachInputBoxStyler, attachSelectBoxStyler } from 'vs/platform/theme/common/styler';
import { IInputValidator, InputBox } from 'vs/base/browser/ui/inputbox/inputBox';
import { localize } from 'vs/nls';
import { DomScrollableElement } from 'vs/base/browser/ui/scrollbar/scrollableElement';
import { ScrollbarVisibility } from 'vs/base/common/scrollable';
import {
	combineValidation,
	validateArgList,
	validateDefinitions,
	validateFile,
	validateFolders,
	validateKeyValue,
	validateProjectName,
	validateRequired,
	validateSources,
	validateUrl,
	validateVersionString,
} from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/node/validators';
import { resolvePath } from 'vs/kendryte/vs/base/node/resolvePath';
import { INotificationService } from 'vs/platform/notification/common/notification';

interface IUISectionWidget<T> {
	get(): T;
	set(val: T): void;
}

interface IUISection<T> {
	section: HTMLDivElement;
	widget: IUISectionWidget<T>;
}

interface IControlList {
	name: IUISection<string>;
	version: IUISection<string>;
	homepage: IUISection<string>;
	type: IUISection<CMakeProjectTypes>;
	properties: IUISection<object>;
	header: IUISection<string[]>;
	source: IUISection<string[]>;
	extraList: IUISection<string>;
	c_flags: IUISection<string[]>;
	cpp_flags: IUISection<string[]>;
	c_cpp_flags: IUISection<string[]>;
	link_flags: IUISection<string[]>;
	ld_file: IUISection<string>;
	prebuilt: IUISection<string>;
	entry: IUISection<string>;
	definitions: IUISection<object>;

	// library
	include: IUISection<string[]>;
	exampleSource: IUISection<string[]>;

	// executable
}

const typeSelections = {
	[CMakeProjectTypes.library]: localize('library', 'Library'),
	[CMakeProjectTypes.prebuiltLibrary]: localize('prebuilt library', 'Prebuilt library'),
	[CMakeProjectTypes.executable]: localize('executable', 'Executable'),
};

export class KendrytePackageJsonEditor extends BaseEditor {
	public static readonly ID: string = KENDRYTE_PACKAGE_JSON_EDITOR_ID;
	protected _input: KendrytePackageJsonEditorInput;
	protected _model: KendrytePackageJsonEditorModel;
	private h1: HTMLHeadingElement;
	private controls: Partial<IControlList> = {};
	private scroll: DomScrollableElement;
	private json: HTMLDivElement;
	private editorInited: boolean = false;

	constructor(
		@ITelemetryService telemetryService: ITelemetryService,
		@IThemeService themeService: IThemeService,
		@IStorageService storageService: IStorageService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IContextViewService private readonly contextViewService: IContextViewService,
		@INotificationService private readonly notificationService: INotificationService,
	) {
		super(KendrytePackageJsonEditor.ID, telemetryService, themeService, storageService);
	}

	async setInput(input: KendrytePackageJsonEditorInput, options: EditorOptions, token: CancellationToken): Promise<void> {
		super.setInput(input, options, token);
		this._model = await input.resolve();

		if (!this.editorInited) {
			console.warn('Skip because editor not ready');
			return; // there must be error before, nothing can do now.
		}

		const data = this._model.data;
		this.json.innerText = JSON.stringify(data, null, 4);
		this.h1.innerText = input.getTitle();
		this.scroll.scanDomNode();

		if (data.type === CMakeProjectTypes.library) {
			if (data.prebuilt) {
				this.controls.type.widget.set(CMakeProjectTypes.prebuiltLibrary);
				this.onTypeChange(CMakeProjectTypes.prebuiltLibrary);
			} else {
				this.controls.type.widget.set(CMakeProjectTypes.library);
				this.onTypeChange(CMakeProjectTypes.library);
			}
		} else {
			this.controls.type.widget.set(CMakeProjectTypes.executable);
			this.onTypeChange(CMakeProjectTypes.executable);
		}

		for (const secName of Object.keys(this.controls)) {
			if (secName === 'type') {
				continue;
			}
			const set = this.controls[secName].widget.set as Function;
			set(this._model.data[secName]);
		}
	}

	private onTypeChange(value: CMakeProjectTypes): void {
		console.log('onTypeChange: ', value);
		const display = (sections: (keyof IControlList)[], show: boolean) => {
			for (const secName of sections) {
				console.log('display: ', sections, show);
				this.controls[secName].section.style.display = show ? 'flex' : 'none';
				const set = this.controls[secName].widget.set as Function;
				if (!show) {
					set('');
					this.updateSimple(secName, undefined);
				}
			}
		};
		switch (value) {
			case CMakeProjectTypes.library:
				display(['source', 'c_flags', 'cpp_flags', 'c_cpp_flags', 'link_flags', 'ld_file', 'definitions', 'header', 'include', 'exampleSource'], true);
				display(['entry', 'prebuilt'], false);
				break;
			case CMakeProjectTypes.prebuiltLibrary:
				display(['include', 'exampleSource', 'prebuilt'], true);
				display(['source', 'header', 'c_flags', 'cpp_flags', 'c_cpp_flags', 'link_flags', 'ld_file', 'entry', 'definitions'], false);
				break;
			case CMakeProjectTypes.executable:
				display(['source', 'header', 'c_flags', 'cpp_flags', 'c_cpp_flags', 'link_flags', 'ld_file', 'entry', 'definitions'], true);
				display(['prebuilt', 'include', 'exampleSource'], false);
				break;
		}
	}

	clearInput(): void {
		this._input = null;
		this._options = null;
		this._model = null;
	}

	get data() {
		return this._model.data;
	}

	private validateFile(value: string) {
		const root = resolvePath(this._model.resource.fsPath, '..');
		return validateFile(root, value);
	}

	private validateFolders(value: string) {
		const root = resolvePath(this._model.resource.fsPath, '..');
		return validateFolders(root, value);
	}

	private validateSources(value: string) {
		const root = resolvePath(this._model.resource.fsPath, '..');
		return validateSources(root, value);
	}

	public layout(dimension: Dimension): void {
		this.scroll.scanDomNode();
	}

	protected createEditor(parent: HTMLElement): void {
		try {
			this._createEditor(parent);
		} catch (e) {
			this.notificationService.error(e);
			return;
		}
		this.editorInited = true;
	}

	private _createEditor(parent: HTMLElement): void {
		const container = $('div.wrap');
		this.scroll = this._register(new DomScrollableElement(container, {
			horizontal: ScrollbarVisibility.Hidden,
			vertical: ScrollbarVisibility.Visible,
		}));
		append(parent, this.scroll.getDomNode());

		const validateFile = this.validateFile.bind(this);
		const validateFolders = this.validateFolders.bind(this);
		const validateSources = this.validateSources.bind(this);

		parent.classList.add('kendryte-package-json-editor');
		this.h1 = append(container, $('h1'));
		(append(container, $('div.muted')) as HTMLSpanElement).innerText = 'Your settings will saved automatically';
		append(container, $('hr'));

		this.controls.type = this.createSection(
			container,
			localize('kendrytePackageJsonEditor.type.title', 'Project type'),
			localize('kendrytePackageJsonEditor.type.desc', 'Type of your project. Warning: change this will clear others settings.'),
			($section) => this.createTypeSelect($section),
		);

		this.controls.name = this.createSection(
			container,
			localize('kendrytePackageJsonEditor.name.title', 'Project name'),
			localize('kendrytePackageJsonEditor.name.desc', 'Title of your project. Only a-z, 0-9, -, _ are allowed.'),
			($section) => this.createTextInput(
				$section,
				'name',
				[
					validateRequired,
					validateProjectName,
				],
				localize('required', 'Required.'),
			),
		);

		this.controls.version = this.createSection(
			container,
			localize('kendrytePackageJsonEditor.version.title', 'Current version'),
			localize('kendrytePackageJsonEditor.version.desc', 'Apply when publish.'),
			($section) => this.createTextInput(
				$section,
				'version',
				[
					validateRequired,
					validateVersionString,
				],
				localize('required', 'Required'),
			),
		);

		this.controls.homepage = this.createSection(
			container,
			localize('kendrytePackageJsonEditor.homepage.title', 'Homepage'),
			localize('kendrytePackageJsonEditor.homepage.desc', 'A link to your project home (eg. github page).'),
			($section) => this.createTextInput($section, 'homepage', validateUrl, 'http://xxxx'),
		);

		this.controls.header = this.createSection(
			container,
			localize('kendrytePackageJsonEditor.header.title', 'Headers directory'),
			localize('kendrytePackageJsonEditor.header.desc', 'You can use #include from these folders in your code. One folder per line. Relative to this {0} file', CMAKE_CONFIG_FILE_NAME),
			($section) => this.createTextAreaArray($section, 'header', validateFolders, 'relative/path/to/include/root'),
		);

		this.controls.source = this.createSection(
			container,
			localize('kendrytePackageJsonEditor.source.title', 'Source files'),
			localize('kendrytePackageJsonEditor.source.desc', 'Source files to compile. One file/folder per line.'),
			($section) => this.createTextAreaArray(
				$section,
				'source',
				[
					validateRequired,
					validateSources,
				],
				localize('kendrytePackageJsonEditor.source.placeholder', 'path/to/code.c - directly add a file.\npath/*.c - match all .c file in this folder.\npath/**.c - also recursive subfolders.'),
			),
		);

		this.controls.c_flags = this.createSection(
			container,
			localize('kendrytePackageJsonEditor.c_flags.title', 'Arguments for gcc'),
			localize('kendrytePackageJsonEditor.c_flags.desc', 'one argument per line'),
			($section) => this.createTextAreaArray($section, 'c_flags', validateArgList, ''),
		);

		this.controls.cpp_flags = this.createSection(
			container,
			localize('kendrytePackageJsonEditor.cpp_flags.title', 'Arguments for g++'),
			localize('kendrytePackageJsonEditor.cpp_flags.desc', 'one argument per line'),
			($section) => this.createTextAreaArray($section, 'cpp_flags', validateArgList, ''),
		);

		this.controls.c_cpp_flags = this.createSection(
			container,
			localize('kendrytePackageJsonEditor.c_cpp_flags.title', 'Arguments for both gcc and g++'),
			localize('kendrytePackageJsonEditor.c_cpp_flags.desc', 'one argument per line'),
			($section) => this.createTextAreaArray($section, 'c_cpp_flags', validateArgList, 'eg. -Os'),
		);

		this.controls.link_flags = this.createSection(
			container,
			localize('kendrytePackageJsonEditor.link_flags.title', 'Arguments for ld'),
			localize('kendrytePackageJsonEditor.link_flags.desc', 'one argument per line'),
			($section) => this.createTextAreaArray($section, 'link_flags', validateArgList, ''),
		);

		this.controls.ld_file = this.createSection(
			container,
			localize('kendrytePackageJsonEditor.ld_file.title', 'LD file path'),
			localize('kendrytePackageJsonEditor.ld_file.desc', 'Use another LD file'),
			($section) => this.createTextInput($section, 'ld_file', validateFile, ''),
		);

		this.controls.entry = this.createSection(
			container,
			localize('kendrytePackageJsonEditor.entry.title', 'Entry file'),
			localize('kendrytePackageJsonEditor.entry.desc', 'Commonly used in a demo project.'),
			($section) => this.createTextInput($section, 'entry', validateFile, 'eg. src/main.c'),
		);

		this.controls.definitions = this.createSection(
			container,
			localize('kendrytePackageJsonEditor.definitions.title', 'C/C++ Definitions'),
			localize('kendrytePackageJsonEditor.definitions.desc', 'User configurable definitions, will create #define in compile time.'),
			($section) => this.createTextAreaMap($section, 'definitions', validateDefinitions, 'SOME_VALUE1:str=hello world\nSOME_VALUE2:raw=123'),
		);

		this.controls.include = this.createSection(
			container,
			localize('kendrytePackageJsonEditor.include.title', 'Include root'),
			localize('kendrytePackageJsonEditor.include.desc', 'User can #include your header from these folders. But recommended use only one folder, and no other source inside it.'),
			($section) => this.createTextAreaArray($section, 'include', validateFolders, 'eg. include/'),
		);

		this.controls.prebuilt = this.createSection(
			container,
			localize('kendrytePackageJsonEditor.prebuilt.title', 'Prebuilt library file'),
			localize('kendrytePackageJsonEditor.prebuilt.desc', 'If your library is not open source, assign the pre compiled .a file here.'),
			($section) => this.createTextInput(
				$section,
				'prebuilt',
				[
					validateRequired,
					validateFile,
				],
				'eg. libXXX.a',
			),
		);

		this.controls.exampleSource = this.createSection(
			container,
			localize('kendrytePackageJsonEditor.exampleSource.title', 'Examples'),
			localize('kendrytePackageJsonEditor.exampleSource.desc', 'You can add example in your library.'),
			($section) => this.createTextAreaArray($section, 'exampleSource', validateSources, 'eg. test/*.c'),
		);

		this.controls.properties = this.createSection(
			container,
			localize('kendrytePackageJsonEditor.properties.title', 'CMake properties'),
			localize('kendrytePackageJsonEditor.properties.desc', 'Please check CMake manual to get more information'),
			($section) => this.createTextAreaMap($section, 'properties', validateKeyValue, 'PROPERTY_NAME1=some value\nPROPERTY_NAME2=some other value'),
		);

		this.controls.extraList = this.createSection(
			container,
			localize('kendrytePackageJsonEditor.extraList.title', 'Prepend raw cmake lists'),
			localize('kendrytePackageJsonEditor.extraList.desc', 'This file\'s content will add into generated cmakelist, note that you cannot use compile target, because it did not created.'),
			($section) => this.createTextInput($section, 'extraList', validateFile, localize('kendrytePackageJsonEditor.extraList.placeholder', 'Do not use this in most project.')),
		);

		this.json = append(container, $('code.json'));

		this.scroll.scanDomNode();
	}

	private createTypeSelect(parent: HTMLElement): IUISectionWidget<CMakeProjectTypes> {
		const displayNames = Object.values(typeSelections);
		const values = Object.keys(typeSelections) as CMakeProjectTypes[];

		let setting = false;
		let value = values[0];
		const input = this._register(new SelectBox(displayNames, 0, this.contextViewService));
		this._register(attachSelectBoxStyler(input, this.themeService));
		this._register(input.onDidSelect((sel: ISelectData) => {
			if (setting) {
				return;
			}
			value = values[sel.index];
			this.onTypeChange(values[sel.index]);

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
		validation: (IInputValidator | IInputValidator[]),
		placeholder: string,
		textarea: boolean,
	): InputBox {
		const input = this._register(new InputBox(parent, this.contextViewService, {
			placeholder,
			validationOptions: {
				validation: combineValidation(validation),
			},
			flexibleHeight: textarea,
		}));
		input.width = 320;
		this._register(attachInputBoxStyler(input, this.themeService));
		this._register(input.onDidHeightChange(() => {
			this.scroll.scanDomNode();
		}));
		return input;
	}

	private createTextInput(
		parent: HTMLElement,
		property: ICompileInfoPossibleKeys,
		validation: (IInputValidator | IInputValidator[]),
		placeholder: string,
	): IUISectionWidget<string> {
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

	private createTextAreaMap(
		parent: HTMLElement,
		property: ICompileInfoPossibleKeys,
		validation: (IInputValidator | IInputValidator[]),
		placeholder: string,
	): IUISectionWidget<object> {
		const input = this._createTextBox(parent, validation, placeholder, true);
		let setting = false;
		const ret = {
			get() {
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
			set(v) {
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

	private createTextAreaArray(
		parent: HTMLElement,
		property: ICompileInfoPossibleKeys,
		validation: (IInputValidator | IInputValidator[]),
		placeholder: string,
	): IUISectionWidget<string[]> {
		const input = this._createTextBox(parent, validation, placeholder, true);
		let setting = false;
		const ret = {
			get() {return input.value.split('\n').filter(e => e.length > 0);},
			set(v) {
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

	private createSection<T>(parent: HTMLElement, title: string, desc: string, input: ($section: HTMLDivElement) => IUISectionWidget<T>): IUISection<T> {
		const container: HTMLDivElement = append(parent, $('div.section'));

		const left: HTMLDivElement = append(container, $('div.left'));
		const h: HTMLHeadingElement = append(left, $('h3.title'));
		h.innerText = title;
		const d: HTMLDivElement = append(left, $('div.desc'));
		d.innerText = desc;

		const section = append(container, $('div.right')) as HTMLDivElement;
		const widget = input(section);
		return {
			widget,
			section: container,
		};
	}

	private updateSimple(property: ICompileInfoPossibleKeys, value: any): void {
		this._model.write(property, value).catch((e) => {
			this.notificationService.error(e);
		}).then(() => {
			this.json.innerText = JSON.stringify(this._model.data, null, 4);
		});
	}
}

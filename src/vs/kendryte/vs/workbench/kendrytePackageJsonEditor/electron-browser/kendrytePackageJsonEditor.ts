import 'vs/css!vs/kendryte/vs/workbench/kendrytePackageJsonEditor/browser/media/kendrytePackageJsonEditor';
import { BaseEditor } from 'vs/workbench/browser/parts/editor/baseEditor';
import { KENDRYTE_PACKAGE_JSON_EDITOR_ID } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/common/ids';
import { $, append } from 'vs/base/browser/dom';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { EditorOptions } from 'vs/workbench/common/editor';
import { CancellationToken } from 'vs/base/common/cancellation';
import { KendrytePackageJsonEditorInput } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/electron-browser/kendrytePackageJsonEditorInput';
import { KendrytePackageJsonEditorModel } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/node/kendrytePackageJsonEditorModel';
import { CMAKE_CONFIG_FILE_NAME, CMakeProjectTypes, ICompileInfoPossibleKeys } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { localize } from 'vs/nls';
import { DomScrollableElement } from 'vs/base/browser/ui/scrollbar/scrollableElement';
import { ScrollbarVisibility } from 'vs/base/common/scrollable';
import { resolvePath } from 'vs/kendryte/vs/base/common/resolvePath';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IUISection, IUISectionWidget } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/common/type';
import { SectionFactory } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/electron-browser/sectionFactory';
import { SourceFileListFieldControl } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/electron-browser/fields/sourceFileList';
import { AbstractFieldControl } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/electron-browser/fields/base';
import { PackageJsonValidate } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/node/validators.class';
import { SingleFileFieldControl } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/electron-browser/fields/singleFile';
import { FolderListFieldControl } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/electron-browser/fields/folderList';
import { SingleFolderFieldControl } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/electron-browser/fields/singleFolder';

interface IControlList {
	name: IUISection<string>;
	version: IUISection<string>;
	homepage: IUISection<string>;
	type: IUISection<CMakeProjectTypes>;
	properties: IUISection<string[] | string>;
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
	definitions: IUISection<string[] | string>;

	// library
	include: IUISection<string[]>;
	exampleSource: IUISection<string[]>;

	// executable
}

export class KendrytePackageJsonEditor extends BaseEditor {
	public static readonly ID: string = KENDRYTE_PACKAGE_JSON_EDITOR_ID;
	protected _input: KendrytePackageJsonEditorInput;
	protected _model: KendrytePackageJsonEditorModel;
	private h1: HTMLHeadingElement;
	private controls: IControlList = {} as any;
	private scroll: DomScrollableElement;
	private readonly sectionCreator: SectionFactory;
	private json: HTMLDivElement;
	private editorInited: boolean = false;

	constructor(
		@ITelemetryService telemetryService: ITelemetryService,
		@IThemeService themeService: IThemeService,
		@IStorageService storageService: IStorageService,
		@IContextViewService contextViewService: IContextViewService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@INotificationService private readonly notificationService: INotificationService,
	) {
		super(KendrytePackageJsonEditor.ID, telemetryService, themeService, storageService);

		this.sectionCreator = this._register(instantiationService.createInstance(SectionFactory));
		this._register(this.sectionCreator.onDidHeightChange(() => {
			this.layout();
		}));
		this._register(this.sectionCreator.onUpdate(({ property, value }) => {
			this.updateSimple(property, value);
		}));
		this._register(this.sectionCreator.onTypeChange((type) => {
			this.onTypeChange(type);
		}));
	}

	async setInput(input: KendrytePackageJsonEditorInput, options: EditorOptions, token: CancellationToken): Promise<void> {
		super.setInput(input, options, token);
		this._model = await input.resolve();
		this.sectionCreator.setRootPath(resolvePath(this._model.resource.fsPath, '..'));

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
				// console.log('display: ', sections, show);
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
		delete this._input;
		this._options = null;
		delete this._model;
	}

	get data() {
		return this._model.data;
	}

	public layout(): void {
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

		parent.classList.add('kendryte-package-json-editor');
		this.h1 = append(container, $('h1'));
		(append(container, $('div.muted')) as HTMLSpanElement).innerText = localize('kendrytePackageJsonEditorAutoSave', 'Your settings will saved automatically');
		append(container, $('hr'));

		this.createSection(
			'type',
			container,
			localize('kendrytePackageJsonEditor.type.title', 'Project type'),
			localize('kendrytePackageJsonEditor.type.desc', 'Type of your project. Warning: change this will clear others settings.'),
			($section) => this.sectionCreator.createTypeSelect($section),
		);

		this.createSection(
			'name',
			container,
			localize('kendrytePackageJsonEditor.name.title', 'Project name'),
			localize('kendrytePackageJsonEditor.name.desc', 'Title of your project. Only a-z, 0-9, -, _ are allowed.'),
			($section, property) => this.sectionCreator.createTextInput($section, property,
				[PackageJsonValidate.Required, PackageJsonValidate.ProjectName],
				localize('required', 'Required.'),
			),
		);

		this.createSection(
			'version',
			container,
			localize('kendrytePackageJsonEditor.version.title', 'Current version'),
			localize('kendrytePackageJsonEditor.version.desc', 'Apply when publish.'),
			($section, property) => this.sectionCreator.createTextInput($section, property,
				[PackageJsonValidate.Required, PackageJsonValidate.VersionString],
				localize('required', 'Required'),
			),
		);

		this.createSection(
			'homepage',
			container,
			localize('kendrytePackageJsonEditor.homepage.title', 'Homepage'),
			localize('kendrytePackageJsonEditor.homepage.desc', 'A link to your project home (eg. github page).'),
			($section, property) => this.sectionCreator.createTextInput($section, property,
				PackageJsonValidate.Url, 'http://xxxx',
			),
		);

		this.createSection(
			'header',
			container,
			localize('kendrytePackageJsonEditor.header.title', 'Headers directory'),
			localize('kendrytePackageJsonEditor.header.desc', 'You can use #include from these folders in your code. One folder per line. Relative to this {0} file', CMAKE_CONFIG_FILE_NAME),
			($section, property) => this.sectionCreator.createTextAreaArray($section, property,
				PackageJsonValidate.Folders, 'relative/path/to/include/root',
			),
			FolderListFieldControl,
		);

		this.createSection(
			'source',
			container,
			localize('kendrytePackageJsonEditor.source.title', 'Source files'),
			localize('kendrytePackageJsonEditor.source.desc', 'Source files to compile. One file/folder per line.'),
			($section, property) => this.sectionCreator.createTextAreaArray($section, property,
				[PackageJsonValidate.Required, PackageJsonValidate.Sources],
				localize('kendrytePackageJsonEditor.source.placeholder', 'path/to/code.c - directly add a file.\npath/*.c - match all .c file in this folder.\npath/**.c - also recursive subfolders.'),
			),
			SourceFileListFieldControl,
		);

		this.createSection(
			'c_flags',
			container,
			localize('kendrytePackageJsonEditor.c_flags.title', 'Arguments for gcc'),
			localize('kendrytePackageJsonEditor.c_flags.desc', 'one argument per line'),
			($section, property) => this.sectionCreator.createTextAreaArray($section, property,
				PackageJsonValidate.ArgList, '',
			),
		);

		this.createSection(
			'cpp_flags',
			container,
			localize('kendrytePackageJsonEditor.cpp_flags.title', 'Arguments for g++'),
			localize('kendrytePackageJsonEditor.cpp_flags.desc', 'one argument per line'),
			($section, property) => this.sectionCreator.createTextAreaArray($section, property,
				PackageJsonValidate.ArgList, '',
			),
		);

		this.createSection(
			'c_cpp_flags',
			container,
			localize('kendrytePackageJsonEditor.c_cpp_flags.title', 'Arguments for both gcc and g++'),
			localize('kendrytePackageJsonEditor.c_cpp_flags.desc', 'one argument per line'),
			($section, property) => this.sectionCreator.createTextAreaArray($section, property,
				PackageJsonValidate.ArgList, 'eg. -Os',
			),
		);

		this.createSection(
			'link_flags',
			container,
			localize('kendrytePackageJsonEditor.link_flags.title', 'Arguments for ld'),
			localize('kendrytePackageJsonEditor.link_flags.desc', 'one argument per line'),
			($section, property) => this.sectionCreator.createTextAreaArray($section, property,
				PackageJsonValidate.ArgList, '',
			),
		);

		this.createSection(
			'ld_file',
			container,
			localize('kendrytePackageJsonEditor.ld_file.title', 'LD file path'),
			localize('kendrytePackageJsonEditor.ld_file.desc', 'Use another LD file'),
			($section, property) => this.sectionCreator.createTextInput($section, property,
				PackageJsonValidate.File, '',
			),
			SingleFileFieldControl,
		);

		this.createSection(
			'entry',
			container,
			localize('kendrytePackageJsonEditor.entry.title', 'Entry file'),
			localize('kendrytePackageJsonEditor.entry.desc', 'Commonly used in a demo project.'),
			($section, property) => this.sectionCreator.createTextInput($section, property,
				PackageJsonValidate.File, 'eg. src/main.c',
			),
			SingleFileFieldControl,
		);

		this.createSection(
			'definitions',
			container,
			localize('kendrytePackageJsonEditor.definitions.title', 'C/C++ Definitions'),
			localize('kendrytePackageJsonEditor.definitions.desc', 'User configurable definitions, will create #define in compile time.'),
			($section, property) => this.sectionCreator.createTextAreaMap($section, property,
				PackageJsonValidate.Definitions, 'SOME_VALUE1:str=hello world\nSOME_VALUE2:raw=123',
			),
		);

		this.createSection(
			'include',
			container,
			localize('kendrytePackageJsonEditor.include.title', 'Include root'),
			localize('kendrytePackageJsonEditor.include.desc', 'User can #include your header from these folders. But recommended use only one folder, and no other source inside it.'),
			($section, property) => this.sectionCreator.createTextAreaArray($section, property,
				PackageJsonValidate.Folders, 'eg. include/',
			),
			FolderListFieldControl,
		);

		this.createSection(
			'prebuilt',
			container,
			localize('kendrytePackageJsonEditor.prebuilt.title', 'Prebuilt library file'),
			localize('kendrytePackageJsonEditor.prebuilt.desc', 'If your library is not open source, assign the pre compiled .a file here.'),
			($section, property) => this.sectionCreator.createTextInput($section, property,
				[PackageJsonValidate.Required, PackageJsonValidate.File],
				'eg. libXXX.a',
			),
			SingleFileFieldControl,
		);

		this.createSection(
			'exampleSource',
			container,
			localize('kendrytePackageJsonEditor.exampleSource.title', 'Examples'),
			localize('kendrytePackageJsonEditor.exampleSource.desc', 'You can add example in your library (example is a folder contains kendryte-package.json, and it\'s project type is executable).'),
			($section, property) => this.sectionCreator.createTextAreaArray($section, property,
				PackageJsonValidate.Sources, 'eg. test/',
			),
			SingleFolderFieldControl,
		);

		this.createSection(
			'properties',
			container,
			localize('kendrytePackageJsonEditor.properties.title', 'CMake properties'),
			localize('kendrytePackageJsonEditor.properties.desc', 'Please check CMake manual to get more information'),
			($section, property) => this.sectionCreator.createTextAreaMap($section, property,
				PackageJsonValidate.KeyValue, 'PROPERTY_NAME1=some value\nPROPERTY_NAME2=some other value',
			),
		);

		this.createSection(
			'extraList',
			container,
			localize('kendrytePackageJsonEditor.extraList.title', 'Prepend raw cmake lists'),
			localize('kendrytePackageJsonEditor.extraList.desc', 'This file\'s content will add into generated cmakelist, note that you cannot use compile target, because it did not created.'),
			($section, property) => this.sectionCreator.createTextInput($section, property,
				PackageJsonValidate.File, localize('kendrytePackageJsonEditor.extraList.placeholder', 'Do not use this in most project.'),
			),
			SingleFileFieldControl,
		);

		this.json = append(container, $('code.json'));

		this.scroll.scanDomNode();
	}

	private createSection<T>(
		property: ICompileInfoPossibleKeys,
		parent: HTMLElement,
		title: string,
		desc: string,
		input: ($section: HTMLDivElement, property: ICompileInfoPossibleKeys) => IUISectionWidget<T>,
		controllerClass?: new(control: IUISection<T>, ...services: { _serviceBrand: any; }[]) => AbstractFieldControl<T>,
	) {
		const container: HTMLDivElement = append(parent, $('div.section'));

		const left: HTMLDivElement = append(container, $('div.left'));
		const h: HTMLHeadingElement = append(left, $('h3.title'));
		h.innerText = title;
		const d: HTMLDivElement = append(left, $('div.desc'));
		d.innerText = desc;

		const section = append(container, $('div.right')) as HTMLDivElement;
		const widget = input(section, property);

		const bundle: IUISection<T> = {
			title,
			widget,
			sectionControl: append(section, $('div.control')),
			section: container,
		};

		if (controllerClass) {
			const controller = this._register(this.instantiationService.createInstance(controllerClass, bundle));
			this._register(controller.onUpdate((value) => {
				this.updateSimple(property, value);
			}));
		}

		this.controls[property] = bundle;
	}

	private updateSimple(property: ICompileInfoPossibleKeys, value: any): void {
		this._model.write(property, value).catch((e) => {
			this.notificationService.error(e);
		}).then(() => {
			this.json.innerText = JSON.stringify(this._model.data, null, 4);
		});
	}
}

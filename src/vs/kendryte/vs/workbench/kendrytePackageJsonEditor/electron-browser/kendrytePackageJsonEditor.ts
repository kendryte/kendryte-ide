import 'vs/css!vs/kendryte/vs/workbench/kendrytePackageJsonEditor/browser/media/kendrytePackageJsonEditor';
import { $, append } from 'vs/base/browser/dom';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { CMAKE_CONFIG_FILE_NAME, CMakeProjectTypes, ICompileInfo, ICompileInfoPossibleKeys } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { localize } from 'vs/nls';
import { DomScrollableElement } from 'vs/base/browser/ui/scrollbar/scrollableElement';
import { ScrollbarVisibility } from 'vs/base/common/scrollable';
import { resolvePath } from 'vs/kendryte/vs/base/common/resolvePath';
import { IUISection, IUISectionWidget } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/common/type';
import { SectionFactory } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/electron-browser/sectionFactory';
import { SourceFileListFieldControl } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/electron-browser/fields/sourceFileList';
import { PackageJsonValidate } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/node/validators.class';
import { SingleFileFieldControl } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/electron-browser/fields/singleFile';
import { FolderListFieldControl } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/electron-browser/fields/folderList';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { AbstractJsonEditor } from 'vs/kendryte/vs/workbench/jsonGUIEditor/editor/browser/abstractJsonEditor';
import { EditorId } from 'vs/kendryte/vs/workbench/jsonGUIEditor/editor/common/type';
import { ICustomJsonEditorService, IJsonEditorModel } from 'vs/kendryte/vs/workbench/jsonGUIEditor/service/common/type';
import { OpenManagerControl } from 'vs/kendryte/vs/workbench/kendrytePackageJsonEditor/electron-browser/fields/dependency';
import { ITextResourceConfigurationService } from 'vs/editor/common/services/resourceConfiguration';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IWindowService } from 'vs/platform/windows/common/windows';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IInputState } from 'vs/kendryte/vs/workbench/jsonGUIEditor/editor/browser/abstractJsonEditorInput';

interface IControlList extends Record<ICompileInfoPossibleKeys, IUISection<any>> {
	name: IUISection<string>;
	version: IUISection<string>;
	homepage: IUISection<string>;
	type: IUISection<CMakeProjectTypes>;
	properties: IUISection<string[] | string>;
	header: IUISection<string[]>;
	source: IUISection<string[]>;
	extraList: IUISection<string>;
	extraList2: IUISection<string>;
	c_flags: IUISection<string[]>;
	cpp_flags: IUISection<string[]>;
	c_cpp_flags: IUISection<string[]>;
	link_flags: IUISection<string[]>;
	ld_file: IUISection<string>;
	prebuilt: IUISection<string>;
	entry: IUISection<string>;
	definitions: IUISection<string[] | string>;
	dependency: IUISection<string[]>;
	localDependency: IUISection<string[]>;
	systemLibrary: IUISection<string[]>;
	include: IUISection<string[]>;
	linkArgumentPrefix: IUISection<string[]>;
	linkArgumentSuffix: IUISection<string[]>;
}

interface IEditorState extends IInputState {
	scrollTop: number;
}

export class KendrytePackageJsonEditor extends AbstractJsonEditor<ICompileInfo, IEditorState> {
	private h1: HTMLHeadingElement;
	private readonly controls: IControlList = {} as any;
	private scroll: DomScrollableElement;
	private readonly sectionCreator: SectionFactory;

	constructor(
		id: EditorId,
		@ITelemetryService telemetryService: ITelemetryService,
		@IInstantiationService instantiationService: IInstantiationService,
		@IStorageService storageService: IStorageService,
		@ITextResourceConfigurationService configurationService: ITextResourceConfigurationService,
		@IThemeService themeService: IThemeService,
		@ITextFileService textFileService: ITextFileService,
		@IEditorService editorService: IEditorService,
		@IEditorGroupsService editorGroupService: IEditorGroupsService,
		@IWindowService windowService: IWindowService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@INotificationService notificationService: INotificationService,
		@ICustomJsonEditorService customJsonEditorService: ICustomJsonEditorService,
	) {
		super(id, telemetryService, instantiationService, storageService, configurationService, themeService, textFileService, editorService, editorGroupService, windowService, contextKeyService, notificationService, customJsonEditorService);

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

	protected updateModel(model?: IJsonEditorModel<ICompileInfo>) {
		if (!model) {
			return;
		}

		this.sectionCreator.setRootPath(resolvePath(model.resource.fsPath, '..'));

		this.h1.innerText = this._input!.getTitle();

		this._registerInput(this._input!.model.onContentChange((itemIds) => {
			this.scroll.scanDomNode();
		}));

		if (model.data.type === CMakeProjectTypes.library) {
			if (model.data.prebuilt) {
				this.controls.type.widget.set(CMakeProjectTypes.prebuiltLibrary);
				this.onTypeChange(CMakeProjectTypes.prebuiltLibrary);
			} else {
				this.controls.type.widget.set(CMakeProjectTypes.library);
				this.onTypeChange(CMakeProjectTypes.library);
			}
		} else if (model.data.type === CMakeProjectTypes.define) {
			this.onTypeChange(CMakeProjectTypes.define);
		} else {
			this.controls.type.widget.set(CMakeProjectTypes.executable);
			this.onTypeChange(CMakeProjectTypes.executable);
		}

		for (const secName of Object.keys(this.controls)) {
			if (secName === 'type') {
				continue;
			}
			const set = this.controls[secName].widget.set as Function;
			set(model.data[secName]);
		}
	}

	private onTypeChange(value: CMakeProjectTypes): void {
		console.log('onTypeChange: ', value);
		const alwaysShow = ['type', 'name', 'version', 'homepage'];
		const display = (sections: (keyof IControlList)[]) => {
			for (const [secName, secControl] of Object.entries(this.controls)) {
				// console.log('display: ', sections, show);
				if (sections.includes(secName as ICompileInfoPossibleKeys) || alwaysShow.includes(secName)) {
					secControl.section.style.display = 'flex';
				} else {
					secControl.section.style.display = 'none';
					this.controls[secName].widget.set('');
					this.updateSimple(secName as ICompileInfoPossibleKeys, undefined);
				}
			}
		};
		switch (value) {
			case CMakeProjectTypes.library:
				display([
					'source',
					'c_flags',
					'cpp_flags',
					'c_cpp_flags',
					'link_flags',
					'ld_file',
					'definitions',
					'header',
					'include',
					'linkArgumentPrefix',
					'linkArgumentSuffix',
					'dependency',
					'extraList',
					'extraList2',
					'localDependency',
					'systemLibrary',
					'properties',
				]);
				break;
			case CMakeProjectTypes.define:
				display(['include', 'definitions', 'dependency']);
				break;
			case CMakeProjectTypes.prebuiltLibrary:
				display([
					'include',
					'prebuilt',
					'linkArgumentPrefix',
					'linkArgumentSuffix',
					'dependency',
					'extraList',
					'extraList2',
					'localDependency',
					'systemLibrary',
					'properties',
				]);
				break;
			case CMakeProjectTypes.executable:
				display([
					'source',
					'header',
					'c_flags',
					'cpp_flags',
					'c_cpp_flags',
					'link_flags',
					'ld_file',
					'entry',
					'definitions',
					'dependency',
					'extraList',
					'extraList2',
					'localDependency',
					'systemLibrary',
					'properties',
				]);
				break;
		}
	}

	_layout(): void {
		this.scroll.scanDomNode();
	}

	protected _createEditor(parent: HTMLElement): void {
		const container = $('div.wrap');
		this.scroll = this._register(new DomScrollableElement(container, {
			horizontal: ScrollbarVisibility.Hidden,
			vertical: ScrollbarVisibility.Visible,
		}));
		append(parent, this.scroll.getDomNode());

		parent.classList.add('kendryte-package-json-editor');
		this.h1 = append(container, $('h1'));
		append(container, $('hr'));

		this.createSection(
			'type',
			container,
			localize('kendrytePackageJsonEditor.type.title', 'Project type'),
			localize('kendrytePackageJsonEditor.type.desc', 'Type of your project. Warning: change this will clear others settings.'),
			(property, title, $section) => this.sectionCreator.createTypeSelect($section),
		);

		this.createSection(
			'name',
			container,
			localize('kendrytePackageJsonEditor.name.title', 'Project name'),
			localize('kendrytePackageJsonEditor.name.desc', 'Title of your project. Only a-z, 0-9, -, _ are allowed.'),
			(property, title, $section) => this.sectionCreator.createTextInput($section, property,
				[PackageJsonValidate.Required, PackageJsonValidate.ProjectName],
				localize('required', 'Required.'),
			),
		);

		this.createSection(
			'version',
			container,
			localize('kendrytePackageJsonEditor.version.title', 'Current version'),
			localize('kendrytePackageJsonEditor.version.desc', 'Apply when publish.'),
			(property, title, $section) => this.sectionCreator.createTextInput($section, property,
				[PackageJsonValidate.Required, PackageJsonValidate.VersionString],
				localize('required', 'Required'),
			),
		);

		this.createSection(
			'homepage',
			container,
			localize('kendrytePackageJsonEditor.homepage.title', 'Homepage'),
			localize('kendrytePackageJsonEditor.homepage.desc', 'A link to your project home (eg. github page).'),
			(property, title, $section) => this.sectionCreator.createTextInput($section, property,
				PackageJsonValidate.Url, 'eg. http://xxxx',
			),
		);

		this.createSection(
			'header',
			container,
			localize('kendrytePackageJsonEditor.header.title', 'Headers directory'),
			localize('kendrytePackageJsonEditor.header.desc', 'You can use #include from these folders in your code. One folder per line. Relative to this {0} file', CMAKE_CONFIG_FILE_NAME),
			(property, title, $section) => this.sectionCreator.createTextAreaArray($section, property,
				PackageJsonValidate.Folders, 'relative/path/to/include/root',
				FolderListFieldControl.descriptor(title),
			),
		);

		this.createSection(
			'include',
			container,
			localize('kendrytePackageJsonEditor.include.title', 'Include root'),
			localize('kendrytePackageJsonEditor.include.desc', 'User can #include your header from these folders. But recommended use only one folder, and no other source inside it.'),
			(property, title, $section) => this.sectionCreator.createTextAreaArray($section, property,
				PackageJsonValidate.Folders, 'eg. include/',
				FolderListFieldControl.descriptor(title),
			),
		);

		this.createSection(
			'source',
			container,
			localize('kendrytePackageJsonEditor.source.title', 'Source files'),
			localize('kendrytePackageJsonEditor.source.desc', 'Source files to compile. One file/folder per line.'),
			(property, title, $section) => this.sectionCreator.createTextAreaArray($section, property,
				[PackageJsonValidate.Required, PackageJsonValidate.Sources],
				localize('kendrytePackageJsonEditor.source.placeholder', 'path/to/code.c - directly add a file.\npath/*.c - match all .c file in this folder.\npath/**.c - also recursive subfolders.'),
				SourceFileListFieldControl.descriptor(title),
			),
		);

		this.createSection(
			'c_flags',
			container,
			localize('kendrytePackageJsonEditor.c_flags.title', 'Arguments for gcc'),
			localize('kendrytePackageJsonEditor.c_flags.desc', 'one argument per line'),
			(property, title, $section) => this.sectionCreator.createTextAreaArray($section, property,
				PackageJsonValidate.ArgList, '',
			),
		);

		this.createSection(
			'cpp_flags',
			container,
			localize('kendrytePackageJsonEditor.cpp_flags.title', 'Arguments for g++'),
			localize('kendrytePackageJsonEditor.cpp_flags.desc', 'one argument per line'),
			(property, title, $section) => this.sectionCreator.createTextAreaArray($section, property,
				PackageJsonValidate.ArgList, '',
			),
		);

		this.createSection(
			'c_cpp_flags',
			container,
			localize('kendrytePackageJsonEditor.c_cpp_flags.title', 'Arguments for both gcc and g++'),
			localize('kendrytePackageJsonEditor.c_cpp_flags.desc', 'one argument per line'),
			(property, title, $section) => this.sectionCreator.createTextAreaArray($section, property,
				PackageJsonValidate.ArgList, 'eg. -Os',
			),
		);

		this.createSection(
			'link_flags',
			container,
			localize('kendrytePackageJsonEditor.link_flags.title', 'Arguments for ld'),
			localize('kendrytePackageJsonEditor.link_flags.desc', 'one argument per line'),
			(property, title, $section) => this.sectionCreator.createTextAreaArray($section, property,
				PackageJsonValidate.ArgList, '',
			),
		);

		this.createSection(
			'ld_file',
			container,
			localize('kendrytePackageJsonEditor.ld_file.title', 'LD file path'),
			localize('kendrytePackageJsonEditor.ld_file.desc', 'Use another LD file'),
			(property, title, $section) => this.sectionCreator.createTextInput($section, property,
				PackageJsonValidate.File, '',
				SingleFileFieldControl.descriptor(title),
			),
		);

		this.createSection(
			'definitions',
			container,
			localize('kendrytePackageJsonEditor.definitions.title', 'C/C++ Definitions'),
			localize('kendrytePackageJsonEditor.definitions.desc', 'User configurable definitions, will create #define in compile time.'),
			(property, title, $section) => this.sectionCreator.createTextAreaMap($section, property,
				PackageJsonValidate.Definitions, 'eg. SOME_VALUE1:str=hello world\nSOME_VALUE2:raw=123',
			),
		);

		this.createSection(
			'prebuilt',
			container,
			localize('kendrytePackageJsonEditor.prebuilt.title', 'Prebuilt library file'),
			localize('kendrytePackageJsonEditor.prebuilt.desc', 'If your library is not open source, assign the pre compiled .a file here.'),
			(property, title, $section) => this.sectionCreator.createTextInput($section, property,
				[PackageJsonValidate.Required, PackageJsonValidate.File], 'eg. libXXX.a',
				SingleFileFieldControl.descriptor(title),
			),
		);

		this.createSection(
			'properties',
			container,
			localize('kendrytePackageJsonEditor.properties.title', 'CMake properties'),
			localize('kendrytePackageJsonEditor.properties.desc', 'Please check CMake manual to get more information'),
			(property, title, $section) => this.sectionCreator.createTextAreaMap($section, property,
				PackageJsonValidate.KeyValue, 'eg. PROPERTY_NAME1=some value\nPROPERTY_NAME2=some other value',
			),
		);

		this.createSection(
			'extraList',
			container,
			localize('kendrytePackageJsonEditor.extraList.title', 'Prepend raw cmake lists'),
			localize('kendrytePackageJsonEditor.extraList.desc', 'This file\'s content will add into generated cmakelist, you cannot use compile target here, because it did not created.'),
			(property, title, $section) => this.sectionCreator.createTextInput($section, property,
				PackageJsonValidate.File, localize('kendrytePackageJsonEditor.notuse-normal.placeholder', 'Do not use this in most project.'),
				SingleFileFieldControl.descriptor(title),
			),
		);
		this.createSection(
			'extraList2',
			container,
			localize('kendrytePackageJsonEditor.extraList.title', 'Prepend raw cmake lists'),
			localize('kendrytePackageJsonEditor.extraList.desc2', 'This file\'s content will add into generated cmakelist, you can use compile target with ${PROJECT_NAME} variable.'),
			(property, title, $section) => this.sectionCreator.createTextInput($section, property,
				PackageJsonValidate.File, localize('kendrytePackageJsonEditor.notuse-normal.placeholder', 'Do not use this in most project.'),
				SingleFileFieldControl.descriptor(title),
			),
		);

		this.createSection(
			'linkArgumentPrefix',
			container,
			localize('kendrytePackageJsonEditor.linkArgumentPrefix.title', 'Link Prefix'),
			localize('kendrytePackageJsonEditor.linkArgumentPrefix.desc', 'One argument per line'),
			(property, title, $section) => this.sectionCreator.createTextAreaArray($section, property,
				PackageJsonValidate.ArgList, localize('kendrytePackageJsonEditor.notuse-normal.placeholder', 'Do not use this in most project.'),
			),
		);
		this.createSection(
			'linkArgumentSuffix',
			container,
			localize('kendrytePackageJsonEditor.linkArgumentSuffix.title', 'Link Suffix'),
			localize('kendrytePackageJsonEditor.linkArgumentSuffix.desc', 'One argument per line'),
			(property, title, $section) => this.sectionCreator.createTextAreaArray($section, property,
				PackageJsonValidate.ArgList, localize('kendrytePackageJsonEditor.notuse-normal.placeholder', 'Do not use this in most project.'),
			),
		);

		this.createSection(
			'dependency',
			container,
			localize('kendrytePackageJsonEditor.dependency.title', 'Project dependencies'),
			localize('kendrytePackageJsonEditor.dependency.desc', 'One package per line'),
			(property, title, $section) => this.sectionCreator.createTextAreaMap($section, property,
				PackageJsonValidate.Dependency, 'eg. kendryte_sdk=1.2.3',
				OpenManagerControl.descriptor(title),
			),
		);

		this.createSection(
			'localDependency',
			container,
			localize('kendrytePackageJsonEditor.localDependency.title', 'Local dependencies'),
			localize('kendrytePackageJsonEditor.localDependency.desc', 'One folder per line'),
			(property, title, $section) => this.sectionCreator.createTextAreaArray($section, property,
				PackageJsonValidate.Folders, 'eg. sub/project/path',
				FolderListFieldControl.descriptor(title),
			),
		);

		this.createSection(
			'systemLibrary',
			container,
			localize('kendrytePackageJsonEditor.systemLibrary.title', 'System dependencies'),
			localize('kendrytePackageJsonEditor.systemLibrary.desc', 'One module per line'),
			(property, title, $section) => this.sectionCreator.createTextAreaArray($section, property,
				PackageJsonValidate.ArgList, 'eg. m\ngcc',
			),
		);

		this.scroll.scanDomNode();
	}

	private createSection<T>(
		property: ICompileInfoPossibleKeys,
		parent: HTMLElement,
		title: string,
		desc: string,
		input: (property: ICompileInfoPossibleKeys, title: string, $section: HTMLDivElement) => IUISectionWidget<T>,
	) {
		const container: HTMLDivElement = append(parent, $('div.section'));

		const left: HTMLDivElement = append(container, $('div.left'));
		const h: HTMLHeadingElement = append(left, $('h3.title'));
		h.innerText = title;
		const d: HTMLDivElement = append(left, $('div.desc'));
		d.innerText = desc;

		const section = append(container, $('div.right')) as HTMLDivElement;
		const widget = input(property, title, section);

		const bundle: IUISection<T> = {
			title,
			widget,
			section: container,
		};

		this.controls[property] = bundle as any;
	}

	private updateSimple(property: ICompileInfoPossibleKeys, value: any): void {
		const model = this.getModel();
		if (!model) {
			debugger;
			throw new Error('model is null');
		}
		model.update(property, value);
	}

	wakeup(state: Partial<IEditorState>) {
		if ('scrollTop' in state) {
			this.scroll.setScrollPosition({ scrollTop: state.scrollTop });
		}
	}

	sleep(): Partial<IEditorState> {
		return {
			scrollTop: this.scroll.getScrollPosition().scrollTop,
		};
	}
}

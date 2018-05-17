import { Dimension } from 'vs/base/browser/dom';
import { Emitter } from 'vs/base/common/event';
import { TPromise } from 'vs/base/common/winjs.base';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEditorOptions } from 'vs/platform/editor/common/editor';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { BaseEditor } from 'vs/workbench/browser/parts/editor/baseEditor';
import { MySplitView } from 'vs/workbench/parts/maix/browser/frame/mySplitView';
import { ConfigFileCategoryView } from 'vs/workbench/parts/maix/browser/categoryView/configFileCategoryView';
import { ConfigFileEditorView } from 'vs/workbench/parts/maix/browser/normal-config-editor/configFileEditorView';
import { MaixSettingsEditorInput } from 'vs/workbench/parts/maix/common/maixEditorInput';
import { MySettingsEditorModelWrapper } from 'vs/workbench/parts/maix/common/preferencesModels';

export class MaixSettingsEditor extends BaseEditor {
	public static readonly ID: string = 'workbench.editor.maixSettingsEditor';
	private $main: MySplitView;
	private defaultSettingsEditorModel: MySettingsEditorModelWrapper;

	private readonly onDidChangeModel: Emitter<MySettingsEditorModelWrapper> = this._register(new Emitter<MySettingsEditorModelWrapper>());
	private $editorView: ConfigFileEditorView;

	constructor(
		@ITelemetryService telemetryService: ITelemetryService,
		@IConfigurationService configurationService: IConfigurationService,
		@IThemeService themeService: IThemeService,
		@IInstantiationService private instantiationService: IInstantiationService,
	) {
		super(MaixSettingsEditor.ID, telemetryService, themeService);

		this._register(configurationService.onDidChangeConfiguration(() => this.$main.render()));
	}

	private onLeftClick(settingListOrView: string[] | ISpecialSetting) {
		if (Array.isArray(settingListOrView)) {
			this.onNormalCategoryClick(settingListOrView);
		} else {
			this.onSpecialCategoryClick(settingListOrView);
		}
	}

	private onNormalCategoryClick(settingList: string[]) {
		this.$main.switch(this.$editorView);
		if (this.defaultSettingsEditorModel) {
			this.defaultSettingsEditorModel.setCategoryFilter(settingList);
			this.onDidChangeModel.fire(this.defaultSettingsEditorModel);
		} else {
			console.warn('---: defaultSettingsEditorModel not ready');
		}
	}

	private onSpecialCategoryClick(View: ISpecialSetting) {
		this.$main.switch(this.instantiationService.createInstance(View as any));
	}

	protected createEditor(parent: HTMLElement): void {
		this.$main = this._register(
			this.instantiationService.createInstance(MySplitView, parent)
		);

		const $leftView = this.instantiationService.createInstance(ConfigFileCategoryView);
		this.$main.setLeft(this._register($leftView));
		this._register($leftView.onChangeCategory(this.onLeftClick.bind(this)));

		this.$editorView = this.instantiationService.createInstance(ConfigFileEditorView);
		this._register(this.$editorView);
		this._register(this.onDidChangeModel.event((model) => this.$editorView.updateModel(model)));
		this.onNormalCategoryClick([]);
	}

	public layout(dimension: Dimension): void {
		this.$main.layout(dimension.width);
	}

	async setInput(input: MaixSettingsEditorInput, options: IEditorOptions = {}): TPromise<void> {
		const oldInput = this.input;
		await super.setInput(input);

		if (!input.matches(oldInput)) {
			this.defaultSettingsEditorModel = await this.input.resolve() as MySettingsEditorModelWrapper;
			this.onDidChangeModel.fire(this.defaultSettingsEditorModel);
		}
	}
}
import { Dimension } from 'vs/base/browser/dom';
import { Emitter } from 'vs/base/common/event';
import { TPromise } from 'vs/base/common/winjs.base';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { BaseEditor } from 'vs/workbench/browser/parts/editor/baseEditor';
import { MySplitView } from 'vs/workbench/parts/maix/settings-page/browser/frame/mySplitView';
import { ConfigFileCategoryView } from 'vs/workbench/parts/maix/settings-page/browser/categoryView/configFileCategoryView';
import { ConfigFileEditorView } from 'vs/workbench/parts/maix/settings-page/browser/normal-config-editor/configFileEditorView';
import { MaixSettingsEditorInput } from 'vs/workbench/parts/maix/settings-page/common/maixEditorInput';
import { MySettingsEditorModelWrapper } from 'vs/workbench/parts/maix/settings-page/common/preferencesModels';
import { IProgressService2, ProgressLocation } from 'vs/platform/progress/common/progress';
import { ILogService } from 'vs/platform/log/common/log';
import { EditorOptions } from 'vs/workbench/common/editor';

export class MaixSettingsEditor extends BaseEditor {
	public static readonly ID: string = 'workbench.editor.maixSettingsEditor';
	private $main: MySplitView;
	private defaultSettingsEditorModel: MySettingsEditorModelWrapper;

	private readonly onDidChangeModel: Emitter<MySettingsEditorModelWrapper> = this._register(new Emitter<MySettingsEditorModelWrapper>());
	private $editorView: ConfigFileEditorView;
	private $categoryView: ConfigFileCategoryView;

	constructor(
		@ITelemetryService telemetryService: ITelemetryService,
		@IConfigurationService configurationService: IConfigurationService,
		@IThemeService themeService: IThemeService,
		@IInstantiationService private instantiationService: IInstantiationService,
		@IProgressService2 private progressService: IProgressService2,
		@ILogService private log: ILogService,
	) {
		super(MaixSettingsEditor.ID, telemetryService, themeService);

		this._register(configurationService.onDidChangeConfiguration(() => this.$main.render()));
	}

	private onLeftClick(settingListOrView: INormalSetting | ISpecialSetting) {
		if (settingListOrView.type === 0) {
			this.onNormalCategoryClick(settingListOrView);
		} else {
			this.onSpecialCategoryClick(settingListOrView);
		}
	}

	private onNormalCategoryClick(settingList: INormalSetting) {
		this.$main.switch(this.$editorView);
		if (this.defaultSettingsEditorModel) {
			const p = this.defaultSettingsEditorModel.setCategoryFilter(settingList.settings);
			if (p) {
				this.progressService.withProgress({
					location: ProgressLocation.Notification,
					title: 'Loading...',
				}, () => {
					return p.then(() => {
						this.onDidChangeModel.fire(this.defaultSettingsEditorModel);
					}).then(undefined, () => null);
				}).then(undefined, () => null);
			} else {
				this.onDidChangeModel.fire(this.defaultSettingsEditorModel);
			}
			this.defaultSettingsEditorModel.rememberCategory(settingList.categoryId);
		} else {
			this.log.warn('---: defaultSettingsEditorModel not ready');
		}
	}

	private onSpecialCategoryClick(View: ISpecialSetting) {
		this.$main.switch(this.instantiationService.createInstance(View as any));
	}

	protected createEditor(parent: HTMLElement): void {
		this.$main = this._register(
			this.instantiationService.createInstance(MySplitView, parent)
		);

		this.$categoryView = this.instantiationService.createInstance(ConfigFileCategoryView);
		this.$main.setLeft(this._register(this.$categoryView));
		this._register(this.onDidChangeModel.event((model) => {
			return this.$categoryView.updateModel(model);
		}));
		this._register(this.$categoryView.onChangeCategory(this.onLeftClick.bind(this)));

		this.$editorView = this.instantiationService.createInstance(ConfigFileEditorView);
		this._register(this.$editorView);
		this._register(this.onDidChangeModel.event((model) => {
			return this.$editorView.updateModel(model);
		}));
		this.onNormalCategoryClick({ settings: [], categoryId: undefined, type: 0 });
	}

	public layout(dimension: Dimension): void {
		this.$main.layout(dimension.width);
	}

	async setInput(input: MaixSettingsEditorInput, options?: EditorOptions): TPromise<void> {
		const oldInput = this.input;
		await super.setInput(input, options);

		if (!input.matches(oldInput)) {
			this.defaultSettingsEditorModel = await this.input.resolve() as MySettingsEditorModelWrapper;
			this.onDidChangeModel.fire(this.defaultSettingsEditorModel);
		}
	}
}
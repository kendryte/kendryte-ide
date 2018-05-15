import { Dimension } from 'vs/base/browser/dom';
import { IView } from 'vs/base/browser/ui/splitview/splitview';
import { Emitter } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { TPromise } from 'vs/base/common/winjs.base';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IEditorOptions } from 'vs/platform/editor/common/editor';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { BaseEditor } from 'vs/workbench/browser/parts/editor/baseEditor';
import { CategoryView, ICanRender } from 'vs/workbench/parts/maix/browser/categoryView';
import { ConfigFileCategoryView } from 'vs/workbench/parts/maix/browser/configFileCategoryView';
import { ConfigFileEditorView } from 'vs/workbench/parts/maix/browser/configFileEditorView';
import { MaixSettingsEditorInput } from 'vs/workbench/parts/maix/common/maixEditorInput';
import { MySettingsEditorModelWrapper } from 'vs/workbench/parts/maix/common/preferencesModels';

export class MaixSettingsEditor extends BaseEditor {
	public static readonly ID: string = 'workbench.editor.maixSettingsEditor';
	private $main: CategoryView;
	private defaultSettingsEditorModel: MySettingsEditorModelWrapper;

	private readonly onDidChangeModel: Emitter<MySettingsEditorModelWrapper> = this._register(new Emitter<MySettingsEditorModelWrapper>());

	constructor(
		@ITelemetryService telemetryService: ITelemetryService,
		@IConfigurationService configurationService: IConfigurationService,
		@IThemeService themeService: IThemeService,
		@IInstantiationService private instantiationService: IInstantiationService,
	) {
		super(MaixSettingsEditor.ID, telemetryService, themeService);

		this._register(configurationService.onDidChangeConfiguration(() => this.$main.render()));
	}

	private addView<T extends IView & ICanRender & IDisposable>(view: T, size: number): T {
		this.$main.addView(this._register(view), size);
		return view;
	}

	protected createEditor(parent: HTMLElement): void {
		this.$main = this._register(
			this.instantiationService.createInstance(CategoryView, parent)
		);

		const $leftView = this.instantiationService.createInstance(ConfigFileCategoryView);
		this.addView($leftView, 300);
		this._register($leftView.onChangeCategory((settings) => {
			if (this.defaultSettingsEditorModel) {
				this.defaultSettingsEditorModel.setCategoryFilter(settings);
				this.onDidChangeModel.fire(this.defaultSettingsEditorModel);
			} else {
				console.warn('---: defaultSettingsEditorModel not ready');
			}
		}));

		const $rightView = this.instantiationService.createInstance(ConfigFileEditorView);
		this.addView($rightView, 800);
		this._register(this.onDidChangeModel.event((model) => $rightView.updateModel(model)));
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
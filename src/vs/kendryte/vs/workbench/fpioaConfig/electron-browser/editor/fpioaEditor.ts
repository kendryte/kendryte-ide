import 'vs/css!vs/kendryte/vs/workbench/fpioaConfig/electron-browser/editor/fpioaEditor';
import { addClass, Dimension } from 'vs/base/browser/dom';
import { FpioaEditorInput } from 'vs/kendryte/vs/workbench/fpioaConfig/electron-browser/fpioaEditorInput';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { FpioaModel } from 'vs/kendryte/vs/workbench/fpioaConfig/common/fpioaModel';
import { Orientation } from 'vs/base/browser/ui/sash/sash';
import { FpioaLeftPanel } from 'vs/kendryte/vs/workbench/fpioaConfig/electron-browser/editor/leftPanel';
import { FpioaRightPanel } from 'vs/kendryte/vs/workbench/fpioaConfig/electron-browser/editor/rightPanel';
import { SplitView } from 'vs/base/browser/ui/splitview/splitview';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IEditorGroup, IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { AbstractJsonEditor } from 'vs/kendryte/vs/workbench/jsonGUIEditor/editor/browser/abstractJsonEditor';
import { IFpioaInputState } from 'vs/kendryte/vs/workbench/fpioaConfig/common/types';
import { EditorId } from 'vs/kendryte/vs/workbench/jsonGUIEditor/editor/common/type';
import { ITextResourceConfigurationService } from 'vs/editor/common/services/resourceConfiguration';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { ICustomJsonEditorService, IJsonEditorModel } from 'vs/kendryte/vs/workbench/jsonGUIEditor/service/common/type';
import { IFPIOAMapData } from 'vs/kendryte/vs/base/common/jsonSchemas/deviceManagerSchema';

export class FpioaEditor extends AbstractJsonEditor<IFPIOAMapData, IFpioaInputState> {
	input: FpioaEditorInput;

	private splitViewMain: SplitView;
	private leftPan: FpioaLeftPanel;
	private rightPan: FpioaRightPanel;

	constructor(
		id: EditorId,
		@ITelemetryService telemetryService: ITelemetryService,
		@IStorageService storageService: IStorageService,
		@ITextResourceConfigurationService configurationService: ITextResourceConfigurationService,
		@IThemeService themeService: IThemeService,
		@ITextFileService textFileService: ITextFileService,
		@IEditorService editorService: IEditorService,
		@IEditorGroupsService editorGroupService: IEditorGroupsService,
		@IHostService hostService: IHostService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@INotificationService notificationService: INotificationService,
		@ICustomJsonEditorService customJsonEditorService: ICustomJsonEditorService,
		@IInstantiationService instantiationService: IInstantiationService,
		@INotificationService private readonly notifyService: INotificationService,
	) {
		super(id, telemetryService, instantiationService, storageService, configurationService, themeService, textFileService, editorService, editorGroupService, hostService, contextKeyService, notificationService, customJsonEditorService);
	}

	protected _createEditor(parent: HTMLElement): void {
		addClass(parent, 'fpioa-editor');

		const leftPan = this.leftPan = this._register(this.instantiationService.createInstance(FpioaLeftPanel));
		const rightPan = this.rightPan = this._register(this.instantiationService.createInstance(FpioaRightPanel));

		const splitViewMain = this.splitViewMain = this._register(new SplitView(parent, { orientation: Orientation.HORIZONTAL }));
		splitViewMain.addView(leftPan, 600);
		splitViewMain.addView(rightPan, 200);

		this._register(leftPan.onChipChange((newChip) => {
			if (newChip) {
				this.input.selectChip(newChip);
			} else {
				this.input.unSelectChip();
			}
		}));
		this._register(leftPan.onSetPinFunc((map) => {
			this.input.mapPinFunc(map).catch((e) => {
				this.notifyService.error(e);
			});
		}));
		this._register(rightPan.onSetPinFunc((map) => {
			this.input.mapPinFunc(map).catch((e) => {
				this.notifyService.error(e);
			});
		}));
	}

	protected async updateModel(model?: IJsonEditorModel<IFPIOAMapData>) {
		if (model) {
			this._registerInput(this.input.onDidChange((needRefresh) => this._syncModel(needRefresh)));
			this._syncModel(true);
		}
	}

	public _layout(dimension: Dimension): void {
		if (this.splitViewMain) {
			this.splitViewMain.layout(dimension.width);
			this.rightPan.element.style.height = dimension.height + 'px';
			this.leftPan.element.style.height = dimension.height + 'px';
		}
	}

	protected wakeup(state: Partial<IFpioaInputState>): void {
		return;
	}

	protected sleep(): Partial<IFpioaInputState> {
		return {};
	}

	private _syncModel(needRefresh: boolean) {
		const model: FpioaModel = this.input.model;
		this.applyChip(model.currentChip);
		if (model.isChipSelected) {
			console.log('fill GUI with function map:', model.currentFuncMap);
			this.leftPan.updateList(model.currentFuncMap, needRefresh);
			this.rightPan.fillTable(model.currentFuncMap);
		}
		this.layout();
	}

	private applyChip(chipName: string | undefined) {
		this.leftPan.setCurrentChip(chipName);
		this.rightPan.drawChip(chipName);
	}

	protected setEditorVisible(visible: boolean, group: IEditorGroup): void {
		super.setEditorVisible(visible, group);
	}
}

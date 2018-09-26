import 'vs/css!kendryte/vs/workbench/fpioaConfig/electron-browser/editor/fpioaEditor';
import { BaseEditor } from 'vs/workbench/browser/parts/editor/baseEditor';
import { addClass, Dimension } from 'vs/base/browser/dom';
import { FpioaEditorInput } from 'kendryte/vs/workbench/fpioaConfig/electron-browser/fpioaEditorInput';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { EditorOptions } from 'vs/workbench/common/editor';
import { TPromise } from 'vs/base/common/winjs.base';
import { FpioaModel } from 'kendryte/vs/workbench/fpioaConfig/electron-browser/fpioaModel';
import { Orientation } from 'vs/base/browser/ui/sash/sash';
import { FpioaLeftPanel } from 'kendryte/vs/workbench/fpioaConfig/electron-browser/editor/leftPanel';
import { FpioaRightPanel } from 'kendryte/vs/workbench/fpioaConfig/electron-browser/editor/rightPanel';
import { SplitView } from 'vs/base/browser/ui/splitview/splitview';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { SAVE_FILE_COMMAND_ID } from 'vs/workbench/parts/files/electron-browser/fileCommands';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IEditorGroup } from 'vs/workbench/services/group/common/editorGroupsService';

export class FpioaEditor extends BaseEditor {
	public static readonly ID: string = 'workbench.editor.fpioaEditor';
	input: FpioaEditorInput;

	private splitViewMain: SplitView;
	private leftPan: FpioaLeftPanel;
	private rightPan: FpioaRightPanel;

	private inputDispose: IDisposable[] = [];

	constructor(
		@ITelemetryService telemetryService: ITelemetryService,
		@IThemeService themeService: IThemeService,
		@INotificationService private notifyService: INotificationService,
		@IInstantiationService private instantiationService: IInstantiationService,
		@ICommandService commandService: ICommandService,
	) {
		super(FpioaEditor.ID, telemetryService, themeService);

		this._register(commandService.onWillExecuteCommand(({ commandId }) => this.saveCommandHandler(commandId)));
	}

	protected createEditor(parent: HTMLElement): void {
		addClass(parent, 'fpioa-editor');

		const leftPan = this.leftPan = this._register(this.instantiationService.createInstance(FpioaLeftPanel));
		const rightPan = this.rightPan = this._register(this.instantiationService.createInstance(FpioaRightPanel));

		const splitViewMain = this.splitViewMain = this._register(new SplitView(parent, { orientation: Orientation.HORIZONTAL }));
		splitViewMain.addView(leftPan, 300);
		splitViewMain.addView(rightPan, 300);

		this._register(leftPan.onChipChange((newChip) => this.input.selectChip(newChip)));
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

	public async setInput(input: FpioaEditorInput, options: EditorOptions, token: CancellationToken): TPromise<void> {
		if (this.inputDispose.length) {
			dispose(this.inputDispose);
			this.inputDispose.length = 0;
		}

		super.setInput(input, options, token);

		this.inputDispose.push(this.input.onDidChange(() => this.updateModel()));

		let model = await input.resolve();

		if (!model.isResolved()) {
			model = await model.load();
		}

		this.updateModel();
	}

	public layout(dimension: Dimension): void {
		this.splitViewMain.layout(dimension.width);
	}

	private updateModel() {
		const model: FpioaModel = this.input.model;
		this.applyChip(model.currentChip);
		if (model.isChipSelected) {
			console.log('fill GUI with function map:', model.currentFuncMap);
			this.leftPan.updateList(model.currentFuncMap);
			this.rightPan.fillTable(model.currentFuncMap);
		}
	}

	private applyChip(chipName: string) {
		this.leftPan.setCurrentChip(chipName);
		this.rightPan.drawChip(chipName);
	}

	protected setEditorVisible(visible: boolean, group: IEditorGroup): void {
		super.setEditorVisible(visible, group);
	}

	private saveCommandHandler(commandId: string) {
		if (commandId === SAVE_FILE_COMMAND_ID && this.isVisible()) {
			console.log('save when saveMe');
			this.input.save().then(undefined, err => this.notifyService.error(err));
		}
	}
}
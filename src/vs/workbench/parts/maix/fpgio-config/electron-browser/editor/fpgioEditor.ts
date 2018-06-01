import 'vs/css!./fpgioEditor';
import { BaseEditor } from 'vs/workbench/browser/parts/editor/baseEditor';
import { addClass, Dimension } from 'vs/base/browser/dom';
import { FpgioEditorInput } from 'vs/workbench/parts/maix/fpgio-config/electron-browser/fpgioEditorInput';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { EditorOptions } from 'vs/workbench/common/editor';
import { TPromise } from 'vs/base/common/winjs.base';
import { FpgioModel } from 'vs/workbench/parts/maix/fpgio-config/electron-browser/fpgioModel';
import { Orientation } from 'vs/base/browser/ui/sash/sash';
import { FpgioLeftPanel } from 'vs/workbench/parts/maix/fpgio-config/electron-browser/editor/leftPanel';
import { FpgioRightPanel } from 'vs/workbench/parts/maix/fpgio-config/electron-browser/editor/rightPanel';
import { SplitView } from 'vs/base/browser/ui/splitview/splitview';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { Position } from 'vs/platform/editor/common/editor';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { SAVE_FILE_COMMAND_ID } from 'vs/workbench/parts/files/electron-browser/fileCommands';

export interface PinFuncSetEvent {
	pin: string; // IPin
	func: string; // name of func
}

export class FpgioEditor extends BaseEditor {
	public static readonly ID: string = 'workbench.editor.fpgioEditor';
	input: FpgioEditorInput;

	private splitViewMain: SplitView;
	private leftPan: FpgioLeftPanel;
	private rightPan: FpgioRightPanel;

	private inputDispose: IDisposable[] = [];

	constructor(
		@ITelemetryService telemetryService: ITelemetryService,
		@IThemeService themeService: IThemeService,
		@INotificationService private notifyService: INotificationService,
		@IInstantiationService private instantiationService: IInstantiationService,
		@ICommandService commandService: ICommandService,
	) {
		super(FpgioEditor.ID, telemetryService, themeService);

		this._register(commandService.onWillExecuteCommand(({ commandId }) => this.saveCommandHandler(commandId)));
	}

	protected createEditor(parent: HTMLElement): void {
		addClass(parent, 'fpgio-editor');

		const leftPan = this.leftPan = this._register(this.instantiationService.createInstance(FpgioLeftPanel));
		const rightPan = this.rightPan = this._register(this.instantiationService.createInstance(FpgioRightPanel));

		const splitViewMain = this.splitViewMain = this._register(new SplitView(parent, { orientation: Orientation.HORIZONTAL }));
		splitViewMain.addView(leftPan, 300);
		splitViewMain.addView(rightPan, 300);

		this._register(leftPan.onChipChange((newChip) => {
			this.input.selectChip(newChip);
			this.applyChip(newChip);
		}));

		this._register(leftPan.onSetPinFunc((map) => {
			this.input.mapPinFunc(map.func, map.pin);
		}));
	}

	public async setInput(input: FpgioEditorInput, options?: EditorOptions): TPromise<void> {
		if (this.inputDispose.length) {
			dispose(this.inputDispose);
			this.inputDispose.length = 0;
		}

		super.setInput(input, options);

		this.inputDispose.push(this.input.onDidChangeDirty(() => this.updateModel()));

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
		const model: FpgioModel = this.input.model;
		this.applyChip(model.currentChip);
		if (model.isChipSelected) {
			this.leftPan.updateList(model.currentFuncMap);
			this.rightPan.fillTable(model.currentFuncMap);
		} else {
			this.leftPan.destroyList();
			this.rightPan.destroyTable();
		}
	}

	private applyChip(chipName: string) {
		this.rightPan.drawChip(chipName);
		this.leftPan.setCurrentChip(chipName);
	}

	protected setEditorVisible(visible: boolean, position: Position = null): void {
		super.setEditorVisible(visible, position);
	}

	private saveCommandHandler(commandId: string) {
		if (commandId === SAVE_FILE_COMMAND_ID && this.isVisible()) {
			console.log('save when saveMe');
			this.input.save().then(undefined, err => this.notifyService.error(err));
		}
	}
}
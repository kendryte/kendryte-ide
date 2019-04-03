import { ICommandAction } from 'vs/platform/actions/common/actions';
import { Action, IAction } from 'vs/base/common/actions';
import { localize } from 'vs/nls';
import { IFunc, IFuncPin } from 'vs/kendryte/vs/workbench/fpioaConfig/common/packagingTypes';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ContextSubMenu } from 'vs/base/browser/contextmenu';
import { getChipPackaging } from 'vs/kendryte/vs/workbench/fpioaConfig/common/packagingRegistry';
import { Separator } from 'vs/base/browser/ui/actionbar/actionbar';
import { ContextMenuData, ID_NO_FUNCTION, PinFuncSetEventEmitter } from 'vs/kendryte/vs/workbench/fpioaConfig/common/types';
import { assertNotNull } from 'vs/kendryte/vs/base/common/assertNotNull';

class SetPinFunctionAction extends Action implements ICommandAction {
	public static readonly ID = 'fpioaEditor.action.setPinFunc';
	public static readonly LABEL = localize('KendryteIOEditorSetPinFunc', 'assign function to selected io pin');

	private readonly _pinDescription: string;
	private readonly _pinId: string;
	private readonly _pinIdFull: string;

	constructor(pinFunc: IFuncPin | null) {
		const desc: string = pinFunc ? assertNotNull(pinFunc.description) : MENU_TITLE_UNSET_FUNC;
		super(SetPinFunctionAction.ID, desc);

		this._pinDescription = desc;
		if (pinFunc) {
			this._id = pinFunc.funcId;
			this._pinIdFull = pinFunc.funcIdFull;
		}
	}

	async run([data, callback]: [ContextMenuData, PinFuncSetEventEmitter]): Promise<any> {
		if (data.currentFunctionId !== this._pinId) {
			callback({
				pin: data.pinName,
				func: this._pinIdFull,
				triggerBy: 'pin',
			});
		}
	}

	get title() {
		return this._pinDescription;
	}
}

const MENU_TITLE_SET_FUNC = localize('KendryteIOEditorSetPinFuncShort', 'Assign Function');
const MENU_TITLE_UNSET_FUNC = localize('KendryteIOEditorUnsetPinFunc', 'No Function');

export class ContextSubMenuSelector extends ContextSubMenu {
	private actionList: Map<string | null, SetPinFunctionAction>;
	private lastActive: SetPinFunctionAction;

	constructor(
		chipName: string,
		@IInstantiationService instantiationService: IInstantiationService,
	) {
		super(MENU_TITLE_SET_FUNC, []);
		this.actionList = new Map;

		const noFunction = instantiationService.createInstance(SetPinFunctionAction, ID_NO_FUNCTION);
		noFunction.checked = true;
		this.lastActive = noFunction;
		this.actionList.set(null, noFunction);

		this.entries.push(
			noFunction,
			new Separator(),
		);

		const fnList = assertNotNull(getChipPackaging(chipName)).usableFunctions;
		for (const func of fnList) {
			const fnMenu = this.createFunctionEntry(instantiationService, func);
			this.entries.push(fnMenu);
		}
	}

	select(currentFunction: string | null) {
		const newActive = this.actionList.get(currentFunction || ID_NO_FUNCTION);
		if (newActive && this.lastActive !== newActive) {
			this.lastActive.checked = false;
			newActive.checked = true;
			this.lastActive = newActive;
		}
	}

	protected createFunctionEntry(instantiationService: IInstantiationService, func: IFunc) {
		const baseId = func.funcBaseId.toUpperCase() + '_';
		const entries = func.ios.map((io) => {
			return this.createFinalMenu(instantiationService, baseId, io);
		});
		return new ContextSubMenu(func.description || '*no desc*', entries);
	}

	protected createFinalMenu(instantiationService: IInstantiationService, baseId: string, pin: IFuncPin): IAction {
		const newAct = instantiationService.createInstance(SetPinFunctionAction, pin);
		const fullId = baseId + pin.funcId.toUpperCase();
		this.actionList.set(fullId, newAct);
		return newAct;
	}
}
import { ICommandAction } from 'vs/platform/actions/common/actions';
import { Action, IAction } from 'vs/base/common/actions';
import { TPromise } from 'vs/base/common/winjs.base';
import { localize } from 'vs/nls';
import { IFunc, IFuncPin } from 'vs/workbench/parts/maix/fpioa-config/common/packagingTypes';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ContextSubMenu } from 'vs/base/browser/contextmenu';
import { getChipPackaging } from 'vs/workbench/parts/maix/fpioa-config/common/packagingRegistry';
import { Separator } from 'vs/base/browser/ui/actionbar/actionbar';
import { ContextMenuData, ID_NO_FUNCTION, PinFuncSetEventEmitter } from 'vs/workbench/parts/maix/fpioa-config/common/types';

class SetPinFunctionAction extends Action implements ICommandAction {
	public static readonly ID = 'fpioaEditor.action.setPinFunc';
	public static readonly LABEL = localize('MaixIOEditorSetPinFunc', 'assign function to selected io pin');

	constructor(protected readonly pinFunc: IFuncPin | null) {
		super(SetPinFunctionAction.ID, pinFunc ? pinFunc.description : MENU_TITLE_UNSET_FUNC);
	}

	async run([data, callback]: [ContextMenuData, PinFuncSetEventEmitter]): TPromise<any> {
		if (data.currentFunctionId !== this.pinFunc.funcId) {
			callback({
				pin: data.pinName,
				func: this.pinFunc.funcIdFull,
				triggerBy: 'pin',
			});
		}
	}

	get title() {
		return this.pinFunc.description;
	}
}

const MENU_TITLE_SET_FUNC = localize('MaixIOEditorSetPinFuncShort', 'Assign Function');
const MENU_TITLE_UNSET_FUNC = localize('MaixIOEditorUnsetPinFunc', 'No Function');

export class ContextSubMenuSelector extends ContextSubMenu {
	private actionList: Map<string, SetPinFunctionAction>;
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

		const fnList = getChipPackaging(chipName).usableFunctions;
		for (const func of fnList) {
			const fnMenu = this.createFunctionEntry(instantiationService, func);
			this.entries.push(fnMenu);
		}
	}

	select(currentFunction: string) {
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
		return new ContextSubMenu(func.description, entries);
	}

	protected createFinalMenu(instantiationService: IInstantiationService, baseId: string, pin: IFuncPin): IAction {
		const newAct = instantiationService.createInstance(SetPinFunctionAction, pin);
		const fullId = baseId + pin.funcId.toUpperCase();
		this.actionList.set(fullId, newAct);
		return newAct;
	}
}
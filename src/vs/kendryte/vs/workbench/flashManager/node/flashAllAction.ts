import { Action } from 'vs/base/common/actions';
import { ACTION_ID_FLASH_MANGER_FLASH_ALL, ACTION_LABEL_FLASH_MANGER_FLASH_ALL } from 'vs/kendryte/vs/workbench/flashManager/common/type';

export class FlashAllAction extends Action {
	static readonly ID = ACTION_ID_FLASH_MANGER_FLASH_ALL;
	static readonly LABEL = ACTION_LABEL_FLASH_MANGER_FLASH_ALL;

	constructor(
		id = FlashAllAction.ID, label = FlashAllAction.LABEL,
	) {
		super(id, label);
	}

	async run() {
	}
}

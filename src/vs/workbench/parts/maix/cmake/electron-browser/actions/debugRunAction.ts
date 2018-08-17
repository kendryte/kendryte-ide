import { Action } from 'vs/base/common/actions';
import { TPromise } from 'vs/base/common/winjs.base';
import { localize } from 'vs/nls';
import { ACTION_ID_MAIX_CMAKE_RUN } from 'vs/workbench/parts/maix/cmake/common/type';

export class MaixCMakeDebugAction extends Action {
	public static readonly ID = ACTION_ID_MAIX_CMAKE_RUN;
	public static readonly LABEL = localize('Debug', 'Debug');

	constructor() {
		super(MaixCMakeDebugAction.ID, MaixCMakeDebugAction.LABEL);
	}

	async run(): TPromise<void> {

	}
}

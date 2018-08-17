import { Action } from 'vs/base/common/actions';
import { TPromise } from 'vs/base/common/winjs.base';
import { localize } from 'vs/nls';
import { ACTION_ID_MAIX_CMAKE_RUN, ICMakeService } from 'vs/workbench/parts/maix/cmake/common/type';
import { IOutputService } from 'vs/workbench/parts/output/common/output';
import { MaixCMakeCleanupAction } from 'vs/workbench/parts/maix/cmake/electron-browser/actions/cleanupAction';
import { IDebugService } from 'vs/workbench/parts/debug/common/debug';
import { IProgressService2 } from 'vs/workbench/services/progress/common/progress';
import { INotificationService } from 'vs/platform/notification/common/notification';

export class MaixCMakeDebugAction extends Action {
	public static readonly ID = ACTION_ID_MAIX_CMAKE_RUN;
	public static readonly LABEL = localize('Debug', 'Debug');

	constructor(
		id = MaixCMakeCleanupAction.ID, label = MaixCMakeCleanupAction.LABEL,
		@ICMakeService protected cmakeService: ICMakeService,
		@IOutputService protected outputService: IOutputService,
		@IDebugService protected debugService: IDebugService,
		@IProgressService2 protected progressService: IProgressService2,
		@INotificationService protected notificationService: INotificationService,
	) {
		super(MaixCMakeDebugAction.ID, MaixCMakeDebugAction.LABEL);
	}

	async run(): TPromise<void> {

	}
}

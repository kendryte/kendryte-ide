import { Action } from 'vs/base/common/actions';
import {
	ACTION_ID_MAIX_CMAKE_BUILD,
	ACTION_ID_MAIX_CMAKE_BUILD_RUN,
	ACTION_ID_MAIX_CMAKE_RUN,
	ACTION_LABEL_MAIX_CMAKE_BUILD_RUN,
	ACTION_LABEL_MAIX_CMAKE_RUN,
} from 'vs/kendryte/vs/base/common/menu/cmake';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { createActionInstance } from 'vs/kendryte/vs/workbench/actionRegistry/common/registerAction';

export class MaixCMakeRunAction extends Action {
	public static readonly ID = ACTION_ID_MAIX_CMAKE_RUN;
	public static readonly LABEL = ACTION_LABEL_MAIX_CMAKE_RUN;

	constructor(
		id = MaixCMakeRunAction.ID, label = MaixCMakeRunAction.LABEL,
		@INotificationService private readonly notificationService: INotificationService,
	) {
		super(id, label);
	}

	async run() {
		this.notificationService.info('Hello world');
	}
}

export class MaixCMakeBuildRunAction extends Action {
	public static readonly ID = ACTION_ID_MAIX_CMAKE_BUILD_RUN;
	public static readonly LABEL = ACTION_LABEL_MAIX_CMAKE_BUILD_RUN;

	constructor(
		id = MaixCMakeBuildRunAction.ID, label = MaixCMakeBuildRunAction.LABEL,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
	) {
		super(id, label);
	}

	async run() {
		await createActionInstance(this.instantiationService, ACTION_ID_MAIX_CMAKE_BUILD).run(false);
		await createActionInstance(this.instantiationService, ACTION_ID_MAIX_CMAKE_RUN).run();
	}
}

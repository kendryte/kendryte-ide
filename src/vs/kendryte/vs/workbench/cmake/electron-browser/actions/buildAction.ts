import { Action } from 'vs/base/common/actions';
import { TPromise } from 'vs/base/common/winjs.base';
import { ACTION_ID_MAIX_CMAKE_BUILD, ACTION_LABEL_MAIX_CMAKE_BUILD } from 'vs/kendryte/vs/base/common/menu/cmake';
import { CMAKE_CHANNEL, ICMakeService } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { IOutputChannel, IOutputService } from 'vs/workbench/parts/output/common/output';
import { INotificationService } from 'vs/platform/notification/common/notification';

export class MaixCMakeBuildAction extends Action {
	public static readonly ID = ACTION_ID_MAIX_CMAKE_BUILD;
	public static readonly LABEL = ACTION_LABEL_MAIX_CMAKE_BUILD;
	protected outputChannel: IOutputChannel;

	constructor(
		id = MaixCMakeBuildAction.ID, label = MaixCMakeBuildAction.LABEL,
		@ICMakeService protected cmakeService: ICMakeService,
		@IOutputService protected outputService: IOutputService,
		@INotificationService protected notificationService: INotificationService,
	) {
		super(id, label);
		this.outputChannel = outputService.getChannel(CMAKE_CHANNEL);
	}

	async run(): TPromise<void> {
		this.outputChannel.clear();
		this.outputService.showChannel(CMAKE_CHANNEL, true);
		this.outputChannel.append('Starting build...\n');

		await this.cmakeService.configure();

		this.outputChannel.append('\n===================\n\n');

		await this.cmakeService.build();

		this.notificationService.info('Build complete.');
		this.outputChannel.append('\nBuild complete.');
	}
}

import { Action } from 'vs/base/common/actions';
import { ACTION_ID_MAIX_CMAKE_BUILD, ACTION_LABEL_MAIX_CMAKE_BUILD } from 'vs/kendryte/vs/base/common/menu/cmake';
import { CMAKE_CHANNEL, ICMakeService } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { IOutputChannel, IOutputService } from 'vs/workbench/parts/output/common/output';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';

export class MaixCMakeBuildAction extends Action {
	public static readonly ID = ACTION_ID_MAIX_CMAKE_BUILD;
	public static readonly LABEL = ACTION_LABEL_MAIX_CMAKE_BUILD;
	protected outputChannel: IOutputChannel;

	constructor(
		id = MaixCMakeBuildAction.ID, label = MaixCMakeBuildAction.LABEL,
		@ICMakeService private readonly cmakeService: ICMakeService,
		@IOutputService private readonly outputService: IOutputService,
		@INotificationService private readonly notificationService: INotificationService,
		@ITextFileService private readonly textFileService: ITextFileService,
	) {
		super(id, label);
		this.outputChannel = outputService.getChannel(CMAKE_CHANNEL);
	}

	async run(completeShowMessage: boolean = true) {
		return this._run().then(() => {
			if (completeShowMessage !== false) {
				this.notificationService.info('Build complete.');
			}
		}, (e) => {
			this.outputChannel.append('\n[ERROR] Build failed.');
			this.outputService.showChannel(CMAKE_CHANNEL, true);
			throw e;
		});
	}

	async _run() {
		this.outputChannel.clear();
		this.outputChannel.append('Starting build...\n');

		await this.textFileService.saveAll();

		await this.cmakeService.configure();

		this.outputChannel.append('\n===================\n\n');

		await this.cmakeService.build();

		this.outputChannel.append('\nBuild complete.');
	}
}

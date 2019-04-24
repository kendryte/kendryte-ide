import { Action } from 'vs/base/common/actions';
import { ACTION_ID_MAIX_CMAKE_BUILD, ACTION_LABEL_MAIX_CMAKE_BUILD } from 'vs/kendryte/vs/base/common/menu/cmake';
import { CMAKE_CHANNEL, ICMakeService } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { IOutputChannel, IOutputService } from 'vs/workbench/contrib/output/common/output';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { assertNotNull } from 'vs/kendryte/vs/base/common/assertNotNull';
import { IPanelService } from 'vs/workbench/services/panel/common/panelService';
import Constants from 'vs/workbench/contrib/markers/browser/constants';

export class MaixCMakeBuildAction extends Action {
	public static readonly ID = ACTION_ID_MAIX_CMAKE_BUILD;
	public static readonly LABEL = ACTION_LABEL_MAIX_CMAKE_BUILD;
	protected outputChannel: IOutputChannel;

	constructor(
		id = MaixCMakeBuildAction.ID, label = MaixCMakeBuildAction.LABEL,
		@ICMakeService private readonly cmakeService: ICMakeService,
		@IOutputService outputService: IOutputService,
		@INotificationService private readonly notificationService: INotificationService,
		@ITextFileService private readonly textFileService: ITextFileService,
		@IPanelService private readonly panelService: IPanelService,
	) {
		super(id, label);
		this.outputChannel = assertNotNull(outputService.getChannel(CMAKE_CHANNEL));
	}

	async run(completeShowMessage?: boolean) {
		return this._run().then(() => {
			if (completeShowMessage !== false) {
				this.notificationService.info('Build complete.');
			}
		}, (e) => {
			// debugger;
			this.outputChannel.append('\n[ERROR] Build failed.\n');
			this.outputChannel.append(`${e.stack || e.message}\n`);
			this.outputChannel.append('[ERROR] Build failed.\n');
			// this.outputService.showChannel(CMAKE_CHANNEL, true);
			this.panelService.openPanel(Constants.MARKERS_PANEL_ID, true);
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

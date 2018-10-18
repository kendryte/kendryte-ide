import { Action } from 'vs/base/common/actions';
import { TPromise } from 'vs/base/common/winjs.base';
import { localize } from 'vs/nls';
import { IOutputChannel, IOutputService } from 'vs/workbench/parts/output/common/output';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ACTION_ID_MAIX_CMAKE_HELLO_WORLD } from 'vs/kendryte/vs/workbench/cmake/common/actionIds';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { CMAKE_CHANNEL, ICMakeService } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { copy, mkdirp } from 'vs/base/node/pfs';
import { ACTIVE_GROUP, IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { CMAKE_CONFIG_FILE_NAME } from 'vs/kendryte/vs/workbench/cmake/common/cmakeConfigSchema';

export class MaixCMakeHelloWorldAction extends Action {
	public static readonly ID = ACTION_ID_MAIX_CMAKE_HELLO_WORLD;
	public static readonly LABEL = localize('HelloWorld', 'Hello World');
	protected outputChannel: IOutputChannel;

	constructor(
		id = MaixCMakeHelloWorldAction.ID, label = MaixCMakeHelloWorldAction.LABEL,
		@ICMakeService protected cmakeService: ICMakeService,
		@IOutputService protected outputService: IOutputService,
		@IWorkspaceContextService protected workspaceContextService: IWorkspaceContextService,
		@INotificationService protected notificationService: INotificationService,
		@INodePathService protected nodePathService: INodePathService,
		@IEditorService protected editorService: IEditorService,
		@INodeFileSystemService protected nodeFileSystemService: INodeFileSystemService,
	) {
		super(id, label);
		this.outputChannel = outputService.getChannel(CMAKE_CHANNEL);
	}

	_run(): TPromise<void> {
		const p = this.run();
		p.then(undefined, (e) => {
			this.outputChannel.append(`${e.stack}\n`);
			this.outputService.showChannel(CMAKE_CHANNEL);
		});
		return p;
	}

	async run(): TPromise<void> {
		this.outputChannel.clear();

		await this.cmakeService.rescanCurrentFolder();
		if (this.cmakeService.isEnabled) {
			return;
		}

		await mkdirp(this.nodePathService.workspaceFilePath('.vscode'));

		const source = this.nodePathService.getPackagesPath('hello-world-project');
		const target = this.nodePathService.workspaceFilePath();
		this.outputChannel.append(`copy from: ${source} to ${target}\n`);
		await copy(source, target);

		// this is official package, just ignore any error
		const [packageData] = await this.nodeFileSystemService.readPackageFile();
		const resolver = this.workspaceContextService.getWorkspace().folders[0];

		const i1 = this.editorService.createInput({ resource: resolver.toResource(CMAKE_CONFIG_FILE_NAME) });
		await this.editorService.openEditor(i1, { pinned: true }, ACTIVE_GROUP);
		if (packageData.entry) {
			const i2 = this.editorService.createInput({ resource: resolver.toResource(packageData.entry) });
			await this.editorService.openEditor(i2, { pinned: true }, ACTIVE_GROUP);
		}

		await this.cmakeService.rescanCurrentFolder();

		this.outputChannel.append(`start cmake configure\n`);
		this.cmakeService.configure();
	}
}

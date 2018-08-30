import { Action } from 'vs/base/common/actions';
import { TPromise } from 'vs/base/common/winjs.base';
import { localize } from 'vs/nls';
import { IOutputChannel, IOutputService } from 'vs/workbench/parts/output/common/output';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ACTION_ID_MAIX_CMAKE_HELLO_WORLD, CMAKE_CHANNEL, ICMakeService } from 'vs/workbench/parts/maix/cmake/common/type';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { copy, mkdirp } from 'vs/base/node/pfs';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { INodePathService } from 'vs/workbench/parts/maix/_library/node/nodePathService';

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

		const mainCMakeFile = await this.cmakeService.onFolderChange(true);
		if (mainCMakeFile) {
			return;
		}

		await mkdirp(this.nodePathService.workspaceFilePath('.vscode'));

		const source = this.nodePathService.getPackagesPath('hello-world-project');
		const target = this.nodePathService.workspaceFilePath();
		this.outputChannel.append(`copy from: ${source} to ${target}\n`);
		await copy(source, target);

		const resolver = this.workspaceContextService.getWorkspace().folders[0];
		this.editorService.openEditor({
			resource: resolver.toResource('main.c'),
		});

		await this.cmakeService.onFolderChange(true);

		this.outputChannel.append(`start cmake configure\n`);
		this.cmakeService.configure();
	}
}

import { Action } from 'vs/base/common/actions';
import { TPromise } from 'vs/base/common/winjs.base';
import { localize } from 'vs/nls';
import { IOutputChannel, IOutputService } from 'vs/workbench/parts/output/common/output';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ACTION_ID_MAIX_CMAKE_HELLO_WORLD, CMAKE_CHANNEL, ICMakeService } from 'vs/workbench/parts/maix/cmake/common/type';
import { IWorkspaceContextService, IWorkspaceFolder } from 'vs/platform/workspace/common/workspace';
import { resolveFrom, startsWithFileSchema } from 'vs/workbench/parts/maix/_library/common/resource';
import { exists, mkdirp, readFile, writeFile } from 'vs/base/node/pfs';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';

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
		@IEditorService protected editorService: IEditorService,
	) {
		super(id, label);
		this.outputChannel = outputService.getChannel(CMAKE_CHANNEL);
	}

	async run(): TPromise<void> {
		this.outputChannel.clear();
		this.outputService.showChannel(CMAKE_CHANNEL);

		const resolver = this.workspaceContextService.getWorkspace().folders[0];

		await mkdirp(resolveFrom(resolver, '.vscode'));

		await this.createFile(resolver, 'CMakeLists.txt');
		await this.createFile(resolver, 'main.c');
		await this.createFile(resolver, '.gitignore');

		this.editorService.openEditor({
			resource: resolver.toResource('main.c'),
		});

		await this.cmakeService.onFolderChange(true);

		this.cmakeService.configure();
	}

	private async createFile(resolver: IWorkspaceFolder, fileName: string) {
		const file = resolveFrom(resolver, fileName);
		this.outputChannel.append(`writing to file: ${file}`);

		if (await exists(file)) {
			this.outputChannel.append(` - failed: \n\tRefuse to overwrite exists file.`);
			throw new Error('Failed to start project: file exists');
		}

		try {
			const baseUrl = require.toUrl('vs/workbench/parts/maix/cmake/electron-browser/helloWorld/' + fileName.replace(/^\./g, '')).replace(startsWithFileSchema, '');
			const content = await readFile(baseUrl, 'utf8');

			await writeFile(file, content, {
				encoding: {
					charset: 'utf8',
					addBOM: false,
				},
			});
			this.outputChannel.append(` - ok.\n`);
		} catch (e) {
			this.outputChannel.append(` - failed:\n\t${e.message}`);
			throw e;
		}
	}
}

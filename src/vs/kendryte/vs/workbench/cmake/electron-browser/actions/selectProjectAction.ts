import { Action } from 'vs/base/common/actions';
import { IOutputChannel } from 'vs/workbench/contrib/output/common/output';
import { ACTION_ID_MAIX_CMAKE_SELECT_PROJECT, ACTION_LABEL_MAIX_CMAKE_SELECT_PROJECT } from 'vs/kendryte/vs/base/common/menu/cmake';
import { ICMakeService } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { IQuickInputService, IQuickPickItem, QuickPickInput } from 'vs/platform/quickinput/common/quickInput';
import { localize } from 'vs/nls';
import { INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { CMakeProjectTypes } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { basename } from 'vs/base/common/path';

export class CMakeSelectProjectAction extends Action {
	public static readonly ID = ACTION_ID_MAIX_CMAKE_SELECT_PROJECT;
	public static readonly LABEL = ACTION_LABEL_MAIX_CMAKE_SELECT_PROJECT;
	protected outputChannel: IOutputChannel;

	constructor(
		id = CMakeSelectProjectAction.ID, label = CMakeSelectProjectAction.LABEL,
		@ICMakeService private readonly cmakeService: ICMakeService,
		@IQuickInputService private readonly quickInputService: IQuickInputService,
		@INodeFileSystemService private readonly nodeFileSystemService: INodeFileSystemService,
	) {
		super(id, label);
	}

	async run(): Promise<void> {
		const projects = await this.cmakeService.getProjectList();
		const current = await this.cmakeService.getSelectedProject(true);

		const selectionLibrary: QuickPickInput[] = [{ type: 'separator', label: localize('library', 'Library') }];
		const selectionExecutable: QuickPickInput[] = [{ type: 'separator', label: localize('executable', 'Executable') }];

		let active: IQuickPickItem | undefined;

		for (const path of projects.values()) {
			const pkg = await this.nodeFileSystemService.readProjectFileIn(path);
			if (!pkg) {
				continue;
			}

			const selection: IQuickPickItem = {
				label: pkg.json.name,
				description: localize('folder', 'Folder: {0}', basename(path)),
			};

			if (pkg.json.type === CMakeProjectTypes.executable) {
				selectionExecutable.push(selection);
			} else {
				selectionLibrary.push(selection);
			}

			if (current.project === pkg.json.name) {
				active = selection;
			}
		}

		const selections = [
			...(selectionExecutable.length > 1 ? selectionExecutable : []),
			...(selectionLibrary.length > 1 ? selectionLibrary : []),
		];

		const sel = await this.quickInputService.pick(selections, {
			placeHolder: localize('selectProject', 'Select main project'),
			matchOnLabel: true,
			matchOnDescription: true,
			canPickMany: false,
			activeItem: active,
		});

		if (!sel) {
			return;
		}

		await this.cmakeService.setProject(sel.label);
	}
}

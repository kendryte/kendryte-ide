import { Action } from 'vs/base/common/actions';
import {
	ACTION_ID_FLASH_MANGER_CREATE_ZIP,
	ACTION_ID_FLASH_MANGER_CREATE_ZIP_PROGRAM,
	ACTION_LABEL_FLASH_MANGER_CREATE_ZIP,
	ACTION_LABEL_FLASH_MANGER_CREATE_ZIP_PROGRAM,
} from 'vs/kendryte/vs/workbench/flashManager/common/type';
import { PROJECT_BUILD_FOLDER_NAME } from 'vs/kendryte/vs/base/common/constants/wellknownFiles';
import { basename } from 'vs/base/common/path';
import { ICMakeService } from 'vs/kendryte/vs/workbench/cmake/common/type';
import * as JSZip from 'jszip';
import { createReadStream } from 'fs';
import { INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { INotificationHandle, INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { localize } from 'vs/nls';
import { IFlashManagerService } from 'vs/kendryte/vs/workbench/flashManager/common/flashManagerService';
import { IKendryteWorkspaceService } from 'vs/kendryte/vs/services/workspace/common/type';
import { resolvePath } from 'vs/kendryte/vs/base/common/resolvePath';
import { IDisposable } from 'vs/base/common/lifecycle';

export class CreateZipAction extends Action {
	static readonly ID: string = ACTION_ID_FLASH_MANGER_CREATE_ZIP;
	static readonly LABEL: string = ACTION_LABEL_FLASH_MANGER_CREATE_ZIP;
	private model: IDisposable;

	constructor(
		id = CreateZipAction.ID, label = CreateZipAction.LABEL,
		@IFlashManagerService private readonly flashManagerService: IFlashManagerService,
		@IKendryteWorkspaceService private readonly kendryteWorkspaceService: IKendryteWorkspaceService,
		@INodeFileSystemService private readonly nodeFileSystemService: INodeFileSystemService,
		@INotificationService private readonly notificationService: INotificationService,
	) {
		super(id, label);
	}

	protected async createSections(path: string) {
		const model = this.model = await this.flashManagerService.getFlashManagerModel(path);

		const sections = await model.createSections();
		return sections.map(({ varName, startHex, filepath }) => {
			return {
				address: startHex,
				file: filepath,
				sha256Prefix: false,
			};
		});
	}

	run(path: string | any) {
		let rootPath = '';
		if (typeof path === 'string') {
			rootPath = path;
		} else {
			rootPath = this.kendryteWorkspaceService.requireCurrentWorkspaceFile();
		}
		const handle = this.notificationService.notify({
			severity: Severity.Info,
			message: '~',
		});
		handle.progress.infinite();
		return this._run(rootPath, handle).finally(() => {
			handle.progress.done();
		});
	}

	async _run(path: string, handle: INotificationHandle) {
		handle.updateMessage(localize('createZipFile', 'Creating zip file...'));

		const sections = await this.createSections(path);
		const zip = new JSZip();

		if (sections.length === 0) {
			handle.progress.done();
			handle.updateSeverity(Severity.Warning);
			handle.updateMessage(localize('noSection', 'No file to falsh...'));
			return;
		}

		const jsonFile = shimJson(JSON.stringify({
			version: '0.1.0',
			files: sections.map(({ file, ...extra }) => {
				return {
					bin: 'bin/' + basename(file),
					...extra,
				};
			}),
		}, null, 4));
		zip.file('flash-list.json', Buffer.from(jsonFile, 'utf8'));
		const binsDir = zip.folder('bin');

		for (const { file } of sections) {
			binsDir.file(basename(file), createReadStream(file));
		}

		const result = await zip.generateAsync({
			type: 'nodebuffer',
			platform: 'UNIX',
			compression: 'DEFLATE',
		});

		const target = resolvePath(path, '../..', PROJECT_BUILD_FOLDER_NAME, 'flash-package.kfpkg');
		await this.nodeFileSystemService.rawWriteFile(
			target,
			result,
		);

		handle.progress.done();
		handle.updateMessage(localize('successCreateFile', 'Successful create zip file: {0}.', target));
	}

	public dispose() {
		super.dispose();
		if (this.model) {
			this.model.dispose();
		}
	}
}

export class CreateZipWithProgramAction extends CreateZipAction {
	static readonly ID = ACTION_ID_FLASH_MANGER_CREATE_ZIP_PROGRAM;
	static readonly LABEL = ACTION_LABEL_FLASH_MANGER_CREATE_ZIP_PROGRAM;

	constructor(
		id = CreateZipWithProgramAction.ID, label = CreateZipWithProgramAction.LABEL,
		@IFlashManagerService flashManagerService: IFlashManagerService,
		@IKendryteWorkspaceService kendryteWorkspaceService: IKendryteWorkspaceService,
		@INodeFileSystemService nodeFileSystemService: INodeFileSystemService,
		@INotificationService notificationService: INotificationService,
		@ICMakeService private readonly cmakeService: ICMakeService,
	) {
		super(id, label, flashManagerService, kendryteWorkspaceService, nodeFileSystemService, notificationService);
	}

	protected async createSections(path: string) {
		const sections = await super.createSections(path);
		const binFile = await this.cmakeService.getOutputFile();
		sections.unshift({ address: '0', file: binFile, sha256Prefix: true });
		return sections;
	}

	async _run(path: string, handle: INotificationHandle) {
		handle.updateMessage(localize('building', 'Building program...'));
		await this.cmakeService.build();
		return super._run(path, handle);
	}
}

function shimJson(str: string) {
	return str.replace(/"address": "(.+)"/gm, (m0, address) => {
		return `"address": ${address}`;
	});
}

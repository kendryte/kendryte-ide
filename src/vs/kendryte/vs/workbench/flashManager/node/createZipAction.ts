import { Action } from 'vs/base/common/actions';
import {
	ACTION_ID_FLASH_MANGER_CREATE_ZIP,
	ACTION_ID_FLASH_MANGER_CREATE_ZIP_PROGRAM,
	ACTION_LABEL_FLASH_MANGER_CREATE_ZIP,
	ACTION_LABEL_FLASH_MANGER_CREATE_ZIP_PROGRAM,
} from 'vs/kendryte/vs/workbench/flashManager/common/type';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { PROJECT_BUILD_FOLDER_NAME } from 'vs/kendryte/vs/base/common/constants/wellknownFiles';
import { basename } from 'vs/base/common/path';
import { ICMakeService } from 'vs/kendryte/vs/workbench/cmake/common/type';
import * as JSZip from 'jszip';
import { createReadStream } from 'fs';
import { resolvePath } from 'vs/kendryte/vs/base/common/resolvePath';
import { INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { INotificationHandle, INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { localize } from 'vs/nls';
import { IFlashManagerService } from 'vs/kendryte/vs/workbench/flashManager/common/flashManagerService';

export class CreateZipAction extends Action {
	static readonly ID: string = ACTION_ID_FLASH_MANGER_CREATE_ZIP;
	static readonly LABEL: string = ACTION_LABEL_FLASH_MANGER_CREATE_ZIP;

	constructor(
		id = CreateZipAction.ID, label = CreateZipAction.LABEL,
		@IFlashManagerService private readonly flashManagerService: IFlashManagerService,
		@INodePathService private readonly nodePathService: INodePathService,
		@INodeFileSystemService private readonly nodeFileSystemService: INodeFileSystemService,
		@INotificationService private readonly notificationService: INotificationService,
	) {
		super(id, label);
	}

	protected async createSections() {
		const model = await this.flashManagerService.getFlashManagerModel();

		const sections = await model.createSections();
		return sections.map(({ varName, startHex, filename }) => {
			return {
				address: startHex,
				file: this.nodePathService.workspaceFilePath(filename),
				sha256Prefix: false,
			};
		});
	}

	run() {
		const handle = this.notificationService.notify({
			severity: Severity.Info,
			message: '~',
		});
		handle.progress.infinite();
		return this._run(handle).finally(() => {
			handle.progress.done();
		});
	}

	async _run(handle: INotificationHandle) {
		handle.updateMessage(localize('createZipFile', 'Creating zip file...'));
		const sections = await this.createSections();
		const zip = new JSZip();

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

		const target = PROJECT_BUILD_FOLDER_NAME + '/flash-package.kfpkg';
		await this.nodeFileSystemService.rawWriteFile(
			resolvePath(this.nodePathService.workspaceFilePath(target)),
			result,
		);

		handle.progress.done();
		handle.updateMessage(localize('successCreateFile', 'Successful create zip file: {0}.', target));
	}
}

export class CreateZipWithProgramAction extends CreateZipAction {
	static readonly ID = ACTION_ID_FLASH_MANGER_CREATE_ZIP_PROGRAM;
	static readonly LABEL = ACTION_LABEL_FLASH_MANGER_CREATE_ZIP_PROGRAM;

	constructor(
		id = CreateZipWithProgramAction.ID, label = CreateZipWithProgramAction.LABEL,
		@IFlashManagerService flashManagerService: IFlashManagerService,
		@INodePathService nodePathService: INodePathService,
		@INodeFileSystemService nodeFileSystemService: INodeFileSystemService,
		@INotificationService notificationService: INotificationService,
		@ICMakeService private readonly cmakeService: ICMakeService,
	) {
		super(id, label, flashManagerService, nodePathService, nodeFileSystemService, notificationService);
	}

	protected async createSections() {
		const sections = await super.createSections();
		const binFile = await this.cmakeService.getOutputFile();
		sections.unshift({ address: '0', file: binFile, sha256Prefix: true });
		return sections;
	}

	async _run(handle: INotificationHandle) {
		handle.updateMessage(localize('building', 'Building program...'));
		await this.cmakeService.build();
		return super._run(handle);
	}
}

function shimJson(str: string) {
	return str.replace(/"address": "(.+)"/gm, (m0, address) => {
		return `"address": ${address}`;
	});
}

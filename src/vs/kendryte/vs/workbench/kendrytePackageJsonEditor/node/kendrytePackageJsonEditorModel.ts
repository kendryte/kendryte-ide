import { INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { ICompileInfo } from 'vs/kendryte/vs/base/common/jsonSchemas/cmakeConfigSchema';
import { IChannelLogService } from 'vs/kendryte/vs/services/channelLogger/common/type';
import { CMAKE_CHANNEL, CMAKE_CHANNEL_TITLE } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { ILogService } from 'vs/platform/log/common/log';
import { JsonEditorModelBase } from 'vs/kendryte/vs/workbench/jsonGUIEditor/browser/editorInputModelImpl';
import { URI } from 'vs/base/common/uri';

export class KendrytePackageJsonEditorModel extends JsonEditorModelBase<ICompileInfo> {
	private logger: ILogService;

	constructor(
		public readonly resource: URI,
		@IChannelLogService channelLogService: IChannelLogService,
		@INodeFileSystemService nodeFileSystemService: INodeFileSystemService,
	) {
		super(resource, nodeFileSystemService);
		this.logger = channelLogService.createChannel(CMAKE_CHANNEL_TITLE, CMAKE_CHANNEL);
	}

	public write(key: string, value: any) {
		this.logger.info(`update json: ${key} to ${value} (type ${typeof value})`);
		this.logger.info(`    to file: ${this.resource.fsPath}`);
		if (value === '') {
			value = undefined;
		}

		const object = this.jsonData!.json;

		if (value === object[key]) {
			this.logger.info(`save ok. (not change)`);
			return Promise.resolve();
		}
		return this.nodeFileSystemService.editJsonFile(this.resource.fsPath, key, value).then(() => {
			if (value === undefined) {
				delete object[key];
			} else {
				object[key] = value;
			}
			this.logger.debug('save ok.');
		}, (e) => {
			this.logger.error('Failed to save!');
			this.logger.error(e.message);
			throw e;
		});
	}
}